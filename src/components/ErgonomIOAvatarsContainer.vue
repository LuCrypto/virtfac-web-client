<template>
  <!--v-card de la fenêtre-->
  <v-card elevation="3" height="700px" class="d-flex flex-row pa-0 ma-0">
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
        <v-col class="pa-0 d-flex flex-column"></v-col>
      </v-row>
      <!--clothes list defined by Customize icons (list of haire, pants etc...)-->
      <v-row class="ma-3 flex-grow-0 align-center justify-center">
        <v-btn
          class="mx-2"
          fab
          dark
          color="primary"
          v-for="(menuItem, i) in menuItemList"
          :key="i"
          @click.stop="menuItem.action"
        >
          <v-icon v-text="menuItem.icon" class="black--text"></v-icon> </v-btn
      ></v-row>
      <!--Customize icons-->
      <v-row class="ma-3 flex-grow-0 align-center justify-center">
        <v-container class="flex-grow-0 ma-0 pa-0" fluid>
          <v-row no-gutters class="align-center justify-center black--text">
            <v-btn
              class="mx-2"
              fab
              dark
              color="primary"
              v-for="(customItem, i) in customItemList"
              :key="i"
              @click.stop="customItem.action"
            >
              <v-icon v-text="customItem.icon" class="black--text"></v-icon>
            </v-btn> </v-row
        ></v-container>
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

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { VRMLLoader } from 'three/examples/jsm/loaders/VRMLLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import { VTKLoader } from 'three/examples/jsm/loaders/VTKLoader'
import { Rhino3dmLoader } from 'three/examples/jsm/loaders/3DMLoader'
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader'
import { TDSLoader } from 'three/examples/jsm/loaders/TDSLoader'

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

@Component({
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
export default class ErgonomIOAvatarsContainer extends Vue {
  defaultMaterial = new MeshLambertMaterial({
    color: 0xaaaaaa
  })

  selectedMenuItem = -1
  menuItemList: MenuItem[] = []
  customItemList: MenuItem[] = []
  menuCollapse = false
  viewer: ModelViewer2 | null = null

  inputField: InputFieldPopUp | null = null
  selectedBodyPart = 'body'

  Hello (): void {
    console.log('Hello')
  }

  inputFile (): void {
    const input = this.$refs.inputFile as HTMLInputElement
    input.value = ''
    input.click()
  }

  onFileUploaded (event: Event): void {
    console.log('Hello')
  }

  onFileUpload (file: File): void {
    console.log('yo')
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
      new MenuItem('body', 'mdi-tshirt-crew', () => {
        this.selectedBodyPart = 'body'
      })
    )
    this.customItemList.push(
      new MenuItem('hair', 'mdi-tshirt-crew', () => {
        this.selectedBodyPart = 'hair'
      })
    )
    this.customItemList.push(
      new MenuItem('pants', 'mdi-tshirt-crew', () => {
        this.selectedBodyPart = 'pants'
      })
    )
    this.customItemList.push(
      new MenuItem('shoes', 'mdi-shoe-formal', () => {
        this.selectedBodyPart = 'shoes'
      })
    )
  }

  // createItemArray (): void {
  //   for (let i = 0; i < this.customItemList.length; i++) {
  //     var tmpArray = []
  //     for (let j = 0; j < i; j++) {
  //       tmpArray.push()
  //     }
  //     this.itemArray.push(tmpArray)
  //   }
  // }

  mounted (): void {
    this.inputField = this.$refs.inputFieldPopUp as InputFieldPopUp
    this.$root.$on('changeDarkMode', () => {
      this.updateTheme()
    })
    this.createMenu()
    this.createCustom()
  }
}
</script>
