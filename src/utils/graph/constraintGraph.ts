import { IWorkBook } from 'ts-xlsx'
import { Graph } from '../graph/graph'
import { Node } from '@/utils/graph/node'
import { Link } from '@/utils/graph/link'
import * as XLSX from 'ts-xlsx'
// import { Vec2, Vector2 } from '@/utils/graph/Vec'
import V from '@/utils/vector'
import { GraphUtils } from '@/utils/graph/graphUtils'
import { ArrayUtils } from '@/utils/graph/arrayUtils'
import { DelayedCallback } from '@/utils/graph/delayedCallback'
import { GraphLayout } from './graphLayout'

class Constraint extends Node {
  private name: string
  private weight: number

  constructor (name: string, weight: number) {
    super()
    this.name = name
    this.weight = weight

    this.setData<string>('color', '#F4D03F')
    this.setData<string>('name', name)
    this.setData<string[]>('tooltip', ['name: ' + name, 'weight: ' + weight])
    this.setData<boolean>('usePhysics', true)
    this.setData<boolean>('isConstraint', true)
    this.setData<V>('position', new V(0, 0))
    this.setData<string>('type', 'constraint')
    // this.setData<number>
  }
}

class Source extends Node {
  private static nextColor = 0
  private static colArray: string[] = [
    '#9B59B6',
    '#2980B9',
    '#A93226',
    '#6C3483',
    '#1F618D',
    '#117A65',
    '#B9770E',
    '#616A6B',
    '#283747'
  ]

  private name: string

  constructor (name: string) {
    super()
    this.name = name
    this.setData<string[]>('tooltip', ['name: ' + name])
    this.setData<string>('name', name)
    this.setData<boolean>('usePhysics', true)
    this.setData<V>('position', new V(0, 0))
    this.setData<string>('type', 'source')
    this.setData<string>('color', Source.colArray[Source.nextColor])
    /*
        const reader = new FileReader();
        reader.onload = () => {
            this.setData<string>('img', 'data:image/png;base64,'+reader.result);
        }
        reader.onerror = (error) => {
            console.error(error);
        }
        const f = new File("@/assets/4451301.png");
        reader.readAsDataURL();
        */
    // this.setData<string>("img", 'data:image/png;base64,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');
    // this.setData<string>("img-width", '225px');
    // this.setData<string>("img-height", '225px');
    Source.nextColor = (Source.nextColor + 1) % Source.colArray.length
  }
}

export class ConstraintGraph {
  private localGraph: Graph
  public getRawGraph (): Graph {
    return this.localGraph
  }

  private displayGraph: Graph

  private contrainte: Map<string, Constraint>
  private source: Map<string, Source>

  constructor (graph: Graph | null = null) {
    if (graph != null) this.localGraph = graph
    else this.localGraph = new Graph()

    this.displayGraph = new Graph()
    this.displayGraph.setData<Graph>('source', this.localGraph)
    this.displayGraph.setData<ConstraintGraph>('sourcec', this)
    this.localGraph.setData<ConstraintGraph>('constraintGraph', this)
    this.contrainte = new Map<string, Constraint>()
    this.source = new Map<string, Source>()
    this.displayGraph.setData(
      'validBusDir',
      new Array<V>(new V(1, 0), new V(0, 1), new V(-1, 0), new V(0, -1))
    )

    this.displayGraph.setData(
      'validBusWeight',
      new Array<number>(1, 0.5, 1, 0.5)
    )

    this.localGraph.setData<DelayedCallback>(
      'refreshBusesCallback',
      new DelayedCallback(() => {
        this.refreshDisplayGraphReverse(this.getGraph())
      }, 60)
    )

    this.localGraph.setData<{(elem: Node, foreign: Node): V }>(
      'nodeRepulseForce',
    (el, foreign) => {
      const p1: V = el.getData<V>('position')
      const p2: V = foreign.getData<V>('position')

      let dir = p1.subV(p2)

      if (dir.length() === 0) {
        dir = new V(
          Math.random() * 0.01 - 0.005,
          Math.random() * 0.01 - 0.005
        )
      }
      /*
      return Vector2.multiply(
        Vector2.normalize(dir),
        Math.sqrt(Math.max(1, Vector2.norm(dir))) /
            Math.max(0.001, Vector2.norm(dir))
      )
      */

      return dir
        .normalize()
        .multN(
          Math.sqrt(Math.max(1, dir.length())) / Math.max(0.001, dir.length())
        )
    }
    )

    this.displayGraph.setData<{(graph: Graph): void }>(
      'refresh',
    this.refreshDisplayGraphReverse
    )

    this.localGraph
      .getOrAddData<Array<string>>('actions', new Array<string>())
      .push('Refresh Bus')
    this.localGraph.setData<{(): void }>('Refresh Bus', () => {
      this.refreshDisplayGraphReverse(this.displayGraph)
    })
    this.localGraph.setData<boolean>('autoRefreshBus', false)
    this.localGraph.setData<{(): void }>('Auto Refresh Bus', () => {
      this.localGraph.setData<boolean>(
        'autoRefreshBus',
        !this.localGraph.getData<boolean>('autoRefreshBus')
      )
      if (this.localGraph.getData<boolean>('autoRefreshBus')) {
        this.localGraph.onNodeDataChanged().addMappedListener(
          'position',
          arg => {
            this.localGraph
              .getData<DelayedCallback>('refreshBusesCallback')
              .call()
          },
          this
        )
      } else {
        this.localGraph
          .onNodeDataChanged()
          .removeMappedListener('position', this)
      }
    })

    this.localGraph.getData<Array<string>>('actions').push('Auto Refresh Bus')
  }

