import { V } from '@/utils/nodeViewer/v'
import { NvEl } from '@/utils/nodeViewer/nv_el'
import { Blueprint } from './blueprint'
import { Node } from '@/utils/graph/node'
import { Link } from '@/utils/graph/link'
import { BlueprintContainer } from './blueprintContainer'
import { Vec2, Vector2 } from '@/utils/graph/Vec'

export class BpWallLink {
  private link: Link
  private line: NvEl
  private length: NvEl
  private container: BlueprintContainer

  constructor (link: Link, bpContainer: BlueprintContainer) {
    this.link = link
    this.line = new NvEl('path')
    this.length = new NvEl('text')
    this.container = bpContainer
    this.container.getLinkLayer().appendChild(this.line, this.length)
  }

  public updateTheme () {
    this.length.setStyle({ fill: this.container.getTheme().WallLinkColor })
  }

  public refreshPos () {
    this.updateTheme()
    const p1 = this.link.getOriginNode().getData<Vec2>('position')
    const p2 = this.link.getNode().getData<Vec2>('position')
    const l = this.link.getData<number>('length')
    if (l !== undefined) {
      const textPos =
        p1.x < p2.x
          ? Vector2.plus(Vector2.divide(Vector2.minus(p2, p1), 2), p1)
          : Vector2.plus(Vector2.divide(Vector2.minus(p1, p2), 2), p2)
      this.length.getDom().innerHTML = Math.round(l) / 100 + ' m'

      this.length.setStyle({ transform: '' })

      this.length.setStyle({
        'transform-origin': `${this.length.getDom().getBoundingClientRect()
          .width / 2}px 0px`,
        transform: `translate(${textPos.x -
          this.length.getDom().getBoundingClientRect().width / 2}px, ${
          textPos.y
        }px) rotate(${-Vector2.angle(
          p1.x < p2.x ? Vector2.minus(p2, p1) : Vector2.minus(p1, p2)
        ) +
          Math.PI / 2}rad) translateY(-5px)`
      })
    } else {
      this.length.getDom().innerHTML = ''
    }
    this.line
      .getDom()
      .setAttribute(
        'd',
        `M${new V(p1.x, p1.y).str()} L${new V(p2.x, p2.y).str()}`
      )

    this.line
      .getDom()
      .setAttribute('stroke', this.container.getTheme().WallLinkColor)
    this.line
      .getDom()
      .setAttribute(
        'stroke-width',
        '' + this.container.getTheme().WallLinkStrokeWidth
      )
    this.line.setStyle({ 'pointer-events': 'none' })
  }
}
