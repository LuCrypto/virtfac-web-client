<template>
  <div id="container" ref="container"></div>
</template>

<script lang="ts">
import Vue from 'vue'

// import { V } from '@/utils/nodeViewer/v'
import { Graph } from '@/utils/graph/graph'
import { Node } from '@/utils/graph/node'
import { Link } from '@/utils/graph/link'
// import { Vector2, Vec2 } from '@/utils/graph/Vec'
import V from '@/utils/vector'

import Component from 'vue-class-component'

import { Session } from '@/utils/session'
import * as XLSX from 'ts-xlsx'
import { NvEl } from '@/utils/nodeViewer/nv_el'

@Component({
  name: 'RoutingGraphViewer'
})
// @vuese
// @group COMPONENTS
// Content of the RoutingAnalysis component
export default class RoutingGraphViewer extends Vue {
  private theme = {
    defaultNodeColor: '#BDC3C7',
    defaultLinkColor: '#BDC3C7',
    defaultForgroundNodeColor: '#F5A406',
    defaultForgroundLinkolor: '#F5A406',
    defaultNodeSize: 15,
    defaultLinkWidth: 1
  }

  public themeID = 0

  private container: HTMLElement | null = null
  private nodeLayer: NvEl | null = null
  private linkLayer: NvEl | null = null

  private forgroundNodeLayer: NvEl | null = null
  private forgroundinkLayer: NvEl | null = null

  private nodeMap = new Map<Node, Array<NvEl>>()
  private linkMap = new Map<Link, NvEl>()

  private displayedGraph: Graph | null = null

  /**
   * view zoom level
   */
  private size = 1
  /**
   *
   * @returns view zoom level
   */
  public scale (): number {
    return this.size
  }

  /**
   * view position
   */
  private position: V = new V(0, 0)
  private positionStart: V = new V(0, 0)
  private moveMode = false

  mounted () {
    this.container = this.$refs.container as HTMLElement

    const layerStyle = {
      position: 'absolute',
      top: '0px',
      bottom: '0px',
      width: '100px',
      height: '100px',
      'transform-origin': '0px 0px',
      overflow: 'visible'
    }

    this.nodeLayer = new NvEl('svg')
    this.nodeLayer.setStyle(layerStyle)

    this.linkLayer = new NvEl('svg')
    this.linkLayer.setStyle(layerStyle)

    this.forgroundNodeLayer = new NvEl('svg')
    this.forgroundNodeLayer.setStyle(layerStyle)

    this.forgroundinkLayer = new NvEl('svg')
    this.forgroundinkLayer.setStyle(layerStyle)

    this.container.appendChild(this.nodeLayer.getDom())
    this.container.appendChild(this.linkLayer.getDom())

    this.container.appendChild(this.forgroundNodeLayer.getDom())
    this.container.appendChild(this.forgroundinkLayer.getDom())

    this.linkLayer.setStyle({ 'z-index': '10' })
    this.nodeLayer.setStyle({ 'z-index': '20' })
    this.forgroundinkLayer.setStyle({ 'z-index': '30' })
    this.forgroundNodeLayer.setStyle({ 'z-index': '40' })

    this.container.onmousedown = e => {
      if (e.button === 0) {
        // movement
        this.positionStart = this.unscale(new V(e.clientX, e.clientY)).subV(
          this.position
        )
        this.moveMode = true
        e.preventDefault()
      }
    }

    document.addEventListener('mousemove', e => {
      if (this.moveMode) {
        this.position = this.unscale(new V(e.clientX, e.clientY)).subV(
          this.positionStart
        )
        this.updateTransform()
      }
    })

    document.addEventListener('mouseup', e => {
      if (e.button === 0) {
        this.moveMode = false
        this.updateTransform()
      }
    })
    this.container.onwheel = e => this.zoom(e)

    if (this.displayedGraph !== null) this.setGraph(this.displayedGraph)
    this.updateTransform()
  }

