<template>
  <v-card>
    <!-- Title -->
    <v-toolbar color="primary" flat>
      <v-toolbar-title class="black--text">
        <v-icon left v-text="'mdi-account'"></v-icon>
        Profiles Manager
      </v-toolbar-title>
    </v-toolbar>

    <!-- Popup content -->

    <!-- Profile list -->
    <v-list max-height="600px" class="overflow-y-auto">
      <v-card
        class="ma-2"
        :key="indexProfile"
        v-for="(profile, indexProfile) in profiles"
        elevation="5"
        @click="loadProfile(indexProfile)"
      >
        <v-row class="ma-1">
          <!-- Profile Picture -->
          <v-col cols="4">
            <v-img
              class="ma-auto"
              max-height="100px"
              max-width="100px"
              :src="profile.picture"
            >
            </v-img>
          </v-col>
          <!-- Profile Informations -->
          <v-col cols="8">
            <v-row>
              <v-card-title class="pt-2 font-weight-bold">
                {{ profile.name }}
              </v-card-title>
              <v-card-subtitle>
                <v-chip-group>
                  <v-chip
                    :key="indexTag"
                    v-for="(tag, indexTag) in JSON.parse(profile.tags || '[]')"
                    class="overflow-y-auto"
                  >
                    {{ tag }}
                  </v-chip>
                </v-chip-group>
              </v-card-subtitle>
              <v-card-text class="ma-0">
                Creation date :
                {{ new Date(profile.creationDate).toLocaleString() }}<br />
                Last Modification :
                {{ new Date(profile.modificationDate).toLocaleString() }}
              </v-card-text>
            </v-row>
            <v-card-actions class="flex-wrap">
              <v-container fluid class="pa-0">
                <v-col class="pa-0">
                  <v-row
                    no-gutters
                    justify="space-between"
                    class="pt-3 flex-wrap"
                  >
                    <v-btn @click="deleteProfile(profile)" icon>
                      <v-icon v-text="'mdi-delete'"></v-icon>
                    </v-btn>
                    <v-btn
                      @click="editNameScene(profile, $event)"
                      class="ma-2"
                      fab
                      dark
                      small
                    >
                      <v-icon>mdi-pen</v-icon>
                    </v-btn>
                  </v-row>
                </v-col>
              </v-container>
            </v-card-actions>
          </v-col>
        </v-row>
      </v-card>
    </v-list>
    <v-btn
      @click="createProfile"
      class="primary black--text flex-grow-1"
      large
      elevation="2"
      >New Profile</v-btn
    >
    <!-- </v-layout>
    </v-container> -->
  </v-card>
</template>

<script lang="ts">
import API from '@/utils/api'
import Vue from 'vue'
import Component from 'vue-class-component'
import { APIProfile } from '@/utils/models'
import Unreal from '@/utils/unreal'

class BoneTransform {
  boneName = ''
  translation: number[] = [0, 0, 0]
  rotation: number[] = [0, 0, 0]
  scale: number[] = [0, 0, 0]
}
class RULAFrame {
  shoulderL = 0
  shoulderR = 0
  elbowL = 0
  elbowR = 0
  spine = 0
  neck = 0
  handL = 0
  handR = 0
  rulaScore = 0
  skeletPose: BoneTransform[] = []
}

class UnrealSend {
  action = ''
  data = null

  constructor (action: string, data: any) {
    this.action = action
    this.data = data
  }
}

@Component({
  name: 'AvatarManager',
  computed: {
    iconSize () {
      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
          return 256
        case 'sm':
          return 256
        case 'md':
          return 256
        case 'lg':
          return 512
        case 'xl':
          return 512
      }
    }
  }
})
// @vuese
// @group COMPONENTS
// Display all information of an asset
export default class AvatarManager extends Vue {
  private isMobileView = false
  show = false
  private profiles: APIProfile[] = []

  unreal = Unreal

