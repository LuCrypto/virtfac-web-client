// import { V } from '@/utils/nodeViewer/v'
import { NvEl } from '@/utils/nodeViewer/nv_el'
import { Link } from '@/utils/graph/link'
import { BlueprintContainer } from './blueprintContainer'
// import { Vec2, Vector2 } from '@/utils/graph/Vec'
import { BpWindow, Destroyable } from '@/utils/routingAnalysis/bp_window'
import V from '@/utils/vector'

export class BpWallHole {
  private xpos: { (link: Link): number }
  private xSize: { (link: Link): number }
  private yBottomPos: { (link: Link): number }
  private ytopPos: { (link: Link): number }
  private tunnelId: number

  public x (l: Link): number {
    return this.xpos(l)
  }

  public xsize (l: Link): number {
    return this.xSize(l)
  }

  public yBottom (l: Link): number {
    return this.yBottomPos(l)
  }

  public yTop (l: Link): number {
    return this.ytopPos(l)
  }

  public tunnel (): number {
    return this.tunnelId
  }

  constructor (
    xpos: { (link: Link): number },
    xSize: { (link: Link): number },
    yBottomPos: { (link: Link): number },
    ytopPos: { (link: Link): number },
    tunnelId = -1
  ) {
    this.xpos = xpos
    this.xSize = xSize
    this.yBottomPos = yBottomPos
    this.ytopPos = ytopPos
    this.tunnelId = tunnelId
  }
}

export class BpWallLink {
  private link: Link
  private line: NvEl
  private doubleLine: NvEl
  private doubleAdded = false
  private collider: NvEl
  private length: NvEl
  private container: BlueprintContainer

  private furnitures = new Set<BpWindow>()

  private hoveringPosition: V = new V(0, 0)
  private hovered = false

  private isHighlighted () {
    return (
      this.hovered === true ||
      this.link.getNode().getDataOrDefault<boolean>('_highlighted', false) ||
      this.link.getOriginNode().getDataOrDefault<boolean>('_highlighted', false)
    )
  }

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

    link
      .getNode()
      .onDataChanged()
      .addMappedListener(
        '_highlighted',
        () => {
          this.updateTheme()
        },
        this
      )
    link
      .getOriginNode()
      .onDataChanged()
      .addMappedListener(
        '_highlighted',
        () => {
          this.updateTheme()
        },
        this
      )

    const onmouseleave = () => {
      this.container.removeFurniturePreview()
      this.hovered = false
      this.updateTheme()
    }

    const onmouseup = (e: MouseEvent) => {
      if (e.button === 2) {
        this.link.setData<boolean>(
          'double',
          !this.link.getData<boolean | undefined>('double')
        )
      } else if (
        e.button === 0 &&
        (this.container.getMode() === 'WINDOW' ||
          this.container.getMode() === 'DOOR')
      ) {
        // user input : add window or door
        const w = new BpWindow(this.container)
        this.furnitures.add(w)

        const dist =
          link
            .getOriginNode()
            .getData<V>('position')
            .distanceTo(this.hoveringPosition) /
          link
            .getOriginNode()
            .getData<V>('position')
            .distanceTo(link.getNode().getData<V>('position'))
        w.setPosition(
          link.getOriginNode(),
          this.link,
          dist,
          150,
          this.container.getMode() === 'DOOR'
        )

        // searching for tunnel
        const dir = link
          .getNode()
          .getData<V>('position')
          .subV(link.getOriginNode().getData<V>('position'))
          .normalize()
          .rotate90()
        const dir2 = dir.multN(-1)
        let pos: V | null = null
        let otherLink: Link | null = null
        this.container.getBlueprint().foreachWallNode(n => {
          n.foreachLink(l => {
            if (l !== link) {
              const p1 = l.getNode().getData<V>('position')
              const p2 = l.getOriginNode().getData<V>('position')
              let intersection = V.intersectionOrNull(
                this.hoveringPosition,
                dir,
                p1,
                p2
              )
              if (intersection === null) {
                intersection = V.intersectionOrNull(
                  this.hoveringPosition,
                  dir2,
                  p1,
                  p2
                )
              }
              if (
                intersection !== null
                // && Vector2.distanceBetween(intersection, this.hoveringPosition) < 50
              ) {
                if (
                  pos === null ||
                  intersection.distanceTo(this.hoveringPosition) <
                    pos.distanceTo(this.hoveringPosition)
                ) {
                  pos = intersection
                  otherLink = l
                }
              }
            }
          })
        })

        let tunnelId = -1
        const bottom = this.container.getMode() === 'WINDOW' ? 0.5 : 0
        if (otherLink !== null && pos != null) {
          tunnelId =
            this.container.getBlueprint().getOrAddData<number>('tunnelId', 0) +
            1
          this.container.getBlueprint().setData<number>('tunnelId', tunnelId)
          ;(otherLink as Link)
            .getOrAddData<Map<Destroyable, BpWallHole>>(
              'holes',
              new Map<Destroyable, BpWallHole>()
            )
            .set(
              w,
              new BpWallHole(
                l => {
                  // xpos
                  const p1 = l.getNode().getData<V>('position')
                  const p2 = l.getOriginNode().getData<V>('position')
                  const p = this.link
                    .getOriginNode()
                    .getData<V>('position')
                    .addV(
                      this.link
                        .getNode()
                        .getData<V>('position')
                        .subV(this.link.getOriginNode().getData<V>('position'))
                        .multN(dist)
                    )
                  let intersection = V.intersectionOrNull(p, dir, p1, p2)
                  if (intersection === null) {
                    intersection = V.intersectionOrNull(p, dir2, p1, p2)
                  }
                  if (intersection !== null) {
                    return (
                      intersection.distanceTo(
                        l.getOriginNode().getData<V>('position')
                      ) / this.container.getBlueprint().getData<number>('scale')
                    )
                  } else throw new Error('invalid window')
                },
                () => {
                  // xsize
                  return 1.5
                },
                () => {
                  // ybottom
                  return bottom
                },
                () => {
                  // ytop
                  return 2
                },
                tunnelId
              )
            )
        }
        this.link
          .getOrAddData<Map<Destroyable, BpWallHole>>(
            'holes',
            new Map<Destroyable, BpWallHole>()
          )
          .set(
            w,
            new BpWallHole(
              l => {
                // xpos
                return l.getData<number>('length') * dist
              },
              () => {
                // xsize
                return 1.5
              },
              () => {
                // ybottom
                return bottom
              },
              () => {
                // ytop
                return 2
              },
              tunnelId
            )
          )
      } else if (this.container.getMode() === 'SUPP_WALL') {
        this.container.getBlueprint().removeWall(this.link)
      } else {
        this.container.onMouseUp(e)
      }
    }

