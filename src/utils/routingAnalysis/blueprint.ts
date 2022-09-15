import { Graph, GraphJSON } from '@/utils/graph/graph'
import { Node } from '../graph/node'
// import { Vec2, Vector2 } from '@/utils/graph/Vec'
import V from '@/utils/vector'
import { Link } from '../graph/link'
import { MetaData } from '../graph/metadata'
import { LocalEvent, MapLocalEvent } from '../graph/localEvent'
import { max } from 'd3'
import { Destroyable } from './bp_window'

export class BpWallFurniture {
  public xpos: number
  public assetId = -1

  public constructor (xpos: number, assetId: number) {
    this.xpos = xpos
  }
}

export class Blueprint extends MetaData {
  private wallGraph: Graph

  public onWallNodeAdded (): LocalEvent<{ graph: Graph; node: Node }> {
    return this.wallGraph.onNodeAdded()
  }

  public onWallNodeRemoved (): LocalEvent<{ graph: Graph; node: Node }> {
    return this.wallGraph.onNodeRemoved()
  }

  public onWallNodeDataChanged (): MapLocalEvent<
    string,
    { graph: Graph; node: Node; value: unknown }
    > {
    return this.wallGraph.onNodeDataChanged()
  }

  public onWallLinkAdded (): LocalEvent<{ graph: Graph; link: Link }> {
    return this.wallGraph.onLinkAdded()
  }

  public onWallLinkRemoved (): LocalEvent<{ graph: Graph; link: Link }> {
    return this.wallGraph.onLinkRemoved()
  }

  public onWallLinkDataChanged (): MapLocalEvent<
    string,
    { graph: Graph; link: Link; value: unknown }
    > {
    return this.wallGraph.onLinkDataChanged()
  }

  public foreachWallNode (func: { (node: Node): void }): void {
    this.wallGraph.foreachNode(func)
  }

  private nextId = 0

  public addWallNode (pos: V): Node {
    const n = this.wallGraph.addNode(new Node())
    n.setData<number>('id', this.nextId++)
    n.setData<V>('position', pos)
    return n
  }

  public removeWallNode (node: Node): void {
    node.foreachLink(l => {
      l.getNode()
        .getData<Set<Node>>('targetBy')
        .delete(node)
      node.removeLink(l.getNode())
    })
    node.getData<Set<Node>>('targetBy').forEach(n => {
      n.removeLink(node)
    })
    this.wallGraph.removeNode(node)
  }

  public addWall (n1: Node, n2: Node): void {
    const l = n1.addLink(n2)
    /*
    n2.getOrAddData<Set<Node>>('targetBy', new Set<Node>()).add(n1)
    l.setData<number>(
      'length',
      n1.getData<V>('position').distanceTo(n2.getData<V>('position'))
    )
    */
  }

  public removeWall (link: Link): void {
    link.getOriginNode().removeLink(link.getNode())
    link
      .getNode()
      .getData<Set<Node>>('targetBy')
      .delete(link.getOriginNode())
  }

  /**
   * check if a position is inside a room of the blueprint or not.
   * @param pos
   * @returns true: inside, false: outside
   */
  public isInside (pos: V): boolean {
    let leftCount = 0
    let rightCount = 0
    let topCount = 0
    let bottomCount = 0
    this.wallGraph.foreachNode(n => {
      const p1 = n.getData<V>('position')
      n.foreachLink(l => {
        if (!l.getData<boolean>('double')) {
          const p2 = l.getNode().getData<V>('position')
          if ((p1.y < pos.y) !== (p2.y < pos.y)) {
            if (
              p1.x + (p2.x - p1.x) * ((pos.y - p1.y) / (p2.y - p1.y)) <
              pos.x
            ) {
              leftCount++
            } else rightCount++
          }

          if ((p1.x < pos.x) !== (p2.x < pos.x)) {
            if (
              p1.y + (p2.y - p1.y) * ((pos.x - p1.x) / (p2.x - p1.x)) <
              pos.y
            ) {
              topCount++
            } else bottomCount++
          }
        }
      })
    })

    return (
      leftCount % 2 === 0 &&
      rightCount % 2 === 0 &&
      topCount % 2 === 0 &&
      bottomCount % 2 === 0 // &&
      // Math.min(leftCount, rightCount, topCount, bottomCount) > 0
    )
  }

  public toJSON (): GraphJSON {
    this.wallGraph.nodeFields.set('position', 'Vec2')
    this.wallGraph.graphFields.set('scale', 'number')
    this.wallGraph.linkFields.set(
      'furniture',
      '{ xpos: number, assetId: number }[]'
    )
    this.wallGraph.nodeIdField = 'id'

    this.wallGraph.foreachLink(l => {
      l.setData(
        'furniture',
        Array.from(
          l
            .getDataOrDefault<Map<Destroyable, BpWallFurniture>>(
              'furnitures',
              new Map<Destroyable, BpWallFurniture>()
            )
            .values()
        )
      )
    })
    return this.wallGraph.toJsonOBJ()
  }

  public applyJSON (jsonObj: GraphJSON): void {
    //
    this.wallGraph.applyJson(jsonObj)
    let maxId = this.nextId
    this.wallGraph.foreachNode(n => {
      const id = n.getData<number>('id')
      if (id >= maxId) {
        maxId = id + 1
      }
    })
    this.nextId = maxId
  }

  public constructor () {
    super()
    this.wallGraph = new Graph()

    this.wallGraph.onLinkRemoved().addListener(arg => {
      arg.link
        .getNode()
        .getData<Set<Node>>('targetBy')
        .delete(arg.link.getOriginNode())
    }, this)

    // listener to refresh the length attribute on links
    this.wallGraph.onNodeDataChanged().addMappedListener(
      'position',
      arg => {
        arg.node.foreachLink(l => {
          l.setData<number>(
            'length',
            arg.node
              .getData<V>('position')
              .distanceTo(l.getNode().getData<V>('position')) /
              this.getData<number>('scale')
          )
        })
        arg.node
          .getDataOrDefault<Set<Node>>('targetBy', new Set<Node>())
          .forEach(n => {
            (n.getLink(arg.node) as Link).setData<number>(
              'length',
              arg.node
                .getData<V>('position')
                .distanceTo(n.getData<V>('position')) /
                this.getData<number>('scale')
            )
          })
      },
      this
    )

    // listener to refresh the length attribute on links when the global scale is changed
    this.onDataChanged().addMappedListener(
      'scale',
      () => {
        this.wallGraph.foreachNode(n => {
          n.foreachLink(l => {
            l.setData<number>(
              'length',
              l
                .getNode()
                .getData<V>('position')
                .distanceTo(n.getData<V>('position')) /
                this.getData<number>('scale')
            )
          })
        })
      },
      this
    )

    this.wallGraph.onLinkAdded().addListener(arg => {
      const l = arg.link
      const n1 = arg.link.getOriginNode()
      const n2 = arg.link.getNode()
      n2.getOrAddData<Set<Node>>('targetBy', new Set<Node>()).add(n1)
      l.setData<number>(
        'length',
        n1.getData<V>('position').distanceTo(n2.getData<V>('position'))
      )
    })
  }
}
