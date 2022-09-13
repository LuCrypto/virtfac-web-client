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
  width: 25px; /* Set a specific slider handle width */
  height: 25px; /* Slider handle height */
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
  <maximizable-container>
    <!--v-card of -->
    <v-card
      elevation="3"
      height="700"
      class="d-flex flex-row flex-grow-1 pa-0 ma-0"
    >
      <!-- Popup windows-->
      <!--Open avatar profile pop-up-->
      <pop-up ref="avatarManager" width="500px">
        <avatar-manager
          class="d-flex flex-column justify-start;"
          color="blue"
          ref="avatarManagerComponent"
          @close="$refs.avatarManager.close()"
          @fileInput="loadProfile"
        ></avatar-manager>
      </pop-up>
      <input
        ref="playerDataUpload"
        type="file"
        hidden
        @change="onPlayerDataUpload"
      />
      <!--Save avatar pop-up-->
      <pop-up ref="avatarInfo">
        <avatar-info
          ref="avatarInfoComponent"
          @save="addProfileAPI"
          @close="$refs.avatarInfo.close()"
        ></avatar-info>
      </pop-up>

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
                <div class="slidecontainer mb-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    v-model="morphItem.value"
                    class="slider"
                    id="myRange"
                    @input="updateMorph()"
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
                v-for="(playerDataItem, itemIndex) in playerData.values"
                :key="itemIndex"
              >
                <v-text-field
                  :label="playerDataItem.name"
                  :placeholder="playerDataItem.name"
                  v-model="playerDataItem.length"
                  :value="playerDataItem.length"
                  type="number"
                  class="mr-2"
                >
                </v-text-field>
              </div>
            </v-row>
            <v-row class="flex-grow-1 justify-center">
              <v-btn
                color="primary"
                class="black--text"
                @click="loadPlayerData()"
              >
                Load Data (XML/JSon)
              </v-btn>
            </v-row>
          </v-col>
        </v-row>
        <!-- Hair and beard custom colorization -->
        <v-row
          class="ma-3 flex-grow-0 align-center justify-center"
          v-if="mainMenu.selected === 2 || mainMenu.selected === 3"
        >
          <v-slide-group show-arrows center-active> </v-slide-group>
          <v-slide-item
            v-for="(childMenu, childIndex) in colorMenu.items"
            :key="childIndex"
            v-slot="{ toggle }"
          >
            <v-btn
              :color="
                childMenu.type === 'COLOR'
                  ? '#' + childMenu.value.toString(16)
                  : 'primary'
              "
              class="mx-2 black--text"
              fab
              :class="colorMenu.selected === childIndex ? 'selected' : ''"
              @click="toggle((colorMenu.selected = childIndex)), updateColor()"
            >
            </v-btn>
          </v-slide-item>
        </v-row>
        <!--Row list of bodypart modifiers -->
        <v-row class="ma-3 flex-grow-0 align-center justify-center">
          <v-slide-group show-arrows center-active>
            <v-slide-item
              v-for="(childMenu, childIndex) in mainMenu.items[
                mainMenu.selected
              ].items"
              :key="childIndex"
              v-slot="{ toggle }"
            >
              <v-btn
                :color="
                  childMenu.type === 'COLOR' ? '#' + childMenu.value : 'primary'
                "
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
        <v-row class="ma-1 flex-grow-0 align-center justify-center">
          <v-slide-group show-arrows center-active>
            <v-slide-item
              v-for="(parentMenu, parentIndex) in mainMenu.items"
              :key="parentIndex"
              v-slot="{ toggle }"
            >
              <v-btn
                class="ma-1 black--text"
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
  </maximizable-container>
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
import { APIProfile } from '@/utils/models'

// Usefull for PopUp windows
import SelectPopUp from '@/components/popup/SelectPopUp.vue'
import InputFieldPopUp from '@/components/popup/InputFieldPopUp.vue'
import ModelViewer2 from '@/components/ModelViewer2.vue'

import * as THREE from 'three'