  boneNames = [
    'pelvis',
    'spine_01',
    'spine_02',
    'spine_03',
    'clavicle_l',
    'upperarm_l',
    'lowerarm_l',
    'hand_l',
    'index_01_l',
    'index_02_l',
    'index_03_l',
    'middle_01_l',
    'middle_02_l',
    'middle_03_l',
    'pinky_01_l',
    'pinky_02_l',
    'pinky_03_l',
    'ring_01_l',
    'ring_02_l',
    'ring_03_l',
    'thumb_01_l',
    'thumb_02_l',
    'thumb_03_l',
    'clavicle_r',
    'upperarm_r',
    'lowerarm_r',
    'hand_r',
    'index_01_r',
    'index_02_r',
    'index_03_r',
    'middle_01_r',
    'middle_02_r',
    'middle_03_r',
    'pinky_01_r',
    'pinky_02_r',
    'pinky_03_r',
    'ring_01_r',
    'ring_02_r',
    'ring_03_r',
    'thumb_01_r',
    'thumb_02_r',
    'thumb_03_r',
    'neck_01',
    'head',
    'eye_l',
    'eyebrow_l',
    'eyelid_l',
    'eye_r',
    'eyebrow_r',
    'eyelid_r',
    'jaw',
    'nose',
    'toe_l',
    'foot_l',
    'ball_l',
    'thigl_l',
    'calf_l',
    'toe_r',
    'foot_r',
    'ball_r',
    'thigl_r',
    'calf_r'
  ]

  mounted (): void {
    this.getAPIProfiles()
  }

  // @vuese
  // Get all profiles from API
  // @arg No arguments required
  getAPIProfiles (): void {
    this.profiles = []
    API.post(
      this,
      '/resources/ergonomio-profiles',
      JSON.stringify({
        select: [],
        where: []
      })
    ).then((response: Response) => {
      const fileList = (response as unknown) as APIProfile[]
      this.profiles = []
      fileList.forEach((fileInfo: Partial<APIProfile>) => {
        if (fileInfo.name && fileInfo.creationDate) {
          const profileItem = new APIProfile(fileInfo)
          this.profiles.push(profileItem)
        }
      })
    })
  }

  createProfile (): void {
    console.log('TODO')
  }

  // @vuese
  // Load profile in Unreal application or Avatar Manager
  // @arg indexProfile : id of chosen profile
  loadProfile (indexProfile: number): void {
    console.log(this.profiles[indexProfile])
    if (Unreal.check()) {
      Unreal.send(new UnrealSend('profile', this.profiles[indexProfile]))
    } else {
      this.$emit('fileInput', this.profiles[indexProfile])
      this.$emit('close')
    }
  }

  // @vuese
  // Delete profile from API
  // @arg profile : profile to delete
  deleteProfile (profile: APIProfile): void {
    console.log(profile)
    API.delete(this, `/resources/ergonomio-profiles/${profile.id}`, '')
      .then((response: Response) => {
        this.$root.$emit(
          'bottom-message',
          'Profile ' + profile.name + ' removed with success'
        )
        this.getAPIProfiles()
      })
      .catch(() => {
        console.error('Fail delete profile :', profile.name)
      })
  }

  intervalID = setInterval(() => {
    this.sendRandTransform()
  }, 1000)

  sendRandTransform (): void {
    if (Unreal.check()) {
      const boneFrame: RULAFrame = new RULAFrame()
      const skeleton: BoneTransform[] = []
      this.boneNames.forEach(element => {
        const translation = [0, 0, 0]
        const rotation = [
          Math.random() * 360,
          Math.random() * 360,
          Math.random() * 360
        ]
        const bone = new BoneTransform()
        bone.boneName = element
        bone.translation = translation
        bone.rotation = rotation
        skeleton.push(bone)
      })
      boneFrame.skeletPose = skeleton
      boneFrame.shoulderL = Math.random()
      boneFrame.shoulderR = Math.random()
      boneFrame.elbowL = Math.random()
      boneFrame.elbowR = Math.random()
      boneFrame.spine = Math.random()
      boneFrame.neck = Math.random()
      boneFrame.handL = Math.random()
      boneFrame.handR = Math.random()
      boneFrame.rulaScore = Math.random() * 7

      const object = { action: 'rula', data: boneFrame }

      Unreal.send(object)
    }
  }
}
</script>
