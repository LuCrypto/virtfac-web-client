<template>
  <v-container fluid style="overflow: hidden;" class="pa-0">
    <iframe
      style="width: 100%; height: 100%;"
      ref="iframe"
      src="./doc/index.html#/components/OpenFilePopUp"
      @load="frameLoaded"
      frameborder="0"
    />
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

const theme = {
  accent_color: ['#f5a406', ' #f5a406'],
  page_background: ['#252525', ' #fff'],
  header_background: ['#151515', ' #fff'],
  header_text_color: ['var(--text-color)', ' var(--text-color)'],
  text_color: ['#fff', ' #000'],
  link_color: ['var(--accent-color)', ' var(--accent-color)'],
  sidebar_width: ['280px', ' 280px'],
  sidebar_background: ['var(--page-background)', ' var(--page-background)'],
  sidebar_link_color: ['#fff', ' #444'],
  sidebar_link_active_color: ['var(--accent-color)', ' var(--accent-color)'],
  sidebar_link_arrow_color: ['var(--accent-color)', ' var(--accent-color)'],
  main_background: ['var(--page-background)', ' var(--page-background)'],
  border_color: ['#000', ' #eaeaea'],
  header_height: ['55px', ' 55px'],
  tip_color: ['rgb(6, 125, 247)', ' rgb(6, 125, 247)'],
  success_color: ['#42b983', ' #42b983'],
  warning_color: ['#ff9800', ' #ff9800'],
  danger_color: ['rgb(255, 0, 31)', ' rgb(255, 0, 31)'],
  nav_link_color: ['#2c3e50', ' #2c3e50'],
  nav_link_border_color: ['var(--accent-color)', ' var(--accent-color)'],
  code_block_background: ['#011627', ' #011627'],
  code_block_text_color: ['white', ' white'],
  code_block_shadow_color: ['#333', ' #333'],
  code_block_shadow_width: ['0px', ' 0px'],
  highlighted_line_background: ['#022a4b', ' #022a4b'],
  highlighted_line_border_color: ['#ffa7c4', ' #ffa7c4'],
  inline_code_color: ['#000', ' #000'],
  inline_code_background: ['var(--accent-color)', ' var(--accent-color)'],
  loader_primary_color: ['#151515', ' #f3f3f3'],
  loader_secondary_color: ['#252525', ' #ecebeb'],
  table_header_background: ['#151515', ' #fafafa'],
  table_header_color: ['#fff', ' #666'],
  docute_select_height: ['38px', ' 38px'],
  search_icon_color: ['#999', ' #999'],
  search_focus_border_color: ['#ccc', ' #ccc'],
  search_focus_icon_color: ['#333', ' #333'],
  search_result_hover_background: ['#f9f9f9', ' #f9f9f9'],
  code_font: [
    "'Montserrat', Consolas, Liberation Mono, Menlo, Courier, monospace"
  ]
}

@Component({
  name: 'CodeStructure'
})
// @vuese
// @group VIEWS
export default class CodeStructure extends Vue {
  iframe: HTMLIFrameElement | null = null
  iframeDefaultHead = ''

  getStyle (): string {
    const root = `:root{${Object.keys(theme)
      .map(key => {
        const name = key.replaceAll('_', '-')
        const k = key as keyof typeof theme
        const i = this.$vuetify.theme.dark ? 0 : 1 % theme[k].length
        const value = theme[k][i]
        return `--${name}:${value};`
      })
      .join('')}}`
    const scroll = '::-webkit-scrollbar{width: 4px;}'
    const thumb = '::-webkit-scrollbar-thumb {background: var(--accent-color);}'
    return `${root}${scroll}${thumb}`
  }

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
    this.iframe.contentDocument.head.innerHTML =
      this.iframeDefaultHead +
      `<style type="text/css">${this.getStyle()}"></style>`
  }
}
</script>
