<template>
  <v-container
    class="spacing-playground pa-6 contradiction-analysis d-flex flex-column"
    fluid
  >
    <v-card elevation="3" class="mb-6">
      <v-card-title>{{
        $vuetify.lang.t('$vuetify.constraintAnalysis.title')
      }}</v-card-title>
      <v-card-subtitle>{{
        $vuetify.lang.t('$vuetify.constraintAnalysis.description')
      }}</v-card-subtitle>
    </v-card>
    <contradiction-expert></contradiction-expert>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import ContradictionExpert from '@/components/ContradictionExpert.vue'

@Component({
  name: 'ContradictionAnalysisGraph',
  components: {
    ContradictionExpert
  }
})
// @vuese
// @group VIEWS
export default class ContradictionAnalysisGraph extends Vue {}
</script>
