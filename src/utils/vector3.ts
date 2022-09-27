export default class Vec3 {
  _x: number
  _y: number
  _z: number

  // Object.keys|| Object.values => Pour boucler sur les components d'une instance

  constructor (x: number | null, y: number | null, z: number | null) {
    this._x = x || 0
    this._y = y || 0
    this._z = z || 0
  }
}
