// import { V } from '@/utils/nodeViewer/v'
import { NvEl } from '@/utils/nodeViewer/nv_el'
import { Blueprint } from './blueprint'
import { Node } from '@/utils/graph/node'
import { Link } from '@/utils/graph/link'
import { BpWallNode } from '@/utils/routingAnalysis/bp_wallNode'
import { BpWallLink } from '@/utils/routingAnalysis/bp_wallLink'
import { BpTheme } from '@/utils/routingAnalysis/bp_theme'
// import { Vec2, Vector2 } from '../graph/Vec'
import { BpWindow, Destroyable } from './bp_window'
import { LocalEvent } from '../graph/localEvent'
import { Session } from '../session'
import V from '@/utils/vector'
import { APIAsset, APIBoundingBox } from '../models'
import { BpAssetCache } from './bp_APICache'
import { Graph } from '@/utils/graph/graph'
import { html } from 'd3'

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
    const relative = p.subV(this.center)
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

export interface BlueprintAPIAsset {
  id: number
  sprite: string
  box: APIBoundingBox
}

/**
 * manage nodes and links of the blueprint editor.
 */
export class BlueprintContainer {
  private mode:
    | 'WALL'
    | 'DOOR'
    | 'WINDOW'
    | 'SUPP_WALL'
    | 'SUPP_FURNITURE'
    | 'SCALE' = 'WALL'

  /**
   * The user interaction mode
   * @returns
   */
  public getMode ():
    | 'WALL'
    | 'DOOR'
    | 'WINDOW'
    | 'SUPP_WALL'
    | 'SUPP_FURNITURE'
    | 'SCALE' {
    return this.mode
  }

  private askMachineAsset: { (node: Node): void }

  public get selectedAsset (): BpAssetCache | null {
    return this._selectedAsset
  }

  public set selectedAsset (value: BpAssetCache | null) {
    this._selectedAsset = value
  }

  public onModeChanged = new LocalEvent<
    'WALL' | 'DOOR' | 'WINDOW' | 'SUPP_WALL' | 'SUPP_FURNITURE' | 'SCALE'
  >()

  /**
   * change the user interaction mode
   * @param mode
   */
  public setMode (
    mode: 'WALL' | 'DOOR' | 'WINDOW' | 'SUPP_WALL' | 'SUPP_FURNITURE'
  ): void {
    this.mode = mode
    switch (this.mode) {
      case 'WALL':
        this.defaultMode()
        break
      case 'SUPP_WALL':
        this.removeWallMode()
        break
      default:
        break
    }
    this.updateTheme()
    this.updateTransform()
    this.onModeChanged.notify(this.mode)
  }

  public _selectedAsset: BpAssetCache | null = null

  // #region SETTINGS
  /**
   * enable/disable aligning snapping
   */
  public optAlignSnap = true

  /**
   * snapping distance from aligning line.
   */
  public optAlignSnapDist = 10

  /**
   * enable/disable snapping from angles when adding new wall
   */
  public optAngleSnap = true

  /**
   * step size for available angles when adding new wall
   */
  public optAngleSnapStep: number = Math.PI / 4
  // #endregion

  /**
   * display theme
   */
  private theme: BpTheme

  /**
   * dom element that contain the component
   */
  private parentNode: HTMLElement
  private grid: Grid | null = null

  /**
   * update theme to match the website
   */
  updateThemeFromWeb (): void {
    if (Session.getTheme() === 'dark') {
      this.theme = new BpTheme()
    } else {
      this.theme = new BpTheme({
        BackgroundColor: '#F0F3F4',
        WallNodeColor: '#1E1E1E',
        WallLinkColor: '#363636'
      })
    }
    this.updateTheme()
  }

  /**
   * view zoom level
   */
  private size = 1
  /**
   *
   * @returns view zoom level
   */
  public scale (): number {
    return this.size
  }

  /**
   * view position
   */
  private position: V = new V(0, 0)

  private container: NvEl
  private content: NvEl
  private img: NvEl
  /**
   * container for wall nodes
   */
  private svgNodeLayer: NvEl
  /**
   * container for wall link
   */
  private svgLinkLayer: NvEl
  /**
   * container for furniture (door/window/workstation)
   */
  private svgFurnitureLayer: NvEl

  private svgRoutingLayer: NvEl

  private svgRoutingLinkLayer: NvEl

  /**
   * html components for the global scale displayer |--------|
   */
  private scaleDisplayer = {
    leftPoint: new NvEl('rect'),
    lineCol1: new NvEl('path'),
    lineCol2: new NvEl('path'),
    rightPoint: new NvEl('rect')
  }

