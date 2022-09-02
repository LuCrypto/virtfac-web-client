<style>
.v-badge * {
  color: black !important;
}
</style>

<template>
  <v-container
    fluid
    class="d-flex flex-wrap pt-6 pl-6 flex-grow-1"
    style="max-height: 100%; overflow: auto;"
  >
    <v-container
      class="d-flex flex-column"
      style="max-height: 100%; overflow: auto;"
      fluid
    >
      <v-card class="flex-grow-1 d-flex flex-column" style="overflow: auto;">
        <v-card-title class="pa-2 primary black--text"
          >Gesture analysis</v-card-title
        >

        <v-card-text class="pa-0" style="height: 100%;">
          <v-layout row class="ma-0" fill-height>
            <!-- Side bar -->
            <v-navigation-drawer
              class="ma-0 pa-0"
              stateless
              permanent
              :mini-variant="menuCollapse"
            >
              <v-list
                nav
                dense
                class="d-flex flex-column justify-start;"
                style="height: 100%"
              >
                <v-list-item-group v-model="selectedMenuItem" color="primary">
                  <v-list-item
                    v-for="(menuItem, i) in menuItemList"
                    :disabled="menuItem.disabled()"
                    :key="i"
                    class="justify-start"
                    @click.stop="menuItem.action"
                  >
                    <v-list-item-icon
                      :style="{ opacity: menuItem.disabled() ? 0.5 : 1 }"
                    >
                      <v-icon v-text="menuItem.icon"></v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title
                        v-text="menuItem.text"
                      ></v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-item-group>
                <v-list-item-group class="mt-auto">
                  <v-list-item
                    class="justify-start"
                    @click="menuCollapse = !menuCollapse"
                  >
                    <v-list-item-icon>
                      <v-icon
                        v-if="menuCollapse"
                        v-text="'mdi-arrow-right'"
                      ></v-icon>
                      <v-icon
                        v-if="!menuCollapse"
                        v-text="'mdi-arrow-left'"
                      ></v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title
                        v-text="'Menu labels'"
                      ></v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </v-navigation-drawer>

            <v-col class="pa-0 d-flex flex-column" style="overflow: hidden;">
              <!-- Model viewer -->
              <v-col class="flex-grow-1">
                <v-row
                  no-gutters
                  class="ma-0"
                  style="position: relative; width: 100%; height: 100%"
                >
                  <model-viewer-2
                    :depthWriteFloor="true"
                    :displayFog="true"
                    ref="viewer"
                    statsPosition="TOP_RIGHT"
                  ></model-viewer-2>
                </v-row>
              </v-col>

              <!-- Player controls -->
              <v-col class="flex-grow-0 px-1 pt-0">
                <v-row
                  no-gutters
                  class="flex-nowrap px-2 pb-2 justify-center align-center"
                >
                  <input
                    ref="timeRange"
                    class="my-2"
                    type="range"
                    style="width: 100%;"
                    v-model="animation"
                    name=""
                    id=""
                    value="0"
                    min="0"
                    max="0.999"
                    step="0.001"
                    :disabled="this.settingsReferences.inputSkeleton == null"
                  />
                </v-row>
                <v-row
                  no-gutters
                  class="flex-nowrap pa-2 justify-center align-center"
                >
                  <v-btn
                    fab
                    x-small
                    class="mr-2"
                    @click="
                      play = false
                      animation = 0
                    "
                    :disabled="this.settingsReferences.inputSkeleton == null"
                  >
                    <v-icon>mdi-skip-previous</v-icon>
                  </v-btn>
                  <v-btn
                    fab
                    small
                    class="mr-2 primary black--text"
                    @click="play = !play"
                    :disabled="this.settingsReferences.inputSkeleton == null"
                  >
                    <v-icon>{{ play ? 'mdi-pause' : 'mdi-play' }}</v-icon>
                  </v-btn>
                  <v-btn
                    fab
                    x-small
                    @click="
                      play = false
                      animation = 0.999
                    "
                    :disabled="this.settingsReferences.inputSkeleton == null"
                  >
                    <v-icon>mdi-skip-next</v-icon>
                  </v-btn>
                </v-row>
              </v-col>

              <!-- TODO RULA Chart -->
              <!-- <v-row no-gutters>
                <v-col no-gutters class="d-flex" style="max-height: 400px">
                  <dynamic-chart
                    title="Transport chart"
                    :key="`transport-chart-${updateTransportChart}`"
                  >
                    <dynamic-chart-curve-timeline
                      :rawCurves="
                        transportChartCurves.length > 0
                          ? transportChartCurves
                          : []
                      "
                      label-x="Amount (Units)"
                      label-y="Time (Hours)"
                      :step-x="100"
                      :step-y="100"
                      :scale-x="100"
                      :scale-y="10"
                      :display-plot="true"
                    ></dynamic-chart-curve-timeline>
                  </dynamic-chart>
                </v-col>
              </v-row> -->
            </v-col>
          </v-layout>
        </v-card-text>
      </v-card>

      <!-- Popup -->
      <pop-up ref="openFilePopUp">
        <open-file
          @close="$refs.openFilePopUp.close()"
          application="ERGONOM_IO_ANALYSIS"
          :fileProcessing="blenderFileProcessing"
          :singleSelect="true"
          :openFile="true"
          @fileInput="onFileInput"
        ></open-file>
      </pop-up>
    </v-container>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import ModelViewer2 from '@/components/ModelViewer2.vue'
