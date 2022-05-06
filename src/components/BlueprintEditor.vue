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
            >mdi-door-closed</v-icon
          >
          <p style="width:30px"></p>
          Place doors
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
          Place walls
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
          remove walls
        </v-btn>
        <v-btn
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
        </v-btn>
      </v-btn-toggle>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'

import { Graph } from '@/utils/graph/graph'
import { Node } from '@/utils/graph/node'
import { Link } from '@/utils/graph/link'
import { Vector2, Vec2 } from '@/utils/graph/Vec'
import { BlueprintContainer } from '@/utils/routingAnalysis/blueprintContainer'

import Component from 'vue-class-component'

import { Session } from '@/utils/session'

@Component({
  props: {
    graph: Graph
    // placementFunction: Function as PropType<(g: Graph) => void>
  }
})
export default class BlueprintEditor extends Vue {
  private container: Element | null = null
  private mode:
    | 'WALL'
    | 'DOOR'
    | 'WINDOW'
    | 'SUPP_WALL'
    | 'SUPP_FURNITURE'
    | 'SCALE' = 'WALL'

  private bpContainer: BlueprintContainer | null = null
  public getBpContainer () {
    return this.bpContainer
  }

  mounted () {
    this.container = this.$refs.container as Element
    this.bpContainer = new BlueprintContainer(this.container as HTMLElement)
    this.bpContainer.onModeChanged.addListener(mode => {
      this.mode = mode
    })
    this.$root.$on('changeDarkMode', () => {
      if (this.bpContainer !== null) this.bpContainer.updateThemeFromWeb()
    })
    this.bpContainer.updateThemeFromWeb()
  }

  setMode (mode: 'WALL' | 'DOOR' | 'WINDOW' | 'SUPP_WALL' | 'SUPP_FURNITURE') {
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
