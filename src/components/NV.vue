<template>
  <div id="container" ref="container"></div>
</template>

<script lang="ts">
import Vue from 'vue'

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
import { ConstraintGraph } from '@/utils/graph/constraintGraph'
import Component from 'vue-class-component'

import domtoimage from 'dom-to-image'
import { Session } from '@/utils/session'
import * as XLSX from 'ts-xlsx'

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
      gridColor: '#1E1E1E',
      gridSize: '50',
      gridPointPercent: '98',
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

  public changeTheme (): void {
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
  public exportToPNG (): void {
    if (this.container == null) return

    const scale = this.container.getScale()
    // const rect = this.container.getRect()
    this.container.setScale(1)

    let nodeRect = this.container.getBoundingNodeRect()
    if (
      nodeRect.xmin === Number.MAX_VALUE ||
      nodeRect.xmax === Number.MIN_VALUE ||
      nodeRect.ymin === Number.MAX_VALUE ||
      nodeRect.ymax === Number.MIN_VALUE
    ) {
      this.container.setScale(scale)
      return
    }

    const container = this.container.getContainer()
    const oldValues = {
      position: container.getDom().style.position,
      width: container.getDom().style.width,
      height: container.getDom().style.height,
      left: container.getDom().style.left,
      top: container.getDom().style.top
    }
    /*
    this.container.translate(
      new V(
        -nodeRect.xmin,
        -nodeRect.ymin
      )
    )
    */
    console.log(this.container.getBoundingNodeRect())
    console.log(oldValues)

    container.getDom().style.position = 'absolute'
    container.getDom().style.left = '0px'
    container.getDom().style.top = '0px'
    container.getDom().style.width =
      Math.trunc(nodeRect.xmax - nodeRect.xmin + 40) + 'px'
    container.getDom().style.height =
      Math.trunc(nodeRect.ymax - nodeRect.ymin + 40) + 'px'
    /*
    console.log(
      'scale:' +
        scale +
        ' old height:' +
        rect.height +
        ' new height:' +
        rect.height / scale
    )
*/
    nodeRect = this.container.getBoundingNodeRect()
    this.container.translate(
      new V(
        -nodeRect.xmin + 20 /* + rect.width / 2 */,
        -nodeRect.ymin + 20 /* + rect.height / 2 */
      )
    )
    console.log(
      container.getDom().style.width + ' ' + container.getDom().style.height
    )

    console.log(container.getDom().getBoundingClientRect())
    this.container.translate(
      new V(
        container.getDom().getBoundingClientRect().x,
        container.getDom().getBoundingClientRect().y
      )
    )

    if (+this.themes[this.themeID].gridPointPercent > 50) {
      container.setStyle({
        'background-color': this.themes[this.themeID].gridColor
      })
    }

    console.log(this.container.getBoundingNodeRect())
    domtoimage
      .toPng(this.$refs.container as Element, {
        width: Math.trunc(nodeRect.xmax - nodeRect.xmin) + 40,
        height: Math.trunc(nodeRect.ymax - nodeRect.ymin) + 40
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

  private addNode (node: Node) {
    if (this.container == null) return
    const pos = node.getOrAddData<Vec2>('position', new Vector2(0, 0))
    const n = this.container.addNode(new V(pos.x, pos.y))
    n.userSetPosition = position => {
      node.setData<Vec2>('position', new Vector2(position.x, position.y))
    }
    this.nodeMap.set(node, n)
    n.addSocket(
      'top',
      'In',
      node.getDataOrDefault<string | null>('color', null)
    )
    n.addSocket(
      'top',
      'Out',
      node.getDataOrDefault<string | null>('color', null)
    )
    n.addSocket(
      'bottom',
      'In',
      node.getDataOrDefault<string | null>('color', null)
    )
    n.addSocket(
      'bottom',
      'Out',
      node.getDataOrDefault<string | null>('color', null)
    )
    n.addSocket(
      'left',
      'In',
      node.getDataOrDefault<string | null>('color', null)
    )
    n.addSocket(
      'left',
      'Out',
      node.getDataOrDefault<string | null>('color', null)
    )
    n.addSocket(
      'right',
      'In',
      node.getDataOrDefault<string | null>('color', null)
    )
    n.addSocket(
      'right',
      'Out',
      node.getDataOrDefault<string | null>('color', null)
    )
    node.onDataChanged().addMappedListener(
      'name',
      arg => {
        // n.getContent().getDom().innerHTML = arg.value as string
        n.setText(arg.value as string, true)
      },
      this
    )
    node.onDataChanged().addMappedListener(
      'position',
      arg => {
        const pos = arg.value as Vec2
        n.setPosition(new V(pos.x, pos.y))
        n.updateLinks()
        if (this.container != null) this.container.callRefreshContainerSize()
      },
      this
    )
    /*
            arg.node.onDataChanged().addMappedListener('img', (arg) => {
                console.log("hello");
                n.setImage(arg.value as string);
            }, this);
            */
    if (node.getData<string | undefined>('img') !== undefined) {
      n.setImage(
        node.getData<string>('img'),
        node.getData<string>('img-width'),
        node.getData<string>('img-height')
      )
      n.setText(node.getDataOrDefault<string>('name', 'unnamed'))
    } else {
      // n.getContent().getDom().innerHTML = arg.node.getDataOrDefault<string>('name', 'unnamed');
      n.setText(node.getDataOrDefault<string>('name', 'unnamed'), true)
    }
  }

  private addLink (l: Link) {
    if (this.container == null) return
    const link = this.container.addLink(
      (this.nodeMap.get(l.getOriginNode()) as NvNode).sockets.out[0],
      (this.nodeMap.get(l.getNode()) as NvNode).sockets.in[0]
    )
    link.setLink(l)

    l.onDataChanged().addMappedListener('path', arg => {
      if (arg.value !== undefined) {
        const d = arg.value as Vec2[]
        link.updatePath(d.map(v => new V(v.x, v.y)))
      } else {
        link.updatePath(undefined)
      }
    })

    if (l.getData<Vec2[] | undefined>('path') !== undefined) {
      link.updatePath(l.getData<Vec2[]>('path').map(v => new V(v.x, v.y)))
    }
  }

  mounted (): void {
    this.$root.$on('changeDarkMode', () => {
      this.setTheme(Session.getTheme())
    })

    this.container = new NvContainer(
      this.$refs.container as Element,
      this.themes[this.themeID]
    )
    // const cgraph = this.graph.getData<ConstraintGraph>('constraintGraph')
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
          fr.onload = () => {
            this.graph.applyJson(JSON.parse(fr.result as string))
          }
          fr.readAsText(f, 'utf8')
        }
      }
      input.click()
    })

    this.graph.onNodeAdded().addListener(arg => {
      this.addNode(arg.node)
    }, this)

    this.graph.foreachNode(n => {
      this.addNode(n)
    })

    this.container.updateTransform()

    this.graph.foreachNode(n => {
      n.foreachLink(l => {
        this.addLink(l)
      })
      ;(this.nodeMap.get(n) as NvNode).updateLinks()
    })

    this.graph.onNodeRemoved().addListener(arg => {
      if (this.container == null) return
      const n = this.nodeMap.get(arg.node) as NvNode
      this.nodeMap.delete(arg.node)
      this.container.removeNode(n)
    }, this)

    this.graph.onLinkAdded().addListener(arg => {
      this.addLink(arg.link)
    }, this)

    // this.container.theme = new NvTheme({ name: 'LIGHT' })
    this.setTheme(Session.getTheme())
    this.container.updateTransform()
    this.container.updateTheme()

    this.container.getContainer().getDom().ondragover = (ev: DragEvent) => {
      ev.preventDefault()
    }
    this.container.getContainer().getDom().ondrop = (ev: DragEvent) => {
      if (ev.dataTransfer != null && ev.dataTransfer.files.length > 0) {
        const f: File | null = ev.dataTransfer.files.item(0)
        try {
          if (f != null) {
            if (f.name.split('.').pop() === 'json') {
              const fr = new FileReader()
              fr.onload = () => {
                this.graph.applyJson(JSON.parse(fr.result as string))
              }
              fr.readAsText(f, 'utf8')
            } else if (
              f.name.split('.').pop() === 'xlsx' ||
              f.name.split('.').pop() === 'xls'
            ) {
              let array: ArrayBuffer | string | null
              const fileReader = new FileReader()
              fileReader.onload = () => {
                array = fileReader.result
                const data = new Uint8Array(array as ArrayBuffer)
                var arr = []
                for (let i = 0; i !== data.length; ++i) {
                  arr[i] = String.fromCharCode(data[i])
                }
                const workbook = XLSX.read(arr.join(''), { type: 'binary' })
                this.graph
                  .getData<ConstraintGraph>('constraintGraph')
                  .loadXLSX(workbook)
              }
              fileReader.readAsArrayBuffer(f)
            }
          }
        } catch (error) {
          console.error(error)
        }
      }
      ev.preventDefault()
    }
    this.container
      .getContainer()
      .getDom()
      .setAttribute('draggable', 'true')

    this.nodeMap.forEach((value: NvNode) => {
      value.setPosition(value.getPosition())
      value.updateLinks()
    })
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
  overflow: clip;
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
  max-width: 300px;
  width: 100%;
  padding: var(--space);
  cursor: move;
  font-smooth: never;
  -webkit-font-smoothing: none;
  white-space: break-spaces;
  image-rendering: pixelated;
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
