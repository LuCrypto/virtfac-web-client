<template>
  <v-container class="spacing-playground pa-6 contradiction-analysis">
    <v-card elevation="3" class="mx-auto mb-6">
      <v-card-title>Contradiction Analysis</v-card-title>
      <v-card-subtitle
        >Contradiction analysis via a expert approach</v-card-subtitle
      >
    </v-card>
    <drawing-shop-component></drawing-shop-component>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import DrawingShopComponent from '@/components/DrawingShopComponent.vue'

@Component({
  components: {
    DrawingShopComponent
  }
})
export default class ContradictionAnalysisSimulation extends Vue {}
</script>
