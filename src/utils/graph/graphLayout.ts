// import { Vec2, Vector2 } from '@/utils/graph/Vec'
import V from '@/utils/vector'
import { MetaData } from '@/utils/graph/metadata'
import { Graph } from '@/utils/graph/graph'
import { Node } from '@/utils/graph/node'
import { Link } from '@/utils/graph/link'
import { GraphUtils } from './graphUtils'

export class GraphLayout {
  /**
   *
   * @param graph
   * @param stepSize space between hierarchy level
   * @param positionField key of metadata containing the Vec2 position in the graph
   */
  public static verticalHierarchyLayout (
    graph: Graph,
    stepSize: number,
    positionField = 'position'
  ) {
    GraphUtils.hierarchization(graph, 'h', 'hierarchy')

    graph.foreachNode(n => {
      n.setData<V>(
        positionField,
        new V(
          n.getData<V>(positionField).x,
          -n.getData<number>('hierarchy') * stepSize
        )
      )
    })
  }

  /**
   *
   * @param graph
   * @param stepSize space between hierarchy level
   * @param positionField key of metadata containing the V position in the graph
   */
  public static horizontalHierarchyLayout (
    graph: Graph,
    stepSize: number,
    positionField = 'position'
  ) {
    GraphUtils.hierarchization(graph, 'h', 'hierarchy')

    graph.foreachNode(n => {
      n.setData<V>(
        positionField,
        new V(
          -n.getData<number>('hierarchy') * stepSize,
          n.getData<V>(positionField).y
        )
      )
    })
  }

  /**
   * position the nodes arround a circle
   * @param graph
   * @param stepSize space (euler distance) between nodes
   * @param positionField key of metadata containing the Vec2 position in the graph
   */
  public static circleLayout (
    graph: Graph,
    stepSize: number,
    positionField = 'position'
  ) {
    const angle = (2 * Math.PI) / graph.nodeCount()
    const r = stepSize / ((2 * Math.PI) / graph.nodeCount())

    let pos = new V(-r, 0)
    graph.foreachNode(n => {
      n.setData<V>(positionField, pos)
      pos = pos.rotateRad(angle)
    })
  }

