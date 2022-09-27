import Unreal from '@/utils/unreal'

// Sert de ref pour les ids, a voir si ça passe dans le constructeur
// let key = 0

export default class Morph {
  _weight: number
  name: string
  id: number
  type = 'morphTarget'

  /**
   * Constructor of Morph class
   * @param weight - Weight of the morphTarget
   * @param name - Name of the morphTarget
   */
  constructor (weight: number | null, name: string | null, id: number | null) {
    this._weight = weight || 0
    this.name = name || 'undefined'
    this.id = id || 0
  }

  /**
   * Set the value of the morphTarget Weight
   * @param weight - New Weight
   */
  public set weight (newWeight: number) {
    this._weight = newWeight
    Unreal.send(this)
  }

  /**
   * Return value of the weight
   * @returns - Value of the weight
   */
  public get weight (): number {
    return this._weight
  }
}
