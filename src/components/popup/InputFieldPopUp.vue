<template>
  <v-dialog v-model="show" @validated="() => true" max-width="800px">
    <v-card>
      <!-- Header -->
      <v-toolbar color="primary" flat>
        <v-toolbar-title class="black--text">
          <v-icon left v-text="'mdi-format-list-checks'"></v-icon>
          {{ title }}
        </v-toolbar-title>
      </v-toolbar>

      <!-- Content -->
      <v-container style="margin='10px'">
        <v-text-field
          v-model="text"
          ref="input"
          label="enter text"
          dense
          hide-details
          outlined
        ></v-text-field>
      </v-container>
      <v-card class="d-flex justify-center">
        <v-card style="margin-right:10px">
          <v-btn
            align-center
            class="black--text"
            color="primary"
            @click="Confirm"
            >Confirm</v-btn
          >
        </v-card>
        <v-card xs6>
          <v-btn
            align-center
            class="black--text"
            color="primary"
            @click="Cancel"
            >Cancel</v-btn
          >
        </v-card>
      </v-card>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
  name: 'InputFieldPopUp'
})
// @vuese
// @group COMPONENTS
export default class InputFieldPopUp extends Vue {
  show = false
  title = 'Input Field'
  placeHolder = 'Enter Text'
  text = ''
  callback: { (value: string | null): void } | null = null

  public open (
    title: string,
    placeHolder: string,
    defaultValue: string,
    callback: { (value: string | null): void }
  ): void {
    this.callback = callback
    this.text = defaultValue
    this.title = title
    this.placeHolder = placeHolder
    this.show = true
  }

  Cancel (): void {
    if (this.callback != null) this.callback(null)
    this.show = false
  }

  Confirm (): void {
    if (this.callback != null) this.callback(this.text)
    this.show = false
  }
}
</script>