  public getGraph (): Graph {
    return this.displayGraph
  }

  addContrainte (name: string, weight: number): Node {
    if (this.contrainte.has(name)) throw new Error('contrainte already defined')

    const c = new Constraint(name, weight)
    this.localGraph.addNode(c)
    this.contrainte.set(name, c)
    return c
  }

  addSource (name: string): Node {
    const s = new Source(name)
    this.localGraph.addNode(s)
    this.source.set(name, s)
    return s
  }

  /**
   * Group links nodes that are in similar direction from the origin node
   * @param graph
   * @param node origin node
   * @param mergeAngle max angle between two node that can merge in a group
   * @param splitAngle max angle between the two 'border' nodes of a group. When reached, split the group in two equal angle groups
   * @param links List of nodes to groups relatively to the origin node
   * @returns Array of groups. If a node is not in a group, it will not be returned.
   */
  private static groupByAngle (
    graph: Graph,
    node: Node,
    mergeAngle: number,
    splitAngle: number,
    links: Node[]
  ): Array<Array<{ angle: number; link: Node }>> {
    const angles: Array<{ angle: number; link: Node }> = new Array<{
      angle: number
      link: Node
    }>()
    const p = node.getData<V>('position')
    const groupResult: Array<Array<{ angle: number; link: Node }>> = new Array<
      Array<{ angle: number; link: Node }>
    >()

    // get list of radians angles foreach link nodes from the origin node.
    links.forEach(link => {
      if (!link.getDataOrDefault<boolean>('isDisplay', false)) {
        if (link.getData<V>('position').distanceTo(p) > 0.01) {
          angles.push({
            angle: link
              .getData<V>('position')
              .subV(p)
              .angle(),
            link: link
          })
        }
      }
    })

    if (angles.length > 1) {
      // sort by the trigonometric circle order
      angles.sort((a, b) =>
        a.angle < b.angle ? -1 : a.angle > b.angle ? 1 : 0
      )

      // compute distance between two angles
      const diffAngle = (a: number, b: number) => {
        // return Math.abs(Math.abs(a) - Math.abs(b));
        const tmp = (Math.PI * 2 + a - b) % (Math.PI * 2)
        if (tmp > Math.PI) {
          return Math.PI * 2 - tmp
        }
        return tmp
      }

      let imax = 0
      let anglMax = diffAngle(angles[angles.length - 1].angle, angles[0].angle)
      // move the starting index to the node just after the largest gap
      for (let i = 1; i < angles.length; i++) {
        const tmp = diffAngle(angles[i - 1].angle, angles[i].angle)
        if (tmp > anglMax) {
          anglMax = tmp
          imax = i
        }
      }

      let cumulAngle = 0 // angle of the current computing group
      let startPosition = 0 // starting index of the current coputing group
      for (let i = 1; i < angles.length; i++) {
        const d = diffAngle(
          angles[(angles.length + i - 1 + imax) % angles.length].angle,
          angles[(angles.length + i + imax) % angles.length].angle
        )
        // angles[(angles.length+imax+i)%angles.length].link.getNode().getData<string[]>("tooltip").push('i:' + i + ' d:'+d);

        let group = false
        if (d <= mergeAngle && i !== angles.length - 1) {
          cumulAngle += d
        } else {
          group = true
          cumulAngle = 0
        }
        let endMerge = i
        if (cumulAngle >= splitAngle) {
          let splitIndex = startPosition
          let splitCumulAngle = 0
          for (
            splitIndex = startPosition + 1;
            splitIndex < endMerge && splitCumulAngle < cumulAngle / 2;
            splitIndex++
          ) {
            splitCumulAngle += diffAngle(
              angles[(angles.length + splitIndex - 1 + imax) % angles.length]
                .angle,
              angles[(angles.length + splitIndex + imax) % angles.length].angle
            )
          }
          group = true
          endMerge = splitIndex
          cumulAngle -= splitCumulAngle
        }
        if (group) {
          if (d > mergeAngle) {
            endMerge--
          }
          if (endMerge - startPosition >= 1) {
            const currentGroupArray: Array<{
              angle: number
              link: Node
            }> = new Array<{ angle: number; link: Node }>()
            for (let j = startPosition; j <= endMerge; j++) {
              currentGroupArray.push(
                angles[(angles.length + j + imax) % angles.length]
              )
            }
            groupResult.push(currentGroupArray)
          }
          startPosition = endMerge + 1
        }
      }
    }
    return groupResult
  }

