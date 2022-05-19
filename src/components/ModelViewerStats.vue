<style scoped>
.modelViewerStats {
  position: absolute;
  display: flex;
  bottom: 0;
  right: 0;
  margin: 10px;
  gap: 10px;
  cursor: pointer;
  opacity: 0.9;
  z-index: 10000;
}
</style>

<template>
  <div class="modelViewerStats" ref="container"></div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

export class Panel {
  dom: HTMLCanvasElement | null = null
  context: CanvasRenderingContext2D | null = null
  foregroundColor = '#ffffff'
  backgroundColor = '#000000'
  name = 'Info'
  min = Infinity
  max = 0
  layout = {
    PR: 0,
    WIDTH: 0,
    HEIGHT: 0,
    TEXT_X: 0,
    TEXT_Y: 0,
    GRAPH_X: 0,
    GRAPH_Y: 0,
    GRAPH_WIDTH: 0,
    GRAPH_HEIGHT: 0
  }

  constructor (name: string, dark: boolean) {
    this.foregroundColor = '#f5a406'
    this.backgroundColor = '#252525'
    this.name = name
    this.layout.PR = Math.round(window.devicePixelRatio || 1)
    this.layout.WIDTH = 80 * this.layout.PR
    this.layout.HEIGHT = 48 * this.layout.PR
    this.layout.TEXT_X = 3 * this.layout.PR
    this.layout.TEXT_Y = 2 * this.layout.PR
    this.layout.GRAPH_X = 3 * this.layout.PR
    this.layout.GRAPH_Y = 15 * this.layout.PR
    this.layout.GRAPH_WIDTH = 74 * this.layout.PR
    this.layout.GRAPH_HEIGHT = 30 * this.layout.PR

    const canvas = document.createElement('canvas')
    canvas.width = this.layout.WIDTH
    canvas.height = this.layout.HEIGHT
    canvas.style.cssText = 'width:80px;height:48px'
    this.dom = canvas

    this.context = canvas.getContext('2d')
    if (this.context) {
      this.context.font =
        'bold ' + 9 * this.layout.PR + 'px Helvetica,Arial,sans-serif'
      this.context.textBaseline = 'top'

      this.context.fillStyle = this.backgroundColor
      this.context.fillRect(0, 0, this.layout.WIDTH, this.layout.HEIGHT)

      this.context.fillStyle = this.foregroundColor
      this.context.fillText(this.name, this.layout.TEXT_X, this.layout.TEXT_Y)
      this.context.fillRect(
        this.layout.GRAPH_X,
        this.layout.GRAPH_Y,
        this.layout.GRAPH_WIDTH,
        this.layout.GRAPH_HEIGHT
      )

      this.context.fillStyle = this.backgroundColor
      this.context.globalAlpha = 0.9
      this.context.fillRect(
        this.layout.GRAPH_X,
        this.layout.GRAPH_Y,
        this.layout.GRAPH_WIDTH,
        this.layout.GRAPH_HEIGHT
      )
    }
  }

  update (value: number, maxValue: number): void {
    this.min = Math.min(this.min, value)
    this.max = Math.max(this.max, value)

    if (!this.dom || !this.context) {
      return
    }

    this.context.fillStyle = this.backgroundColor
    this.context.globalAlpha = 1
    this.context.fillRect(0, 0, this.layout.WIDTH, this.layout.GRAPH_Y)
    this.context.fillStyle = this.foregroundColor
    this.context.fillText(
      Math.round(value) +
        ' ' +
        this.name +
        ' (' +
        Math.round(this.min) +
        '-' +
        Math.round(this.max) +
        ')',
      this.layout.TEXT_X,
      this.layout.TEXT_Y
    )

    this.context.drawImage(
      this.dom,
      this.layout.GRAPH_X + this.layout.PR,
      this.layout.GRAPH_Y,
      this.layout.GRAPH_WIDTH - this.layout.PR,
      this.layout.GRAPH_HEIGHT,
      this.layout.GRAPH_X,
      this.layout.GRAPH_Y,
      this.layout.GRAPH_WIDTH - this.layout.PR,
      this.layout.GRAPH_HEIGHT
    )

    this.context.fillRect(
      this.layout.GRAPH_X + this.layout.GRAPH_WIDTH - this.layout.PR,
      this.layout.GRAPH_Y,
      this.layout.PR,
      this.layout.GRAPH_HEIGHT
    )

    this.context.fillStyle = this.backgroundColor
    this.context.globalAlpha = 0.9
    this.context.fillRect(
      this.layout.GRAPH_X + this.layout.GRAPH_WIDTH - this.layout.PR,
      this.layout.GRAPH_Y,
      this.layout.PR,
      Math.round((1 - value / maxValue) * this.layout.GRAPH_HEIGHT)
    )
  }
}

@Component({
  components: {}
})
export default class ModelViewerStats extends Vue {
  @Prop({ default: () => false }) private pannelIds!: number[]

  container: HTMLElement | null = null

  // Compute:
  beginTime = 0
  prevTime = 0
  frames = 0

  // Panels
  panels: Panel[] = []
  fpsPanel: Panel | null = null
  msPanel: Panel | null = null
  memPanel: Panel | null = null

  mounted () {
    this.container = this.$refs.container as HTMLElement
    this.beginTime = (performance || Date).now()
    this.prevTime = this.beginTime
    this.frames = 0
    this.fpsPanel = new Panel('FPS', this.$vuetify.theme.dark)
    this.panels.push(this.fpsPanel)
    this.msPanel = new Panel('MS', this.$vuetify.theme.dark)
    this.panels.push(this.msPanel)

    if (self.performance && self.performance.memory) {
      this.memPanel = new Panel('MB', this.$vuetify.theme.dark)
      this.panels.push(this.memPanel)
    }
    this.updatePanels()
  }

  updatePanels () {
    if (this.container) {
      // Update displayed panels
      const panels = this.panels
        .filter((_, index) => this.pannelIds.some(id => id === index))
        .map(panel => panel.dom) as HTMLElement[]

      // Update dom
      while (this.container.firstChild) {
        this.container.firstChild.remove()
      }
      panels.forEach(
        panel => this.container && this.container.appendChild(panel)
      )
    }
  }

  begin () {
    this.beginTime = (performance || Date).now()
  }

  end () {
    this.frames++

    const time = (performance || Date).now()

    if (this.msPanel) {
      this.msPanel.update(time - this.beginTime, 200)
    }

    if (time >= this.prevTime + 1000) {
      if (this.fpsPanel) {
        this.fpsPanel.update((this.frames * 1000) / (time - this.prevTime), 100)
      }
      this.prevTime = time
      this.frames = 0
      if (this.memPanel) {
        const memory = performance.memory
        this.memPanel.update(
          memory.usedJSHeapSize / 1048576,
          memory.jsHeapSizeLimit / 1048576
        )
      }
    }

    return time
  }

  update () {
    this.beginTime = this.end()
  }
}
</script>
