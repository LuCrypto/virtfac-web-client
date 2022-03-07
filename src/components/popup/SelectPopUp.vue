<template>
  <v-dialog v-model="show" @validated="() => true">
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
        <!--
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
        -->
        <v-container
          fluid
          style="height: 100%; max-height: 100%"
          class="overflow-y-auto"
        >
          <v-layout row>
            <v-data-table
              class="elevation-0 flex-grow-1"
              :headers="headers"
              :items="items"
              :key="refreshTableKey"
              item-key="id"
              :show-select="false"
              :single-select="true"
              @click:row="returnSelectedRow"
            ></v-data-table>
          </v-layout>
          <v-layout justify-center>
            <v-card>
              <v-btn
                align-center
                class="black--text"
                color="primary"
                @click="cancel"
                >Cancel</v-btn
              >
            </v-card>
          </v-layout>
        </v-container>
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
  refreshTableKey = 0

  items: unknown[] = []
  headers: {
    text: string
    value: string
    align: string
    sortable: boolean
    sort: { (a: unknown, b: unknown): number }
  }[] = []

  cancel () {
    (this.callback as { (selected: unknown | null): void })(null)
    this.show = false
  }

  public open (
    headers: {
      text: string
      value: string
      align: string
      sortable: boolean
      sort: { (a: unknown, b: unknown): number }
    }[],
    items: unknown[],
    callback: { (item: unknown): void }
  ) {
    this.headers = headers
    this.items = items
    this.callback = callback
    this.show = true
  }
  /*
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
    this.show = true
  }
  */

  /* Getters */
  get isMobileView (): boolean {
    return this.$vuetify.breakpoint.smAndDown
  }

  // Toggle row selection on click
  returnSelectedRow (
    _item: unknown,
    row: {
      expand: (value: boolean) => void
      headers: unknown[]
      isExpanded: boolean
      isMobile: boolean
      isSelected: boolean
      item: unknown
      select: (value: boolean) => void
    }
  ): void {
    if (this.callback != null) this.callback(row.item)
    this.show = false
  }
}
</script>