  test () {
    //
  }

  /**
   * Clear the old displayed graph and recompute it from the raw graph.
   * The dispalyed graph will group the incoming links to a node that has a similar target location (see : {@link groupByAngle()})
   * @param graph
   */
  public refreshDisplayGraphReverse (graph: Graph): void {
    // clear old displayed graph
    graph.clearNodes()
    graph.getData<Graph>('source').foreachNode(node => {
      graph.addNode(node)
    })

    graph.getData<Graph>('source').foreachNode(n => {
      n.foreachLink(l => {
        l.setData<undefined>('path', undefined)
      })
    })

    const socketDistance = 250
    const lineDistance = 20

    // define the angle at which a link will exit the path
    const forwardAngleMax = Math.PI * 0.3
    const backwardAngleMin = Math.PI * 0.303

    /*
        const tmp5 = graph.getData<ContrainteGraph>("sourcec");
        tmp5.physicsFunction(tmp5.localGraph);
        /**/

    graph.foreachNode(node => {
      const links = node.getData<Set<Node> | undefined>('targetedBy')

      if (links !== undefined && links.size > 1) {
        const groups = ConstraintGraph.groupByAngle(
          graph,
          node,
          Math.PI * 0.2,
          Math.PI * 0.5,
          Array.from(links.values())
        )
        links.forEach(l => {
          // (l.getLink(node) as Link).setData<boolean>('visible', true)
          (l.getLink(node) as Link).setData<Node | undefined>(
            'desplayedNode',
            undefined
          )
        })

        const validBusDir = graph.getData<Array<V> | undefined>('validBusDir') // liste of directions that a path can have
        const validBusWeight = graph.getData<Array<number> | undefined>(
          'validBusWeight'
        )

        const nodeSet: Set<Node> = new Set<Node>()
        // loop through each path
        groups.forEach(group => {
          if (group.length > 1) {
            let moyTargetPos: V = new V(0, 0) // the average position of the nodes of the group
            group.forEach(element => {
              moyTargetPos = moyTargetPos.addV(
                element.link.getData<V>('position')
              )
            })
            moyTargetPos = moyTargetPos.divN(group.length)
            const direction = moyTargetPos.subV(node.getData<V>('position')) // direction to reach the moyTargetPos from the origin node
            const initPosition = node
              .getData<V>('position')
              .addV(direction.normalize().multN(socketDistance))

            // path with each junction position
            const path: Array<{
              pos: V
              links: Node[]
              linkOut: Node | undefined
            }> = new Array<{
              pos: V
              links: Node[]
              linkOut: Node | undefined
            }>()
            path.push({
              pos: initPosition,
              links: group.map(e => e.link),
              linkOut: undefined
            })

            let index = 0
            // loop to compute the path
            while (index < path.length && path[index].links.length > 0) {
              const item = path[index]
              let dir = new V(0, 0)
              item.links.forEach(l => {
                dir = l.getData<V>('position').addV(dir)
              })
              dir = dir.divN(item.links.length)
              dir = dir.subV(item.pos)

              // get the nearest valid path direction
              if (validBusDir !== undefined) {
                const match = ArrayUtils.indexOfMin<V>(
                  validBusDir,
                  v => {
                    return Math.abs(dir.angleWith(v))
                  },
                  validBusWeight
                )
                dir = validBusDir[match].multN(dir.length())
              }

              let curPos = item.pos.addV(dir.normalize().multN(lineDistance))
              let countIteration = 1
              // search position of the next junction
              do {
                let angle = 0
                let maxL: Node | undefined
                item.links.forEach(l => {
                  const tmpAngle = Math.abs(
                    l
                      .getData<V>('position')
                      .subV(curPos)
                      .angleWith(dir)
                  )
                  if (tmpAngle > angle) {
                    angle = tmpAngle
                    maxL = l
                  }
                })

                dir = dir.divN(2)

                if (angle >= backwardAngleMin) {
                  if (countIteration === 1) {
                    if (maxL !== undefined) {
                      const l: Node[] = new Array<Node>()
                      item.links.forEach(item => {
                        if (item !== maxL) l.push(item)
                      })
                      const p =
                        index === 0
                          ? node.getData<V>('position')
                          : path[index - 1].pos
                      path.push({
                        pos: item.pos.addV(
                          item.pos
                            .subV(p)
                            .normalize()
                            .multN(lineDistance)
                        ),
                        links: l,
                        linkOut: maxL
                      })
                    }
                    break
                  }

                  curPos = curPos.subV(dir)
                } else if (angle <= forwardAngleMax) {
                  curPos = curPos.addV(dir)
                } else {
                  if (maxL !== undefined) {
                    const l: Node[] = new Array<Node>()
                    item.links.forEach(item => {
                      if (item !== maxL) l.push(item)
                    })
                    path.push({ pos: curPos, links: l, linkOut: maxL })
                  }
                  break
                }

                countIteration++
              } while (countIteration < 500)
              index++
            }

            const connectionIndex: Map<Node, number> = new Map<Node, number>()

            {
              // sort links of the path to not cross the output link of the junctions with the other links of the path
              const fromLeft = new Array<Node>()
              const fromRight = new Array<Node>()
              for (let i = path.length - 1; i > 0; i--) {
                const dir = path[i].pos.subV(path[i - 1].pos)
                if (path[i].linkOut !== undefined) {
                  if (
                    (path[i].linkOut as Node)
                      .getData<V>('position')
                      .subV(path[i].pos)
                      .angleWith(dir) < 0
                  ) {
                    fromLeft.push(path[i].linkOut as Node)
                  } else {
                    fromRight.push(path[i].linkOut as Node)
                  }
                }
              }
              let index = -path.length / 2
              for (let i = fromLeft.length - 1; i >= 0; i--, index++) {
                connectionIndex.set(fromLeft[i], index)
              }
              for (let i = 0; i < fromRight.length; i++, index++) {
                connectionIndex.set(fromRight[i], index)
              }
            }

            // compute position of each junction point for each link of the path
            const lastNodes: Map<Node, Node> = new Map<Node, Node>()
            const nodePaths: Map<Node, Array<V>> = new Map<Node, Array<V>>()
            path[0].links.forEach(e => {
              lastNodes.set(e, node)
              nodePaths.set(e, new Array<V>())
            })
            for (let i = 0; i < path.length; i++) {
              const ortogDir: V =
                i === 0
                  ? path[i].pos
                    .subV(node.getData<V>('position'))
                    .normalize()
                    .rotate90()
                  : path[i].pos
                    .subV(path[i - 1].pos)
                    .normalize()
                    .rotate90()

              const controleNode = graph.addNode(new Node())
              controleNode.setData<V>('position', path[i].pos)
              controleNode.setData<string>('color', '#FFFFFF')

              for (let j = 0; j < path[i].links.length; j++) {
                const pos = path[i].pos.addV(
                  ortogDir.multN(
                    lineDistance *
                      (connectionIndex.get(path[i].links[j] as Node) as number)
                  )
                )
                ;(nodePaths.get(path[i].links[j]) as V[]).push(pos)
                const n = graph
                  .addNode(new Node())
                  .setData<V>('position', pos) as Node
                GraphUtils.FollowArrayMetadata(
                  controleNode,
                  'position',
                  path[i].links[j].getLink(node) as Link,
                  'path',
                  i
                )
                n.setData<number>('size', 0)
                n.addLink(lastNodes.get(path[i].links[j]) as Node)
                  .copyData('color', path[i].links[j])
                  .setData<number>('width', 2)
                lastNodes.set(path[i].links[j], n)
              }
              if (path[i].linkOut !== undefined) {
                const pos = path[i].pos.addV(
                  ortogDir.multN(
                    lineDistance *
                      (connectionIndex.get(path[i].linkOut as Node) as number)
                  )
                )
                const n = graph
                  .addNode(new Node())
                  .setData<V>('position', pos) as Node
                GraphUtils.FollowArrayMetadata(
                  controleNode,
                  'position',
                  (path[i].linkOut as Node).getLink(node) as Link,
                  'path',
                  i
                )
                ;(nodePaths.get(path[i].linkOut as Node) as V[]).push(pos)
                n.setData<number>('size', 0)
                n.addLink(lastNodes.get(path[i].linkOut as Node) as Node)
                  .copyData('color', path[i].linkOut as Node)
                  .setData<number>('width', 2)
                n.addLink(path[i].linkOut as Node)
                  .copyData('color', path[i].linkOut as Node)
                  .setData<boolean>('in', true)
                ;((path[i].linkOut as Node).getLink(node) as Link).setData<
                  Node
                >('displayedNode', n)
              }
              if (path[i].links.length === 1) {
                const n = graph
                  .addNode(new Node())
                  .setData<V>(
                    'position',
                    path[i].pos.addV(
                      ortogDir.multN(
                        lineDistance *
                          (connectionIndex.get(
                            path[i].links[0] as Node
                          ) as number)
                      )
                    )
                  ) as Node
                n.setData<number>('size', 0)
                // n.setData<boolean>('visible', false)
                n.addLink(lastNodes.get(path[i].links[0] as Node) as Node)
                  .copyData('color', path[i].links[0] as Node)
                  .setData<number>('width', 2)
                n.addLink(path[i].links[0] as Node)
                  .copyData('color', path[i].links[0] as Node)
                  .setData<boolean>('in', true)
                /* ;((path[i].links[0] as Node).getLink(node) as Link).setData<
                  boolean
                >('visible', false) */
              }
            }
            /*
            if (path[path.length - 1].links[0] !== undefined) {
              // lastNode.addLink(path[path.length-1].links[0]).copyData("color", path[path.length-1].links[0]).setData<boolean>("in", true);
              ((path[path.length - 1].links[0] as Node).getLink(
                node
              ) as Link).setData<boolean>('visible', false)
            }
            */

            nodePaths.forEach((value: V[], key: Node) => {
              (key.getLink(node) as Link).setData<V[]>('path', value)
              if (!nodeSet.has(key)) nodeSet.add(key)
              else console.warn('multiple path for node : ', key)
              // console.log(key.getLink(node)?.getData<Vec2[]>('path'));
              // console.log(key.getLink(node));
            })
          }
        })
        /*
                links.forEach(l => {
                    if (!nodeSet.has(l)){
                        console.log("unpath : ", l)
                        l.getLink(node)?.setData<undefined>('path', undefined);
                    }
                })
                */
      } else {
        if (links !== undefined) {
          (links as Set<Node>).forEach(l => {
            l.setData<undefined>('path', undefined)
          })
        }
      }
    })

    // ContrainteGraph.refreshDisplayGraph(graph, false);
  }
  /*
  public static refreshDisplayGraph (graph: Graph, clear = true): void {
    // console.log(graph);
    // physicsFunction(graph.getData<Graph>("source"));

    // const tmp5 = graph.getData<ContrainteGraph>("sourcec");
    // tmp5.physicsFunction(tmp5.localGraph);
    if (clear) {
      graph.clearNodes()
      let map = graph.getData<Map<Node, Link>>('displayLinks')
      if (map == undefined) {
        map = new Map<Node, Link>()
        graph.setData<Map<Node, Link>>('displayLinks', map)
      } else {
        map.forEach((value: Link, key: Node) => {
          key.removeLink(value.getNode())
        })
      }
      graph.getData<Graph>('source').foreachNode(node => {
        graph.addNode(node)
      })
    }

    const todo: Set<Node> = new Set<Node>()

    const mergeLowAngle = (node: Node) => {
      const angles: Array<{ angle: number; link: Link }> = new Array<{
        angle: number
        link: Link
      }>()
      const p = node.getData<Vec2>('position')

      // console.log(angles);

      node.foreachLink(link => {
        if (!link.getDataOrDefault<boolean>('isDisplay', false)) {
          const lpos = link
            .getDataOrDefault<Node>('displayedNode', link.getNode())
            .getData<Vec2>('position')

          if (Vector2.norm(Vector2.minus(lpos, p)) > 0.01) {
            if (
              link.getDataOrDefault<Node | undefined>(
                'displayedNode',
                undefined
              ) == undefined
            ) {
              link.setData<boolean>('visible', true)
            }
            angles.push({
              angle: Vector2.angle(Vector2.minus(lpos, p)),
              link: link
            })
          }
        }
      })
      if (angles.length > 1) {
        angles.sort((a, b) =>
          a.angle < b.angle ? -1 : a.angle > b.angle ? 1 : 0
        )

        const diffAngle = (a: number, b: number) => {
          // return Math.abs(Math.abs(a) - Math.abs(b));
          const tmp = (Math.PI * 2 + a - b) % (Math.PI * 2)
          if (tmp > Math.PI) {
            return Math.PI * 2 - tmp
          }
          return tmp
        }

        let imax = 0
        let anglMax = diffAngle(
          angles[angles.length - 1].angle,
          angles[0].angle
        )
        for (let i = 1; i < angles.length; i++) {
          const tmp = diffAngle(angles[i - 1].angle, angles[i].angle)
          if (tmp > anglMax) {
            anglMax = tmp
            imax = i
          }
        }
        const splitAngle = Math.PI * 0.6
        const mergeAngle = Math.PI * 0.2

        const displayNodeStyle = (node: Node, source: Node) => {
          // node.setData<string>("color", '#D7DBDD');
          node.copyData<string>('color', source)
          node.setData<number>('width', 2)
          node.setData<number>('size', 2)
          node.setData<string>('borderColor', '#2C3E50')
        }

        let cumulAngle = 0
        let startPosition = 0
        for (let i = 1; i < angles.length + 1; i++) {
          const d = diffAngle(
            angles[(angles.length + i - 1 + imax) % angles.length].angle,
            angles[(angles.length + i + imax) % angles.length].angle
          )
          // angles[(angles.length+imax+i)%angles.length].link.getNode().getData<string[]>("tooltip").push('i:' + i + ' d:'+d);

          let group = false
          if (d <= mergeAngle && i != angles.length) {
            cumulAngle += d
          } else {
            group = true
            cumulAngle = 0
          }
          let endMerge = i
          if (cumulAngle >= splitAngle) {
            let splitIndex = startPosition
            let splitCumulAngle = 0
            for (
              splitIndex = startPosition + 1;
              splitIndex < endMerge && splitCumulAngle < cumulAngle / 2;
              splitIndex++
            ) {
              splitCumulAngle += diffAngle(
                angles[(angles.length + splitIndex - 1 + imax) % angles.length]
                  .angle,
                angles[(angles.length + splitIndex + imax) % angles.length]
                  .angle
              )
            }
            group = true
            endMerge = splitIndex
            cumulAngle -= splitCumulAngle
          }
          if (group) {
            if (d > mergeAngle) {
              endMerge--
            }
            if (endMerge - startPosition >= 1) {
              const n1 = graph.addNode(new Node())
              displayNodeStyle(n1, node)
              const n2 = graph.addNode(new Node())
              displayNodeStyle(n2, node)

              let targetPos = new Vector2(0, 0)
              let sumForce = 0
              for (let j = startPosition; j <= endMerge; j++) {
                const data = angles[(angles.length + j + imax) % angles.length]
                targetPos = Vector2.plus(
                  targetPos,
                  data.link
                    .getDataOrDefault<Node>(
                      'displayedNode',
                      data.link.getNode()
                    )
                    .getData<Vec2>('position')
                )
                sumForce += Math.abs(data.link.getData<number>('strength'))
                data.link.setData<boolean>('visible', false)
                n2.addLink(
                  data.link.getDataOrDefault<Node>(
                    'displayedNode',
                    data.link.getNode()
                  )
                )
                  .copyData('width', data.link)
                  .copyData('color', data.link)
                  .copyData('out', data.link)
                data.link
                  .getData<Node | undefined>('displayedNode')
                  ?.foreachLink(l => {
                    if (l.getDataOrDefault<boolean>('in', false)) {
                      l.setData<boolean>('visible', false)
                    }
                  })
              }
              targetPos = Vector2.divide(
                targetPos,
                endMerge - startPosition + 1
              )

              n1.setData<Vec2>(
                'position',
                Vector2.plus(
                  p,
                  Vector2.multiply(Vector2.minus(targetPos, p), 0.2)
                )
              )
              n2.setData<Vec2>(
                'position',
                Vector2.plus(
                  p,
                  Vector2.multiply(Vector2.minus(targetPos, p), 0.8)
                )
              )
              n1.addLink(n2)
                .setData<number>('width', sumForce)
                .copyData<string>('color', node)
              n1.addLink(node)
                .setData<number>('width', sumForce)
                .copyData<string>('color', node)
              todo.add(n2)
            }
            startPosition = endMerge + 1
          }
        }
      }
    }

    graph.getData<Graph>('source').foreachNode(mergeLowAngle)

    todo.forEach(mergeLowAngle)
  }
  */