import {
  BufferGeometry,
  Group,
  Loader,
  Material,
  Matrix4,
  Mesh,
  MeshLambertMaterial,
  Object3D,
  Vector3
} from 'three'
import { Session } from '@/utils/session'
import PopUp from './PopUp.vue'
import AvatarInfo from '@/components/AvatarInfo.vue'
import MaximizableContainer from './MaximizableContainer.vue'

import API from '@/utils/api'

import OpenFile from '@/components/OpenFile.vue'
import AvatarManager from '@/components/AvatarManager.vue'

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
    items: MenuItem2[] = [],
    selected = 0
  ) {
    this.type = type
    this.items = items
    this.value = value
    this.selected = selected
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
  length = 0
  constructor (name: string, length: number) {
    this.length = length
    this.name = name
  }
}

class PlayerData {
  name: string
  values: PlayerDataItem[] = []
  constructor (name = '', values: PlayerDataItem[] = []) {
    this.name = name
    this.values = values
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
    AvatarInfo,
    MaximizableContainer,
    OpenFile,
    AvatarManager
  }
})

// @vuese
// @group COMPONENTS
// Component to manage the Avatar customization elements.
// A user can create a new Avatar, or modify an existing one.
// Several customization parameters are available, for the aesthetic
// and the morph customs.
export default class ErgonomIOAvatarsContainer extends Vue {
  value = 0
  selectedMenuItem = -1
  menuItemList: MenuItem[] = []
  customItemList: MenuItem[] = []
  menuCollapse = true
  selectedBodyPart = 1
  skinColors = [
    14786179,
    14259835,
    13733491,
    13207147,
    12680803,
    11628115,
    9394499,
    8343099,
    7226419,
    6109739,
    5058340
  ]

  hairColors = [
    15000013,
    9996416,
    14656325,
    5453850,
    10381104,
    13468460,
    7810846,
    1511697
  ]

  beardNamesArray = [
    'Beard_000.fbx',
    'Beard_001.fbx',
    'Beard_002.fbx',
    'Beard_003.fbx',
    'Beard_004.fbx'
  ]

  hairNamesArray = [
    'Hair_000.fbx',
    'Hair_001.fbx',
    'Hair_002.fbx',
    'Hair_003.fbx',
    'Hair_004.fbx',
    'Hair_005.fbx',
    'Hair_006.fbx',
    'Hair_007.fbx',
    'Hair_008.fbx',
    'Hair_009.fbx',
    'Hair_010.fbx',
    'Hair_011.fbx',
    'Hair_012.fbx',
    'Hair_013.fbx',
    'Hair_014.fbx',
    'Hair_015.fbx',
    'Hair_016.fbx',
    'Hair_017.fbx',
    'Hair_018.fbx',
    'Hair_019.fbx',
    'Hair_020.fbx',
    'Hair_021.fbx',
    'Hair_022.fbx',
    'Hair_023.fbx',
    'Hair_024.fbx',
    'Hair_025.fbx',
    'Hair_026.fbx',
    'Hair_027.fbx',
    'Hair_028.fbx',
    'Hair_029.fbx',
    'Hair_030.fbx',
    'Hair_031.fbx',
    'Hair_032.fbx',
    'Hair_033.fbx',
    'Hair_034.fbx',
    'Hair_035.fbx',
    'Hair_036.fbx',
    'Hair_037.fbx',
    'Hair_038.fbx',
    'Hair_039.fbx',
    'Hair_040.fbx',
    'Hair_041.fbx',
    'Hair_042.fbx',
    'Hair_043.fbx',
    'Hair_044.fbx',
    'Hair_045.fbx',
    'Hair_046.fbx',
    'Hair_047.fbx',
    'Hair_049.fbx',
    'Hair_050.fbx',
    'Hair_051.fbx',
    'Hair_052.fbx',
    'Hair_053.fbx',
    'Hair_054.fbx'
  ]

  private dataNames = [
    'hipWidth',
    'body',
    'neck',
    'head',
    'shoulderWidth',
    'upperArm',
    'foreArm',
    'palm',
    'upperLeg',
    'lowerLeg',
    'footLength',
    'heelHeight'
  ]

  pantsNamesArray = ['pants.fbx']
  shirtNamesArray = ['shirt.fbx']
  shoesNamesArray = ['shoes.fbx']
  headNamesArray = ['skin.fbx']