    this.collider.getDom().onmouseup = onmouseup
    this.collider.getDom().onmouseleave = onmouseleave
    this.collider.getDom().oncontextmenu = e => {
      e.preventDefault()
    }

    this.collider.getDom().onmousedown = e => {
      if (e.button === 1) this.container.onMouseDown(e)
    }
    this.collider.getDom().onmouseover = () => {
      this.hovered = true
      this.updateTheme()
    }
    this.collider.getDom().onmousemove = e => {
      const clientPos = this.container.clientPosToContainerPos(
        e.clientX,
        e.clientY
      )
      const origPos = new V(clientPos.x, clientPos.y)
      const p1 = this.link.getNode().getData<V>('position')
      const p2 = this.link.getOriginNode().getData<V>('position')
      const intersectionpos = V.intersectionLineWithSegment(
        origPos,
        p2
          .subV(p1)
          .rotate90()
          .normalize(),
        p1,
        p2
      )
      /*
      this.container.testPoint.setStyle({
        transform: `translate(${intersectionpos.x - 3}px, ${intersectionpos.y -
          3}px)`
      })
      */
      this.hoveringPosition = intersectionpos
      if (
        this.container.getMode() === 'WINDOW' ||
        this.container.getMode() === 'DOOR'
      ) {
        const dist =
          link
            .getOriginNode()
            .getData<V>('position')
            .distanceTo(this.hoveringPosition) /
          link
            .getOriginNode()
            .getData<V>('position')
            .distanceTo(link.getNode().getData<V>('position'))
        this.container.setFurniturePreview(
          link.getOriginNode(),
          this.link,
          dist,
          150,
          this.container.getMode() === 'DOOR'
        )

        console.log('preview : ' + this.container.getMode())
      }
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

  public updateTheme (): void {
    this.length.setStyle({ fill: this.container.getTheme().WallLinkColor })
    this.line
      .getDom()
      .setAttribute(
        'stroke',
        this.isHighlighted() && this.container.getMode() === 'SUPP_WALL'
          ? this.container.getTheme().EraseColor
          : this.container.getTheme().WallLinkColor
      )
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

    // call refresh theme for all attached furnitures
    this.furnitures.forEach(item => {
      item.updateTheme()
    })
  }

  public refreshPos (): void {
    const p1 = this.link.getOriginNode().getData<V>('position')
    const p2 = this.link.getNode().getData<V>('position')
    const l = this.link.getData<number>('length')
    if (l !== undefined) {
      const textPos =
        p1.x < p2.x
          ? p2
            .subV(p1)
            .divN(2)
            .addV(p1)
          : p1
            .subV(p2)
            .divN(2)
            .addV(p2)
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
        }px) rotate(${-(p1.x < p2.x ? p2.subV(p1) : p1.subV(p2)).angle() +
          Math.PI / 2}rad) translateY(-5px)`
      })
    } else {
      this.length.getDom().innerHTML = ''
    }
    if (this.link.getData<boolean>('double')) {
      const offsetDir = p1
        .subV(p2)
        .rotate90()
        .normalize()

      this.line
        .getDom()
        .setAttribute(
          'd',
          `M${p1
            .addV(offsetDir.multN(this.container.getTheme().DoubleWallWidth))
            .toString()} L${p2
            .addV(offsetDir.multN(this.container.getTheme().DoubleWallWidth))
            .toString()}`
        )
      /*
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
      */
    } else {
      this.line
        .getDom()
        .setAttribute(
          'd',
          `M${new V(p1.x, p1.y).toString()} L${new V(p2.x, p2.y).toString()}`
        )
    }
    this.collider
      .getDom()
      .setAttribute(
        'd',
        `M${new V(p1.x, p1.y).toString()} L${new V(p2.x, p2.y).toString()}`
      )
  }

  destroy (): void {
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
    this.container
      .getLinkLayer()
      .getDom()
      .removeChild(this.collider.getDom())
  }
}
