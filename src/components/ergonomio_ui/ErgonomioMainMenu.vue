<template>
  <v-card elevation="3" class="ma-3 mb-6">
    <v-card-title>Ergonom.io</v-card-title>
    <v-card-subtitle
      >Voici un menu qui a pour but d'être utilisé ailleur</v-card-subtitle
    >
  </v-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
@Component({
  name: 'ErgonomioMainMenu'
})
// @vuese
// @group COMPONENTS
export default class ErgonomioMainMenu extends Vue {
  mounted (): void {
    console.log('Hello Ergonom.io')
  }
}
</script>
