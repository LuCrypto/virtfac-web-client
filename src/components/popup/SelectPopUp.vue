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
            >
              <template v-if="isMenuActive" v-slot:[`item.actions`]="{ item }">
                <v-tooltip
                  bottom
                  v-for="action in menuItemList"
                  v-bind:key="action.text"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-avatar
                      color="primary"
                      class="ml-1 mt-1 mb-1 elevation-4"
                      size="30"
                      @click.stop="action.action(item)"
                      v-bind="attrs"
                      v-on="on"
                    >
                      <v-icon medium color="">
                        {{ action.icon }}
                      </v-icon>
                    </v-avatar>
                  </template>
                  <span>{{ action.text }}</span>
                </v-tooltip>
              </template>
            </v-data-table>
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
  icon: string
  action: (item: unknown) => void
  constructor (text: string, icon: string, action: (item: unknown) => void) {
    this.text = text
    this.action = action
    this.icon = icon
  }
}

@Component
export default class SelectPopUp extends Vue {
  menuItemList: MenuItem[] = []
  isMenuActive = false
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

  cancel (): void {
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
    callback: { (item: unknown): void },
    actions: MenuItem[] | null = null
  ): void {
    this.headers = headers
    this.items = items
    this.callback = callback
    this.show = true
    if (actions == null) {
      this.isMenuActive = false
    } else {
      this.isMenuActive = true
      this.menuItemList = actions
      this.headers.push({
        text: 'Actions',
        value: 'actions',
        align: 'end',
        sortable: false,
        sort: () => {
          return -1
        }
      })
      this.items.forEach(item => {
        (item as Record<string, unknown>).actions = actions
      })
    }
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
