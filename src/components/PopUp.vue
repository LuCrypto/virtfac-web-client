<template>
  <v-dialog v-model="isOpen" :width="width">
    <slot></slot>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({
  name: 'PopUp'
})
// @vuese
// @group COMPONENTS
export default class PopUp extends Vue {
  // @vuese
  // Application reference to select only compatible files
  @Prop({ default: () => '100%' }) private width!: string
  isOpen = false

  open (): void {
    this.isOpen = true
  }

  close (): void {
    this.isOpen = false
  }
}
</script>
