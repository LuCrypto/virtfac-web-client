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
  MeshLambertMaterial
} from 'three'
import { DelayedCallback } from '../graph/delayedCallback'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter'
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter'

export class BlueprintScene {
  public static exportGeometry (blueprint: Blueprint) {
    const geometry = new BufferGeometry()

    const vertices = new Array<number>()
    const normals = new Array<number>()
    const uv = new Array<number>()
    const colors = new Array<number>()
    const triangles = new Array<number>()
    const h = blueprint.getDataOrDefault<number>('roof_height', 2.5)
    const w = blueprint.getDataOrDefault<number>('wall_width', 0.01)
    let nextIndex = 0

    const addVertex = (x: number, y: number, z: number) => {
      const res = nextIndex
      vertices.push(x)
      vertices.push(y)
      vertices.push(z)
      nextIndex++
      return res
    }
    const addTriangle = (i1: number, i2: number, i3: number) => {
      triangles.push(i1)
      triangles.push(i2)
      triangles.push(i3)
    }
    const addNormal = (v: Vec2, z = 0) => {
      normals.push(v.x)
      normals.push(v.y)
      normals.push(z)
    }
    const addUv = (u: number, v: number) => {
      uv.push(u)
      uv.push(v)
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
        } else {
          const v1Bottom = addVertex(pos.x, pos.y, 0)
          addUv(0, 0)
          const v1Top = addVertex(pos.x, pos.y, h)
          addUv(0, h)
          const v2Bottom = addVertex(pos2.x, pos2.y, 0)
          addUv(length, 0)
          const v2Top = addVertex(pos2.x, pos2.y, h)
          addUv(length, h)
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
            addTriangle(v2Top, v1Top, v1Bottom)
            addTriangle(v2Bottom, v2Top, v1Bottom)
          } else {
            addTriangle(v1Bottom, v1Top, v2Top)
            addTriangle(v1Bottom, v2Top, v2Bottom)
          }
          addNormal(normal)
          addNormal(normal)
          addNormal(normal)
          addNormal(normal)
        }
      })
    })

    //
    // ceiling and floor
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