  // @vuese
  // update transform of the svg layers
  public updateTransform () {
    if (this.nodeLayer === null) throw new Error('null nodeLayer')
    if (this.linkLayer === null) throw new Error('null linkLayer')
    if (this.forgroundNodeLayer === null) {
      throw new Error('null forgroundNodeLayer')
    }
    if (this.forgroundinkLayer === null) {
      throw new Error('null forgroundinkLayer')
    }

    const p = `translate(${this.position.x * this.size}px, ${this.position.y *
      this.size}px) scale(${this.size})`
    this.nodeLayer.setStyle({
      transform: p
    })
    this.linkLayer.setStyle({
      transform: p
    })
    this.forgroundNodeLayer.setStyle({
      transform: p
    })
    this.forgroundinkLayer.setStyle({
      transform: p
    })
  }

  public unscale (v: V): V {
    return v.multN(1 / this.size)
  }

  public zoom (event: WheelEvent): void {
    event.preventDefault()
    if (this.container === null) return
    const rect = this.container.getBoundingClientRect()
    const offset = new V(
      (event.clientX - rect.x) / this.size - this.position.x,
      (event.clientY - rect.y) / this.size - this.position.y
    )
    const center = new V(
      (offset.x + this.position.x) * this.size,
      (offset.y + this.position.y) * this.size
    )

    this.size += event.deltaY * -0.001
    this.size = Math.min(Math.max(0.125, this.size), 4)

    this.position = new V(
      (center.x - rect.width * (offset.x / rect.width) * this.size) / this.size,
      (center.y - rect.height * (offset.y / rect.height) * this.size) /
        this.size
    )

    this.positionStart = this.unscale(new V(event.clientX, event.clientY)).subV(
      this.position
    )

    this.updateTransform()
  }

  private addNode (n: Node): void {
    if (this.nodeLayer === null) throw new Error('null nodeLayer')
    const el = new NvEl('circle')
    el.getDom().setAttribute(
      'r',
      '' + n.getDataOrDefault<number>('size', this.theme.defaultNodeSize)
    )
    const p = n.getData<V>('position')
    el.setStyle({
      fill: n.getDataOrDefault<string>('color', this.theme.defaultNodeColor),
      transform: `translate(${p.x}px, ${p.y}px)`
    })
    let name = n.getData<string>('name')
    if (n.getDataOrDefault<boolean>('visible', true)) {
      this.nodeLayer.appendChild(el)
    }
    if (name === undefined) {
      name = ''
    }
    const nameEl = new NvEl('text')
    nameEl.getDom().innerHTML = name
    nameEl.setStyle({
      'font-size': 'x-small'
    })
    this.nodeLayer.appendChild(nameEl)
    const rect = nameEl.getDom().getBoundingClientRect()
    nameEl.setStyle({
      transform: `translate(${p.x - rect.width / this.size / 2}px, ${p.y +
        rect.height / this.size / 4}px)`
    })
    this.nodeMap.set(n, [el, nameEl])
  }

  private removeNode (n: Node): void {
    if (this.nodeLayer === null) throw new Error('null nodeLayer')

    if (n.getDataOrDefault<boolean>('visible', true)) {
      (this.nodeMap.get(n) as Array<NvEl>).forEach(el => {
        (this.nodeLayer as NvEl).getDom().removeChild(el.getDom())
      })
    }
    this.nodeMap.delete(n)
  }

  private addLink (l: Link): void {
    if (this.linkLayer === null) throw new Error('null linkLayer')
    const el = new NvEl('path')
    if (l.getDataOrDefault<boolean>('visible', true)) {
      this.linkLayer.appendChild(el)
    }
    this.linkMap.set(l, el)
    this.refreshLinkPath(l)
  }

