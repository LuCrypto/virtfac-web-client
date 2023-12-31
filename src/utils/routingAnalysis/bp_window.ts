import { NvEl } from '@/utils/nodeViewer/nv_el'
import { Node } from '@/utils/graph/node'
import { Link } from '@/utils/graph/link'
import { BlueprintContainer } from './blueprintContainer'
// import { Vec2, Vector2 } from '@/utils/graph/Vec'
import V from '@/utils/vector'

export interface Destroyable {
  destroy(): void
}

/**
 * Display element for doors and windows on layout walls
 */
export class BpWindow implements Destroyable {
  private collider: NvEl
  private container: BlueprintContainer
  private placement: {
    anchor: Node
    wall: Link
    originDistance: number
    windowWidth: number
    isDoor: boolean
  } | null = null

  private linkedWall: Link | undefined = undefined

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
    originDistance: number,
    windowWidth: number,
    isDoor: boolean
  ): void {
    if (this.placement !== null) {
      this.placement.wall.onDataChanged().removeMappedListener('length', this)
      this.placement.wall
        .getData<Set<Destroyable>>('wallFurniture')
        .delete(this)
    }
    this.placement = {
      anchor: anchor,
      wall: wall,
      originDistance: originDistance,
      windowWidth: windowWidth,
      isDoor: isDoor
    }
    this.placement.wall.onDataChanged().addMappedListener(
      'length',
      () => {
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

  public updateTheme (): void {
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
      'stroke-width':
        this.container.getTheme().WallLinkStrokeWidth +
        1 +
        this.container.getTheme().WindowWidth * 2,
      stroke: this.container.getTheme().WallFurnitureColor
    })
    this.displayer.appendChild(this.border, this.back)
  }

  public updateTransform (): void {
    if (this.placement === null) return
    const scale = this.container.getBlueprint().getData<number>('scale')
    const p1 = this.placement.wall.getNode().getData<V>('position')
    const p2 = this.placement.wall.getOriginNode().getData<V>('position')
    // const anchor = this.placement.anchor.getData<Vec2>('position')
    const dir = p1.subV(p2)
    const pos = p2.addV(dir.multN(this.placement.originDistance))
    this.displayer.setStyle({
      'transform-origin': `${pos.x}px, ${pos.y}px`,
      transform: `rotate(${-(p1.x < p2.x ? p2.subV(p1) : p1.subV(p2)).angle() +
        Math.PI / 2}rad)`
    })
    const d = `M${pos
      .subV(dir.normalize().multN((this.placement.windowWidth / 2) * scale))
      .toString()} L${pos
      .addV(dir.normalize().multN((this.placement.windowWidth / 2) * scale))
      .toString()}`
    // this.front.getDom().setAttribute('d', d)
    this.back.getDom().setAttribute('d', d)
    this.border
      .getDom()
      .setAttribute(
        'd',
        `M${pos
          .subV(
            dir
              .normalize()
              .multN(
                (this.placement.windowWidth / 2) * scale +
                  this.container.getTheme().WindowWidth
              )
          )
          .toString()} L${pos
          .addV(
            dir
              .normalize()
              .multN(
                (this.placement.windowWidth / 2) * scale +
                  this.container.getTheme().WindowWidth
              )
          )
          .toString()}`
      )
    if (this.placement.isDoor) {
      this.border.setStyle({ 'stroke-dasharray': '2,3' })
    } else {
      this.border.setStyle({ 'stroke-dasharray': 'none' })
    }
  }

  /*
  public refreshPos () {
    this.updateTheme()
    const scale = this.container.scale()
  }
  */

  destroy (): void {
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
