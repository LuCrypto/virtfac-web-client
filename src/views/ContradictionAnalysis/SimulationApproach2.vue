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
        <h3>Download Contradiction Analysis tool :</h3>
        <div class="d-flex mt-4" style="gap: 16px; flex-wrap: wrap;">
          <v-btn
            depressed
            outlined
            color="primary"
            class="black--text flex-grow-1"
            href="https://seafile.unistra.fr/f/ba6913e0805e4304aaa5/?dl=1"
            download
          >
            Old version
          </v-btn>

          <v-btn
            depressed
            color="primary"
            class="black--text flex-grow-1"
            href="https://seafile.unistra.fr/f/9fa04647f6fc455191eb/?dl=1"
            download
          >
            New Version
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
@Component({
  name: 'ContradictionAnalysisSimulation'
})
// @vuese
// @group VIEWS
export default class ContradictionAnalysisSimulation extends Vue {
  mounted (): void {
    console.log('Hello Ergonom.io')
  }
}
</script>
