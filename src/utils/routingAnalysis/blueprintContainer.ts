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
  public optAlignSnap = true
  public optAlignSnapDist = 10

  public optAngleSnap = true
  public optAngleSnapStep: number = Math.PI / 4

  private theme: BpTheme
  private parentNode: HTMLElement
  private grid: Grid | null = null
  private size = 1
  public scale () {
    return this.size
  }

  private position: V = new V(0, 0)

  private container: NvEl
  private content: NvEl
  private img: NvEl
  private svgNodeLayer: NvEl
  private svgLinkLayer: NvEl

  private scaleDisplayer = {
    leftPoint: new NvEl('rect'),
    lineCol1: new NvEl('path'),
    lineCol2: new NvEl('path'),
    rightPoint: new NvEl('rect')
  }

  private bp: Blueprint

  private wallNodeMap: Map<Node, BpWallNode> = new Map<Node, BpWallNode>()
  private wallLinkMap: Map<Link, BpWallLink> = new Map<Link, BpWallLink>()

  public getNodeLayer () {
    return this.svgNodeLayer
  }

  public getLinkLayer () {
    return this.svgLinkLayer
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
    this.svgNodeLayer = new NvEl('svg')
    this.svgLinkLayer = new NvEl('svg')
    this.img = new NvEl('img')
    this.content.appendChild(this.img)
    parentNode.appendChild(this.content.getDom())
    parentNode.appendChild(this.container.getDom())
    parentNode.appendChild(this.svgLinkLayer.getDom())
    parentNode.appendChild(this.svgNodeLayer.getDom())
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
    this.svgLinkLayer.setStyle({
      position: 'absolute',
      top: '0px',
      bottom: '0px',
      width: '1px',
      height: '1px',
      'transform-origin': '0px 0px',
      overflow: 'visible'
    })
    this.svgNodeLayer.setStyle({
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
    this.bp.setData<number>('scale', 1)

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

    this.bp.onWallNodeRemoved().addListener(arg => {
      (this.wallNodeMap.get(arg.node) as BpWallNode).destroy()
      this.wallNodeMap.delete(arg.node)
    }, this)

    this.bp.onWallLinkRemoved().addListener(arg => {
      (this.wallLinkMap.get(arg.link) as BpWallLink).destroy()
      this.wallLinkMap.delete(arg.link)
    })

    this.snapXLine = new NvEl('path')
    this.snapYLine = new NvEl('path')

    const snapLineStyle = {
      'pointer-events': 'none',
      'stroke-dasharray': '2,3',
      'stroke-width': '1',
      stroke: `${this.theme.WallSnapLineColor}`
    }

    this.snapXLine.setStyle(snapLineStyle)
    this.snapYLine.setStyle(snapLineStyle)

    this.svgLinkLayer.appendChild(this.snapXLine, this.snapYLine)

    this.testPoint.getDom().setAttribute('width', `${6}`)
    this.testPoint.getDom().setAttribute('height', `${6}`)
    this.testPoint.setStyle({ 'pointer-events': 'none' })
    this.getNodeLayer().appendChild(this.testPoint)

    this.scaleDisplayer.leftPoint.setStyle({
      fill: this.theme.WallNodeColor,
      width: `${this.theme.WallNodeSize / 2}px`,
      height: `${this.theme.WallNodeSize}px`,
      transform: `translate(${-this.theme.WallNodeSize / 4}px, ${-this.theme
        .WallNodeSize / 2}px)`,
      'z-index': 1
    })
    this.scaleDisplayer.rightPoint.setStyle({
      fill: this.theme.WallNodeColor,
      width: `${this.theme.WallNodeSize / 2}px`,
      height: `${this.theme.WallNodeSize}px`,
      transform: `translate(${100 - this.theme.WallNodeSize / 4}px, ${-this
        .theme.WallNodeSize / 2}px)`,
      'z-index': 1
    })

    const scaleSvgContainer = new NvEl('svg')
    scaleSvgContainer.setStyle({
      position: 'absolute',
      bottom: `${20}px`,
      left: `${20}px`,
      width: '1px',
      height: '1px',
      overflow: 'visible'
    })

    this.scaleDisplayer.lineCol1.setStyle({
      'stroke-dashoffset': 10,
      'stroke-dasharray': 10,
      stroke: this.theme.WallLinkColor
    })
    this.scaleDisplayer.lineCol2.setStyle({
      'stroke-dasharray': 10,
      stroke: this.theme.WallSnapLineColor
    })

    const path = `M${new V(0, 0).str()} L${new V(100, 0).str()}`
    this.scaleDisplayer.lineCol1.getDom().setAttribute('d', path)
    this.scaleDisplayer.lineCol2.getDom().setAttribute('d', path)

    scaleSvgContainer.appendChild(
      this.scaleDisplayer.lineCol1,
      this.scaleDisplayer.lineCol2,
      this.scaleDisplayer.leftPoint,
      this.scaleDisplayer.rightPoint
    )
    this.container.appendChild(scaleSvgContainer)
  }

  public refreshScaleViewer () {
    const right = 100 * this.bp.getData<number>('scale') * this.size
    const path = `M${new V(0, 0).str()} L${new V(right, 0).str()}`
    this.scaleDisplayer.lineCol1.getDom().setAttribute('d', path)
    this.scaleDisplayer.lineCol2.getDom().setAttribute('d', path)
    this.scaleDisplayer.rightPoint.setStyle({
      transform: `translate(${right - this.theme.WallNodeSize / 4}px, ${-this
        .theme.WallNodeSize / 2}px)`
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

  private snapXLine: NvEl
  private snapYLine: NvEl

  private displayXsnap (node: Node, snappedPos: V) {
    const p = node.getData<Vec2>('position')
    this.snapXLine
      .getDom()
      .setAttribute('d', `M${new V(p.x, p.y).str()} L${snappedPos.str()}`)
  }

  private displayYsnap (node: Node, snappedPos: V) {
    const p = node.getData<Vec2>('position')
    this.snapYLine
      .getDom()
      .setAttribute('d', `M${new V(p.x, p.y).str()} L${snappedPos.str()}`)
  }

  private hideSnap () {
    this.snapXLine.getDom().setAttribute('d', '')
    this.snapYLine.getDom().setAttribute('d', '')
  }

  private snapedWallNode: BpWallNode | null = null

  private positionStart: V = new V(0, 0)

  private testPoint = new NvEl('rect')

  public defaultMode () {
    this.container.getDom().onmousedown = null
    this.container.getDom().onmouseup = null
    this.container.getDom().onmousemove = null

    this.container.getDom().onmousemove = e => {
      const clientPos = this.clientPosToContainerPos(e.clientX, e.clientY)
      if (this.bp.isInside(new Vector2(clientPos.x, clientPos.y))) {
        this.testPoint.setStyle({ fill: '#2ECC71' })
      } else {
        this.testPoint.setStyle({ fill: '#E74C3C' })
      }
      this.testPoint.setStyle({
        transform: `translate(${clientPos.x - 3}px, ${clientPos.y - 3}px)`
      })
    }
    const c = this.container as NvEl
    c.getDom().onmousedown = e => {
      console.log('default onmousedown')
      if (e.button === 1) {
        this.positionStart = this.unscale(new V(e.clientX, e.clientY)).sub(
          this.position
        )
        c.getDom().onmousemove = event => {
          console.log('default onmousemove')
          event.preventDefault()
          this.position = this.unscale(new V(event.clientX, event.clientY)).sub(
            this.positionStart
          )
          this.updateTransform()
        }
        document.onmouseup = event => {
          event.preventDefault()
          if (event.button === 1) c.getDom().onmousemove = null
          this.defaultMode()
        }
      } else if (e.button === 0) {
        let pos = this.clientPosToContainerPos(e.clientX, e.clientY)
        let n: Node | null = null
        if (this.snapedWallNode != null) {
          const p = this.snapedWallNode.getNode().getData<Vec2>('position')
          pos = new V(p.x, p.y)
          n = this.snapedWallNode.getNode()
        } else {
          n = this.bp.addWallNode(new Vector2(pos.x, pos.y))
        }
        const n2 = this.bp.addWallNode(new Vector2(pos.x, pos.y))
        this.bp.addWall(n, n2)
        document.onmousemove = e1 => {
          this.hideSnap()
          const p2 = this.clientPosToContainerPos(e1.clientX, e1.clientY)
          let snapX: Node | null = null
          let snapY: Node | null = null
          this.wallNodeMap.forEach((value: BpWallNode, key: Node) => {
            if (key === n2 || key === n) return
            const p = key.getData<Vec2>('position')
            if (Math.abs(p2.x - p.x) < this.optAlignSnapDist) {
              p2.x = p.x
              snapX = key
            }
            if (Math.abs(p2.y - p.y) < this.optAlignSnapDist) {
              p2.y = p.y
              snapY = key
            }
          })
          if (Vector2.norm(Vector2.minus(p2, pos)) > 0.1) {
            let angle = Vector2.angle(Vector2.minus(p2, pos))
            if (angle < 0) angle = Math.PI + (Math.PI + angle)
            let tmpTargetAngle = angle - (angle % this.optAngleSnapStep)
            if (angle % this.optAngleSnapStep > this.optAngleSnapStep / 2) {
              tmpTargetAngle += this.optAngleSnapStep
            }
            tmpTargetAngle = -tmpTargetAngle + Math.PI / 2
            const newP = Vector2.plus(
              Vector2.multiply(
                new Vector2(Math.cos(tmpTargetAngle), Math.sin(tmpTargetAngle)),
                Vector2.norm(Vector2.minus(p2, pos))
              ),
              pos
            )
            if (snapX !== null) newP.x = p2.x
            if (snapY !== null) newP.y = p2.y
            if (snapX !== null) this.displayXsnap(snapX, new V(newP.x, newP.y))
            if (snapY !== null) this.displayYsnap(snapY, new V(newP.x, newP.y))

            n2.setData<Vec2>('position', newP)
          }
        }
        document.onmouseup = e1 => {
          if (e1.button === 0) {
            this.defaultMode()
            document.onmouseup = null
            document.onmousemove = null
            this.hideSnap()
            this.wallNodeMap.forEach(value => {
              if (
                Vector2.norm(
                  Vector2.minus(
                    value.getNode().getData<Vec2>('position'),
                    n2.getData<Vec2>('position')
                  )
                ) < 2 &&
                value.getNode() !== n2
              ) {
                this.bp.addWall(n as Node, value.getNode())
                this.bp.removeWallNode(n2)
              }
            })
          }
        }
      }
      e.preventDefault()
    }
  }

  public moveNodeMode (node: Node) {
    this.container.getDom().onmousedown = null
    this.container.getDom().onmouseup = null
    this.container.getDom().onmousemove = null

    this.container.getDom().onmousemove = e => {
      // const pos = this.clientPosToContainerPos(e.clientX, e.clientY)
      // this.bp.addWall(n, n2)
      this.container.getDom().onmousemove = e1 => {
        this.hideSnap()
        const p2 = this.clientPosToContainerPos(e1.clientX, e1.clientY)
        let snapX: Node | null = null
        let snapY: Node | null = null
        this.wallNodeMap.forEach((value: BpWallNode, key: Node) => {
          if (key === node) return
          const p = key.getData<Vec2>('position')
          if (Math.abs(p2.x - p.x) < this.optAlignSnapDist) {
            p2.x = p.x
            snapX = key
          }
          if (Math.abs(p2.y - p.y) < this.optAlignSnapDist) {
            p2.y = p.y
            snapY = key
          }
        })

        if (snapX !== null) this.displayXsnap(snapX, new V(p2.x, p2.y))
        if (snapY !== null) this.displayYsnap(snapY, new V(p2.x, p2.y))

        node.setData<Vec2>('position', p2)
      }
    }
    document.onmouseup = e => {
      if (e.button === 2) {
        this.defaultMode()
        this.hideSnap()

        this.wallNodeMap.forEach(value => {
          if (
            Vector2.norm(
              Vector2.minus(
                value.getNode().getData<Vec2>('position'),
                node.getData<Vec2>('position')
              )
            ) < 2 &&
            value.getNode() !== node
          ) {
            // todo : merge nodes
          }
        })
      }
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
    const snapLineStyle = {
      'stroke-dasharray': `${2 / this.size},${3 / this.size}`,
      'stroke-width': `${1 / this.size}`
    }

    this.snapXLine.setStyle(snapLineStyle)
    this.snapYLine.setStyle(snapLineStyle)

    this.updateTransform()
  }

  public onMouseDown (event: MouseEvent) {
    if (this.container.getDom().onmousedown != null) {
      (this.container.getDom().onmousedown as { (e: MouseEvent): void })(event)
    }
  }

  public onMouseUp (event: MouseEvent) {
    if (this.container.getDom().onmouseup != null) {
      (this.container.getDom().onmouseup as { (e: MouseEvent): void })(event)
    }
  }

  public onMouseMove (event: MouseEvent) {
    if (this.container.getDom().onmousemove != null) {
      (this.container.getDom().onmousemove as { (e: MouseEvent): void })(event)
    }
  }

  updateTransform () {
    this.content.setStyle({
      transform: `scale(${this.size})`,
      left: `${this.position.x * this.size}px`,
      top: `${this.position.y * this.size}px`
    })
    this.svgLinkLayer.setStyle({
      transform: `translate(${this.position.x * this.size}px, ${this.position
        .y * this.size}px) scale(${this.size})`
    })
    this.svgNodeLayer.setStyle({
      transform: `translate(${this.position.x * this.size}px, ${this.position
        .y * this.size}px) scale(${this.size})`
    })
    this.refreshScaleViewer()
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

  defineScaleMode () {
    this.container.getDom().onmousedown = null
    this.container.getDom().onmouseup = null
    this.container.getDom().onmousemove = null

    this.container.setStyle({ cursor: 'crosshair' })

    this.container.getDom().onmousedown = e => {
      console.log('ruler onmousedown')
      if (e.button === 0) {
        const n1 = new Node()
        const p1 = this.clientPosToContainerPos(e.x, e.y)
        n1.setData<Vec2>('position', new Vector2(p1.x, p1.y))
        const n2 = new Node()
        n2.setData<Vec2>('position', new Vector2(p1.x, p1.y))
        const l = n1.addLink(n2)
        l.setData<number>('length', 0)

        const n1Display = new BpWallNode(n1, this)
        const n2Display = new BpWallNode(n2, this)
        const lDisplay = new BpWallLink(l, this)

        const oldScale = this.bp.getData<number>('scale')

        this.container.getDom().onmousemove = e2 => {
          console.log('ruler onmousemove')
          const p2 = this.clientPosToContainerPos(e2.x, e2.y)
          n2.setData<Vec2>('position', new Vector2(p2.x, p2.y))
          l.setData<number>('length', p1.sub(p2).norm() / oldScale)
          if (p1.sub(p2).norm() > 1) {
            this.bp.setData<number>('scale', (p1.sub(p2).norm() / 100))
          }
          n2Display.setPos(p2.x, p2.y)
          lDisplay.refreshPos()
          this.refreshScaleViewer()
          e2.preventDefault()
        }
        document.onmouseup = e3 => {
          console.log('ruler onmouseup')
          if (e.button === 0) {
            n1Display.destroy()
            n2Display.destroy()
            lDisplay.destroy()
            document.onmouseup = null
            this.defaultMode()
            this.container.setStyle({ cursor: 'auto' })
          }
          e3.preventDefault()
        }
      }
      e.preventDefault()
    }
  }
}
