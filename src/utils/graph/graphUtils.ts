// import { Node } from '@/utils/graph/node'
import { Vec2, Vector2 } from '@/utils/graph/Vec'
import { MetaData } from '@/utils/graph/metadata'

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
}
