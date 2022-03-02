<template>
  <v-container class="">
    <v-card elevation="3" class="">
      <v-card-title>Ergonom.io</v-card-title>
      <v-card-subtitle>3D viewer</v-card-subtitle>
    </v-card>
    <v-card>
      <v-list-item two-line>
        <v-list-item-content>
          <v-list-item-title>Two-line item</v-list-item-title>
          <v-list-item-subtitle>Secondary text</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-btn
        depressed
        color="primary"
        class="black--text"
        href="https://seafile.unistra.fr/f/bc3cbefe8b0548d29b0f/?dl=1"
        download
      >
        Download Ergonom.io
      </v-btn>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
@Component
export default class ErgonomIO extends Vue {
  mounted (): void {
    console.log('Hello Ergonom.io')
  }
}
</script>
