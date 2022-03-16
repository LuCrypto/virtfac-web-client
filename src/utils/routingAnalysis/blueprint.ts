import { Graph } from '@/utils/graph/graph'
import { Node } from '../graph/node'
import { Vec2, Vector2 } from '@/utils/graph/Vec'
import { Link } from '../graph/link'

export class Blueprint {
  private wallGraph: Graph

  public onWallNodeAdded () {
    return this.wallGraph.onNodeAdded()
  }

  public onWallNodeDataChanged () {
    return this.wallGraph.onNodeDataChanged()
  }

  public onWallLinkAdded () {
    return this.wallGraph.onLinkAdded()
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

  public constructor () {
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
            )
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
              )
            )
          })
      },
      this
    )
  }
}
