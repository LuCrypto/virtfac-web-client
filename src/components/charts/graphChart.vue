<style lang="scss"></style>
<template>
  <v-col
    no-gutters
    class="pa-0 flex-grow-1 d-flex flex-column"
    style="overflow: hidden"
  >
    <canvas ref="canvas"></canvas>
  </v-col>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import V from '@/utils/vector'
import T from '@/utils/transform'

@Component
export default class GraphChart extends Vue {
  zoom = 1
  delta = new V(0, 0)
  size = new V(0, 0)
  onDrag = false
  mouseInitialPosition = new V(0, 0)
  container: HTMLElement | null = null
  canvas: HTMLCanvasElement | null = null
  context: CanvasRenderingContext2D | null = null

  theme = {
    backgroundColor: '#252525'
  }

  mounted (): void {
    this.canvas = this.$refs.canvas as HTMLCanvasElement

    if (!this.canvas) {
      return
    }
    this.container = this.canvas.parentNode as HTMLElement
    this.context = this.canvas.getContext('2d')
    this.updateSize()
    this.updateTheme()
    this.loop()

    if (this.context) {
      this.context.translate(0, this.size.y / 2)
    }

    // Event listener
    this.canvas.addEventListener('mousedown', e => this.beginDrag(e))
    this.canvas.addEventListener('mousemove', e => this.updateDrag(e))
    document.addEventListener('mouseup', e => this.endDrag(e))

    this.$root.$on('changeDarkMode', () => {
      this.updateTheme()
    })
  }

  updateTheme (): void {
    if (this.$vuetify.theme.dark) {
      this.theme.backgroundColor = '#252525'
    } else {
      this.theme.backgroundColor = '#eeeeee'
    }
  }

  beginDrag (e: MouseEvent): void {
    this.onDrag = true
    this.mouseInitialPosition = new V(e.offsetX, e.offsetY)
    this.updateDrag(e)
  }

  updateDrag (e: MouseEvent): void {
    if (this.onDrag && this.context) {
      this.context.translate(e.movementX, e.movementY)
    }
  }

  endDrag (e: MouseEvent): void {
    this.onDrag = false
  }

  drawGrid (position: V): void {
    if (!this.context) {
      return
    }

    const padding = new V(2, 2)
    const gridSize = new V(100, 100)
    const axisSize = new V(2, 2)
    const squareNumber = this.size.divV(gridSize).addN(1)
    const offset = position.modV(gridSize)
    const absolute = position.divV(gridSize).floor()

    // Draw grid
    for (let i = 0; i < squareNumber.x; i++) {
      for (let j = 0; j < squareNumber.y; j++) {
        this.context.fillStyle = this.theme.backgroundColor
        this.context.fillRect(
          padding.x + offset.x + (i - 1) * gridSize.x,
          padding.y + offset.y + (j - 1) * gridSize.y,
          gridSize.x - padding.x,
          gridSize.y - padding.y
        )
      }
    }

    // Draw axis and coordinates
    for (let i = 0; i < squareNumber.x; i++) {
      const xAxis = i - 1 - absolute.x
      const xPosition = offset.x + (i - 1) * gridSize.x

      // Draw x axis values
      this.context.fillStyle = '#ff0000'
      this.context.font = '16px Montserrat'
      this.context.fillText(`${xAxis}`, 8 + xPosition, 16)

      // Draw x axis
      if (xAxis === 0) {
        this.context.globalAlpha = 0.2
        this.context.fillStyle = '#00ff00'
        this.context.fillRect(xPosition, 0, axisSize.x, this.size.y)
        this.context.globalAlpha = 1.0
      }
    }

    for (let j = 0; j < squareNumber.y; j++) {
      const yAxis = -(j - 1 - absolute.y)
      const yPosition = offset.y + (j - 1) * gridSize.y

      // Draw y axis values
      this.context.fillStyle = '#00ff00'
      this.context.font = '16px Montserrat'
      this.context.fillText(`${yAxis}`, 8, 16 + yPosition)

      // Draw y axis
      if (yAxis === 0) {
        this.context.globalAlpha = 0.2
        this.context.fillStyle = '#ff0000'
        this.context.fillRect(0, yPosition, this.size.x, axisSize.y)
        this.context.globalAlpha = 1.0
      }
    }
  }

  updateSize () {
    if (!this.canvas) {
      return
    }

    // Hide and show canvas for correct size computation
    this.canvas.setAttribute('style', 'display: none;')
    const size = new V(
      this.container ? this.container.offsetWidth : 0,
      this.container ? this.container.offsetHeight : 0
    )
    this.canvas.setAttribute('style', 'display: block;')

    if (!this.size.equal(size)) {
      this.size = size
      this.canvas.width = this.size.x
      this.canvas.height = this.size.y
    }
  }

  update (): void {
    if (!this.context) {
      return
    }

    const transform = this.context.getTransform()
    const position = new T().initFromDomMatrix(transform).position
    this.context.setTransform(1, 0, 0, 1, 0, 0)
    this.context.clearRect(0, 0, this.size.x, this.size.y)
    this.drawGrid(position)
    this.context.setTransform(transform)
  }

  loop () {
    this.updateSize()
    this.update()
    requestAnimationFrame(() => this.loop())
  }
}
</script>
