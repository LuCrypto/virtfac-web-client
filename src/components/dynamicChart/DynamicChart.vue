<style lang="scss">
.dynamic-chart-container {
  overflow: hidden;
  width: 100%;
  position: relative;
  border-radius: 8px;

  .pinch-scroll-zoom {
    z-index: 0;
  }
  .buttons {
    display: flex;
    padding: 14px;
    z-index: 1;
  }
}
</style>
<template>
  <div>
    <v-card-title style="gap: 14px; justify-content: right;">
      <div class="flex-grow-1">{{ title }}</div>
      <v-btn
        fab
        small
        :color="controls ? 'primary' : ''"
        @click="controls = !controls"
      >
        <v-icon
          :class="
            $vuetify.theme.dark && !controls ? 'white--text' : 'black--text'
          "
        >
          mdi-camera-control
        </v-icon>
      </v-btn>
      <v-btn fab small outlined color="primary" @click="downloadAsPng">
        <v-icon>
          mdi-download
        </v-icon>
      </v-btn>
    </v-card-title>
    <div
      class="dynamic-chart-container"
      ref="container"
      :style="{
        height: `${Math.floor(contentHeight)}px`,
        backgroundColor: theme.current.colors.backgroundOut
      }"
      @dblclick="reset"
    >
      <PinchScrollZoom
        class="pinch-scroll-zoom"
        ref="pinchScrollZoom"
        :width="size.x"
        :height="size.y"
        :minScale="0.01"
        :maxScale="100"
        :wheelVelocity="0.002"
        :within="false"
        :originX="0"
        :originY="0"
        :style="{
          pointerEvents: controls ? 'auto' : 'none'
        }"
      >
        <div ref="content" style="pointer-events: 'auto';">
          <slot>No chart specified in template.</slot>
        </div>
      </PinchScrollZoom>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import PinchScrollZoom from '@coddicat/vue-pinch-scroll-zoom'
import DynamicChartThemes from '@/components/dynamicChart/DynamicChartThemes'
import V from '@/utils/vector'
import { Canvg } from 'canvg'
import OffscreenCanvasRenderingContext2D from 'canvg/dist/types.d'

@Component({
  name: 'DynamicChart',
  components: {
    PinchScrollZoom
  }
})
// @vuese
// @group COMPONENTS
export default class DynamicChart extends Vue {
  @Prop({ default: () => '' }) private title!: string

  private container: HTMLElement | null = null
  private content: HTMLElement | null = null
  private pinchScrollZoom: PinchScrollZoom | null = null
  private size = new V(0, 0)
  private controls = false
  private theme = new DynamicChartThemes(this)
  private contentHeight = 1000

  mounted (): void {
    this.container = this.$refs.container as HTMLElement
    this.content = this.$refs.content as HTMLElement
    this.pinchScrollZoom = this.$refs.pinchScrollZoom as PinchScrollZoom
    this.loop()
  }

  reset () {
    if (!this.pinchScrollZoom) return
    this.pinchScrollZoom.setData({
      scale: 1,
      originX: 0,
      originY: 0,
      translateX: 0,
      translateY: this.contentHeight
    })
  }

  updateSize (): void {
    if (!this.container || !this.content) return
    this.contentHeight = this.content.offsetHeight
    const rect = this.container.getBoundingClientRect()
    const size = new V(rect.width, rect.height)
    if (size.equal(this.size)) return
    this.size = size
  }

  loop () {
    if (!this.controls) {
      this.reset()
    }
    this.updateSize()
    requestAnimationFrame(() => this.loop())
  }

  downloadAsPng () {
    const canvas = new OffscreenCanvas(4096, 4096)
    const ctx = canvas.getContext('2d')

    const svg =
      this.$el.querySelector('.dynamic-chart-container svg')?.outerHTML ||
      '<svg></svg>'

    const v = Canvg.fromString(ctx as OffscreenCanvasRenderingContext2D, svg)

    // Start drawing the SVG on the canvas
    v.render()

    // Convert the Canvas to an image
    canvas
      .convertToBlob()
      .then(blob => {
        const pngUrl = URL.createObjectURL(blob)
        var a = document.createElement('a')
        a.setAttribute('href', pngUrl)
        a.setAttribute('download', `${this.title}.png`)
        document.body.append(a)
        a.click()
        URL.revokeObjectURL(pngUrl)
        document.body.removeChild(a)
      })
      .catch(error => {
        console.warn(error)
      })
  }
}
</script>
