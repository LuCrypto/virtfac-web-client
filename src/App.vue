<template>
  <v-app
    :class="fullpage ? 'fullpage' : ''"
    ref="app"
    :style="{
      width: `${this.size.x / this.zoom}px`,
      height: `${this.size.y / this.zoom}px`,
      background: this.transparency ? 'transparent' : '',
      opacity: opacity,
      transition: 'opacity ease-out 0.2s'
    }"
  >
    <!-- Display or not vue in fullpage -->
    <nav-bar v-if="!this.fullpage"></nav-bar>
    <v-main style="background-color: transparent;">
      <router-view style="background-color: transparent;"></router-view>
    </v-main>

    <!-- Global bottom message -->
    <v-snackbar v-model="snackbarShow" :timeout="-1">
      {{ snackbarText }}

      <template v-slot:action="{ attrs }">
        <v-btn
          color="primary"
          text
          v-bind="attrs"
          @click="snackbarShow = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import VueRouter from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import Unreal from '@/utils/unreal'

@Component({
  name: 'App',
  components: {
    NavBar
  }
})
// @vuese
// @group MAIN
export default class App extends Vue {
  router: VueRouter = this.$router
  query = this.router.currentRoute.query
  fullpage: boolean = this.query.fullpage === 'true'
  transparency: boolean = this.query.transparency === 'true'
  snackbarShow = false
  lastSnackBarCall = 0
  snackbarTime = 8000
  snackbarText = ''
  zoom = 1
  size = {
    x: 0,
    y: 0
  }

  opacity = 0

  scrollbarWidth = 40

  mounted () {
    this.opacity = 1
    // Unreal Engine handler
    window.addEventListener('resize', () => this.resize())
    this.resize()

    // Global botom message handler
    this.$root.$on('bottom-message', (message: string) => {
      this.snackbarShow = true
      const snackBarCall = Date.now()
      this.lastSnackBarCall = snackBarCall
      this.snackbarText = message
      setTimeout(() => {
        if (snackBarCall === this.lastSnackBarCall) {
          this.snackbarShow = false
        }
      }, this.snackbarTime)
    })

    // User disconnection handler
    this.$root.$on('user-disconnection', () => {
      Vue.prototype.$globals.set('user', undefined)
    })

    // Reload page handler
    this.$root.$on('reload', (to: any) => {
      this.opacity = 0
      window.location = to.path
    })
    // Init Unreal
    Unreal.getResolution().then((resolution: number) => {
      // this.$root.$emit(
      //   'bottom-message',
      //   'Resolution from unreal : ' + resolution
      // )
      const body = document.querySelector('body')
      if (body) {
        body.setAttribute('style', `zoom: ${resolution};`)
      }
      this.zoom = resolution
    })

    this.$root.$emit(
      'bottom-message',
      `Unreal context is ${Unreal.check() ? '' : 'not'} detected.`
    )

    if (Unreal.check()) {
      Unreal.send('Virtfac web is connected')
    }
  }

  resize (): void {
    this.size.x = window.innerWidth
    this.size.y = window.innerHeight
  }
}
</script>
