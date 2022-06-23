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
      :viewBox="`${this.box.view.toString()}`"
      :style="{ backgroundColor: theme.backgroundColorOut }"
    >
      <defs>
        <!-- Draw alpha mask for corner -->
        <mask id="corner-mask-bottom">
          <rect
            :x="box.view.position.x"
            :y="box.view.position.y"
            :width="box.view.size.x"
            :height="
              Math.max(0, box.view.size.y - fontSize - 2 * coordinateMargin)
            "
            fill="white"
          ></rect>
        </mask>
      </defs>
      <!-- Draw bounding box -->
      <rect
        :x="this.box.data.position.x"
        :y="this.box.data.position.y"
        :width="this.box.data.size.x"
        :height="this.box.data.size.y"
        rx="20"
        ry="20"
        :fill="theme.backgroundColorIn"
      ></rect>

      <!-- Draw X (vertical) grid -->
      <line
        v-for="(x, xi) in Math.floor(box.grid.size.divV(step).x)"
        :key="`x-${xi}`"
        :stroke="
          box.grid.position.x + x * step.x === 0
            ? theme.gridColorY
            : theme.gridColor
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
            ? theme.gridColorX
            : theme.gridColor
        "
        :x1="box.context.position.x"
        :y1="box.grid.position.y + y * step.y"
        :x2="box.context.position.x + box.context.size.x"
        :y2="box.grid.position.y + y * step.y"
      ></line>

      <!-- Draw X (horizontal) coordinates -->

      <text
        v-for="(x, txi) in Math.floor(box.grid.size.divV(step).x)"
        :key="`tx-${txi}`"
        :fill="theme.axisValues"
        font-family="Montserrat"
        :font-size="fontSize"
        alignment-baseline="end"
        text-anchor="middle"
        :x="box.grid.position.x + x * step.x"
        :y="box.view.position.y + box.view.size.y - coordinateMargin"
      >
        {{ Math.round((box.grid.position.x + x * step.x) * 100) / 100 }}
      </text>

      <!-- Draw Y (vertical) coordinates -->
      <text
        mask="url(#corner-mask-bottom)"
        v-for="(y, tyi) in Math.floor(box.grid.size.divV(step).y)"
        :key="`ty-${tyi}`"
        :fill="theme.axisValues"
        font-family="Montserrat"
        :font-size="fontSize"
        alignment-baseline="central"
        text-anchor="start"
        :x="box.view.position.x + coordinateMargin"
        :y="box.grid.position.y + y * step.y"
      >
        {{ Math.round((box.grid.position.y + y * step.y) * 100) / 100 }}
      </text>
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
  private coordinateMargin = 15
  private fontSize = 14

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

  private box = {
    context: new T(),
    data: new T(),
    view: new T(),
    grid: new T()
  }

  mounted (): void {
    this.container = this.$refs.container as HTMLElement

    if (!this.container) {
      return
    }

    this.$nextTick(() => {
      this.updateBoxSizes()
      this.updatePosition(
        this.box.data.getMiddle().subV(this.box.view.size.divN(2))
      )
    })

    this.updateLoop()

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

  // Event listeners
  beginDrag (e: MouseEvent): void {
    this.onDrag = true
    this.updateDrag(e)
  }

  updateDrag (e: MouseEvent): void {
    if (this.onDrag) {
      const movement = new V(-e.movementX, -e.movementY)
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

  updateBoxSizes (): void {
    if (!this.container) {
      return
    }

    // Compute view box
    const rect = this.container.getBoundingClientRect()

    const size = new V(rect.width, rect.height)
    if (size.equal(this.box.view.size)) {
      return
    }

    this.box.view.size = size

    // Compute data box
    const min = new V(Infinity, Infinity)
    const max = new V(-Infinity, -Infinity)
    this.data.forEach(v => {
      min.x = v.x < min.x ? v.x : min.x
      min.y = v.y < min.y ? v.y : min.y
      max.x = v.x > max.x ? v.x : max.x
      max.y = v.y > max.y ? v.y : max.y
    })

    this.box.data.position = min
    this.box.data.size = max.subV(min)

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
    this.updateBoxSizes()
    requestAnimationFrame(() => this.updateLoop())
  }
}
</script>