  /**
   * kernel object
   */
  private bp: Blueprint

  public getBlueprint (): Blueprint {
    return this.bp
  }

  public getContainer (): NvEl {
    return this.container
  }

  private _routingGraph: Graph

  public get routingGraph (): Graph {
    return this._routingGraph
  }

  /**
   * references to displayer objects of WallNodes
   */
  private wallNodeMap: Map<Node, BpWallNode> = new Map<Node, BpWallNode>()

  /**
   * references to displayer objects of WallLink
   */
  private wallLinkMap: Map<Link, BpWallLink> = new Map<Link, BpWallLink>()

  /**
   *
   * @returns container for wall nodes
   */
  public getNodeLayer (): NvEl {
    return this.svgNodeLayer
  }

  /**
   * container for wall link
   */
  public getLinkLayer (): NvEl {
    return this.svgLinkLayer
  }

  public getFurnitureLayer (): NvEl {
    return this.svgFurnitureLayer
  }

  public getTheme (): BpTheme {
    return this.theme
  }

  private furniturePreview: BpWindow | null = null

  public setFurniturePreview (
    anchor: Node,
    wall: Link,
    originDistance: number,
    windowWidth: number,
    isDoor: boolean
  ): void {
    if (this.furniturePreview === null) {
      this.furniturePreview = new BpWindow(this)
    }
    this.furniturePreview.setPosition(
      anchor,
      wall,
      originDistance,
      windowWidth,
      isDoor
    )
  }

  public removeFurniturePreview (): void {
    if (this.furniturePreview !== null) {
      this.furniturePreview.destroy()
      this.furniturePreview = null
    }
  }

