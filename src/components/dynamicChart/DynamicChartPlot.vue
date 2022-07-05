<style lang="scss" scoped>
svg {
  overflow: visible;
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
</style>
<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    :viewBox="
      `${this.gridBox.position.x - theme.current.styles.padding} ${-this.gridBox
        .position.y + theme.current.styles.padding} ${this.gridBox.size
        .addN(theme.current.styles.padding * 2)
        .toString()}`
    "
    version="1.1"
  >
    <defs>
      <pattern
        id="grid"
        x="0"
        y="0"
        :width="step.x"
        :height="step.y"
        patternUnits="userSpaceOnUse"
      >
        <rect
          :width="step.x"
          :height="step.y"
          :fill="theme.current.colors.grid"
        />
        <rect
          :x="theme.current.styles.grid.stroke / 2"
          :y="theme.current.styles.grid.stroke / 2"
          :width="step.x - theme.current.styles.grid.stroke"
          :height="step.y - theme.current.styles.grid.stroke"
          :fill="theme.current.colors.backgroundIn"
        />
      </pattern>
    </defs>
    <g>
      <!-- Draw bounding box -->
      <rect
        :x="this.gridBox.position.x"
        :y="-(this.gridBox.position.y + this.gridBox.size.y)"
        :width="this.gridBox.size.x"
        :height="this.gridBox.size.y"
        rx="10"
        ry="10"
        :stroke="theme.current.colors.backgroundIn"
        stroke-width="5"
        fill="url(#grid)"
      ></rect>

      <!-- Draw data curve -->
      <line
        v-for="(v, vi) in data"
        :key="`v-${vi}`"
        stroke="#f5a406"
        :x1="v.x"
        :y1="-v.y"
        :x2="(data[vi + 1] || v).x"
        :y2="-(data[vi + 1] || v).y"
      ></line>

      <!-- Draw data points -->
      <g
        fill="#f5a406"
        v-for="(v, pi) in data"
        :key="`p-${pi}`"
        :transform="`translate(${v.x}, ${-v.y})`"
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
          :fill="theme.current.colors.gridXAxis"
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
          :fill="theme.current.colors.gridYAxis"
          y="60"
        >
          {{ `${Math.round(v.y * 100) / 100}` }}
        </text>
      </g>

      <!-- Draw X (horizontal) coordinates -->
      <text
        v-for="(x, txi) in Math.floor(gridBox.size.x / step.x) - 1"
        :key="`tx-${txi}`"
        :fill="theme.current.colors.gridAxisValues"
        font-family="Montserrat"
        :font-size="theme.current.styles.fontSize"
        alignment-baseline="central"
        text-anchor="middle"
        :x="gridBox.position.x + x * step.x"
        :y="-gridBox.position.y - step.y / 2"
      >
        {{ Math.round((gridBox.position.x + x * step.x) * 100) / 100 }}
      </text>

      <!-- Draw Y (vertical) coordinates -->
      <text
        v-for="(y, tyi) in Math.floor(gridBox.size.divV(step).y) - 1"
        :key="`ty-${tyi}`"
        :fill="theme.current.colors.gridAxisValues"
        font-family="Montserrat"
        :font-size="theme.current.styles.fontSize"
        alignment-baseline="central"
        text-anchor="middle"
        :x="gridBox.position.x + step.x / 2"
        :y="-(gridBox.position.y + y * step.y)"
      >
        {{ Math.round((gridBox.position.y + y * step.y) * 100) / 100 }}
      </text>
    </g>
  </svg>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator'
import V from '@/utils/vector'
import T from '@/utils/transform'
import DynamicChartData from '@/components/dynamicChart/DynamicChartData'
import DynamicChartThemes from '@/components/dynamicChart/DynamicChartThemes'

@Component({
  name: 'DynamicChartPlot'
})
// @vuese
// @group COMPONENTS
export default class DynamicChartPlot extends DynamicChartData {
  private theme = new DynamicChartThemes(this)

  mounted (): void {
    console.log('DynamicChartPlot')
  }
}
</script>
