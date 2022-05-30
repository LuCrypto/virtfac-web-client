import { ArrayUtils } from '@/utils/graph/arrayUtils'
import { NvEl } from './nv_el'
import { NvNode } from './nv_node'
import { NvContainer } from './nv_container'
import { NvSocket } from './nv_socket'
import { V } from './v'
import { Link } from '@/utils/graph/link'

export class NvLink {
  private static id = 0

  private root: NvContainer
  private socketIn: NvSocket
  public getSocketIn (): NvSocket {
    return this.socketIn
  }

  private socketOut: NvSocket
  public getSocketOut (): NvSocket {
    return this.socketOut
  }

  private nodeIn: NvNode
  private nodeOut: NvNode

  private cpath: Array<V> | undefined = undefined

  private pointerEventPath: NvEl

  private path: NvEl
  public getPath (): NvEl {
    return this.path
  }

  public link: Link | undefined = undefined
  public getLink (): Link | undefined {
    return this.link
  }

  public setLink (link: Link | undefined = undefined): void {
    if (this.link !== undefined) {
      this.link.onDataChanged().removeMappedListener('width', this)
    }
    this.link = link
    if (this.link !== undefined) {
      if (this.link.getData<number | undefined>('width') !== undefined) {
        this.path
          .getDom()
          .setAttribute('stroke-width', '' + link?.getData<number>('width'))
      }
      this.link.onDataChanged().addMappedListener('width', arg => {
        this.path
          .getDom()
          .setAttribute('stroke-width', (arg.value as number) * 2 + '')
      })
    }
  }

  constructor (
    root: NvContainer,
    socketIn: NvSocket,
    socketOut: NvSocket,
    delta: { (): V }
  ) {
    this.root = root
    this.socketIn = socketIn
    this.nodeIn = socketIn.parentNode
    this.socketOut = socketOut
    this.nodeOut = socketOut.parentNode
    this.delta = delta

    NvLink.id++
    this.path = new NvEl('path')
    this.path
      .getDom()
      .setAttribute(
        'stroke',
        socketIn.point
          .getDom()
          .style.getPropertyValue('background-color') as string
      )
    // this.path.getDom().onmouseover = (e) => {NV_Link.mouseOver(e, this)};
    this.pointerEventPath = new NvEl('path')

    this.pointerEventPath.setStyle({ 'pointer-events': 'visiblestroke' })

    this.path.setStyle({ 'pointer-events': 'none' })
    this.pointerEventPath.getDom().onmouseenter = () => {
      this.pointerEventPath.getDom().onmousemove = e => {
        NvLink.mouseMove(e, this)
      }
    }
    this.pointerEventPath.getDom().setAttribute('stroke', '#FF000000')
    this.pointerEventPath.getDom().setAttribute('stroke-width', '10')
    this.pointerEventPath.getDom().onmouseleave = e => {
      this.pointerEventPath.getDom().onmousemove = null
      NvLink.mouseExit(e, this)
    }
    // this.path.getDom().setAttribute('stroke', 'red');
    this.root.getBackground().appendChild(this.pointerEventPath)
  }

  private tooltip: NvEl | undefined = undefined

