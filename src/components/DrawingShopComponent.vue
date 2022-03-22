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
      <blueprint-editor ref="nodeViewer"></blueprint-editor>
    </v-container>
    <open-file-pop-up
      ref="filePopUp"
      @handleFile="handleFile"
    ></open-file-pop-up>
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
import BlueprintEditor from '@/components/BlueprintEditor.vue'

import CAEExampleFormat1 from '@/exemples/CAEExampleFormat1'
import { BlueprintContainer } from '@/utils/routingAnalysis/blueprintContainer'

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

@Component({
  components: {
    BlueprintEditor,
    OpenFilePopUp
  }
})
export default class DrawingShopComponent extends Vue {
  selectedMenuItem = -1
  nodeViewer: BlueprintEditor | null = null
  actionContainer: ActionContainer | null = null
  menuCollapse = false
  filePopUp: OpenFilePopUp | null = null
  menuItemList: MenuItem[] = []

  mounted (): void {
    this.nodeViewer = this.$refs.nodeViewer as BlueprintEditor
    this.actionContainer = this.$refs.actionContainer as ActionContainer
    this.filePopUp = this.$refs.filePopUp as OpenFilePopUp

    this.menuItemList.push(
      new MenuItem('Open File', 'mdi-file-document', () => {
        this.openFilePopUp()
      })
    )
    this.menuItemList.push(
      new MenuItem('Display shape', 'mdi-graph-outline', () => true)
    )
    this.menuItemList.push(new MenuItem('Settings', 'mdi-cog', () => true))
    this.menuItemList.push(
      new MenuItem('Download file', 'mdi-download', () => true)
    )
    this.menuItemList.push(new MenuItem('Save image', 'mdi-camera', () => true))
    this.menuItemList.push(
      new MenuItem('Set grid', 'mdi-grid', () => {
        if ((this.nodeViewer as BlueprintEditor).getBpContainer() != null) {
          ((this
            .nodeViewer as BlueprintEditor).getBpContainer() as BlueprintContainer).resetGrid()
        }
      })
    )

    // const mapper = new Mapper(CAEExampleFormat1)
  }

  /*
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
      this.nodeViewer.update(data)
    }
  }
*/
  inputFile (): void {
    const input = this.$refs.inputFile as HTMLInputElement
    input.value = ''
    input.click()
  }

  handleFile (file: File | null): void {
    if (file == null) {
      console.log('This type of file cannot be read yet.')
    } else {
      const reader = new FileReader()
      const name = file.name
      reader.onload = e => {
        if (e == null || e.target == null) {
          console.error('Cannot read file...')
          return
        }
        var data = e.target.result
        var workbook = XLSX.read(data, { type: 'binary' })
        console.log(
          'Excel File = ',
          name,
          workbook,
          JSON.stringify(workbook.Sheets[workbook.SheetNames[0]])
        )
        const mapper = new Mapper(workbook.Sheets[workbook.SheetNames[0]])
      }
      reader.readAsBinaryString(file)
    }
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
