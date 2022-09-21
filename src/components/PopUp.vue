<style>
.expand {
  height: 90%;
}
</style>

<template>
  <v-dialog v-model="isOpen" :content-class="expand ? 'expand' : ''">
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
  @Prop({ default: () => false }) expand!: boolean

  isOpen = false

  open (): void {
    this.isOpen = true
  }

  close (): void {
    this.isOpen = false
  }
}
</script>
