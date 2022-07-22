<template>
  <v-container class="spacing-playground pa-6 contradiction-analysis d-flex flex-column" fluid>
    <v-card elevation="3" class="mb-6">
      <v-card-title>Routing Analysis</v-card-title>
      <v-card-subtitle
        >Routing analysis using algorithmic operations related to graph
        management.</v-card-subtitle
      >
    </v-card>
    <routing-analysis-component></routing-analysis-component>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import RoutingAnalysisComponent from '@/components/RoutingAnalysisComponent.vue'

@Component({
  name: 'DrawingShop',
  components: {
    RoutingAnalysisComponent
  }
})
// @vuese
// @group VIEWS
export default class DrawingShop extends Vue {}
</script>
