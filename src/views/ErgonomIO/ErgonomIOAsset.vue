<template>
  <v-container class="spacing-playground pa-6 contradiction-analysis" fluid>
    <v-card elevation="3" class="mx-auto mb-6 flex-grow-1">
      <v-card-title>Ergonom.io Asset</v-card-title>
      <v-card-subtitle>Asset editing tool for ergonom.io</v-card-subtitle>
    </v-card>
    <ErgonomIOAssetContainer></ErgonomIOAssetContainer>
  </v-container>
</template>

<script lang="ts">
import AvatarAnimationComponent from '@/components/ErgonomicsAnalysisComponent.vue'
import ErgonomIOAssetContainer from '@/components/ErgonomIOAssetContainer.vue'
import { Component, Vue } from 'vue-property-decorator'
@Component({
  components: {
    ErgonomIOAssetContainer
  }
})
export default class ErgonomIOAsset extends Vue {
  mounted (): void {
    console.log('Ergonom.io asset view.')
  }
}
</script>
