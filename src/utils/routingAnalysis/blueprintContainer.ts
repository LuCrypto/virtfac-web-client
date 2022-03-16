import { V } from '@/utils/nodeViewer/v'
import { NvEl } from '@/utils/nodeViewer/nv_el'
import { Blueprint } from './blueprint'
import { Node } from '@/utils/graph/node'
import { Link } from '@/utils/graph/link'
import { BpWallNode } from '@/utils/routingAnalysis/bp_wallNode'
import { BpWallLink } from '@/utils/routingAnalysis/bp_wallLink'
import { BpTheme } from '@/utils/routingAnalysis/bp_theme'
import { Vec2, Vector2 } from '../graph/Vec'

class Grid {
  private center: V
  private offset: V
  private mode: 'RECT' | 'SQUARE' | 'ROTATE_SQUARE' = 'RECT'

  public pointSize = 4

  public constructor (center: V, offset: V) {
    this.center = center
    this.offset = offset
  }

  public setMode (m: 'RECT' | 'SQUARE' | 'ROTATE_SQUARE') {
    this.mode = m
  }

  public setCenter (v: V) {
    this.center = v
  }

  public getCenter () {
    return this.center
  }

  public getOffset () {
    return this.offset
  }

  public setOffset (v: V) {
    switch (this.mode) {
      case 'RECT':
        this.offset = v
        break
      case 'SQUARE':
        this.offset = new V(Math.max(v.x, v.y), Math.max(v.x, v.y))
        break
      default:
        this.offset = v
    }
  }

  public snap (p: V): V {
    const relative = p.sub(this.center)
    const mod = new V(relative.x % this.offset.x, relative.y % this.offset.x)
    const res = new V(
      mod.x < this.offset.x / 2 ? p.x - mod.x : p.x + (this.offset.x - mod.x),
      mod.y < this.offset.y / 2 ? p.y - mod.y : p.y + (this.offset.y - mod.y)
    )
    return res
  }

  public getStyle (): string {
    const gridColor = '#555555'.replace('#', '%23')

    switch (this.mode) {
      case 'RECT': {
        const pattern = `<rect x="0" y="0" width="${this.pointSize}" height="${this.pointSize}" fill="${gridColor}"/>`
        const svgGrid = `<svg viewBox="0 0 ${this.offset.x} ${this.offset.y}" xmlns="http://www.w3.org/2000/svg">${pattern}</svg>`
        return svgGrid
      }
      case 'SQUARE': {
        const pattern = `<rect x="0" y="0" width="${this.pointSize}" height="${this.pointSize}" fill="${gridColor}"/>`
        const svgGrid = `<svg viewBox="0 0 ${Math.max(
          this.offset.x,
          this.offset.y
        )} ${Math.max(
          this.offset.x,
          this.offset.y
        )}" xmlns="http://www.w3.org/2000/svg">${pattern}</svg>`
        return svgGrid
      }
      default:
        return ''
    }
  }
}

export class BlueprintContainer {
  private theme: BpTheme
  private parentNode: HTMLElement
  private grid: Grid | null = null
  private size = 1
  private position: V = new V(0, 0)

  private container: NvEl
  private content: NvEl
  private img: NvEl
  private svg: NvEl

  private bp: Blueprint

  private wallNodeMap: Map<Node, BpWallNode> = new Map<Node, BpWallNode>()
  private wallLinkMap: Map<Link, BpWallLink> = new Map<Link, BpWallLink>()

  public getSVG () {
    return this.svg
  }

  public getTheme () {
    return this.theme
  }

