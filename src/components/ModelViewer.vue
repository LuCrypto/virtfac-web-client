<template>
  <canvas class="viewer-3d" ref="canvas"></canvas>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import * as THREE from 'three'
import V from '@/utils/vector'

@Component
export default class ModelViewer extends Vue {
  selectedMenuItem = -1
  menuCollapse = false
  canvas: HTMLElement | null = null
  renderer: THREE.WebGLRenderer | null = null
  size: V = new V(0, 0)
  camera: THREE.PerspectiveCamera | null = null
  scene: THREE.Scene | null = null

  mounted (): void {
    this.canvas = this.$refs.canvas as HTMLElement
    if (this.canvas != null) {
      this.scene = new THREE.Scene()
      this.updateSize()
      this.size = new V(this.canvas.offsetWidth, this.canvas.offsetHeight)
      this.camera = new THREE.PerspectiveCamera(
        75,
        this.size.x / this.size.y,
        0.1,
        1000
      )
      this.camera.position.z = 5
      this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas })
      this.renderer.setSize(this.size.x, this.size.y)
    }
    this.createScene()
    this.loop()
  }

  updateSize () {
    if (this.canvas && this.renderer && this.camera) {
      const size = new V(this.canvas.offsetWidth, this.canvas.offsetHeight)

      if (!this.size.equal(size)) {
        this.size = size
        this.camera.aspect = this.size.x / this.size.y
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(this.size.x, this.size.y)
      }
    }
  }

  createScene (): void {
    if (this.canvas == null) {
      return
    }
    const geometry = new THREE.BoxGeometry()
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
    const cube = new THREE.Mesh(geometry, material)
    if (this.scene != null && this.camera != null) {
      this.scene.add(cube)
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
