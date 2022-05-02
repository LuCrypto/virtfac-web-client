import { V } from '@/utils/nodeViewer/v'
import { NvEl } from '@/utils/nodeViewer/nv_el'
import { Blueprint } from './blueprint'
import { Node } from '@/utils/graph/node'
import { Link } from '@/utils/graph/link'
import { BlueprintContainer } from './blueprintContainer'
import { Vec2 } from '../graph/Vec'

export class BpWallNode {
  private node: Node
  public getNode () {
    return this.node
  }

  private point: NvEl
  private collider: NvEl
  private container: BlueprintContainer

  constructor (node: Node, bpContainer: BlueprintContainer) {
    this.container = bpContainer
    this.node = node
    this.point = new NvEl('rect')
    this.collider = new NvEl('circle')
    this.collider.setStyle({ fill: '#00000000' })

    const size = bpContainer.getTheme().WallNodeSize
    this.point.getDom().setAttribute('width', `${size}`)
    this.point.getDom().setAttribute('height', `${size}`)
    this.point.setStyle({ 'pointer-events': 'none' })
    this.container.getNodeLayer().appendChild(this.point)
    this.container.getNodeLayer().appendChild(this.collider)

    const p = node.getData<Vec2>('position')
    if (p !== undefined) this.setPos(p.x, p.y)

    this.collider.getDom().onmouseenter = e => {
      this.container.wallNodeEnter(this)
      this.point.setStyle({
        fill: `${bpContainer.getTheme().WallNodeHoverColor}`
      })
    }
    this.collider.getDom().onmouseleave = e => {
      this.container.wallNodeExit(this)
      this.point.setStyle({ fill: `${bpContainer.getTheme().WallNodeColor}` })
    }

    this.collider.getDom().onmousedown = e => {
      e.preventDefault()
      if (e.button === 2) this.container.moveNodeMode(this.getNode())
      else this.container.onMouseDown(e)
    }
    this.collider.getDom().onmouseup = e => {
      this.container.onMouseUp(e)
    }
    this.collider.getDom().onmousemove = e => {
      this.container.onMouseMove(e)
    }
    this.collider.getDom().onwheel = e => this.container.zoom(e)

    this.collider.getDom().oncontextmenu = e => e.preventDefault()

    this.updateTheme()
  }

  public updateTheme () {
    this.collider
      .getDom()
      .setAttribute('r', '' + this.container.getTheme().WallNodeColliderRange)
    this.point.setStyle({
      fill: `${this.container.getTheme().WallNodeColor}`
    })
    this.collider.setStyle({
      'pointer-events': ['DOOR', 'WINDOW'].includes(this.container.getMode())
        ? 'none'
        : 'bounding-box'
    })
  }

  public setPos (x: number, y: number) {
    this.point.setStyle({
      transform: `translate(${Math.trunc(
        x - this.container.getTheme().WallNodeSize / 2
      )}px, ${Math.trunc(y - this.container.getTheme().WallNodeSize / 2)}px)`
    })
    this.collider.setStyle({ transform: `translate(${x}px,${y}px)` })
  }

  public enableMoving () {
    this.point.setStyle({ 'pointer-events': 'none' })
  }

  public disableMoving () {
    this.point.setStyle({ 'pointer-events': 'visiblefill' })
  }

  public destroy () {
    this.container
      .getNodeLayer()
      .getDom()
      .removeChild(this.point.getDom())
    this.container
      .getNodeLayer()
      .getDom()
      .removeChild(this.collider.getDom())
  }
}
