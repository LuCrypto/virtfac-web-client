<template>
  <div id="container" ref="container"></div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'

// import { NV_El } from '@/utils/nodeViewer/nv_el'
import { NvNode } from '@/utils/nodeViewer/nv_node'
// import { NV_Link } from '@/utils/nodeViewer/nv_link'
import { NvTheme } from '@/utils/nodeViewer/nv_theme'
// import { NV_Socket } from '@/utils/nodeViewer/nv_socket'
import { NvContainer } from '@/utils/nodeViewer/nv_container'
import { V } from '@/utils/nodeViewer/v'
import { Graph } from '@/utils/graph/graph'
import { Node } from '@/utils/graph/node'
import { Link } from '@/utils/graph/link'
import { Vector2, Vec2 } from '@/utils/graph/Vec'

// import domtoimage from "dom-to-image";
import GraphParams from '../components/GraphParams.vue'
import { ConstraintGraph } from '@/utils/graph/constraintGraph'
import Component from 'vue-class-component'

import domtoimage from 'dom-to-image'
import { Session } from '@/utils/session'

@Component({
  props: {
    graph: Graph
    // placementFunction: Function as PropType<(g: Graph) => void>
  }
})
export default class NV extends Vue {
  graph!: Graph
  public themeID = 0

  private nodeMap: Map<Node, NvNode> = new Map<Node, NvNode>()

  private container: NvContainer | null = null

  private setTheme (name: string | null) {
    if (name === null) return
    if (name === 'light') {
      this.themeID = 0
    }
    if (name === 'dark') {
      this.themeID = 1
    }
    if (this.container == null) return
    this.container.theme = this.themes[this.themeID]
    this.container.updateTransform()
    this.container.updateTheme()
  }

  public themes: NvTheme[] = new Array<NvTheme>(
    new NvTheme({ name: 'LIGHT' }),
    new NvTheme({
      name: 'DARK',
      backgroundColor: '#151515',
      gridColor: '#202020',
      gridSize: '50',
      gridPointPercent: '8',
      nodeTextColor: '#eeeeee',
      nodeContentBackgroundColor: '#353535',
      nodeSocketBackgroundColor: '#252525',
      nodeDefaultSocketColor: '#151515',
      nodeBorderRadius: '8px',
      nodeSpacing: '8px',
      toolboxLinkBorderStyle: '3px solid'
    }),
    new NvTheme({
      name: 'DARK T',
      backgroundColor: '#151515',
      gridColor: '#202020',
      gridSize: '50',
      gridPointPercent: '8',
      nodeTextColor: '#eeeeee',
      nodeContentBackgroundColor: '#353535AA',
      nodeSocketBackgroundColor: '#252525AA',
      nodeDefaultSocketColor: '#151515',
      nodeBorderRadius: '8px',
      nodeSpacing: '8px'
    })
  )

  public changeTheme () {
    this.themeID++
    this.themeID %= this.themes.length
    if (this.container == null) return
    this.container.theme = this.themes[this.themeID]
    this.container.updateTransform()
    this.container.updateTheme()
  }

  /*
  public exportToSVG() {
    domtoimage.toSvg(this.$refs.container as Element).then((dataUrl) => {
      let link = document.createElement("a");
      link.download = "export.svg";
      link.href = dataUrl;
      link.click();
    });
  }
*/
  public exportToPNG () {
    if (this.container == null) return

    const scale = this.container.getScale()
    const rect = this.container.getRect()
    this.container.setScale(1)

    const container = this.container.getContainer()
    const oldValues = {
      position: container.getDom().style.position,
      width: container.getDom().style.width,
      height: container.getDom().style.height,
      left: container.getDom().style.left,
      top: container.getDom().style.top
    }

    console.log(oldValues)

    container.getDom().style.position = 'absolute'
    container.getDom().style.left = '0px'
    container.getDom().style.top = '0px'
    container.getDom().style.width = rect.width / scale + 'px'
    container.getDom().style.height = rect.height / scale + 'px'

    console.log(
      'scale:' +
        scale +
        ' old height:' +
        rect.height +
        ' new height:' +
        rect.height / scale
    )

    domtoimage
      .toPng(this.$refs.container as Element, {
        width: rect.width / scale,
        height: rect.height / scale
      })
      .then(dataUrl => {
        const link = document.createElement('a')
        link.download = 'export.png'
        link.href = dataUrl
        link.click()
      })
      .catch(error => {
        console.error(error)
      })
      .finally(() => {
        container.setStyle(oldValues)
        ;(this.container as NvContainer).setScale(scale)
      })
  }

