<template>
  <iframe
    style="display: block;"
    ref="iframe"
    src="./doc/index.html#/components/OpenFilePopUp"
    @load="frameLoaded"
    frameborder="0"
  />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({
  name: 'CodeStructure'
})
// @vuese
// @group VIEWS
export default class CodeStructure extends Vue {
  iframe: HTMLIFrameElement | null = null
  iframeDefaultHead = ''

  mounted (): void {
    this.iframe = this.$refs.iframe as HTMLIFrameElement
    this.$root.$on('changeDarkMode', () => {
      this.updateTheme()
    })
  }

  frameLoaded (): void {
    if (!this.iframe || !this.iframe.contentDocument) {
      return
    }
    this.iframeDefaultHead = this.iframe.contentDocument.head.innerHTML
    this.updateTheme()
  }

  updateTheme (): void {
    if (!this.iframe || !this.iframe.contentDocument) {
      return
    }
    this.iframe.contentDocument.head.innerHTML = `${
      this.iframeDefaultHead
    }<link rel="stylesheet" href="../docStyle${
      this.$vuetify.theme.dark ? 'dark' : 'light'
    }.css"></link>`
  }
}
</script>
