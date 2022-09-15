<template>
  <v-container
    style="position:relative; margin: 0px; width:100%; height:100%; padding: 0px;"
    fluid
    class="d-flex flex-row"
  >
    <v-navigation-drawer
      stateless
      permanent
      :mini-variant="menuCollapse"
      style="min-width:53"
    >
      <v-list
        nav
        dense
        class="d-flex flex-column justify-start;"
        style="height: 100%"
        ><v-list-item-group v-model="selectedCategory" color="primary">
          <v-list-item
            v-for="(category, i) in categories"
            :key="i"
            class="justify-start"
          >
            <v-list-item-icon>
              <v-icon v-text="category.icon"></v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text="category.name"></v-list-item-title>
            </v-list-item-content> </v-list-item></v-list-item-group
        ><v-list-item-group class="mt-auto">
          <v-list-item
            class="justify-start"
            @click="menuCollapse = !menuCollapse"
          >
            <v-list-item-icon>
              <v-icon v-if="menuCollapse" v-text="'mdi-arrow-right'"></v-icon>
              <v-icon v-if="!menuCollapse" v-text="'mdi-arrow-left'"></v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text="'Category labels'"></v-list-item-title>
            </v-list-item-content>
          </v-list-item> </v-list-item-group
      ></v-list>
    </v-navigation-drawer>
    <v-container fluid class="d-flex pa-0">
      <v-container class="mt-8 mb-8"></v-container>
      <v-chip
        style="position: absolute; right: 6px; bottom: 6px; z-index:100;"
        class="pa-0 primary black--text"
        small
      >
        <v-btn icon :disabled="currentPage === 1" @click.stop="previousPage()"
          ><v-icon>{{ 'mdi-chevron-left' }}</v-icon></v-btn
        >
        <v-chip class="" left style="min-width:80px; display: block; text-align: center;">{{ currentPage + ' / ' + nbPages }}</v-chip>
        <v-btn icon :disabled="currentPage === nbPages" @click.stop="nextPage()"
          ><v-icon>{{ 'mdi-chevron-right' }}</v-icon></v-btn
        >
      </v-chip>
    </v-container>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'

import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

@Component({
  name: 'BlueprintEditor',
  props: {
    // placementFunction: Function as PropType<(g: Graph) => void>
  }
})
// @vuese
// @group COMPONENTS
// Content of the DrawingShopComponent
export default class AssetLibrary extends Vue {
  @Prop({ default: () => [] }) private categories!: {
    name: string
    icon: string
  }[]

  @Prop({ default: () => new Map<string, { name: string; id: number }[]>() })
  private contents!: Map<string, { name: string; id: number }[]>

  private menuCollapse = false

  viewedItems = [
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    ''
  ].map((v, i) => {
    return { name: 'item ' + i, id: i }
  })

  private nbPages = 5
  private currentPage = 1

  private previousPage () {
    this.currentPage--
  }

  private nextPage () {
    this.currentPage++
  }

  selectedCategory = 0

  private selectCategory (name: string) {
    console.log(name)
  }

  mounted (): void {
    //
  }
}
</script>
