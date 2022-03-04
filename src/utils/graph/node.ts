import { Link } from '@/utils/graph/link'
import { MetaData } from '@/utils/graph/metadata'
import { LocalEvent, MapLocalEvent } from '@/utils/graph//localEvent'

/// <reference path="@/utils/metadata"/>
export class Node extends MetaData {
  private links: Map<Node, Link>

  ///
  // #region EVENTS
  ///
  private linkDataChanged: MapLocalEvent<
    string,
    { link: Link; value: unknown }
  > = new MapLocalEvent<string, { link: Link; value: unknown }>()

  public onLinkDataChanged () {
    return this.linkDataChanged
  }

  private linkAdded: LocalEvent<Link> = new LocalEvent<Link>()
  public onLinkAdded () {
    return this.linkAdded
  }

  private linkRemoved: LocalEvent<Link> = new LocalEvent<Link>()
  public onLinkRemoved () {
    return this.linkRemoved
  }

  public foreachLink (func: { (link: Link): void }): void {
    this.links.forEach(func)
  }
  // #endregion
  ///

  ///
  // #region LINKS
  ///
  public addLink (node: Node): Link {
    const tmp: Link = new Link(node, this)
    this.links.set(node, tmp)
    tmp.onDataChanged().addListener(arg => {
      this.linkDataChanged.notify({
        key: arg.key,
        arg: { link: tmp, value: arg.arg.value }
      })
    }, this)
    this.linkAdded.notify(tmp)
    return tmp
  }

  public removeLink (node: Node): void {
    (this.links
      .get(node) as Link)
      .onDataChanged()
      .removeListener(this)
    this.linkRemoved.notify(this.links.get(node) as Link)
    this.links.delete(node)
  }

  public getLink (node: Node): Link | undefined {
    return this.links.get(node)
  }
  // #endregion
  ///

  constructor () {
    super()
    this.links = new Map<Node, Link>()
  }
}
