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
                    :key="i"
                    class="justify-start"
                    @click.stop="menuItem.action"
                  >
                    <v-list-item-icon>
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
              <!-- Rows -->
              <v-row class="ma-0 flex-grow-1">
                <model-viewer-2
                  :displayFog="true"
                  ref="viewer"
                ></model-viewer-2>
              </v-row>
              <v-row class="ma-0 flex-grow-0">
                <v-container class="flex-grow-0 ma-0 pa-0" fluid>
                  <v-row no-gutters class="align-center justify-center">
                    <!-- Player control -->
                    <v-col no-gutters class="flex-grow-0">
                      <v-row no-gutters class="flex-nowrap pa-2 align-center">
                        <v-btn fab x-small class="mr-2 primary--text">
                          <v-icon>mdi-format-list-bulleted-square</v-icon>
                        </v-btn>
                        <v-btn fab x-small class="mr-2">
                          <v-icon>mdi-skip-next</v-icon>
                        </v-btn>
                        <v-btn fab small class="mr-2 primary black--text">
                          <v-icon>mdi-play</v-icon>
                        </v-btn>
                        <v-btn fab x-small class="mr-2">
                          <v-icon>mdi-pause</v-icon>
                        </v-btn>

                        <v-btn fab x-small>
                          <v-icon>mdi-skip-previous</v-icon>
                        </v-btn>
                      </v-row>
                    </v-col>
                    <v-col no-gutters>
                      <v-tabs show-arrows align-with-title>
                        <v-tabs-slider></v-tabs-slider>
                        <v-tab>
                          <v-badge
                            :color="this.data[this.frame].getRulaColor()"
                            inline
                            :value="this.data[this.frame].getRulaScore() >= 0"
                            :content="this.data[this.frame].getRulaScore()"
                          >
                            Rula
                          </v-badge>
                        </v-tab>
                        <v-tab
                          ><v-badge color="primary" value="" content="0">
                            Input
                          </v-badge></v-tab
                        >
                        <v-tab
                          ><v-badge color="primary" value="" content="0">
                            Output
                          </v-badge></v-tab
                        >
                      </v-tabs>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col
                      no-gutters
                      class="flex-grow-0 ma-2"
                      style="min-width: 250px; max-height: 400px; overflow: auto"
                    >
                      <!-- <v-expansion-panels flat tile>
                        <v-expansion-panel
                          v-for="(item, i) in axisNeuronSkeleton"
                          :key="i"
                          class="ma-0"
                        >
                          <v-expansion-panel-header
                            ripple
                            expand-icon="mdi-menu-down"
                          >
                            {{ item }}
                          </v-expansion-panel-header>
                          <v-expansion-panel-content
                            >Rotation</v-expansion-panel-content
                          >
                        </v-expansion-panel>
                      </v-expansion-panels> -->
                    </v-col>
                    <v-col no-gutters class="d-flex">
                      <graph-chart></graph-chart>
                    </v-col>
                  </v-row>
                </v-container>
              </v-row>
            </v-col>
          </v-layout>
        </v-card-text>
      </v-card>

      <!-- Popup -->
      <pop-up ref="openFilePopUp">
        <open-file
          @close="$refs.openFilePopUp.close()"
          application="ERGONOM_IO_ANALYSIS"
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
import OpenFile from '@/components/OpenFile.vue'
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

class DataFrame {
  rula: Map<string, number> = new Map<string, number>()
  input: Map<string, T> = new Map<string, T>()
  output: Map<string, T> = new Map<string, T>()

  constructor (data: Partial<DataFrame> | null = null) {
    Object.assign(this, data)
  }

  getRulaScore (): number {
    return this.rula.get('FINAL_SCORE') || -1
  }

  getRulaColor (): string {
    const score = this.getRulaScore()
    return score <= 2
      ? 'green'
      : score <= 4
        ? 'yellow'
        : score <= 6
          ? 'orange'
          : 'red'
  }
}

interface SkeletonUtilsModule {
  retarget: (
    target: THREE.Object3D | THREE.Skeleton,
    source: THREE.Object3D | THREE.Skeleton,
    options: any
  ) => void

  getSkeletonOffsets: (
    target: THREE.Object3D | THREE.Skeleton,
    source: THREE.Object3D | THREE.Skeleton,
    options: Record<string, unknown>
  ) => THREE.Matrix4[]

  retargetClip: (
    target: THREE.Skeleton | THREE.Object3D,
    source: THREE.Skeleton | THREE.Object3D,
    clip: THREE.AnimationClip,
    options: Record<string, unknown>
  ) => THREE.AnimationClip
}

