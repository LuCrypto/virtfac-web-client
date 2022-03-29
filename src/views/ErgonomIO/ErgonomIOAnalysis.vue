<template>
  <v-container class="spacing-playground pa-6 contradiction-analysis" fluid>
    <v-card elevation="3" class="mx-auto mb-6 flex-grow-1">
      <v-card-title>Ergonom.io Analysis</v-card-title>
      <v-card-subtitle>Analysis tool for ergonom.io</v-card-subtitle>
    </v-card>
    <avatar-animation-component></avatar-animation-component>
  </v-container>
</template>

<script lang="ts">
import AvatarAnimationComponent from '@/components/ErgonomicsAnalysisComponent.vue'
import { Component, Vue } from 'vue-property-decorator'
@Component({
  components: {
    AvatarAnimationComponent
  }
})
export default class ErgonomIOAnalysis extends Vue {
  mounted (): void {
    console.log('Ergonom.io Analysis view.')
  }
}
</script>
