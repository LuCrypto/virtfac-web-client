export class V {
  public x = 0
  public y = 0

  constructor (x: number, y: number) {
    this.set(x, y)
  }

  set (x: number, y: number) {
    this.x = x
    this.y = y
  }

  middle (v: V): V {
    return new V((this.x + v.x) * 0.5, (this.y + v.y) * 0.5)
  }

  mult (f: number): V {
    return new V(this.x * f, this.y * f)
  }

  add (v: V): V {
    return new V(this.x + v.x, this.y + v.y)
  }

  sub (v: V): V {
    return new V(this.x - v.x, this.y - v.y)
  }

  lerp (v: V, f: number): V {
    return this.mult(1 - f).add(v.mult(f))
  }

  lerp3 (v1: V, v2: V, f: number): V {
    return f < 0.5 ? this.lerp(v1, f * 2) : v1.lerp(v2, (f - 0.5) * 2)
  }

  str (): string {
    return `${this.x} ${this.y}`
  }

  step (f: number): V {
    return new V(
      Math.round((this.x * 1) / f) * f,
      Math.round((this.y * 1) / f) * f
    )
  }

  equal (v: V): boolean {
    return this.x === v.x && this.y === v.y
  }

  angle () {
    return Math.atan2(this.x, this.y)
  }

  angleWith (v: V) {
    const tmp = (Math.PI * 2 + this.angle() - v.angle()) % (Math.PI * 2)
    if (tmp > Math.PI) {
      return -1 * (Math.PI * 2 - tmp)
    }
    return tmp
  }
}