  primaryColor = this.$vuetify.theme.themes.dark.primary

  hairColor = this.hairColors[0]
  beardColor = this.hairColors[0]
  skinColor = this.skinColors[0]

  profiles: APIProfile[] = []

  hairMesh: Group = new Group()
  beardMesh: Group = new Group()
  shirtMesh: Group = new Group()
  pantsMesh: Group = new Group()
  shoesMesh: Group = new Group()
  headMesh: Group = new Group()

  playerData: PlayerData = new PlayerData()

  morphList: MorphItem[] = []
  // var mainMenu needs to be init with an items before calling createItems
  mainMenu: MenuItem2 = new MenuItem2('', 'ICON', [new MenuItem2()])
  colorMenu: MenuItem2 = new MenuItem2('', 'ICON', [new MenuItem2()])

  /* Materials arrays */
  materialArray: MeshLambertMaterial[] = []
  hairMaterial: MeshLambertMaterial = new MeshLambertMaterial({
    color: this.hairColor
  })

  beardMaterial: MeshLambertMaterial = new MeshLambertMaterial({
    color: this.beardColor
  })

  /* ThreeJS view */
  viewer: ModelViewer2 | null = null
  inputField: InputFieldPopUp | null = null
  openFilePopUp: OpenFile | null = null
  avatarManager: AvatarManager = this.$refs.avatarManager as AvatarManager

  inputFile (): void {
    const input = this.$refs.inputFile as HTMLInputElement
    input.value = ''
    input.click()
  }

  onFileUpload (file: File): void {
    console.log('yo')
  }

  // @vuese
  // Load the mesh from string file in threeJS viewer
  // @arg filePath to the bodyPart mesh fbx
  loadBodyPart (filePath: string, callback: (fbx: THREE.Group) => void): void {
    if (this.viewer == null) return

    this.viewer
      .loadFBXFromPath(filePath)
      .then(fbx => {
        fbx.position.set(0, 0, 0)
        fbx.scale.set(0.01, 0.01, 0.01)

        callback(fbx)
      })
      .catch(e => console.error('Cannot load FBX', e))
  }

  // @vuese
  // Called when switching between light and dark mode
  // @arg No arguments required
  updateTheme (): void {
    if (this.viewer !== null) {
      if (Session.getTheme() === 'dark') {
        this.viewer.setFogActive(true, 0x1e1e1e)
        this.viewer.setGrid(100, 1, 0x555555, 0x1e1e1e, 0x363636)
      } else {
        this.viewer.setFogActive(true, 0xffffff)
        this.viewer.setGrid(100, 1, 0xaaaaaa, 0xfefefe, 0x363636)
      }
    }
  }

  // @vuese
  // Used to load a mesh part of the Avatar
  // @arg filePath to the bodyPart mesh fbx, and the id of the body section (head, hairs, hand etc...)
  loadMesh (filePath: string, id: number): void {
    this.loadBodyPart(filePath, (fbx: THREE.Group) => this.changeMesh(fbx, id))
  }

  // @vuese
  // Called by loadMesh function with a callback once the mesh is loaded
  // Replace the previous body mesh section by the new one
  // @arg filePath to the bodyPart mesh fbx, and the id of the body section (head, hairs, hand etc...)
  changeMesh (fbx: THREE.Group, id: number): void {
    fbx.castShadow = true
    var mesh
    switch (id) {
      case 1: {
        /* Shirt */
        this.shirtMesh.clear()
        this.shirtMesh = fbx
        mesh = this.shirtMesh.children[0] as THREE.Mesh
        mesh.material = this.materialArray
        break
      }
      case 2: {
        /* Hair */
        this.hairMesh.clear()
        this.hairMesh = fbx
        mesh = this.hairMesh.children[0] as THREE.Mesh
        mesh.material = this.hairMaterial
        break
      }
      case 3: {
        /* Beard */
        this.beardMesh.clear()
        this.beardMesh = fbx
        mesh = this.beardMesh.children[0] as THREE.Mesh
        mesh.material = this.beardMaterial
        break
      }
      case 4: {
        /* Pants */
        this.pantsMesh.clear()
        this.pantsMesh = fbx
        mesh = this.pantsMesh.children[0] as THREE.Mesh
        mesh.material = this.materialArray
        break
      }
      case 5: {
        /* Shoes */
        this.shoesMesh.clear()
        this.shoesMesh = fbx
        mesh = this.shoesMesh.children[0] as THREE.Mesh
        mesh.material = this.materialArray
        break
      }
      case 6: {
        /* Hand */
        this.headMesh.clear()
        this.headMesh = fbx
        mesh = this.headMesh.children[0] as THREE.Mesh
        mesh.material = [
          this.materialArray[0],
          this.materialArray[0],
          this.materialArray[1]
        ]
        mesh = this.headMesh.children[1] as THREE.Mesh
        mesh.material = this.materialArray[1]

        break
      }
      case 7: {
        /* Hat */
        break
      }
      default: {
        break
      }
    }
    this.updateMorph()
  }

