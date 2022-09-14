import API from '../api'
import { BehaviourInstance } from '../assets/behaviour'
import { APIAsset, APIBoundingBox } from '../models'
import BlueprintEditor from '@/components/BlueprintEditor.vue'

export interface BpAssetCache {
  id: number
  picture: string
  layoutSprite: string
  behaviours: Map<string, BehaviourInstance>
  name: string
  boundingBox: APIBoundingBox
}
export class BpAPICache {
  private static _instance: BpAPICache | null = null
  public static instance (): BpAPICache {
    if (BpAPICache._instance === null) BpAPICache._instance = new BpAPICache()
    return BpAPICache._instance
  }

  public component: Vue | undefined = undefined

  private assetMap = new Map<number, BpAssetCache>()

  private assetRequestsMap = new Map<number, Array<{(): void }>>()

  public getAsset (id: number): Promise<BpAssetCache> {
    return new Promise<BpAssetCache>(resolve => {
      if (this.component === undefined) throw new Error('no Vue environment')
      if (this.assetMap.get(id) !== undefined) {
        resolve(this.assetMap.get(id) as BpAssetCache)
      } else {
        if (this.assetRequestsMap.get(id) === undefined) {
          this.assetRequestsMap.set(id, new Array<{(): void }>())
          let cache: BpAssetCache | undefined
          API.post(
            this.component,
            '/resources/assets',
            JSON.stringify({
              select: ['name', 'picture', 'behaviours'],
              where: { id: id }
            })
          ).then(response => {
            const asset = new APIAsset(
              ((response as unknown) as [
                { name: string; picture: string; behaviours: string }
              ])[0]
            )
            const map = new Map<string, BehaviourInstance>()
            ;(JSON.parse(asset.behaviours) as BehaviourInstance[]).forEach(
              elem => {
                map.set(elem.name, elem)
              }
            )
            cache = {
              id: asset.id,
              name: asset.name,
              picture: asset.picture,
              layoutSprite: asset.layoutSprite,
              behaviours: map,
              boundingBox: JSON.parse(asset.boundingBox) as APIBoundingBox
            }
            this.assetMap.set(id, cache)
            resolve(cache)
            ;(this.assetRequestsMap.get(id) as Array<{ (): void }>).forEach(
              callback => {
                callback()
              }
            )
          })
        } else {
          (this.assetRequestsMap.get(id) as Array<{ (): void }>).push(() => {
            resolve(this.assetMap.get(id) as BpAssetCache)
          })
        }
      }
    })
  }
}