import OpenFile, { FileProcessing } from '@/components/OpenFile.vue'
import { APIFile } from '@/utils/models'
import * as THREE from 'three'
// import RULA, { RULA_LABELS } from '@/utils/rula'
import RULA from '@/utils/rula'
import PopUp from '@/components/PopUp.vue'
import GraphChart from '@/components/charts/graphChart.vue'
// import { AxisNeuronSkeleton, UnrealSkeleton } from '@/utils/avatar'
import T from '@/utils/transform'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { BVH } from 'three/examples/jsm/loaders/BVHLoader'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'

import V from '@/utils/vector'
import DynamicChart from '@/components/dynamicChart/DynamicChart.vue'
import DynamicChartCurveTimeline from '@/components/dynamicChart/DynamicChartCurveTimeline.vue'

class SkeletonHelper extends THREE.SkeletonHelper {
  skeleton: THREE.Skeleton | null = null
}

class MenuItem {
  text: string
  icon: string
  action: () => void
  disabled: () => boolean
  constructor (
    text: string,
    icon: string,
    action: () => void,
    disabled: () => boolean = () => false
  ) {
    this.text = text
    this.icon = icon
    this.action = action
    this.disabled = disabled
  }
}

class DataFrame {
  rula: Map<string, number> = new Map<string, number>()

  constructor (data: Partial<DataFrame> | null = null) {
    Object.assign(this, data)
  }

  getRulaScore (): number {
    return this.rula.get('FINAL_SCORE') || -1
  }
}

interface SkeletonUtilsModule {
  retargetClip: (
    target: THREE.Skeleton | THREE.Object3D,
    source: THREE.Skeleton | THREE.Object3D,
    clip: THREE.AnimationClip,
    options: Record<string, unknown>
  ) => THREE.AnimationClip
}

interface Settings {
  showInput: boolean
  showSkeleton: boolean
  transformType: number
  showRula: boolean
  showAvatar: boolean
}

@Component({
  name: 'AvatarAnimationComponent',
  components: {
    ModelViewer2,
    OpenFile,
    PopUp,
    GraphChart,
    DynamicChart,
    DynamicChartCurveTimeline
  }
})
// @vuese
// @group VIEWS
export default class AvatarAnimationComponent extends Vue {
  selectedMenuItem = -1
  menuCollapse = true
  menuItemList: MenuItem[] = []
  viewer: ModelViewer2 | null = null
  animationValue = 0

