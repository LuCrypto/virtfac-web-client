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
  private blueprint: Blueprint
  private scene: Scene
  private camera: Camera
  private renderer: Renderer
  private nextNodeIndex = 0
  private geometry: BufferGeometry
  private mesh: Mesh
  // private positionBufferCall = new DelayedCallback(() => { this.refreshPositionBufferAttribute() }, 5)

  public constructor (blueprint: Blueprint) {
    this.blueprint = blueprint
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(this.renderer.domElement)

    this.geometry = new BufferGeometry()
    this.mesh = new THREE.Mesh(
      this.geometry,
      new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    )

    blueprint.setData<Float32Array>('wall_vert_position', new Float32Array(600))
    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(
        blueprint.getData<Float32Array>('wall_vert_position'),
        3
      )
    )
    blueprint.setData<number>('roof_height', 2.5)

    this.addListeners()

    const animate = () => {
      requestAnimationFrame(animate)
      this.renderer.render(this.scene, this.camera)
    }

    animate()
  }

  private addNode (node: Node) {
    node.setData<number>('wall_vert_index', this.nextNodeIndex)
    this.nextNodeIndex++
    const array = this.blueprint.getData<Float32Array>('wall_vert_position')
    if (array.length < this.nextNodeIndex * 6) {
      const newArray = new Float32Array(array.length + 600)
      newArray.set(array)
      this.blueprint.setData<Float32Array>('wall_vert_position', newArray)
      this.geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(
          this.blueprint.getData<Float32Array>('wall_vert_position'),
          3
        )
      )
    }
    this.refreshNodePosition(node)
  }

  private refreshNodePosition (node: Node) {
    const index = node.getData<number>('wall_vert_index') * 6
    const array = this.blueprint.getData<Float32Array>('wall_vert_position')
    const pos = Vector2.divide(
      node.getData<Vec2>('position'),
      this.blueprint.getData<number>('scale') * 100
    )
    array[index] = pos.x
    array[index + 1] = pos.y
    array[index + 2] = 0
    array[index + 3] = pos.x
    array[index + 4] = pos.y
    array[index + 5] = this.blueprint.getData<number>('roof_height')
  }

  private refreshRoofHeight () {
    const array = this.blueprint.getData<Float32Array>('wall_vert_position')
    const h = this.blueprint.getData<number>('roof_height')
    this.blueprint.foreachWallNode(node => {
      array[node.getData<number>('wall_vert_index') * 6 + 5] = h
    })
  }

  private addListeners () {
    this.blueprint.onWallNodeAdded().addListener(arg => {
      this.addNode(arg.node)
    })

    this.blueprint.onDataChanged().addMappedListener('roof_height', arg => {
      this.refreshRoofHeight()
    })
  }

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

        let normal = Vector2.normalize(
          Vector2.rotate90(Vector2.minus(pos2, pos))
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
            addTriangle(v1Bottom, v1Top, v2Top)
            addTriangle(v1Bottom, v2Top, v2Bottom)
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
            blueprint.isInside(
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
            console.log('reverse')
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

  public static convertToGeometry (blueprint: Blueprint) {
    const geometry = new BufferGeometry()

    const vertices = new Array<number>()
    const h = blueprint.getDataOrDefault<number>('roof_height', 2.5)
    let nextIndex = 0
    blueprint.foreachWallNode(node => {
      const pos = Vector2.divide(
        node.getData<Vec2>('position'),
        blueprint.getData<number>('scale') * 100
      )
      node.setData<number>('__index', nextIndex)
      nextIndex++
      vertices.push(pos.x)
      vertices.push(pos.y)
      vertices.push(0)
      vertices.push(pos.x)
      vertices.push(pos.y)
      vertices.push(h)
    })
    const triangles = new Array<number>()
    blueprint.foreachWallNode(node => {
      const index1 = node.getData<number>('__index') * 2
      node.foreachLink(l => {
        const index2 = l.getNode().getData<number>('__index') * 2
        triangles.push(index1)
        triangles.push(index1 + 1)
        triangles.push(index2 + 1)

        triangles.push(index2 + 1)
        triangles.push(index1 + 1)
        triangles.push(index1)

        triangles.push(index1)
        triangles.push(index2 + 1)
        triangles.push(index2)

        triangles.push(index2)
        triangles.push(index2 + 1)
        triangles.push(index1)
      })
    })
    geometry.setAttribute(
      'position',
      new BufferAttribute(Float32Array.from(vertices), 3)
    )
    geometry.setIndex(new BufferAttribute(Uint16Array.from(triangles), 1))
    geometry.computeVertexNormals()

    const exporter = new GLTFExporter()
    exporter.parse(
      new Mesh(geometry, new MeshBasicMaterial({ color: 0x3498db })),
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
