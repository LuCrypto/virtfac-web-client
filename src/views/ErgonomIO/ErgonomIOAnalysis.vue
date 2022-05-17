<template>
  <v-container class="spacing-playground pa-6 contradiction-analysis" fluid>
    <v-card elevation="3" class="mx-auto mb-6 flex-grow-1">
      <v-card-title>Ergonom.io Analysis</v-card-title>
      <v-card-subtitle>Analysis tool for ergonom.io</v-card-subtitle>
    </v-card>
    <v-card
      elevation="3"
      height="700"
      style="width: 100%"
      class="d-flex flex-row"
    >
      <pop-up ref="openFilePopUp">
        <open-file
          @close="$refs.openFilePopUp.close()"
          application="ERGONOM_IO_ANALYSIS"
          :singleSelect="true"
          :openFile="true"
          @fileInput="onFileInput"
        ></open-file>
      </pop-up>
      <v-navigation-drawer stateless permanent :mini-variant="menuCollapse">
        <v-list
          nav
          dense
          class="d-flex flex-column justify-start;"
          style="height: 100%"
        >
          <v-list-item-group v-model="selectedMenuItem" color="primary">
            <v-list-item
              v-for="(menuItem, i) in menuItemList"
              :key="i"
              class="justify-start"
              @click.stop="menuItem.action"
            >
              <v-list-item-icon>
                <v-icon v-text="menuItem.icon"></v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="menuItem.text"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
          <v-list-item-group class="mt-auto">
            <v-list-item
              class="justify-start"
              @click="menuCollapse = !menuCollapse"
            >
              <v-list-item-icon>
                <v-icon v-if="menuCollapse" v-text="'mdi-arrow-right'"></v-icon>
                <v-icon v-if="!menuCollapse" v-text="'mdi-arrow-left'"></v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="'Menu labels'"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-navigation-drawer>
      <div
        style="width: 100%; max-width: none;display: flex; flex-direction: column;"
      >
        <div style="width: 100%; height: 10px; flex-grow: 1;">
          <v-card style="z-index: 10;" class="currentScore">
            Score RULA : {{ this.rula ? this.rula.currentScore : 0 }}
          </v-card>
          <ModelViewer ref="viewer"></ModelViewer>
        </div>
        <v-slider
          v-model="animationValue"
          @input="rula.update()"
          dense
          min="0"
          max="1"
          step="0.001"
          class="flex-grow-0 px-6 pt-5"
        ></v-slider>
      </div>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import ModelViewer from '@/components/ModelViewer.vue'
import OpenFile from '@/components/OpenFile.vue'
import { APIFile } from '@/utils/models'
import * as THREE from 'three'
import RULA from '@/utils/rula'
import PopUp from '@/components/PopUp.vue'

class SkeletonHelper extends THREE.SkeletonHelper {
  skeleton: THREE.Skeleton | null = null
}

class MenuItem {
  text: string
  icon: string
  action: () => void
  constructor (text: string, icon: string, action: () => void) {
    this.text = text
    this.icon = icon
    this.action = action
  }
}

@Component({
  components: {
    ModelViewer,
    OpenFile,
    PopUp
  }
})
export default class AvatarAnimationComponent extends Vue {
  selectedMenuItem = -1
  menuCollapse = false
  menuItemList: MenuItem[] = []
  viewer: ModelViewer | null = null
  animationValue = 0
  rula: RULA | null = null
  bvhSkeletonHelper: SkeletonHelper | null = null
  mixer: THREE.AnimationMixer | null = null
  animationTime = 0
  animationDuration = 0
  clock = new THREE.Clock()

  mounted (): void {
    this.viewer = this.$refs.viewer as ModelViewer
    this.createMenu()
    this.createAvatar()
    this.rula = new RULA(this.viewer.scene)
  }

  createMenu (): void {
    this.menuItemList.push(
      new MenuItem('Open BVH File', 'mdi-file-document', () => {
        (this.$refs.openFilePopUp as PopUp).open()
      })
    )
    this.menuItemList.push(
      new MenuItem('Download RULA analysis', 'mdi-download', () => true)
    )
  }

  createAvatar (): void {
    if (this.viewer == null) return
    const viewer = this.viewer
    this.viewer
      .loadGLTFFromPath('./avatar.gltf')
      .then(gltf => {
        gltf.scene.children[0].position.set(0, 0, -2)
        gltf.scene.traverse(child => {
          if (child instanceof THREE.Bone && child.name === 'mixamorig1Hips') {
            const helper = new THREE.SkeletonHelper(child)
            const mat = helper.material as THREE.LineBasicMaterial
            mat.linewidth = 3
            helper.visible = true
            viewer.scene.add(helper)
          }
        })
      })
      .catch(e => console.error('Cannot load GLTF', e))
  }

  loadBVHAndAnimate (content: string): void {
    if (this.viewer == null) return
    if (this.viewer.scene == null) return

    const scene = this.viewer.scene

    // Load BVH
    const bvh = this.viewer.loadBVHFromContent(content)

    this.bvhSkeletonHelper = new SkeletonHelper(bvh.skeleton.bones[0])
    this.bvhSkeletonHelper.skeleton = bvh.skeleton
    scene.add(this.bvhSkeletonHelper)

    const boneContainer = new THREE.Group()
    boneContainer.add(bvh.skeleton.bones[0])
    boneContainer.scale.set(0.005, 0.005, 0.005)
    scene.add(boneContainer)

    this.mixer = new THREE.AnimationMixer(this.bvhSkeletonHelper)
    this.animationDuration = bvh.clip.duration
    this.animationTime = 0
    this.mixer
      .clipAction(bvh.clip)
      .setLoop(THREE.LoopRepeat, Infinity)
      .setEffectiveWeight(1.0)
      .play()

    this.displayRULA()
    this.viewer.update = () => this.update()
  }

  // Enable or not RULA visualization
  displayRULA (): void {
    if (this.viewer == null) return
    if (this.viewer.scene == null) return
    if (this.bvhSkeletonHelper == null) return
    if (this.rula == null) return
    this.rula.createRULAMarkers(this.bvhSkeletonHelper)
    this.rula.update()
  }

  update (): void {
    if (this.rula == null) return
    this.rula.update()

    if (this.mixer == null) return
    const delta = this.clock.getDelta()
    this.animationTime = (this.animationTime + delta) % this.animationDuration
    this.animationValue = this.animationTime / this.animationDuration
    this.mixer.setTime(this.animationTime)
  }

  onFileInput (files: APIFile[]): void {
    const file = files.pop()
    if (file != null) {
      const fileContent = file.uri.split('base64,')[1]
      const content = atob(fileContent)
      this.loadBVHAndAnimate(content)
    } else {
      console.error('Unable to open selected file.')
      this.$root.$emit('bottom-message', 'Unable to open selected file.')
    }
  }
}
</script>
