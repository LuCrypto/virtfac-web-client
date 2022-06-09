<template>
  <v-container
    fluid
    class="d-flex flex-wrap pt-6 pl-6"
    style="max-height: 100%; overflow: auto;"
  >
    <pdf
      ref="pdf"
      src="Guide3_AvecLien.pdf"
      @loaded="loaded"
      @link-clicked="linkIsClicked"
    ></pdf>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import pdf from 'vue-pdf'

interface Page {
  objs: unknown
}

@Component({
  name: 'HelpEditor',
  components: {
    pdf
  }
})
// @vuese
// @group VIEWS
export default class HelpEditor extends Vue {
  pdfJSWrapper: pdf | null = null

  mounted (): void {
    this.pdfJSWrapper = this.$refs.pdf as pdf
    console.log('mounted')
  }

  linkIsClicked (n: number): void {
    console.log('link is clicked : ', n)
  }

  loaded () {
    if (this.pdfJSWrapper) {
      this.pdfJSWrapper.pdf.forEachPage((page: Page) => console.log(page))
    }
  }
}
</script>
