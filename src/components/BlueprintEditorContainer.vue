<style>
.machin::before {
  opacity: 0.08 !important;
}
</style>

<template>
  <maximizable-container>
    <v-card elevation="3" class="d-flex flex-row flex-grow-1">
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
            <v-list-item
              v-if="mySelectedFurniture === null"
              @click.stop="furnitureButtonClick"
            >
              <v-list-item-icon>
                <v-icon>mdi-chair-rolling</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Select Furniture</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              v-if="mySelectedFurniture !== null"
              class="machin"
              @click.stop="furnitureButtonClick"
            >
              <v-list-item-icon>
                <v-icon>mdi-chair-rolling</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Selected Furniture</v-list-item-title>
                <v-list-item-subtitle>{{
                  mySelectedFurniture.name.split('.')[0]
                }}</v-list-item-subtitle>
                <v-img
                  :src="mySelectedFurniture.picture"
                  style="max-width:100%; box-shadow: inset 0 0 3px -1px currentColor"
                ></v-img>
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
      <v-container
        style="width: auto; margin: 0; padding: 0px; flex-grow: 1;"
        fluid
      >
        <blueprint-editor
          ref="blueprintEditor"
          :selectAsset="selectMachine"
        ></blueprint-editor>
        <asset-library
          ref="assetLibrary"
          :categories="assetCategories"
          :content="assetsInfo"
          :onSelect="selectAsset"
        ></asset-library>
      </v-container>
      <input-field-pop-up ref="inputFieldPopUp"></input-field-pop-up>
      <pop-up ref="filePopUp">
        <open-file
          @close="$refs.filePopUp.close()"
          application="BLUEPRINT_EDITOR"
          :singleSelect="true"
          :openFile="true"
          @fileInput="handleFile"
        ></open-file>
      </pop-up>
      <pop-up
        ref="machineLibraryPopUp"
        @close="machinePopupClose"
        :expand="true"
      >
        <v-card style="height: 100%">
          <asset-library
            ref="machineLibrary"
            :categories="popupAssetCategories"
            :content="popupAssetsInfo"
            :onSelect="machineAssetSelected"
          >
          </asset-library>
        </v-card>
      </pop-up>
    </v-card>
  </maximizable-container>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import ActionContainer from '@/components/ActionContainer.vue'
import InputFieldPopUp from '@/components/popup/InputFieldPopUp.vue'
import OpenFile from '@/components/OpenFile.vue'
import XLSX from 'xlsx'
import BlueprintEditor from '@/components/BlueprintEditor.vue'
import PopUp from '@/components/PopUp.vue'
import MaximizableContainer from './MaximizableContainer.vue'

import { BlueprintContainer } from '@/utils/routingAnalysis/blueprintContainer'
import { BlueprintExporter } from '@/utils/routingAnalysis/blueprintExporter'
import { APIAsset, APIFile } from '@/utils/models'
import API from '@/utils/api'
import { Behaviour, BehaviourInstance } from '@/utils/assets/behaviour'
import AssetLibrary from './AssetLibrary.vue'
import { BpAPICache, BpAssetCache } from '@/utils/routingAnalysis/bp_APICache'
import { resolve } from 'path'
import { Node } from '@/utils/graph/node'
import domtoimage from 'dom-to-image'

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
  name: 'BlueprintEditorContainer',
  components: {
    BlueprintEditor,
    InputFieldPopUp,
    OpenFile,
    PopUp,
    MaximizableContainer,
    AssetLibrary
  }
})

// @vuese
// @group COMPONENTS
// Content component to the blueprint-editor page
export default class BlueprintEditorContainer extends Vue {
  openedContent: 'DRAWER' | 'LIBRARY' = 'DRAWER'

  selectedMenuItem = -1
  contentContainer: Element | null = null
  blueprintEditor: BlueprintEditor | null = null
  assetLibrary: AssetLibrary | null = null
  actionContainer: ActionContainer | null = null
  menuCollapse = false
  menuItemList: MenuItem[] = []

