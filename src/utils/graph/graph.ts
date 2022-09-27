import { MetaData } from '@/utils/graph/metadata'
import { LocalEvent, MapLocalEvent } from '@/utils/graph//localEvent'
import { Node } from '@/utils/graph/node'
import { Link } from '@/utils/graph/link'
import V from '@/utils/vector'

export interface GraphJSON {
  nodeIdField: string
  graphFields: Record<string, unknown>
  nodeFields: Record<string, unknown>
  linkFields: Record<string, unknown>
  graphData: unknown
  nodes: Array<{
    id: string
    data: unknown
    links: { targetId: string; data: unknown }[]
  }>
}

/**
 * Graph structure
 */
/// <reference path="@/utils/metadata"/>
export class Graph extends MetaData {
  private nodes: Set<Node>

  ///
  // #region NODE EVENTS
  ///
  private nodeAdded: LocalEvent<{ graph: Graph; node: Node }> = new LocalEvent<{
    graph: Graph
    node: Node
  }>()

  public onNodeAdded () {
    return this.nodeAdded
  }

  private nodeRemoved: LocalEvent<{
    graph: Graph
    node: Node
  }> = new LocalEvent<{ graph: Graph; node: Node }>()

  public onNodeRemoved () {
    return this.nodeRemoved
  }

  private nodeDataChanged: MapLocalEvent<
    string,
    { graph: Graph; node: Node; value: unknown }
  > = new MapLocalEvent<string, { graph: Graph; node: Node; value: unknown }>()

  public onNodeDataChanged () {
    return this.nodeDataChanged
  }
  // #endregion
  ///

  ///
  // #region LINK EVENTS
  ///
  private linkAdded: LocalEvent<{ graph: Graph; link: Link }> = new LocalEvent<{
    graph: Graph
    link: Link
  }>()

  public onLinkAdded () {
    return this.linkAdded
  }

  private linkRemoved: LocalEvent<{
    graph: Graph
    link: Link
  }> = new LocalEvent<{ graph: Graph; link: Link }>()

  public onLinkRemoved () {
    return this.linkRemoved
  }

  private linkDataChanged: MapLocalEvent<
    string,
    { graph: Graph; link: Link; value: unknown }
  > = new MapLocalEvent<string, { graph: Graph; link: Link; value: unknown }>()

  public onLinkDataChanged () {
    return this.linkDataChanged
  }
  // #endregion
  ///

  ///
  // #region NODES
  ///

  public foreachNode (func: { (node: Node): void }): void {
    this.nodes.forEach(func)
  }

  public foreachLink (func: { (link: Link): void }): void {
    this.nodes.forEach(n => n.foreachLink(func))
  }

  public addNode (node: Node): Node {
    node.onDataChanged().addListener(arg => {
      this.nodeDataChanged.notify({
        key: arg.key,
        arg: { graph: this, node: node, value: arg.arg.value }
      })
    }, this)
    node.onLinkDataChanged().addListener(arg => {
      this.linkDataChanged.notify({
        key: arg.key,
        arg: { graph: this, link: arg.arg.link, value: arg.arg.value }
      })
    }, this)
    node.onLinkAdded().addListener(arg => {
      this.linkAdded.notify({ graph: this, link: arg })
    }, this)
    node.onLinkRemoved().addListener(arg => {
      this.linkRemoved.notify({ graph: this, link: arg })
    }, this)
    this.nodes.add(node)
    this.nodeAdded.notify({ graph: this, node: node })
    return node
  }

  public removeNode (node: Node): void {
    this.nodes.delete(node)
    node.onDataChanged().removeListener(this)
    node.onLinkDataChanged().removeListener(this)
    node.onLinkAdded().removeListener(this)
    node.onLinkRemoved().removeListener(this)
    this.nodeRemoved.notify({ graph: this, node: node })
  }

  public nodeCount (): number {
    return this.nodes.size
  }

  /**
   * unreference all nodes from this instance of graph.
   */
  public clearNodes () {
    this.nodes.forEach((value: Node) => {
      this.removeNode(value)
    })
    // this.nodes.clear();
  }
  // #endregion
  ///

  ///
  // #region JSON
  ///
  public graphFields: Map<string, string> = new Map<string, string>()
  public nodeFields: Map<string, string> = new Map<string, string>()
  public linkFields: Map<string, string> = new Map<string, string>()

  public nodeIdField: string | undefined = undefined

  public download (name = 'graph.json') {
    const a = document.createElement('a')
    const file = new Blob([JSON.stringify(this.toJsonOBJ())], {
      type: 'text/plain'
    })
    a.href = URL.createObjectURL(file)
    a.download = name
    a.click()
  }

