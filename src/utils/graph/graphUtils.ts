// import { Node } from '@/utils/graph/node'
import { Vec2, Vector2 } from '@/utils/graph/Vec'
import { MetaData } from '@/utils/graph/metadata'
import { Graph } from '@/utils/graph/graph'
import { Node } from '@/utils/graph/node'

export class GraphUtils {
  public static FollowArrayMetadata (
    attach: MetaData,
    attachProperty = 'position',
    child: MetaData,
    childProperty: string,
    childPropertyIndex: number
  ) {
    child
      .getOrAddData<Map<number, Vec2>>(
        'old_attach_' + attachProperty,
        new Map<number, Vec2>()
      )
      .set(childPropertyIndex, attach.getData<Vec2>(attachProperty))
    attach.onDataChanged().addMappedListener(attachProperty, arg => {
      const pos: Vec2[] = child.getData<Vec2[]>(childProperty)
      pos[childPropertyIndex] = Vector2.plus(
        pos[childPropertyIndex],
        Vector2.minus(
          attach.getData<Vec2>(attachProperty),
          child
            .getData<Map<number, Vec2>>('old_attach_' + attachProperty)
            .get(childPropertyIndex) as Vec2
        )
      )
      child.setData<Vec2[]>(childProperty, pos)
      child
        .getData<Map<number, Vec2>>('old_attach_' + attachProperty)
        .set(childPropertyIndex, attach.getData<Vec2>(attachProperty))
    })
  }

  public static hierarchization (graph: Graph, outputField: string) {
    const _tmp = '__hierarchization_path'

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
    })
  }
}
