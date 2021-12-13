<template>
  <v-card elevation="3" height="700" class="d-flex flex-row">
    <v-navigation-drawer stateless permanent :mini-variant="menuCollapse">
      <v-list nav dense class="d-flex flex-column justify-start;" style="height: 100%">
        <v-list-item-group v-model="selectedMenuItem" color="primary">
          <v-list-item v-for="(menuItem, i) in menuItemList" :key="i"
            class="justify-start" @click.stop="menuItem.action">
            <v-list-item-icon>
              <v-icon v-text="menuItem.icon"></v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text="menuItem.text"></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
        <v-list-item-group class="mt-auto">
          <v-list-item class="justify-start" @click="menuCollapse = !menuCollapse">
            <v-list-item-icon>
              <v-icon v-if="menuCollapse" v-text="'mdi-arrow-right'"></v-icon>
              <v-icon v-if="!menuCollapse" v-text="'mdi-arrow-left'"></v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text="'Menu labels'"></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>
    <v-container style="width: auto; margin: 0; flex-grow: 1;">
        <canvas ref="canvas"></canvas>
    </v-container>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

class MenuItem {
  text: string
  icon: string
  action: () => void
  constructor (text : string, icon: string, action: () => void) {
    this.text = text
    this.icon = icon
    this.action = action
  }
}

@Component
export default class AvatarAnimationComponent extends Vue {
  selectedMenuItem = -1
  menuCollapse = false
  menuItemList: MenuItem[] = []
  canvas: HTMLElement | null = null

  mounted (): void {
    this.menuItemList.push(new MenuItem('Open Axis Neuron BVH File', 'mdi-file-document', () => true))
    this.menuItemList.push(new MenuItem('Open Mixamo FBX File', 'mdi-file-document', () => true))
    this.menuItemList.push(new MenuItem('Display shape', 'mdi-graph-outline', () => true))
    this.menuItemList.push(new MenuItem('Settings', 'mdi-cog', () => true))
    this.menuItemList.push(new MenuItem('Download JSON File', 'mdi-download', () => true))
    this.menuItemList.push(new MenuItem('Download FBX File', 'mdi-download', () => true))

    this.canvas = this.$refs.canvas as HTMLElement
  }
}
</script>
