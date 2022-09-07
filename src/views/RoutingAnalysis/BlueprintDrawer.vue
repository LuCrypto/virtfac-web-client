<template>
  <v-container class="spacing-playground pa-6 contradiction-analysis d-flex flex-column" fluid>
    <v-card elevation="3" class="mb-6">
      <v-card-title>Blueprint Editor</v-card-title>
      <v-card-subtitle
        >Tool for drawing building plan and export it in 3D</v-card-subtitle
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
export default class BlueprintDrawer extends Vue {}
</script>
