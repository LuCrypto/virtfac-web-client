import { MetaData } from '@/utils/graph/metadata'
import { Node } from '@/utils/graph/node'

/// <reference path="@/utils/metadata"/>
export class Link extends MetaData {
  private node: Node
  private origin: Node

  public getOriginNode (): Node {
    return this.origin
  }

  /**
   *
   * @returns the node targeted by the link.
   */
  public getNode (): Node {
    return this.node
  }

  constructor (node: Node, origin: Node) {
    super()
    this.node = node
    this.origin = origin
  }
}
