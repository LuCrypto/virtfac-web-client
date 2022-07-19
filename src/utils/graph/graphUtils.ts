// import { Node } from '@/utils/graph/node'
// import { Vec2, Vector2 } from '@/utils/graph/Vec'
import V from '@/utils/vector'
import { MetaData } from '@/utils/graph/metadata'
import { Graph } from '@/utils/graph/graph'
import { Node } from '@/utils/graph/node'
import { Link } from '@/utils/graph/link'

export class GraphUtils {
  public static FollowArrayMetadata (
    attach: MetaData,
    attachProperty = 'position',
    child: MetaData,
    childProperty: string,
    childPropertyIndex: number
  ) {
    child
      .getOrAddData<Map<number, V>>(
        'old_attach_' + attachProperty,
        new Map<number, V>()
      )
      .set(childPropertyIndex, attach.getData<V>(attachProperty))
    attach.onDataChanged().addMappedListener(attachProperty, arg => {
      const pos: V[] = child.getData<V[]>(childProperty)
      pos[childPropertyIndex] = attach
        .getData<V>(attachProperty)
        .subV(
          child
            .getData<Map<number, V>>('old_attach_' + attachProperty)
            .get(childPropertyIndex) as V
        )
        .addV(pos[childPropertyIndex])
      child.setData<V[]>(childProperty, pos)
      child
        .getData<Map<number, V>>('old_attach_' + attachProperty)
        .set(childPropertyIndex, attach.getData<V>(attachProperty))
    })
  }

  public static hierarchization (
    graph: Graph,
    outputField: string,
    levelField?: string | undefined,
    totalLevel?: boolean | undefined
  ) {
    const _tmp = '__hierarchization_path'

    const arr = new Array<{ node: Node; h: number }>()

    graph.foreachNode(n => {
      const toTravel = new Array<Node>()
      const traveledNodes = new Set<Node>()
      traveledNodes.add(n)
      toTravel.push(n)
      n.setData<boolean>(_tmp, true)
      let impacted = 0
      while (toTravel.length > 0) {
        const c = toTravel.pop() as Node
        c.foreachLink(l => {
          if (!l.getNode().getData<boolean | undefined>(_tmp)) {
            const node = l.getNode()
            traveledNodes.add(node)
            toTravel.push(node)
            node.setData<boolean>(_tmp, true)
            impacted++
          }
        })
      }
      n.setData<number>(outputField, impacted)
      traveledNodes.forEach(n => n.setData<undefined>(_tmp, undefined))
      arr.push({ node: n, h: impacted })
    })

    arr.sort((a, b) => {
      return a.h - b.h
    })
    let level = 0
    for (let i = 0; i < arr.length; i++) {
      if (totalLevel) {
        level++
      } else {
        if (arr[i].h !== 0) {
          level++
        }
      }
      if (levelField !== undefined) arr[i].node.setData(levelField, level)
    }
  }

  public static computeLevels (
    graph: Graph,
    outputField: string,
    ingoredField?: string | undefined
  ): number {
    const targetedByField = '__targetedBy'
    const nodePool = new Set<Node>()

    graph.foreachNode(n => {
      if (
        ingoredField === undefined ||
        !n.getDataOrDefault<boolean>(ingoredField, false)
      ) {
        n.setData<undefined>(outputField, undefined)
        nodePool.add(n)
        n.foreachLink(l => {
          if (
            ingoredField === undefined ||
            !l.getDataOrDefault<boolean>(ingoredField, false)
          ) {
            l.getNode()
              .getOrAddData<Set<Node>>(targetedByField, new Set<Node>())
              .add(l.getOriginNode())
          }
        })
      }
    })

    let hasChanged = true
    let level = 0
    while (nodePool.size > 0 && hasChanged) {
      hasChanged = false
      const assignedNodeArray = new Array<Node>()
      nodePool.forEach(n => {
        if (
          n.getData(outputField) === undefined &&
          n.getDataOrDefault<Set<Node>>(targetedByField, new Set<Node>())
            .size === 0
        ) {
          assignedNodeArray.push(n)
        }
      })
      if (assignedNodeArray.length > 0) hasChanged = true
      assignedNodeArray.forEach(n => {
        n.setData<number>(outputField, level)
        n.foreachLink(l => {
          l.getNode()
            .getData<Set<Node>>(targetedByField)
            .delete(n)
        })
        nodePool.delete(n)
      })

      level++
    }

    if (nodePool.size !== 0) {
      console.warn(
        'cannot complete level computation due to cycle in the graph'
      )
    }
    graph.foreachNode(n => {
      n.setData<undefined>(targetedByField, undefined)
    })
    return level
  }

