export const NVSVGNS = 'http://www.w3.org/2000/svg'

export class NvEl {
  private dom: SVGElement | HTMLElement | null = null

  constructor (type: string, ...classList: string[]) {
    this.dom = ['linearGradient', 'path', 'stop', 'svg', 'defs', 'rect'].includes(type)
      ? (this.dom = document.createElementNS(NVSVGNS, type))
      : (this.dom = document.createElement(type))
    this.dom.setAttribute('style', '')
    classList.forEach(className => {
      (this.dom as SVGElement | HTMLElement).classList.add('nv-' + className)
    })
  }

  appendChild (...childs: NvEl[]) {
    childs.forEach(child => this.dom?.appendChild(child.dom as Node))
  }

  setStyle (style: any) {
    // à vérifier
    Object.keys(style).forEach(key =>
      (this.dom as ElementCSSInlineStyle).style.setProperty(key, style[key])
    )

    // background-color
    // backgroundColor
  }

  appendDom (...doms: Node[]) {
    doms.forEach(dom => {
      (this.dom as SVGElement | HTMLElement).appendChild(dom)
    })
  }

  clone (deep: boolean): Node {
    return (this.dom as Node).cloneNode(deep)
  }

  public getDom (): SVGElement | HTMLElement {
    if (this.dom == null) throw new Error('dom is null')
    else return this.dom
  }
}