  // @vuese
  // Used to load a mesh part of the Avatar
  // @arg filePath to the bodyPart mesh fbx, and the id of the body section (head, hairs, hand etc...)
  updateMorph (): void {
    var meshArray: THREE.Mesh[] = []
    meshArray.push(this.shirtMesh.children[0] as THREE.Mesh)
    meshArray.push(this.pantsMesh.children[0] as THREE.Mesh)
    meshArray.push(this.headMesh.children[0] as THREE.Mesh)
    meshArray.push(this.shoesMesh.children[0] as THREE.Mesh)

    for (var morphItem of this.morphList) {
      for (var meshItem of meshArray) {
        if (
          meshItem.isMesh &&
          meshItem.morphTargetInfluences &&
          meshItem.morphTargetDictionary
        ) {
          meshItem.morphTargetInfluences[
            meshItem.morphTargetDictionary[morphItem.name]
          ] = morphItem.value / 100
        }
      }
    }
  }

  // @vuese
  // Used to generate menu icons elements for avatar customisation
  // @arg No arguments needed
  createItems (): void {
    var skinArray = []
    for (let i = 0; i < this.skinColors.length; i++) {
      skinArray.push(new MenuItem2(this.skinColors[i].toString(16), 'COLOR'))
    }
    var hairMenuArray = []
    hairMenuArray.push(new MenuItem2('$vuetify.icons.hair', 'ICON'))
    for (let i = 0; i < this.hairNamesArray.length; i++) {
      hairMenuArray.push(new MenuItem2('$vuetify.icons.hair', 'ICON'))
    }
    var beardMenuArray = []
    beardMenuArray.push(new MenuItem2('$vuetify.icons.beard', 'ICON'))

    for (let i = 0; i < this.beardNamesArray.length; i++) {
      beardMenuArray.push(new MenuItem2('$vuetify.icons.beard', 'ICON'))
    }
    var pantsMenuArray = []
    for (let i = 0; i < this.pantsNamesArray.length; i++) {
      pantsMenuArray.push(new MenuItem2('$vuetify.icons.pants', 'ICON'))
    }
    var shirtMenuArray = []
    for (let i = 0; i < this.shirtNamesArray.length; i++) {
      shirtMenuArray.push(new MenuItem2('$vuetify.icons.shirt', 'ICON'))
    }
    var headMenuArray = []
    for (let i = 0; i < this.headNamesArray.length; i++) {
      headMenuArray.push(new MenuItem2('$vuetify.icons.hand', 'ICON'))
    }
    var shoesMenuArray = []
    for (let i = 0; i < this.shoesNamesArray.length; i++) {
      shoesMenuArray.push(new MenuItem2('$vuetify.icons.shoes', 'ICON'))
    }
    var hairColorArray = []
    for (let i = 0; i < this.hairColors.length; i++) {
      hairColorArray.push(
        new MenuItem2(this.hairColors[i].toString(16), 'COLOR')
      )
    }

    this.mainMenu = new MenuItem2('', 'ICON', [
      new MenuItem2('$vuetify.icons.colours', 'ICON', skinArray),
      new MenuItem2('$vuetify.icons.shirt', 'ICON', shirtMenuArray),
      new MenuItem2('$vuetify.icons.hair', 'ICON', hairMenuArray, 1),
      new MenuItem2('$vuetify.icons.beard', 'ICON', beardMenuArray, 1),
      new MenuItem2('$vuetify.icons.pants', 'ICON', pantsMenuArray),
      new MenuItem2('$vuetify.icons.shoes', 'ICON', shoesMenuArray),
      new MenuItem2('$vuetify.icons.hand', 'ICON', headMenuArray),
      new MenuItem2('$vuetify.icons.hat', 'ICON', [
        new MenuItem2('mdi-cellphone-off'),
        new MenuItem2('mdi-sim-alert'),
        new MenuItem2('mdi-airplane-plus')
      ]),
      new MenuItem2('$vuetify.icons.settings', 'ICON', []),
      new MenuItem2('$vuetify.icons.morph', 'ICON', [])
    ])

    this.colorMenu = new MenuItem2('', 'ICON', hairColorArray)
  }

