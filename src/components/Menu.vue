<style scoped>
.selected {
  box-shadow: inset 0 0 0 3px white;
}
</style>

<template>
  <v-container fluid class="d-flex flex-column">
    <v-row class="flex-grow-0 pa-2 justify-center">
      <v-btn
        v-for="(childMenu, childIndex) in mainMenu.items[mainMenu.selected]
          .items"
        :key="childIndex"
        class="mx-2 black--text"
        fab
        small
        :color="childMenu.type === 'COLOR' ? childMenu.value : 'primary'"
        :class="
          mainMenu.items[mainMenu.selected].selected === childIndex
            ? 'selected'
            : ''
        "
        @click="
          mainMenu.items[mainMenu.selected].selected = childIndex
          update()
        "
      >
        <v-icon dark>
          {{ childMenu.type === 'ICON' ? childMenu.value : '' }}
        </v-icon>
      </v-btn>
    </v-row>
    <v-row class="flex-grow-0 pa-2 justify-center">
      <v-btn
        v-for="(parentMenu, parentIndex) in mainMenu.items"
        :key="parentIndex"
        class="mx-2 black--text"
        fab
        small
        :color="parentMenu.type === 'COLOR' ? parentMenu.value : 'primary'"
        :class="mainMenu.selected === parentIndex ? 'selected' : ''"
        @click="
          mainMenu.selected = parentIndex
          update()
        "
      >
        <v-icon dark>
          {{ parentMenu.type === 'ICON' ? parentMenu.value : '' }}
        </v-icon>
      </v-btn>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

type MenuItemType = 'ICON' | 'COLOR'

class MenuItem {
  selected = 0
  type: MenuItemType = 'ICON'
  value = ''
  items: MenuItem[] = []

  constructor (value = '', type: MenuItemType = 'ICON', items: MenuItem[] = []) {
    this.type = type
    this.items = items
    this.value = value
  }
}

@Component
// @vuese
// @group VIEWS
export default class DynamicsInput extends Vue {
  mainMenu = new MenuItem('', 'ICON', [
    new MenuItem('mdi-minus', 'ICON', [
      new MenuItem('mdi-car-settings'),
      new MenuItem('mdi-file-import-outline'),
      new MenuItem('mdi-pliers'),
      new MenuItem('mdi-shark-fin'),
      new MenuItem('mdi-card-account-details-star-outline')
    ]),
    new MenuItem('mdi-heart', 'ICON', [
      new MenuItem('#F09C70', 'COLOR'),
      new MenuItem('#E89368', 'COLOR'),
      new MenuItem('#E08C60', 'COLOR'),
      new MenuItem('#D88358', 'COLOR'),
      new MenuItem('#C87448', 'COLOR'),
      new MenuItem('#A25E3A', 'COLOR'),
      new MenuItem('#8F5333', 'COLOR'),
      new MenuItem('#7C482C', 'COLOR'),
      new MenuItem('#693D26', 'COLOR'),
      new MenuItem('#57321F', 'COLOR')
    ]),
    new MenuItem('mdi-plus', 'ICON', [
      new MenuItem('mdi-cellphone-off'),
      new MenuItem('mdi-sim-alert'),
      new MenuItem('mdi-airplane-plus')
    ]),
    new MenuItem('mdi-format-list-bulleted-square', 'ICON', [
      new MenuItem('mdi-folder'),
      new MenuItem('mdi-moped-electric'),
      new MenuItem('mdi-checkbox-blank-circle'),
      new MenuItem('mdi-checkerboard'),
      new MenuItem('mdi-solid'),
      new MenuItem('mdi-checkbox-marked'),
      new MenuItem('mdi-glass-wine'),
      new MenuItem('mdi-tag-arrow-left'),
      new MenuItem('mdi-arrow-right-top-bold')
    ])
  ])

  update () {
    console.log('Main menu is updated.')
  }
}
</script>
