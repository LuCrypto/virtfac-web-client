<template>
  <canvas class="viewer-3d" ref="canvas"></canvas>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import * as THREE from 'three'
import V from '@/utils/vector'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

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
      this.scene = new THREE.Scene()

      this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
      this.camera.position.z = 5

      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true
      })
      this.scene.add(new THREE.AmbientLight(0xffffff))
      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
      this.updateSize()
    }
    this.createScene()
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

  createScene (): void {
    if (this.canvas == null) {
      return
    }
    const geometry = new THREE.BoxGeometry()
    const material = new THREE.MeshLambertMaterial({
      color: 0xf5a406
    })
    const cube = new THREE.Mesh(geometry, material)

    const sun = new THREE.DirectionalLight(0xffffff, 1)
    sun.position.x = 10
    sun.position.y = 10
    sun.position.z = -10

    if (this.scene != null && this.camera != null) {
      this.scene.add(cube)
      sun.target = cube
      this.scene.add(sun)
    }
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
