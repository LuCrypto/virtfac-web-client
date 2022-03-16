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
  private container: BlueprintContainer

  constructor (node: Node, bpContainer: BlueprintContainer) {
    this.container = bpContainer
    this.node = node
    this.point = new NvEl('rect')
    const size = bpContainer.getTheme().WallNodeSize
    this.point.getDom().setAttribute('width', `${size}`)
    this.point.getDom().setAttribute('height', `${size}`)
    this.point.setStyle({ fill: `${bpContainer.getTheme().WallNodeColor}` })
    this.container.getSVG().appendChild(this.point)

    const p = node.getData<Vec2>('position')
    if (p !== undefined) this.setPos(p.x, p.y)

    this.point.getDom().onmouseenter = e => {
      this.container.wallNodeEnter(this)
      this.point.setStyle({
        fill: `${bpContainer.getTheme().WallNodeHoverColor}`
      })
    }
    this.point.getDom().onmouseleave = e => {
      this.container.wallNodeExit(this)
      this.point.setStyle({ fill: `${bpContainer.getTheme().WallNodeColor}` })
    }

    this.point.getDom().onmousedown = e => {
      this.container.onMouseDown(e)
    }
    this.point.getDom().onmouseup = e => {
      this.container.onMouseUp(e)
    }
    this.point.getDom().onmousemove = e => {
      this.container.onMouseMove(e)
    }
  }

  public setPos (x: number, y: number) {
    this.point.setStyle({
      transform: `translate(${Math.trunc(
        x - this.container.getTheme().WallNodeSize / 2
      )}px, ${Math.trunc(y - this.container.getTheme().WallNodeSize / 2)}px)`
    })
  }

  public enableMoving () {
    this.point.setStyle({ 'pointer-events': 'none' })
  }

  public disableMoving () {
    this.point.setStyle({ 'pointer-events': 'visiblefill' })
  }
}
