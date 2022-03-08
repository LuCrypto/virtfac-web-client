<template>
  <v-container fluid class="d-flex">
    <v-card class="pa-6 ma-6">
      <v-img height="400" src="../../assets/ergonom_io_3.png"></v-img>
      <v-card-text>
        The assets page is not yet functional. This tool allows the upload of 3d
        files (such as CAD files or blender files) for addition to the object
        library. This library will then allow the creation of a virtual twin in
        the ErgonomIO application from scratch.
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class ErgonomIOAssets extends Vue {}
</script>
