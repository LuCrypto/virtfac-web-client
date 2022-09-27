<style>
iframe {
  opacity: 1;
  transition: opacity 0.5s ease-in-out;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
.hide {
  opacity: 0 !important;
}
</style>
<template>
  <v-container
    fluid
    class="d-flex pa-0 container"
    style="background-color: transparent; position: relative;"
  ></v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Session } from '@/utils/session'

@Component({
  name: 'OdooIFrame'
})
// @vuese
// @group VIEWS
export default class OdooIFrame extends Vue {
  private base = 'http://virtfac.icube.unistra.fr'

  @Prop({ default: () => '' })
  private src!: string

  getIframeNameAttributes (): string {
    return JSON.stringify({
      theme: this.$vuetify.theme.dark ? 'dark' : 'light',
      hideFooter: true
    })
  }

  mounted (): void {
    this.$root.$on('changeDarkMode', () => {
      this.createIFrame()
    })
    this.$root.$on('changeLanguage', () => {
      this.createIFrame()
    })
    this.createIFrame()
  }

  removeLastIFrame (iframe: HTMLIFrameElement): void {
    // Fade new iframe during 0.5s
    iframe.classList.remove('hide')

    // Remove all previous iframe after 1s
    const lastIFrames = [...this.$el.querySelectorAll('iframe')]
    lastIFrames.pop()
    if (lastIFrames.length > 0) {
      setTimeout(() => {
        lastIFrames.forEach(lastIFrame => {
          if (this.$el.contains(lastIFrame)) {
            this.$el.removeChild(lastIFrame as Node)
          }
        })
      }, 1500)
    }
  }

  createIFrame (): void {
    const iframe = document.createElement('iframe') as HTMLIFrameElement
    const language = Session.getLanguage()
    let languagePath = ''
    switch (language) {
      case 'french':
        languagePath = '/fr'
        break
      case 'english':
        languagePath = '/en'
        break
      case 'german':
        languagePath = '/de'
        break
    }
    const src = `${this.base}${languagePath}${this.src}`
    if (src) {
      iframe.classList.add('hide')
      iframe.setAttribute('name', this.getIframeNameAttributes())
      iframe.onload = () => this.removeLastIFrame(iframe)
      iframe.src = `${src}`
      this.$el.appendChild(iframe)
    }
  }
}
</script>