  // @vuese
  // Usefull function to initialize morph data and their values
  // @arg No arguments needed
  initMorphData (): void {
    this.morphList.push(new MorphItem('female_face', 0))
    this.morphList.push(new MorphItem('arm_size', 0))
    this.morphList.push(new MorphItem('breast_size', 0))
    this.morphList.push(new MorphItem('belly_size', 0))
    this.morphList.push(new MorphItem('lower_back_size', 0))
    this.morphList.push(new MorphItem('hip_size', 0))
    this.morphList.push(new MorphItem('buttock_size', 0))
    this.morphList.push(new MorphItem('leg_size', 0))
  }

  // @vuese
  // Usefull function to initialize player data
  // @arg No arguments needed
  initPlayerData (): PlayerData {
    var playerDataItemList: PlayerDataItem[] = []
    playerDataItemList.push(new PlayerDataItem('hipWidth', 23.82))
    playerDataItemList.push(new PlayerDataItem('body', 61.08))
    playerDataItemList.push(new PlayerDataItem('neck', 9.91))
    playerDataItemList.push(new PlayerDataItem('head', 18.16))
    playerDataItemList.push(new PlayerDataItem('shoulderWidth', 34.94))
    playerDataItemList.push(new PlayerDataItem('upperArm', 23.29))
    playerDataItemList.push(new PlayerDataItem('foreArm ', 25.41))
    playerDataItemList.push(new PlayerDataItem('palm', 18.53))
    playerDataItemList.push(new PlayerDataItem('upperLeg', 44.02))
    playerDataItemList.push(new PlayerDataItem('lowerLeg', 41.83))
    playerDataItemList.push(new PlayerDataItem('footLength', 25.94))
    playerDataItemList.push(new PlayerDataItem('heelHeight', 7.98))

    return new PlayerData('Player', playerDataItemList)
  }

  // @vuese
  // Usefull function to initialize materials
  // @arg No arguments needed
  initMaterials (): void {
    // TODO : For now, each body part need to have the same material array, but this will change with several mat for shirt or pants
    // eyes Material
    this.materialArray.push(
      new MeshLambertMaterial({
        // color: 0xffffff,
        map: new THREE.TextureLoader().load('./Avatars/Textures/grayscale.jpg')
      })
    )
    // Skin Material
    this.materialArray.push(
      new MeshLambertMaterial({
        color: 13207147
      })
    )
    // Shirt Material
    this.materialArray.push(
      new MeshLambertMaterial({
        color: 0x0047ab
      })
    )
    // Pants Material
    this.materialArray.push(
      new MeshLambertMaterial({
        color: 0x8b4513
      })
    )
    // Teeth Material
    this.materialArray.push(
      new MeshLambertMaterial({
        color: 0xffffff
      })
    )
    // Shoes Material
    this.materialArray.push(
      new MeshLambertMaterial({
        color: 0x161616
      })
    )
  }

