<template>
  <v-container
    class="spacing-playground pa-6 contradiction-analysis d-flex flex-column"
    fluid
  >
    <v-card elevation="3" class="mb-6">
      <v-card-title>{{
        $vuetify.lang.t('$vuetify.blueprintEditor.title')
      }}</v-card-title>
      <v-card-subtitle>{{
        $vuetify.lang.t('$vuetify.blueprintEditor.description')
      }}</v-card-subtitle>
    </v-card>
    <BlueprintEditorContainer></BlueprintEditorContainer>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import BlueprintEditorContainer from '@/components/BlueprintEditorContainer.vue'

@Component({
  name: 'BlueprintDrawer',
  components: {
    BlueprintEditorContainer
  }
})
// @vuese
// @group VIEWS
export default class BlueprintDrawer extends Vue {}
</script>
