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
      <!-- Define grid background -->
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

      <!-- Define arrow head -->
      <marker
        id="xArrow"
        :markerWidth="theme.current.styles.arrowSizeX"
        :markerHeight="theme.current.styles.arrowSizeY"
        refX="0"
        :refY="theme.current.styles.arrowSizeY / 2"
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <polygon
          :points="
            `0 0 ${theme.current.styles.arrowSizeX} ${theme.current.styles
              .arrowSizeY / 2} 0 ${theme.current.styles.arrowSizeY}`
          "
          :fill="theme.current.colors.gridXAxis"
        />
      </marker>

      <marker
        id="yArrow"
        :markerWidth="theme.current.styles.arrowSizeX"
        :markerHeight="theme.current.styles.arrowSizeY"
        refX="0"
        :refY="theme.current.styles.arrowSizeY / 2"
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <polygon
          :points="
            `0 0 ${theme.current.styles.arrowSizeX} ${theme.current.styles
              .arrowSizeY / 2} 0 ${theme.current.styles.arrowSizeY}`
          "
          :fill="theme.current.colors.gridYAxis"
        />
      </marker>

      gridXAxis
    </defs>
    <g>
      <!-- Draw grid background -->
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

      <!-- Draw red X axis on 0 -->
      <line
        :stroke="theme.current.colors.gridXAxis"
        :stroke-width="theme.current.styles.grid.stroke"
        :x1="gridBox.position.x"
        :y1="0"
        :x2="gridBox.position.x + gridBox.size.x"
        :y2="0"
      ></line>

      <!-- Draw green Y axis on 0 -->
      <line
        :stroke="theme.current.colors.gridYAxis"
        :stroke-width="theme.current.styles.grid.stroke"
        :y1="-gridBox.position.y"
        :x1="0"
        :y2="-(gridBox.position.y + gridBox.size.y)"
        :x2="0"
      ></line>

      <!-- Draw data curve -->
      <g v-for="(curve, ci) in curves" :key="`ci-${ci}`">
        <polyline
          :stroke="computeColor(curve.name)"
          fill="transparent"
          :stroke-width="theme.current.styles.grid.stroke"
          :points="computePoints(curve.data)"
        ></polyline>

        <!-- Draw data points -->
        <g v-if="displayPlot">
          <g
            fill="#f5a406"
            v-for="(v, pi) in curve.data"
            :key="`p-${pi}`"
            :transform="`translate(${v.x}, ${-v.y})`"
            class="point"
          >
            <circle :r="theme.current.styles.data.pointSize"></circle>
            <circle
              class="shadow"
              :r="theme.current.styles.data.pointShadowSize"
            ></circle>

            <text
              class="coordinates"
              font-family="Montserrat"
              :font-size="theme.current.styles.fontSize"
              text-anchor="middle"
              style="opacity: 0;"
              :fill="theme.current.colors.gridXAxis"
              y="40"
            >
              {{ `${Math.round((v.x / scale.x) * 100) / 100}` }}
            </text>
            <text
              class="coordinates"
              font-family="Montserrat"
              :font-size="theme.current.styles.fontSize"
              text-anchor="middle"
              style="opacity: 0;"
              :fill="theme.current.colors.gridYAxis"
              y="60"
            >
              {{ `${Math.round((v.y / scale.y) * 100) / 100}` }}
            </text>
          </g>
        </g>
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
        {{
          Math.round(((gridBox.position.x + x * step.x) / scale.x) * 100) / 100
        }}
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
        {{
          Math.round(((gridBox.position.y + y * step.y) / scale.y) * 100) / 100
        }}
      </text>

      <!-- Draw X (horizontal) label -->
      <text
        :fill="theme.current.colors.gridAxisValues"
        font-family="Montserrat"
        :font-size="theme.current.styles.fontSize"
        alignment-baseline="central"
        text-anchor="end"
        :x="gridBox.position.x + gridBox.size.x - step.x / 2"
        :y="-gridBox.position.y - (3 * step.y) / 2"
      >
        {{ labelX }}
      </text>
      <line
        :x1="
          gridBox.position.x +
            gridBox.size.x -
            step.x / 2 -
            theme.current.styles.arrowLength
        "
        :y1="
          -gridBox.position.y - (3 * step.y) / 2 + theme.current.styles.fontSize
        "
        :x2="
          gridBox.position.x +
            gridBox.size.x -
            step.x / 2 -
            theme.current.styles.arrowSizeX
        "
        :y2="
          -gridBox.position.y - (3 * step.y) / 2 + theme.current.styles.fontSize
        "
        :stroke="theme.current.colors.gridXAxis"
        :stroke-width="theme.current.styles.grid.stroke"
        marker-end="url(#xArrow)"
      />

      <!-- Draw Y (vertical) label -->
      <text
        :fill="theme.current.colors.gridAxisValues"
        font-family="Montserrat"
        :font-size="theme.current.styles.fontSize"
        alignment-baseline="start"
        text-anchor="start"
        :x="gridBox.position.x + (3 * step.x) / 2"
        :y="-(gridBox.position.y + gridBox.size.y - step.y / 2)"
      >
        {{ labelY }}
      </text>
      <line
        :x1="
          gridBox.position.x +
            (3 * step.x) / 2 -
            theme.current.styles.fontSize / 2
        "
        :y1="
          -(
            gridBox.position.y +
            gridBox.size.y -
            step.y / 2 -
            theme.current.styles.arrowLength
          )
        "
        :x2="
          gridBox.position.x +
            (3 * step.x) / 2 -
            theme.current.styles.fontSize / 2
        "
        :y2="-(gridBox.position.y + gridBox.size.y - step.y / 2)"
        :stroke="theme.current.colors.gridYAxis"
        :stroke-width="theme.current.styles.grid.stroke"
        marker-end="url(#yArrow)"
      />
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

  private nextColor = 0
  private colors = [
    '#9B59B6',
    '#2980B9',
    '#A93226',
    '#6C3483',
    '#1F618D',
    '#117A65',
    '#2ECC71'
  ]

  mounted (): void {
    console.log('DynamicChartPlot')
  }

  computePoints (data: V[]) {
    const invertY = new V(1, -1)
    return data.map(v => v.multV(invertY).toString()).join(' ')
  }

  computeColor (name = '') {
    const match = name.match(/\d/g)
    const index = match ? parseInt(match.join('')) : 0
    return this.colors[index % this.colors.length]
  }
}
</script>
