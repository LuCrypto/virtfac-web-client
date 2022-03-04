export interface Vec2 {
  x: number
  y: number
}

export class Vector2 implements Vec2 {
  public x: number
  public y: number

  constructor (x: number, y: number) {
    this.x = x
    this.y = y
  }

  public static negative (vec: Vec2): Vec2 {
    return new Vector2(-vec.x, -vec.y)
  }

  public static minus (left: Vec2, right: Vec2): Vec2 {
    return new Vector2(left.x - right.x, left.y - right.y)
  }

  public static plus (left: Vec2, right: Vec2): Vec2 {
    return new Vector2(left.x + right.x, left.y + right.y)
  }

  public static divide (left: Vec2, right: number): Vec2 {
    return new Vector2(left.x / right, left.y / right)
  }

  public static multiply (left: Vec2, right: number): Vec2 {
    return new Vector2(left.x * right, left.y * right)
  }

  public static norm (vec: Vec2): number {
    return Math.sqrt(vec.x * vec.x + vec.y * vec.y)
  }

  public static normalize (vec: Vec2): Vec2 {
    return this.divide(vec, this.norm(vec))
  }

  public static changeOrigin (vec: Vec2, origin: Vec2): Vec2 {
    return Vector2.minus(vec, origin)
  }

  public static angle (vec: Vec2): number {
    return Math.atan2(vec.x, vec.y)
  }

  public static angleBetween (vec: Vec2, repere: Vec2) {
    // return Math.PI-((Math.PI*2 + this.angle(vec) - this.angle(repere))%(Math.PI*2));
    const tmp =
      (Math.PI * 2 + this.angle(vec) - this.angle(repere)) % (Math.PI * 2)
    if (tmp > Math.PI) {
      return -1 * (Math.PI * 2 - tmp)
    }
    return tmp
  }

  public static rotate90 (vec: Vec2): Vec2 {
    return new Vector2(vec.y, -vec.x)
  }
}
