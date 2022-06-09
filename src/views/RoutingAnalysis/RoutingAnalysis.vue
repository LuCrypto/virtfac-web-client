<template>
  <v-container class="spacing-playground pa-6 contradiction-analysis">
    <v-card elevation="3" class="mx-auto mb-6">
      <v-card-title>Routing Analysis</v-card-title>
      <v-card-subtitle
        >Routing analysis using algorithmic operations related to graph
        management.</v-card-subtitle
      >
    </v-card>
    <drawing-shop-component></drawing-shop-component>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import DrawingShopComponent from '@/components/DrawingShopComponent.vue'

@Component({
  name: 'DrawingShop',
  components: {
    DrawingShopComponent
  }
})
// @vuese
// @group VIEWS
export default class DrawingShop extends Vue {}
</script>
