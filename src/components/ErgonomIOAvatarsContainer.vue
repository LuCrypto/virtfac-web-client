<style scoped>
.selected {
  outline: solid #ff7f00;
}
</style>

<template>
  <!--v-card of component-->
  <v-card elevation="3" height="700px" class="d-flex flex-row pa-0 ma-0">
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
      <!--Three.js render-->
      <v-row no-gutters class="pa-0 d-flex flex-row">
        <v-col class="pa-0 d-flex flex-column">
          <v-row class="ma-0 flex-grow-1">
            <model-viewer-2 :displayFog="true" ref="viewer"></model-viewer-2>
          </v-row>
        </v-col>
        <v-col
          width="100px"
          class="ma-3 flex-grow-1 d-flex flex-column align-center justify-center"
        >
          MorphCustom Sliders
        </v-col>
      </v-row>
      <!--Row list of bodypart modifiers -->
      <v-row class="ma-3 flex-grow-0 align-center justify-center">
        <v-btn
          v-for="(childMenu, childIndex) in mainMenu.items[mainMenu.selected]
            .items"
          :key="childIndex"
          class="mx-2 black--text"
          fab
          :color="childMenu.type === 'COLOR' ? childMenu.value : 'primary'"
          :class="
            mainMenu.items[mainMenu.selected].selected === childIndex
              ? 'selected'
              : ''
          "
          @click="
            mainMenu.items[mainMenu.selected].selected = childIndex
            update()
          "
        >
          <v-icon dark>
            {{ childMenu.type === 'ICON' ? childMenu.value : '' }}
          </v-icon>
        </v-btn>
      </v-row>

      <!--Row of buttons to switch between bodyPart list-->
      <v-row class="ma-3 flex-grow-0 align-center justify-center">
        <v-row no-gutters class="align-center justify-center black--text">
          <v-btn
            v-for="(parentMenu, parentIndex) in mainMenu.items"
            :key="parentIndex"
            class="mx-2 black--text"
            fab
            :color="parentMenu.type === 'COLOR' ? parentMenu.value : 'primary'"
            :class="mainMenu.selected === parentIndex ? 'selected' : ''"
            @click="
              mainMenu.selected = parentIndex
              update()
            "
          >
            <v-icon dark>
              {{ parentMenu.type === 'ICON' ? parentMenu.value : '' }}
            </v-icon>
          </v-btn>
        </v-row>
      </v-row>
    </v-col>

    <!--Unknown-->
    <select-pop-up ref="selectPopUp"></select-pop-up>
    <input-field-pop-up ref="inputFieldPopUp"></input-field-pop-up>
  </v-card>
</template>

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

  createItems (): void {
    var skinArray = []
    for (let i = 0; i < this.skinColors.length; i++) {
      skinArray.push(new MenuItem2(this.skinColors[i], 'COLOR'))
    }
    this.mainMenu = new MenuItem2('', 'ICON', [
      new MenuItem2('skin', 'ICON', skinArray),
      new MenuItem2('shirt', 'ICON', [
        new MenuItem2('mdi-cellphone-off'),
        new MenuItem2('mdi-sim-alert'),
        new MenuItem2('mdi-airplane-plus')
      ]),
      new MenuItem2('hair', 'ICON', [
        new MenuItem2('mdi-car-settings'),
        new MenuItem2('mdi-file-import-outline'),
        new MenuItem2('mdi-pliers'),
        new MenuItem2('mdi-shark-fin'),
        new MenuItem2('mdi-card-account-details-star-outline')
      ]),
      new MenuItem2('beard', 'ICON', [
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
      new MenuItem2('pants', 'ICON', [
        new MenuItem2('mdi-cellphone-off'),
        new MenuItem2('mdi-sim-alert'),
        new MenuItem2('mdi-airplane-plus')
      ]),
      new MenuItem2('shoes', 'ICON', [
        new MenuItem2('mdi-car-settings'),
        new MenuItem2('mdi-file-import-outline'),
        new MenuItem2('mdi-pliers'),
        new MenuItem2('mdi-shark-fin'),
        new MenuItem2('mdi-card-account-details-star-outline')
      ]),
      new MenuItem2('hand', 'ICON', [
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
      new MenuItem2('hat', 'ICON', [
        new MenuItem2('mdi-cellphone-off'),
        new MenuItem2('mdi-sim-alert'),
        new MenuItem2('mdi-airplane-plus')
      ]),
      new MenuItem2('settings', 'ICON', [
        new MenuItem2('mdi-car-settings'),
        new MenuItem2('mdi-file-import-outline'),
        new MenuItem2('mdi-pliers'),
        new MenuItem2('mdi-shark-fin'),
        new MenuItem2('mdi-card-account-details-star-outline')
      ])
    ])

    console.log(this.mainMenu.selected)
    console.log(this.mainMenu.items.length)
    console.log('hello')
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
    this.createCustom()
    this.createItemArray()
    this.createItems()
    this.initAvatar()
    console.log('hello')
  }

  update () {
    console.log('Main menu is updated.')
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

  // Used to generate icons comportment for body selection
  createCustom (): void {
    this.customItemList.push(
      new MenuItem('skin', 'mdi-tshirt-crew', () => {
        this.selectedBodyPart = 1
      })
    )
    this.customItemList.push(
      new MenuItem('shirt', 'mdi-tshirt-crew', () => {
        this.selectedBodyPart = 2
      })
    )
    this.customItemList.push(
      new MenuItem('hair', 'mdi-tshirt-crew', () => {
        this.selectedBodyPart = 3
      })
    )
    this.customItemList.push(
      new MenuItem('beard', 'mdi-tshirt-crew', () => {
        this.selectedBodyPart = 4
      })
    )
    this.customItemList.push(
      new MenuItem('pants', 'mdi-tshirt-crew', () => {
        this.selectedBodyPart = 5
      })
    )
    this.customItemList.push(
      new MenuItem('shoes', 'mdi-shoe-formal', () => {
        this.selectedBodyPart = 6
      })
    )
    this.customItemList.push(
      new MenuItem('hand', 'mdi-shoe-formal', () => {
        this.selectedBodyPart = 7
      })
    )
    this.customItemList.push(
      new MenuItem('hat', 'mdi-shoe-formal', () => {
        this.selectedBodyPart = 8
      })
    )
    this.customItemList.push(
      new MenuItem('settings', 'mdi-shoe-formal', () => {
        this.showPlayerDataSettings = true
        this.selectedBodyPart = 0
      })
    )
  }
}
</script>
