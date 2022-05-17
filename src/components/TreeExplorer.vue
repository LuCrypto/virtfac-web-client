<template>
  <v-container fluid class="d-flex flex-column" style="height: 100%;">
    <v-container fluid class="d-flex flex-row pa-0">
      <v-btn @click="toParent()" class="flex-grow-1 mr-2"
        ><v-icon>mdi-keyboard-backspace</v-icon></v-btn
      >
      <v-select
        :label="parentLabel"
        :placeholder="parentLabel"
        persistent-placeholder
        @change="selectParent"
        class="flex-grow-1"
        :items="parents"
        item-text="name"
        item-value="key"
        single-line
        dense
      ></v-select>
    </v-container>
    <v-container class="flex-grow-1 pa-0" style="overflow: auto;">
      <!-- <v-row no-gutters v-for="item in citems" v-bind:key="item.id">
        <v-chip style="width:100%" label dense @click="selectItem(item.key)">{{
          item.name
        }}</v-chip>
      </v-row> -->
      <v-simple-table dense>
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">
                Name
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in citems" v-bind:key="item.id">
              <td
                @mouseenter="onEnterItem(item.key)"
                @mouseleave="onLeaveItem(item.key)"
              >
                <v-btn
                  icon
                  v-if="item.hasChildren"
                  @click="selectItem(item.key)"
                  ><v-icon>mdi-chevron-right</v-icon></v-btn
                >
                {{ item.name }}
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-container>
  </v-container>
</template>

<script lang="ts">
import API from '@/utils/api'
import { APIAsset } from '@/utils/models'
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import { set } from 'vue/types/umd'

class Item {
  key: unknown | null
  id: number
  name: string
  children: Item[]

  constructor (id: number, name: string, key: unknown | null = null) {
    this.id = id
    this.name = name
    this.children = []
    this.key = key
  }

  public appendChild (item: Item) {
    this.children.push(item)
  }
}

@Component({})
export default class TreeExplorer extends Vue {
  parentLabel = 'root'
  objectMap = new Map<unknown | null, Item>()
  id = 0

  private citems: {
    id: number
    key: unknown
    name: string
    hasChildren: boolean
  }[] = []

  private parents: {
    id: number
    key: unknown
    name: string
    hasChildren: boolean
  }[] = []

  private isMobileView = false

  public addItem (ref: unknown, name: string, parent: unknown | null) {
    const item = new Item(this.id++, name, ref)
    this.objectMap.set(ref, item)
    ;(this.objectMap.get(parent) as Item).children.push(item)
  }

  public get items () {
    console.log(this.objectMap.get(null))
    return (this.objectMap.get(null) as Item).children
  }

  mounted (): void {
    this.objectMap.set(null, new Item(0, 'root'))
  }

  public clear () {
    this.objectMap = new Map<unknown | null, Item>()
    this.objectMap.set(null, new Item(0, 'root'))
  }

  public refresh () {
    this.citems = []
    ;(this.objectMap.get(null) as Item).children.forEach(it => {
      this.citems.push({
        id: it.id,
        key: it.key,
        name: it.name,
        hasChildren: it.children.length > 0
      })
    })
  }

  public selectParent (key: unknown | null) {
    let maxGoback = 500
    while (maxGoback > 0 && this.parents[this.parents.length - 1].key !== key) {
      this.toParent()
      maxGoback--
    }

    if (
      this.parents.length > 0 &&
      this.parents[this.parents.length - 1] !== null
    ) {
      this.parentLabel = this.parents[this.parents.length - 1].name
    } else {
      this.parentLabel = 'root'
    }
  }

  public selectItem (key: unknown | null) {
    if ((this.objectMap.get(key) as Item).children.length > 0) {
      this.clearItems()
      ;(this.objectMap.get(key) as Item).children.forEach(it => {
        this.citems.push({
          id: it.id,
          key: it.key,
          name: it.name,
          hasChildren: it.children.length > 0
        })
      })
      const it = this.objectMap.get(key) as Item
      this.parents.push({
        id: it.id,
        key: key,
        name: it.name,
        hasChildren: it.children.length > 0
      })
    }
    if (
      this.parents.length > 0 &&
      this.parents[this.parents.length - 1] !== null
    ) {
      this.parentLabel = this.parents[this.parents.length - 1].name
    } else {
      this.parentLabel = 'root'
    }
  }

  public toParent () {
    this.parents.pop()
    const p = this.parents.pop()
    if (p === undefined) {
      this.selectItem(null)
    } else {
      this.selectItem(p.key)
    }
    /*
    if (
      this.parents.length > 0 &&
      this.parents[this.parents.length - 1] !== null
    ) {
      this.parentLabel = this.parents[this.parents.length - 1].name
    } else {
      this.parentLabel = 'root'
    }
    */
  }

  public clearItems () {
    this.citems.forEach(item => {
      this.$emit('onMouseLeaveItem', item.key)
    })
    this.citems = []
  }

  public onEnterItem (item: unknown) {
    this.$emit('onMouseEnterItem', item)
  }

  public onLeaveItem (item: unknown) {
    this.$emit('onMouseLeaveItem', item)
  }
}
</script>
