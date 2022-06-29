<style lang="scss">
.dynamic-chart {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}
.dynamic-chart svg {
  display: block;
  cursor: grab;
  user-select: none;
  position: absolute;
  z-index: 1;
}

.dynamic-chart svg:active {
  cursor: grabbing;
}

.controls {
  position: absolute;
  top: 0;
  right: 0;
  gap: 20px;
  display: flex;
  z-index: 5;
}

.coordinatesX {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 50px;
  width: 100%;
  background-color: red;
  z-index: 3;
}
.coordinatesY {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 50px;
  background-color: green;
  z-index: 2;
}
</style>
<template>
  <div class="dynamic-chart" ref="container">
    <div class="controls pa-4" ref="controls">
      <v-btn color="primary" icon class="black--text">
        <v-icon>mdi-eye</v-icon>
      </v-btn>
      <v-btn color="primary" icon class="black--text">
        <v-icon>mdi-download</v-icon>
      </v-btn>
    </div>
    <div class="coordinatesX"></div>
    <div class="coordinatesY"></div>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      version="1.1"
      :viewBox="`${box.context.toString()}`"
      :width="`${box.context.size.x}`"
      :height="`${box.context.size.y}`"
      :style="{
        backgroundColor: theme.current.backgroundColorOut,
        left: box.view.position.x,
        top: box.view.position.y
      }"
    >
      <!-- Draw X (vertical) grid -->
      <line
        v-for="(x, xi) in Math.floor(box.grid.size.divV(step).x)"
        :key="`x-${xi}`"
        :stroke="
          box.grid.position.x + x * step.x === 0
            ? theme.current.gridColorY
            : theme.current.gridColor
        "
        :x1="box.grid.position.x + x * step.x"
        :y1="box.context.position.y"
        :x2="box.grid.position.x + x * step.x"
        :y2="box.context.position.y + box.context.size.y"
      ></line>

      <!-- Draw Y (horizontal) grid -->
      <line
        v-for="(y, yi) in Math.floor(box.grid.size.divV(step).y)"
        :key="`y-${yi}`"
        :stroke="
          box.grid.position.y + y * step.y === 0
            ? theme.current.gridColorX
            : theme.current.gridColor
        "
        :x1="box.context.position.x"
        :y1="box.grid.position.y + y * step.y"
        :x2="box.context.position.x + box.context.size.x"
        :y2="box.grid.position.y + y * step.y"
      ></line>

      <!-- Draw data -->
      <g ref="dynamicChartDataContainer">
        <slot name="data"></slot>
      </g>
    </svg>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import V from '@/utils/vector'
import T from '@/utils/transform'
import DynamicChartData from '@/components/dynamicChart/DynamicChartData'
import DynamicChartThemes from '@/components/dynamicChart/DynamicChartThemes'
import { VNode } from 'vue'

@Component({
  name: 'DynamicChart'
})
// @vuese
// @group COMPONENTS
export default class DynamicChart extends Vue {
  @Prop({ default: () => new V(50, 50) })
  private step!: V

  @Prop({
    default: () => {
      return { x: 'X', y: 'Y' }
    }
  })
  private labels!: { x: string; y: string }

  private container: HTMLElement | null = null
  private dynamicChartDataContainer: SVGGElement | null = null
  private dynamicChartData: DynamicChartData | null = null
  private onDrag = false
  private coordinateMargin = 15
  private fontSize = 14

  private theme = new DynamicChartThemes(this)

  private box = {
    context: new T(),
    data: new T(new V(-100, -100), new V(200, 200)),
    view: new T(),
    grid: new T()
  }

  mounted (): void {
    this.container = this.$refs.container as HTMLElement

    const node = this.$slots.data
    let dataNode = null
    if (node && node[0]) {
      dataNode = node[0]
    }

    if (!dataNode || !dataNode.componentOptions) {
      return
    }

    console.log('SLOT', dataNode.componentOptions)

    this.$nextTick(() => {
      this.updateBoxSizes(this.box.data)
      this.updatePosition(
        this.box.context.getMiddle().subV(this.box.view.size.divN(2))
      )
    })

    this.updateLoop()

    // Event listener
    this.container.addEventListener('mousedown', e => this.beginDrag(e))
    this.container.addEventListener('mousemove', e => this.updateDrag(e))
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
      this.updatePosition(this.box.view.position.addV(movement))
    }
  }

  endDrag (e: MouseEvent): void {
    this.onDrag = false
  }

  // Update content
  updatePosition (position: V): void {
    const pmin = this.box.context.position
    const pmax = pmin.addV(this.box.context.size.subV(this.box.view.size))

    if (position.x < pmin.x) {
      position.x = pmin.x
    }
    if (position.y < pmin.y) {
      position.y = pmin.y
    }
    if (position.x > pmax.x) {
      position.x = pmax.x
    }
    if (position.y > pmax.y) {
      position.y = pmax.y
    }

    this.box.view.position = position
  }

  updateBoxSizes2 (dataBox: T): void {
    console.log('event : ', dataBox)
    this.updateBoxSizes(dataBox)
  }

  updateBoxSizes (dataBox: T): void {
    // Save data box
    this.box.data = dataBox

    // Compute view box
    if (!this.container) return
    const rect = this.container.getBoundingClientRect()
    const size = new V(rect.width, rect.height)
    if (size.equal(this.box.view.size)) return
    this.box.view.size = size

    // Compute context box
    this.box.context.position = this.box.data.position.subV(this.box.view.size)
    this.box.context.size = this.box.data.size.addV(this.box.view.size.multN(2))

    // Compute grid box
    this.box.grid.position = this.box.context.position
      .divV(this.step)
      .floor()
      .multV(this.step)
    this.box.grid.size = this.box.context.size
      .divV(this.step)
      .ceil()
      .multV(this.step)

    // Update position
    this.updatePosition(this.box.view.position)
  }

  updateLoop () {
    this.updateBoxSizes(this.box.data)
    requestAnimationFrame(() => this.updateLoop())
  }
}
</script>
