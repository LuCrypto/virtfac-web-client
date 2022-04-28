<template>
  <v-dialog v-model="isOpen">
    <slot></slot>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class PopUp extends Vue {
  isOpen = false

  open (): void {
    this.isOpen = true
  }

  close (): void {
    this.isOpen = false
  }
}
</script>