  // Time controlers
  animationTime = 0
  animationDuration = 0
  play = true
  clock = new THREE.Clock()
  set animation (value: number) {
    this.animationTime = value * this.animationDuration
    this.updateRangeTime()
  }

  get animation (): number {
    return this.animationValue
  }

  updateRangeTime (): void {
    const value = this.animationValue
    const element = this.$refs.timeRange as HTMLInputElement
    if (!element) return
    const width = Math.ceil(element.offsetWidth * value)
    element.setAttribute('style', `box-shadow: inset ${width}px 0 0 #ffb000;`)
  }

  // Analysed data
  data: DataFrame[] = []
  rula: RULA | null = null

  gltf: GLTF | null = null
  gltfHipsPosition: THREE.Vector3 = new THREE.Vector3()
  gltfMixer: THREE.AnimationMixer | null = null
  bvhMixer: THREE.AnimationMixer | null = null
  gltfAction: THREE.AnimationAction | null = null
  bvhAction: THREE.AnimationAction | null = null
  updateAvatarGizmo: () => void = () => null

  transportChartCurves: {
    name: string
    data: V[]
  }[] = []

  // Bone reatrgeting
  options = {
    useFirstFramePosition: true,
    preserveHipPosition: false,
    hip: 'Hips',
    offsets: [] as THREE.Matrix4[],
    fps: 30,
    names: {
      pelvis: 'Hips',
      spine_01: 'Spine',
      spine_02: 'Spine1',
      spine_03: 'Spine2',
      clavicle_l: 'LeftShoulder',
      upperarm_l: 'LeftArm',
      lowerarm_l: 'LeftForeArm',
      hand_l: 'LeftHand',
      index_01_l: 'LeftHandIndex1',
      index_02_l: 'LeftHandIndex2',
      index_03_l: 'LeftHandIndex3',
      middle_01_l: 'LeftHandMiddle1',
      middle_02_l: 'LeftHandMiddle2',
      middle_03_l: 'LeftHandMiddle3',
      pinky_01_l: 'LeftHandPinky1',
      pinky_02_l: 'LeftHandPinky2',
      pinky_03_l: 'LeftHandPinky3',
      ring_01_l: 'LeftHandRing1',
      ring_02_l: 'LeftHandRing2',
      ring_03_l: 'LeftHandRing3',
      thumb_01_l: 'LeftHandThumb1',
      thumb_02_l: 'LeftHandThumb2',
      thumb_03_l: 'LeftHandThumb3',
      lowerarm_twist_01_l: null,
      upperarm_twist_01_l: null,
      clavicle_r: 'RightShoulder',
      upperarm_r: 'RightArm',
      lowerarm_r: 'RightForeArm',
      hand_r: 'RightHand',
      index_01_r: 'RightHandIndex1',
      index_02_r: 'RightHandIndex2',
      index_03_r: 'RightHandIndex3',
      middle_01_r: 'RightHandMiddle1',
      middle_02_r: 'RightHandMiddle2',
      middle_03_r: 'RightHandMiddle3',
      pinky_01_r: 'RightHandPinky1',
      pinky_02_r: 'RightHandPinky2',
      pinky_03_r: 'RightHandPinky3',
      ring_01_r: 'RightHandRing1',
      ring_02_r: 'RightHandRing2',
      ring_03_r: 'RightHandRing3',
      thumb_01_r: 'RightHandThumb1',
      thumb_02_r: 'RightHandThumb2',
      thumb_03_r: 'RightHandThumb3',
      lowerarm_twist_01_r: null,
      upperarm_twist_01_r: null,
      neck_01: 'Neck',
      head: 'Head',
      thigh_l: 'LeftUpLeg',
      calf_l: 'LeftLeg',
      calf_twist_01_l: null,
      foot_l: 'LeftFoot',
      ball_l: null,
      thigh_twist_01_l: null,
      thigh_r: 'RightUpLeg',
      calf_r: 'RightLeg',
      calf_twist_01_r: null,
      foot_r: 'RightFoot',
      ball_r: null,
      thigh_twist_01_r: null,
      ik_foot_root: null,
      ik_foot_l: null,
      ik_foot_r: null,
      ik_hand_root: null,
      ik_hand_gun: null,
      ik_hand_l: null,
      ik_hand_r: null
    }
  }