  mounted () {
    /*
    window.addEventListener('storage', e => {
      if (e.key === 'virtfac-theme') {
        console.log(e.newValue)
      } else {
        console.log(e.key, e.newValue)
      }
    })
    */

    this.$root.$on('changeDarkMode', () => {
      this.setTheme(Session.getTheme())
    })

    console.log("i'm mounted")

    const colors = {
      main: '#d77d00',
      second: '#ffc107'
    }

    this.container = new NvContainer(
      this.$refs.container as Element,
      this.themes[this.themeID]
    )
    const cgraph = this.graph.getData<ConstraintGraph>('constraintGraph')
    this.graph.getOrAddData('actions', new Array<string>()).push('download')
    this.graph.getOrAddData('actions', new Array<string>()).push('upload')
    this.graph.setData<{(): void }>('download', () => {
      this.graph.download('graph.json')
    })
    this.graph.nodeFields.set('position', 'Vec2')
    // this.graph.nodeFields.set('color', 'string')
    this.graph.nodeIdField = 'name'

    this.graph.setData<{(): void }>('upload', () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.onchange = e => {
        const f: File = ((e.target as HTMLInputElement).files as FileList)[0]
        if (f != null) {
          const fr = new FileReader()
          fr.onload = event => {
            this.graph.applyJson(JSON.parse(fr.result as string))
          }
          fr.readAsText(f, 'utf8')
        }
      }
      input.click()
    })

    this.graph.onNodeAdded().addListener(arg => {
      if (this.container == null) return
      const pos = arg.node.getOrAddData<Vec2>('position', new Vector2(0, 0))
      const n = this.container.addNode(new V(pos.x, pos.y))
      n.userSetPosition = position => {
        arg.node.setData<Vec2>('position', new Vector2(position.x, position.y))
      }
      this.nodeMap.set(arg.node, n)
      n.addSocket(
        'top',
        'In',
        arg.node.getDataOrDefault<string | null>('color', null)
      )
      n.addSocket(
        'top',
        'Out',
        arg.node.getDataOrDefault<string | null>('color', null)
      )
      n.addSocket(
        'bottom',
        'In',
        arg.node.getDataOrDefault<string | null>('color', null)
      )
      n.addSocket(
        'bottom',
        'Out',
        arg.node.getDataOrDefault<string | null>('color', null)
      )
      n.addSocket(
        'left',
        'In',
        arg.node.getDataOrDefault<string | null>('color', null)
      )
      n.addSocket(
        'left',
        'Out',
        arg.node.getDataOrDefault<string | null>('color', null)
      )
      n.addSocket(
        'right',
        'In',
        arg.node.getDataOrDefault<string | null>('color', null)
      )
      n.addSocket(
        'right',
        'Out',
        arg.node.getDataOrDefault<string | null>('color', null)
      )
      arg.node.onDataChanged().addMappedListener(
        'name',
        arg => {
          n.getContent().getDom().innerHTML = arg.value as string
        },
        this
      )
      arg.node.onDataChanged().addMappedListener(
        'position',
        arg => {
          const pos = arg.value as Vec2
          n.setPosition(new V(pos.x, pos.y))
          n.updateLinks()
        },
        this
      )
      /*
            arg.node.onDataChanged().addMappedListener('img', (arg) => {
                console.log("hello");
                n.setImage(arg.value as string);
            }, this);
            */
      if (arg.node.getData<string | undefined>('img') !== undefined) {
        n.setImage(
          arg.node.getData<string>('img'),
          arg.node.getData<string>('img-width'),
          arg.node.getData<string>('img-height')
        )
        n.setText(arg.node.getDataOrDefault<string>('name', 'unnamed'))
      } else {
        // n.getContent().getDom().innerHTML = arg.node.getDataOrDefault<string>('name', 'unnamed');
        n.setText(arg.node.getDataOrDefault<string>('name', 'unnamed'), true)
      }
      // n.setImage('/assets/logo.png');
    }, this)

