<template>
  <div
    id="container"
    ref="container"
    style="overflow: hidden; position:relative"
  ></div>
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

  private bpContainer: BlueprintContainer | null = null
  public getBpContainer () {
    return this.bpContainer
  }

  mounted () {
    this.container = this.$refs.container as Element
    this.bpContainer = new BlueprintContainer(this.container as HTMLElement)
  }
}
</script>
