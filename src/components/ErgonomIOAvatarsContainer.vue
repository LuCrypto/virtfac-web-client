<style scoped>
.selected {
  box-shadow: inset 0 0 0 3px white;
}

.slidecontainer {
  width: 100%; /* Width of the outside container */
}

/* The slider itself */
.slider {
  -webkit-appearance: none; /* Override default CSS styles */
  appearance: none;
  width: 100%; /* Full-width */
  height: 2px; /* Specified height */
  background: #d3d3d3; /* Grey background */
  outline: none; /* Remove outline */
  opacity: 1; /* Set transparency (for mouse-over effects on hover) */
  -webkit-transition: 0.2s; /* 0.2 seconds transition on hover */
  transition: opacity 0.2s;
  border-radius: 5px;
}

/* Mouse-over effects */
.slider:hover {
  opacity: 1; /* Fully shown on mouse-over */
}

/* The slider handle (use -webkit- (Chrome, Opera, Safari, Edge) and -moz- (Firefox) to override default look) */
.slider::-webkit-slider-thumb {
  -webkit-appearance: none; /* Override default look */
  appearance: none;
  width: 30px; /* Set a specific slider handle width */
  height: 30px; /* Slider handle height */
  background: #f5a406; /* Green background */
  cursor: pointer; /* Cursor on hover */
  border-radius: 50%;
}

.slider::-moz-range-thumb {
  width: 25px; /* Set a specific slider handle width */
  height: 25px; /* Slider handle height */
  background: #04aa6d; /* Green background */
  cursor: pointer; /* Cursor on hover */
}
</style>

<template>
  <!--v-card of component-->
  <v-card elevation="3" height="700" class="d-flex flex-row pa-0 ma-0">
    <!-- Popup windows-->
    <!--Open avatar profile pop-up-->
    <pop-up ref="openFilePopUp">
      <open-avatar
        @close="$refs.openFilePopUp.close()"
        application="ERGONOM_IO"
        accept=".obj, .fbx, .stl, .wrl, .glb"
        :uploadPipeline="onFileUpload"
        :singleSelect="true"
        :openFile="true"
        @fileInput="onFileInput"
      ></open-avatar>
    </pop-up>

    <!--Save avatar pop-up-->
    <pop-up ref="avatarInfo">
      <avatar-info
        ref="avatarInfoComponent"
        @close="$refs.avatarInfo.close()"
      ></avatar-info>
    </pop-up>
    <!--TODO : Complete Pop-Up list-->

    <!--Left Menu Labels-->
    <v-navigation-drawer stateless permanent :mini-variant="menuCollapse">
      <v-list
        nav
        dense
        class="d-flex flex-column justify-start;"
        style="height: 100%"
      >
        <!--item list of navigation page-->
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

    <!--Main Components-->
    <v-col class="pa-0 d-flex flex-column">
      <!--Three.js View-->
      <v-row no-gutters class="pa-0 d-flex flex-row">
        <v-col class="pa-0 d-flex flex-column">
          <v-row class="ma-0 flex-grow-1">
            <model-viewer-2 :displayFog="true" ref="viewer"></model-viewer-2>
          </v-row>
        </v-col>
        <!-- Morph Custom item, visible when entering Morph menu -->
        <v-col
          width="100px"
          class="ma-3 flex-grow-1 d-flex flex-column justify-center"
          v-if="mainMenu.selected === 8"
        >
          <v-row class="flex-grow-1 justify-center"> Customization </v-row>
          <v-container class="flex-grow-1 justify-center overflow-y-auto">
            <v-row
              v-for="(morphItem, morphIndex) in morphList"
              :key="morphIndex"
            >
              {{ morphItem.name }}
              <div class="slidecontainer">
                <input
                  type="range"
                  min="0"
                  max="100"
                  v-model="morphItem.value"
                  class="slider"
                  id="myRange"
                  @input="updateSlide(morphItem.value)"
                />
              </div>
            </v-row>
          </v-container>
        </v-col>

        <!-- PlayerData set item, wisible when entering Settings menu -->
        <v-col class="ma-3 d-flex flex-column" v-if="mainMenu.selected === 9">
          <v-row class="justify-center"> Player Data Settings </v-row>
          <v-row class="flex-grow-1 justify-center">
            <v-text-field
              label="Name"
              :placeholder="this.playerData.name"
              v-model="playerData.name"
              class="mr-5 ml-5"
              dense
              :value="this.playerData.name"
            ></v-text-field>
          </v-row>
          <v-row class="flex-grow-1 justify-center">
            <div
              v-for="(playerDataItem, itemIndex) in playerData.items"
              :key="itemIndex"
            >
              <v-text-field
                :label="playerDataItem.name"
                :placeholder="playerDataItem.name"
                v-model="playerDataItem.value"
                :value="playerDataItem.value"
                type="number"
                class="mr-2"
              >
              </v-text-field>
            </div>
          </v-row>
          <v-btn color="primary" @click="loadPlayerData()">
            Load Data (XML/JSon)
          </v-btn>
        </v-col>
      </v-row>
      <!--Row list of bodypart modifiers -->
      <v-row class="ma-3 flex-grow-0 align-center justify-center">
        <v-slide-group show-arrows center-active>
          <v-slide-item
            v-for="(childMenu, childIndex) in mainMenu.items[mainMenu.selected]
              .items"
            :key="childIndex"
            v-slot="{ toggle }"
          >
            <v-btn
              :color="childMenu.type === 'COLOR' ? childMenu.value : 'primary'"
              class="mx-2 black--text"
              fab
              :class="
                mainMenu.items[mainMenu.selected].selected === childIndex
                  ? 'selected'
                  : ''
              "
              @click="
                toggle(
                  (mainMenu.items[mainMenu.selected].selected = childIndex)
                ),
                  update()
              "
            >
              <v-icon color="red">
                {{ childMenu.type === 'ICON' ? childMenu.value : '' }}
              </v-icon>
            </v-btn>
          </v-slide-item>
        </v-slide-group>
      </v-row>

      <!--Row of buttons to switch between bodyPart list-->
      <v-row class="ma-3 flex-grow-0 align-center justify-center">
        <v-slide-group show-arrows center-active>
          <v-slide-item
            v-for="(parentMenu, parentIndex) in mainMenu.items"
            :key="parentIndex"
            v-slot="{ toggle }"
          >
            <v-btn
              class="mx-2 black--text"
              fab
              :color="
                parentMenu.type === 'COLOR' ? parentMenu.value : 'primary'
              "
              :class="mainMenu.selected === parentIndex ? 'selected' : ''"
              @click="
                toggle((mainMenu.selected = parentIndex))
                update()
              "
            >
              <v-icon size="30" class="icon">
                {{ parentMenu.type === 'ICON' ? parentMenu.value : '' }}
              </v-icon>
            </v-btn>
          </v-slide-item>
        </v-slide-group>
      </v-row>
    </v-col>

    <!--Unknown-->
    <select-pop-up ref="selectPopUp"></select-pop-up>
    <input-field-pop-up ref="inputFieldPopUp"></input-field-pop-up>
  </v-card>
