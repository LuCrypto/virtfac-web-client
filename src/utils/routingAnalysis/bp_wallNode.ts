import { NvEl } from '@/utils/nodeViewer/nv_el'
import { Node } from '@/utils/graph/node'
import { BlueprintContainer } from './blueprintContainer'
// import { Vec2 } from '../graph/Vec'
import V from '@/utils/vector'

export class BpWallNode {
  private node: Node
  public getNode (): Node {
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

    const p = node.getData<V>('position')
    if (p !== undefined) this.setPos(p.x, p.y)

    // hovering wall nodes :
    this.collider.getDom().onmouseenter = () => {
      this.container.wallNodeEnter(this)
      this.node.setData('_highlighted', true)
      this.point.setStyle({
        fill: `${
          this.container.getMode() === 'SUPP_WALL'
            ? bpContainer.getTheme().EraseColor
            : bpContainer.getTheme().WallNodeHoverColor
        }`
      })
    }
    this.collider.getDom().onmouseleave = () => {
      this.node.setData('_highlighted', undefined)
      this.container.wallNodeExit(this)
      this.point.setStyle({ fill: `${bpContainer.getTheme().WallNodeColor}` })
    }

    // enter move node mode
    this.collider.getDom().onmousedown = e => {
      e.preventDefault()
      if (this.container.getMode() === 'WALL') {
        if (e.button === 2) {
          this.container.moveNodeMode(
            this.getNode(),
            this.container.getBlueprint().getGraph()
          )
        } else this.container.onMouseDown(e)
      }
    }
    // exit move node mode
    this.collider.getDom().onmouseup = e => {
      if (this.container.getMode() === 'SUPP_WALL') {
        if (e.button === 0) {
          this.container.getBlueprint().removeWallNode(this.node)
        } else this.container.onMouseUp(e)
      } else this.container.onMouseUp(e)
    }
    this.collider.getDom().onmousemove = e => {
      this.container.onMouseMove(e)
    }
    this.collider.getDom().onwheel = e => this.container.zoom(e)

    this.collider.getDom().oncontextmenu = e => e.preventDefault()

    this.updateTheme()
  }

  public updateTheme (): void {
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

  public setPos (x: number, y: number): void {
    this.point.setStyle({
      transform: `translate(${Math.trunc(
        x - this.container.getTheme().WallNodeSize / 2
      )}px, ${Math.trunc(y - this.container.getTheme().WallNodeSize / 2)}px)`
    })
    this.collider.setStyle({ transform: `translate(${x}px,${y}px)` })
  }

  public enableMoving (): void {
    this.point.setStyle({ 'pointer-events': 'none' })
  }

  public disableMoving (): void {
    this.point.setStyle({ 'pointer-events': 'visiblefill' })
  }

  public destroy (): void {
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
