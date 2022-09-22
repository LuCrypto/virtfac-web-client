<template>
  <v-container fluid>
    <v-card flat>
      <v-img height="400" src="../../assets/ergonom_io.png"></v-img>
      <v-card-title>Ergonom.io</v-card-title>
      <v-card-subtitle
        >A virtual reality application to create virtual twins of entire
        factories, as if you were there.</v-card-subtitle
      >
      <v-card-text>
        <v-btn
          depressed
          color="primary"
          class="black--text"
          href="https://seafile.unistra.fr/f/bc3cbefe8b0548d29b0f/?dl=1"
          download
        >
          Download Ergonom.io
        </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
@Component({
  name: 'ErgonomIO'
})
// @vuese
// @group VIEWS
export default class ErgonomIO extends Vue {
  mounted (): void {
    console.log('Hello Ergonom.io')
  }
}
</script>