  action: THREE.AnimationAction | null = null

  settings: Settings = {
    showInput: false,
    showSkeleton: true,
    transformType: 0,
    showRula: true,
    showAvatar: true
  }

  settingsReferences: {
    inputSkeleton: THREE.SkeletonHelper | null
    outputSkeleton: THREE.SkeletonHelper | null
    transform: TransformControls | null
    avatar: THREE.Group | null
  } = {
    inputSkeleton: null,
    outputSkeleton: null,
    transform: null,
    avatar: null
  }

  mounted (): void {
    this.viewer = this.$refs.viewer as ModelViewer2
    this.createMenu()
    this.createAvatar()
  }

  updateSettings (settings: Partial<Settings>): void {
    if (settings.transformType) {
      settings.transformType = settings.transformType % 3
    }
    Object.assign(this.settings, settings)

    if (this.settingsReferences.inputSkeleton) {
      this.settingsReferences.inputSkeleton.visible = this.settings.showInput
    }
    if (this.settingsReferences.outputSkeleton) {
      this.settingsReferences.outputSkeleton.visible = this.settings.showSkeleton
    }
    if (this.settingsReferences.outputSkeleton) {
      this.settingsReferences.outputSkeleton.visible = this.settings.showSkeleton
    }
    if (this.settingsReferences.avatar) {
      this.settingsReferences.avatar.visible = this.settings.showAvatar
    }
    if (this.settingsReferences.transform) {
      switch (this.settings.transformType) {
        case 1:
          this.settingsReferences.transform.showX = true
          this.settingsReferences.transform.showY = true
          this.settingsReferences.transform.showZ = true
          this.settingsReferences.transform.enabled = true
          this.settingsReferences.transform.visible = true
          this.settingsReferences.transform.setMode('translate')
          break
        case 2:
          this.settingsReferences.transform.showX = false
          this.settingsReferences.transform.showY = true
          this.settingsReferences.transform.showZ = false
          this.settingsReferences.transform.enabled = true
          this.settingsReferences.transform.visible = true
          this.settingsReferences.transform.setMode('rotate')
          break
        default:
          this.settingsReferences.transform.visible = false
          this.settingsReferences.transform.enabled = false
      }
    }
  }

  createMenu (): void {
    this.menuItemList.push(
      new MenuItem('Open classic BVH', 'mdi-file-document', () => {
        (this.$refs.openFilePopUp as PopUp).open()
      })
    )
    this.menuItemList.push(
      new MenuItem('Open blender BVH', 'mdi-blender-software', () => {
        (this.$refs.openFilePopUp as PopUp).open()
      })
    )
    this.menuItemList.push(
      new MenuItem('Download RULA analysis', 'mdi-download', () => true)
    )
    this.menuItemList.push(
      new MenuItem('Toggle avatar', 'mdi-human', () =>
        this.updateSettings({ showAvatar: !this.settings.showAvatar })
      )
    )
    this.menuItemList.push(
      new MenuItem(
        'Input skeleton',
        'mdi-eye-arrow-left',
        () => this.updateSettings({ showInput: !this.settings.showInput }),
        () => this.settingsReferences.inputSkeleton == null
      )
    )
    this.menuItemList.push(
      new MenuItem('Output skeleton', 'mdi-eye-arrow-right', () =>
        this.updateSettings({ showSkeleton: !this.settings.showSkeleton })
      )
    )
    this.menuItemList.push(
      new MenuItem('Add asset', 'mdi-archive-plus', () => true)
    )
    this.menuItemList.push(
      new MenuItem('Toggle transform', 'mdi-rotate-orbit', () =>
        this.updateSettings({ transformType: this.settings.transformType + 1 })
      )
    )
    this.menuItemList.push(
      new MenuItem('Reset transform', 'mdi-undo', () => {
        const transform = this.settingsReferences.transform
        if (transform && transform.object) {
          transform.object.position.set(0, 0, 0)
          transform.object.rotation.set(0, 0, 0)
        }
      })
    )
    this.menuItemList.push(
      new MenuItem('Toggle RULA markers', 'mdi-eye-circle', () => true)
    )
  }

