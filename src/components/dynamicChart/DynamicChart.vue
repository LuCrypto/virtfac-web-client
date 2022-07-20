<style lang="scss">
.dynamic-chart-container {
  overflow: hidden;
  width: 100%;

  .pinch-scroll-zoom {
    z-index: 0;
  }
  .buttons {
    display: flex;
    padding: 14px;
    z-index: 1;
  }
}

.fullscreen {
  position: fixed;
  top: 64px;
  left: 0;
  width: 100%;
  height: 100%;
  max-height: 100%;
  max-width: 100%;
  display: block;
  z-index: 2;
}
</style>
<template>
  <v-card
    class="pa-4 mb-8"
    :class="fullscreen ? 'fullscreen' : ''"
    :style="{
      backgroundColor: $vuetify.theme.dark ? '#1E1E1E' : '#EFEFEF'
    }"
  >
    <v-card-title class="pt-0 px-0" style="gap: 14px; justify-content: right;">
      <div class="flex-grow-1">{{ title }}</div>
      <v-btn
        :color="controls ? 'primary' : ''"
        @click="controls = !controls"
        :class="controls ? 'black--text' : ''"
        fab
        small
      >
        <v-icon
          :class="
            $vuetify.theme.dark && !controls ? 'white--text' : 'black--text'
          "
        >
          mdi-arrow-all
        </v-icon>
      </v-btn>
      <v-btn
        :color="fullscreen ? 'primary' : ''"
        @click="toggleFullscreen"
        :class="fullscreen ? 'black--text' : ''"
        fab
        small
      >
        <v-icon
          :class="
            $vuetify.theme.dark && !fullscreen ? 'white--text' : 'black--text'
          "
        >
          {{ fullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen' }}
        </v-icon>
      </v-btn>

      <v-btn fab small @click="settingsPopUp.open()">
        <v-icon>
          mdi-dots-horizontal
        </v-icon>
      </v-btn>
    </v-card-title>
    <div
      class="dynamic-chart-container"
      ref="container"
      :style="{
        height: `${Math.floor(contentHeight)}px`,
        backgroundColor: theme.current.colors.backgroundOut,
        boxShadow: `inset 0 0 0 2px ${
          $vuetify.theme.dark ? '#303030' : '#ffffff'
        }`,
        position: 'relative'
      }"
      @dblclick="reset"
    >
      <div
        class="d-flex flex-column"
        style="position: absolute; top: 0; left: 0; z-index: 2; margin: 10px; gap: 10px;"
      >
        <v-btn icon small>
          <v-icon>
            mdi-plus
          </v-icon>
        </v-btn>
        <v-btn icon small>
          <v-icon>
            mdi-minus
          </v-icon>
        </v-btn>
      </div>
      <div
        class="d-flex flex-row"
        style="position: absolute; bottom: 0; right: 0;z-index: 2; margin: 10px; gap: 10px;"
      >
        <v-btn icon small>
          <v-icon>
            mdi-plus
          </v-icon>
        </v-btn>
        <v-btn icon small>
          <v-icon>
            mdi-minus
          </v-icon>
        </v-btn>
      </div>

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
    <!-- Popup with chart settingsPopUp -->
    <pop-up ref="settingsPopUp">
      <v-card>
        <v-card-title style="white">
          Chart :
          <span class="ml-2" :style="{ color: 'var(--v-primary-base)' }">
            {{ this.title }}
          </span></v-card-title
        >
        <v-card-text>
          <v-container fluid class="d-flex flex-column px-0" style="gap: 24px;">
            <v-row no-gutters>
              <v-btn @click="downloadAsPNG" class="flex-grow-1">
                <v-icon>
                  mdi-download
                </v-icon>
                Download as PNG file
              </v-btn>
            </v-row>

            <v-row no-gutters>
              <v-btn @click="downloadAsSVG" class="flex-grow-1">
                <v-icon>
                  mdi-download
                </v-icon>
                Download as SVG file
              </v-btn>
            </v-row>

            <v-row no-gutters>
              step x :
            </v-row>
            <v-row no-gutters>
              step y :
            </v-row>
            <v-row no-gutters>
              units X :
            </v-row>
            <v-row no-gutters>
              units Y :
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-btn text color="primary">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </pop-up>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import PinchScrollZoom from '@coddicat/vue-pinch-scroll-zoom'
import DynamicChartThemes from '@/components/dynamicChart/DynamicChartThemes'
import PopUp from '@/components/PopUp.vue'
import V from '@/utils/vector'

@Component({
  name: 'DynamicChart',
  components: {
    PinchScrollZoom,
    PopUp
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
  private fullscreen = false
  private settingsPopUp: PopUp | null = null

  mounted (): void {
    this.container = this.$refs.container as HTMLElement
    this.content = this.$refs.content as HTMLElement
    this.pinchScrollZoom = this.$refs.pinchScrollZoom as PinchScrollZoom
    this.settingsPopUp = this.$refs.settingsPopUp as PopUp
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

  toggleFullscreen (): void {
    this.fullscreen = !this.fullscreen
    if (this.fullscreen) {
      this.$root.$emit('close-navbar')
    }
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

  // Convert SVG element to base 64 URI string
  getSVGURI (): string {
    const ref =
      this.$el.querySelector('.dynamic-chart-container svg') ||
      document.createElement('svg')
    const svg = ref.cloneNode(true) as SVGElement
    const box = svg.getAttribute('viewBox') || `0 0 ${this.size.toString()}`
    const boxHeight = box.split(' ')[3] || this.size.y

    const container = svg.querySelector('g') || svg
    container.setAttribute('transform', `translate(0, ${boxHeight})`)

    const mime = 'data:image/svg+xml;charset=utf-8,'
    const svgString = svg.outerHTML
    return mime + encodeURIComponent(svgString)
  }

  // Put svg to canvas and download it as PNG file
  downloadAsPNG () {
    const img = document.createElement('img')
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = this.size.x * 3
      canvas.height = this.size.y * 3

      if (!ctx) return
      ctx.drawImage(img, 0, 0)
      const href = canvas.toDataURL('image/png')
      this.download(`${this.title}.png`, href)
    }
    img.src = this.getSVGURI()
  }

  // Download SVG file
  downloadAsSVG () {
    this.download(`${this.title}.svg`, this.getSVGURI())
  }

  download (filename: string, href: string): void {
    console.log(this.size)
    const element = document.createElement('a')
    element.setAttribute('href', href)
    element.setAttribute('download', filename)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }
}
</script>
