import Morph from '@/utils/morph'
import Transform from '@/utils/morphTransform'
import Vec3 from '@/utils/vector3'

// class UnrealMorph {
//   name: string
//   id: number
//   _weight: number
//   weight: number
//   type = 'morphTarget'

//   constructor (name: string, id: number, weight: number) {
//     (this.name = name),
//     (this.id = id),
//     (this._weight = weight),
//     (this.weight = weight)
//   }
// }

export default class MyAsset {
  name: string
  transform: Transform
  morphs: Array<Morph>
  translation: Array<number>
  rotation: Array<number>
  scale: Array<number>

  constructor (
    name: string | null,
    transform: Transform | null,
    morphs: Array<Morph> | null,
    translation: Array<number>,
    rotation: Array<number>,
    scale: Array<number>
  ) {
    this.name = name || 'undefined'
    this.morphs = morphs || []
    this.transform =
      transform ||
      new Transform(new Vec3(0, 0, 0), new Vec3(0, 0, 0), new Vec3(0, 0, 0))
    this.translation = translation
    this.rotation = rotation
    this.scale = scale
  }
}