  public constructor (
    parentNode: HTMLElement,
    selectMachineAsset: { (node: Node): void }
  ) {
    // init UI elements
    this.askMachineAsset = selectMachineAsset
    this.theme = new BpTheme()
    this.bp = new Blueprint()
    this.parentNode = parentNode
    this.container = new NvEl('div')
    this.content = new NvEl('div')
    this.svgNodeLayer = new NvEl('svg')
    this.svgLinkLayer = new NvEl('svg')
    this.svgFurnitureLayer = new NvEl('svg')
    this.svgRoutingLayer = new NvEl('svg')
    this.svgRoutingLinkLayer = new NvEl('svg')
    this.img = new NvEl('img')
    this.content.appendChild(this.img)
    parentNode.appendChild(this.content.getDom())
    parentNode.appendChild(this.container.getDom())
    parentNode.appendChild(this.svgLinkLayer.getDom())
    parentNode.appendChild(this.svgNodeLayer.getDom())
    parentNode.appendChild(this.svgFurnitureLayer.getDom())
    parentNode.appendChild(this.svgRoutingLinkLayer.getDom())
    parentNode.appendChild(this.svgRoutingLayer.getDom())
    this.updateTransform()
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

    const layerStyle = {
      position: 'absolute',
      top: '0px',
      bottom: '0px',
      width: '100px',
      height: '100px',
      'transform-origin': '0px 0px',
      overflow: 'visible',
      'pointer-events': 'none'
    }
    this.svgLinkLayer.setStyle(layerStyle)
    this.svgNodeLayer.setStyle(layerStyle)
    this.svgFurnitureLayer.setStyle(layerStyle)
    this.svgRoutingLayer.setStyle(layerStyle)
    this.svgRoutingLinkLayer.setStyle(layerStyle)

    // init inputs listeners
    this.container.getDom().oncontextmenu = e => {
      e.preventDefault()
    }
    this.container.getDom().ondragover = e => {
      /*
      if (e.dataTransfer != null && e.dataTransfer.files.length > 0) {
        e.preventDefault()
        console.log('data transfer')
      } else {
        console.log('no data transfer')
      }
      */
      e.preventDefault()
    }
    this.container.getDom().ondrop = e => {
      // enable import of blueprint image from drag and drop
      if (e.dataTransfer != null && e.dataTransfer.files.length > 0) {
        const f: File | null = e.dataTransfer.files.item(0)
        try {
          if (f != null) {
            if (f.name.endsWith('.json')) {
              const fr = new FileReader()
              fr.onload = () => {
                this.bp.applyJSON(JSON.parse(fr.result as string))
              }
              fr.readAsText(f, 'utf8')
            } else {
              const fr = new FileReader()
              fr.onload = () => {
                this.img.getDom().setAttribute('src', fr.result as string)
              }
              fr.readAsDataURL(f)
            }
          }
        } catch (error) {
          console.error(error)
        }
      }
      e.preventDefault()
    }

    this.bp.setData<number>('scale', 1)

    // add a new wall node displayer when a wall node is created in the blueprint
    this.bp.onWallNodeAdded().addListener(arg => {
      this.wallNodeMap.set(arg.node, new BpWallNode(arg.node, this))
    })

    // refresh node displayer position when wall node is moved in blueprint
    this.bp.onWallNodeDataChanged().addMappedListener(
      'position',
      arg => {
        (this.wallNodeMap.get(arg.node) as BpWallNode).setPos(
          (arg.value as V).x,
          (arg.value as V).y
        )
      },
      this
    )

    // add a new wall link displayer when a wall is created in the blueprint
    this.bp.onWallLinkAdded().addListener(arg => {
      this.wallLinkMap.set(arg.link, new BpWallLink(arg.link, this))
    })

    // refresh wall link display when a wall node is moved in the blueprint
    this.bp.onWallLinkDataChanged().addMappedListener('length', arg => {
      if (this.wallLinkMap.get(arg.link) !== undefined) {
        (this.wallLinkMap.get(arg.link) as BpWallLink).refreshPos()
      }
    })

    // remove wall node display when a node is removed in the blueprint
    this.bp.onWallNodeRemoved().addListener(arg => {
      (this.wallNodeMap.get(arg.node) as BpWallNode).destroy()
      this.wallNodeMap.delete(arg.node)
    }, this)

    // remove wall link when a wall is removed in the blueprint
    this.bp.onWallLinkRemoved().addListener(arg => {
      (this.wallLinkMap.get(arg.link) as BpWallLink).destroy()
      arg.link
        .getDataOrDefault<Set<Destroyable>>(
          'wallFurniture',
          new Set<Destroyable>()
        )
        .forEach(item => item.destroy())
      this.wallLinkMap.delete(arg.link)
    })

    this._routingGraph = new Graph()

    interface RoutingNode {
      rect: NvEl
      text: NvEl
      move: NvEl
      edit: NvEl
      sprite: NvEl
      rotate: NvEl
    }

    this._routingGraph
      .onNodeDataChanged()
      .addMappedListener('assetCache', arg => {
        const node = arg.node
        const asset = node.getData<BpAssetCache>('assetCache')
        node.setData('dimension', {
          x:
            (asset.boundingBox.maxCorner.x - asset.boundingBox.minCorner.x) *
            100,
          y:
            (asset.boundingBox.maxCorner.z - asset.boundingBox.minCorner.z) *
            100
        })
        const display = node.getData<RoutingNode>('blueprintDisplayer')
        const sprite = display.sprite.getDom() as SVGImageElement
        sprite.setAttribute('href', asset.layoutSprite)
        // sprite.setAttribute('width', )
      })

    this._routingGraph.onLinkAdded().addListener(arg => {
      const path = new NvEl('path')
      path.setStyle({
        'pointer-events': 'none',
        opacity: '0.5',
        stroke: 'currentColor',
        'stroke-width': '2'
      })
      const refresh = () => {
        const p1 = arg.link
          .getOriginNode()
          .getData<{ x: number; y: number }>('position')
        const p2 = arg.link
          .getNode()
          .getData<{ x: number; y: number }>('position')
        path
          .getDom()
          .setAttribute(
            'd',
            `M${new V(p1.x, p1.y).toString()} L${new V(p2.x, p2.y).toString()}`
          )
      }
      refresh()
      arg.link
        .getNode()
        .onDataChanged()
        .addMappedListener('position', refresh)
      arg.link
        .getOriginNode()
        .onDataChanged()
        .addMappedListener('position', refresh)
      arg.link
        .getNode()
        .onDataChanged()
        .addMappedListener('position', refresh)
      this.svgRoutingLinkLayer.appendChild(path)
    })
    this._routingGraph.onNodeAdded().addListener(arg => {
      const node = arg.node
      const rect = new NvEl('rect')
      const text = new NvEl('text')
      const move = new NvEl('path')
      const edit = new NvEl('path')
      const rotate = new NvEl('path')
      const sprite = new NvEl('image')
      rect.setStyle({ 'pointer-events': 'none' })
      text.setStyle({ 'pointer-events': 'none', 'user-select': 'none' })
      sprite.setStyle({
        'pointer-events': 'none',
        'user-select': 'none',
        filter: 'drop-shadow(rgba(0, 0, 0, 0.2) 0px 0px 6px)'
      })
      move
        .getDom()
        .setAttribute(
          'd',
          'M13,6V11H18V7.75L22.25,12L18,16.25V13H13V18H16.25L12,22.25L7.75,18H11V13H6V16.25L1.75,12L6,7.75V11H11V6H7.75L12,1.75L16.25,6H13Z'
        )
      edit
        .getDom()
        .setAttribute(
          'd',
          'M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5M12,4.15L6.04,7.5L12,10.85L17.96,7.5L12,4.15Z'
        )
      rotate
        .getDom()
        .setAttribute(
          'd',
          'M7.47,21.5C4.2,19.93 1.86,16.76 1.5,13H0C0.5,19.16 5.66,24 11.95,24C12.18,24 12.39,24 12.61,23.97L8.8,20.15L7.47,21.5M12.05,0C11.82,0 11.61,0 11.39,0.04L15.2,3.85L16.53,2.5C19.8,4.07 22.14,7.24 22.5,11H24C23.5,4.84 18.34,0 12.05,0M16,14H18V8C18,6.89 17.1,6 16,6H10V8H16V14M8,16V4H6V6H4V8H6V16A2,2 0 0,0 8,18H16V20H18V18H20V16H8Z'
        )
      move.setStyle({ fill: 'currentColor', 'pointer-events': 'bounding-box' })
      edit.setStyle({ fill: 'currentColor', 'pointer-events': 'bounding-box' })
      rotate.setStyle({
        fill: 'currentColor',
        'pointer-events': 'bounding-box'
      })
      text.setStyle({ fill: 'currentColor' })
      move.getDom().onmousedown = e => {
        if (e.button === 2) {
          this.moveNodeMode(node, this._routingGraph)
        }
        e.preventDefault()
        // move.setStyle({ 'pointer-events': 'none' })
      }
      ;[move, edit, rotate].forEach(elem => {
        elem.getDom().onmouseenter = e => {
          elem.setStyle({ fill: '#f5a406' })
          e.preventDefault()
        }
        elem.getDom().onmouseleave = e => {
          elem.setStyle({ fill: 'currentColor' })
          e.preventDefault()
        }
        elem.getDom().onmousemove = e => {
          this.onMouseMove(e)
        }
      })
      move.getDom().onmouseup = e => {
        this.onMouseUp(e)
      }
      edit.getDom().onmousedown = e => {
        e.preventDefault()
      }
      edit.getDom().onmouseup = e => {
        if (e.button === 0) {
          this.askMachineAsset(node)

          /* .then(res => {
            if (res !== null) {
              node.setData<{ x: number; y: number }>('dimension', {
                x: res.boundingBox.maxCorner.x - res.boundingBox.minCorner.x,
                y: res.boundingBox.maxCorner.y - res.boundingBox.minCorner.y
              })
            }
          })
          */
        }
      }
      rotate.getDom().onmousedown = e => {
        e.preventDefault()
      }
      rotate.getDom().onmouseup = e => {
        node.setData<number>(
          'rotation',
          (node.getDataOrDefault<number>('rotation', 0) + 90) % 360
        )
      }

      move.getDom().onmousemove = this.container.getDom().onmousemove
      this.svgRoutingLayer.appendChild(rect, sprite, text, move, edit, rotate)
      node.setData<RoutingNode>('blueprintDisplayer', {
        rect: rect,
        text: text,
        move: move,
        edit: edit,
        sprite: sprite,
        rotate: rotate
      })
      rect.getDom().setAttribute('stroke', 'currentColor')
      rect.setStyle({ fill: 'none' })
      // rect.getDom().setAttribute('fill', 'rgba(128,128,128,0.1)')
    })

    // this._routingGraph.onNodeDataChanged('')
    const updateRoutingNode = (node: Node) => {
      const displayer = node.getData<RoutingNode>('blueprintDisplayer')
      const rect = displayer.rect.getDom() as SVGRectElement
      const text = displayer.text.getDom() as SVGTextElement
      const sprite = displayer.sprite.getDom() as SVGImageElement

      const rotate = node.getDataOrDefault<number>('rotation', 0)
      const scale = this.bp.getDataOrDefault<number>('scale', 1)
      {
        const v = node.getData<{ x: number; y: number } | undefined>(
          'dimension'
        )
        if (v !== undefined) {
          const val = { x: v.x * scale, y: v.y * scale }
          rect.setAttribute('width', val.x + '')
          rect.setAttribute('height', val.y + '')
          sprite.setAttribute('width', val.x + '')
          sprite.setAttribute('height', val.y + '')
          {
            const vec = node.getData<{ x: number; y: number } | undefined>(
              'position'
            )
            if (vec !== undefined) {
              rect.style.transformOrigin = `${val.x / 2}px ${val.y / 2}px`
              rect.style.setProperty(
                'transform',
                `translate(${vec.x - val.x / 2}px, ${vec.y -
                  val.y / 2}px) rotate(${rotate}deg)`
              )
              text.style.setProperty(
                'transform',
                `translate(${vec.x - val.x / 2}px, ${vec.y - val.y / 2}px)`
              )
              sprite.style.transformOrigin = `${val.x / 2}px ${val.y / 2}px`
              sprite.style.setProperty(
                'transform',
                `translate(${vec.x - val.x / 2}px, ${vec.y -
                  val.y / 2}px) rotate(${rotate}deg)`
              )
              displayer.move.setStyle({
                transform: `translate(${vec.x -
                val.x / 2 /** scale */ +
                  2}px, ${vec.y - val.y / 2 /** scale */ + 2}px)`
              })
              displayer.edit.setStyle({
                transform: `translate(${vec.x -
                val.x / 2 /** scale */ +
                  26}px, ${vec.y - val.y / 2 /** scale */ + 2}px)`
              })
              displayer.rotate.setStyle({
                transform: `translate(${vec.x -
                val.x / 2 /** scale */ +
                  2}px, ${vec.y - val.y / 2 /** scale */ + 26}px)`
              })
            }
          }
        }
      }
      {
        const color = node.getData<string | undefined>('color')
        if (color !== undefined) {
          rect.style.setProperty('fill', color + '88')
        }
      }
      text.innerHTML = node.getData<string>('name')
    }

    this.bp.onDataChanged().addMappedListener('scale', arg => {
      this._routingGraph.foreachNode(n => updateRoutingNode(n))
    })
    this._routingGraph
      .onNodeDataChanged()
      .addMappedListener('dimension', arg => {
        /*
        const rect = arg.node
          .getData<NvEl>('blueprintDisplayer')
          .getDom() as SVGRectElement
        const val = arg.value as { x: number; y: number }
        rect.setAttribute('width', val.x + '')
        rect.setAttribute('height', val.y + '')
        */
        updateRoutingNode(arg.node)
      })

    this._routingGraph
      .onNodeDataChanged()
      .addMappedListener('position', arg => {
        /*
        const rect = arg.node
          .getData<NvEl>('blueprintDisplayer')
          .getDom() as SVGRectElement
        const vec = arg.value as { x: number; y: number }
        rect.style.setProperty('transform', `translate(${vec.x}px, ${vec.y}px)`)
        */
        updateRoutingNode(arg.node)
      })
    this._routingGraph
      .onNodeDataChanged()
      .addMappedListener('rotation', arg => {
        updateRoutingNode(arg.node)
      })
    // alignement snapping display
    this.snapXLine = new NvEl('path')
    this.snapYLine = new NvEl('path')

    const snapLineStyle = {
      'pointer-events': 'none',
      'stroke-dasharray': '2,3',
      'stroke-width': '1'
    }

    this.snapXLine.setStyle(snapLineStyle)
    this.snapYLine.setStyle(snapLineStyle)

    this.svgLinkLayer.appendChild(this.snapXLine, this.snapYLine)

    // debug point display
    this.testPoint.getDom().setAttribute('width', `${6}`)
    this.testPoint.getDom().setAttribute('height', `${6}`)
    this.testPoint.setStyle({ 'pointer-events': 'none' })
    // this.getNodeLayer().appendChild(this.testPoint)

    // init display of global scale
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

    const path = `M${new V(0, 0).toString()} L${new V(100, 0).toString()}`
    this.scaleDisplayer.lineCol1.getDom().setAttribute('d', path)
    this.scaleDisplayer.lineCol2.getDom().setAttribute('d', path)

    scaleSvgContainer.appendChild(
      this.scaleDisplayer.lineCol1,
      this.scaleDisplayer.lineCol2,
      this.scaleDisplayer.leftPoint,
      this.scaleDisplayer.rightPoint
    )

    this.container.appendChild(scaleSvgContainer)

    this.updateTheme()
  }