  public static getTransitiveLinks (graph: Graph): Set<Link> {
    const _tmp = '__transitive_path'
    const transitiveSet = new Set<Link>()

    graph.foreachNode(n => {
      const toTravel = new Array<Node>()
      const traveledNodes = new Set<Node>()
      traveledNodes.add(n)
      // toTravel.push(n)
      n.setData<boolean>(_tmp, true)
      n.foreachLink(l => {
        toTravel.push(l.getNode())
        traveledNodes.add(l.getNode())
        // l.getNode().setData<boolean>(_tmp, true)
      })
      while (toTravel.length > 0) {
        const c = toTravel.pop() as Node
        c.foreachLink(l => {
          if (!l.getNode().getData<boolean | undefined>(_tmp)) {
            const node = l.getNode()
            traveledNodes.add(node)
            toTravel.push(node)
            node.setData<boolean>(_tmp, true)
            const link = n.getLink(node)
            if (link !== undefined) {
              transitiveSet.add(link)
            }
          }
        })
      }
      traveledNodes.forEach(n => n.setData<undefined>(_tmp, undefined))
    })
    console.log(transitiveSet)

    return transitiveSet
  }

  public static genOrderGraph (): { graph: Graph; displayGraph: Graph } {
    const nbNode = 40
    const xSpread = nbNode * 80
    const xOffset = -xSpread / 2
    const linkDensity = 1.5

    const graph = new Graph()
    const displayGraph = new Graph()

    graph.setData<number>('fasScore', 0)
    graph.setData<Map<Link, Array<Node>>>(
      'attachedNodes',
      new Map<Link, Array<Node>>()
    )

    const nodeArray = new Array<Node>()
    graph.setData<number>('nbLink', 10)

    const updateLinkGoback = (l: Link) => {
      const oldGoBack = l.getDataOrDefault<boolean>('goBack', false)
      if (
        l.getNode().getData<V>('position').x >
        l.getOriginNode().getData<V>('position').x
      ) {
        if (oldGoBack !== false) {
          l.setData('goBack', false)
          graph.setData<number>(
            'fasScore',
            graph.getData<number>('fasScore') -
              l.getDataOrDefault<number>('weight', 1)
          )
          // this.fasScore--;
        }
      } else {
        if (oldGoBack !== true) {
          l.setData('goBack', true)
          // this.fasScore++;
          graph.setData<number>(
            'fasScore',
            graph.getData<number>('fasScore') +
              l.getDataOrDefault<number>('weight', 1)
          )
        }
      }
    }

    graph.onLinkDataChanged().addMappedListener('weight', arg => {
      arg.link.setData<number>(
        'width',
        Math.max(1, Math.min(Math.log(arg.value as number), 30))
      )
    })

    graph.onLinkAdded().addListener(arg => {
      arg.link.setData('visible', false)
      arg.link
        .getNode()
        .getData<Set<Link>>('targetedBy')
        .add(arg.link)
      arg.link.setData('out', true)
      arg.link.setData('color', '#27AE60')
      const id = graph.getData<number>('nbLink') + 1
      arg.link.setData<number>('id', id)
      graph.setData<number>('nbLink', id)
      const n1 = displayGraph.addNode(
        new Node()
          .setData('visible', false)
          .setData('size', 0)
          .setData<V>(
            'position',
            new V(
              arg.link.getOriginNode().getData<V>('position').x +
                (arg.link.getData<boolean>('goBack') ? -20 : 20),
              id * 10
            )
          ) as Node
      )
      const n2 = displayGraph.addNode(
        new Node()
          .setData('visible', false)
          .setData('size', 0)
          .setData<V>(
            'position',
            new V(
              arg.link.getNode().getData<V>('position').x +
                (arg.link.getData<boolean>('goBack') ? 20 : -20),
              id * 10
            )
          ) as Node
      )

      const refreshNpos = () => {
        const b = arg.link.getData<boolean>('goBack')
        const y =
          (Math.abs(
            arg.link.getNode().getData<V>('position').x -
              arg.link.getOriginNode().getData<V>('position').x
          ) /
            2) *
          (b ? 1 : -1)
        n1.setData<V>(
          'position',
          new V(
            arg.link.getOriginNode().getData<V>('position').x +
              (arg.link.getData<boolean>('goBack') ? -20 : 20),
            y
          )
        )
        n2.setData<V>(
          'position',
          new V(arg.link.getNode().getData<V>('position').x + (b ? 20 : -20), y)
        )
      }
      graph
        .getData<Map<Link, Array<Node>>>('attachedNodes')
        .set(arg.link, [n1, n2])
      // ;(m.get(arg.link) as Array<Node>).push(n1, n2)
      arg.link
        .getOriginNode()
        .onDataChanged()
        .addMappedListener('position', a => {
          refreshNpos()
        })
      arg.link
        .getNode()
        .onDataChanged()
        .addMappedListener('position', a => {
          refreshNpos()
        })
      const l1 = n1.addLink(arg.link.getOriginNode())
      const l2 = n1.addLink(n2)
      const l3 = n2.addLink(arg.link.getNode()).setData('out', true)
      arg.link.onDataChanged().addMappedListener('color', arg => {
        l1.setData('color', arg.value)
        l2.setData('color', arg.value)
        l3.setData('color', arg.value)
      })
      arg.link.onDataChanged().addMappedListener('width', arg => {
        l1.setData('width', arg.value)
        l2.setData('width', arg.value)
        l3.setData('width', arg.value)
      })
      arg.link.onDataChanged().addMappedListener('goBack', a => {
        // const y = arg.link.getData<number>("id") * 10 * (a.value ? 1 : -1);
        const y =
          (Math.abs(
            arg.link.getNode().getData<V>('position').x -
              arg.link.getOriginNode().getData<V>('position').x
          ) /
            2) *
          (a.value ? 1 : -1)
        n1.getData<V>('position').y = y
        n2.getData<V>('position').y = y
      })
      arg.link.setData('goBack', false)
      updateLinkGoback(arg.link)
    })
    graph.onLinkRemoved().addListener(arg => {
      console.log('link removed')
      ;(graph
        .getData<Map<Link, Array<Node>>>('attachedNodes')
        .get(arg.link) as Array<Node>).forEach(n => {
        n.foreachLink(l => {
          n.removeLink(l.getNode())
        })
        displayGraph.removeNode(n)
        console.log('remove display node')
      })
    }, this)

    graph.onNodeAdded().addListener(arg => {
      arg.node.setData('targetedBy', new Set<Link>())
      arg.node.setData<V>(
        'position',
        new V(Math.random() * xSpread + xOffset, 0)
      )
      displayGraph.addNode(arg.node)
    })

    graph.onNodeDataChanged().addMappedListener('position', arg => {
      const p = arg.node.getData<V>('position')
      arg.node.foreachLink(l => {
        updateLinkGoback(l)
      })
      arg.node.getData<Set<Link>>('targetedBy').forEach(l => {
        updateLinkGoback(l)
      })
    })

    graph.onLinkDataChanged().addMappedListener('goBack', arg => {
      arg.link.setData<string>('color', arg.value ? '#E74C3C' : '#27AE60')
    })

    /*
    random graph
    for (let i = 0; i < nbNode; i++) {
      nodeArray.push(graph.addNode(new Node()))
    }

    for (let i = 0; i < nbNode * linkDensity; i++) {
      const n1 = Math.trunc(Math.random() * nodeArray.length)
      const n2 = Math.trunc(Math.random() * nodeArray.length)
      if (n1 !== n2 && nodeArray[n1].getLink(nodeArray[n2]) === undefined) {
        nodeArray[n1].addLink(nodeArray[n2])
      }
    }
    for (let i = 0; i < nbNode; i++) {
      nodeArray[i].setData<Vec2>(
        'position',
        new Vector2((i / nbNode) * xSpread + xOffset, 0)
      )
    }
    /**/

    GraphUtils.orderAlgo(graph, nbNode, xSpread, xOffset, linkDensity)

    return { graph: graph, displayGraph: displayGraph }
  }