  public static mouseMove (event: MouseEvent, nvLink: NvLink): void {
    if (nvLink.tooltip === undefined) {
      const theme = nvLink.nodeIn.getRoot().theme
      nvLink.tooltip = new NvEl('div', 'node')
      nvLink.tooltip.setStyle({
        'background-color': theme.nodeContentBackgroundColor,
        'z-index': '1',
        'pointer-events': 'none',
        'transform-origin': '0 0 0',
        transform: `scale(${Math.max(0.725 / nvLink.root.getScale(), 1)})`
      })

      nvLink.root.onScaleChanged().addListener(() => {
        (nvLink.tooltip as NvEl).setStyle({
          transform: `scale(${Math.max(0.725 / nvLink.root.getScale(), 1)})`
        })
      }, nvLink)

      {
        const p = new NvEl('p')
        p.setStyle({ 'background-color': theme.nodeSocketBackgroundColor })
        p.setStyle({
          padding: '3px',
          'padding-left': '10px',
          'padding-right': '10px',
          margin: '5px'
        })
        p.getDom().innerHTML =
          'from : ' + nvLink.nodeIn.getContent().getDom().innerHTML
        p.getDom().style.setProperty(
          'border-' + theme.toolboxLinkBorderSide,
          theme.toolboxLinkBorderStyle
        )
        p.getDom().style.setProperty(
          'border-' + theme.toolboxLinkBorderSide + '-color',
          nvLink.socketIn.point
            .getDom()
            .style.getPropertyValue('background-color') as string
        )

        p.setStyle({ color: theme.nodeTextColor })
        nvLink.tooltip.appendChild(p)
      }
      {
        const p = new NvEl('p')
        p.setStyle({ 'background-color': theme.nodeSocketBackgroundColor })
        p.setStyle({
          padding: '3px',
          'padding-left': '10px',
          'padding-right': '10px',
          margin: '5px'
        })
        // p.getDom().innerHTML = s.parentNode.getContent().getDom().innerHTML + ":" + s.text;
        p.getDom().innerHTML =
          'to   : ' + nvLink.nodeOut.getContent().getDom().innerHTML
        // p.setStyle({ 'border-left':'5px solid', 'border-left-color':s.point.getDom().style.getPropertyValue('background-color') as string });
        p.getDom().style.setProperty(
          'border-' + theme.toolboxLinkBorderSide,
          theme.toolboxLinkBorderStyle
        )
        p.getDom().style.setProperty(
          'border-' + theme.toolboxLinkBorderSide + '-color',
          nvLink.socketOut.point
            .getDom()
            .style.getPropertyValue('background-color') as string
        )

        p.setStyle({ color: theme.nodeTextColor })
        nvLink.tooltip.appendChild(p)
      }

      if (
        nvLink.getLink() !== undefined &&
        nvLink.getLink()?.getData<number | undefined>('strength') !== undefined
      ) {
        nvLink.tooltip
          .getDom()
          .style.setProperty(
            'border-' + theme.toolboxLinkTypeSide,
            theme.toolboxLinkTypeStyle
          )
        if ((nvLink.getLink()?.getData<number>('strength') as number) > 0) {
          nvLink.tooltip
            .getDom()
            .style.setProperty(
              'border-' + theme.toolboxLinkTypeSide + '-color',
              theme.toolboxIncreaseColor
            )
        } else {
          nvLink.tooltip
            .getDom()
            .style.setProperty(
              'border-' + theme.toolboxLinkTypeSide + '-color',
              theme.toolboxDecreaseColor
            )
        }
      }
    }
    const distance = new V(10, 10)
    const pos = nvLink.nodeIn
      .getRoot()
      .clientPosToLocalPos(event.clientX, event.clientY)
      .add(distance)
    nvLink.tooltip.setStyle({ left: pos.x + 'px', top: pos.y + 'px' })
    nvLink.nodeIn
      .getRoot()
      .getContent()
      .appendChild(nvLink.tooltip)
  }

  public static mouseExit (event: MouseEvent, nvLink: NvLink): void {
    if (nvLink.tooltip !== undefined) {
      nvLink.nodeIn
        .getRoot()
        .getContent()
        .getDom()
        .removeChild(nvLink.tooltip.getDom())
      nvLink.tooltip = undefined
      nvLink.root.onScaleChanged().removeListener(nvLink)
    }
  }

  public setSocketIn (socket: NvSocket): void {
    this.socketIn = socket
    this.path
      .getDom()
      .setAttribute(
        'stroke',
        this.socketIn.point
          .getDom()
          .style.getPropertyValue('background-color') as string
      )
    // this.updatePath(this.cpath);
  }

  public setSocketOut (socket: NvSocket): void {
    this.socketOut = socket
    // this.updatePath(this.cpath);
  }

