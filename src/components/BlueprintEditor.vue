<template>
  <div style="position:relative; width:100%; height:100%">
    <div
      id="container"
      ref="container"
      style="overflow: hidden; position:relative"
    ></div>
    <div
      id="editor_mode"
      ref="editor_mode"
      style="position:absolute; overflow: visible; pointer-event:none; left:0px; top:0px"
      z-index="100"
      class="d-flex flex-column justify-start;"
    >
      <v-btn-toggle v-model="mode" class="flex-wrap">
        <v-btn
          value="DOOR"
          medium
          @click.stop="setMode('DOOR')"
          class="flex-grow-1"
          style="margin-bottom:5px;"
          ><v-icon style="position:absolute; left:0; margin-right:10px"
            >mdi-chair-rolling</v-icon
          >
          <p style="width:30px"></p>
          {{ $vuetify.lang.t('$vuetify.blueprintEditor.placeFurniture') }}
        </v-btn>
        <v-btn
          medium
          @click.stop="setMode('WALL')"
          style="margin-bottom:5px;"
          value="WALL"
          class="flex-grow-1"
          ><v-icon style="position:absolute; left:0; margin-right:10px"
            >mdi-wall</v-icon
          >
          <p style="width:30px"></p>
          {{ $vuetify.lang.t('$vuetify.blueprintEditor.placeWall') }}
        </v-btn>
        <v-btn
          medium
          @click.stop="setMode('SUPP_WALL')"
          class="flex-grow-1"
          style="margin-bottom:5px;"
          value="SUPP_WALL"
          ><v-icon style="position:absolute; left:0; margin-right:10px"
            >mdi-wall-fire</v-icon
          >
          <p style="width:30px"></p>
          {{ $vuetify.lang.t('$vuetify.blueprintEditor.removeWall') }}
        </v-btn>
        <!-- <v-btn
          medium
          @click.stop="setMode('WINDOW')"
          class="flex-grow-1"
          style="margin-bottom:5px;"
          value="WINDOW"
          ><v-icon style="position:absolute; left:0; margin-right:10px"
            >mdi-window-closed-variant</v-icon
          >
          <p style="width:30px"></p>
          Place windows
        </v-btn> -->
      </v-btn-toggle>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import { Graph } from '@/utils/graph/graph'
import { BlueprintContainer } from '@/utils/routingAnalysis/blueprintContainer'

import Component from 'vue-class-component'
import { APIAsset } from '@/utils/models'
import { BpAPICache, BpAssetCache } from '@/utils/routingAnalysis/bp_APICache'
import PopUp from './PopUp.vue'
import AssetLibrary from './AssetLibrary.vue'
import { Prop } from 'vue-property-decorator'
import { Node } from '@/utils/graph/node'

@Component({
  name: 'BlueprintEditor',
  props: {
    graph: Graph
    // placementFunction: Function as PropType<(g: Graph) => void>
  }
})
// @vuese
// @group COMPONENTS
// Content of the DrawingShopComponent
export default class BlueprintEditor extends Vue {
  @Prop({ default: () => null }) private selectAsset!: {
    (node: Node): void
  } | null

  private container: Element | null = null
  private mode:
    | 'WALL'
    | 'DOOR'
    | 'WINDOW'
    | 'SUPP_WALL'
    | 'SUPP_FURNITURE'
    | 'SCALE' = 'WALL'

  private bpContainer: BlueprintContainer | null = null

  // @vuese
  // return the BlueprintContainer attached to the component
  public getBpContainer (): BlueprintContainer | null {
    return this.bpContainer
  }

  private _selectedFurniture: BpAssetCache | null = null
  public get selectedFurniture (): BpAssetCache | null {
    return this._selectedFurniture
  }

  public set selectedFurniture (value: BpAssetCache | null) {
    this._selectedFurniture = value
    ;(this.bpContainer as BlueprintContainer).selectedAsset = value
  }

  mounted (): void {
    BpAPICache.instance().component = this
    this.container = this.$refs.container as Element
    if (this.selectAsset === null) throw new Error()
    this.bpContainer = new BlueprintContainer(
      this.container as HTMLElement,
      node => {
        if (this.selectAsset !== null) this.selectAsset(node)
      }
    )
    this.bpContainer.onModeChanged.addListener(mode => {
      this.mode = mode
    })
    this.$root.$on('changeDarkMode', () => {
      if (this.bpContainer !== null) this.bpContainer.updateThemeFromWeb()
    })
    this.bpContainer.updateThemeFromWeb()
  }

  // @vuese
  // Set editing mode
  // @arg mode: 'WALL','DOOR','WINDOW','SUPP_WALL','SUPP_FURNITURE'
  setMode (
    mode: 'WALL' | 'DOOR' | 'WINDOW' | 'SUPP_WALL' | 'SUPP_FURNITURE'
  ): void {
    this.mode = mode
    if (this.bpContainer === null) return
    if (this.bpContainer.getMode() === mode) {
      this.bpContainer.setMode('WALL')
    } else {
      this.bpContainer.setMode(mode)
    }
  }
}
</script>