  public static orderAlgo (
    graph: Graph,
    nbNode: number,
    xSpread: number,
    xOffset: number,
    linkDensity: number
  ) {
    console.log('\thierarchization')
    GraphUtils.hierarchization(graph, 'h', 'hierarchy', true)
    graph.foreachNode(n => {
      n.setData<V>(
        'position',
        new V(
          ((nbNode - n.getData<number>('hierarchy')) * xSpread) / nbNode +
            xOffset,
          0
        )
      )
    })

    console.log('\tgroup')
    const hGroups = new Set<number>()
    const subGraph = new Map<number, Array<Node>>()
    graph.foreachNode(n => {
      n.foreachLink(l => {
        if (l.getData<boolean>('goBack')) {
          const h = l.getNode().getDataOrDefault<number>('h', 0)
          if (!hGroups.has(h)) {
            hGroups.add(h)
            subGraph.set(h, new Array<Node>())
          }
        }
      })
    })
    graph.foreachNode(n => {
      const h = n.getDataOrDefault<number>('h', 0)
      if (hGroups.has(h)) {
        (subGraph.get(h) as Array<Node>).push(n)
        // n.setData<string>('color', '#E74C3C')
      }
    })

    const colArray: string[] = [
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
    let groupId = 0

    subGraph.forEach(value => {
      /*
      value.forEach(n => {
        n.setData<string>('color', colArray[groupId])
      })
      */
      groupId++
      groupId %= colArray.length
    })

    // tabu search
    subGraph.forEach(group => {
      console.log(
        '\t1',
        group.map(n => n.getData<string>('name'))
      )
      if (group.length < 2) return
      let nextId = 0
      const orderArray = new Array<string>(group.length)
      const posToOrder = new Map<number, number>()
      const orderToPos = new Map<number, number>()
      const nodeArray = new Array<Node>()
      {
        const xCoordArray = new Array<number>()
        group.forEach(node => {
          nodeArray.push(node)
          node.setData<number>('subGroupId', nextId++)
          xCoordArray.push(node.getData<V>('position').x)
        })
        xCoordArray.sort((a, b) => {
          return a - b
        })
        for (let i = 0; i < xCoordArray.length; i++) {
          posToOrder.set(xCoordArray[i], i)
          orderToPos.set(i, xCoordArray[i])
        }
        group.forEach(node => {
          orderArray[posToOrder.get(node.getData<V>('position').x) as number] =
            '' + node.getData<number>('subGroupId')
        })
      }
      const tabuMap = new Map<string, number>()
      const iteration = 0
      console.log('\t2', group)

      const swap = (n1: Node, n2: Node) => {
        const p = n2.getData<V>('position')
        const n1p = n1.getData<V>('position')
        n2.setData<V>('position', n1p)
        n1.setData<V>('position', p)
        orderArray[posToOrder.get(n1.getData<V>('position').x) as number] =
          '' + n1.getData<number>('subGroupId')
        orderArray[posToOrder.get(n2.getData<V>('position').x) as number] =
          '' + n2.getData<number>('subGroupId')
      }

      const getString = () => {
        return orderArray.join(';')
      }

      const applyString = (str: string) => {
        const arr = str.split(';')
        for (let i = 0; i < arr.length; i++) {
          orderArray[i] = arr[i]
          nodeArray[+arr[i]].getData<V>('position').x = orderToPos.get(
            +i
          ) as number
          nodeArray[+arr[i]].onDataChanged().notify({
            key: 'position',
            arg: { value: nodeArray[+arr[i]].getData<V>('position') }
          })
        }
      }

      let bestResult = {
        order: getString(),
        score: graph.getData<number>('fasScore')
      }

      //
      let currentEpoq = new Array<{ order: string; score: number }>()
      let nextEpoq = new Array<{ order: string; score: number }>()

      const mutationCount = 4
      const ramdomProportion = 0.5

      for (let i = 0; i < nodeArray.length * mutationCount; i++) {
        /*
        const n1 = Math.round(Math.random() * (nodeArray.length - 1));
        let n2 = Math.round(Math.random() * (nodeArray.length - 1));
        while (n2 === n1)
          n2 = Math.round(Math.random() * (nodeArray.length - 1));
        swap(nodeArray[n1], nodeArray[n2]);
        currentEpoq.push({ order: getString(), score: this.fasScore });
        applyString(bestResult.order);
        currentEpoq.sort((a, b) => {
          return a.score - b.score;
        });
        */
        const arr = new Array<{ node: number; position: number }>()
        for (let i = 0; i < nodeArray.length; i++) {
          arr.push({ node: i, position: Math.random() })
        }
        arr.sort((a, b) => {
          return a.position - b.position
        })
        for (let i = 0; i < nodeArray.length; i++) {
          orderArray[i] = '' + arr[i].node
        }
        applyString(getString())
        currentEpoq.push({
          order: getString(),
          score: graph.getData<number>('fasScore')
        })
      }

      let noChangesCount = 0
      while (noChangesCount < 100) {
        nextEpoq = new Array<{ order: string; score: number }>()
        for (let i = 0; i < currentEpoq.length && i < nodeArray.length; i++) {
          let mutations = 0
          let maxTest = 10
          do {
            applyString(currentEpoq[i].order)
            let o = ''

            if (Math.random() < 0.2) {
              let goBacksPos = -1
              let link: Link | null = null
              const n1 = Math.round(Math.random() * (nodeArray.length - 1))
              nodeArray[n1].foreachLink(l => {
                if (l.getDataOrDefault<boolean>('goBack', false)) {
                  const x = l.getNode().getData<V>('position').x
                  if (goBacksPos === -1 || x < goBacksPos) {
                    goBacksPos = x
                    link = l
                  }
                }
              })
              if (link !== null) {
                const o2 = posToOrder.get(
                  (link as Link).getNode().getData<V>('position').x
                ) as number
                const o1 = posToOrder.get(
                  nodeArray[n1].getData<V>('position').x
                ) as number
                // console.log('move ' + o1 + " to " + o2 + "; from " + getString())
                if (Math.random() < 0.5) {
                  orderArray.splice(o2, 0, orderArray.splice(o1, 1)[0])
                } else {
                  orderArray.splice(o1, 0, orderArray.splice(o2, 1)[0])
                }
                applyString(orderArray.join(';'))
                // console.log('\t' + getString())
                o = getString()
              }
            }
            if (o === '') {
              if (Math.random() < 0.5) {
                const n1 = Math.round(Math.random() * (nodeArray.length - 1))
                let n2 = Math.round(Math.random() * (nodeArray.length - 1))
                while (n2 === n1) {
                  n2 = Math.round(Math.random() * (nodeArray.length - 1))
                }

                swap(nodeArray[n1], nodeArray[n2])

                // nextEpoq.push({ order: getString(), score: this.fasScore });
                o = getString()
              } else {
                const n1 = Math.round(Math.random() * (nodeArray.length - 1))
                let n2 = 0
                if (Math.random() < 0.5) {
                  n2 =
                    n1 > 0
                      ? n1 < nodeArray.length - 1
                        ? Math.random() < 0.5
                          ? n1 + 1
                          : n1 - 1
                        : n1 - 1
                      : 1
                } else {
                  let n2 = Math.round(Math.random() * (nodeArray.length - 1))
                  while (n2 === n1) {
                    n2 = Math.round(Math.random() * (nodeArray.length - 1))
                  }
                }
                orderArray.splice(n2, 0, orderArray.splice(n1, 1)[0])
                applyString(orderArray.join(';'))

                // nextEpoq.push({ order: getString(), score: this.fasScore });
                o = getString()
              }
            }
            if (!tabuMap.has(o)) {
              tabuMap.set(o, iteration)
              nextEpoq.push({
                order: o,
                score: graph.getData<number>('fasScore')
              })
              mutations++
            }
            maxTest--
          } while (mutations < mutationCount && maxTest > 0)
        }
        nextEpoq.sort((a, b) => {
          return a.score - b.score
        })
        if (nextEpoq[0] === undefined) {
          console.log(nextEpoq)
          applyString(bestResult.order)
          break
        }
        if (nextEpoq[0].score < bestResult.score) {
          bestResult = nextEpoq[0]
          console.log(bestResult)
          noChangesCount = 0
        } else {
          // console.log("noChanges")
          noChangesCount++
        }
        currentEpoq = nextEpoq
        currentEpoq.push(bestResult)
        applyString(bestResult.order)
      }

      console.log('\t4', group)
    })
  }
}