  addLinkToConstraint (
    contraintName: string,
    sourceName: string,
    strength: number
  ): void {
    const link = (this.source.get(sourceName) as Source).addLink(
      this.contrainte.get(contraintName) as Constraint
    ) as Link
    link.setData<number>('weight', strength)
    link.setData<number>('width', Math.abs(strength))
    link.setData<number>('strength', strength)
    link.setData<boolean>('usePhysics', true)
    link
      .getNode()
      .getOrAddData<Set<Node>>('targetedBy', new Set<Node>())
      .add(this.source.get(sourceName) as Node)
    link.setData<string>(
      'color',
      (this.source.get(sourceName) as Source).getData('color')
    )
    /*
        if (strength > 0){
            link.setData<string>("color", '#27AE60');
        }
        else{
            link.setData<string>("color", '#E74C3C');
        }
        */
    link.setData<boolean>('out', true)
  }

  addLinkFromSourceToSource (
    fromSourceName: string,
    toSourceName: string,
    strength: number
  ): void {
    const link = (this.source.get(fromSourceName) as Source).addLink(
      this.source.get(toSourceName) as Source
    ) as Link
    link.setData<number>('weight', strength)
    link.setData<number>('width', Math.abs(strength))
    link.setData<number>('strength', strength)
    link.setData<boolean>('usePhysics', true)
    link
      .getNode()
      .getOrAddData<Set<Node>>('targetedBy', new Set<Node>())
      .add(this.source.get(fromSourceName) as Node)
    // console.log(link.getData<Set<Node>>("targetedBy").size);
    if (strength > 0) {
      link.setData<string>('color', '#27AE60')
    } else {
      link.setData<string>('color', '#E74C3C')
    }
    link.setData<boolean>('out', true)
  }