  /**
   * change horizontal ordering of nodes with y position to zero to limit crossing of links
   * @param graph
   * @param stepSize horizontal space between root nodes
   * @param positionField key of metadata containing the Vec2 position in the graph
   */
  public static horizontalOrdering (
    graph: Graph,
    stepSize: number,
    positionField = 'position'
  ) {
    // get nodes sorted by y position
    let nodeArray = new Array<{ n: Node; d: number }>()
    graph.foreachNode(n => {
      nodeArray.push({ n: n, d: Math.abs(n.getData<V>(positionField).y) })
    })
    nodeArray = nodeArray.sort((a, b) => {
      return a.d - b.d
    })

    let leftBorder = -stepSize / 2
    let rightBorder = stepSize / 2

    // go to the first node with y > 0
    let start = 0
    for (let i = 0; i < nodeArray.length; i++) {
      if (nodeArray[i].d > 0) {
        start = i
        break
      }
    }

    /*
    first step :
      get the first node with y>0, set his x position to 0 and arrange linked y=0 nodes of this node with surrounding x position.
      example of result :
      with s = stepSize

       ------  x=0, y>0  ---
       |                   |
       x=-s/2,y=0      x=s/2, y=0
    */

    let childPositionning: 'LEFT' | 'MIDDLE' | 'RIGHT' = 'MIDDLE'

    nodeArray[start].n.setData<V>(
      positionField,
      new V(0, nodeArray[start].n.getData<V>(positionField).y)
    )
    nodeArray[start].n.setData('__fixed', true)
    nodeArray[start].n.foreachLink(l => {
      if (!l.getNode().getData('__fixed')) {
        const nextChild =
          childPositionning === 'LEFT'
            ? 'LEFT'
            : childPositionning === 'RIGHT'
              ? 'RIGHT'
              : Math.abs(leftBorder) < Math.abs(rightBorder)
                ? 'LEFT'
                : 'RIGHT'
        if (nextChild === 'LEFT') {
          l.getNode().setData<V>(
            positionField,
            new V(leftBorder, l.getNode().getData<V>(positionField).y)
          )
          leftBorder -= stepSize
        } else {
          l.getNode().setData<V>(
            positionField,
            new V(rightBorder, l.getNode().getData<V>(positionField).y)
          )
          rightBorder += stepSize
        }
        l.getNode().setData('__fixed', true)
      }
    })

    /*
    loop :
      get next node n with y>0, get the moy x coord from already positionned linked nodes and use it as reference.
      from this x position we determine if we add childs to the left/right or alternate(middle)
      loop to the next node.
    */
    for (let i = start + 1; i < nodeArray.length; i++) {
      const node = nodeArray[i].n

      let middleX = 0
      let lCount = 0
      let fixedCount = 0
      node.foreachLink(l => {
        if (l.getNode().getData('__fixed')) {
          fixedCount++
          middleX += l.getNode().getData<V>(positionField).x
        }
        lCount++
      })

      node.setData('__fixed', true)

      if (fixedCount !== 0) {
        middleX /= fixedCount
        middleX < leftBorder / 1.5
          ? (childPositionning = 'LEFT')
          : middleX > rightBorder / 1.5
            ? (childPositionning = 'RIGHT')
            : (childPositionning = 'MIDDLE')
        node.setData<V>(
          positionField,
          new V(
            middleX -
              (Math.abs(Math.abs(middleX % stepSize) - stepSize / 2) <
              stepSize / 4
                ? middleX % stepSize
                : 0),
            node.getData<V>(positionField).y
          )
        )
      } else {
        if (Math.abs(leftBorder) < Math.abs(rightBorder)) {
          childPositionning = 'LEFT'
          node.setData<V>(
            positionField,
            new V(leftBorder, node.getData<V>(positionField).y)
          )
          leftBorder -= stepSize
        } else {
          childPositionning = 'RIGHT'
          node.setData<V>(
            positionField,
            new V(rightBorder, node.getData<V>(positionField).y)
          )
          rightBorder += stepSize
        }
      }

      // node.setData<string>('name', node.getData<string>('name') + `middleX:${middleX} align:${}`)
      node.foreachLink(l => {
        if (!l.getNode().getData('__fixed')) {
          const nextChild =
            childPositionning === 'LEFT'
              ? 'LEFT'
              : childPositionning === 'RIGHT'
                ? 'RIGHT'
                : Math.abs(leftBorder) < Math.abs(rightBorder)
                  ? 'LEFT'
                  : 'RIGHT'
          if (nextChild === 'LEFT') {
            l.getNode().setData<V>(
              positionField,
              new V(leftBorder, l.getNode().getData<V>(positionField).y)
            )
            leftBorder -= stepSize
          } else {
            l.getNode().setData<V>(
              positionField,
              new V(rightBorder, l.getNode().getData<V>(positionField).y)
            )
            rightBorder += stepSize
          }
          l.getNode().setData('__fixed', true)
        }
      })
    }

    graph.foreachNode(n => {
      n.setData('__fixed', undefined)
    })
  }

  public static levelLayout (
    graph: Graph,
    levelField: string,
    positionField: string,
    xSpacing: number,
    ySpacing: number,
    transform?: { (v: V): V } | undefined
  ) {
    const sources = new Array<Node>()

    let maxLevel = 0
    graph.foreachNode(n => {
      const level = n.getData<number>(levelField)
      if (level > maxLevel) maxLevel = level
      if (level === 0) {
        sources.push(n)
      }
    })

    let maxOffset = 0
    let maxOffsetOfLevel = new Array<number>(maxLevel + 1)
    for (let i = 0; i < maxLevel + 1; i++) {
      maxOffsetOfLevel[i] = 0
    }

    const __fixed = '__fixed'
    sources.forEach(n => {
      const toTravel = new Array<Node>()
      n.setData<V>(positionField, new V(0, maxOffsetOfLevel[0]++ * ySpacing))
      if (maxOffsetOfLevel[0] > maxOffset) maxOffset = maxOffsetOfLevel[0]
      n.foreachLink(l => {
        if (!l.getNode().getDataOrDefault<boolean>(__fixed, false)) {
          toTravel.push(l.getNode())
          l.getNode().setData<boolean>(__fixed, true)
        }
      })

      while (toTravel.length > 0) {
        const node = toTravel.shift() as Node
        const level = node.getData<number>(levelField)
        node.setData<V>(
          positionField,
          new V(level * xSpacing, maxOffsetOfLevel[level]++ * ySpacing)
        )
        if (maxOffsetOfLevel[level] > maxOffset) {
          maxOffset = maxOffsetOfLevel[level]
        }
        node.foreachLink(l => {
          if (!l.getNode().getDataOrDefault<boolean>(__fixed, false)) {
            toTravel.unshift(l.getNode())
            l.getNode().setData<boolean>(__fixed, true)
          }
        })
      }

      maxOffsetOfLevel = maxOffsetOfLevel.map(() => {
        return maxOffset
      })
    })

    graph.foreachNode(n => {
      n.setData<undefined>(__fixed, undefined)
    })
  }
}