  public toJsonOBJ (): GraphJSON {
    const graphData = {} as Record<string, unknown>

    this.graphFields.forEach((value, key) => {
      // console.log(value, key, this)
      graphData[key] = this.getData(key)
    })

    const saveObject = {
      nodeIdField: this.nodeIdField || 'DEFAULT_ID',
      graphFields: Object.fromEntries(this.graphFields),
      nodeFields: Object.fromEntries(this.nodeFields),
      linkFields: Object.fromEntries(this.linkFields),
      graphData: graphData,
      nodes: new Array<{
        id: string
        data: unknown
        links: { targetId: string; data: unknown }[]
      }>()
    } as GraphJSON

    if (this.nodeIdField === undefined) {
      let i = 0
      this.foreachNode(n => {
        n.setData<string>('DEFAULT_ID', '' + i)
        i++
      })
    }

    this.foreachNode(node => {
      const nodeMap = new Map<string, unknown>()
      this.nodeFields.forEach((value, key) => {
        const v = node.getData<unknown | undefined>(key)
        if (v !== undefined) nodeMap.set(key, v)
      })
      const links: { targetId: string; data: unknown }[] = new Array<{
        targetId: string
        data: unknown
      }>()
      node.foreachLink(l => {
        const linkData = new Map<string, unknown>()
        this.linkFields.forEach((value, key) => {
          linkData.set(key, l.getData(key))
        })
        links.push({
          targetId: '' + l.getNode().getData<unknown>(saveObject.nodeIdField),
          data: Object.fromEntries(linkData)
        })
      })
      saveObject.nodes.push({
        id: '' + node.getData<unknown>(saveObject.nodeIdField),
        data: Object.fromEntries(nodeMap),
        links: links
      })
    })
    return saveObject
  }

  public applyJson (json: GraphJSON) {
    // const object = JSON.parse(json) as savedObject
    const object = json

    const nodeFieldsCasterMap = new Map<string, {(json: unknown): unknown }>()
    const linkFieldsCasterMap = new Map<string, {(json: unknown): unknown }>()
    const graphFieldsCasterMap = new Map<string, {(json: unknown): unknown }>()

    const fillCaster = (
      types: Record<string, unknown>,
      map: Map<string, { (json: unknown): unknown }>
    ) => {
      Object.entries(types).forEach(entry => {
        let caster: { (json: unknown): unknown } | undefined
        switch (entry[1]) {
          case '{x:number, y:number}':
          case 'Vec2':
            caster = (json: unknown) => {
              const vals = json as { x: number; y: number }
              return new V(vals.x, vals.y)
            }
            break
          default:
            break
        }
        if (caster !== undefined) {
          map.set(entry[0], caster)
        }
      })
    }

    fillCaster(object.nodeFields, nodeFieldsCasterMap)
    fillCaster(object.linkFields, linkFieldsCasterMap)
    fillCaster(object.graphFields, graphFieldsCasterMap)

    const setMetaData = (
      casters: Map<string, { (json: unknown): unknown }>,
      metadata: MetaData,
      key: string,
      value: unknown
    ) => {
      const caster = casters.get(key)
      let v = value
      if (caster !== undefined) {
        v = caster(v)
      }
      metadata.setData(key, v)
    }

    Object.entries(object.graphData as Record<string, unknown>).forEach(
      metaData => {
        setMetaData(
          graphFieldsCasterMap,
          this as Graph,
          metaData[0],
          metaData[1]
        )
      }
    )
    const nodeMap = new Map<string, Node>()
    this.foreachNode(node => {
      nodeMap.set('' + node.getData<unknown>(object.nodeIdField), node)
    })

    object.nodes.forEach(data => {
      let node = nodeMap.get(data.id)
      if (node === undefined) {
        node = this.addNode(new Node())
        node.setData(object.nodeIdField, data.id)
        nodeMap.set(data.id, node)
      }
      const dArray = data.data as Record<string, unknown>
      if (dArray !== null && dArray !== undefined) {
        Object.entries(dArray).forEach(metaData => {
          setMetaData(
            nodeFieldsCasterMap,
            node as Node,
            metaData[0],
            metaData[1]
          )
        })
      }
    })

    object.nodes.forEach(nodeData => {
      const node = nodeMap.get(nodeData.id) as Node
      nodeData.links.forEach(linkData => {
        const targetNode = nodeMap.get(linkData.targetId)
        if (targetNode === undefined) {
          throw new Error('invalid target link : ' + linkData.targetId)
        }
        let link = node.getLink(targetNode)
        if (link === undefined) {
          link = node.addLink(targetNode)
        }
        Object.entries(linkData.data as Record<string, unknown>).forEach(
          metadata => {
            setMetaData(
              linkFieldsCasterMap,
              link as Link,
              metadata[0],
              metadata[1]
            )
          }
        )
      })
    })
  }
  // #endregion
  ///

  public clone (): Graph {
    const g = new Graph()

    g.copyAllData(this)

    const nodeMap = new Map<Node, Node>()
    this.foreachNode(n => {
      nodeMap.set(n, n.clone())
    })

    this.foreachNode(n => {
      n.foreachLink(l => {
        const linkCopy = (nodeMap.get(l.getOriginNode()) as Node).addLink(
          nodeMap.get(l.getNode()) as Node
        )
        linkCopy.copyAllData(l)
      })
    })

    return g
  }

  public copyTopology (graph: Graph) {
    const nodeMap = new Map<Node, Node>()
    this.foreachNode(n => {
      nodeMap.set(n, this.addNode(n.clone()))
    })

    this.foreachNode(n => {
      n.foreachLink(l => {
        const linkCopy = (nodeMap.get(l.getOriginNode()) as Node).addLink(
          nodeMap.get(l.getNode()) as Node
        )
        linkCopy.copyAllData(l)
      })
    })
  }

  constructor () {
    super()
    this.nodes = new Set<Node>()
  }
}