  public updateTheme (): void {
    this.snapXLine.setStyle({ stroke: `${this.theme.WallSnapLineColor}` })
    this.snapYLine.setStyle({ stroke: `${this.theme.WallSnapLineColor}` })

    // scale diplayer
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

    this.refreshScaleViewer()

    this.wallNodeMap.forEach(value => {
      value.updateTheme()
    })

    this.wallLinkMap.forEach(value => {
      value.updateTheme()
    })
  }

  public refreshScaleViewer (): void {
    const right = 100 * this.bp.getData<number>('scale') * this.size
    const path = `M${new V(0, 0).toString()} L${new V(right, 0).toString()}`
    this.scaleDisplayer.lineCol1.getDom().setAttribute('d', path)
    this.scaleDisplayer.lineCol2.getDom().setAttribute('d', path)
    this.scaleDisplayer.rightPoint.setStyle({
      transform: `translate(${right - this.theme.WallNodeSize / 4}px, ${-this
        .theme.WallNodeSize / 2}px)`
    })
  }

  /**
   * convert mouse position to blueprint position
   * @param x MouseEvent.ClientX
   * @param y MouseEvent.ClientY
   * @returns the blueprint scope position
   */
  public clientPosToContainerPos (x: number, y: number): V {
    const rect = this.container.getDom().getBoundingClientRect()
    return new V(
      (x - rect.x + 100) / this.size - this.position.x,
      (y - rect.y + 100) / this.size - this.position.y
    )
  }

