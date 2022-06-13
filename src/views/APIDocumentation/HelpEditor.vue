<template>
  <v-container
    fluid
    class="d-flex flex-wrap pt-6 pl-6"
    style="max-height: 100%; overflow: auto;"
  >
    <!-- <pdf
      ref="pdf"
      src="Guide3_AvecLien.pdf"
      @load="loaded"
      @link-clicked="linkIsClicked"
    ></pdf> -->
    <pdf
      src="Guide3_AvecLien.pdf"
      :page="1"
      ref="pdf"
      :annotation="true"
      @link-clicked="handlePdfLink"
    ></pdf>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
// import pdf from 'vue-pdf'
import pdfvuer from 'pdfvuer'
import { nextTick } from 'vue/types/umd'

interface PDF {
  numPages: number
}

@Component({
  name: 'HelpEditor',
  components: {
    pdf: pdfvuer
  }
})
// @vuese
// @group VIEWS
export default class HelpEditor extends Vue {
  pdfData: Promise<PDF> | undefined = undefined
  isLoaded = false
  tick = 0

  mounted (): void {
    console.log('mounted')
    this.parseLinksOnceLoaded()
  }

  parseLinksOnceLoaded () {
    const pdf = this.$refs.pdf as pdfvuer
    if (pdf) {
      const links = [
        ...this.$el.querySelectorAll('.page a')
      ] as HTMLLinkElement[]
      if (links.length) {
        this.parsePDFLinks(links)
        return
      }
    }
    if (this.tick++ < 1000) {
      requestAnimationFrame(() => this.parseLinksOnceLoaded())
    }
  }

  parsePDFLinks (links: HTMLLinkElement[]) {
    links
      .filter(link => !link.classList.contains('internalLink'))
      .filter(link => {
        const url = new URL(link.href)
        return url.origin === 'http://localhost'
      })
      .forEach((link: HTMLLinkElement) => {
        const action = link.href
        link.href = '#'
        link.setAttribute('target', '')
        // TODO : Disable link action and replace it by function
        link.onclick = () => console.log('Action :', action)
      })
  }

  handlePdfLink (param: unknown) {
    console.log('link', param)
  }
}
</script>