  public constructor (parentNode: HTMLElement) {
    this.theme = new BpTheme()
    this.bp = new Blueprint()
    this.parentNode = parentNode
    this.container = new NvEl('div')
    this.content = new NvEl('div')
    this.svg = new NvEl('svg')
    this.img = new NvEl('img')
    this.content.appendChild(this.img)
    parentNode.appendChild(this.content.getDom())
    parentNode.appendChild(this.container.getDom())
    parentNode.appendChild(this.svg.getDom())
    // this.grid = new Grid(new V(0, 0), new V(100, 100))
    this.updateTransform()
    // this.container.getDom().onmousemove = e => this.mouseMove(e)
    // this.container.getDom().onmouseup = e => this.mouseUp(e)
    this.defaultMode()
    this.container.getDom().onwheel = e => this.zoom(e)
    this.container.setStyle({
      width: '100%',
      height: '100%',
      position: 'relative'
    })
    this.content.setStyle({
      width: '0px',
      height: '0px',
      position: 'absolute',
      top: '0px',
      bottom: '0px',
      'image-rendering': 'pixelated'
    })
    this.svg.setStyle({
      position: 'absolute',
      top: '0px',
      bottom: '0px',
      width: '1px',
      height: '1px',
      'transform-origin': '0px 0px',
      overflow: 'visible'
    })

    this.container.getDom().oncontextmenu = e => {
      e.preventDefault()
    }
    this.container.getDom().ondragover = e => {
      if (e.dataTransfer != null && e.dataTransfer.files.length > 0) {
        e.preventDefault()
        console.log('data transfer')
      } else {
        console.log('no data transfer')
        e.preventDefault()
      }
    }
    this.container.getDom().ondrop = e => {
      if (e.dataTransfer != null && e.dataTransfer.files.length > 0) {
        const f: File | null = e.dataTransfer.files.item(0)
        try {
          if (f != null) {
            const fr = new FileReader()
            fr.onload = event => {
              this.img.getDom().setAttribute('src', fr.result as string)
            }
            fr.readAsDataURL(f)
          }
        } catch (error) {
          console.error(error)
        }
      }
      e.preventDefault()
    }

    this.bp.onWallNodeAdded().addListener(arg => {
      this.wallNodeMap.set(arg.node, new BpWallNode(arg.node, this))
    })

    this.bp.onWallNodeDataChanged().addMappedListener(
      'position',
      arg => {
        (this.wallNodeMap.get(arg.node) as BpWallNode).setPos(
          (arg.value as Vec2).x,
          (arg.value as Vec2).y
        )
      },
      this
    )

    this.bp.onWallLinkAdded().addListener(arg => {
      this.wallLinkMap.set(arg.link, new BpWallLink(arg.link, this))
    })

    this.bp.onWallLinkDataChanged().addMappedListener('length', arg => {
      (this.wallLinkMap.get(arg.link) as BpWallLink).refreshPos()
    })
  }

  public clientPosToContainerPos (x: number, y: number): V {
    const rect = this.container.getDom().getBoundingClientRect()
    return new V(
      (x - rect.x) / this.size - this.position.x,
      (y - rect.y) / this.size - this.position.y
    )
  }

  public snap (p: V): V {
    if (this.grid != null) {
      return this.grid.snap(p)
    }
    return p
  }

  public resetGrid () {
    this.container.getDom().onmousedown = null
    this.container.getDom().onmouseup = null
    this.container.getDom().onmousemove = null
    this.container.getDom().onmousemove = event => {
      if (this.grid === null) return
      this.grid.setCenter(
        this.clientPosToContainerPos(event.clientX, event.clientY)
      )
      this.updateTransform()
    }
    this.container.getDom().onmouseup = event => {
      event.preventDefault()
      if (this.grid === null) return
      this.grid.setCenter(
        this.clientPosToContainerPos(event.clientX, event.clientY)
      )
      this.container.getDom().onmousemove = e => {
        if (this.grid === null) return
        this.grid.setOffset(
          this.clientPosToContainerPos(e.clientX, e.clientY)
            .sub(this.grid.getCenter())
            .abs()
        )
        this.updateTransform()
      }

      this.container.getDom().onmouseup = e => {
        this.container.getDom().onmousemove = null
        this.container.getDom().onmouseup = null
        this.defaultMode()
      }
    }
  }

  private snapedWallNode: BpWallNode | null = null