  /**
   * compute default position of nodes
   */
  public refreshPosition (): void {
    /*
    console.log('refreshPosition')
    const toCheckSet: Set<Node> = new Set<Node>()
    let i = -this.contrainte.size / 2
    this.contrainte.forEach((value, key) => {
      // console.log(value.getData<string>("name"));
      value.setData<number>('depth', i)
      value
        .getDataOrDefault<Set<Node>>('targetedBy', new Set<Node>())
        .forEach(n => {
          // console.log("\t"+n.getData<string>("name"))
          if (!toCheckSet.has(n)) {
            toCheckSet.add(n)
          }
        })
      i++
    })

    toCheckSet.forEach(n => {
      let max: number | undefined
      let moy = 0
      let nb = 0
      n.foreachLink(l => {
        const d = l.getNode().getData<number | undefined>('depth')
        if (d !== undefined) {
          if (max === undefined || d > max) {
            max = d
          }
          moy += d
          nb++
        }
      })
      if (max !== undefined) n.setData<number>('depth', max + 1)
      n.setData<number>('moyDepth', moy / nb)

      // console.log("depth:" + max + " moyDepth:"+(moy/nb));
    })

    const dist = 400
    this.contrainte.forEach(c => {
      c.setData<Vec2>(
        'position',
        new Vector2(c.getData<number>('depth') * dist, 0)
      )
    })

    const sourcePosition: Map<Source, Vec2> = new Map<Source, Vec2>()
    this.source.forEach(n => {
      sourcePosition.set(
        n,
        new Vector2(
          n.getData<number>('moyDepth') * dist,
          -Math.abs(n.getData<number>('depth')) * dist
          // -n.getData<number>('hierarchy') * dist
        )
      )
      n.setData<Vec2>('position', sourcePosition.get(n) as Vec2)
    })

    GraphUtils.hierarchization(this.localGraph, 'h', 'hierarchy')

    this.localGraph.foreachNode(n => {
      n.setData<Vec2>(
        'position',
        new Vector2(
          n.getData<Vec2>('position').x,
          -n.getData<number>('hierarchy') * dist
        )
      )
    })
    */

    GraphLayout.verticalHierarchyLayout(this.getRawGraph(), 500)
    GraphLayout.horizontalOrdering(this.getRawGraph(), 400)
  }

