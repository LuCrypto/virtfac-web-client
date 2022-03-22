import { NvEl, NVSVGNS } from './nv_el'
import { NvNode } from './nv_node'
import { NvLink } from './nv_link'
import { NvTheme } from './nv_theme'
import { NvSocket } from './nv_socket'
import { V } from './v'
import { DelayedCallback } from '../graph/delayedCallback'
import { LocalEvent } from '../graph/localEvent'

export class NvContainer {
  private nodes: Map<number, NvNode> = new Map<number, NvNode>()
  private links: NvLink[] = new Array<NvLink>()
  public theme: NvTheme
  private positionStart: V = new V(0, 0)
  private position: V = new V(0, 0)
  public getPosition () {
    return this.position
  }

  private origin: V = new V(0, 0)
  private size = 1
  public getScale () {
    return this.size
  }

  private scaleChanged = new LocalEvent<number>()
  public onScaleChanged () {
    return this.scaleChanged
  }

  private parent: Node

  private nextNodeId = 0

  private background: NvEl
  public getBackground () {
    return this.background
  }

  private svgDefs: NvEl

  private content: NvEl
  public getContent () {
    return this.content
  }

  private container: NvEl

  public getContainer (): NvEl {
    return this.container
  }

  public getRect (): DOMRect {
    return this.container.getDom().getBoundingClientRect()
  }

  private delta = () => {
    const rect = (this.content.getDom() as Element).getBoundingClientRect()
    return new V(rect.x, rect.y)
  }

  constructor (parent: Node, theme: NvTheme) {
    this.theme = theme
    this.parent = parent

    // create svg dom for links
    this.background = new NvEl('svg', 'background')
    this.background.getDom().setAttribute('svgns', NVSVGNS)
    this.background.getDom().setAttribute('viewbox', '0 0 1 1')
    this.svgDefs = new NvEl('defs')
    this.background.appendChild(this.svgDefs)

    // create content dom for all nodes
    this.content = new NvEl('div', 'content', 'no-select')
    this.content.setStyle({ 'pointer-events': 'none' })

    // create main container
    this.container = new NvEl('div', 'container')
    this.container.appendChild(this.background)
    this.container.appendChild(this.content)
    this.parent.appendChild(this.container.getDom())
    this.container.getDom().onmousedown = e => this.dragMouseDown(e)
    this.container.getDom().onwheel = e => this.zoom(e)

    this.container.getDom().oncontextmenu = e => {
      e.preventDefault()
    }

    this.updateTransform()
  }

  public dragMouseDown (event: MouseEvent) {
    if (document.onmouseup != null && document.onmousemove != null) {
      return
    }

    event = event || window.event
    event.preventDefault()
    this.positionStart = this.unscale(new V(event.clientX, event.clientY)).sub(
      this.position
    )
    document.onmouseup = e => this.dragMouseUp(e)
    document.onmousemove = e => this.dragMouseMove(e)
  }

  public dragMouseMove (event: MouseEvent) {
    event = event || window.event
    event.preventDefault()
    this.position = this.unscale(new V(event.clientX, event.clientY)).sub(
      this.positionStart
    )
    this.updateTransform()
  }

  public dragMouseUp (event: MouseEvent) {
    document.onmouseup = null
    document.onmousemove = null
    event.preventDefault()
  }

  public unscale (v: V): V {
    return v.mult(1 / this.size)
  }

  public absolutePos (v: V): V {
    return v.mult(1 / this.size).sub(this.position)
  }

  public setScale (scale: number) {
    const rect = this.container.getDom().getBoundingClientRect()
    const offset = new V(-this.position.x, -this.position.y)
    const center = new V(
      (offset.x + this.position.x) * this.size,
      (offset.y + this.position.y) * this.size
    )
    this.size = scale
    this.size = Math.min(Math.max(0.125, this.size), 4)
    this.position = new V(
      (center.x - rect.width * (offset.x / rect.width) * this.size) / this.size,
      (center.y - rect.height * (offset.y / rect.height) * this.size) /
        this.size
    )

    this.updateTransform()

    this.scaleChanged.notify(this.size)
  }

  /*
1.5
1.16
1
0.9099999
0.8099999
0.7099999
0.6899999
0.5
0.25
0.15

/**/

  /*
  static validZoom: Array<number> = new Array<number>(
    1.5,
    1.25,
    1,
    0.9099999999,
    0.80999999,
    0.709999999,
    0.69,
    0.5,
    0.25,
    0.15
  )

  public zoomLevel = 2
*/

  public zoom (event: WheelEvent) {
    event.preventDefault()
    const rect = this.container.getDom().getBoundingClientRect()
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
    /*
    if (event.deltaY < 0) this.zoomLevel--
    else this.zoomLevel++
    this.zoomLevel = Math.max(
      0,
      Math.min(NvContainer.validZoom.length - 1, this.zoomLevel)
    )
    this.size = NvContainer.validZoom[this.zoomLevel]
    */
    this.position = new V(
      (center.x - rect.width * (offset.x / rect.width) * this.size) / this.size,
      (center.y - rect.height * (offset.y / rect.height) * this.size) /
        this.size
    )

    this.positionStart = this.unscale(new V(event.clientX, event.clientY)).sub(
      this.position
    )

    this.updateTransform()
    this.scaleChanged.notify(this.size)
  }

