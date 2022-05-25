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
    ref="mainContainer"
    style="width:100%; height:100%; display:flex; flex-direction:row"
    class="pa-0 ma-0"
  >
    <div
      class="viewer-3d"
      ref="canvasContainer"
      style="overflow:hidden; position:relative"
    >
      <model-viewer-stats
        ref="stats"
        :pannelIds="[0, 1, 2]"
      ></model-viewer-stats>
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
      style="max-width:50%; height: 100%; width:500px; right:0%; overflow-y: auto; overflow-x: hidden;"
      class="ma-0 pa-0"
      v-if="inspectorActive"
    >
      <!-- Hierarchy -->
      <v-card height="50%" width="100%" class="mb-12">
        <v-toolbar dense color="primary" flat>
          <v-toolbar-title dense class="black--text">
            <v-icon left v-text="'mdi-file-tree'"></v-icon>
            Hierarchy
          </v-toolbar-title>
        </v-toolbar>

        <v-card class="fill-height pt-2" flat>
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
            @onItemSelected="selectItem"
            @mounted="refreshSceneHierarchy"
          ></tree-explorer>
        </v-card>
      </v-card>

      <!-- Transform -->
      <!-- <v-card width="100%" flat> -->
      <v-toolbar dense color="primary" flat>
        <v-toolbar-title dense class="black--text">
          <v-icon left v-text="'mdi-axis'"></v-icon>
          Transform
        </v-toolbar-title>
      </v-toolbar>

      <v-card flat>
        <v-simple-table
          ><template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">
                  Name
                </th>
                <th class="text-left" style="color:#E74C3C">
                  X
                </th>
                <th class="text-left" style="color:#27AE60">
                  Y
                </th>
                <th class="text-left" style="color:#3498DB">
                  Z
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in transformMatrix" v-bind:key="item.name">
                <td>{{ item.name }}</td>
                <td>
                  <v-text-field
                    v-model="item.x"
                    dense
                    single-line
                    type="number"
                    @change="applyTransformMatrix"
                    @mouseup="applyTransformMatrix"
                  ></v-text-field>
                </td>
                <td>
                  <v-text-field
                    v-model="item.y"
                    dense
                    single-line
                    type="number"
                    @change="applyTransformMatrix"
                    @mouseup="applyTransformMatrix"
                  ></v-text-field>
                </td>
                <td>
                  <v-text-field
                    v-model="item.z"
                    dense
                    single-line
                    type="number"
                    @change="applyTransformMatrix"
                    @mouseup="applyTransformMatrix"
                  ></v-text-field>
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-card>
      <v-btn dense color="primary" style="width:100%">
        <v-toolbar-title dense class="black--text">
          <v-icon left v-text="'mdi-plus'"></v-icon>
        </v-toolbar-title>
      </v-btn>
      <!-- </v-card> -->
    </v-container>
    <v-btn
      fab
      small
      elevation="0"
      v-if="displayInspector"
      class="ma-1"
      style="position:absolute; top:0px; right:0px"
      color="primary"
      @click="switchInspectorActive"
    >
      <v-icon>mdi-menu</v-icon>
    </v-btn>
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
  Euler,
  GridHelper,
  Group,
  Mesh,
  Object3D,
  Vector3
} from 'three'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import { Prop } from 'vue-property-decorator'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { studioEnvMap } from '@/utils/imageData'
import TreeExplorer from '@/components/TreeExplorer.vue'
import ModelViewerStats from '@/components/ModelViewerStats.vue'
import { UndoManager, Action } from '@/utils/undoManager'

// import AVATAR from '@/utils/avatar'

@Component({
  components: {
    TreeExplorer,
    ModelViewerStats
  }
})
export default class ModelViewer extends Vue {
  @Prop({ default: () => false }) private displayInspector!: boolean

  undoManager = new UndoManager()

  inspectorActive = false
  switchInspectorActive (): void {
    this.inspectorActive = !this.inspectorActive
  }

