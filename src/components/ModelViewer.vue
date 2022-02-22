<template>
  <canvas class="viewer-3d" ref="canvas"></canvas>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import * as THREE from 'three'
import V from '@/utils/vector'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { BVHLoader, BVH } from 'three/examples/jsm/loaders/BVHLoader'
import RULA from '@/utils/rula'
// import AVATAR from '@/utils/avatar'

class SkeletonHelper extends THREE.SkeletonHelper {
  skeleton: THREE.Skeleton | null = null
  // constructor (object: THREE.Object3D<THREE.Event>) {
  //   super(object)
  // }
}

@Component
export default class ModelViewer extends Vue {
  selectedMenuItem = -1
  menuCollapse = false
  canvas: HTMLElement | null = null
  renderer: THREE.WebGLRenderer | null = null
  size: V = new V(0, 0)
  camera: THREE.PerspectiveCamera | null = null
  scene: THREE.Scene | null = null
  controls: OrbitControls | null = null
  mixer: THREE.AnimationMixer | null = null
  clock = new THREE.Clock()
  rula = new RULA()

  mounted (): void {
    this.canvas = this.$refs.canvas as HTMLElement
    if (this.canvas != null) {
      // Create scene
      this.scene = new THREE.Scene()
      const fogColor = new THREE.Color(0xa0a0a0)
      this.scene.background = fogColor
      // this.scene.fog = new THREE.Fog(fogColor, 0.0025, 20)
      // Create camera
      this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
      this.camera.position.set(1.5, 2.5, 1.5)
      this.camera.lookAt(new THREE.Vector3(0, 5, 0))
      // Create renderer with transparent bacground
      this.renderer = new THREE.WebGLRenderer({
        alpha: true,
        canvas: this.canvas,
        antialias: true
      })
      this.renderer.setClearColor(0x000000, 0)
      // this.renderer.shadowMap.enabled = true
      // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
      // Create ambiant light
      const ambiant = new THREE.AmbientLight(0xffffff)
      this.scene.add(ambiant)
      // Create sun
      const sun = new THREE.DirectionalLight(0xffffff, 1)
      sun.position.set(10, 10, 10)
      sun.castShadow = true
      sun.lookAt(0, 0, 0)
      this.scene.add(sun)
      sun.shadow.mapSize.width = 1024
      sun.shadow.mapSize.height = 1024
      sun.shadow.camera.near = 0.1
      sun.shadow.camera.far = 100
      // sun.shadow.bias = 0.00000001
      // Create sun visualizer
      const sunHelper = new THREE.DirectionalLightHelper(sun, 4, 0xffb000)
      this.scene.add(sunHelper)
      // Create grid visualizer
      const gridHelper = new THREE.GridHelper(100, 100, 0x898989, 0x898989)
      gridHelper.position.set(0, 0.001, 0)
      this.scene.add(gridHelper)
      // Create axis visualizer
      const axesHelper = new THREE.AxesHelper(50)
      axesHelper.position.set(0, 0.002, 0)
      this.scene.add(axesHelper)
      // Create floor
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(2000, 2000),
        new THREE.MeshPhongMaterial({ color: 0x999999 })
      )
      floor.rotation.x = -Math.PI / 2
      floor.receiveShadow = true
      this.scene.add(floor)

      const createCube = (
        x: number,
        y: number,
        z: number,
        color: number
      ): void => {
        const geometry = new THREE.BoxGeometry(1, 1, 1)
        const material = new THREE.MeshLambertMaterial({ color: color })
        const cube = new THREE.Mesh(geometry, material)
        cube.position.set(x, y, z)
        if (this.scene) this.scene.add(cube)
      }

      createCube(-1, 0.5, -1, 0x005500)
      createCube(-1, 1.5, -1, 0x550000)

      // Create scene user control
      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
      // Update scene
      this.updateSize()
    }
    this.loop()
  }

  updateSize () {
    if (this.canvas && this.renderer && this.camera && this.controls) {
      const size = new V(this.canvas.offsetWidth, this.canvas.offsetHeight)
      if (!this.size.equal(size)) {
        this.size = size
        this.camera.aspect = this.size.x / this.size.y
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(this.size.x, this.size.y)
        this.controls.update()
      }
    }
  }

  loadGLTF (path: string): Promise<GLTF> {
    console.log(`Load <${path}>`)
    const loader = new GLTFLoader()
    return new Promise((resolve, reject) =>
      loader.load(
        path,
        object => {
          object.scene.children[0].position.set(0, 0, -2)
          object.scene.traverse(child => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true
              child.receiveShadow = true
            } else if (
              child instanceof THREE.Bone &&
              child.name === 'mixamorig1Hips'
            ) {
              const helper = new THREE.SkeletonHelper(child)
              const mat = helper.material as THREE.LineBasicMaterial
              mat.linewidth = 3
              helper.visible = true
              if (this.scene) this.scene.add(helper)
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

  loadBVH (content: string): BVH {
    console.log('Load BVH')
    return new BVHLoader().parse(content)
  }

  /*
  A regarder pour le mappage du BVH sur un modèle :
  https://rawcdn.githack.com/mrdoob/three.js/r105/examples/webgl_loader_sea3d_bvh_retarget.html
  http://lo-th.github.io/root/blending2/index_bvh.html
  */

  animateBVH (bvh: BVH): void {
    if (!this.scene) return
    const skeletonHelper = new SkeletonHelper(bvh.skeleton.bones[0])
    skeletonHelper.skeleton = bvh.skeleton

    const boneContainer = new THREE.Group()
    boneContainer.add(bvh.skeleton.bones[0])
    boneContainer.scale.set(0.005, 0.005, 0.005)
    this.scene.add(skeletonHelper)
    this.scene.add(boneContainer)
    console.log('SKELETON', this.scene.children[8])

    this.rula.createRULAMarkers(skeletonHelper)
    this.rula.update()

    this.mixer = new THREE.AnimationMixer(skeletonHelper)
    this.mixer
      .clipAction(bvh.clip)
      .setEffectiveWeight(1.0)
      .play()
  }

  draw () {
    if (this.renderer && this.scene && this.camera) {
      this.updateSize()
      if (this.mixer) {
        const delta = this.clock.getDelta() / 10
        this.mixer.update(delta)
        this.rula.update()
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