  computeData (
    skeleton: THREE.Bone,
    animation: THREE.AnimationMixer,
    duration: number,
    fps = 30
  ): void {
    if (!this.viewer || !this.settingsReferences.inputSkeleton) {
      return
    }

    skeleton.matrixAutoUpdate = false

    this.rula = new RULA(this.viewer.scene)
    this.rula.createRULAMarkers(this.settingsReferences.inputSkeleton)

    for (let frame = 1; frame <= duration * fps; frame++) {
      animation.update((frame * duration) / fps)
      skeleton.updateMatrix()
      this.data.push(
        new DataFrame({
          rula: this.rula.compute()
        })
      )
      console.log('Compute...')
    }
    skeleton.matrixAutoUpdate = true
  }

  blenderFileProcessing (file: File): Promise<File> {
    return new Promise<File>(resolve => {
      const extension = (file.name.split('.').pop() as string).toLowerCase()
      console.log('Blender file processing : ', extension)

      // const blob = new Blob([JSON.stringify(gltf)], {
      //   type: 'model/gltf+json'
      // })
      // const f = new File(
      //   [blob],
      //   file.name.substring(0, file.name.length - extension.length) + 'gltf',
      //   { type: 'model/gltf+json' }
      // )
      // resolve(f)

      resolve(file)
    })
  }

  download (filename: string, text: string): void {
    const element = document.createElement('a')
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(text)
    )
    element.setAttribute('download', filename)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  export (): void {
    const csv = ''
    // const header = [...this.data[0].keys()].join(',')
    // const values = this.data.map(o => [...o.values()].join(',')).join('\n')
    // csv += header + '\n' + values
    this.download('data.csv', csv)
  }

  createAvatarGizmo (attach: THREE.Group): void {
    if (!this.viewer) return
    // Create control
    const viewer = this.viewer
    const control = new TransformControls(
      viewer.camera,
      viewer.renderer.domElement
    )
    control.addEventListener('change', () => viewer.draw())
    control.addEventListener('dragging-changed', event => {
      viewer.controls.enabled = !event.value
    })
    control.setMode('translate')
    control.attach(attach)
    viewer.scene.add(control)
    this.settingsReferences.transform = control
  }

  createAvatar (): void {
    if (this.viewer == null) return
    const viewer = this.viewer

    // Create orange flat material
    const material = new THREE.MeshStandardMaterial({
      color: 0x683e00,
      metalness: 0,
      roughness: 1
    })

    // Load, setup and add avatar to viewer
    this.viewer
      .loadGLTFFromPath('./avatar.gltf')
      .then(gltf => {
        // Avatar container
        const avatar = new THREE.Group()
        avatar.add(gltf.scene)
        this.settingsReferences.avatar = gltf.scene
        viewer.scene.add(avatar)

        // Global container
        const container = new THREE.Group()
        container.add(avatar)
        container.scale.set(0.01, 0.01, 0.01)
        viewer.scene.add(container)
        this.createAvatarGizmo(container)

        // Keep gltf reference
        this.gltf = gltf

        // Loop on all hierarchy
        gltf.scene.traverse(child => {
          // Set material for all meshes
          if (child instanceof THREE.Mesh) {
            child.material = material
          }

          // Get all bones
          if (child instanceof THREE.Bone && child.name === 'pelvis') {
            this.updateAvatarGizmo = () => {
              avatar.position.set(
                child.position.x,
                child.position.y,
                child.position.z
              )
            }

            const skeletonHelper = new THREE.SkeletonHelper(child)
            this.settingsReferences.outputSkeleton = skeletonHelper
            const skeletonMaterial = skeletonHelper.material as THREE.LineBasicMaterial
            skeletonMaterial.linewidth = 3
            skeletonMaterial.color = new THREE.Color(0x000000)
            skeletonHelper.visible = true
            viewer.scene.add(skeletonHelper)
          }
        })

        // Update settings
        this.updateSettings({})
      })
      .catch(e => console.error('Cannot load GLTF', e))
  }