  private refreshLinkPath (l: Link) {
    const p1 = l.getOriginNode().getData<V>('position')
    const p2 = l.getNode().getData<V>('position')
    let p = `M${p1.toString()} L${p2.toString()}`
    if (l.getDataOrDefault<boolean>('in', false)) {
      const ap = this.arrowPath(
        l.getDataOrDefault<number>('width', 1) * 5,
        p2,
        p1.addV(
          p2
            .subV(p1)
            .normalize()
            .multN(
              l
                .getOriginNode()
                .getDataOrDefault<number>('size', this.theme.defaultNodeSize)
            )
        )
      )
      p += ' ' + ap
    }
    if (l.getDataOrDefault<boolean>('out', false)) {
      const ap = this.arrowPath(
        l.getDataOrDefault<number>('width', 1) * 5,
        p1,
        p2.addV(
          p1
            .subV(p2)
            .normalize()
            .multN(
              l
                .getNode()
                .getDataOrDefault<number>('size', this.theme.defaultNodeSize)
            )
        )
      )
      p += ' ' + ap
    }
    if (p.split('NaN').length > 1) {
      console.warn(
        `invalid link between : ${l
          .getOriginNode()
          .getDataOrDefault<string>(
            'name',
            'unamed'
          )}(${p1.toString()}) and ${l
          .getNode()
          .getDataOrDefault<string>('name', 'unamed')}(${p2.toString()})`
      )
    } else {
      const el = this.linkMap.get(l) as NvEl
      el.setStyle({
        'stroke-width':
          l.getDataOrDefault<number>('width', this.theme.defaultLinkWidth) +
          'px',
        stroke: l.getDataOrDefault<string>(
          'color',
          this.theme.defaultLinkColor
        ),
        fill: 'transparent',
        'stroke-dasharray': l.getDataOrDefault<string>('stroke-dasharray', '')
      })
      el.getDom().setAttribute('d', p)
    }
  }

  private arrowPath (length: number, from: V, to: V) {
    const dir = to.subV(from).normalize()
    const center = to.addV(dir.multN(-length / 1.4142))
    const offset = new V(dir.y, -dir.x).multN(length / 1.4142)
    const p = `M${center
      .addV(offset)
      .toString()} L${to.toString()} L${center.subV(offset).toString()}`
    return p
  }

  private removeLink (l: Link): void {
    if (this.linkLayer === null) throw new Error('null linkLayer')

    console.log('removeLink')
    if (l.getDataOrDefault<boolean>('visible', true)) {
      this.linkLayer
        .getDom()
        .removeChild((this.linkMap.get(l) as NvEl).getDom())
    }
    this.linkMap.delete(l)
  }

  // @vuese
  // get displayed graph
  public getGraph (): Graph | null {
    return this.displayedGraph
  }

  // @vuese
  // set graph to display
  public setGraph (graph: Graph | null): void {
    if (this.displayedGraph !== null) {
      [
        this.displayedGraph.onNodeAdded(),
        this.displayedGraph.onNodeRemoved(),
        this.displayedGraph.onNodeDataChanged(),
        this.displayedGraph.onLinkDataChanged(),
        this.displayedGraph.onLinkAdded(),
        this.displayedGraph.onLinkRemoved()
      ].forEach(el => {
        el.removeListener(this)
      })
    }

    this.nodeMap.forEach(value => {
      value.forEach(el => {
        if (el.getDom().parentNode !== null) {
          (el.getDom().parentNode as HTMLElement).removeChild(el.getDom())
        }
      })
    })
    this.linkMap.forEach(value => {
      if (value.getDom().parentNode !== null) {
        (value.getDom().parentNode as HTMLElement).removeChild(value.getDom())
      }
    })
    this.displayedGraph = graph

    if (this.displayedGraph !== null) {
      this.displayedGraph.onNodeAdded().addListener(arg => {
        this.addNode(arg.node)
      }, this)
      this.displayedGraph.onNodeRemoved().addListener(arg => {
        this.removeNode(arg.node)
      }, this)
      this.displayedGraph.onLinkAdded().addListener(arg => {
        this.addLink(arg.link)
      }, this)
      this.displayedGraph.onLinkRemoved().addListener(arg => {
        this.removeLink(arg.link)
      }, this)
      this.displayedGraph.onLinkDataChanged().addListener(arg => {
        this.refreshLinkPath(arg.arg.link)
      })

      this.displayedGraph.foreachNode(n => {
        this.addNode(n)
        n.foreachLink(l => {
          this.addLink(l)
        })
      })
    }
  }
}
</script>

<style scoped>
#container {
  position: relative;
  overflow: hidden;
}
</style>
