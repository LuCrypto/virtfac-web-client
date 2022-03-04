import { NvNode } from './nv_node'
import { V } from './v'
import { NvEl } from './nv_el'
import { NvLink } from './nv_link'
// import { nextTick } from "vue";
import { NvTheme } from './nv_theme'
import { Link } from '@/utils/graph/link'

export class NvSocket {
  public type: string
  public parentNode: NvNode
  public tangent: V
  public container: NvEl
  public point: NvEl
  public color: string

  private id: number
  private static nextID = 0

  private text: string

  private nbLinkConnected = 0
  private hideWhenNotLinked = true

  private links: Set<NvLink>
  public foreachLink (func: { (l: NvLink): void }) {
    this.links.forEach(func)
  }

  public getHideWhenNotLinked (): boolean {
    return this.hideWhenNotLinked
  }

  public linkUnconnected (link: NvLink): void {
    this.nbLinkConnected--
    this.links.delete(link)
    if (this.hideWhenNotLinked && this.nbLinkConnected === 0) {
      (this.parentNode.getSocketContainerMap().get(this) as NvEl)
        .getDom()
        .removeChild(this.container.getDom())
      if (this.tooltip !== undefined) {
        //*
        this.parentNode
          .getRoot()
          .getContent()
          .getDom()
          .removeChild(this.tooltip.getDom())
        this.tooltip = undefined
        /**/
      }
    }
  }

  public linkConnected (link: NvLink): void {
    this.nbLinkConnected++
    this.links.add(link)
    if (this.hideWhenNotLinked && this.nbLinkConnected === 1) {
      (this.parentNode.getSocketContainerMap().get(this) as NvEl)
        .getDom()
        .appendChild(this.container.getDom())
    }
  }

  constructor (
    parentNode: NvNode,
    type: string,
    text: string,
    color: string | null,
    tangent: V
  ) {
    this.id = NvSocket.nextID++
    this.type = type
    this.parentNode = parentNode
    this.tangent = tangent
    this.text = text
    this.links = new Set<NvLink>()
    this.container = new NvEl('div', 'node-socket')
    this.point = new NvEl('div', 'node-socket-point')

    if (color != null && color !== '') {
      this.point.setStyle({ 'background-color': color, opacity: 1 })
      this.color = color
    } else {
      this.point.setStyle({ 'background-color': 'black', opacity: 1 })
      this.color = 'black'
    }

    this.container.appendChild(this.point)
    if (text != null && color !== '') {
      const title = new NvEl('div', 'node-socket-title', 'no-select')
      if (color != null && color !== '') {
        title.setStyle({ color: color })
      }
      title.getDom().innerHTML = text
      this.container.appendChild(title)
    }
    this.container.getDom().onmouseenter = e => NvSocket.mouseEnter(e, this)
    this.container.getDom().onmouseleave = e => NvSocket.mouseExit(e, this)
  }

  getMiddle (): V {
    const pointRect = this.point.getDom().getBoundingClientRect()
    const pointSize = new V(pointRect.width, pointRect.height)
    const pointPosition = new V(pointRect.x, pointRect.y)
    return pointPosition.add(pointSize.mult(0.5))
  }

  private tooltip: NvEl | undefined = undefined

  static mouseEnter (e: MouseEvent, socket: NvSocket) {
    if (socket.tooltip !== undefined) {
      socket.parentNode
        .getRoot()
        .getContent()
        .getDom()
        .removeChild(socket.tooltip.getDom())
    } else {
      const theme: NvTheme = socket.parentNode.getRoot().theme
      socket.tooltip = new NvEl('div', 'node')
      socket.tooltip.setStyle({
        'background-color': theme.nodeContentBackgroundColor
      })
      socket.links.forEach(l => {
        const p = new NvEl('p')
        const s: NvSocket =
          l.getSocketIn().id === socket.id ? l.getSocketOut() : l.getSocketIn()
        p.setStyle({ 'background-color': theme.nodeSocketBackgroundColor })
        p.setStyle({
          padding: '3px',
          'padding-left': '10px',
          'padding-right': '10px',
          margin: '5px'
        })
        // p.getDom().innerHTML = s.parentNode.getContent().getDom().innerHTML + ":" + s.text;
        p.getDom().innerHTML =
          s.parentNode.getText() /* .getContent().getDom().innerHTML */ +
          ' : ' +
          (l.link as Link).getData<number>('strength')
        // p.setStyle({ 'border-left':'5px solid', 'border-left-color':s.point.getDom().style.getPropertyValue('background-color') as string });
        p.getDom().style.setProperty(
          'border-' + theme.toolboxLinkBorderSide,
          theme.toolboxLinkBorderStyle
        )
        p.getDom().style.setProperty(
          'border-' + theme.toolboxLinkBorderSide + '-color',
          s.point.getDom().style.getPropertyValue('background-color') as string
        )
        if (
          l.getLink() !== undefined &&
          l.getLink()?.getData<number | undefined>('strength') !== undefined
        ) {
          p.getDom().style.setProperty(
            'border-' + theme.toolboxLinkTypeSide,
            theme.toolboxLinkTypeStyle
          )
          if ((l.getLink()?.getData<number>('strength') as number) > 0) {
            p.getDom().style.setProperty(
              'border-' + theme.toolboxLinkTypeSide + '-color',
              theme.toolboxIncreaseColor
            )
          } else {
            p.getDom().style.setProperty(
              'border-' + theme.toolboxLinkTypeSide + '-color',
              theme.toolboxDecreaseColor
            )
          }
        }
        p.setStyle({ color: theme.nodeTextColor })
        ;(socket.tooltip as NvEl).appendChild(p)
      })
      socket.parentNode
        .getRoot()
        .getContent()
        .appendChild(socket.tooltip)
      const rect = socket.container.getDom().getBoundingClientRect()
      const trect = socket.tooltip.getDom().getBoundingClientRect()
      const pos = socket.parentNode
        .getRoot()
        .clientPosToLocalPos(e.clientX, e.clientY)
      let delta = new V(0, 0)
      const distance = 10 * socket.parentNode.getRoot().getScale()
      if (socket.tangent.x < 0) delta.x = rect.x - trect.width - distance
      else if (socket.tangent.x === 0) {
        delta.x = rect.x - trect.width / 2 + rect.width / 2
      } else delta.x = rect.x + rect.width + distance
      if (socket.tangent.y < 0) delta.y = rect.y - trect.height - distance
      else if (socket.tangent.y === 0) {
        delta.y = rect.y - trect.height / 2 + rect.height / 2
      } else delta.y = rect.y + rect.height + distance
      delta = socket.parentNode.getRoot().clientPosToLocalPos(delta.x, delta.y)
      socket.tooltip.setStyle({ left: delta.x + 'px', top: delta.y + 'px' })
    }
  }

  static mouseExit (e: MouseEvent, socket: NvSocket) {
    if (socket.tooltip !== undefined) {
      //*
      socket.parentNode
        .getRoot()
        .getContent()
        .getDom()
        .removeChild(socket.tooltip.getDom())
      socket.tooltip = undefined
      /**/
    }
  }
}
