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
}

.dynamic-chart svg:active {
  cursor: grabbing;
}

.point * {
  transition-duration: 0.2s;
}

.point {
  cursor: pointer;
  .shadow {
    opacity: 0;
  }
  .coordinates {
    opacity: 0;
  }
}
.point:hover {
  .shadow {
    opacity: 0.2;
  }
  .coordinates {
    opacity: 1 !important;
  }
}

.controls {
  position: absolute;
  top: 0;
  right: 0;
  gap: 20px;
  display: flex;
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
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      version="1.1"
      :viewBox="`0 0 ${this.size.x} ${this.size.y}`"
      :style="{ backgroundColor: theme.backgroundColorOut }"
    >
      <defs>
        <!-- Draw alpha mask for corner -->
        <mask id="corner-mask-bottom">
          <rect
            x="0"
            y="0"
            :width="Math.max(size.x, 0)"
            :height="Math.max(size.y - bottomHeight, 0)"
            fill="white"
          ></rect>
        </mask>

        <mask id="corner-mask-grid">
          <rect
            :x="leftWidth"
            y="0"
            :width="Math.max(size.x - leftWidth, 0)"
            :height="Math.max(size.y - bottomHeight, 0)"
            fill="white"
          ></rect>
        </mask>
      </defs>

      <!-- Draw bounding box -->
      <g
        :transform="
          `translate(${-dataBoundingBox.position.x}, ${-dataBoundingBox.position
            .y})`
        "
      >
        <rect
          :x="dataBoundingBox.position.x"
          :y="dataBoundingBox.position.y"
          :width="dataBoundingBox.size.x"
          :height="dataBoundingBox.size.y"
          rx="20"
          ry="20"
          :fill="theme.backgroundColorIn"
        ></rect>
      </g>

      <!-- Draw grid -->
      <g>
        <g
          :transform="
            `translate(${-dataBoundingBox.position.x}, ${-dataBoundingBox
              .position.y})`
          "
        >
          <line
            v-for="(x, xi) in Math.floor(maxGrid.x - minGrid.x / step.x)"
            :key="`x-${xi}`"
            :stroke="
              minGrid.x + x * step.x === 0 ? theme.gridColorY : theme.gridColor
            "
            :x1="minGrid.x + x * step.x"
            :y1="minGrid.y"
            :x2="minGrid.x + x * step.x"
            :y2="Math.max(max.y, min.y + size.y)"
          ></line>
          <line
            v-for="(y, yi) in Math.floor(maxGrid.y - minGrid.y / step.y)"
            :key="`y-${yi}`"
            :stroke="
              minGrid.y + y * step.y === 0 ? theme.gridColorX : theme.gridColor
            "
            :x1="minGrid.x"
            :y1="size.y - (minGrid.y + y * step.y)"
            :x2="Math.max(max.x, minGrid.x + size.x)"
            :y2="size.y - (minGrid.y + y * step.y)"
          ></line>
        </g>
      </g>

      <!-- Draw data -->
      <g
        :transform="
          `translate(${-dataBoundingBox.position.x}, ${-dataBoundingBox.position
            .y})`
        "
      >
        <!-- Draw data curve -->
        <line
          v-for="(v, vi) in data"
          :key="`v-${vi}`"
          stroke="#f5a406"
          :x1="v.x"
          :y1="size.y - v.y"
          :x2="(data[vi + 1] || v).x"
          :y2="size.y - (data[vi + 1] || v).y"
        ></line>

        <!-- Draw data points -->
        <g
          fill="#f5a406"
          v-for="(v, pi) in data"
          :key="`p-${pi}`"
          :transform="`translate(${v.x}, ${size.y - v.y})`"
          class="point"
        >
          <circle r="7"></circle>
          <circle class="shadow" r="20"></circle>

          <text
            class="coordinates"
            font-family="Montserrat"
            font-size="14"
            text-anchor="middle"
            style="opacity: 0;"
            :fill="theme.gridColorX"
            y="40"
          >
            {{ `${Math.round(v.x * 100) / 100}` }}
          </text>
          <text
            class="coordinates"
            font-family="Montserrat"
            font-size="14"
            text-anchor="middle"
            style="opacity: 0;"
            :fill="theme.gridColorY"
            y="60"
          >
            {{ `${Math.round(v.y * 100) / 100}` }}
          </text>
        </g>
      </g>

      <!-- Draw grid values X (horizontal axis)-->
      <g
        :transform="`translate(${-dataBoundingBox.position.x}, ${size.y - 50})`"
      >
        <text
          v-for="(x, txi) in Math.max(
            Math.floor(maxGrid.x - minGrid.x / step.x),
            0
          )"
          :key="`x-${txi}`"
          :fill="theme.axisValues"
          font-family="Montserrat"
          font-size="14"
          alignment-baseline="central"
          text-anchor="middle"
          :x="minGrid.x + x * step.x"
          y="30"
        >
          {{ Math.round((minGrid.x + x * step.x) * 100) / 100 }}
        </text>
      </g>

      <!-- Draw grid values Y (vertical axis)-->
      <g mask="url(#corner-mask-bottom)">
        <g :transform="`translate(0, ${-dataBoundingBox.position.y})`">
          <text
            v-for="(y, tyi) in Math.max(
              Math.floor(Math.max(maxGrid.y - minGrid.y) / step.y) - 1,
              0
            )"
            :key="`y-${tyi}`"
            :fill="theme.axisValues"
            font-family="Montserrat"
            font-size="14"
            alignment-baseline="central"
            text-anchor="start"
            x="20"
            :y="size.y - (minGrid.y + y * step.y)"
          >
            {{ Math.round((minGrid.y + y * step.y) * 100) / 100 }}
          </text>
        </g>
      </g>
    </svg>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import V from '@/utils/vector'
