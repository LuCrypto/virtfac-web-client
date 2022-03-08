<template>
  <v-container fluid>
    <v-card flat>
      <v-img height="400" src="../../assets/ergonom_io.png"></v-img>
      <v-card-title>Contradiction analysis by simulation approach</v-card-title>
      <v-card-subtitle
        >An application for the analysis of contradictions by an automatic
        method. This method, in contrast to the "expert" approach, allows for
        faster processing of complex analysis cases.</v-card-subtitle
      >
      <v-card-text>
        <v-btn
          depressed
          color="primary"
          class="black--text"
          href="https://seafile.unistra.fr/f/ba6913e0805e4304aaa5/?dl=1"
          download
        >
          Download Contradiction Analysis
        </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
@Component
export default class ContradictionAnalysisSimulation extends Vue {
  mounted (): void {
    console.log('Hello Ergonom.io')
  }
}
</script>