  assetsInfo = new Map<
    string,
    {
      id: number
      name: string
      behaviours: Record<string, unknown>
      picture: string
      category: string
    }[]
  >([
    ['Objects', []],
    ['Doors', []],
    ['Windows', []]
  ])

  assetCategories = [
    { name: 'Objects', icon: 'mdi-cube-outline' },
    { name: 'Windows', icon: 'mdi-window-closed-variant' },
    { name: 'Doors', icon: 'mdi-door-closed' }
  ]

  popupAssetsInfo = new Map<
    string,
    {
      id: number
      name: string
      behaviours: Record<string, unknown>
      picture: string
      category: string
    }[]
  >([['', []]])

  popupAssetCategories = [{ name: '', icon: '' }]
  inputField: InputFieldPopUp | null = null

  private furnitureButtonClick () {
    if (this.openedContent === 'DRAWER') {
      this.openedContent = 'LIBRARY'
      ;(this.contentContainer as Element).removeChild(
        (this.blueprintEditor as BlueprintEditor).$el
      )
      ;(this.contentContainer as Element).appendChild(
        (this.assetLibrary as AssetLibrary).$el
      )
    } else {
      this.openedContent = 'DRAWER'
      ;(this.contentContainer as Element).appendChild(
        (this.blueprintEditor as BlueprintEditor).$el
      )
      ;(this.contentContainer as Element).removeChild(
        (this.assetLibrary as AssetLibrary).$el
      )
    }
  }

  mySelectedFurniture: BpAssetCache | null = null
  public get selectedFurniture (): BpAssetCache | null {
    return this.mySelectedFurniture
  }

  public set selectedFurniture (value: BpAssetCache | null) {
    this.mySelectedFurniture = value
    ;(this.blueprintEditor as BlueprintEditor).selectedFurniture = value
  }

