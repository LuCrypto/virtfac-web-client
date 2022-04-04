import { Vec2, Vector2 } from '@/utils/graph/Vec'
import { MetaData } from '@/utils/graph/metadata'
import { Graph } from '@/utils/graph/graph'
import { Node } from '@/utils/graph/node'
import { Link } from '@/utils/graph/link'
import { GraphUtils } from './graphUtils'

export class GraphLayout {
  public static verticalHierarchyLayout (
    graph: Graph,
    stepSize: number,
    positionField = 'position'
  ) {
    GraphUtils.hierarchization(graph, 'hierarchy')

    graph.foreachNode(n => {
      n.setData<Vec2>(
        positionField,
        new Vector2(
          n.getData<Vec2>(positionField).x,
          -n.getData<number>('hierarchy') * stepSize
        )
      )
    })
  }

  public static horizontalHierarchyLayout (
    graph: Graph,
    stepSize: number,
    positionField = 'position'
  ) {
    GraphUtils.hierarchization(graph, 'hierarchy')

    graph.foreachNode(n => {
      n.setData<Vec2>(
        positionField,
        new Vector2(
          -n.getData<number>('hierarchy') * stepSize,
          n.getData<Vec2>(positionField).y
        )
      )
    })
  }

  public static circleLayout (
    graph: Graph,
    stepSize: number,
    positionField = 'position'
  ) {
    // 2 pi r
    // 2 pi r * 360/nbNodes = stepSize
    // 2 pi * 360/nbNodes = stepSize/r
    // (2 pi * 360/nbNodes)/stepSize = 1/r
    // stepSize/(2 pi * 360/nbNodes) = r
    const angle = (2 * Math.PI) / graph.nodeCount()
    const r = stepSize / ((2 * Math.PI) / graph.nodeCount())

    let pos = new Vector2(-r, 0)
    graph.foreachNode(n => {
      n.setData<Vec2>(positionField, pos)
      pos = Vector2.rotate(pos, angle)
    })
  }

  public static horizontalOrdering (
    graph: Graph,
    stepSize: number,
    positionField = 'position'
  ) {
    let nodeArray = new Array<{ n: Node; d: number }>()
    graph.foreachNode(n => {
      nodeArray.push({ n: n, d: Math.abs(n.getData<Vec2>(positionField).y) })
    })
    nodeArray = nodeArray.sort((a, b) => {
      return a.d - b.d
    })

    let leftBorder = -stepSize / 2
    let rightBorder = stepSize / 2

    let start = 0
    for (let i = 0; i < nodeArray.length; i++) {
      if (nodeArray[i].d > 0) {
        start = i
        break
      }
    }

    let childPositionning: 'LEFT' | 'MIDDLE' | 'RIGHT' = 'MIDDLE'

    nodeArray[start].n.setData<Vec2>(
      positionField,
      new Vector2(0, nodeArray[start].n.getData<Vec2>(positionField).y)
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
          l.getNode().setData<Vec2>(
            positionField,
            new Vector2(leftBorder, l.getNode().getData<Vec2>(positionField).y)
          )
          leftBorder -= stepSize
        } else {
          l.getNode().setData<Vec2>(
            positionField,
            new Vector2(rightBorder, l.getNode().getData<Vec2>(positionField).y)
          )
          rightBorder += stepSize
        }
        l.getNode().setData('__fixed', true)
      }
    })

    for (let i = start + 1; i < nodeArray.length; i++) {
      const node = nodeArray[i].n

      let middleX = 0
      let lCount = 0
      let fixedCount = 0
      node.foreachLink(l => {
        if (l.getNode().getData('__fixed')) {
          fixedCount++
          middleX += l.getNode().getData<Vec2>(positionField).x
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
        node.setData<Vec2>(
          positionField,
          new Vector2(middleX, node.getData<Vec2>(positionField).y)
        )
      } else {
        if (Math.abs(leftBorder) < Math.abs(rightBorder)) {
          childPositionning = 'LEFT'
          node.setData<Vec2>(
            positionField,
            new Vector2(leftBorder, node.getData<Vec2>(positionField).y)
          )
          leftBorder -= stepSize
        } else {
          childPositionning = 'RIGHT'
          node.setData<Vec2>(
            positionField,
            new Vector2(rightBorder, node.getData<Vec2>(positionField).y)
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
            l.getNode().setData<Vec2>(
              positionField,
              new Vector2(
                leftBorder,
                l.getNode().getData<Vec2>(positionField).y
              )
            )
            leftBorder -= stepSize
          } else {
            l.getNode().setData<Vec2>(
              positionField,
              new Vector2(
                rightBorder,
                l.getNode().getData<Vec2>(positionField).y
              )
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
}