  private angleStep = Math.PI / 4
  private positionStart: V = new V(0, 0)
  public defaultMode () {
    this.container.getDom().onmousedown = null
    this.container.getDom().onmouseup = null
    this.container.getDom().onmousemove = null
    const c = this.container as NvEl
    c.getDom().onmousedown = e => {
      if (e.button === 2) {
        this.positionStart = this.unscale(new V(e.clientX, e.clientY)).sub(
          this.position
        )
        c.getDom().onmousemove = event => {
          event.preventDefault()
          this.position = this.unscale(new V(event.clientX, event.clientY)).sub(
            this.positionStart
          )
          this.updateTransform()
        }
        c.getDom().onmouseup = event => {
          event.preventDefault()
          c.getDom().onmousemove = null
        }
      } else if (e.button === 0) {
        let pos = this.clientPosToContainerPos(e.clientX, e.clientY)
        let n: Node | null = null
        if (this.snapedWallNode != null) {
          const p = this.snapedWallNode.getNode().getData<Vec2>('position')
          pos = new V(p.x, p.y)
          n = this.snapedWallNode.getNode()
        } else n = this.bp.addWallNode(new Vector2(pos.x, pos.y))
        const n2 = this.bp.addWallNode(new Vector2(pos.x, pos.y))
        this.bp.addWall(n, n2)
        document.onmousemove = e1 => {
          const p2 = this.clientPosToContainerPos(e1.clientX, e1.clientY)
          if (Vector2.norm(Vector2.minus(p2, pos)) > 0.1) {
            let angle = Vector2.angle(Vector2.minus(p2, pos))
            if (angle < 0) angle = Math.PI + (Math.PI + angle)
            let tmpTargetAngle = angle - (angle % this.angleStep)
            if (angle % this.angleStep > this.angleStep / 2) {
              tmpTargetAngle += this.angleStep
            }
            tmpTargetAngle = -tmpTargetAngle + Math.PI / 2
            n2.setData<Vec2>(
              'position',
              Vector2.plus(
                Vector2.multiply(
                  new Vector2(
                    Math.cos(tmpTargetAngle),
                    Math.sin(tmpTargetAngle)
                  ),
                  Vector2.norm(Vector2.minus(p2, pos))
                ),
                pos
              )
            )
          }
        }
        document.onmouseup = e1 => {
          this.defaultMode()
          document.onmouseup = null
          document.onmousemove = null
          console.log(this)
        }
      }
      e.preventDefault()
    }
  }

  public wallNodeEnter (node: BpWallNode) {
    this.snapedWallNode = node
  }

  public wallNodeExit (node: BpWallNode) {
    if (this.snapedWallNode === node) this.snapedWallNode = null
  }

  public unscale (v: V): V {
    return v.mult(1 / this.size)
  }

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

    this.position = new V(
      (center.x - rect.width * (offset.x / rect.width) * this.size) / this.size,
      (center.y - rect.height * (offset.y / rect.height) * this.size) /
        this.size
    )

    this.positionStart = this.unscale(new V(event.clientX, event.clientY)).sub(
      this.position
    )

    if (this.grid !== null) {
      this.grid.pointSize = Math.trunc(4 / this.size)
    }

    this.updateTransform()
  }

  public onMouseDown (event: MouseEvent) {
    if (this.container.getDom().onmousedown != null) { (this.container.getDom().onmousedown as { (e: MouseEvent): void })(event) }
  }

  public onMouseUp (event: MouseEvent) {
    if (this.container.getDom().onmouseup != null) { (this.container.getDom().onmouseup as { (e: MouseEvent): void })(event) }
  }

  public onMouseMove (event: MouseEvent) {
    if (this.container.getDom().onmousemove != null) { (this.container.getDom().onmousemove as { (e: MouseEvent): void })(event) }
  }

  updateTransform () {
    this.content.setStyle({
      transform: `scale(${this.size})`,
      left: `${this.position.x * this.size}px`,
      top: `${this.position.y * this.size}px`
    })
    this.svg.setStyle({
      transform: `translate(${this.position.x * this.size}px, ${this.position
        .y * this.size}px) scale(${this.size})`
    })
    if (this.grid === null) return
    this.container.setStyle({
      'background-size': `${this.size * this.grid.getOffset().x}px ${this.size *
        this.grid.getOffset().y}px `,
      'background-position': `${(this.position.x +
        this.grid.getCenter().x -
        this.grid.pointSize / 2) *
        this.size}px ${(this.position.y +
        this.grid.getCenter().y -
        this.grid.pointSize / 2) *
        this.size}px`,
      'background-image': `url('data:image/svg+xml,${this.grid.getStyle()}')`,
      'background-repeat': 'repeat'
    })
  }
}
