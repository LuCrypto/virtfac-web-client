<template>
  <v-card
    elevation="3"
    class="range-bar-chart-container mx-auto my-3 pt-3 pb-6"
  >
    <div ref="rangeBarChart" class="range-bar-chart"></div>
    <div ref="rangeBarSlider" class="range-bar-slider">
      <div class="name"></div>
      <v-range-slider
        class="slider"
        :min="rangeView[0]"
        :max="rangeView[1]"
        v-model="range"
        hide-details
        @input="updateRange"
        step="2"
        height="10"
        track-color="background"
      ></v-range-slider>
    </div>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
require('@/components/charts/RangeBar.scss')

export class RangeBarData {
  label = ''
  value = 0
  constructor (label: string, value: number) {
    this.label = label
    this.value = value
  }
}

@Component({
  name: 'RangeBar'
})
// @vuese
// @group COMPONENTS
export default class RangeBar extends Vue {
  @Prop({ default: () => [] }) private rangeBarChartData!: RangeBarData[]
  @Prop({ default: () => [0, 100] }) private defaultRange!: number[]

  rangeBarChart: HTMLElement | null = null

  names = []
  values = []
  data = []
  range = [0, 100]
  rangeView = [0, 100]
  gradingStepNumber = 5
  theme = {
    primary: 'lightgrey',
    secondary: 'lightgrey'
  }

  created (): void {
    console.log('theme:', this.$vuetify.theme.themes.dark.primary)
    // this.theme.primary = this.$vuetify.theme.themes.dark.primary
    this.range = this.defaultRange
  }

  mounted (): void {
    this.rangeBarChart = this.$refs.rangeBarChart as HTMLElement
    this.generateContent()
    this.generateViewScale()
    this.updateRange()
    console.log('mounted')
  }

  div (classList: string[] | string, id?: string | null): HTMLElement {
    const dom = document.createElement('div')
    if (Array.isArray(classList)) {
      classList.forEach(classItem => dom.classList.add(classItem))
    } else {
      dom.classList.add(classList)
    }
    if (id != null) {
      dom.id = id
    }
    return dom
  }

  generateViewScale (): void {
    // Get scale from data
    this.rangeView[0] = 0
    this.rangeView[1] = 0
    this.rangeBarChartData.forEach(data => {
      this.rangeView[0] =
        data.value < this.rangeView[0] ? data.value : this.rangeView[0]
      this.rangeView[1] =
        data.value > this.rangeView[1] ? data.value : this.rangeView[1]
    })

    this.rangeView[0] = Math.floor(this.rangeView[0] / 10) * 10
    this.rangeView[1] = Math.ceil(this.rangeView[1] / 10) * 10

    // Generate number
    const createStepLabel = (index: number) => {
      const label = this.div('label')
      label.innerText = String(
        this.rangeView[0] +
          (index * (this.rangeView[1] - this.rangeView[0])) / 5
      )
      return label
    }

    // Generate row with scale values
    const row = this.div(['row', 'chart-scale'])
    const value = this.div('value')
    const gradingOfValues = this.generateGradingOfValues()
    gradingOfValues.childNodes.forEach((grading, index) => {
      grading.appendChild(createStepLabel(index + 1))
      if (index === 0) {
        grading.appendChild(createStepLabel(index))
      }
    })
    value.appendChild(gradingOfValues)
    const name = this.div('name')
    name.innerText = 'Values'
    row.appendChild(name)
    row.appendChild(value)
    if (this.rangeBarChart != null) {
      this.rangeBarChart.appendChild(row)
    }
  }

  generateGradingOfValues (): HTMLElement {
    const gradingOfValues = this.div('grading-of-values')
    for (let i = 0; i < this.gradingStepNumber; i++) {
      gradingOfValues.appendChild(this.div('grading'))
    }
    return gradingOfValues
  }

  generateContent (): void {
    const content = this.div('content')
    this.rangeBarChartData.forEach(dataRow => {
      const row = this.div('row')
      const name = this.div('name')
      name.innerHTML = dataRow.label
      const values = this.div('value')
      const valueBar = this.div('value-bar')
      valueBar.setAttribute('style', 'width:0%;')
      const rangeBar = this.div('range-bar')
      row.appendChild(name)
      row.appendChild(values)
      values.appendChild(valueBar)
      values.appendChild(rangeBar)
      values.appendChild(this.generateGradingOfValues())
      content.appendChild(row)
    })
    if (this.rangeBarChart != null) {
      this.rangeBarChart.appendChild(content)
      this.rangeBarChart.getBoundingClientRect()
    }
  }

  updateRange (): void {
    if (this.rangeBarChart != null) {
      [...this.rangeBarChart.querySelectorAll('.value-bar')].forEach(
        (valueBar, index) => {
          const value = this.rangeBarChartData[index].value
          if (value >= this.range[0] && value <= this.range[1]) {
            valueBar.classList.add('primary')
          } else {
            valueBar.classList.remove('primary')
          }
          valueBar.setAttribute('style', `width:${value}%;`)
          valueBar.setAttribute('aria-label', `${value.toFixed(2)}`)
        }
      )
      const range = this.range[1] - this.range[0]
      ;[...this.rangeBarChart.querySelectorAll('.range-bar')].forEach(
        rangeBar => {
          rangeBar.setAttribute(
            'style',
            `left:${this.range[0]}%;width:${range}%;`
          )
        }
      )
    }
  }
}
</script>