  mounted (): void {
    this.blueprintEditor = this.$refs.blueprintEditor as BlueprintEditor
    this.assetLibrary = this.$refs.assetLibrary as AssetLibrary
    this.actionContainer = this.$refs.actionContainer as ActionContainer
    this.inputField = this.$refs.inputFieldPopUp as InputFieldPopUp

    this.contentContainer = this.blueprintEditor.$el.parentElement
    ;(this.contentContainer as Element).removeChild(this.assetLibrary.$el)
    /*
    API.post(
      this,
      '/resources/assets',
      JSON.stringify({
        select: ['id', 'name', 'picture', 'behaviours'],
        where: { id: 54 }
      })
    ).then(asset => {
      this.selectedFurniture = new APIAsset(
        ((asset as unknown) as [
          { id: number; name: string; picture: string; behaviours: string }
        ])[0]
      )
    })
    */

    const map = new Map<number, { id: number; picture: string }>()
    API.post(
      this,
      '/resources/assets',
      JSON.stringify({ select: ['id', 'name', 'behaviours'] })
    ).then(response => {
      ((response as unknown) as {
        id: number
        name: string
        behaviours: string
      }[]).forEach(item => {
        let categ = 'Objects'
        const r = {} as Record<string, unknown>
        if (
          item.behaviours !== '' &&
          item.behaviours !== null &&
          item.behaviours !== undefined
        ) {
          const behaviours = JSON.parse(item.behaviours) as BehaviourInstance[]
          if (behaviours.forEach !== undefined) {
            behaviours.forEach(b => {
              if (b.name === 'Wall/Door') categ = 'Doors'
              else if (b.name === 'Wall/Window') categ = 'Windows'
              r[b.name] = b.data
            })
          }
        }
        const categList = this.assetsInfo.get(categ)
        const all = this.popupAssetsInfo.get('')
        if (categList !== undefined && all !== undefined) {
          const obj = {
            id: item.id,
            name: item.name,
            behaviours: r,
            picture: '',
            category: categ
          }
          categList.push(obj)
          all.push(obj)
          map.set(obj.id, obj)
        }
      })
      const array = new Array<{ id: number; picture: string }>()
      map.forEach(value => {
        array.push(value)
      })
      const packetSize = 20
      for (let i = 0; i < Math.ceil(array.length / packetSize); i++) {
        const where = []
        for (
          let j = i * packetSize;
          j < (i + 1) * packetSize && j < array.length;
          j++
        ) {
          where.push({ id: array[j].id })
        }
        if (where.length > 0) {
          API.post(
            this,
            '/resources/assets',
            JSON.stringify({ select: ['id', 'picture'], where: where })
          ).then(response => {
            ((response as unknown) as {
              id: number
              picture: string
            }[]).forEach(r => {
              const asset = map.get(r.id)
              if (asset !== undefined) {
                asset.picture = r.picture
              }
            })
          })
        }
      }
    })
    /*
    this.menuItemList.push(
      new MenuItem('Open File', 'mdi-file-document', () => {
        (this.$refs.filePopUp as PopUp).open()
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
    */
    this.menuItemList.push(
      new MenuItem('Open File', 'mdi-file-document', () => {
        (this.$refs.filePopUp as PopUp).open()
      })
    )
    this.menuItemList.push(
      new MenuItem('Define Scale', 'mdi-pencil-ruler', () => {
        let dist = 1
        if (this.inputField != null) {
          this.inputField.open(
            'enter reference distance (in meters):',
            '1',
            '1',
            input => {
              if (input != null) {
                dist = +input
                  .replaceAll(',', '.')
                  .replaceAll(' ', '')
                  .replaceAll('m', '')
                if (
                  (this.blueprintEditor as BlueprintEditor).getBpContainer() !=
                  null
                ) {
                  ((this
                    .blueprintEditor as BlueprintEditor).getBpContainer() as BlueprintContainer).defineScaleMode(
                    dist
                  )
                }
              }
            }
          )
        }
      })
    )
    this.menuItemList.push(
      new MenuItem('export GLTF', 'mdi-cube-scan', () => {
        BlueprintExporter.exportGeometry(
          ((this
            .blueprintEditor as BlueprintEditor).getBpContainer() as BlueprintContainer).getBlueprint()
        )
      })
    )
    this.menuItemList.push(
      new MenuItem('Download blueprint', 'mdi-download', () => {
        const json = ((this
          .blueprintEditor as BlueprintEditor).getBpContainer() as BlueprintContainer)
          .getBlueprint()
          .toJSON()
        // const a = document.createElement('a')
        const file = new Blob([JSON.stringify(json)], {
          type: 'application/json;application=virtfac/blueprint/building'
        })

        if (this.inputField != null) {
          this.inputField.open(
            'Enter file name',
            'blueprint',
            'blueprint',
            value => {
              if (value !== null) {
                const reader = new FileReader()
                reader.onload = () => {
                  const f = new APIFile({
                    name: value,
                    uri: reader.result as string
                  })
                  API.put(
                    this,
                    '/resources/files',
                    JSON.stringify(f.toJSON())
                  ).catch(reason => {
                    console.log(reason)
                  })
                }
                reader.readAsDataURL(file)
              }
            }
          )
        }
        /*
        a.href = URL.createObjectURL(file)
        a.download = 'blueprint.json'
        a.click()
        */
      })
    )

    this.menuItemList.push(
      new MenuItem('Save Scene', 'mdi-content-save', () => {
        const graph = ((this
          .blueprintEditor as BlueprintEditor).getBpContainer() as BlueprintContainer)
          .routingGraph

        const json = {
          assets: new Array<{
            idAsset: number
            position: number[]
            rotation: number[]
            scale: number[]
          }>()
        }

        graph.foreachNode(n => {
          const position = n.getData<{ x: number; y: number }>('position')
          const scale = n.getData<{ x: number; y: number }>('dimension')
          const cache = n.getData<BpAssetCache | undefined>('assetCache')
          const asset = {
            idAsset: cache === undefined ? -1 : cache.id,
            position: [position.x, position.y, 0],
            rotation: [0, 0, 0],
            scale: cache === undefined ? [scale.x, scale.y, 1] : [1, 1, 1]
          }
          json.assets.push(asset)
        })

        if (this.inputField != null) {
          this.inputField.open('Enter scene name', 'scene', 'scene', value => {
            if (value !== null) {
              const v = value
              domtoimage.toJpeg(
                ((this
                  .blueprintEditor as BlueprintEditor).getBpContainer() as BlueprintContainer)
                  .getContainer()
                  .getDom()
              )
              API.put(
                this,
                '/resources/ergonomio-scenes',
                JSON.stringify({
                  name: value,
                  assetsNumber: json.assets.length,
                  data: JSON.stringify(json),
                  spawnX: 0,
                  spawnY: 0,
                  spawnZ: 0,
                  idProject: 0,
                  color: 0x3371ff,
                  tags: '[]',
                  picture: ''
                })
              ).catch(reason => {
                console.log(reason)
              })
            }
          })
        }
        /*
        a.href = URL.createObjectURL(file)
        a.download = 'blueprint.json'
        a.click()
        */
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

  selectAsset (id: number): void {
    BpAPICache.instance()
      .getAsset(id)
      .then(asset => {
        this.selectedFurniture = asset
      })
  }

  private selectMachine (node: Node) {
    this.machineSelectCallback = asset => {
      if (asset !== null) {
        node.setData<BpAssetCache>('assetCache', asset)
      }
    }

    if (this.$refs.machineLibraryPopUp !== undefined) {
      (this.$refs.machineLibraryPopUp as PopUp).open()
    }
    if (this.$refs.machineLibrary !== undefined) {
      console.log('force update')
      ;(this.$refs.machineLibrary as AssetLibrary).forceUpdateRender()
    }
  }

  private machineSelectCallback: {
    (res: BpAssetCache | null): void
  } | null = null

  private machinePopupClose (): void {
    if (this.machineSelectCallback !== null) {
      this.machineSelectCallback(null)
    }
  }

  machineAssetSelected (id: number): void {
    if (this.machineSelectCallback !== null) {
      const callback = this.machineSelectCallback
      BpAPICache.instance()
        .getAsset(id)
        .then(res => {
          callback(res)
        })
    }
  }

  inputFile (): void {
    const input = this.$refs.inputFile as HTMLInputElement
    input.value = ''
    input.click()
  }

  handleFile (file: APIFile[]): void {
    if (file == null) {
      console.log('This type of file cannot be read yet.')
    } else {
      file.forEach(apiFile => {
        if (
          apiFile.mime ===
          'application/json;application=virtfac/blueprint/building'
        ) {
          const json = JSON.parse(atob(apiFile.uri.split('base64,')[1]))
          ;((this
            .blueprintEditor as BlueprintEditor).getBpContainer() as BlueprintContainer)
            .getBlueprint()
            .applyJSON(json)
        } else if (
          apiFile.mime ===
          'application/json;application=virtfac/blueprint/routing'
        ) {
          const json = JSON.parse(atob(apiFile.uri.split('base64,')[1]))
          ;((this
            .blueprintEditor as BlueprintEditor).getBpContainer() as BlueprintContainer).routingGraph.applyJson(
            json
          )
          //*
          ;((this
            .blueprintEditor as BlueprintEditor).getBpContainer() as BlueprintContainer).routingGraph.foreachNode(
            n => {
              const p = n.getData<{ x: number; y: number }>('xlsxPosition')
              n.setData<{ x: number; y: number }>('position', {
                x: p.x,
                y: p.y
              })
            }
          )
          /**/
        }
      })
    }
  }
}
</script>
