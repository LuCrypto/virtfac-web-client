import V from '@/utils/vector'

/**
 * Transform T is class of object with position and size
 */
export default class T {
  position: V
  size: V
  rotation = 0
  skew = 0

  constructor (position: V | null = null, size: V | null = null) {
    this.position = position || new V(null, null)
    this.size = size || new V(42, 42)
  }

  // Flip transform to keep positive size
  makeAbsoluteSize (): void {
    if (this.size.x < 0) {
      this.position.x += this.size.x
    }
    if (this.size.y < 0) {
      this.position.y += this.size.y
    }
    this.size = this.size.absV()
  }

  // Checks if a transform contains a vector
  contains (v: V): boolean {
    this.makeAbsoluteSize()
    return (
      v.x >= this.position.x &&
      v.y >= this.position.y &&
      v.x <= this.position.x + this.size.x &&
      v.y <= this.position.y + this.size.y
    )
  }

  // Check if transform is in an other transform
  isIn (t: T): boolean {
    this.makeAbsoluteSize()
    t.makeAbsoluteSize()
    return (
      this.position.x >= t.position.x &&
      this.position.y >= t.position.y &&
      this.position.x + this.size.x <= t.position.x + t.size.x &&
      this.position.y + this.size.y <= t.position.y + t.size.y
    )
  }

  initFromDomMatrix (m: DOMMatrix): T {
    const E = (m.a + m.d) / 2
    const F = (m.a - m.d) / 2
    const G = (m.c + m.b) / 2
    const H = (m.c - m.b) / 2

    const Q = Math.sqrt(E * E + H * H)
    const R = Math.sqrt(F * F + G * G)
    const a1 = Math.atan2(G, F)
    const a2 = Math.atan2(H, E)
    const theta = (a2 - a1) / 2
    const phi = (a2 + a1) / 2

    this.position = new V(m.e, m.f)
    this.size = new V(Q + R, Q - R)
    this.rotation = (-phi * 180) / Math.PI
    this.skew = (-theta * 180) / Math.PI

    return this
  }

  /**
   * Convert transform to string
   * * @param separator - Separator between each values (space by default)
   * @returns - New string with format <position.x><separator><position.y><separator><size.x><separator><size.y>
   */
   toString (separator: string = ' '): string {
    return `${this.position.toString(separator)}${separator}${this.size.toString(separator)}`
  }
}
