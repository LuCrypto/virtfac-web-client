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
  <g>
    <!-- Draw bounding box -->
    <rect
      :x="this.box.position.x"
      :y="-(this.box.position.y + this.box.size.y)"
      :width="this.box.size.x"
      :height="this.box.size.y"
      rx="10"
      ry="10"
      :stroke="theme.current.backgroundColorIn"
      stroke-width="5"
      fill="transparent"
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
        :fill="theme.current.gridColorX"
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
        :fill="theme.current.gridColorY"
        y="60"
      >
        {{ `${Math.round(v.y * 100) / 100}` }}
      </text>
    </g>

    <!-- Draw X (horizontal) coordinates -->
    <text
      v-for="(x, txi) in Math.floor(box.size.x / step.x) + 1"
      :key="`tx-${txi}`"
      :fill="theme.current.axisValues"
      font-family="Montserrat"
      :font-size="theme.current.fontSize"
      alignment-baseline="hanging"
      text-anchor="middle"
      :x="box.position.x + x * step.x"
      :y="-box.position.y"
    >
      {{ Math.round((box.position.x + x * step.x) * 100) / 100 }}
    </text>

    <!-- Draw Y (vertical) coordinates -->
    <text
      v-for="(y, tyi) in Math.floor(box.size.divV(step).y) + 1"
      :key="`ty-${tyi}`"
      :fill="theme.current.axisValues"
      font-family="Montserrat"
      :font-size="theme.current.fontSize"
      alignment-baseline="central"
      text-anchor="end"
      :x="box.position.x"
      :y="-(box.position.y + y * step.y)"
    >
      {{ Math.round((box.position.y + y * step.y) * 100) / 100 }}
    </text>
  </g>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator'
import V from '@/utils/vector'
import DynamicChartData from '@/components/dynamicChart/DynamicChartData'
import DynamicChartThemes from '@/components/dynamicChart/DynamicChartThemes'

@Component({
  name: 'DynamicChartPlot'
})
// @vuese
// @group COMPONENTS
export default class DynamicChartPlot extends DynamicChartData {
  private theme = new DynamicChartThemes(this)

  step = new V(50, 50)

  mounted (): void {
    console.log('DynamicChartPlot')
  }
}
</script>