  public snap (p: V): V {
    if (this.grid != null) {
      return this.grid.snap(p)
    }
    return p
  }

  public resetGrid (): void {
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
            .subV(this.grid.getCenter())
            .absV()
        )
        this.updateTransform()
      }

      this.container.getDom().onmouseup = () => {
        this.container.getDom().onmousemove = null
        this.container.getDom().onmouseup = null
        this.defaultMode()
      }
    }
  }

  private snapXLine: NvEl
  private snapYLine: NvEl

  /**
   * display line of snap for horizontal snapping
   * @param node origin of snap line
   * @param snappedPos snapped position
   */
  private displayXsnap (node: Node, snappedPos: V) {
    const p = node.getData<V>('position')
    this.snapXLine
      .getDom()
      .setAttribute(
        'd',
        `M${new V(p.x, p.y).toString()} L${snappedPos.toString()}`
      )
  }

  /**
   * display line of snap for vertical snapping
   * @param node origin of snap line
   * @param snappedPos snapped position
   */
  private displayYsnap (node: Node, snappedPos: V) {
    const p = node.getData<V>('position')
    this.snapYLine
      .getDom()
      .setAttribute(
        'd',
        `M${new V(p.x, p.y).toString()} L${snappedPos.toString()}`
      )
  }

  /**
   * disable display of snap lines
   */
  private hideSnap () {
    this.snapXLine.getDom().setAttribute('d', '')
    this.snapYLine.getDom().setAttribute('d', '')
  }

  private hoveredNode: BpWallNode | null = null

  private positionStart: V = new V(0, 0)

  public testPoint = new NvEl('rect')

  /**
   * set user interaction to place wall
   */
  public defaultMode (): void {
    this.container.getDom().onmousedown = null
    this.container.getDom().onmouseup = null
    this.container.getDom().onmousemove = null

    this.container.getDom().onmousemove = () => {
      /*
      const clientPos = this.clientPosToContainerPos(e.clientX, e.clientY)

      this.testPoint.setStyle({
        transform: `translate(${clientPos.x - 3}px, ${clientPos.y - 3}px)`
      })
      if (this.bp.isInside(new Vector2(clientPos.x, clientPos.y))) {
        this.testPoint.setStyle({ fill: '#2ECC71' })
      } else {
        this.testPoint.setStyle({ fill: '#E74C3C' })
      }
      */
    }

    const c = this.container as NvEl
    c.getDom().onmousedown = e => {
      if (e.button === 1) {
        // movement
        this.positionStart = this.unscale(new V(e.clientX, e.clientY)).subV(
          this.position
        )
        c.getDom().onmousemove = event => {
          event.preventDefault()
          this.position = this.unscale(
            new V(event.clientX, event.clientY)
          ).subV(this.positionStart)
          this.updateTransform()
        }
        document.onmouseup = event => {
          event.preventDefault()
          if (event.button === 1) c.getDom().onmousemove = null
          this.defaultMode()
        }
      } else if (e.button === 0) {
        // new wall
        let pos = this.clientPosToContainerPos(e.clientX, e.clientY)
        let n: Node | null = null
        if (this.hoveredNode != null) {
          // create wall from snapedWallNode
          const p = this.hoveredNode.getNode().getData<V>('position')
          pos = new V(p.x, p.y)
          n = this.hoveredNode.getNode()
        } else {
          // create wall from new node
          n = this.bp.addWallNode(new V(pos.x, pos.y))
        }
        // end point wall node
        const n2 = this.bp.addWallNode(new V(pos.x, pos.y))
        this.bp.addWall(n, n2)
        document.onmousemove = e1 => {
          // positioning end point of the wall
          e1.preventDefault()
          this.hideSnap()
          const p2 = this.clientPosToContainerPos(e1.clientX, e1.clientY)

          // check for snapping lines
          let snapX: Node | null = null
          let snapY: Node | null = null
          this.wallNodeMap.forEach((value: BpWallNode, key: Node) => {
            if (key === n2 || key === n) return
            const p = key.getData<V>('position')
            if (Math.abs(p2.x - p.x) < this.optAlignSnapDist) {
              p2.x = p.x
              snapX = key
            }
            if (Math.abs(p2.y - p.y) < this.optAlignSnapDist) {
              p2.y = p.y
              snapY = key
            }
          })
          if (p2.distanceTo(pos) > 0.1) {
            // snapping angle
            let angle = p2.subV(pos).angle()
            if (angle < 0) angle = Math.PI + (Math.PI + angle)
            let tmpTargetAngle = angle - (angle % this.optAngleSnapStep)
            if (angle % this.optAngleSnapStep > this.optAngleSnapStep / 2) {
              tmpTargetAngle += this.optAngleSnapStep
            }
            tmpTargetAngle = -tmpTargetAngle + Math.PI / 2
            const newP = new V(
              Math.cos(tmpTargetAngle),
              Math.sin(tmpTargetAngle)
            )
              .multN(p2.distanceTo(pos))
              .addV(pos)

            // apply snap lines
            if (snapX !== null) newP.x = p2.x
            if (snapY !== null) newP.y = p2.y
            if (snapX !== null) this.displayXsnap(snapX, new V(newP.x, newP.y))
            if (snapY !== null) this.displayYsnap(snapY, new V(newP.x, newP.y))

            n2.setData<V>('position', newP)
          }
        }
        document.onmouseup = e1 => {
          if (e1.button === 0) {
            // end positioning of the end point wall node
            this.defaultMode()
            document.onmouseup = null
            document.onmousemove = null
            this.hideSnap()
            // check for merging end point node to an existing node
            this.wallNodeMap.forEach(value => {
              if (
                value
                  .getNode()
                  .getData<V>('position')
                  .distanceTo(n2.getData<V>('position')) < 2 &&
                value.getNode() !== n2
              ) {
                if (
                  (n as Node).getLink(value.getNode()) === undefined &&
                  value.getNode().getLink(n as Node) === undefined
                ) {
                  this.bp.addWall(n as Node, value.getNode())
                }
                this.bp.removeWallNode(n2)
              }
            })
          }
          e1.preventDefault()
        }
      }
      e.preventDefault()
    }
  }

  public hoveredWall: BpWallLink | null = null

  public removeWallMode (): void {
    this.container.getDom().onmousedown = null
    this.container.getDom().onmouseup = null
    this.container.getDom().onmousemove = null
  }

  public moveNodeMode (node: Node, graph: Graph): void {
    this.container.getDom().onmousedown = null
    this.container.getDom().onmouseup = null
    this.container.getDom().onmousemove = null

    this.container.getDom().onmousemove = () => {
      // const pos = this.clientPosToContainerPos(e.clientX, e.clientY)
      // this.bp.addWall(n, n2)
      this.container.getDom().onmousemove = e1 => {
        this.hideSnap()
        const p2 = this.clientPosToContainerPos(e1.clientX, e1.clientY)
        let snapX: Node | null = null
        let snapY: Node | null = null
        // check for snapping line when moving node
        graph.foreachNode(key => {
          if (key === node) return
          const p = key.getData<V>('position')
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

        node.setData<V>('position', p2)
      }
    }
    document.onmouseup = e => {
      e.preventDefault()
      if (e.button === 2) {
        // end moving point
        document.onmouseup = null
        this.defaultMode()
        this.hideSnap()

        if (graph === this.bp.getGraph()) {
          // check for merge on existing node
          this.wallNodeMap.forEach(value => {
            if (
              value
                .getNode()
                .getData<V>('position')
                .distanceTo(node.getData<V>('position')) < 2 &&
              value.getNode() !== node
            ) {
              node.foreachLink(l => {
                if (l.getNode() !== value.getNode()) {
                  // value.getNode().addLink(l.getNode())
                  if (
                    l.getNode().getLink(value.getNode()) === undefined &&
                    value.getNode().getLink(l.getNode()) === undefined
                  ) {
                    this.bp.addWall(value.getNode(), l.getNode())
                  }
                }
              })
              node
                .getDataOrDefault<Set<Node>>('targetBy', new Set<Node>())
                .forEach(item => {
                  if (item !== value.getNode()) {
                    if (
                      item.getLink(value.getNode()) === undefined &&
                      value.getNode().getLink(item) === undefined
                    ) {
                      this.bp.addWall(item, value.getNode())
                    }
                  }
                })
              this.bp.removeWallNode(node)
            }
          })
        }
      }
    }
  }

  /**
   * called when mouse enter the collider of a wall node
   * @param node
   */
  public wallNodeEnter (node: BpWallNode): void {
    this.hoveredNode = node
  }

  /**
   * call when mouse exit the collider of a wall node
   * @param node
   */
  public wallNodeExit (node: BpWallNode): void {
    if (this.hoveredNode === node) this.hoveredNode = null
  }

  public unscale (v: V): V {
    return v.multN(1 / this.size)
  }

  public zoom (event: WheelEvent): void {
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

    this.positionStart = this.unscale(new V(event.clientX, event.clientY)).subV(
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

  /**
   * used for redirection of mouse event from child dom elements
   * @param event
   */
  public onMouseDown (event: MouseEvent): void {
    if (this.container.getDom().onmousedown != null) {
      (this.container.getDom().onmousedown as { (e: MouseEvent): void })(event)
    }
  }

  /**
   * used for redirection of mouse event from child dom elements
   * @param event
   */
  public onMouseUp (event: MouseEvent): void {
    if (this.container.getDom().onmouseup != null) {
      (this.container.getDom().onmouseup as { (e: MouseEvent): void })(event)
    }
  }

  /**
   * used for redirection of mouse event from child dom elements
   * @param event
   */
  public onMouseMove (event: MouseEvent): void {
    if (this.container.getDom().onmousemove != null) {
      (this.container.getDom().onmousemove as { (e: MouseEvent): void })(event)
    }
  }

  updateTransform (): void {
    this.content.setStyle({
      transform: `scale(${this.size})`,
      left: `${this.position.x * this.size - 100}px`,
      top: `${this.position.y * this.size - 100}px`
    })
    new Array<NvEl>(
      this.svgLinkLayer,
      this.svgNodeLayer,
      this.svgFurnitureLayer,
      this.svgRoutingLinkLayer,
      this.svgRoutingLayer
    ).forEach(htmlEl =>
      htmlEl.setStyle({
        transform: `translate(${this.position.x * this.size - 100}px, ${this
          .position.y *
          this.size -
          100}px) scale(${this.size})`
      })
    )
    /*
    this.svgRoutingLayer.setStyle({
      transform: `translate(${this.position.x * this.size - 100}px, ${this
        .position.y *
        this.size -
        100}px) scale(${this.size * this.bp.getData<number>('scale')})`
    })
    */
    /*
    this.svgNodeLayer.setStyle({
      transform: `translate(${this.position.x * this.size - 100}px, ${this
        .position.y *
        this.size -
        100}px) scale(${this.size})`
    })
    this.svgFurnitureLayer.setStyle({
      transform: `translate(${this.position.x * this.size - 100}px, ${this
        .position.y *
        this.size -
        100}px) scale(${this.size})`
    })
    */
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

  /**
   * user interaction mode to define global scale
   * @param refDist
   */
  defineScaleMode (refDist = 1): void {
    this.mode = 'SCALE'
    this.onModeChanged.notify(this.mode)

    this.container.getDom().onmousedown = null
    this.container.getDom().onmouseup = null
    this.container.getDom().onmousemove = null

    this.container.setStyle({ cursor: 'crosshair' })

    this.container.getDom().onmousedown = e => {
      if (e.button === 0) {
        const n1 = new Node()
        const p1 = this.clientPosToContainerPos(e.x, e.y)
        n1.setData<V>('position', new V(p1.x, p1.y))
        const n2 = new Node()
        n2.setData<V>('position', new V(p1.x, p1.y))
        const l = n1.addLink(n2)
        l.setData<number>('length', 0)

        const n1Display = new BpWallNode(n1, this)
        const n2Display = new BpWallNode(n2, this)
        const lDisplay = new BpWallLink(l, this)

        const oldScale = this.bp.getData<number>('scale')

        this.container.getDom().onmousemove = e2 => {
          const p2 = this.clientPosToContainerPos(e2.x, e2.y)
          n2.setData<V>('position', new V(p2.x, p2.y))
          l.setData<number>('length', p1.distanceTo(p2) / oldScale)
          if (p1.distanceTo(p2) > 1) {
            this.bp.setData<number>('scale', p1.distanceTo(p2) / refDist / 100)
          }
          n2Display.setPos(p2.x, p2.y)
          lDisplay.refreshPos()
          this.refreshScaleViewer()
          e2.preventDefault()
        }
        document.onmouseup = e3 => {
          if (e.button === 0) {
            n1Display.destroy()
            n2Display.destroy()
            lDisplay.destroy()
            document.onmouseup = null
            this.hoveredNode = null
            // this.defaultMode()
            this.setMode('WALL')
            this.onModeChanged.notify(this.mode)
            this.container.setStyle({ cursor: 'auto' })
          }
          e3.preventDefault()
        }
      }
      e.preventDefault()
    }
  }
}
