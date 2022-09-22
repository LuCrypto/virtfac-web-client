<template>
  <v-container class="spacing-playground pa-6 contradiction-analysis" fluid>
    <v-card elevation="3" class="mx-auto mb-6 flex-grow-1">
      <v-card-title>Ergonom.io Profiles Manager</v-card-title>
      <v-card-subtitle>Profiles Manager webMenu for Ergonom.io</v-card-subtitle>
    </v-card>
    <AvatarManager></AvatarManager>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import AvatarManager from '@/components/AvatarManager.vue'

@Component({
  name: 'ErgonomIOAsset',
  components: {
    AvatarManager
  }
})

// @vuese
// @group VIEWS
export default class ErgonomIOWebMenuAvatarsManager extends Vue {}
</script>
