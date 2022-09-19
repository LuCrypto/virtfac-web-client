<template>
  <v-container fluid class="d-flex flex-column ma-0 pa-0" style="height: 100%;">
    <v-container fluid class="d-flex flex-row pa-0">
      <v-btn @click="toParent()" class="flex-grow-1 mr-2 mt-1 ml-2" small fluid
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
          <!-- <thead>
            <tr>
              <th class="text-left" style="width:50px"></th>
              <th class="text-left"></th>
            </tr>
          </thead> -->
          <tbody>
            <tr
              v-for="item in citems"
              v-bind:key="item.id"
              @mouseenter="onEnterItem(item.key)"
              @mouseleave="onLeaveItem(item.key)"
              :class="{ active: selectedKey == item.key }"
              style="position:relative"
            >
              <td v-if="item.hasChildren">
                <v-btn
                  fluid
                  small
                  icon
                  color="primary"
                  style="position:absolute; top:50%; transform: translateY(-50%)"
                  @click="enterItem(item.key)"
                  ><v-icon>mdi-chevron-right</v-icon></v-btn
                >
              </td>
              <td v-if="!item.hasChildren"></td>
              <td style="word-break: break-all" @click="selectItem(item.key)">
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
import Vue from 'vue'
import Component from 'vue-class-component'

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

@Component({
  name: 'TreeExplorer'
})
// @vuese
// @group COMPONENTS
// Component from navigating through a tree graph.
export default class TreeExplorer extends Vue {
  selectedKey: unknown | null = null
  parentLabel = 'root'
  objectMap = new Map<unknown | null, Item>()
  id = 0

  public set selectedItem (value: unknown | null) {
    this.selectedKey = value
  }

  public get selectedItem (): unknown | null {
    return this.selectedKey
  }

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

  public addItem (ref: unknown, name: string, parent: unknown | null): void {
    const item = new Item(this.id++, name, ref)
    this.objectMap.set(ref, item)
    ;(this.objectMap.get(parent) as Item).children.push(item)
  }

  public get items (): Item[] {
    return (this.objectMap.get(null) as Item).children
  }

  mounted (): void {
    this.objectMap.set(null, new Item(0, 'root'))
    this.$emit('mounted')
  }

  public clear (): void {
    this.objectMap = new Map<unknown | null, Item>()
    this.objectMap.set(null, new Item(0, 'root'))
  }

  public refresh (): void {
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

  public selectParent (key: unknown | null): void {
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

  public enterItem (key: unknown | null): void {
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

  public toParent (): void {
    this.parents.pop()
    const p = this.parents.pop()
    if (p === undefined) {
      this.enterItem(null)
    } else {
      this.enterItem(p.key)
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

  public selectItem (item: unknown): void {
    this.selectedKey = item
    this.$emit('onItemSelected', item)
  }

  public clearItems (): void {
    this.citems.forEach(item => {
      this.$emit('onMouseLeaveItem', item.key)
    })
    this.citems = []
  }

  public onEnterItem (item: unknown): void {
    this.$emit('onMouseEnterItem', item)
  }

  public onLeaveItem (item: unknown): void {
    this.$emit('onMouseLeaveItem', item)
  }
}
</script>
