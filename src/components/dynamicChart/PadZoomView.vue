<style lang="scss">
.pad-zoom-view {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  background-repeat: repeat;
}
.slot {
  position: absolute;
  background-color: rgba(0, 255, 0, 0.5);
}
</style>
<template>
  <div
    class="pad-zoom-view"
    ref="view"
    :style="{
      backgroundColor: 'red',
      backgroundImage: `url('${gridSvg}')`,
      backgroundPosition: `${slotTransform.position.x}px ${slotTransform.position.y}px`
    }"
  >
    <div
      class="slot"
      ref="slot"
      :style="{
        transform: `scale(${zoom})`,
        transformOrigin: `${slotOrigin.x}px ${slotOrigin.y}px`,
        left: `${slotTransform.position.x}px`,
        top: `${slotTransform.position.y}px`
      }"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import V from '@/utils/vector'
import T from '@/utils/transform'

@Component({
  name: 'PadZoomView'
})
// @vuese
// @group COMPONENTS
export default class PadZoomView extends Vue {
  // All props
  @Prop({
    default: () => new V(50, 50)
  })
  private gridSize!: V

  @Prop({
    default: () => 2
  })
  private gridStroke!: number

  @Prop({
    default: () => 2
  })
  private gridRound!: number

  @Prop({
    default: () => 'line'
  })
  private gridType!: 'line' | 'point' | 'none'

  @Prop({
    default: () => 0.2
  })
  private zoomSpeed!: number

  private view: HTMLElement | null = null
  private slot: HTMLElement | null = null
  private onDrag = false

  private viewTransform = new T()
  private slotTransform = new T()
  private slotOrigin = new V(0.5, 0.5)
  private zoom = 1

  private get gridSvg (): string {
    if (this.gridType === 'none') return ''
    const stroke = this.gridStroke * this.zoom

    const svgElement = (tag: string, a: any) =>
      `<${tag} ` +
      Object.keys(a)
        .map(key => `${key}="${a[key as keyof typeof a]}"`)
        .join(' ') +
      '/>'

    const grid =
      this.gridType === 'line'
        ? svgElement('rect', {
          x: stroke / 2,
          y: stroke / 2,
          width: this.gridSize.x * this.zoom - stroke,
          height: this.gridSize.y * this.zoom - stroke,
          fill: 'blue',
          rx: this.gridRound * this.zoom,
          ry: this.gridRound * this.zoom
        })
        : [new V(0, 0), new V(1, 0), new V(0, 1), new V(1, 1)]
          .map(p =>
            svgElement('rect', {
              x: p.x * this.gridSize.x * this.zoom - stroke / 2,
              y: p.y * this.gridSize.y * this.zoom - stroke / 2,
              width: stroke,
              height: stroke,
              fill: 'green',
              rx: this.gridRound * this.zoom,
              ry: this.gridRound * this.zoom
            })
          )
          .join('')

    const svg = `%3Csvg width="${this.gridSize.x * this.zoom}px" height="${this
      .gridSize.y *
      this.zoom}px" xmlns="http://www.w3.org/2000/svg" %3E${grid}%3C/svg%3E`
    const url = `data:image/svg+xml,${svg}`
    return url
  }

  mounted (): void {
    this.view = this.$refs.view as HTMLElement
    this.slot = this.$refs.slot as HTMLElement

    this.updateLoop()

    if (!this.view || !this.slot) return

    // Event listener
    this.view.addEventListener('mousedown', e => this.beginDrag(e))
    this.view.addEventListener('mousemove', e => this.updateDrag(e))
    this.view.addEventListener('mousewheel', e =>
      this.updateZoom(e as WheelEvent)
    )
    document.addEventListener('mouseup', e => this.endDrag(e))
  }

  // Event listeners
  beginDrag (e: MouseEvent): void {
    this.onDrag = true
    this.updateDrag(e)
  }

  updateDrag (e: MouseEvent): void {
    if (this.onDrag) {
      const movement = new V(e.movementX, e.movementY)
      this.updatePosition(movement)
    }
  }

  endDrag (e: MouseEvent): void {
    this.onDrag = false
  }

  updateZoom (e: WheelEvent): void {
    const zoom =
      e.deltaY > 0
        ? this.zoom * (1 - this.zoomSpeed)
        : this.zoom * (1 + this.zoomSpeed)
    this.zoom = Math.min(Math.max(zoom, 0.001), 20)

    if (!this.view) return

    const rect = this.view.getBoundingClientRect()
    const newPosition = new V(e.clientX, e.clientY)
      .subV(new V(rect.x, rect.y))
      .divN(this.zoom)

    const offset = newPosition.subV(this.slotTransform.position)

    console.log(offset)

    // this.slotTransform.position = offset

    this.slotOrigin = offset
    this.viewTransform.position = newPosition

    e.preventDefault()
  }

  // Update content
  updatePosition (movement: V): void {
    if (!this.slot) return

    this.slotTransform.position = this.slotTransform.position.addV(movement)

    console.log('updatePOsition', movement)
  }

  updateBoxSizes (): void {
    // Compute view box
    if (!this.view || !this.slot) return

    this.viewTransform.size = new V(
      this.view.offsetWidth,
      this.view.offsetHeight
    )
    this.slotTransform.size = this.viewTransform.size
      .multN(2)
      .addV(new V(this.slot.offsetWidth, this.slot.offsetHeight))
  }

  updateLoop () {
    this.updateBoxSizes()
    requestAnimationFrame(() => this.updateLoop())
  }
}
</script>
