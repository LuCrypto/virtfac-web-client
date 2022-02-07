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
// import AVATAR from '@/utils/avatar'

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

  mounted (): void {
    this.canvas = this.$refs.canvas as HTMLElement
    if (this.canvas != null) {
      // Create scene
      this.scene = new THREE.Scene()
      const fogColor = new THREE.Color(0xa0a0a0)
      this.scene.background = fogColor
      this.scene.fog = new THREE.Fog(fogColor, 0.0025, 20)
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
      this.renderer.shadowMap.enabled = true
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
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
      sun.shadow.camera.near = 0.5
      sun.shadow.camera.far = 500
      // Create sun visualizer
      const sunHelper = new THREE.DirectionalLightHelper(sun, 4, 0xffb000)
      this.scene.add(sunHelper)
      // Create grid visualizer
      const gridHelper = new THREE.GridHelper(100, 100, 0x898989)
      gridHelper.position.set(0, 0.001, 0)
      this.scene.add(gridHelper)
      // Create floor
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(2000, 2000),
        new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
      )
      floor.rotation.x = -Math.PI / 2
      floor.receiveShadow = true
      this.scene.add(floor)
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

  draw () {
    if (this.renderer && this.scene && this.camera) {
      this.updateSize()
      this.renderer.render(this.scene, this.camera)
    }
  }

  loop () {
    this.draw()
    requestAnimationFrame(() => this.loop())
  }
}
</script>