  loadPlayerData (): void {
    (this.$refs.playerDataUpload as HTMLElement).click()
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
    this.viewer.setFogActive(true)

    this.openFilePopUp = this.$refs.openFilePopUp as OpenFile
    this.avatarManager = this.$refs.avatarManager as AvatarManager

    this.updateTheme()
    this.initMaterials()
    this.createMenu()
    this.createItems()
    this.loadMesh('./Avatars/Shirt/shirt.fbx', 1)
    this.loadMesh('./Avatars/Hairs/Hair_000.fbx', 2)
    this.loadMesh('./Avatars/Beard/Beard_000.fbx', 3)
    this.loadMesh('./Avatars/Pants/pants.fbx', 4)
    this.loadMesh('./Avatars/Shoes/shoes.fbx', 5)
    this.loadMesh('./Avatars/Head/skin.fbx', 6)

    this.initMorphData()
    this.playerData = this.initPlayerData()
  }

  // @vuese
  // Update function called when selecting a main menu element
  // @arg No arguments needed
  update (): void {
    console.log('Main menu is updated.')
    // Skin Menu :  Change the skin body color by the new selected one
    if (this.mainMenu.selected === 0) {
      this.skinColor = this.skinColors[this.mainMenu.items[0].selected]
      this.materialArray[1].color.setHex(this.skinColor)
    }
    if (this.mainMenu.selected === 1) {
      this.loadMesh(
        './Avatars/Shirt/' +
          this.shirtNamesArray[this.mainMenu.items[1].selected],
        1
      )
    }
    // Hair Menu : Change the hair Mesh depending of selected component : Special case 0 : no hair
    if (this.mainMenu.selected === 2) {
      if (this.mainMenu.items[2].selected === 0) {
        this.hairMesh.clear()
      } else {
        this.loadMesh(
          './Avatars/Hairs/' +
            this.hairNamesArray[this.mainMenu.items[2].selected - 1],
          2
        )
      }
    }
    // Beard Menu : Change the beard Mesh depending of selected component : Special case 0 : no beard
    if (this.mainMenu.selected === 3) {
      if (this.mainMenu.items[3].selected === 0) {
        this.beardMesh.clear()
      } else {
        this.loadMesh(
          './Avatars/Beard/' +
            this.beardNamesArray[this.mainMenu.items[3].selected - 1],
          3
        )
      }
    }
    // Pants Menu
    if (this.mainMenu.selected === 4) {
      this.loadMesh(
        './Avatars/Pants/' +
          this.pantsNamesArray[this.mainMenu.items[4].selected],
        4
      )
    }
    // Shoes Menu
    if (this.mainMenu.selected === 5) {
      this.loadMesh(
        './Avatars/Shoes/' +
          this.shoesNamesArray[this.mainMenu.items[5].selected],
        5
      )
    }
    // Head Menu
    if (this.mainMenu.selected === 6) {
      this.loadMesh(
        './Avatars/Head/' +
          this.headNamesArray[this.mainMenu.items[6].selected],
        6
      )
    }
  }

  // @vuese
  // Update function called when selecting a color menu element
  // @arg No arguments needed
  updateColor (): void {
    if (this.mainMenu.selected === 2) {
      this.hairColor = this.hairColors[this.colorMenu.selected]
      this.hairMaterial.color.setHex(this.hairColor)
    } else if (this.mainMenu.selected === 3) {
      this.beardColor = this.hairColors[this.colorMenu.selected]
      this.beardMaterial.color.setHex(this.beardColor)
    }
  }

  // @vuese
  // Used to set up management menu
  // @arg No arguments needed
  createMenu (): void {
    this.menuItemList.push(
      new MenuItem('Profiles Manager', 'mdi-account', () => {
        (this.$refs.avatarManager as PopUp).open()
      })
    )
    this.menuItemList.push(
      new MenuItem('Save Avatar Profile', 'mdi-content-save-edit', () => {
        (this.$refs.avatarInfo as PopUp).open()
      })
    )
  }

  setDataField (data: PlayerData, fieldName: string): void {
    // To format the fieldname in right format
    const lowerFieldName = fieldName.toLowerCase()
    const length = data.values.find(element => element.name === lowerFieldName)
      ?.length
    if (length !== undefined) {
      const id = this.playerData.values.findIndex(object => {
        return object.name === fieldName
      })
      if (id !== -1) {
        this.playerData.values[id].length = length
      }
    }
  }

