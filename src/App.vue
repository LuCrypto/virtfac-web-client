<template>
  <v-app :style="this.transparency ? 'background-color: transparent;' : ''">
    <!-- Display of not vue in fullpage -->
    <div v-if="!this.fullpage">
      <nav-bar></nav-bar>
      <v-main>
        <router-view></router-view>
      </v-main>
    </div>
    <div v-else>
      <router-view></router-view>
    </div>

    <!-- Global bottom message -->
    <v-snackbar v-model="snackbarShow" :timeout="snackbarTime">
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

@Component({
  components: {
    NavBar
  }
})
export default class App extends Vue {
  router: VueRouter = this.$router
  query = this.router.currentRoute.query
  fullpage: boolean = this.query.fullpage === 'true'
  transparency: boolean = this.query.transparency === 'true'
  snackbarShow = false
  snackbarTime = 2000
  snackbarText = ''

  mounted () {
    console.log(Vue.prototype.$globals)
    this.$root.$on('bottom-message', (message: string) => {
      this.snackbarShow = true
      this.snackbarText = message
    })
    this.$root.$on('user-disconnection', () => {
      Vue.prototype.$globals.set('user', undefined)
    })
  }
}
</script>
