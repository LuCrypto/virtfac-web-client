<template>
  <v-container
    style="position:relative; margin: 0px; width:100%; height:100%; padding: 0px;"
    fluid
    class="d-flex flex-row"
  >
    <v-navigation-drawer
      v-if="!displayAll"
      ref="nav"
      stateless
      permanent
      :mini-variant="menuCollapse"
      style="min-width:53"
      :disable-resize-watcher="true"
      :disable-roote-watcher="true"
    >
      <v-list
        nav
        dense
        class="d-flex flex-column justify-start;"
        style="height: 100%"
        ><v-list-item-group v-model="selectedCategory" color="primary">
          <v-list-item
            v-for="(category, i) in categories"
            v-bind:key="i"
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
      <v-container class="mt-8 mb-8 d-flex" style="position: relative;">
        <v-row
          v-if="selectedCategory >= 0"
          style="position:absolute; overflow-y: scroll; top: 6px; left: 6px; right: 6px; bottom: 6px;"
          class="ma-0 pa-0"
          ref="row"
        >
          <v-col
            :cols="colSize"
            v-for="asset in content.get(
              categories[Math.max(selectedCategory, 0)].name
            )"
            v-bind:key="asset.id"
            class="ma-0 pa-0"
          >
            <v-container
              class="ma-0 d-flex"
              style="min-width:128px; min-height:128px; aspect-ratio: 1;"
            >
              <v-hover v-slot="{ hover }">
                <v-card
                  :elevation="hover ? 4 : 2"
                  height="100%"
                  width="100%"
                  :img="asset.picture"
                  style="position:relative"
                  @click="onSelect(asset.id)"
                >
                </v-card
              ></v-hover>
            </v-container>
          </v-col>
        </v-row>
      </v-container>
      <v-chip
        v-if="false"
        style="position: absolute; right: 6px; bottom: 6px; z-index:100;"
        class="pa-0 primary black--text"
        small
      >
        <v-btn icon :disabled="currentPage === 1" @click.stop="previousPage()"
          ><v-icon>{{ 'mdi-chevron-left' }}</v-icon></v-btn
        >
        <v-chip
          class=""
          left
          style="min-width:80px; display: block; text-align: center;"
          >{{ currentPage + ' / ' + nbPages }}</v-chip
        >
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
  private content!: Map<string, { name: string; id: number }[]>

  @Prop({
    default: () => () => {
      /**/
    }
  })
  private onSelect!: {
    (id: number): void
  }

  private menuCollapse = false

  private nbPages = 5
  private currentPage = 1
  private colSize = 1

  private hello () {
    console.log('hello')
  }

  private previousPage () {
    // console.log(this.content[this.categories[this.selectedCategory].name])
    this.currentPage--
  }

  private nextPage () {
    this.currentPage++
  }

  selectedCategory = -1
  listener = () => {
    const row = (this.$refs.row as Element).getBoundingClientRect()
    const nbcol = row.width / 129
    this.colSize = Math.min(Math.max(Math.ceil(12 / nbcol), 1), 12)
  }

  private displayAll = false

  mounted (): void {
    console.log('Asset Lib mounted')
    addEventListener('resize', () => {
      try {
        const row = (this.$refs.row as Element).getBoundingClientRect()
        const nbcol = row.width / 129
        this.colSize = Math.min(Math.max(Math.ceil(12 / nbcol), 1), 12)
      } catch (er) {
        //
      }
      console.log(this.content, this.categories)
    })
    if (this.categories.length === 1 && this.categories[0].name === '') {
      this.displayAll = true
      this.selectedCategory = 0
    }
  }

  unmounted () {
    console.log('Asset Lib unmounted')
  }

  updated () {
    try {
      const row = (this.$refs.row as Element).getBoundingClientRect()
      const nbcol = row.width / 129
      this.colSize = Math.min(Math.max(Math.ceil(12 / nbcol), 1), 12)
    } catch (er) {
      console.warn(er)
    }
    console.log('updated')
  }

  public forceUpdateRender () {
    this.menuCollapse = false
    this.$forceUpdate()

    requestAnimationFrame(() => {
      try {
        const row = (this.$refs.row as Element).getBoundingClientRect()
        const nbcol = row.width / 129
        this.colSize = Math.min(Math.max(Math.ceil(12 / nbcol), 1), 12)
      } catch (er) {
        console.warn(er)
      }
    })
  }
}
</script>