  private setPlayerData (data: PlayerData): void {
    // Take rid of json file format values
    data.values.forEach(element => {
      element.name = element.name.replace(' ', '').toLowerCase()
    })
    this.dataNames.forEach(element => {
      this.setDataField(data, element)
    })
  }

  // @vuese
  // Used to read xml or JSON file and automatically set up the player data values
  // @arg No arguments needed
  onPlayerDataUpload (event: InputEvent): void {
    if (event != null && event.target != null) {
      const f: File = ((event.target as HTMLInputElement).files as FileList)[0]
      if (f != null) {
        if (f.name.split('.').pop() === 'json') {
          console.log('JSon uploaded')
          const fr = new FileReader()
          fr.onload = () => {
            this.setPlayerData(JSON.parse(fr.result as string))
          }
          fr.readAsText(f, 'utf8')
        } else if (f.name.split('.').pop() === 'xml') {
          console.log('XML uploaded')
          const fr = new FileReader()
          fr.onload = () => {
            this.setPlayerData(this.parseXMLData(fr.result as string))
          }
          fr.readAsText(f, 'utf8')
        }
      }
    }
  }

  // @vuese
  // Update function called when selecting a main menu element
  // @arg No arguments needed
  private parseXMLData (xml: string): PlayerData {
    const a = [
      ...xml.matchAll(/(name="[\w\s]*"(\s)*length="[0-9]*(.[0-9]*)")+/gm)
    ].map(i => {
      const result = (i.shift() || '').split('"')
      return { name: result[1], length: parseFloat(result[3]) }
    })
    const b = xml.match(/(name="[\w\s]*">)+/gm)
    // if no matching result found, return default playerData
    if (!b) return this.initPlayerData()
    const tmp = (b.shift() || '').split('"')
    return { name: tmp[1], values: a }
  }

  saveProfile (): APIProfile {
    var profile = new APIProfile()
    profile.name = this.playerData.name
    // Hair Mesh Case
    if (this.mainMenu.items[2].selected === 0) {
      profile.hairName = 'NULL'
    } else {
      profile.hairName = this.hairNamesArray[
        this.mainMenu.items[2].selected - 1
      ].split('.fbx')[0]
    }
    profile.shirtName = this.shirtNamesArray[
      this.mainMenu.items[4].selected
    ].split('.fbx')[0]
    profile.shirtName = profile.shirtName.split('fbx')[0]

    profile.pantName = this.pantsNamesArray[
      this.mainMenu.items[4].selected
    ].split('.fbx')[0]

    profile.headName = this.headNamesArray[
      this.mainMenu.items[6].selected
    ].split('.fbx')[0]
    profile.shoesName = this.shoesNamesArray[
      this.mainMenu.items[5].selected
    ].split('.fbx')[0]
    // Beard mesh case
    if (this.mainMenu.items[3].selected === 0) {
      profile.beardName = 'NULL'
    } else {
      profile.beardName = this.beardNamesArray[
        this.mainMenu.items[3].selected - 1
      ].split('.fbx')[0]
    }

    // PlayerData values
    profile.hipWidth = this.playerData.values[0].length
    profile.body = this.playerData.values[1].length
    profile.neck = this.playerData.values[2].length
    profile.head = this.playerData.values[3].length
    profile.shoulderWidth = this.playerData.values[4].length
    profile.upperArm = this.playerData.values[5].length
    profile.foreArm = this.playerData.values[6].length
    profile.palm = this.playerData.values[7].length
    profile.upperLeg = this.playerData.values[8].length
    profile.lowerLeg = this.playerData.values[9].length
    profile.footLength = this.playerData.values[10].length
    profile.heelHeight = this.playerData.values[11].length

    // Morph values
    profile.femaleFace = this.morphList[0].value / 100
    profile.armSize = this.morphList[1].value / 100
    profile.breastSize = this.morphList[2].value / 100
    profile.bellySize = this.morphList[3].value / 100
    profile.lowerBackSize = this.morphList[4].value / 100
    profile.hipSize = this.morphList[5].value / 100
    profile.buttockSize = this.morphList[6].value / 100
    profile.legSize = this.morphList[7].value / 100

    profile.skinColor = this.skinColors[this.mainMenu.items[0].selected]
    profile.hairColor = this.hairColor
    profile.beardColor = this.beardColor

    return profile
  }

