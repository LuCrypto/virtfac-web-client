import Vue from 'vue'

export default class DynamicChartThemes {
  public dark = {
    backgroundColorOut: '#303030',
    backgroundColorIn: '#1e1e1e',
    gridColor: '#282828',
    gridColorX: '#bb0000',
    gridColorY: '#009900',
    axisValues: '#eeeeee'
  }

  public light = {
    backgroundColorOut: '#efefef',
    backgroundColorIn: '#fbfbfb',
    gridColor: '#dddddd',
    gridColorX: '#ee5555',
    gridColorY: '#55ee55',
    axisValues: '#202020'
  }

  public current = this.dark

  private component: Vue

  constructor (component: Vue) {
    this.component = component
    component.$root.$on('changeDarkMode', () => this.updateTheme())
    this.updateTheme()
  }

  updateTheme (): void {
    this.current = this.component.$vuetify.theme.dark ? this.dark : this.light
  }
}