</template>

<style scoped>
* >>> .icon * {
  fill: #101010;
}
</style>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import ActionContainer from '@/components/ActionContainer.vue'
import { APIAsset } from '@/utils/models'

// Usefull for PopUp windows
import SelectPopUp from '@/components/popup/SelectPopUp.vue'
import InputFieldPopUp from '@/components/popup/InputFieldPopUp.vue'
import ModelViewer2 from '@/components/ModelViewer2.vue'

import * as THREE from 'three'

import {
  BufferGeometry,
  Group,
  Loader,
  Matrix4,
  Mesh,
  MeshLambertMaterial,
  Object3D,
  Vector3
} from 'three'
import { Session } from '@/utils/session'
import PopUp from './PopUp.vue'
import OpenAsset from '@/components/OpenAsset.vue'
import OpenAvatar from '@/components/OpenAvatar.vue'
import AssetInfo from '@/components/AssetInfo.vue'
import AvatarInfo from '@/components/AvatarInfo.vue'
import API from '@/utils/api'

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

type MenuItemType = 'ICON' | 'COLOR'

class MenuItem2 {
  selected = 0
  type: MenuItemType = 'ICON'
  value = ''
  items: MenuItem2[] = []

  constructor (
    value = '',
    type: MenuItemType = 'ICON',
    items: MenuItem2[] = []
  ) {
    this.type = type
    this.items = items
    this.value = value
  }
}

class MorphItem {
  name: string
  value = 0
  constructor (name: string, value: number) {
    this.value = value
    this.name = name
  }
}

class PlayerDataItem {
  name: string
  value = 0
  constructor (name: string, value: number) {
    this.value = value
    this.name = name
  }
}

