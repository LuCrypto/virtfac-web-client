<template>
  <v-container
    class="pa-0 ma-0"
    ref="container"
    style="max-width: 100%; max-height: 100%; position: relative"
  >
    <model-viewer-stats
      v-if="!hideStats"
      ref="stats"
      :pannelIds="[0, 1, 2]"
      :position="statsPosition"
    ></model-viewer-stats>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { Prop } from 'vue-property-decorator'
import Component from 'vue-class-component'
import * as THREE from 'three'
import V from '@/utils/vector'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { studioEnvMap } from '@/utils/imageData'

// Loaders
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { BVHLoader, BVH } from 'three/examples/jsm/loaders/BVHLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'

import ModelViewerStats from '@/components/ModelViewerStats.vue'

// import AVATAR from '@/utils/avatar'

@Component({
  name: 'ModelViewer2',
  components: {
    ModelViewerStats
  }
})
// @vuese
// @group COMPONENTS
export default class ModelViewer2 extends Vue {
  @Prop({ default: () => false }) private displayInspector!: boolean
  @Prop({ default: () => false }) private displayFog!: boolean
  @Prop({ default: () => false }) private displayGrid!: boolean
  @Prop({ default: () => false }) private depthWriteFloor!: boolean
  @Prop({ default: () => false }) private hideStats!: boolean
  @Prop({ default: () => 'TOP_LEFT' }) private statsPosition!:
    | 'TOP_RIGHT'
    | 'TOP_LEFT'
    | 'BOTTOM_RIGHT'
    | 'BOTTOM_LEFT'

  container: HTMLElement | null = null

  size: V = new V(0, 0)
  controls: OrbitControls
  mixer: THREE.AnimationMixer | null = null
  clock = new THREE.Clock()

  camera: THREE.PerspectiveCamera
  scene: THREE.Scene
  renderer: THREE.WebGLRenderer

  animationValue = 0
  animationDuration = 0

  update: (() => void) | null = null

