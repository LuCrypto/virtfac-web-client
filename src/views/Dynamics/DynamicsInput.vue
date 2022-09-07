<template>
  <v-container fluid class="d-flex flex-column">
    <v-col class="flex-grow-0">
      <v-card flat class="flex-grow-1">
        <v-card-title>Dynamics inputs</v-card-title>
        <v-card-subtitle
          >This tool allows you to upload dynamics simulation files from
          Witness, PlantSimulation or Sympy. These files are then used for
          example by the routing analysis tool.</v-card-subtitle
        >
      </v-card>
    </v-col>
    <v-col class="flex-grow-1" style="overflow-y: auto;">
      <open-file
        style="height: 100%;"
        application="DYNAMICS_INPUT"
        :header="false"
      ></open-file
    ></v-col>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import OpenFile from '@/components/OpenFile.vue'

@Component({
  name: 'DynamicsInput',
  components: {
    OpenFile
  }
})
// @vuese
// @group VIEWS
export default class DynamicsInput extends Vue {}
</script>