@Component({
  name: 'AvatarAnimationComponent',
  components: {
    ModelViewer2,
    OpenFile,
    PopUp,
    GraphChart
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
  rula: RULA | null = null
  bvhSkeletonHelper: SkeletonHelper | null = null
  unrealSkeletonHelper: SkeletonHelper | null = null
  mixer: THREE.AnimationMixer | null = null
  animationTime = 0
  animationDuration = 0
  clock = new THREE.Clock()

  // Analysed data
  data: DataFrame[] = [new DataFrame()]
  frame = 0

  gltf: GLTF | null = null

  // axisNeuronSkeleton = AxisNeuronSkeleton
  // unrealSkeleton = UnrealSkeleton
  // rulaLabels = Object.keys(RULA_LABELS)

  // Bone reatrgeting
  options = {
    useFirstFramePosition: false,
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

  mounted (): void {
    this.viewer = this.$refs.viewer as ModelViewer2
    this.createMenu()
    this.createAvatar()
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

  computeData (
    skeleton: THREE.Bone,
    animation: THREE.AnimationMixer,
    duration: number,
    fps = 30
  ): void {
    if (!this.viewer || !this.bvhSkeletonHelper) {
      return
    }

    skeleton.matrixAutoUpdate = false

    const rula = new RULA(this.viewer.scene)
    rula.createRULAMarkers(this.bvhSkeletonHelper)

    for (let frame = 1; frame <= duration * fps; frame++) {
      animation.update((frame * duration) / fps)
      skeleton.updateMatrix()
      this.data.push(
        new DataFrame({
          rula: rula.compute()
        })
      )
      console.log('Compute...')
    }
    skeleton.matrixAutoUpdate = true
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
        // gltf.scene.children[0].position.set(0, 0, 0)
        gltf.scene.children[0].scale.set(0.01, 0.01, 0.01)

        this.gltf = gltf
        this.mixer = new THREE.AnimationMixer(gltf.scene)

        // Loop on all hierarchy
        const bones: THREE.Bone[] = []
        let skeletonHelper: THREE.SkeletonHelper | null = null
        gltf.scene.traverse(child => {
          // Set material for all meshes
          if (child instanceof THREE.Mesh) {
            child.material = material
          }

          // Get all bones
          if (child instanceof THREE.Bone) {
            bones.push(child)

            // Create skeleton helper on root bone
            if (child.name === 'pelvis') {
              skeletonHelper = new THREE.SkeletonHelper(child)
              const skeletonMaterial = skeletonHelper.material as THREE.LineBasicMaterial
              skeletonMaterial.linewidth = 3
              skeletonMaterial.color = new THREE.Color(0x000000)
              skeletonHelper.visible = true
              viewer.scene.add(skeletonHelper)
            }
          }
        })

        // Create skeleton from bone list
        // if (!skeletonHelper) return
        // ;(skeletonHelper as SkeletonHelper).skeleton = new THREE.Skeleton(bones)
      })
      .catch(e => console.error('Cannot load GLTF', e))
  }

  retargetBVH (result: BVH, model: THREE.SkinnedMesh): THREE.AnimationClip {
    // *Special Note* SkeletonUtils.retargetClip seems to output an animationClip
    // with more frames (time arrays) than necessary and a reduced duration.
    // I'm supplying fps and modifying input clip duration to fix that

    /* get fps from first track. */
    const clip = result.clip
    const skeleton = result.skeleton

    // Set skeleton for GLTF
    if (!model.skeleton) {
      model.traverse(child => {
        const skeleton = (child as THREE.SkinnedMesh).skeleton
        if (skeleton) {
          model.skeleton = skeleton
        }
      })
    }

    const fps = 1 / clip.tracks[0].times[1] || 1
    clip.duration += 1 / fps
    this.options.fps = fps

    const utils = (SkeletonUtils as unknown) as SkeletonUtilsModule

    console.log({
      target: model.skeleton.bones.map(b => b.name),
      source: skeleton.bones.map(b => b.name),
      clip
    })
    const newClip = utils.retargetClip(
      model,
      result.skeleton,
      clip,
      this.options
    )

    /* can dispose of bvhLoader skeleton */
    // skeleton.dispose()

    /* THREE.SkinnedMesh.pose() to reset the model */
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
    if (!this.mixer) return

    // Load BVH
    const bvh = this.viewer.loadBVHFromContent(content)

    const scene = this.gltf.scene as THREE.Object3D
    const model = scene as THREE.SkinnedMesh

    // Setup animation
    const newClip = this.retargetBVH(bvh, model)
    this.animationDuration = bvh.clip.duration
    this.animationTime = 0
    this.mixer
      .clipAction(newClip)
      .setLoop(THREE.LoopRepeat, Infinity)
      .setEffectiveWeight(1.0)
      .play()

    this.viewer.update = () => this.update()
  }

  update (): void {
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
