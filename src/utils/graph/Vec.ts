/*
export interface Vec2 {
  x: number
  y: number
  str(): string
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

  public static distanceBetween (p1: Vec2, p2: Vec2): number {
    return Math.sqrt(
      (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y)
    )
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

  public static rotate (vec: Vec2, radAngle: number): Vec2 {
    const s = Math.sin(radAngle)
    const c = Math.cos(radAngle)
    return new Vector2(c * vec.x - s * vec.y, s * vec.x + c * vec.y)
  }

  public str (): string {
    return `${this.x} ${this.y}`
  }

  public static intersection (
    linePoint: Vec2,
    lineDir: Vec2,
    segmentP1: Vec2,
    segmentP2: Vec2
  ): Vec2 {
    // => fix dir to x:0, y:1
    const angle = Vector2.angle(lineDir)
    let p1 = Vector2.rotate(Vector2.minus(segmentP1, linePoint), angle)
    let p2 = Vector2.rotate(Vector2.minus(segmentP2, linePoint), angle)
    let yLength = p2.y - p1.y
    if (Math.abs(yLength) < Math.abs(p2.x - p1.x)) {
      p1 = new Vector2(p1.y, p1.x)
      p2 = new Vector2(p2.y, p2.x)
      yLength = p2.y - p1.y
    }
    return Vector2.plus(
      segmentP1,
      Vector2.multiply(Vector2.minus(segmentP2, segmentP1), -p1.y / yLength)
    )
  }

  public static intersectionOrNull (
    linePoint: Vec2,
    lineDir: Vec2,
    segmentP1: Vec2,
    segmentP2: Vec2
  ): Vec2 | null {
    const angle = Vector2.angle(lineDir)
    let p1 = Vector2.rotate(Vector2.minus(segmentP1, linePoint), angle)
    let p2 = Vector2.rotate(Vector2.minus(segmentP2, linePoint), angle)
    let yLength = p2.y - p1.y
    if (Math.abs(yLength) < Math.abs(p2.x - p1.x)) {
      p1 = new Vector2(p1.y, p1.x)
      p2 = new Vector2(p2.y, p2.x)
      yLength = p2.y - p1.y
    }
    if ((p1.y > 0 && p2.y < 0) || (p1.y < 0 && p2.y > 0)) {
      return Vector2.plus(
        segmentP1,
        Vector2.multiply(Vector2.minus(segmentP2, segmentP1), -p1.y / yLength)
      )
    } else return null
  }
}
*/