  public clientPosToLocalPos (clientX: number, clientY: number): V {
    const rect = this.container.getDom().getBoundingClientRect()
    const offset = new V(
      (clientX - rect.x) / this.size - this.position.x,
      (clientY - rect.y) / this.size - this.position.y
    )
    const center = new V(offset.x, offset.y)
    return center
  }

  public addNode (position: V) {
    const node = new NvNode(this, this.nextNodeId++, position)
    this.content.appendChild(node.getContainer())
    this.nodes.set(node.getIndex(), node)
    node.getContainer().setStyle({
      'background-color': this.theme.nodeSocketBackgroundColor,
      opacity: this.theme.nodeSocketBackgroundOpacity
    })
    node.getContent().setStyle({
      color: this.theme.nodeTextColor,
      'background-color': this.theme.nodeContentBackgroundColor,
      opacity: this.theme.nodeContentBackgroundOpacity
    })
    return node
  }

  public removeNode (node: NvNode) {
    if (this.nodes.has(node.getIndex())) {
      this.nodes.delete(node.getIndex())
      this.content.getDom().removeChild(node.getContainer().getDom())
      node.getLinks().forEach(l => {
        l.delete()
      })
    } else {
      throw new Error("node doesn't exists")
    }
  }

  public addLink (socketIn: NvSocket, socketOut: NvSocket) {
    const link = new NvLink(this, socketIn, socketOut, this.delta)
    // this.svgDefs.appendChild(link.getGradient());
    this.background.appendChild(link.getPath())
    this.links.push(link)
    socketIn.parentNode.getLinks().push(link)
    socketIn.linkConnected(link)
    socketOut.parentNode.getLinks().push(link)
    socketOut.linkConnected(link)
    socketIn.parentNode.updateLinks()
    return link
  }

  public updateTheme () {
    this.nodes.forEach(node => {
      node.getContainer().setStyle({
        'background-color': this.theme.nodeSocketBackgroundColor,
        opacity: this.theme.nodeSocketBackgroundOpacity
      })
      node.getContent().setStyle({
        color: this.theme.nodeTextColor,
        'background-color': this.theme.nodeContentBackgroundColor,
        opacity: this.theme.nodeContentBackgroundOpacity
      })
      node.updateTheme()
    })
  }

  public updateTransform () {
    const gridColor = this.theme.gridColor.replace('#', '%23')
    const pattern = `<rect x="0" y="0" width="${this.theme.gridPointPercent}" height="${this.theme.gridPointPercent}" fill="${gridColor}"/>`
    const svgGrid = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${pattern}</svg>`

    this.container.setStyle({
      'background-size': `${this.size * +this.theme.gridSize}px ${this.size *
        +this.theme.gridSize}px `,
      'background-position': `${this.position.x * this.size}px ${this.position
        .y * this.size}px`,
      'background-color': this.theme.backgroundColor,
      'background-image': `url('data:image/svg+xml,${svgGrid}')`
    })
    this.background.setStyle({
      transform: `scale(${this.size}) translate(${this.position.x}px, ${this.position.y}px)`,
      'transform-origin': `${this.origin.x} ${this.origin.y}`
    })
    this.content.setStyle({
      transform: `scale(${this.size}) translate(${this.position.x}px, ${this.position.y}px)`,
      'transform-origin': `${this.origin.x} ${this.origin.y}`
    })

    this.refreshContainerSizeCaller.call()
    this.updateTheme()
  }

  public getBoundingNodeRect (): {
    xmin: number
    xmax: number
    ymin: number
    ymax: number
    } {
    const rect = {
      xmin: Number.MAX_VALUE,
      xmax: Number.MIN_VALUE,
      ymin: Number.MAX_VALUE,
      ymax: Number.MIN_VALUE
    }
    this.nodes.forEach((value: NvNode, key: number) => {
      const r = value
        .getContainer()
        .getDom()
        .getBoundingClientRect()
      if (r.x < rect.xmin) rect.xmin = r.x
      if (r.y < rect.ymin) rect.ymin = r.y

      if (r.x + r.width > rect.xmax) rect.xmax = r.x + r.width
      if (r.y + r.height > rect.ymax) rect.ymax = r.y + r.height
    })
    return rect
  }

  private refreshContainerSize () {
    const rect = this.getBoundingNodeRect()
    this.content.setStyle({
      width: Math.trunc(rect.xmax - rect.xmin) / this.getScale() + 'px',
      height: Math.trunc(rect.ymax - rect.ymin) / this.getScale() + 'px'
    })
  }

  private refreshContainerSizeCaller: DelayedCallback = new DelayedCallback(
    () => {
      this.refreshContainerSize()
    },
    5
  )

  public callRefreshContainerSize () {
    this.refreshContainerSizeCaller.call()
  }

  public translate (translation: V) {
    this.position = this.position.add(translation)
    this.updateTransform()
  }

  public setPosition (position: V) {
    this.position = position
    this.updateTransform()
  }
}
