<template>
  <v-container class="d-flex flex-column spacing-playground pa-6 contradiction-analysis" fluid>
    <v-card elevation="3" class="mb-6">
      <v-card-title>Ergonom.io Asset</v-card-title>
      <v-card-subtitle>Asset editing tool for ergonom.io</v-card-subtitle>
    </v-card>
    <ErgonomIOAssetContainer></ErgonomIOAssetContainer>
  </v-container>
</template>

<script lang="ts">
import ErgonomIOAssetContainer from '@/components/ErgonomIOAssetContainer.vue'
import { Component, Vue } from 'vue-property-decorator'
@Component({
  name: 'ErgonomIOAsset',
  components: {
    ErgonomIOAssetContainer
  }
})

// @vuese
// @group VIEWS
export default class ErgonomIOAsset extends Vue {}
</script>
