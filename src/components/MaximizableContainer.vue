<template>
  <v-container
    class="d-flex flex-row flex-grow-1 ma-0 pa-0"
    fluid
    :style="
      fullscreen
        ? 'height:100%; position:absolute; width:100%; left:0px; top:0px; max-width:none'
        : 'position:relative'
    "
  >
    <v-btn
      @click="
        () => {
          fullscreen = !fullscreen
        }
      "
      icon
      style="position: absolute; z-index: 2; right: 0px; top: 0px; z-index:100"
      ><v-icon>{{
        fullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'
      }}</v-icon></v-btn
    >
    <slot></slot>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
  name: 'MaximizableContainer'
})
// @vuese
// @group COMPONENTS
export default class MaximizableContainer extends Vue {
  fullscreen = false
}
</script>