  private delta: { (): V }
  public update (delta: V): void {
    if (this.cpath !== undefined) {
      // const p1 = this.root.unscale(this.socketIn.getMiddle().sub(delta))
      // const p2 = this.root.unscale(this.socketOut.getMiddle().sub(delta))
      this.updatePath(this.cpath)
    } else {
      this.refreshSockets()
      const tangentSize = 60
      const p1 = this.root.unscale(this.socketIn.getMiddle().sub(delta))
      const pp1 = p1.add(this.socketIn.tangent.mult(tangentSize))
      const p2 = this.root.unscale(this.socketOut.getMiddle().sub(delta))
      const pp2 = p2.add(this.socketOut.tangent.mult(tangentSize))
      const path = `M${p1.str()} C${pp1.str()} ${pp2.str()} ${p2.str()}`
      this.path.getDom().setAttribute('d', path)
      this.pointerEventPath.getDom().setAttribute('d', path)
    }
    // this.delta = delta;
  }

  public delete (): void {
    this.root
      .getBackground()
      .getDom()
      .removeChild(this.path.getDom())
  }

  private refreshSockets (): void {
    // const vIn = ((this.cpath != undefined) ? this.cpath[this.cpath.length-1] : this.nodeOut.getPosition()).sub(this.nodeIn.getPosition());
    const vIn = this.nodeOut.getPosition().sub(this.nodeIn.getPosition())
    const vOut = (this.cpath !== undefined
      ? this.cpath[0]
      : this.nodeIn.getPosition()
    ).sub(this.nodeOut.getPosition())

    /*
        const sIn = ArrayUtils.refOfMin<NV_Socket, V>(this.nodeIn.getSocketOutDir(), (this.cpath != undefined)
            ? (k,v) => {
                return Math.abs((this.cpath as V[])[(this.cpath as V[]).length-1].sub(this.nodeIn.getPosition()).angleWith(v))
            }
            : (k,v) => {
                return Math.abs(this.nodeOut.getPosition().sub(this.nodeIn.getPosition()).angleWith(v))
            })

        const sOut = ArrayUtils.refOfMin<NV_Socket, V>(this.nodeOut.getSocketInDir(), (this.cpath != undefined)
            ? (k,v) => {
                return Math.abs((this.cpath as V[])[0].sub(this.nodeOut.getPosition()).angleWith(v))
            }
            : (k, v) => {
                return Math.abs(this.nodeIn.getPosition().sub(this.nodeOut.getPosition()).angleWith(v))
            })
        /**/

    const sIn = ArrayUtils.refOfMin<NvSocket, V>(
      this.nodeIn.getSocketOutDir(),
      (k, v) => {
        return Math.abs(vIn.angleWith(v))
      }
    )

    const sOut = ArrayUtils.refOfMin<NvSocket, V>(
      this.nodeOut.getSocketInDir(),
      (k, v) => {
        return Math.abs(vOut.angleWith(v))
      }
    )

    // let res = false
    if (sIn !== undefined && sIn !== this.socketIn) {
      this.socketIn.linkUnconnected(this)
      this.socketIn = sIn
      this.socketIn.linkConnected(this)
      // res = true;
      this.nodeIn.updateLinks()
    }
    if (sOut !== undefined && sOut !== this.socketOut) {
      this.socketOut.linkUnconnected(this)
      this.socketOut = sOut
      this.socketOut.linkConnected(this)
      this.nodeOut.updateLinks()
      // res = true;
    }
    // return res;
  }

  public updatePath (cPath: Array<V> | undefined): void {
    this.cpath = cPath
    if (cPath === undefined) {
      this.update(this.delta())
    } else {
      this.refreshSockets()
      const p1 = this.root.unscale(this.socketOut.getMiddle().sub(this.delta()))
      let path = `M${p1.str()} `
      for (let i = 0; i < cPath.length; i++) {
        path += ` L${cPath[i].str()}`
      }
      const p2 = this.root.unscale(this.socketIn.getMiddle().sub(this.delta()))
      path += ` L${p2.str()}`
      this.path.getDom().setAttribute('d', path)
      this.pointerEventPath.getDom().setAttribute('d', path)
      // this.nodeIn.updateLinks();
      // this.nodeOut.updateLinks();
    }
  }
}