import T from '@/utils/transform'

@Component({
  name: 'DynamicChart'
})
// @vuese
// @group COMPONENTS
export default class DynamicChart extends Vue {
  @Prop({ default: () => 0.9 })
  private paddingPercent!: number

  @Prop({
    default: () =>
      '.......'
        .split('')
        .map((v, i) => new V(i + Math.random(), Math.random() * 10).multN(100))
  })
  private data!: V[]

  @Prop({ default: () => new V(50, 50) })
  private step!: V

  @Prop({
    default: () => {
      return { x: 'X', y: 'Y' }
    }
  })
  private labels!: { x: string; y: string }

  private container: HTMLElement | null = null
  private onDrag = false

  private themes = {
    dark: {
      backgroundColorOut: '#303030',
      backgroundColorIn: '#1e1e1e',
      gridColor: '#282828',
      gridColorX: '#bb0000',
      gridColorY: '#009900',
      axisValues: '#eeeeee'
    },
    light: {
      backgroundColorOut: '#efefef',
      backgroundColorIn: '#fbfbfb',
      gridColor: '#dddddd',
      gridColorX: '#ee5555',
      gridColorY: '#55ee55',
      axisValues: '#202020'
    }
  }

  private theme = this.themes.dark
  private size = new V(0, 0)
  private padding = new V(0, 0)

  private min = new V(0, 0)
  private max = new V(0, 0)
  private leftWidth = 70
  private bottomHeight = 50
  private minGrid = new V(0, 0)
  private maxGrid = new V(0, 0)
  private dataBoundingBox = new T()
  private viewBoundingBox = new T()

  updateContentBox (): void {
    // Compute data min max
    const min = new V(Infinity, Infinity)
    const max = new V(-Infinity, -Infinity)
    this.data.forEach(v => {
      min.x = v.x < min.x ? v.x : min.x
      min.y = v.y < min.y ? v.y : min.y
      max.x = v.x > max.x ? v.x : max.x
      max.y = v.y > max.y ? v.y : max.y
    })

    this.min = new V(min.x - this.padding.x, min.y - this.padding.y)
    this.max = new V(max.x + this.padding.x, max.y + this.padding.y)

    // Compute data bounding box
    this.dataBoundingBox.size = new V(
      Math.max(0, this.max.x - this.min.x),
      Math.max(0, this.max.y - this.min.y)
    )
    this.dataBoundingBox.position = new V(
      this.min.x,
      this.size.y - this.min.y - this.dataBoundingBox.size.y
    )

    // Compute view bounging box
    this.viewBoundingBox.size = this.dataBoundingBox.size.addV(
      this.dataBoundingBox.size.multN(this.paddingPercent * 2)
    )

    // Compute grid min max
    this.minGrid = this.viewBoundingBox.size
      .divV(this.step)
      .floor()
      .multV(this.step)
    this.maxGrid = this.max
      .divV(this.step)
      .floor()
      .multV(this.step)
  }

  mounted (): void {
    this.container = this.$refs.container as HTMLElement

    if (!this.container) {
      return
    }

    this.updateLoop()
    this.updatePosition(new V(-this.min.x, -this.min.y))

    // Event listener
    this.container.addEventListener('mousedown', e => this.beginDrag(e))
    this.container.addEventListener('mousemove', e => this.updateDrag(e))
    document.addEventListener('mouseup', e => this.endDrag(e))

    this.$root.$on('changeDarkMode', () => this.updateTheme())
    this.updateTheme()
  }

  updateTheme (): void {
    this.theme = this.$vuetify.theme.dark ? this.themes.dark : this.themes.light
  }

  beginDrag (e: MouseEvent): void {
    this.onDrag = true
    this.updateDrag(e)
  }

  updatePosition (position: V): void {
    if (position.x > this.max.x - this.size.x) {
      position.x = this.max.x - this.size.x
    }
    if (position.y < this.min.y - this.size.y) {
      position.y = this.min.y - this.size.y
    }

    if (position.x < this.min.x) {
      position.x = this.min.x
    }
    if (position.y > this.max.y) {
      position.y = this.max.y
    }
    this.dataBoundingBox.position = position
  }

  updateDrag (e: MouseEvent): void {
    if (this.onDrag) {
      const movement = new V(e.movementX, e.movementY)
      this.updatePosition(this.dataBoundingBox.position.subV(movement))
    }
  }

  endDrag (e: MouseEvent): void {
    this.onDrag = false
  }

  updateLoop () {
    if (this.container) {
      const size = new V(
        this.container.offsetWidth,
        this.container.offsetHeight
      )
      if (!size.equal(this.size)) {
        this.size = size
        this.updateContentBox()
        this.updatePosition(this.dataBoundingBox.position)
      }
    }
    requestAnimationFrame(() => this.updateLoop())
  }
}
</script>
