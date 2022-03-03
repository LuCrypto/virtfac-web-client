<template>
  <v-card elevation="3" height="700" class="d-flex flex-row">
    <v-navigation-drawer stateless permanent :mini-variant="menuCollapse">
      <v-list
        nav
        dense
        class="d-flex flex-column justify-start;"
        style="height: 100%"
      >
        <v-list-item-group v-model="selectedMenuItem" color="primary">
          <v-list-item
            v-for="(menuItem, i) in menuItemList"
            :key="i"
            class="justify-start"
            @click.stop="menuItem.action"
          >
            <v-list-item-icon>
              <v-icon v-text="menuItem.icon"></v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text="menuItem.text"></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
        <v-list-item-group class="mt-auto">
          <v-list-item
            class="justify-start"
            @click="menuCollapse = !menuCollapse"
          >
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
      <NV ref="nodeViewer" :graph="getGraph()" />
    </v-container>
    <open-file-pop-up
      ref="filePopUp"
      application="ALL"
      :singleselect="true"
      :openFile="true"
      @fileInput="handleFile"
    ></open-file-pop-up>
    <select-pop-up ref="selectPopUp"></select-pop-up>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import ActionContainer, {
  ActionCallbackData
} from '@/components/ActionContainer.vue'
import NodeViewer from '@/components/NodeViewer.vue'
import OpenFilePopUp from '@/components/popup/OpenFilePopUp.vue'
import XLSX from 'xlsx'
import Mapper from '@/utils/mapper'
import NV from '@/components/NV.vue'
import { APIFile } from '@/utils/models'

import CAEExampleFormat1 from '@/exemples/CAEExampleFormat1'
import { ConstraintGraph } from '@/utils/graph/constraintGraph'
import { Graph } from '@/utils/graph/graph'
import { IWorkBook } from 'ts-xlsx'
import API from '@/utils/api'
import SelectPopUp from '@/components/popup/SelectPopUp.vue'

class MenuItem {
  text: string
  icon: string
  action: () => void
  constructor (text: string, icon: string, action: () => void) {
    this.text = text
    this.icon = icon
    this.action = action
  }
}

interface SettingItem {
  id: number
  idApplication: number
  name: string
  json: string
}

@Component({
  components: {
    ActionContainer,
    OpenFilePopUp,
    NV,
    SelectPopUp
  }
})
export default class ContradictionExpert extends Vue {
  selectedMenuItem = -1
  nodeViewer: NV | null = null
  selectPopUp: SelectPopUp | null = null
  actionContainer: ActionContainer | null = null
  menuCollapse = false
  filePopUp: OpenFilePopUp | null = null
  menuItemList: MenuItem[] = []
  constraintGraph: ConstraintGraph = new ConstraintGraph()
  fileName = ''

  getGraph (): Graph {
    return (this.constraintGraph as ConstraintGraph).getRawGraph()
  }

  mounted (): void {
    // this.constraintGraph = new ConstraintGraph()
    this.nodeViewer = this.$refs.nodeViewer as NV
    this.actionContainer = this.$refs.actionContainer as ActionContainer
    this.filePopUp = this.$refs.filePopUp as OpenFilePopUp
    this.selectPopUp = this.$refs.selectPopUp as SelectPopUp

    this.menuItemList.push(
      new MenuItem('Open File', 'mdi-file-document', () => {
        this.openFilePopUp()
      })
    )
    this.menuItemList.push(
      new MenuItem('Save shape', 'mdi-graph-outline', () => {
        this.saveShape()
      })
    )
    this.menuItemList.push(
      new MenuItem('Load shape', 'mdi-graph-outline', () => {
        this.loadShape()
      })
    )
    this.menuItemList.push(new MenuItem('Settings', 'mdi-cog', () => true))
    this.menuItemList.push(
      new MenuItem('Download file', 'mdi-download', () => true)
    )
    this.menuItemList.push(
      new MenuItem('Save image', 'mdi-camera', () => {
        (this.nodeViewer as NV).exportToPNG()
        return true
      })
    )

    // const mapper = new Mapper(CAEExampleFormat1)
  }

  onRightMouseDrag (): void {
    if (this.actionContainer != null) {
      this.actionContainer.drag()
    }
  }

  onMouseWheel (): void {
    if (this.actionContainer != null) {
      this.actionContainer.zoom()
    }
  }

  onUpdate (data: ActionCallbackData): void {
    if (this.nodeViewer != null) {
      // this.nodeViewer.update(data)
    }
  }

  inputFile (): void {
    const input = this.$refs.inputFile as HTMLInputElement
    input.value = ''
    input.click()
  }

  handleFile (files: APIFile[]): void {
    if (files == null) {
      console.log('This type of file cannot be read yet.')
    } else {
      console.log(files, ' : coucou', typeof files)
      const workbook = XLSX.read(files[0].uri.split('base64,')[1], {
        type: 'base64'
      })
      console.log(workbook)
      this.constraintGraph.loadXLSX(workbook as IWorkBook)
      this.fileName = files[0].name
    }
  }

  // dropHandler(e : )
  saveShape (): void {
    const settingOBJ = {
      name: this.fileName,
      type: 'graph_position',
      data: this.constraintGraph.getRawGraph().toJsonOBJ()
    }
    API.post(
      this,
      '/application-settings',
      JSON.stringify({
        idApplication: 2,
        name: this.fileName,
        json: JSON.stringify(settingOBJ)
      })
    )
  }

  loadShape (): void {
    API.get(
      this,
      '/application-settings',
      new URLSearchParams({ application: 'CONTRADICTION_ANALYSIS' })
    ).then(response => {
      const r = (response as unknown) as SettingItem[]
      const m = new Array<{ text: string; return: unknown }>()
      r.forEach(item => {
        m.push({ text: item.name, return: item })
      })
      ;(this.selectPopUp as SelectPopUp).open(m, selected => {
        if (selected == null) console.log('null')
        else {
          console.log(JSON.parse((selected as SettingItem).json))
          this.getGraph().applyJson(
            JSON.parse((selected as SettingItem).json).data
          )
        }
      })
    })
  }

  openFilePopUp (): void {
    if (this.filePopUp != null) {
      this.filePopUp.open()
    } else {
      console.log('this.filePopUp is null')
    }
  }

  selectSheetPopUp (workbook: any): void {
    console.log(workbook)
    // this.$refs.excel.active = true;
    // console.log(workbook);
  }
}
</script>
