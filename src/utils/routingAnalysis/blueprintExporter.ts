import { Blueprint, BpWallFurniture } from './blueprint'
import {
  BufferGeometry,
  BufferAttribute,
  Mesh,
  Vector3,
  MeshPhysicalMaterial,
  Group
} from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter'
import Delaunator from 'delaunator'
import { Destroyable } from './bp_window'
// import { BpWallHole } from './bp_wallLink'
import V from '@/utils/vector'
import API from '../api'
import { BpAPICache } from './bp_APICache'
import { BehaviourInstance } from '../assets/behaviour'
import { APIBoundingBox } from '../models'
import { Link } from '../graph/link'

interface Hole {
  xpos: number
  width: number
  top: number
  bottom: number
  tunnelId: number
}

export class BlueprintExporter {
  /**
   * using blueprint metadata :
   * - roof_height : number
   * - wall_width : number
   * - scale : number
   * @param blueprint
   */
  public static exportGeometry (blueprint: Blueprint): Promise<string> {
    return new Promise<string>(resolve => {
      const assetNeeded = new Set<number>()
      blueprint.foreachWallLink(l => {
        l.getOrAddData<Map<Destroyable, BpWallFurniture>>(
          'furnitures',
          new Map<Destroyable, BpWallFurniture>()
        ).forEach(value => {
          if (!assetNeeded.has(value.assetId)) {
            assetNeeded.add(value.assetId)
          }
        })
      })
      const where: { id: number }[] = []
      assetNeeded.forEach(id => {
        where.push({ id: id })
      })

      BpAPICache.instance()
        .selectItems(['id', 'behaviours', 'boundingBox'], where)
        .then(response => {
          // get API data
          const assetMap = new Map<
            number,
            {
              id: number
              behaviours: Map<string, BehaviourInstance>
              boundingBox: APIBoundingBox
            }
          >()
          ;((response as unknown) as {
            id: number
            behaviours: Map<string, BehaviourInstance>
            boundingBox: APIBoundingBox
          }[]).forEach(item => {
            assetMap.set(item.id, item)
          })

          // compute holes and tunnels

          let nextTunnelId = 0
          blueprint.foreachWallLink(link => {
            const linkPosOrigin = link.getOriginNode().getData<V>('position')
            const linkPosTarget = link.getNode().getData<V>('position')
            const dir = linkPosTarget
              .subV(linkPosOrigin)
              .normalize()
              .rotate90()
            const dir2 = dir.multN(-1)
            const furniturePos = (posx: number) => {
              return linkPosOrigin.addV(
                linkPosTarget.subV(linkPosOrigin).multN(posx)
              )
            }
            link
              .getOrAddData<Map<Destroyable, BpWallFurniture>>(
                'furnitures',
                new Map<Destroyable, BpWallFurniture>()
              )
              .forEach(furniture => {
                // begin furniture
                const asset = assetMap.get(furniture.assetId) as {
                  id: number
                  behaviours: Map<string, BehaviourInstance>
                  boundingBox: APIBoundingBox
                }
                let behaviour = asset.behaviours.get('Wall/Window')
                if (behaviour === undefined) {
                  behaviour = asset.behaviours.get('Wall/Door')
                }
                if (behaviour !== undefined) {
                  const width = (behaviour.data as Record<string, unknown>)
                    .width as number
                  const top = (behaviour.data as Record<string, unknown>)
                    .top as number
                  const bottom = ((behaviour.data as Record<string, unknown>)
                    .bottom || 0) as number

                  const fPos = furniturePos(furniture.xpos)

                  // search for tunnel
                  let pos: V | null = null
                  let otherLink: Link | null = null
                  blueprint.foreachWallLink(l => {
                    if (l !== link) {
                      const p1 = l.getNode().getData<V>('position')
                      const p2 = l.getOriginNode().getData<V>('position')
                      let intersection = V.intersectionOrNull(fPos, dir, p1, p2)
                      if (intersection === null) {
                        intersection = V.intersectionOrNull(fPos, dir2, p1, p2)
                      }
                      if (intersection !== null) {
                        if (
                          pos === null ||
                          intersection.distanceTo(fPos) < pos.distanceTo(fPos)
                        ) {
                          pos = intersection
                          otherLink = l
                        }
                      }
                    }
                  })

                  let tunnelId = -1
                  if (otherLink !== null && pos !== null) {
                    tunnelId = nextTunnelId++
                    const l = otherLink as Link
                    const p = pos as V
                    const xpos2 =
                      p
                        .subV(l.getOriginNode().getData<V>('position'))
                        .length() /
                      l
                        .getNode()
                        .getData<V>('position')
                        .subV(l.getOriginNode().getData<V>('position'))
                        .length()
                    l.getOrAddData('__holes', new Array<Hole>()).push({
                      xpos: xpos2,
                      width: width,
                      top: top,
                      bottom: bottom,
                      tunnelId: tunnelId
                    })
                  }

                  link.getOrAddData('__holes', new Array<Hole>()).push({
                    xpos: furniture.xpos,
                    width: width,
                    top: top,
                    bottom: bottom,
                    tunnelId: tunnelId
                  })
                }
                // end current furniture
              })
            // end current link
          })

          // Generate Mesh
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

          const vertices = new Array<number>()
          const normals = new Array<number>()
          const uv = new Array<number>()
          const triangles = new Array<number[]>()
          const h = blueprint.getDataOrDefault<number>('roof_height', 2.5)
          // const w = blueprint.getDataOrDefault<number>('wall_width', 0.01)
          let nextIndex = 0

          const x = 0
          const y = 2
          const z = 1

          triangles.push(new Array<number>()) // 0:wall
          triangles.push(new Array<number>()) // 1:window
          triangles.push(new Array<number>()) // 2:door
          triangles.push(new Array<number>()) // 3:ceiling
          triangles.push(new Array<number>()) // 4:floor

          const addTriangle = (
            i1: number,
            i2: number,
            i3: number,
            layer = 0
          ) => {
            triangles[layer].push(i1)
            triangles[layer].push(i2)
            triangles[layer].push(i3)
          }
          const addNormal = (v: V, z = 0) => {
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
            normal: V,
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
            normal: V | undefined = undefined,
            u: number | undefined = undefined,
            v: number | undefined = undefined,
            normalZ: number | undefined = undefined
          ) => {
            return addVertex(
              vertices[vertexId * 3],
              vertices[vertexId * 3 + 2],
              vertices[vertexId * 3 + 1],
              normal || new V(normals[vertexId * 3], normals[vertexId * 3 + 2]),
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
            reverse = false,
            layer = 0
          ) => {
            if (reverse) {
              addTriangle(v1, v3, v2, layer)
              addTriangle(v1, v4, v3, layer)
            } else {
              addTriangle(v1, v2, v3, layer)
              addTriangle(v1, v3, v4, layer)
            }
          }
          const addCopyQuad = (
            v1: number,
            v2: number,
            v3: number,
            v4: number,
            reverse = false,
            layer = 0
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
              new V(normal.x, normal.y),
              0,
              0,
              normal.z
            )
            const _v2 = copyVertex(
              v2,
              new V(normal.x, normal.y),
              0,
              v,
              normal.z
            )
            const _v3 = copyVertex(
              v3,
              new V(normal.x, normal.y),
              u,
              v,
              normal.z
            )
            const _v4 = copyVertex(
              v4,
              new V(normal.x, normal.y),
              u,
              0,
              normal.z
            )
            if (reverse) {
              addTriangle(_v1, _v3, _v2, layer)
              addTriangle(_v1, _v4, _v3, layer)
            } else {
              addTriangle(_v1, _v2, _v3, layer)
              addTriangle(_v1, _v3, _v4, layer)
            }
          }
          const getVertexData = (vertexId: number) => {
            return {
              x: vertices[vertexId * 3],
              y: vertices[vertexId * 3 + 2],
              z: vertices[vertexId * 3 + 1],
              normal: new V(normals[vertexId * 3], normals[vertexId * 3 + 2]),
              u: uv[vertexId * 2],
              v: uv[vertexId * 2 + 1],
              normalZ: normals[vertexId * 3 + 1]
            }
          }

          blueprint.foreachWallNode(node => {
            const pos = node
              .getData<V>('position')
              .divN(blueprint.getData<number>('scale') * 100)
            node.foreachLink(l => {
              const pos2 = l
                .getNode()
                .getData<V>('position')
                .divN(blueprint.getData<number>('scale') * 100)

              const length = pos.distanceTo(pos2)

              let normal = pos2
                .subV(pos)
                .rotate90()
                .normalize()
                .multN(-1)
              if (l.getData<boolean>('double')) {
                // todo
              } else {
                let reverse = false
                if (
                  !blueprint.isInside(
                    pos
                      .addV(pos2)
                      .divN(2)
                      .addV(normal.multN(0.001))
                      .multN(blueprint.getData<number>('scale') * 100)
                  )
                ) {
                  normal = normal.multN(-1)
                  reverse = true
                }

                // adding holes for windows and doors
                const holes = l.getDataOrDefault<Hole[]>('__holes', [])
                const hArray = new Array<{
                  x: number
                  dx: number
                  by: number
                  ty: number
                  tunnelId: number
                }>()
                holes.forEach(hole => {
                  hArray.push({
                    x:
                      (hole.xpos * l.getData<number>('length')) / 100 -
                      hole.width / 2,
                    dx: hole.width,
                    by: hole.bottom,
                    ty: hole.top,
                    tunnelId: hole.tunnelId
                  })
                })
                hArray.sort((a, b) => {
                  return a.x - b.x
                })

                /*
                generating mesh for a wall of type : [node 1] --- [holes ?] --- [node 2]

                logic of vertex name :
                  - 1 => nearest node : node 1.
                  - 2 => nearest node : node 2.
                  - t => top
                  - b => bottom
                  - m => middle quad
                  - h => hole

                example : hmt1 means vertex of a hole at the node 1 side and at the top of the middle quad of the wall.

                shape of the generated part of mesh :
                    [t1]-----[ht1]------[ht2]-----[t2]
                      |        |          |         |
                    [mt1]----[hmt1]-----[hmt2]----[mt2]
                      |        |          |         |
                    [mb1]----[hmb1]-----[hmb2]----[mb2]
                      |        |          |         |
                    [b1]-----[hb1]------[hb2]-----[b2]

              */

                let b1 = addVertex(pos.x, pos.y, 0, normal, length)
                let mb1 = addVertex(pos.x, pos.y, h / 3, normal, length)
                let mt1 = addVertex(pos.x, pos.y, (h / 3) * 2, normal, length)
                let t1 = addVertex(pos.x, pos.y, h, normal, length)

                const b2 = addVertex(pos2.x, pos2.y, 0, normal, 0)
                const mb2 = addVertex(pos2.x, pos2.y, h / 3, normal, 0)
                const mt2 = addVertex(pos2.x, pos2.y, (h / 3) * 2, normal, 0)
                const t2 = addVertex(pos2.x, pos2.y, h, normal, 0)

                const dir = pos2.subV(pos).normalize()
                for (let i = 0; i < hArray.length; i++) {
                  const c = hArray[i]

                  const p1 = pos.addV(dir.multN(c.x))
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

                  const p2 = pos.addV(dir.multN(c.x + c.dx))
                  const hb2 = addVertex(
                    p2.x,
                    p2.y,
                    0,
                    normal,
                    length - (c.x + c.dx)
                  )
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
                  const ht2 = addVertex(
                    p2.x,
                    p2.y,
                    h,
                    normal,
                    length - (c.x + c.dx)
                  )

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
                        const matLayer = c.by > 0 ? 1 : 2
                        if (
                          v3Dist(otherHole.t1pos, {
                            x: p1.x,
                            y: p1.y,
                            z: c.ty
                          }) <
                          v3Dist(otherHole.t2pos, { x: p1.x, y: p1.y, z: c.ty })
                        ) {
                          addCopyQuad(
                            hmb1,
                            hmt1,
                            otherHole.t1,
                            otherHole.b1,
                            false,
                            matLayer
                          )
                          addCopyQuad(
                            hmt1,
                            hmt2,
                            otherHole.t2,
                            otherHole.t1,
                            false,
                            matLayer
                          )
                          addCopyQuad(
                            hmb2,
                            hmt2,
                            otherHole.t2,
                            otherHole.b2,
                            false,
                            matLayer
                          )
                          if (c.by > 0) {
                            addCopyQuad(
                              hmb1,
                              hmb2,
                              otherHole.b2,
                              otherHole.b1,
                              false,
                              matLayer
                            )
                          }

                          addCopyQuad(
                            hmb1,
                            hmt1,
                            otherHole.t1,
                            otherHole.b1,
                            true,
                            matLayer
                          )
                          addCopyQuad(
                            hmt1,
                            hmt2,
                            otherHole.t2,
                            otherHole.t1,
                            true,
                            matLayer
                          )
                          addCopyQuad(
                            hmb2,
                            hmt2,
                            otherHole.t2,
                            otherHole.b2,
                            true,
                            matLayer
                          )
                          if (c.by > 0) {
                            addCopyQuad(
                              hmb1,
                              hmb2,
                              otherHole.b2,
                              otherHole.b1,
                              true,
                              matLayer
                            )
                          } else {
                            addCopyQuad(
                              hb1,
                              hmb1,
                              otherHole.b1,
                              otherHole.bb1,
                              false,
                              matLayer
                            )
                            addCopyQuad(
                              hb1,
                              hmb1,
                              otherHole.b1,
                              otherHole.bb1,
                              true,
                              matLayer
                            )

                            addCopyQuad(
                              hb2,
                              hmb2,
                              otherHole.b2,
                              otherHole.bb2,
                              false,
                              matLayer
                            )
                            addCopyQuad(
                              hb2,
                              hmb2,
                              otherHole.b2,
                              otherHole.bb2,
                              true,
                              matLayer
                            )
                          }
                        } else {
                          addCopyQuad(
                            hmb1,
                            hmt1,
                            otherHole.t2,
                            otherHole.b2,
                            false,
                            matLayer
                          )
                          addCopyQuad(
                            hmt1,
                            hmt2,
                            otherHole.t1,
                            otherHole.t2,
                            false,
                            matLayer
                          )
                          addCopyQuad(
                            hmb2,
                            hmt2,
                            otherHole.t1,
                            otherHole.b1,
                            false,
                            matLayer
                          )
                          if (c.by > 0) {
                            addCopyQuad(
                              hmb1,
                              hmb2,
                              otherHole.b1,
                              otherHole.b2,
                              false,
                              matLayer
                            )
                          }

                          addCopyQuad(
                            hmb1,
                            hmt1,
                            otherHole.t2,
                            otherHole.b2,
                            true,
                            matLayer
                          )
                          addCopyQuad(
                            hmt1,
                            hmt2,
                            otherHole.t1,
                            otherHole.t2,
                            true,
                            matLayer
                          )
                          addCopyQuad(
                            hmb2,
                            hmt2,
                            otherHole.t1,
                            otherHole.b1,
                            true,
                            matLayer
                          )
                          if (c.by > 0) {
                            addCopyQuad(
                              hmb1,
                              hmb2,
                              otherHole.b1,
                              otherHole.b2,
                              true,
                              matLayer
                            )
                          } else {
                            addCopyQuad(
                              hb1,
                              hmb1,
                              otherHole.b2,
                              otherHole.bb2,
                              false,
                              matLayer
                            )
                            addCopyQuad(
                              hb1,
                              hmb1,
                              otherHole.b2,
                              otherHole.bb2,
                              true,
                              matLayer
                            )

                            addCopyQuad(
                              hb2,
                              hmb2,
                              otherHole.b1,
                              otherHole.bb1,
                              false,
                              matLayer
                            )
                            addCopyQuad(
                              hb2,
                              hmb2,
                              otherHole.b1,
                              otherHole.bb1,
                              true,
                              matLayer
                            )
                          }
                        }
                      }
                    } else {
                      tunnel.set(c.tunnelId, {
                        t1: copyVertex(hmt1, (normal = dir.normalize())),
                        b1: copyVertex(hmb1, (normal = dir.normalize())),
                        t2: copyVertex(
                          hmt2,
                          (normal = dir.normalize().multN(-1))
                        ),
                        b2: copyVertex(
                          hmb2,
                          (normal = dir.normalize().multN(-1))
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
              new V(0, 0),
              ceilingCoords[i][0],
              ceilingCoords[i][1],
              -1
            )
          }

          for (let i = 0; i < ceilDelaunay.length; i += 3) {
            addTriangle(
              ceilDelaunay[i] + ceilingOffset,
              ceilDelaunay[i + 2] + ceilingOffset,
              ceilDelaunay[i + 1] + ceilingOffset,
              3
            )
          }

          const floorDelaunay = Delaunator.from(floorCoords).triangles
          const floorOffset = vertices.length / 3

          for (let i = 0; i < floorCoords.length; i++) {
            addVertex(
              floorCoords[i][0],
              floorCoords[i][1],
              0,
              new V(0, 0),
              floorCoords[i][0],
              floorCoords[i][1],
              -1
            )
          }

          for (let i = 0; i < floorDelaunay.length; i += 3) {
            addTriangle(
              floorDelaunay[i] + floorOffset,
              floorDelaunay[i + 1] + floorOffset,
              floorDelaunay[i + 2] + floorOffset,
              4
            )
          }
          //
          /*
        geometry.setAttribute(
          'position',
          new BufferAttribute(Float32Array.from(vertices), 3)
        )
        geometry.setAttribute(
          'normal',
          new BufferAttribute(Float32Array.from(normals), 3)
        )
        geometry.setAttribute('uv', new BufferAttribute(Float32Array.from(uv), 2))
        let tris = new Array<number>()
        let oldCount = 0
        for (let i = 0; i < triangles.length; i++) {
          console.log(triangles[i].length)
          tris = tris.concat(triangles[i])
          geometry.addGroup(oldCount, tris.length, i)
          oldCount = tris.length
        }
        console.log(tris.length)
        geometry.setIndex(new BufferAttribute(Uint16Array.from(tris), 1))
        geometry.computeVertexNormals()
    */
          // const mesh = new Array<Mesh>()
          const group = new Group()

          for (let i = 0; i < triangles.length; i++) {
            const indexMap = new Map<number, number>()

            let currentIndex = 0
            const localVertex = new Array<number>()
            const localNormal = new Array<number>()
            const localUv = new Array<number>()

            triangles[i].forEach(vIndex => {
              if (!indexMap.has(vIndex)) {
                localVertex.push(vertices[vIndex * 3])
                localVertex.push(vertices[vIndex * 3 + 1])
                localVertex.push(vertices[vIndex * 3 + 2])
                localNormal.push(normals[vIndex * 3])
                localNormal.push(normals[vIndex * 3 + 1])
                localNormal.push(normals[vIndex * 3 + 2])
                localUv.push(uv[vIndex * 2])
                localUv.push(uv[vIndex * 2 + 1])
                indexMap.set(vIndex, currentIndex)
                currentIndex++
              }
            })
            const geometry = new BufferGeometry()
            geometry.setAttribute(
              'position',
              new BufferAttribute(Float32Array.from(localVertex), 3)
            )
            geometry.setAttribute(
              'normal',
              new BufferAttribute(Float32Array.from(localNormal), 3)
            )
            geometry.setAttribute(
              'uv',
              new BufferAttribute(Float32Array.from(localUv), 2)
            )
            geometry.setIndex(
              new BufferAttribute(
                Uint16Array.from(
                  triangles[i].map(i => {
                    return indexMap.get(i) as number
                  })
                ),
                1
              )
            )
            group.add(
              new Mesh(
                geometry,
                new MeshPhysicalMaterial({
                  color: 0xffffff,
                  roughness: 1,
                  metalness: 0
                })
              )
            )
          }

          /*
        const mat = [
          new MeshPhysicalMaterial({
            color: 0xffffff,
            roughness: 1,
            metalness: 0
          }),
          new MeshPhysicalMaterial({
            color: 0x00ffff,
            roughness: 1,
            metalness: 0
          }),
          new MeshPhysicalMaterial({
            color: 0xff00ff,
            roughness: 1,
            metalness: 0
          }),
          new MeshPhysicalMaterial({
            color: 0xffff00,
            roughness: 1,
            metalness: 0
          }),
          new MeshPhysicalMaterial({
             color: 0xff0000,
            roughness: 1,
            metalness: 0
          })
        ]
        */
          /*
        const mat = new MeshPhysicalMaterial({
          color: 0xffffff,
          roughness: 1,
          metalness: 0
        })
        */

          blueprint.foreachWallLink(l => {
            l.setData('__holes', undefined)
          })
          const exporter = new GLTFExporter()
          exporter.parse(
            group,
            gltf => {
              /*
              const a = document.createElement('a')
              const file = new Blob([JSON.stringify(gltf)], {
                type: 'text/plain'
              })
              a.href = URL.createObjectURL(file)
              a.download = 'layout.gltf'
              a.click()
              */
              resolve(JSON.stringify(gltf))
            },
            {}
          )

          // end then of promise
        })
    })
  }
}
