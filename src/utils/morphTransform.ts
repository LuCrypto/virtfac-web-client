import Unreal from '@/utils/unreal'
import Vec3 from '@/utils/vector3'

export default class Transform {
  private _translation: Vec3
  private _rotation: Vec3
  private _scale: Vec3

  transform: number[][]

  type = 'transform'

  constructor (translation: Vec3, rotation: Vec3, scale: Vec3) {
    this._translation = translation || new Vec3(0, 0, 0)
    this._rotation = rotation || new Vec3(0, 0, 0)
    this._scale = scale || new Vec3(1, 1, 1)
    this.transform = [
      [translation._x, translation._y, translation._z],
      [rotation._x, rotation._y, rotation._z],
      [scale._x, scale._y, scale._z]
    ]
  }

  set translation (newtranslation: Vec3) {
    this._translation = newtranslation
    this.transform[0] = [
      newtranslation._x,
      newtranslation._y,
      newtranslation._z
    ]
    Unreal.send(this)
  }

  get translation (): Vec3 {
    return this._translation
  }

  get rotation (): Vec3 {
    return this._rotation
  }

  set rotation (newRotation: Vec3) {
    this._rotation = new Vec3(
      newRotation._x % 360,
      newRotation._y % 360,
      newRotation._z % 360
    )
    this.transform[1] = [
      newRotation._x % 360,
      newRotation._y % 360,
      newRotation._z % 360
    ]
    Unreal.send(this)
  }

  get scale (): Vec3 {
    return this._scale
  }

  set scale (newScale: Vec3) {
    this._rotation = newScale
    this.transform[2] = [newScale._x, newScale._y, newScale._z]
    Unreal.send(this)
  }

  // get transform (): number[][] {
  //   return this._transform
  // }

  // set transform (newValue: number[][]) {
  //   this._transform = newValue
  //   Unreal.send(this)
  // }
}
