<template>
  <v-container class="spacing-playground pa-6 contradiction-analysis d-flex flex-column" fluid>
    <v-card elevation="3" class="mb-6">
      <v-card-title>Ergonom.io Avatars</v-card-title>
      <v-card-subtitle>Avatar custom tool for ergonom.io</v-card-subtitle>
    </v-card>
    <ErgonomIOAvatarsContainer></ErgonomIOAvatarsContainer>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import ErgonomIOAvatarsContainer from '@/components/ErgonomIOAvatarsContainer.vue'

@Component({
  name: 'ErgonomIOAsset',
  components: {
    ErgonomIOAvatarsContainer
  }
})

// @vuese
// @group VIEWS
export default class ErgonomIOAvatars extends Vue {}
</script>
