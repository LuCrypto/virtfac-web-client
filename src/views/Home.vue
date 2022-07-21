<template>
  <v-container fluid class="d-flex pa-0">
    <iframe v-if="page" class="flex-grow-1 fill-height" :src="page"></iframe>
    <div v-else>No page to display</div>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import VueRouter from 'vue-router'

@Component({
  name: 'Home'
})
// @vuese
// @group VIEWS
export default class Home extends Vue {
  base = 'http://10.244.77.203/'
  page: string | (string | null)[] = ''

  mounted (): void {
    const router: VueRouter = this.$router
    this.page = `${this.base}`
    console.log('hello home', router.currentRoute.query)
  }
}
</script>
