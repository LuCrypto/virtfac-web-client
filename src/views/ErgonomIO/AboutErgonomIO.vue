<template>
  <v-container fluid class="d-flex pa-0">
    <iframe v-if="page" class="flex-grow-1 fill-height" :src="page"></iframe>
    <div v-else>No page to display</div>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({
  name: 'AboutErgonomIO'
})
// @vuese
// @group VIEWS
export default class AboutErgonomIO extends Vue {
  page = 'http://10.244.77.203/about-ergonom-io'
}
</script>
