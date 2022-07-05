import V from '@/utils/vector'
import Vue from 'vue'

class ChartTheme {
  public colors: {
    backgroundOut: string
    backgroundIn: string
    grid: string
    gridXAxis: string
    gridYAxis: string
    gridAxisValues: string
  } = {
    backgroundOut: '#303030',
    backgroundIn: '#1e1e1e',
    grid: '#282828',
    gridXAxis: '#bb0000',
    gridYAxis: '#009900',
    gridAxisValues: '#eeeeee'
  }

  public styles: {
    fontSize: number
    padding: number
    grid: {
      type: 'none' | 'line' | 'point'
      stroke: number
      round: number
    }
  } = {
    fontSize: 14,
    padding: 24,
    grid: {
      type: 'line',
      stroke: 2,
      round: 0
    }
  }

  constructor (theme: Partial<ChartTheme> = {}) {
    Object.assign(this, theme)
  }
}

export default class DynamicChartThemes {
  // Define default dark / light theme
  public dark: ChartTheme = new ChartTheme()

  public light: ChartTheme = new ChartTheme({
    colors: {
      backgroundOut: '#efefef',
      backgroundIn: '#fbfbfb',
      grid: '#dddddd',
      gridXAxis: '#ee5555',
      gridYAxis: '#55ee55',
      gridAxisValues: '#202020'
    }
  })

  public current: ChartTheme = this.dark
  private component: Vue

  constructor (component: Vue) {
    this.component = component
    component.$root.$on('changeDarkMode', () => this.updateTheme())
    this.updateTheme()
  }

  updateTheme (): void {
    this.current = this.component.$vuetify.theme.dark ? this.dark : this.light
  }

  getGrid (size: V, zoom: number): string {
    if (this.current.styles.grid.type === 'none') return ''
    const stroke = this.current.styles.grid.stroke * zoom
    const round = this.current.styles.grid.round * zoom

    const svgElement = (tag: string, a: any) =>
      `<${tag} ` +
      Object.keys(a)
        .map(key => `${key}="${a[key as keyof typeof a]}"`)
        .join(' ') +
      '/>'

    let grid = ''

    switch (this.current.styles.grid.type) {
      case 'line':
        grid = svgElement('rect', {
          x: stroke / 2,
          y: stroke / 2,
          width: size.x * zoom - stroke,
          height: size.y * zoom - stroke,
          fill: 'blue',
          rx: round,
          ry: round
        })
        break
      case 'point':
        grid = [new V(0, 0), new V(1, 0), new V(0, 1), new V(1, 1)]
          .map(p =>
            svgElement('rect', {
              x: p.x * size.x * zoom - stroke / 2,
              y: p.y * size.y * zoom - stroke / 2,
              width: stroke,
              height: stroke,
              fill: 'green',
              rx: round,
              ry: round
            })
          )
          .join('')
        break
    }

    const svg = `%3Csvg width="${size.x * zoom}px" height="${size.y *
      zoom}px" xmlns="http://www.w3.org/2000/svg" %3E${grid}%3C/svg%3E`
    const url = `data:image/svg+xml,${svg}`
    return `url('${url}')`
  }
}