  retargetBVH (result: BVH, model: THREE.SkinnedMesh): THREE.AnimationClip {
    // Set skeleton for GLTF
    if (!model.skeleton) {
      model.traverse(child => {
        const skeleton = (child as THREE.SkinnedMesh).skeleton
        if (skeleton) {
          model.skeleton = skeleton
        }
      })
    }

    // Recompute fps by
    const clip = result.clip
    const fps = 1 / clip.tracks[0].times[1] || 1
    clip.duration += 1 / fps
    this.options.fps = fps

    // Retarget animation
    const utils = (SkeletonUtils as unknown) as SkeletonUtilsModule
    const newClip = utils.retargetClip(
      model,
      result.skeleton,
      clip,
      this.options
    )

    // Reset all body parts
    model.traverse(child => {
      if (child.type === 'SkinnedMesh') {
        (child as THREE.SkinnedMesh).pose()
      }
    })

    return newClip
  }

  loadBVHAndAnimate (content: string): void {
    if (this.viewer == null) return
    if (this.viewer.scene == null) return
    if (!this.gltf) return

    // Load BVH
    const bvh = this.viewer.loadBVHFromContent(content)
    const bvhHelper = new SkeletonHelper(bvh.skeleton.bones[0])
    this.settingsReferences.inputSkeleton = bvhHelper
    bvhHelper.skeleton = bvh.skeleton
    const skeletonMaterial = bvhHelper.material as THREE.LineBasicMaterial
    skeletonMaterial.linewidth = 3
    skeletonMaterial.color = new THREE.Color(0x000000)
    const helperScale = new THREE.Group()
    helperScale.add(bvh.skeleton.bones[0])
    helperScale.scale.set(0.0045, 0.0045, 0.0045)
    this.viewer.scene.add(bvhHelper)
    this.viewer.scene.add(helperScale)

    this.updateAvatarGizmo()

    // Setup animation
    const model = (this.gltf.scene as THREE.Object3D) as THREE.SkinnedMesh
    const newClip = this.retargetBVH(bvh, model)
    this.animationDuration = bvh.clip.duration
    this.animationTime = 0
    this.gltfMixer = new THREE.AnimationMixer(this.gltf.scene)
    this.gltfAction = this.gltfMixer
      .clipAction(newClip)
      .setLoop(THREE.LoopRepeat, Infinity)
      .setEffectiveWeight(1.0)
      .play()

    this.bvhMixer = new THREE.AnimationMixer(bvhHelper)
    this.bvhAction = this.bvhMixer
      .clipAction(bvh.clip)
      .setLoop(THREE.LoopRepeat, Infinity)
      .setEffectiveWeight(1.0)
      .play()

    // Compute RULA
    this.computeData(
      model.skeleton.bones[0],
      this.bvhMixer,
      this.animationDuration
    )

    this.updateSettings({})
    this.viewer.update = () => this.update()
  }

  update (): void {
    if (this.gltfMixer == null || this.bvhMixer == null) return

    const delta = this.clock.getDelta()
    const playDelta = this.play ? delta : 0

    this.animationTime =
      (this.animationTime + playDelta) % this.animationDuration
    this.animationValue = this.animationTime / this.animationDuration
    this.updateRangeTime()
    this.gltfMixer.setTime(this.animationTime)
    this.bvhMixer.setTime(this.animationTime)

    if (!this.rula) return
    this.rula.updateRULAMarkers(
      this.data[(Math.floor(this.animationTime) * 30) % this.data.length].rula
    )
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
