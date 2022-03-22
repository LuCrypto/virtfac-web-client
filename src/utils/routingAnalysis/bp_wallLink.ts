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
  private container: BlueprintContainer

  constructor (link: Link, bpContainer: BlueprintContainer) {
    this.link = link
    this.line = new NvEl('path')
    this.container = bpContainer
    this.container.getLinkLayer().appendChild(this.line)
  }

  public refreshPos () {
    const p1 = this.link.getOriginNode().getData<Vec2>('position')
    const p2 = this.link.getNode().getData<Vec2>('position')
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
