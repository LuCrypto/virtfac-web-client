import { NvEl } from './nv_el'
import { NvContainer } from './nv_container'
import { NvLink } from './nv_link'
import { NvSocket } from './nv_socket'
import { V } from './v'

export class NvNode {
  private root: NvContainer
  public getRoot () {
    return this.root
  }

  public sockets: { in: NvSocket[]; out: NvSocket[] } = {
    in: new Array<NvSocket>(),
    out: new Array<NvSocket>()
  }

  private links: NvLink[] = new Array<NvLink>()
  public getLinks () {
    return this.links
  }

  private socketInDir: Map<NvSocket, V> = new Map<NvSocket, V>()
  public getSocketInDir () {
    return this.socketInDir
  }

  private socketOutDir: Map<NvSocket, V> = new Map<NvSocket, V>()
  public getSocketOutDir () {
    return this.socketOutDir
  }

  private index: number
  public getIndex () {
    return this.index
  }

  private positionStart: V
  private position: V
  public getPosition (): V {
    return this.position
  }

  private container: NvEl
  public getContainer () {
    return this.container
  }

  private socketContainerMap: Map<NvSocket, NvEl> = new Map<NvSocket, NvEl>()
  public getSocketContainerMap () {
    return this.socketContainerMap
  }

  private socketContainer: {
    top: NvEl
    bottom: NvEl
    left: NvEl
    right: NvEl
  }

  private content: NvEl
  public getContent () {
    return this.content
  }

  public userSetPosition = (position: V) => {
    this.setPosition(position)
  }

  constructor (root: NvContainer, index: number, position: V) {
    this.root = root
    this.index = index
    this.positionStart = new V(0, 0)
    this.container = new NvEl('div', 'node')
    const middle = new NvEl('div', 'node-middle')
    this.socketContainer = {
      top: new NvEl('div', 'node-socket-row'),
      bottom: new NvEl('div', 'node-socket-row'),
      left: new NvEl('div', 'node-socket-column'),
      right: new NvEl('div', 'node-socket-column', 'invert')
    }

    this.content = new NvEl('div', 'node-content')
    middle.appendChild(
      this.socketContainer.left,
      this.content,
      this.socketContainer.right
    )
    this.container.appendChild(
      this.socketContainer.top,
      middle,
      this.socketContainer.bottom
    )

    this.position = position
    this.setPosition(position)
    this.content.getDom().onmousedown = e => this.dragMouseDown(e)
  }

  public setPosition = (position: V) => {
    this.position = position.step(10)
    this.container.setStyle({
      left: `${this.position.x -
        this.container.getDom().getBoundingClientRect().width /
          2 /
          this.root.getScale()}px`,
      top: `${this.position.y -
        this.container.getDom().getBoundingClientRect().height /
          2 /
          this.root.getScale()}px`
    })
  }

  public dragMouseDown (event: MouseEvent) {
    event = event || window.event
    event.preventDefault()
    this.positionStart = this.root
      .unscale(new V(event.clientX, event.clientY))
      .sub(this.position)
    // .sub(new V(this.content.getDom().getBoundingClientRect().width/2, this.content.getDom().getBoundingClientRect().height/2)
    document.onmouseup = e => this.dragMouseUp(e)
    document.onmousemove = e => this.dragMouseMove(e)
  }

  public dragMouseUp (event: MouseEvent) {
    document.onmouseup = null
    document.onmousemove = null
  }

  public dragMouseMove (event: MouseEvent) {
    event = event || window.event
    event.preventDefault()
    this.userSetPosition(
      this.root
        .unscale(new V(event.clientX, event.clientY))
        .sub(this.positionStart)
    )
    this.updateLinks()
  }

  public setImage (url: string, width: string, height: string) {
    // console.log('add image');
    // const img = new NV_El('img');
    // (img.getDom() as HTMLImageElement).src = url;
    // this.content.appendChild(img);
    this.content.getDom().style.background = `url(${url})`
    this.content.setStyle({ width: width, height: height })
  }

  private text = ''
  public getText (): string {
    return this.text
  }

  private textEl: NvEl = new NvEl('p', 'node-content')
  private textActif = false

  public setText (text: string, controleSize = false) {
    this.text = text
    this.textEl.getDom().innerHTML = text
    if (!controleSize && !this.textActif) {
      this.textActif = true
      this.content.appendChild(this.textEl)
      this.textEl.setStyle({
        'white-space': 'break-spaces',
        'backdrop-filter': this.root.theme.nodeTextBackgroundBlur,
        margin: '0px',
        'background-color': this.root.theme.nodeTextBackgroundColor
      })
    } else if (controleSize) {
      this.content.getDom().innerHTML = text
    }
  }

  public addSocket (
    side: 'top' | 'bottom' | 'left' | 'right',
    text: string,
    color: string | null
  ) {
    const type: 'in' | 'out' = side === 'top' || side === 'left' ? 'in' : 'out'
    const tangent = new V(
      side === 'left' ? -1 : side === 'right' ? 1 : 0,
      side === 'top' ? -1 : side === 'bottom' ? 1 : 0
    )
    const socket = new NvSocket(this, type, text, color, tangent)
    if (!socket.getHideWhenNotLinked()) { this.socketContainer[side].appendChild(socket.container) }
    this.socketContainerMap.set(socket, this.socketContainer[side])
    this.sockets[type].push(socket)
    if (text.toLowerCase() === 'in') {
      this.socketInDir.set(socket, tangent)
    } else if (text.toLowerCase() === 'out') {
      this.socketOutDir.set(socket, tangent)
    }
  }

  public updateLinks () {
    const rect = (this.container.getDom()
      .parentNode as Element).getBoundingClientRect()
    const delta = new V(rect.x, rect.y)
    this.links.forEach(link => link.update(delta))
  }

  public updateTheme () {
    this.textEl.setStyle({
      'white-space': 'break-spaces',
      'backdrop-filter': this.root.theme.nodeTextBackgroundBlur,
      margin: '0px',
      'background-color': this.root.theme.nodeTextBackgroundColor
    })
  }
}