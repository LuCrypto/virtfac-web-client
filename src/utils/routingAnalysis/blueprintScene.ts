import { V } from '@/utils/nodeViewer/v'
import { Blueprint } from './blueprint'
import { Node } from '@/utils/graph/node'
import { Link } from '@/utils/graph/link'
import { Vec2, Vector2 } from '../graph/Vec'
import THREE, {
  BufferGeometry,
  BufferAttribute,
  Camera,
  Mesh,
  Renderer,
  Scene,
  MeshBasicMaterial,
  WebGLBufferRenderer,
  BoxGeometry,
  MeshNormalMaterial,
  DoubleSide,
  MeshLambertMaterial,
  MeshToonMaterial
} from 'three'
import { DelayedCallback } from '../graph/delayedCallback'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter'
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter'
import Delaunator from 'delaunator'
import { Destroyable } from './bp_window'
import { BpWallHole } from './bp_wallLink'

export class BlueprintScene {
  /**
   * using blueprint metadata :
   * - roof_height : number
   * - wall_width : number
   * - scale : number
   * @param blueprint
   */
  public static exportGeometry (blueprint: Blueprint) {
    const tunnel = new Map<
      number,
      {
        t1: number
        b1: number
        t2: number
        b2: number
        t1pos: { x: number; y: number; z: number }
        t2pos: { x: number; y: number; z: number }
      }
    >()
    const geometry = new BufferGeometry()

    const vertices = new Array<number>()
    const normals = new Array<number>()
    const uv = new Array<number>()
    const colors = new Array<number>()
    const triangles = new Array<number>()
    const h = blueprint.getDataOrDefault<number>('roof_height', 2.5)
    const w = blueprint.getDataOrDefault<number>('wall_width', 0.01)
    let nextIndex = 0

    const addTriangle = (i1: number, i2: number, i3: number) => {
      triangles.push(i1)
      triangles.push(i2)
      triangles.push(i3)
    }
    const addNormal = (v: Vec2, z = 0) => {
      normals.push(v.x)
      normals.push(z)
      normals.push(v.y)
    }
    const addUv = (u: number, v: number) => {
      uv.push(u)
      uv.push(v)
    }
    const addVertex = (
      x: number,
      y: number,
      z: number,
      normal: Vec2,
      u: number,
      v = -1,
      normalZ = 0
    ) => {
      const res = nextIndex
      vertices.push(x)
      vertices.push(z)
      vertices.push(y)
      addUv(u, v === -1 ? z : v)
      addNormal(normal, normalZ)
      nextIndex++
      return res
    }
    const copyVertex = (
      vertexId: number,
      normal: Vec2 | undefined = undefined,
      u: number | undefined = undefined,
      v: number | undefined = undefined,
      normalZ: number | undefined = undefined
    ) => {
      return addVertex(
        vertices[vertexId * 3],
        vertices[vertexId * 3 + 2],
        vertices[vertexId * 3 + 1],
        normal || new Vector2(normals[vertexId * 3], normals[vertexId * 3 + 2]),
        u || uv[vertexId * 2],
        v || uv[vertexId * 2 + 1],
        normalZ || normals[vertexId * 3 + 1]
      )
    }
    const addQuad = (
      v1: number,
      v2: number,
      v3: number,
      v4: number,
      reverse = false
    ) => {
      if (reverse) {
        addTriangle(v1, v3, v2)
        addTriangle(v1, v4, v3)
      } else {
        addTriangle(v1, v2, v3)
        addTriangle(v1, v3, v4)
      }
    }
    const getVertexData = (vertexId: number) => {
      return {
        x: vertices[vertexId * 3],
        y: vertices[vertexId * 3 + 2],
        z: vertices[vertexId * 3 + 1],
        normal: new Vector2(normals[vertexId * 3], normals[vertexId * 3 + 2]),
        u: uv[vertexId * 2],
        v: uv[vertexId * 2 + 1],
        normalZ: normals[vertexId * 3 + 1]
      }
    }

    const unscale = (x: number) => {
      return (x * blueprint.getData<number>('scale')) / 100
    }

    blueprint.foreachWallNode(node => {
      const pos = Vector2.divide(
        node.getData<Vec2>('position'),
        blueprint.getData<number>('scale') * 100
      )
      node.foreachLink(l => {
        const pos2 = Vector2.divide(
          l.getNode().getData<Vec2>('position'),
          blueprint.getData<number>('scale') * 100
        )

        const length = Vector2.norm(Vector2.minus(pos, pos2))

        let normal = Vector2.multiply(
          Vector2.normalize(Vector2.rotate90(Vector2.minus(pos2, pos))),
          -1
        )
        if (l.getData<boolean>('double')) {
          /*
          console.log('double')
          ;[w, -w].forEach(value => {
            const posOffset = Vector2.plus(pos, Vector2.multiply(normal, value))
            const pos2Offset = Vector2.plus(
              pos2,
              Vector2.multiply(normal, value)
            )
            const n = Vector2.normalize(Vector2.multiply(normal, value))
            console.log(n)
            const v1Bottom = addVertex(posOffset.x, posOffset.y, 0)
            addUv(0, 0)
            const v1Top = addVertex(posOffset.x, posOffset.y, h)
            addUv(0, h)
            const v2Bottom = addVertex(pos2Offset.x, pos2Offset.y, 0)
            addUv(length, 0)
            const v2Top = addVertex(pos2Offset.x, pos2Offset.y, h)
            addUv(length, h)
            addNormal(n)
            addNormal(n)
            addNormal(n)
            addNormal(n)
            if (value < 0) {
              addTriangle(v2Top, v1Top, v1Bottom)
              addTriangle(v2Bottom, v2Top, v1Bottom)
            } else {
              addTriangle(v1Bottom, v1Top, v2Top)
              addTriangle(v1Bottom, v2Top, v2Bottom)
            }
          })
          */
        } else {
          let reverse = false
          if (
            !blueprint.isInside(
              Vector2.multiply(
                Vector2.plus(
                  Vector2.divide(Vector2.plus(pos, pos2), 2),
                  Vector2.multiply(normal, 0.001)
                ),
                blueprint.getData<number>('scale') * 100
              )
            )
          ) {
            normal = Vector2.multiply(normal, -1)
            reverse = true
          }

          // adding holes for windows and doors
          const holes = l.getDataOrDefault<Map<Destroyable, BpWallHole>>(
            'holes',
            new Map<Destroyable, BpWallHole>()
          )
          const hArray = new Array<{
            x: number
            dx: number
            by: number
            ty: number
            tunnelId: number
          }>()
          holes.forEach(value => {
            hArray.push({
              x: value.x(l) / 100 - value.xsize(l) / 2,
              dx: value.xsize(l),
              by: value.yBottom(l),
              ty: value.yTop(l),
              tunnelId: value.tunnel()
            })
          })
          hArray.sort((a, b) => {
            return a.x - b.x
          })

          let b1 = addVertex(pos.x, pos.y, 0, normal, length)
          let mb1 = addVertex(pos.x, pos.y, h / 3, normal, length)
          let mt1 = addVertex(pos.x, pos.y, (h / 3) * 2, normal, length)
          let t1 = addVertex(pos.x, pos.y, h, normal, length)

          const b2 = addVertex(pos2.x, pos2.y, 0, normal, 0)
          const mb2 = addVertex(pos2.x, pos2.y, h / 3, normal, 0)
          const mt2 = addVertex(pos2.x, pos2.y, (h / 3) * 2, normal, 0)
          const t2 = addVertex(pos2.x, pos2.y, h, normal, 0)

          const dir = Vector2.normalize(Vector2.minus(pos2, pos))
          for (let i = 0; i < hArray.length; i++) {
            const c = hArray[i]

            const p1 = Vector2.plus(pos, Vector2.multiply(dir, c.x))
            const hb1 = addVertex(p1.x, p1.y, 0, normal, length - c.x)
            const hmb1 = addVertex(p1.x, p1.y, c.by, normal, length - c.x)
            const hmt1 = addVertex(p1.x, p1.y, c.ty, normal, length - c.x)
            const ht1 = addVertex(p1.x, p1.y, h, normal, length - c.x)

            const p2 = Vector2.plus(pos, Vector2.multiply(dir, c.x + c.dx))
            const hb2 = addVertex(p2.x, p2.y, 0, normal, length - (c.x + c.dx))
            const hmb2 = addVertex(
              p2.x,
              p2.y,
              c.by,
              normal,
              length - (c.x + c.dx)
            )
            const hmt2 = addVertex(
              p2.x,
              p2.y,
              c.ty,
              normal,
              length - (c.x + c.dx)
            )
            const ht2 = addVertex(p2.x, p2.y, h, normal, length - (c.x + c.dx))

            addQuad(mt1, hmt1, ht1, t1, reverse)
            addQuad(mb1, hmb1, hmt1, mt1, reverse)
            addQuad(b1, hb1, hmb1, mb1, reverse)
            addQuad(hb1, hb2, hmb2, hmb1, reverse)
            addQuad(hmt1, hmt2, ht2, ht1, reverse)

            b1 = hb2
            mb1 = hmb2
            mt1 = hmt2
            t1 = ht2

            if (c.tunnelId !== -1) {
              console.log('tunnel : ' + c.tunnelId)
              if (tunnel.has(c.tunnelId)) {
                const otherHole = tunnel.get(c.tunnelId)
                console.log(otherHole)
                if (otherHole !== undefined) {
                  const v3Dist = (
                    a: { x: number; y: number; z: number },
                    b: { x: number; y: number; z: number }
                  ) => {
                    return (
                      (a.x - b.x) * (a.x - b.x) +
                      (a.y - b.y) * (a.y - b.y) +
                      (a.z - b.z) * (a.z - b.z)
                    )
                  }

                  if (
                    v3Dist(otherHole.t1pos, { x: p1.x, y: p1.y, z: c.ty }) <
                    v3Dist(otherHole.t2pos, { x: p1.x, y: p1.y, z: c.ty })
                  ) {
                    const dist =
                      v3Dist(otherHole.t1pos, { x: p1.x, y: p1.y, z: c.ty })
                    const _hmb1 = copyVertex(
                      hmb1,
                      undefined,
                      getVertexData(otherHole.b1).u,
                      getVertexData(otherHole.b1).v + dist
                    )
                    const _hmt1 = copyVertex(
                      hmt1,
                      undefined,
                      getVertexData(otherHole.t1).u,
                      getVertexData(otherHole.t1).v + dist
                    )
                    const _hmb2 = copyVertex(
                      hmb2,
                      undefined,
                      getVertexData(otherHole.b2).u,
                      getVertexData(otherHole.b2).v + dist
                    )
                    const _hmt2 = copyVertex(
                      hmt2,
                      undefined,
                      getVertexData(otherHole.t2).u,
                      getVertexData(otherHole.t2).v + dist
                    )
                    addQuad(_hmb1, _hmt1, otherHole.t1, otherHole.b1)
                    addQuad(_hmt1, _hmt2, otherHole.t2, otherHole.t1)
                    addQuad(_hmb2, _hmt2, otherHole.t2, otherHole.b2)
                    addQuad(_hmb1, _hmb2, otherHole.b2, otherHole.b1)

                    addQuad(_hmb1, _hmt1, otherHole.t1, otherHole.b1, true)
                    addQuad(_hmt1, _hmt2, otherHole.t2, otherHole.t1, true)
                    addQuad(_hmb2, _hmt2, otherHole.t2, otherHole.b2, true)
                    addQuad(_hmb1, _hmb2, otherHole.b2, otherHole.b1, true)
                  } else {
                    const dist =
                      v3Dist(otherHole.t2pos, {
                        x: p1.x,
                        y: p1.y,
                        z: c.ty
                      })
                    const _hmb1 = copyVertex(
                      hmb1,
                      undefined,
                      getVertexData(otherHole.b2).u,
                      getVertexData(otherHole.b2).v + dist
                    )
                    const _hmt1 = copyVertex(
                      hmt1,
                      undefined,
                      getVertexData(otherHole.t2).u,
                      getVertexData(otherHole.t2).v + dist
                    )
                    const _hmb2 = copyVertex(
                      hmb2,
                      undefined,
                      getVertexData(otherHole.b1).u,
                      getVertexData(otherHole.b1).v + dist
                    )
                    const _hmt2 = copyVertex(
                      hmt2,
                      undefined,
                      getVertexData(otherHole.t1).u,
                      getVertexData(otherHole.t1).v + dist
                    )
                    addQuad(_hmb1, _hmt1, otherHole.t2, otherHole.b2)
                    addQuad(_hmt1, _hmt2, otherHole.t1, otherHole.t2)
                    addQuad(_hmb2, _hmt2, otherHole.t1, otherHole.b1)
                    addQuad(_hmb1, _hmb2, otherHole.b1, otherHole.b2)

                    addQuad(_hmb1, _hmt1, otherHole.t2, otherHole.b2, true)
                    addQuad(_hmt1, _hmt2, otherHole.t1, otherHole.t2, true)
                    addQuad(_hmb2, _hmt2, otherHole.t1, otherHole.b1, true)
                    addQuad(_hmb1, _hmb2, otherHole.b1, otherHole.b2, true)
                  }
                }
              } else {
                tunnel.set(c.tunnelId, {
                  t1: copyVertex(hmt1, (normal = Vector2.normalize(dir))),
                  b1: copyVertex(hmb1, (normal = Vector2.normalize(dir))),
                  t2: copyVertex(
                    hmt2,
                    (normal = Vector2.multiply(Vector2.normalize(dir), -1))
                  ),
                  b2: copyVertex(
                    hmb2,
                    (normal = Vector2.multiply(Vector2.normalize(dir), -1))
                  ),
                  t1pos: { x: p1.x, y: p1.y, z: c.ty },
                  t2pos: { x: p2.x, y: p2.y, z: c.ty }
                })
              }
            }
          }
          addQuad(mt1, mt2, t2, t1, reverse)
          addQuad(mb1, mb2, mt2, mt1, reverse)
          addQuad(b1, b2, mb2, mb1, reverse)
        }
      })
    })

    //
    // ceiling and floor
    //

    //
    geometry.setAttribute(
      'position',
      new BufferAttribute(Float32Array.from(vertices), 3)
    )
    geometry.setAttribute(
      'normal',
      new BufferAttribute(Float32Array.from(normals), 3)
    )
    geometry.setAttribute('uv', new BufferAttribute(Float32Array.from(uv), 2))
    geometry.setIndex(new BufferAttribute(Uint16Array.from(triangles), 1))

    const mat = new MeshLambertMaterial({
      /* side: DoubleSide, */ color: 0xffffff
    })

    const exporter = new GLTFExporter()
    exporter.parse(
      new Mesh(geometry, mat),
      gltf => {
        console.log(gltf)
        const a = document.createElement('a')
        const file = new Blob([JSON.stringify(gltf)], {
          type: 'text/plain'
        })
        a.href = URL.createObjectURL(file)
        a.download = 'layout.gltf'
        a.click()
      },
      {}
    )
  }
}