  hierarchyItems = [
    { id: 0, name: 'scene', children: [{ id: 2, name: 'test' }] }
  ]

  mfov = 75
  public set fov (value: number) {
    this.mfov = value
    this.onFovChanged(value)
  }

  public get fov (): number {
    return this.mfov
  }

  private mtransformMatrix = [
    { name: 'position', x: 0, y: 0, z: 0 },
    { name: 'rotation', x: 0, y: 0, z: 0 },
    { name: 'scale', x: 0, y: 0, z: 0 }
  ]

  get transformMatrix (): { name: string; x: number; y: number; z: number }[] {
    return this.mtransformMatrix
  }

  set transformMatrix (
    value: { name: string; x: number; y: number; z: number }[]
  ) {
    this.mtransformMatrix = value
    this.applyTransformMatrix()
  }

  screenshotViewer: HTMLElement | null = null
  container: HTMLElement | null = null
  mainContainer: HTMLElement | null = null

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
    // this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
  }

  public setFogActive (active: boolean, color = 0xa0a0a0): void {
    if (active) {
      const fogColor = new THREE.Color(color)
      // this.scene.background = fogColor
      this.scene.fog = new THREE.Fog(fogColor, 0.0025, 20)
    } else {
      // this.scene.background = fogColor
      this.scene.fog = null
    }
  }

  private gridHelper: GridHelper | null = null
  private floor: THREE.Mesh | null = null

  private gizmo: TransformControls | null = null
  private controledObject: Object3D | null = null

  private savedTransform: {
    position: Vector3
    rotation: Euler
    scale: Vector3
  } | null = null

  public controlMesh (obj: Object3D | null): void {
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
        this.gizmo.addEventListener('change', () => {
          this.updateTransformMatrix()
          this.draw()
          const h = this.boxHelpers.get(
            (this.gizmo as TransformControls).object as Group
          )
          if (h !== undefined) {
            h.update()
          }
        })
        this.gizmo.addEventListener('dragging-changed', e => {
          this.controls.enabled = !e.value
        })
        this.gizmo.addEventListener('mouseDown', e => {
          const obj = this.gizmo?.object as Object3D
          this.savedTransform = {
            position: obj.position.clone(),
            rotation: obj.rotation.clone(),
            scale: obj.scale.clone()
          }
        })
        this.gizmo.addEventListener('mouseUp', e => {
          if (this.savedTransform !== null) {
            const obj = this.gizmo?.object as Object3D
            const initTransform = this.savedTransform
            const finalTransform = {
              position: obj.position.clone(),
              rotation: obj.rotation.clone(),
              scale: obj.scale.clone()
            }
            this.undoManager.addAction(
              new Action(
                () => {
                  return new Promise<void>(resolve => {
                    obj.position.copy(initTransform.position)
                    obj.rotation.copy(initTransform.rotation)
                    obj.scale.copy(initTransform.scale)
                    obj.updateMatrix()
                    this.updateTransformMatrix()
                    const h = this.boxHelpers.get(obj as Group)
                    if (h !== undefined) {
                      h.update()
                    }
                    this.draw()
                    resolve()
                  })
                },
                () => {
                  return new Promise<void>(resolve => {
                    obj.position.copy(finalTransform.position)
                    obj.rotation.copy(finalTransform.rotation)
                    obj.scale.copy(finalTransform.scale)
                    obj.updateMatrix()
                    this.updateTransformMatrix()
                    const h = this.boxHelpers.get(obj as Group)
                    if (h !== undefined) {
                      h.update()
                    }
                    this.draw()
                    resolve()
                  })
                }
              )
            )
            this.savedTransform = null
          }
        })
      }
      this.gizmo.attach(obj)
    }
  }

  private updateTransformMatrix (): void {
    if (this.gizmo !== null && this.gizmo.object !== undefined) {
      const d = [
        this.gizmo.object.position,
        this.gizmo.object.rotation
          .toVector3()
          .divideScalar(Math.PI * 2)
          .multiplyScalar(360),
        this.gizmo.object.scale
      ]
      for (let i = 0; i < 3; i++) {
        this.mtransformMatrix[i].x = d[i].x
        this.mtransformMatrix[i].y = d[i].y
        this.mtransformMatrix[i].z = d[i].z
      }
    }
  }

  private applyTransformMatrix (): void {
    if (this.gizmo !== null && this.gizmo.object !== undefined) {
      this.gizmo.object.position.set(
        this.transformMatrix[0].x,
        this.transformMatrix[0].y,
        this.transformMatrix[0].z
      )
      this.gizmo.object.rotation.set(
        (this.transformMatrix[1].x / 360) * Math.PI * 2,
        (this.transformMatrix[1].y / 360) * Math.PI * 2,
        (this.transformMatrix[1].z / 360) * Math.PI * 2
      )

      this.gizmo.object.scale.set(
        this.transformMatrix[2].x,
        this.transformMatrix[2].y,
        this.transformMatrix[2].z
      )

      this.gizmo.object.updateMatrix()
    }
  }

  private selectItem (item: Group): void {
    if (this.gizmo !== null) {
      if (
        this.gizmo.object !== null &&
        this.boxHelpers.get(this.gizmo.object as Group) !== undefined
      ) {
        this.scene.remove(
          this.boxHelpers.get(this.gizmo.object as Group) as BoxHelper
        )
      }
      this.gizmo.attach(item)
    }
    this.updateTransformMatrix()
  }

  public setHighlightObj (obj: Group, active = true): void {
    if (active) {
      let helper = this.boxHelpers.get(obj)
      if (helper === undefined) {
        helper = new BoxHelper(obj, 0xf5a406)
        // helper.attach(obj)
        this.scene.add(helper)
        this.boxHelpers.set(obj, helper)
      }
    } else {
      const helper = this.boxHelpers.get(obj)
      if (helper !== undefined && obj !== this.gizmo?.object) {
        this.scene.remove(helper)
        this.boxHelpers.delete(obj)
      }
    }
  }

  public setMeshControlMode (mode: 'translate' | 'rotate' | 'scale'): void {
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

    this.mainContainer = this.$refs.mainContainer as HTMLElement

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

    this.undoManager.bind()
    // Update scene
    this.updateSize()
    this.loop()
  }

  public refreshSceneHierarchy (): void {
    const hierarchy = this.$refs.hierarchyTree as TreeExplorer | undefined
    if (hierarchy !== undefined) {
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
      if (this.gizmo !== null) {
        hierarchy.selectedItem = this.gizmo.object
      } else {
        hierarchy.selectedItem = null
      }
      hierarchy.refresh()
    }
  }

  // Simple method to add cube in scene
  createCube (x: number, y: number, z: number, color: number): void {
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshLambertMaterial({ color: color })
    const cube = new THREE.Mesh(geometry, material)
    cube.position.set(x, y, z)
    if (this.scene) this.scene.add(cube)
  }

  createSphere (x: number, y: number, z: number, radius: number): void {
    const geometry = new THREE.SphereGeometry(radius)
    const material = new THREE.MeshStandardMaterial({
      metalness: 1,
      roughness: 0
    })
    const cube = new THREE.Mesh(geometry, material)
    cube.position.set(x, y, z)
    if (this.scene) this.scene.add(cube)
  }

  updateSize (): void {
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
  ): void {
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
  ): void {
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
  ): void {
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

  private onFovChanged (value: number): void {
    this.camera.fov = value
    this.camera.updateProjectionMatrix()
  }

  private screenShotButtonClick (): void {
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
  ): void {
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

  draw (): void {
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

  loop (): void {
    this.draw()
    requestAnimationFrame(() => this.loop())
  }
}
</script>
