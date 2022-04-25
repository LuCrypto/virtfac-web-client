import { V } from '@/utils/nodeViewer/v'
import { NvEl } from '@/utils/nodeViewer/nv_el'
import { Blueprint } from './blueprint'
import { Node } from '@/utils/graph/node'
import { Link } from '@/utils/graph/link'
import { BlueprintContainer } from './blueprintContainer'
import { Vec2, Vector2 } from '@/utils/graph/Vec'

export interface Destroyable {
  destroy(): void
}

export class BpWindow implements Destroyable {
  private collider: NvEl
  private container: BlueprintContainer
  private placement: {
    anchor: Node
    wall: Link
    anchorDistance: number
    windowWidth: number
  } | null = null

  private displayer = new NvEl('svg')
  private back = new NvEl('path')
  // private front = new NvEl('path')
  private border = new NvEl('path')

  constructor (bpContainer: BlueprintContainer) {
    this.collider = new NvEl('path')
    this.container = bpContainer

    this.collider.getDom().onmouseup = null
    this.collider.getDom().oncontextmenu = e => {
      e.preventDefault()
    }

    this.collider.getDom().onmousedown = e => {
      this.container.onMouseDown(e)
    }
    this.collider.getDom().onmousemove = e => {
      this.container.onMouseMove(e)
    }
    this.collider.getDom().onwheel = e => this.container.zoom(e)
    this.back.setStyle({ 'pointer-events': 'none' })
    // this.front.setStyle({ 'pointer-events': 'none' })
    this.border.setStyle({ 'pointer-events': 'none' })

    this.displayer.setStyle({
      width: '1px',
      height: '1px',
      'transform-origin': '0px 0px',
      overflow: 'visible'
    })
    this.container.getFurnitureLayer().appendChild(this.displayer)
  }

  public setPosition (
    anchor: Node,
    wall: Link,
    anchorDistance: number,
    windowWidth: number
  ) {
    if (this.placement !== null) {
      this.placement.wall.onDataChanged().removeMappedListener('length', this)
      this.placement.wall
        .getData<Set<Destroyable>>('wallFurniture')
        .delete(this)
    }
    this.placement = {
      anchor: anchor,
      wall: wall,
      anchorDistance: anchorDistance,
      windowWidth: windowWidth
    }
    this.placement.wall.onDataChanged().addMappedListener(
      'length',
      arg => {
        this.updateTransform()
      },
      this
    )
    this.placement.wall
      .getOrAddData<Set<Destroyable>>('wallFurniture', new Set<Destroyable>())
      .add(this)
    this.updateTheme()
    this.updateTransform()
  }

  public updateTheme () {
    this.collider
      .getDom()
      .setAttribute(
        'stroke-width',
        '' + this.container.getTheme().WallLinkColliderWidth
      )
    this.collider.getDom().setAttribute('stroke', '#00000000')
    this.back.setStyle({
      'stroke-width': this.container.getTheme().WallLinkStrokeWidth + 1,
      stroke: this.container.getTheme().BackgroundColor
    })
    /*
    this.front.setStyle({
      'stroke-width': this.container.getTheme().WindowWidth,
      'stroke-dasharray': '2,3',
      stroke: this.container.getTheme().WallLinkColor
    })
    */
    this.border.setStyle({
      'stroke-width': this.container.getTheme().WallLinkStrokeWidth + 3,
      stroke: this.container.getTheme().WallLinkColor
    })
    this.displayer.appendChild(this.border, this.back)
  }

  public updateTransform () {
    if (this.placement === null) return
    const p1 = this.placement.wall.getNode().getData<Vec2>('position')
    const p2 = this.placement.wall.getOriginNode().getData<Vec2>('position')
    const anchor = this.placement.anchor.getData<Vec2>('position')
    const dir = Vector2.normalize(
      anchor === p1 ? Vector2.minus(p2, p1) : Vector2.minus(p1, p2)
    )
    const pos = Vector2.plus(
      anchor,
      Vector2.multiply(dir, this.placement.anchorDistance)
    )
    this.displayer.setStyle({
      'transform-origin': `${pos.x}px, ${pos.y}px`,
      transform: `rotate(${-Vector2.angle(
        p1.x < p2.x ? Vector2.minus(p2, p1) : Vector2.minus(p1, p2)
      ) +
        Math.PI / 2}rad)`
    })
    const d = `M${Vector2.plus(
      anchor,
      Vector2.multiply(dir, this.placement.anchorDistance)
    ).str()} L${Vector2.plus(
      anchor,
      Vector2.multiply(
        dir,
        this.placement.anchorDistance + this.placement.windowWidth
      )
    ).str()}`
    // this.front.getDom().setAttribute('d', d)
    this.back.getDom().setAttribute('d', d)
    this.border
      .getDom()
      .setAttribute(
        'd',
        `M${Vector2.plus(
          anchor,
          Vector2.multiply(dir, this.placement.anchorDistance - 1)
        ).str()} L${Vector2.plus(
          anchor,
          Vector2.multiply(
            dir,
            this.placement.anchorDistance + this.placement.windowWidth + 1
          )
        ).str()}`
      )
  }

  public refreshPos () {
    this.updateTheme()
    const scale = this.container.scale()
  }

  destroy () {
    if (this.placement !== null) {
      this.placement.wall.onDataChanged().removeMappedListener('length', this)
      this.placement.wall
        .getData<Set<Destroyable>>('wallFurniture')
        .delete(this)
    }
    this.container
      .getFurnitureLayer()
      .getDom()
      .removeChild(this.displayer.getDom())
  }
}