    this.graph.onNodeRemoved().addListener(arg => {
      if (this.container == null) return
      const n = this.nodeMap.get(arg.node) as NvNode
      this.nodeMap.delete(arg.node)
      this.container.removeNode(n)
    }, this)
    this.graph.onLinkAdded().addListener(arg => {
      if (this.container == null) return
      const link = this.container.addLink(
        (this.nodeMap.get(arg.link.getOriginNode()) as NvNode).sockets.out[0],
        (this.nodeMap.get(arg.link.getNode()) as NvNode).sockets.in[0]
      )
      link.setLink(arg.link)
      //*
      arg.link.onDataChanged().addMappedListener('path', arg => {
        if (arg.value !== undefined) {
          const d = arg.value as Vec2[]
          link.updatePath(d.map(v => new V(v.x, v.y)))
        } else {
          link.updatePath(undefined)
        }
      })

      /**/
    }, this)

    this.container.theme = new NvTheme({ name: 'LIGHT' })
    this.container.updateTransform()
    this.container.updateTheme()
  }
}
</script>

<style>
#container {
  margin: 0px;
  width: 100%;
  height: 100%;
}

:root {
  --space: 8px;
  --color-01: #ffffff;
  --color-02: #f3f3f3;
  --color-invert: #151515;
  --radius: 8px;
  --shadow: drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.4));
}

.nv-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-position: 0px 0px;
  background-repeat: repeat;
}
.nv-container * {
  font-family: 'Montserrat', sans-serif;
  font-smooth: never;
  -webkit-font-smoothing: none;
}
.nv-container > * {
  width: 100%;
  height: 100%;
  top: 0px;
  left: 0px;
  position: absolute;
  overflow: visible;
  filter: var(--shadow);
  white-space: nowrap;
  backface-visibility: hidden;
}
.nv-node {
  border-radius: var(--radius);
  background-color: var(--color-01);
  position: absolute;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.nv-node > * {
  display: flex;
  flex-direction: row;
}
.nv-node-middle {
  width: auto;
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  align-content: center;
}
.nv-node-socket-row {
  width: auto;
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: nowrap;
}
.nv-node-socket-column {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-wrap: nowrap;
}
.nv-node-content {
  flex-grow: 1;
  min-width: 12px;
  max-width: 400px;
  width: 100%;
  margin: var(--space);
  cursor: move;
  font-smooth: never;
  -webkit-font-smoothing: none;
  white-space: break-spaces;
}
.nv-node-socket {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: var(--space);
}
.nv-node-socket:hover {
  background-color: rgba(128, 128, 128, 0.2);
  cursor: pointer;
}
.nv-node-socket-column.nv-invert .nv-node-socket {
  flex-direction: row-reverse;
}
.nv-node-socket-point {
  min-width: 14px;
  min-height: 14px;
  border-radius: var(--radius);
  background-color: var(--color-invert);
}
.nv-node-socket-title {
  padding: 0 var(--space);
  font-size: 12px;
}
.nv-no-select {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.nv-background path {
  stroke-linecap: round;
  fill: transparent;
}
</style>
