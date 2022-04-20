import { V } from '@/utils/nodeViewer/v'
import { NvEl } from '@/utils/nodeViewer/nv_el'
import { Blueprint } from './blueprint'
import { Node } from '@/utils/graph/node'
import { Link } from '@/utils/graph/link'
import { BlueprintContainer } from './blueprintContainer'
import { Vec2, Vector2 } from '@/utils/graph/Vec'
import { BpWindow } from '@/utils/routingAnalysis/bp_window'

export class BpWallLink {
  private link: Link
  private line: NvEl
  private doubleLine: NvEl
  private doubleAdded = false
  private collider: NvEl
  private length: NvEl
  private container: BlueprintContainer

  private hoveringPosition: Vec2 = new Vector2(0, 0)

  constructor (link: Link, bpContainer: BlueprintContainer) {
    this.link = link
    this.line = new NvEl('path')
    this.doubleLine = new NvEl('path')
    this.collider = new NvEl('path')
    this.length = new NvEl('text')
    this.container = bpContainer
    this.container
      .getLinkLayer()
      .appendChild(this.line, this.length, this.collider)
    this.length.setStyle({ 'pointer-events': 'none' })
    this.line.setStyle({ 'pointer-events': 'none' })
    this.doubleLine.setStyle({ 'pointer-events': 'none' })

    const switchDouble = (e: MouseEvent) => {
      if (e.button === 2) {
        this.link.setData<boolean>(
          'double',
          !this.link.getData<boolean | undefined>('double')
        )
      } else if (e.button === 0) {
        const w = new BpWindow(this.container)

        const anchor =
          Vector2.norm(
            Vector2.minus(
              this.link.getNode().getData<Vec2>('position'),
              this.hoveringPosition
            )
          ) <
          Vector2.norm(
            Vector2.minus(
              this.link.getOriginNode().getData<Vec2>('position'),
              this.hoveringPosition
            )
          )
            ? this.link.getNode()
            : this.link.getOriginNode()

        w.setPosition(
          anchor,
          this.link,
          Vector2.norm(
            Vector2.minus(
              anchor.getData<Vec2>('position'),
              this.hoveringPosition
            )
          ) - 25,
          50
        )
      } else {
        this.container.onMouseUp(e)
      }
    }

    this.collider.getDom().onmouseup = switchDouble
    this.collider.getDom().oncontextmenu = e => {
      e.preventDefault()
    }

    this.collider.getDom().onmousedown = e => { if (e.button === 1) this.container.onMouseDown(e) }
    this.collider.getDom().onmousemove = e => {
      const clientPos = this.container.clientPosToContainerPos(
        e.clientX,
        e.clientY
      )
      const origPos = new Vector2(clientPos.x, clientPos.y)
      const p1 = this.link.getNode().getData<Vec2>('position')
      const p2 = this.link.getOriginNode().getData<Vec2>('position')
      const intersectionpos = Vector2.intersection(
        origPos,
        Vector2.normalize(Vector2.rotate90(Vector2.minus(p2, p1))),
        p1,
        p2
      )
      this.container.testPoint.setStyle({
        transform: `translate(${intersectionpos.x - 3}px, ${intersectionpos.y -
          3}px)`
      })
      this.hoveringPosition = intersectionpos
      this.container.onMouseMove(e)
    }
    this.collider.getDom().onwheel = e => this.container.zoom(e)

    this.link.onDataChanged().addMappedListener(
      'double',
      arg => {
        if (arg.value as boolean) {
          if (!this.doubleAdded) {
            this.container.getLinkLayer().appendChild(this.doubleLine)
            this.doubleAdded = true
          }
        } else {
          if (this.doubleAdded) {
            this.container
              .getLinkLayer()
              .getDom()
              .removeChild(this.doubleLine.getDom())
            this.doubleAdded = false
          }
        }
        this.refreshPos()
      },
      this
    )
    this.updateTheme()
  }

  public updateTheme () {
    this.length.setStyle({ fill: this.container.getTheme().WallLinkColor })
    this.line
      .getDom()
      .setAttribute('stroke', this.container.getTheme().WallLinkColor)
    this.line
      .getDom()
      .setAttribute(
        'stroke-width',
        '' + this.container.getTheme().WallLinkStrokeWidth
      )
    this.doubleLine
      .getDom()
      .setAttribute('stroke', this.container.getTheme().WallLinkColor)
    this.doubleLine
      .getDom()
      .setAttribute(
        'stroke-width',
        '' + this.container.getTheme().WallLinkStrokeWidth
      )

    this.collider
      .getDom()
      .setAttribute(
        'stroke-width',
        '' + this.container.getTheme().WallLinkColliderWidth
      )
    this.collider.getDom().setAttribute('stroke', '#00000000')
    this.refreshPos()
  }

  public refreshPos () {
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

      const scale = this.container.scale()

      this.length.setStyle({
        'transform-origin': `${this.length.getDom().getBoundingClientRect()
          .width /
          2 /
          scale}px 0px`,
        transform: `translate(${textPos.x -
          this.length.getDom().getBoundingClientRect().width / 2 / scale}px, ${
          textPos.y
        }px) rotate(${-Vector2.angle(
          p1.x < p2.x ? Vector2.minus(p2, p1) : Vector2.minus(p1, p2)
        ) +
          Math.PI / 2}rad) translateY(-5px)`
      })
    } else {
      this.length.getDom().innerHTML = ''
    }
    if (this.link.getData<boolean>('double')) {
      const offsetDir = Vector2.normalize(
        Vector2.rotate90(Vector2.minus(p1, p2))
      )

      this.line
        .getDom()
        .setAttribute(
          'd',
          `M${Vector2.plus(
            p1,
            Vector2.multiply(
              offsetDir,
              this.container.getTheme().DoubleWallWidth
            )
          ).str()} L${Vector2.plus(
            p2,
            Vector2.multiply(
              offsetDir,
              this.container.getTheme().DoubleWallWidth
            )
          ).str()}`
        )
      this.doubleLine
        .getDom()
        .setAttribute(
          'd',
          `M${Vector2.minus(
            p1,
            Vector2.multiply(
              offsetDir,
              this.container.getTheme().DoubleWallWidth
            )
          ).str()} L${Vector2.minus(
            p2,
            Vector2.multiply(
              offsetDir,
              this.container.getTheme().DoubleWallWidth
            )
          ).str()}`
        )
    } else {
      this.line
        .getDom()
        .setAttribute(
          'd',
          `M${new V(p1.x, p1.y).str()} L${new V(p2.x, p2.y).str()}`
        )
    }
    this.collider
      .getDom()
      .setAttribute(
        'd',
        `M${new V(p1.x, p1.y).str()} L${new V(p2.x, p2.y).str()}`
      )
  }

  destroy () {
    this.link.onDataChanged().removeMappedListener('double', this)
    this.container
      .getLinkLayer()
      .getDom()
      .removeChild(this.line.getDom())
    if (this.doubleAdded) {
      this.container
        .getLinkLayer()
        .getDom()
        .removeChild(this.doubleLine.getDom())
    }
    this.container
      .getLinkLayer()
      .getDom()
      .removeChild(this.length.getDom())
  }
}
