<template>
  <v-container class="home" fluid>
    <v-card elevation="3" class="pa-6" >
      <div class="external-content" ref="content"></div>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class Home extends Vue {
  url = 'http://192.168.0.15:1337/web-content'
  dom: HTMLElement | null = null
  mounted (): void {
    this.dom = this.$refs.content as HTMLElement
    this.load()
  }

  load (): void {
    fetch(this.url).then((response) => {
      response.text().then((body) => {
        const bodyDom:HTMLElement = document.createElement('div')
        bodyDom.innerHTML = body
        const contentDom:HTMLElement = bodyDom.querySelector('#mw-content-text') as HTMLElement
        const content = contentDom.innerHTML
        if (this.dom != null) {
          this.dom.innerHTML = content
          console.log(this.dom)
          this.dom.classList.add('visible')
          console.log(this.dom)
        }
      })
    })
  }

  isLoaded (content: string):void {
    console.log(content)
  }
}
</script>
