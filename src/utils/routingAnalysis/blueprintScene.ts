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
  MeshToonMaterial,
  Vector3
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
        bb1: number
        bb2: number
        t1pos: { x: number; y: number; z: number }
        t2pos: { x: number; y: number; z: number }
      }
    >()
    const geometry = new BufferGeometry()

    const vertices = new Array<number>()
    const normals = new Array<number>()
    const uv = new Array<number>()
    const triangles = new Array<number>()
    const h = blueprint.getDataOrDefault<number>('roof_height', 2.5)
    const w = blueprint.getDataOrDefault<number>('wall_width', 0.01)
    let nextIndex = 0

    const x = 0
    const y = 2
    const z = 1

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
    const v3Dist = (
      a: { x: number; y: number; z: number },
      b: { x: number; y: number; z: number }
    ) => {
      return Math.sqrt(
        (a.x - b.x) * (a.x - b.x) +
          (a.y - b.y) * (a.y - b.y) +
          (a.z - b.z) * (a.z - b.z)
      )
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
        u === undefined ? uv[vertexId * 2] : u,
        v === undefined ? uv[vertexId * 2 + 1] : v,
        normalZ === undefined ? normals[vertexId * 3 + 1] : normalZ
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
    const addCopyQuad = (
      v1: number,
      v2: number,
      v3: number,
      v4: number,
      reverse = false
    ) => {
      const v1Data = getVertexData(v1)
      const v2Data = getVertexData(v2)
      const v4Data = getVertexData(v4)
      const normal = new Vector3(
        v2Data.x - v1Data.x,
        v2Data.y - v1Data.y,
        v2Data.z - v1Data.z
      )
        .cross(
          new Vector3(
            v4Data.x - v1Data.x,
            v4Data.y - v1Data.y,
            v4Data.z - v1Data.z
          )
        )
        .normalize()
        .multiplyScalar(reverse ? 1 : -1)
      const v = v3Dist(
        { x: v1Data.x, y: v1Data.y, z: v1Data.z },
        { x: v2Data.x, y: v2Data.y, z: v2Data.z }
      )
      const u = v3Dist(
        { x: v1Data.x, y: v1Data.y, z: v1Data.z },
        { x: v4Data.x, y: v4Data.y, z: v4Data.z }
      )
      const _v1 = copyVertex(
        v1,
        new Vector2(normal.x, normal.y),
        0,
        0,
        normal.z
      )
      const _v2 = copyVertex(
        v2,
        new Vector2(normal.x, normal.y),
        0,
        v,
        normal.z
      )
      const _v3 = copyVertex(
        v3,
        new Vector2(normal.x, normal.y),
        u,
        v,
        normal.z
      )
      const _v4 = copyVertex(
        v4,
        new Vector2(normal.x, normal.y),
        u,
        0,
        normal.z
      )
      if (reverse) {
        addTriangle(_v1, _v3, _v2)
        addTriangle(_v1, _v4, _v3)
      } else {
        addTriangle(_v1, _v2, _v3)
        addTriangle(_v1, _v3, _v4)
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
          // todo
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
            const hmb1 = addVertex(
              p1.x,
              p1.y,
              c.by || h / 3,
              normal,
              length - c.x
            )
            const hmt1 = addVertex(
              p1.x,
              p1.y,
              c.ty || (h / 3) * 2,
              normal,
              length - c.x
            )
            const ht1 = addVertex(p1.x, p1.y, h, normal, length - c.x)

            const p2 = Vector2.plus(pos, Vector2.multiply(dir, c.x + c.dx))
            const hb2 = addVertex(p2.x, p2.y, 0, normal, length - (c.x + c.dx))
            const hmb2 = addVertex(
              p2.x,
              p2.y,
              c.by || h / 3,
              normal,
              length - (c.x + c.dx)
            )
            const hmt2 = addVertex(
              p2.x,
              p2.y,
              c.ty || (h / 3) * 2,
              normal,
              length - (c.x + c.dx)
            )
            const ht2 = addVertex(p2.x, p2.y, h, normal, length - (c.x + c.dx))

            addQuad(mt1, hmt1, ht1, t1, reverse)
            addQuad(mb1, hmb1, hmt1, mt1, reverse)
            addQuad(b1, hb1, hmb1, mb1, reverse)
            if (c.by > 0) addQuad(hb1, hb2, hmb2, hmb1, reverse)
            addQuad(hmt1, hmt2, ht2, ht1, reverse)

            b1 = hb2
            mb1 = hmb2
            mt1 = hmt2
            t1 = ht2

            if (c.tunnelId !== -1) {
              if (tunnel.has(c.tunnelId)) {
                const otherHole = tunnel.get(c.tunnelId)
                if (otherHole !== undefined) {
                  if (
                    v3Dist(otherHole.t1pos, { x: p1.x, y: p1.y, z: c.ty }) <
                    v3Dist(otherHole.t2pos, { x: p1.x, y: p1.y, z: c.ty })
                  ) {
                    addCopyQuad(hmb1, hmt1, otherHole.t1, otherHole.b1)
                    addCopyQuad(hmt1, hmt2, otherHole.t2, otherHole.t1)
                    addCopyQuad(hmb2, hmt2, otherHole.t2, otherHole.b2)
                    if (c.by > 0) {
                      addCopyQuad(hmb1, hmb2, otherHole.b2, otherHole.b1)
                    }

                    addCopyQuad(hmb1, hmt1, otherHole.t1, otherHole.b1, true)
                    addCopyQuad(hmt1, hmt2, otherHole.t2, otherHole.t1, true)
                    addCopyQuad(hmb2, hmt2, otherHole.t2, otherHole.b2, true)
                    if (c.by > 0) {
                      addCopyQuad(hmb1, hmb2, otherHole.b2, otherHole.b1, true)
                    } else {
                      addCopyQuad(hb1, hmb1, otherHole.b1, otherHole.bb1)
                      addCopyQuad(hb1, hmb1, otherHole.b1, otherHole.bb1, true)

                      addCopyQuad(hb2, hmb2, otherHole.b2, otherHole.bb2)
                      addCopyQuad(hb2, hmb2, otherHole.b2, otherHole.bb2, true)
                    }
                  } else {
                    addCopyQuad(hmb1, hmt1, otherHole.t2, otherHole.b2)
                    addCopyQuad(hmt1, hmt2, otherHole.t1, otherHole.t2)
                    addCopyQuad(hmb2, hmt2, otherHole.t1, otherHole.b1)
                    if (c.by > 0) {
                      addCopyQuad(hmb1, hmb2, otherHole.b1, otherHole.b2)
                    }

                    addCopyQuad(hmb1, hmt1, otherHole.t2, otherHole.b2, true)
                    addCopyQuad(hmt1, hmt2, otherHole.t1, otherHole.t2, true)
                    addCopyQuad(hmb2, hmt2, otherHole.t1, otherHole.b1, true)
                    if (c.by > 0) {
                      addCopyQuad(hmb1, hmb2, otherHole.b1, otherHole.b2, true)
                    } else {
                      addCopyQuad(hb1, hmb1, otherHole.b2, otherHole.bb2)
                      addCopyQuad(hb1, hmb1, otherHole.b2, otherHole.bb2, true)

                      addCopyQuad(hb2, hmb2, otherHole.b1, otherHole.bb1)
                      addCopyQuad(hb2, hmb2, otherHole.b1, otherHole.bb1, true)
                    }
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
                  bb1: hb1,
                  bb2: hb2,
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
    // const ceilingMap = new Map<number,number>()
    const ceilingCoords = new Array<number[]>()

    // const floorMap = new Map<number,number>()
    const floorCoords = new Array<number[]>()

    for (let i = 0; i < vertices.length; i += 3) {
      if (vertices[i + z] === 0) {
        // ceilingMap.set(ceilingCoords.length/2, i/3)
        ceilingCoords.push([vertices[i + x], vertices[i + y]])
      } else if (vertices[i + z] === h) {
        // floorMap.set(floorCoords.length/2, i/3)
        floorCoords.push([vertices[i + x], vertices[i + y]])
      }
    }

    const ceilDelaunay = Delaunator.from(ceilingCoords).triangles
    const ceilingOffset = vertices.length / 3

    for (let i = 0; i < ceilingCoords.length; i++) {
      addVertex(
        ceilingCoords[i][0],
        ceilingCoords[i][1],
        h,
        new Vector2(0, 0),
        ceilingCoords[i][0],
        ceilingCoords[i][1],
        -1
      )
    }

    for (let i = 0; i < ceilDelaunay.length; i += 3) {
      addTriangle(
        ceilDelaunay[i] + ceilingOffset,
        ceilDelaunay[i + 2] + ceilingOffset,
        ceilDelaunay[i + 1] + ceilingOffset
      )
    }

    const floorDelaunay = Delaunator.from(floorCoords).triangles
    const floorOffset = vertices.length / 3

    for (let i = 0; i < floorCoords.length; i++) {
      addVertex(
        floorCoords[i][0],
        floorCoords[i][1],
        0,
        new Vector2(0, 0),
        floorCoords[i][0],
        floorCoords[i][1],
        -1
      )
    }

    for (let i = 0; i < floorDelaunay.length; i += 3) {
      addTriangle(
        floorDelaunay[i] + floorOffset,
        floorDelaunay[i + 1] + floorOffset,
        floorDelaunay[i + 2] + floorOffset
      )
    }
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
    geometry.computeVertexNormals()

    const mat = new MeshLambertMaterial({
      /* side: DoubleSide, */ color: 0xffffff
    })

    const exporter = new GLTFExporter()
    exporter.parse(
      new Mesh(geometry, mat),
      gltf => {
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
