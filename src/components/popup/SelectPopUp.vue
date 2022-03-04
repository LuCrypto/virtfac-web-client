<template>
  <v-dialog v-model="show" @validated="() => true" max-width="800px">
    <v-card>
      <!-- Header -->
      <v-toolbar color="primary" flat>
        <v-toolbar-title class="black--text">
          <v-icon left v-text="'mdi-format-list-checks'"></v-icon>
          Select Item
        </v-toolbar-title>
      </v-toolbar>

      <!-- Content -->
      <v-card :height="this.isMobileView ? 470 : undefined">
        <v-list-item
          v-for="(menuItem, i) in menuItemList"
          :key="i"
          class="justify-start"
          @click.stop="menuItem.action"
        >
          <v-list-item-content>
            <v-list-item-title v-text="menuItem.text"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-layout justify-center>
          <v-flex xs6>
            <v-btn
              align-center
              class="black--text"
              color="primary"
              @click="cancel"
              >Cancel</v-btn
            >
          </v-flex>
        </v-layout>
      </v-card>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

class MenuItem {
  text: string
  action: () => void
  constructor (text: string, action: () => void) {
    this.text = text
    this.action = action
  }
}

@Component
export default class SelectPopUp extends Vue {
  menuItemList: MenuItem[] = []
  callback: { (selected: unknown | null): void } | null = null
  show = false

  cancel () {
    (this.callback as { (selected: unknown | null): void })(null)
    this.show = false
  }

  public open (
    options: { text: string; return: unknown }[],
    selectCallback: { (selected: unknown | null): void }
  ) {
    this.callback = selectCallback
    this.menuItemList = []
    options.forEach(item => {
      this.menuItemList.push(
        new MenuItem(item.text, () => {
          selectCallback(item.return)
          this.show = false
        })
      )
    })
    /*
    this.menuItemList.push(
      new MenuItem('Cancel', () => {
        selectCallback(null)
        this.show = false
      })
    )
    */
    this.show = true
  }

  /* Getters */
  get isMobileView (): boolean {
    return this.$vuetify.breakpoint.smAndDown
  }
}
</script>