class PlayerData {
  name: string
  items: PlayerDataItem[] = []
  constructor (name = '', items: PlayerDataItem[] = []) {
    this.name = name
    this.items = items
  }
}

class CustomItem {
  text: string
  icon: string
  action: () => void
  color: string
  constructor (
    text: string,
    icon: string,
    action: () => void,
    color: string | null
  ) {
    this.text = text
    this.icon = icon
    this.action = action
    this.color = color || 'primary'
  }
}

@Component({
  name: 'ErgonomioAvatarsContainer',
  components: {
    ActionContainer,
    SelectPopUp,
    InputFieldPopUp,
    ModelViewer2,
    PopUp,
    OpenAsset,
    OpenAvatar,
    AssetInfo,
    AvatarInfo
  }
})
// @vuese
// @group COMPONENTS
// Component to manage the Avatar customization elements.
// A user can create a new Avatar, or modify an existing one.
// Several customization parameters are available, for the aesthetic
// and the morph customs.
export default class ErgonomIOAvatarsContainer extends Vue {
  defaultMaterial = new MeshLambertMaterial({
    color: 0xaaaaaa
  })

  value = 0
  selectedMenuItem = -1
  menuItemList: MenuItem[] = []
  customItemList: MenuItem[] = []
  menuCollapse = true
  itemArray: [any[]] = [[]]
  selectedBodyPart = 1
  skinColors = [
    '#e19e83',
    '#d9967b',
    '#d18e73',
    '#c9866b',
    '#c17e63',
    '#b16e53',
    '#8f5943',
    '#7f4e3b',
    '#6e4433',
    '#5d3a2b',
    '#4d2f24'
  ]

  hairMesh: Group | null = null
  beardMesh: Group | null = null

  playerData: PlayerData = new PlayerData()

  morphList: MorphItem[] = []
  // var mainMenu needs to be init with an items before calling createItems
  mainMenu: MenuItem2 = new MenuItem2('', 'ICON', [new MenuItem2()])

  currentSkinId = 0

  showPlayerDataSettings = false

  /* ThreeJS view */
  viewer: ModelViewer2 | null = null

  inputField: InputFieldPopUp | null = null

  Hello (): void {
    console.log('Hello')
  }

  inputFile (): void {
    const input = this.$refs.inputFile as HTMLInputElement
    input.value = ''
    input.click()
  }

  onFileUpload (file: File): void {
    console.log('yo')
  }

