/**
 * The V (for vector) class is used to perform simple vector operations.
 */
export default class V {
  x: number
  y: number

  /**
   * Constructor of Vector class
   * @param x - X coordiante number
   * @param y - Y Coordinate number
   */
  constructor (x: number | null, y: number | null) {
    this.x = x || 0
    this.y = y || 0
  }

  /**
   * Computes the addition of vector with another vector
   * @param v - Vector to add
   * @returns New vector containing the result of the addition
   */
  addV (v: V): V {
    return new V(this.x + v.x, this.y + v.y)
  }

  /**
   * Computes the addition of vector with number
   * @param n - Number to add
   * @returns New vector containing the result of the addition
   */
  addN (n: number): V {
    return new V(this.x + n, this.y + n)
  }

  /**
   * Computes the substraction of vector by another vector
   * @param v - Vector to substract
   * @returns - New vector containing the result of the substraction
   */
  subV (v: V): V {
    return new V(this.x - v.x, this.y - v.y)
  }

  /**
   * Computes the substraction of vector by number
   * @param n - Number to substract
   * @returns - New vector containing the result of the substraction
   */
  subN (n: number): V {
    return new V(this.x - n, this.y - n)
  }

  /**
   * Computes the division of vector by another vector
   * @param v - Vector to divide
   * @returns - New vector containing the result of the division
   */
  divV (v: V): V {
    return new V(this.x / v.x, this.y / v.y)
  }

  /**
   * Computes the division of vector by number
   * @param n - Number to divide
   * @returns - New vector containing the result of the division
   */
  divN (n: number): V {
    return new V(this.x / n, this.y / n)
  }

  /**
   * Computes the multiplication of vector by another vector
   * @param v - Vector to multiplicaty
   * @returns - New vector containing the result of the multiplication
   */
  multV (v: V): V {
    return new V(this.x * v.x, this.y * v.y)
  }

  /**
   * Computes the multiplication of vector by number
   * @param n - Number to multiplicaty
   * @returns - New vector containing the result of the multiplication
   */
  multN (n: number): V {
    return new V(this.x * n, this.y * n)
  }

  /**
   * Computes the absolute value of a vector
   * @returns  - New vector containing the absolute coordinates
   */
  absV (): V {
    return new V(Math.abs(this.x), Math.abs(this.y))
  }

  /**
   * Computes the absolute modulo of a number
   * @param n - Input number
   * @param m - Modulo number
   * @returns - Absolute modulo of number
   */
  modA (n: number, m: number): number {
    return ((n % m) + m) % m
  }

  /**
   * Computes the absolute modulo of a vector by another vector
   * @param v - Modulo vector
   * @returns - New vector containing the result of the absolute modulo
   */
  modV (v: V): V {
    return new V(this.modA(this.x, v.x), this.modA(this.y, v.y))
  }

  /**
   * Computes the absolute modulo of a vector by a number
   * @param v - Modulo number
   * @returns - New vector containing the result of the absolute modulo
   */
  modN (n: number): V {
    return new V(this.modA(this.x, n), this.modA(this.y, n))
  }

  /**
   * Computes the length of a vector
   * @returns - Number conaining length of the vector
   */
  length (): number {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  /**
   * Test if the vector is equal to another
   * @param v - Input vector
   * @returns - Boolean result of the equality
   */
  equal (v: V): boolean {
    return this.x === v.x && this.y === v.y
  }

  /**
   * Computes the floor value of x and y values
   * @returns - New vector containing the result of the floor
   */
  floor (): V {
    return new V(Math.floor(this.x), Math.floor(this.y))
  }

  /**
   * Computes the ceil value of x and y values
   * @returns - New vector containing the result of the ceil
   */
  ceil (): V {
    return new V(Math.ceil(this.x), Math.ceil(this.y))
  }

  /**
   * Convert vector to string
   * * @param separator - Separator between x an y (space by default)
   * @returns - New string with format <x><separator><y>
   */
  toString (separator = ' '): string {
    return `${this.x}${separator}${this.y}`
  }
}
