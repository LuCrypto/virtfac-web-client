import { V } from '@/utils/nodeViewer/v'
import { Blueprint } from './blueprint'
import { Node } from '@/utils/graph/node'
import { Link } from '@/utils/graph/link'
import { Vec2, Vector2 } from '../graph/Vec'
import THREE, {
  BufferGeometry,
  Camera,
  Mesh,
  Renderer,
  Scene,
  WebGLBufferRenderer
} from 'three'
import { DelayedCallback } from '../graph/delayedCallback'

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
}