  // @vuese
  // Used to load Profile sent by AvatarManager PopUp
  // @arg profile loaded
  loadProfile (profile: APIProfile): void {
    console.log(JSON.stringify(profile))
    // Set avatar meshes
    this.loadMesh('./Avatars/Shirt/'.concat(profile.shirtName, '.fbx'), 1)
    this.mainMenu.items[1].selected = this.shirtNamesArray.findIndex(element =>
      element.includes(profile.shirtName)
    )
    // Case when hair are undefined (bold)
    if (profile.hairName === 'NULL') {
      this.hairMesh.clear()
      this.mainMenu.items[2].selected = 0
    } else {
      this.loadMesh('./Avatars/Hairs/'.concat(profile.hairName, '.fbx'), 2)
      this.mainMenu.items[2].selected =
        this.hairNamesArray.findIndex(element =>
          element.includes(profile.hairName)
        ) + 1
    }
    if (profile.beardName === 'NULL') {
      this.beardMesh.clear()
      this.mainMenu.items[3].selected = 0
    } else {
      this.loadMesh('./Avatars/Beard/'.concat(profile.beardName, '.fbx'), 3)
      this.mainMenu.items[3].selected =
        this.beardNamesArray.findIndex(element =>
          element.includes(profile.beardName)
        ) + 1
    }
    this.loadMesh('./Avatars/Pants/'.concat(profile.pantName, '.fbx'), 4)
    this.mainMenu.items[4].selected = this.pantsNamesArray.findIndex(element =>
      element.includes(profile.pantName)
    )
    this.loadMesh('./Avatars/Shoes/'.concat(profile.shoesName, '.fbx'), 5)
    this.mainMenu.items[5].selected = this.shoesNamesArray.findIndex(element =>
      element.includes(profile.shoesName)
    )
    this.loadMesh('./Avatars/Head/'.concat(profile.headName, '.fbx'), 6)
    this.mainMenu.items[6].selected = this.headNamesArray.findIndex(element =>
      element.includes(profile.headName)
    )

    // Set matetrials colors
    this.hairColor = profile.hairColor
    this.hairMaterial.color.setHex(this.hairColor)
    this.beardColor = profile.beardColor
    this.beardMaterial.color.setHex(this.beardColor)
    this.skinColor = profile.skinColor
    this.mainMenu.items[0].selected = this.skinColors.findIndex(
      element => element === profile.skinColor
    )
    this.materialArray[1].color.setHex(this.skinColor)

    // Set morphs values
    this.morphList[0].value = profile.femaleFace * 100
    this.morphList[1].value = profile.armSize * 100
    this.morphList[2].value = profile.breastSize * 100
    this.morphList[3].value = profile.bellySize * 100
    this.morphList[4].value = profile.lowerBackSize * 100
    this.morphList[5].value = profile.hipSize * 100
    this.morphList[6].value = profile.buttockSize * 100
    this.morphList[7].value = profile.legSize * 100

    // Set player Data
    this.playerData.values[0].length = profile.hipWidth
    this.playerData.values[1].length = profile.body
    this.playerData.values[2].length = profile.neck
    this.playerData.values[3].length = profile.head
    this.playerData.values[4].length = profile.shoulderWidth
    this.playerData.values[5].length = profile.upperArm
    this.playerData.values[6].length = profile.foreArm
    this.playerData.values[7].length = profile.palm
    this.playerData.values[8].length = profile.upperLeg
    this.playerData.values[9].length = profile.lowerLeg
    this.playerData.values[10].length = profile.footLength
    this.playerData.values[11].length = profile.heelHeight
  }

  // Create api request to add a new Profile
  // @arg No arguments required
  addProfileAPI (tags: Array<string>): void {
    const profile = this.saveProfile()
    API.put(this, '/resources/ergonomio-profiles', JSON.stringify(profile))
      .then((response: Response) => {
        this.$root.$emit('bottom-message', 'Profile added with success')
      })
      .catch(() => {
        console.error('Fail to add resource :', profile)
      })
  }
}
</script>
