<style scoped>
.screenshotViewer {
  position: absolute;
  max-width: 100%;
  max-height: 100%;
  aspect-ratio: 1/1;
  width: 10000px;
  border: dashed;
  border-width: thin;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  box-shadow: 0 0 0 1000px rgb(0, 0, 0, 0.5);
}
</style>

<template>
  <v-container
    fluid
    style="width:100%; height:100%; display:flex; flex-direction:row"
    class="pa-0 ma-0"
  >
    <div
      class="viewer-3d"
      ref="canvasContainer"
      style="overflow:hidden; position:relative"
    >
      <div ref="screenshotViewer" class="screenshotViewer">
        <v-layout class="d-flex flex-row">
          <v-btn
            elevation="2"
            class="ma-2"
            color="primary"
            style="pointer-events:visible"
            @click="screenShotButtonClick"
            ><v-icon>mdi-camera</v-icon></v-btn
          >
          <v-slider
            v-model="fov"
            :value="mfov"
            :max="150"
            :min="1"
            @change="onFovChanged"
            style="pointer-events: visible"
            class="ma-2"
            ><template v-slot:append>
              <v-text-field
                v-model="fov"
                class="mt-0 pt-0"
                hide-details
                single-line
                type="number"
                style="width: 60px; transform: translateY(-30%)"
              ></v-text-field></template
          ></v-slider>
        </v-layout>
      </div>
    </div>
    <v-container
      ref="hierarchy"
      style="max-width:50%; height: 100%; width:500px; right:0%;"
      v-if="displayInspector"
    >
      <v-card height="50%" width="100%" class="scroll">
        <v-toolbar dense color="primary" flat>
          <v-toolbar-title dense class="black--text">
            <v-icon left v-text="'mdi-file-tree'"></v-icon>
            Hierarchy
          </v-toolbar-title>
        </v-toolbar>

        <v-card class="fill-height">
          <tree-explorer
            ref="hierarchyTree"
            @onMouseEnterItem="
              item => {
                setHighlightObj(item, true)
              }
            "
            @onMouseLeaveItem="
              item => {
                setHighlightObj(item, false)
              }
            "
          ></tree-explorer>
        </v-card>
      </v-card>
    </v-container>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import * as THREE from 'three'
import V from '@/utils/vector'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { BVHLoader, BVH } from 'three/examples/jsm/loaders/BVHLoader'
import {
  BoxHelper,
  CanvasTexture,
  Color,
  DoubleSide,
  GridHelper,
  Group,
  Mesh,
  Object3D
} from 'three'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import { Session } from '@/utils/session'
import { Vector2 } from '@/utils/graph/Vec'
import { Prop } from 'vue-property-decorator'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { studioEnvMap } from '@/utils/imageData'
import TreeExplorer from '@/components/TreeExplorer.vue'

// import AVATAR from '@/utils/avatar'

@Component({
  components: {
    TreeExplorer
  }
})
export default class ModelViewer extends Vue {
  @Prop({ default: () => false }) private displayInspector!: boolean

  hierarchyItems = [
    { id: 0, name: 'scene', children: [{ id: 2, name: 'test' }] }
  ]

  mfov = 75
  public set fov (value: number) {
    this.mfov = value
    this.onFovChanged(value)
  }

  public get fov () {
    return this.mfov
  }

  screenshotViewer: HTMLElement | null = null
  container: HTMLElement | null = null

  selectedMenuItem = -1
  menuCollapse = false
  size: V = new V(0, 0)
  controls: OrbitControls
  mixer: THREE.AnimationMixer | null = null
  clock = new THREE.Clock()