  /**
   * load excel file of constraint
   * @param wb
   */
  public loadXLSX (wb: IWorkBook): void {
    const sheet: XLSX.IWorkSheet = wb.Sheets[wb.SheetNames[0]]

    const nameOf: { (x: number, y: number): string } = (x, y) => {
      return XLSX.utils.encode_cell({ c: x, r: y })
    }

    const beginConstraint = 1
    let endConstraint = -1
    let beginSource = -1
    let endSource = -1
    let i = beginConstraint

    const nameMap: Map<number, string> = new Map<number, string>()

    while (endConstraint === -1) {
      const value = sheet[nameOf(0, i)]
      if (value !== undefined) {
        this.addContrainte(value.v, +sheet[nameOf(1, i)].v)
        nameMap.set(i, value.v)
      } else {
        endConstraint = i
        beginSource = i + 1
      }
      i++
    }
    while (endSource === -1) {
      const value = sheet[nameOf(0, i)]
      if (value !== undefined) {
        this.addSource(value.v)
        nameMap.set(i, value.v)
      } else {
        endSource = i
        // beginSource = i+1;
      }
      i++
    }

    for (let x = 2; x < 2 + endSource - beginSource; x++) {
      for (let y = beginConstraint; y < endConstraint; y++) {
        // console.log('x:' + x + " y:" + y + " name:" + nameOf(x,y) + " contraint:" + nameOf(0,y) + " source:" + nameOf(x,0));
        const value = sheet[nameOf(x, y)]
        if (value !== undefined && +value.v !== 0) {
          this.addLinkToConstraint(
            nameMap.get(y) as string,
            nameMap.get(x - 2 + beginSource) as string,
            +value.v
          )
        }
      }
    }

    for (let x = 0; x < endSource - beginSource; x++) {
      for (let y = 0; y < endSource - beginSource; y++) {
        if (x !== y) {
          const value = sheet[nameOf(x + 2, y + beginSource)]
          if (+value.v !== 0) {
            this.addLinkFromSourceToSource(
              nameMap.get(x + beginSource) as string,
              nameMap.get(y + beginSource) as string,
              +value.v
            )
          }
        }
      }
    }

    this.refreshPosition()
    // this.refreshDisplayGraph(this.displayGraph);
    this.refreshDisplayGraphReverse(this.displayGraph)
    if (!this.localGraph.getData<boolean>('autoRefreshBus')) {
      this.localGraph.getData<{(): void }>('Auto Refresh Bus')()
    }
  }
}
