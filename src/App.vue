<template>
  <v-app :style="this.transparency ? 'background-color: transparent;' : ''">
    <div v-if="!this.fullpage">
      <nav-bar></nav-bar>
      <v-main>
        <router-view></router-view>
      </v-main>
    </div>
    <div v-else>
      <router-view></router-view>
    </div>
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
}
</script>