  constructor () {
    super()
    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    this.scene = new THREE.Scene()
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    })
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
  }

  public setFogActive (active: boolean, color = 0xa0a0a0) {
    if (active) {
      const fogColor = new THREE.Color(color)
      // this.scene.background = fogColor
      this.scene.fog = new THREE.Fog(fogColor, 1, 15)
    } else {
      const fogColor = new THREE.Color(color)
      // this.scene.background = fogColor
      this.scene.fog = null
    }
  }

  private gridHelper: THREE.GridHelper | null = null
  private floor: THREE.Mesh | null = null

  public setGrid (
    size: number,
    division: number,
    lineColor: number,
    backgroundColor: number,
    centerLineColor?: number | undefined
  ): void {
    if (this.gridHelper !== null) this.scene.remove(this.gridHelper)
    if (this.floor !== null) this.scene.remove(this.floor)

    // Create grid visualizer
    this.gridHelper = new THREE.GridHelper(
      size,
      division,
      centerLineColor === undefined ? lineColor : centerLineColor,
      lineColor
    )
    this.gridHelper.position.set(0, 0.01, 0)
    this.scene.add(this.gridHelper)
    // Create axis visualizer
    // const axesHelper = new THREE.AxesHelper(50)
    // axesHelper.position.set(0, 0.002, 0)
    // this.scene.add(axesHelper)
    // Create floor
    this.floor = new THREE.Mesh(
      new THREE.PlaneGeometry(size, size),
      new THREE.MeshPhongMaterial({
        color: backgroundColor,
        depthWrite: this.depthWriteFloor
      })
    )
    this.floor.rotation.x = -Math.PI / 2
    this.floor.receiveShadow = true
    this.floor.position.set(0, -0.01, 0)
    this.scene.add(this.floor)
  }

  id: number | undefined = undefined
  unmounted (): void {
    if (this.id) {
      window.cancelAnimationFrame(this.id)
      console.log(`Remove animation frame ${this.id}.`)
    }
    this.id = undefined
  }

  onDeactivated (): void {
    this.unmounted()
  }

  mounted (): void {
    // Create scene
    const fogColor = new THREE.Color(0xa0a0a0)
    // this.scene.background = fogColor
    this.scene.fog = new THREE.Fog(fogColor, 0.0025, 20)
    // Create camera
    this.camera.position.set(1.5, 2.5, 1.5)
    this.camera.lookAt(new THREE.Vector3(0, 5, 0))

    const canvas = this.renderer.domElement as HTMLCanvasElement
    canvas.setAttribute(
      'style',
      'position: absolute; top: 0; left: 0; width: 100%; height: 100%;'
    )

    this.container = this.$refs.container as HTMLElement
    this.container.appendChild(this.renderer.domElement)

    this.renderer.setClearColor(0x000000, 0)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    // Create ambiant light
    // const ambiant = new THREE.HemisphereLight(0x444444, 0x222244)
    const ambiant = new THREE.AmbientLight(0x555555)
    this.scene.add(ambiant)
    // Create sun
    this.addShadowLight(9, 10, 10, 0xffffff, 0.9)
    this.addShadowLight(-9, -10, -10, 0xffffff, 0.5, false)

    // Create sun visualizer
    // const sunHelper = new THREE.DirectionalLightHelper(sun, 4, 0xffb000)
    // this.scene.add(sunHelper)
    this.setGrid(100, 100, 0xaaaaaa, 0x363636)
    this.setEnvMap(studioEnvMap, 'HDR')

    if (this.displayFog) {
      this.setFogActive(true)
    }

    // Update scene
    this.updateSize()
    this.updateTheme()
    this.loop()

    this.$root.$on('changeDarkMode', () => {
      this.updateTheme()
    })
  }

  updateTheme (): void {
    if (this.$vuetify.theme.dark) {
      this.setFogActive(this.displayFog, 0x1e1e1e)
      this.setGrid(100, 100, 0x555555, 0x1e1e1e, 0xeeeeee)
    } else {
      this.setFogActive(this.displayFog, 0xfefefe)
      this.setGrid(100, 100, 0xaaaaaa, 0xfefefe, 0x111111)
    }
  }

  // Simple method to add cube in scene
  createCube (x: number, y: number, z: number, color: number) {
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshLambertMaterial({ color: color })
    const cube = new THREE.Mesh(geometry, material)
    cube.position.set(x, y, z)
    if (this.scene) this.scene.add(cube)
  }

  createSphere (x: number, y: number, z: number, radius: number) {
    const geometry = new THREE.SphereGeometry(radius)
    const material = new THREE.MeshStandardMaterial({
      metalness: 1,
      roughness: 0
    })
    const cube = new THREE.Mesh(geometry, material)
    cube.position.set(x, y, z)
    if (this.scene) this.scene.add(cube)
  }

  updateSize () {
    // Compute new canvas size from container
    const size = new V(
      this.container ? this.container.offsetWidth : 0,
      this.container ? this.container.offsetHeight : 0
    )

    if (!this.size.equal(size)) {
      this.size = size
      this.camera.aspect = this.size.x / this.size.y
      this.camera.updateProjectionMatrix()

      this.renderer.setSize(this.size.x, this.size.y, true)
      this.controls.update()
    }
  }

  loadGLTFFromPath (path: string): Promise<GLTF> {
    const loader = new GLTFLoader()
    return new Promise((resolve, reject) =>
      loader.load(
        path,
        object => {
          object.scene.traverse(child => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true
              child.receiveShadow = true
            }
          })
          if (this.scene != null) this.scene.add(object.scene)
          resolve(object)
        },
        undefined,
        error => reject(error)
      )
    )
  }

  loadFBXFromPath (path: string): Promise<THREE.Group> {
    const fbxLoader = new FBXLoader()
    return new Promise((resolve, reject) =>
      fbxLoader.load(
        path,
        object => {
          if (this.scene != null) this.scene.add(object)
          resolve(object)
        },
        undefined,
        error => reject(error)
      )
    )
  }

  loadBVHFromContent (content: string): BVH {
    console.log('Load BVH')
    return new BVHLoader().parse(content)
  }

  addShadowLight (
    x: number,
    y: number,
    z: number,
    color: number,
    intensity: number,
    castShadow = true
  ) {
    const sun = new THREE.DirectionalLight(color, intensity)
    sun.position.set(x, y, z)
    sun.castShadow = castShadow
    // sun.lookAt(0, 0, 0)
    const d = 20
    this.scene.add(sun)
    sun.shadow.mapSize.width = 8192
    sun.shadow.mapSize.height = 8192
    sun.shadow.camera.near = 0.1
    sun.shadow.camera.far = 100
    sun.shadow.camera.left = -d
    sun.shadow.camera.right = d
    sun.shadow.camera.top = d
    sun.shadow.camera.bottom = -d
    sun.shadow.bias = -0.0002
    sun.shadow.blurSamples = 0
  }

  public setEnvMap (
    url: string,
    type: 'HDR' | 'IMG' | 'EXR' = 'IMG',
    setBackground?: boolean
  ) {
    const texture = null

    const apply = (texture: THREE.Texture) => {
      texture.mapping = THREE.EquirectangularRefractionMapping
      this.scene.environment = texture
      if (setBackground) this.scene.background = texture
    }

    switch (type) {
      case 'IMG': {
        new THREE.TextureLoader().load(url, apply)
        break
      }
      case 'HDR': {
        new RGBELoader().load(url, apply)
        break
      }
    }
  }
  /*
  A regarder pour le mappage du BVH sur un modèle :
  https://rawcdn.githack.com/mrdoob/three.js/r105/examples/webgl_loader_sea3d_bvh_retarget.html
  http://lo-th.github.io/root/blending2/index_bvh.html
  */

  draw () {
    if (this.renderer && this.scene && this.camera) {
      this.updateSize()

      const stats = this.$refs.stats as ModelViewerStats
      if (stats) {
        stats.update()
      }
      if (this.update) {
        this.update()
      }
      this.renderer.render(this.scene, this.camera)
    }
  }

  loop () {
    this.draw()
    this.id = requestAnimationFrame(() => this.loop())
  }
}
</script>
