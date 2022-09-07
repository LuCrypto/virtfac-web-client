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

/*
// In Odoo, this custom script is added to dynamicly update theme :

function GetIframeAttributes () {
  if (window.parent) {
    let json = {}
    try {
      json = JSON.parse(window.name)
    } catch (e) {
      return {}
    }
    return json
  }
  return {}
}

function SetTheme() {
    const attributes = GetIframeAttributes()
    console.log('Iframe parent attributes :', attributes)
    const theme = attributes.theme
    if(theme) {
        document.querySelector('body').classList.add(theme)
    }
}

SetTheme()

// And this custom style manage dark theme :
#top {
    display: none;
}

::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-thumb {
  background: #ffb000;
}

// Dark theme
body.dark,
.dark #wrap,
.dark .s_text_image,
.dark .s_banner *,
.dark .s_three_columns,
.dark .s_title,
.dark .s_text_block,
.dark footer,
.dark .s_picture {
    background-color: #121212;
    color: white;
}
.dark figcaption * {
    color: white !important;
}
.dark .o_we_shape {
    display: none;
}
*/

@Component({
  name: 'OdooIFrame'
})
// @vuese
// @group VIEWS
export default class OdooIFrame extends Vue {
  @Prop({ default: () => 'http://10.244.77.203/' })
  private src!: string

  getIframeNameAttributes (): string {
    return JSON.stringify({
      theme: this.$vuetify.theme.dark ? 'dark' : 'light'
    })
  }

  mounted (): void {
    this.$root.$on('changeDarkMode', () => {
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
    if (this.src) {
      iframe.classList.add('hide')
      iframe.setAttribute('name', this.getIframeNameAttributes())
      iframe.onload = () => this.removeLastIFrame(iframe)
      iframe.src = `${this.src}`
      this.$el.appendChild(iframe)
    }
  }
}
</script>