  private userObjects = new Set<Group>()
  private boxHelpers = new Map<Group, BoxHelper>()

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
      this.scene.fog = new THREE.Fog(fogColor, 0.0025, 20)
    } else {
      const fogColor = new THREE.Color(color)
      // this.scene.background = fogColor
      this.scene.fog = null
    }
  }

  private gridHelper: GridHelper | null = null
  private floor: THREE.Mesh | null = null

  private gizmo: TransformControls | null = null
  private controledObject: Object3D | null = null

  public controlMesh (obj: Object3D | null) {
    this.controledObject = obj
    if (obj === null) {
      if (this.gizmo !== null) {
        this.gizmo.detach()
      }
    } else {
      if (this.gizmo === null) {
        this.gizmo = new TransformControls(
          this.camera,
          this.renderer.domElement
        )
        this.scene.add(this.gizmo)
        this.gizmo.addEventListener('change', this.draw)
        this.gizmo.addEventListener('dragging-changed', e => {
          this.controls.enabled = !e.value
        })
      }
      this.gizmo.attach(obj)
    }
  }

  public setHighlightObj (obj: Group, active = true): void {
    if (active) {
      let helper = this.boxHelpers.get(obj)
      if (helper === undefined) {
        helper = new BoxHelper(obj, 0xf5a406)
        this.scene.add(helper)
        this.boxHelpers.set(obj, helper)
      }
    } else {
      const helper = this.boxHelpers.get(obj)
      if (helper !== undefined) {
        this.scene.remove(helper)
        this.boxHelpers.delete(obj)
      }
    }
  }

  public setMeshControlMode (mode: 'translate' | 'rotate' | 'scale') {
    if (this.gizmo === null) {
      this.gizmo = new TransformControls(this.camera, this.renderer.domElement)
    }
    this.gizmo.setMode(mode)
  }

  public getMeshControlMode (): 'translate' | 'rotate' | 'scale' {
    if (this.gizmo === null) return 'translate'
    return this.gizmo.mode
  }

  public switchMeshControlSnap (forceActiveValue?: boolean): void {
    if (this.gizmo === null) return
    let activeValue = this.gizmo.rotationSnap !== null
    if (forceActiveValue !== undefined) {
      activeValue = !forceActiveValue
    }
    if (activeValue) {
      this.gizmo.setRotationSnap(null)
      this.gizmo.setTranslationSnap(null)
      this.gizmo.setScaleSnap(null)
    } else {
      this.gizmo.setRotationSnap(Math.PI / 32)
      this.gizmo.setTranslationSnap(0.1)
      this.gizmo.setScaleSnap(0.1)
    }
  }

  public setControlerSnap (
    translation?: number,
    rotation?: number,
    scaling?: number
  ): void {
    if (this.gizmo === null) return
    this.gizmo.setTranslationSnap(
      translation === undefined ? null : translation
    )
    this.gizmo.setRotationSnap(rotation === undefined ? null : rotation)
    this.gizmo.setScaleSnap(scaling === undefined ? null : scaling)
  }

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
      new THREE.MeshPhongMaterial({ color: backgroundColor })
    )
    this.floor.rotation.x = -Math.PI / 2
    this.floor.receiveShadow = true
    this.floor.position.set(0, -0.01, 0)
    this.scene.add(this.floor)
  }

  mounted (): void {
    // Create scene
    const fogColor = new THREE.Color(0xa0a0a0)
    // this.scene.background = fogColor
    this.scene.fog = new THREE.Fog(fogColor, 0.0025, 20)
    // Create camera
    this.camera.position.set(1.5, 2.5, 1.5)
    this.camera.lookAt(new THREE.Vector3(0, 5, 0))

    this.screenshotViewer = this.$refs.screenshotViewer as HTMLElement

    this.container = this.$refs.canvasContainer as HTMLElement
    this.container.appendChild(this.renderer.domElement)

    this.container.removeChild(this.screenshotViewer)

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
    this.setGrid(100, 100, 0xaaaaaa, 0xfefefe)

    this.setEnvMap(studioEnvMap, 'HDR')

    this.createSphere(0, 0, 0, 1)

    this.fov = 75

    // Update scene
    this.updateSize()
    this.loop()
  }

  public refreshSceneHierarchy () {
    const hierarchy = this.$refs.hierarchyTree as TreeExplorer
    hierarchy.clear()
    this.scene.children.forEach(child => {
      if (child instanceof Group && this.userObjects.has(child)) {
        child.traverse(c => {
          if (c.parent === this.scene) {
            hierarchy.addItem(c, c.name + ' ' + c.type, null)
          } else {
            hierarchy.addItem(c, c.name + ' ' + c.type, c.parent)
          }
        })
      }
    })
    // this.hierarchyItems = hierarchy.items as never[]
    hierarchy.refresh()
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
    const size = new V(
      this.renderer.domElement.offsetWidth,
      this.renderer.domElement.offsetHeight
    )
    if (!this.size.equal(size)) {
      this.size = size
      this.camera.aspect = this.size.x / this.size.y
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(this.size.x, this.size.y)
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

  addObjectToScene (object: Group): void {
    this.scene.add(object)
    this.userObjects.add(object)
    this.refreshSceneHierarchy()
  }

  removeObjectToScene (object: Group): void {
    this.scene.remove(object)
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

  public screenShot (
    onCaptureDone: { (uri: string): void },
    width?: number,
    height?: number,
    hideGrid?: boolean,
    hideTransformControler?: boolean
  ) {
    const oldsize = new THREE.Vector2(0, 0)
    this.renderer.getSize(oldsize)
    if (hideGrid) {
      this.scene.remove(this.gridHelper as GridHelper)
      this.scene.remove(this.floor as Mesh)
    }
    if (hideTransformControler && this.controledObject !== null) {
      this.scene.remove(this.gizmo as TransformControls)
    }
    if (width !== undefined && height !== undefined) {
      this.renderer.setSize(width, height)
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
    }

    const oldColor = this.scene.background
    this.scene.background = null
    this.renderer.setClearColor(0xff0000, 0)

    this.draw()
    var strMime = 'image/png'
    const imgData = this.renderer.domElement.toDataURL(strMime)
    if (hideGrid) {
      this.scene.add(this.gridHelper as GridHelper)
      this.scene.add(this.floor as Mesh)
    }
    if (hideTransformControler && this.controledObject !== null) {
      this.scene.add(this.gizmo as TransformControls)
    }
    if (width !== undefined && height !== undefined) {
      this.renderer.setSize(oldsize.x, oldsize.y)
      this.camera.aspect = oldsize.x / oldsize.y
      this.camera.updateProjectionMatrix()
    }
    this.scene.background = oldColor
    onCaptureDone(imgData)
  }

  private onScreenShot: { (): void } = () => {
    /**/
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

  private screanShotAlreadyActive = false

  private onFovChanged (value: number) {
    this.camera.fov = value
    this.camera.updateProjectionMatrix()
  }

  private screenShotButtonClick () {
    this.onScreenShot()
    if (this.container !== null && this.screenshotViewer !== null) {
      this.container.removeChild(this.screenshotViewer)
      this.screanShotAlreadyActive = false
      this.camera.fov = 75
      this.camera.updateProjectionMatrix()
    }
  }

  public beginScreenshotSession (
    onCaptureDone: { (uri: string): void },
    width?: number,
    height?: number,
    hideGrid?: boolean,
    hideTransformControler?: boolean
  ) {
    this.refreshSceneHierarchy()
    if (this.screanShotAlreadyActive) {
      if (this.container !== null && this.screenshotViewer !== null) {
        this.container.removeChild(this.screenshotViewer)
        this.screanShotAlreadyActive = false
        this.camera.fov = 75
        this.camera.updateProjectionMatrix()
      }
    } else {
      this.onScreenShot = () => {
        this.screenShot(
          onCaptureDone,
          width,
          height,
          hideGrid,
          hideTransformControler
        )
      }
      if (this.container !== null && this.screenshotViewer !== null) {
        this.container.appendChild(this.screenshotViewer)
        this.camera.fov = this.fov
        this.camera.updateProjectionMatrix()
        this.screanShotAlreadyActive = true
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
      if (this.update) {
        this.update()
      }
      this.renderer.render(this.scene, this.camera)
    }
  }

  loop () {
    this.draw()
    requestAnimationFrame(() => this.loop())
  }
}
</script>
