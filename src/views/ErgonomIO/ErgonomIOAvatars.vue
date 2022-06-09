<template>
  <v-container fluid class="d-flex">
    <v-card class="pa-6 ma-6">
      <v-img height="400" src="../../assets/ergonom_io_2.png"></v-img>
      <v-card-text>
        The avatars page is not yet functional. This tool will allow the
        creation of custom avatars, to allow users to have a virtual body that
        looks like them. The avatar tool will also allow users to save profiles
        for motion capture, taking into account their height and body type.
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({
  name: 'ErgonomIOAvatars'
})
// @vuese
// @group VIEWS
export default class ErgonomIOAvatars extends Vue {}
</script>
