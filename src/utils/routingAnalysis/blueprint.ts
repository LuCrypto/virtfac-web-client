import { Graph } from '@/utils/graph/graph'
import { Node } from '../graph/node'
import { Vec2, Vector2 } from '@/utils/graph/Vec'
import { Link } from '../graph/link'
import { MetaData } from '../graph/metadata'

export class Blueprint extends MetaData {
  private wallGraph: Graph

  public onWallNodeAdded () {
    return this.wallGraph.onNodeAdded()
  }

  public onWallNodeRemoved () {
    return this.wallGraph.onNodeRemoved()
  }

  public onWallNodeDataChanged () {
    return this.wallGraph.onNodeDataChanged()
  }

  public onWallLinkAdded () {
    return this.wallGraph.onLinkAdded()
  }

  public onWallLinkRemoved () {
    return this.wallGraph.onLinkRemoved()
  }

  public onWallLinkDataChanged () {
    return this.wallGraph.onLinkDataChanged()
  }

  private nextId = 0

  public addWallNode (pos: Vec2): Node {
    const n = this.wallGraph.addNode(new Node())
    n.setData<number>('id', this.nextId++)
    n.setData<Vec2>('position', pos)
    return n
  }

  public removeWallNode (node: Node) {
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

  public addWall (n1: Node, n2: Node) {
    const l = n1.addLink(n2)
    n2.getOrAddData<Set<Node>>('targetBy', new Set<Node>()).add(n1)
    l.setData<number>(
      'length',
      Vector2.norm(
        Vector2.minus(
          n1.getData<Vec2>('position'),
          n2.getData<Vec2>('position')
        )
      )
    )
  }

  public isInside (pos: Vec2) {
    let leftCount = 0
    let rightCount = 0
    let topCount = 0
    let bottomCount = 0
    this.wallGraph.foreachNode(n => {
      const p1 = n.getData<Vec2>('position')
      n.foreachLink(l => {
        if (!l.getData<boolean>('double')) {
          const p2 = l.getNode().getData<Vec2>('position')
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
      leftCount % 2 === 1 &&
      rightCount % 2 === 1 &&
      topCount % 2 === 1 &&
      bottomCount % 2 === 1
    )
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

    this.wallGraph.onNodeDataChanged().addMappedListener(
      'position',
      arg => {
        arg.node.foreachLink(l => {
          l.setData<number>(
            'length',
            Vector2.norm(
              Vector2.minus(
                arg.node.getData<Vec2>('position'),
                l.getNode().getData<Vec2>('position')
              )
            ) / this.getData<number>('scale')
          )
        })
        arg.node
          .getDataOrDefault<Set<Node>>('targetBy', new Set<Node>())
          .forEach(n => {
            (n.getLink(arg.node) as Link).setData<number>(
              'length',
              Vector2.norm(
                Vector2.minus(
                  arg.node.getData<Vec2>('position'),
                  n.getData<Vec2>('position')
                )
              ) / this.getData<number>('scale')
            )
          })
      },
      this
    )
    this.onDataChanged().addMappedListener('scale', arg => {
      this.wallGraph.foreachNode(n => {
        n.foreachLink(l => {
          l.setData<number>(
            'length',
            Vector2.norm(
              Vector2.minus(
                l.getNode().getData<Vec2>('position'),
                n.getData<Vec2>('position')
              )
            ) / this.getData<number>('scale')
          )
        })
      })
    }, this)
  }
}
