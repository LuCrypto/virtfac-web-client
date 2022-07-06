<template>
  <v-card class="line-chart" style="overflow-x: auto;">
    <svg width="800" height="500"></svg>
  </v-card>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import * as d3 from 'd3'

@Component({
  name: 'HistogramChart'
})
// @vuese
// @group COMPONENTS
export default class HistogramChart extends Vue {
  @Prop({
    default: () =>
      d3
        .range(0, 100)
        .map(d3.randomInt(20))
        .map((v, i) => [i, v])
  })
  private data!: [number, number]

  @Prop({ default: () => 'x' }) private labelX!: string
  @Prop({ default: () => 'y' }) private labelY!: string
  mounted () {
    const svg = d3.select('svg')
    const margin = { top: 20, right: 20, bottom: 30, left: 50 }
    const width = +svg.attr('width') - margin.left - margin.right
    const height = +svg.attr('height') - margin.top - margin.bottom
    const g = svg
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    const x = d3.scaleLinear().rangeRound([0, width])
    const y = d3.scaleLinear().rangeRound([height, 0])
    const line = d3
      .line()
      .x(d => x(d[0]))
      .y(d => y(d[1]))

    const data = [
      [0, 93.24],
      [1, 95.35],
      [2, 98.84],
      [3, 99.92],
      [4, 99.8],
      [5, 99.47],
      [6, 100.39],
      [7, 100.4],
      [8, 100.81],
      [9, 103.92],
      [10, 105.06],
      [11, 106.88],
      [12, 107.1]
    ] as Iterable<[number, number]>
    x.domain(d3.extent(data, d => d[0]) as Iterable<d3.NumberValue>)
    y.domain(d3.extent(data, d => d[1]) as Iterable<d3.NumberValue>)

    g.append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x).ticks(7))
      .append('text')
      .attr('fill', '#f5a406')
      .attr('dx', width)
      .attr('dy', '-1.5em')
      .attr('text-anchor', 'end')
      .text(this.labelX)
    g.append('g')
      .call(d3.axisLeft(y))
      .append('text')
      .attr('fill', '#f5a406')
      .attr('dx', '1.5em')
      .attr('dy', '1em')
      .attr('text-anchor', 'start')
      .text(this.labelY)
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#f5a406')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', 1.5)
      .attr('d', line(data as Iterable<[number, number]>))
  }
}
</script>