  initAvatar (): void {
    if (this.viewer == null) return
    const viewer = this.viewer
    const material = new THREE.MeshStandardMaterial({
      color: 0x683e00, // Burned orange
      metalness: 0,
      roughness: 1
    })
    this.viewer
      .loadGLTFFromPath('./avatar.gltf')
      .then((gltf) => {
        gltf.scene.children[0].position.set(0, 0, 0)
        gltf.scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = material
          }

          if (child instanceof THREE.Bone && child.name === 'mixamorig1Hips') {
            const helper = new THREE.SkeletonHelper(child)
            const mat = helper.material as THREE.LineBasicMaterial
            mat.linewidth = 3
            helper.visible = true
            viewer.scene.add(helper)
          }
        })
      })
      .catch((e) => console.error('Cannot load GLTF', e))
  }

  loadBodyPart (filePath: string, callback: (fbx: THREE.Group) => void): void {
    if (this.viewer == null) return

    this.viewer
      .loadFBXFromPath(filePath)
      .then((fbx) => {
        fbx.position.set(0, 0, 0)
        fbx.scale.set(0.01, 0.01, 0.01)

        callback(fbx)
      })
      .catch((e) => console.error('Cannot load FBX', e))
  }

  updateTheme (): void {
    if (this.viewer !== null) {
      if (Session.getTheme() === 'dark') {
        this.viewer.setFogActive(false, 0x1e1e1e)
        this.viewer.setGrid(100, 100, 0x555555, 0x1e1e1e, 0xeeeeee)
      } else {
        this.viewer.setFogActive(false, 0xfefefe)
        this.viewer.setGrid(100, 100, 0xaaaaaa, 0xfefefe, 0x111111)
      }
    }
  }

  onFileInput (files: APIAsset[]): void {
    console.log('Hello')
  }

  loadBeard (filePath: string) {
    if (this.beardMesh != null) this.beardMesh.clear()
    this.loadBodyPart(filePath, (fbx: THREE.Group) => this.changeBeard(fbx))
  }

  changeBeard (fbx: THREE.Group) {
    if (this.beardMesh !== null) this.beardMesh.clear()
    this.beardMesh = fbx
  }

  changeShoes () {
    console.log('TODO: Change Beard')
  }

  changeShirt () {
    console.log('TODO: Change Beard')
  }

  changePants () {
    console.log('TODO: Change Beard')
  }

  changeHat () {
    console.log('TODO: Change Beard')
  }

  changeHand () {
    console.log('TODO: Change Beard')
  }

  createItemArray (): void {
    // SkinColors array
    var skinArray = []
    for (let i = 0; i < this.skinColors.length; i++) {
      var myItem = new CustomItem(
        'color',
        '',
        () => {
          this.changeSkin(this.skinColors[i])
        },
        this.skinColors[i]
      )
      skinArray.push(myItem)
    }
    this.itemArray.push(skinArray)

    // Body parts array, "empty" for now
    for (let i = 0; i < this.customItemList.length; i++) {
      var myArray = []
      for (let j = 0; j < i + 1; j++) {
        myArray.push(j)
      }
      this.itemArray.push(myArray)
    }
  }

  changeSkin (color: string): void {
    console.log('New skin color hex:', color)
  }

  updateSlide (value: number): void {
    console.log(value)
  }

  createItems (): void {
    var skinArray = []
    for (let i = 0; i < this.skinColors.length; i++) {
      skinArray.push(new MenuItem2(this.skinColors[i], 'COLOR'))
    }
    this.mainMenu = new MenuItem2('', 'ICON', [
      new MenuItem2('$vuetify.icons.colours', 'ICON', skinArray),
      new MenuItem2('$vuetify.icons.shirt', 'ICON', [
        new MenuItem2('mdi-cellphone-off'),
        new MenuItem2('mdi-sim-alert'),
        new MenuItem2('mdi-airplane-plus')
      ]),
      new MenuItem2('$vuetify.icons.hair', 'ICON', [
        new MenuItem2('mdi-car-settings'),
        new MenuItem2('mdi-file-import-outline'),
        new MenuItem2('mdi-pliers'),
        new MenuItem2('mdi-shark-fin'),
        new MenuItem2('mdi-card-account-details-star-outline')
      ]),
      new MenuItem2('$vuetify.icons.beard', 'ICON', [
        new MenuItem2('mdi-folder'),
        new MenuItem2('mdi-moped-electric'),
        new MenuItem2('mdi-checkbox-blank-circle'),
        new MenuItem2('mdi-checkerboard'),
        new MenuItem2('mdi-solid'),
        new MenuItem2('mdi-checkbox-marked'),
        new MenuItem2('mdi-glass-wine'),
        new MenuItem2('mdi-tag-arrow-left'),
        new MenuItem2('mdi-arrow-right-top-bold')
      ]),
      new MenuItem2('$vuetify.icons.pants', 'ICON', [
        new MenuItem2('mdi-cellphone-off'),
        new MenuItem2('mdi-sim-alert'),
        new MenuItem2('mdi-airplane-plus')
      ]),
      new MenuItem2('$vuetify.icons.shoes', 'ICON', [
        new MenuItem2('mdi-car-settings'),
        new MenuItem2('mdi-file-import-outline'),
        new MenuItem2('mdi-pliers'),
        new MenuItem2('mdi-shark-fin'),
        new MenuItem2('mdi-card-account-details-star-outline')
      ]),
      new MenuItem2('$vuetify.icons.hand', 'ICON', [
        new MenuItem2('mdi-folder'),
        new MenuItem2('mdi-moped-electric'),
        new MenuItem2('mdi-checkbox-blank-circle'),
        new MenuItem2('mdi-checkerboard'),
        new MenuItem2('mdi-solid'),
        new MenuItem2('mdi-checkbox-marked'),
        new MenuItem2('mdi-glass-wine'),
        new MenuItem2('mdi-tag-arrow-left'),
        new MenuItem2('mdi-arrow-right-top-bold'),
        new MenuItem2('mdi-folder'),
        new MenuItem2('mdi-moped-electric'),
        new MenuItem2('mdi-checkbox-blank-circle'),
        new MenuItem2('mdi-checkerboard'),
        new MenuItem2('mdi-solid'),
        new MenuItem2('mdi-checkbox-marked'),
        new MenuItem2('mdi-glass-wine'),
        new MenuItem2('mdi-tag-arrow-left'),
        new MenuItem2('mdi-arrow-right-top-bold')
      ]),
      new MenuItem2('$vuetify.icons.hat', 'ICON', [
        new MenuItem2('mdi-cellphone-off'),
        new MenuItem2('mdi-sim-alert'),
        new MenuItem2('mdi-airplane-plus')
      ]),
      new MenuItem2('$vuetify.icons.settings', 'ICON', []),
      new MenuItem2('$vuetify.icons.morph', 'ICON', [])
    ])

    console.log(this.mainMenu.selected)
    console.log(this.mainMenu.items.length)
    console.log('hello')
  }

  initMorphData (): void {
    this.morphList.push(new MorphItem('female_face', 0))
    this.morphList.push(new MorphItem('eyes_closed', 0))
    this.morphList.push(new MorphItem('mouth_open', 0))
    this.morphList.push(new MorphItem('arm_size', 0))
    this.morphList.push(new MorphItem('breast_size', 0))
    this.morphList.push(new MorphItem('belly_size', 0))
    this.morphList.push(new MorphItem('lower_back_size', 0))
    this.morphList.push(new MorphItem('hip_size', 0))
    this.morphList.push(new MorphItem('buttock_size', 0))
    this.morphList.push(new MorphItem('leg_size', 0))
  }

  initPlayerData (): void {
    var playerDataItemList: PlayerDataItem[] = []
    playerDataItemList.push(new PlayerDataItem('Hip width', 0))
    playerDataItemList.push(new PlayerDataItem('Body', 0))
    playerDataItemList.push(new PlayerDataItem('Neck', 0))
    playerDataItemList.push(new PlayerDataItem('Head', 0))
    playerDataItemList.push(new PlayerDataItem('Shoulder width', 0))
    playerDataItemList.push(new PlayerDataItem('Upper arm', 0))
    playerDataItemList.push(new PlayerDataItem('Forearm ', 0))
    playerDataItemList.push(new PlayerDataItem('Palm', 0))
    playerDataItemList.push(new PlayerDataItem('Upper leg', 0))
    playerDataItemList.push(new PlayerDataItem('Lower leg', 0))
    playerDataItemList.push(new PlayerDataItem('Heel height', 0))

    this.playerData = new PlayerData('Player', playerDataItemList)
  }

  loadPlayerData (): void {
    console.log('TODO : Load Player Data from XML/JSon')
  }

  // @vuese
  // Mounted function
  // @arg No arguments required
  mounted (): void {
    this.inputField = this.$refs.inputFieldPopUp as InputFieldPopUp
    this.$root.$on('changeDarkMode', () => {
      this.updateTheme()
    })

    this.viewer = this.$refs.viewer as ModelViewer2
    this.viewer.setFogActive(false)

    this.createMenu()
    this.createItemArray()
    this.createItems()
    this.loadBeard('./Avatars/Beard/Beard.000.fbx')
    // this.loadBodyPart('./Avatars/Beard/Beard.000.fbx')
    // this.loadBodyPart('./Avatars/Hairs/Hair.000.fbx')
    // this.loadBodyPart('./Avatars/Head/Head.000.fbx')
    // this.loadBodyPart('./Avatars/Shirt/Shirt.000.fbx')
    // this.loadBodyPart('./Avatars/Pants/Pants.000.fbx')
    // this.loadBodyPart('./Avatars/Shoes/Shoes.000.fbx')
    this.initMorphData()
    this.initPlayerData()
  }

  update () {
    console.log('Main menu is updated.')
    if (this.mainMenu.items[3].selected === 0) {
      console.log('First hair selected')
      this.loadBeard('./Avatars/Beard/Beard.000.fbx')
    }
    if (this.mainMenu.items[3].selected === 1) {
      this.loadBeard('./Avatars/Beard/Beard.001.fbx')
    }
  }

  // Used to set up management options
  createMenu (): void {
    this.menuItemList.push(
      new MenuItem('Open Avatar Profile', 'mdi-account', () => {
        (this.$refs.openFilePopUp as PopUp).open()
      })
    )
    this.menuItemList.push(
      new MenuItem('Save Avatar Profile', 'mdi-content-save-edit', () => {
        (this.$refs.avatarInfo as PopUp).open()
      })
    )
    this.menuItemList.push(
      new MenuItem('Set Player Data', 'mdi-axis-arrow', () => {
        this.Hello()
      })
    )
    this.menuItemList.push(
      new MenuItem('Customize Body', 'mdi-axis-arrow', () => {
        this.Hello()
      })
    )
  }
}
</script>
