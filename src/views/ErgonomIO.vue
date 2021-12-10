<template>
  <v-container class="spacing-playground pa-6 contradiction-analysis">
    <v-card elevation="3" class="mx-auto mb-6">
      <v-card-title>Ergonom.io</v-card-title>
      <v-card-subtitle>Analysis tool for ergonomics and flow visualisation in virtual reality</v-card-subtitle>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
@Component({})
export default class ErgonomIO extends Vue {
  mounted (): void {
    console.log('Hello Ergonom.io')
  }
}
</script>
