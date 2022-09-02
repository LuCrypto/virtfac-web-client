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
    <!-- <v-container fluid style="height: 100%; max-height: 100% overflow-y-auto">
      <v-layout min-width="iconSize"> -->
    <!-- Profile list -->
    <v-list max-height="600px" class="overflow-y-auto">
      <v-card
        class="ma-2"
        :key="indexProfile"
        v-for="(profile, indexProfile) in profiles"
        color="green"
        elevation="5"
        @click="sendUnreal(profile)"
      >
        <v-col>
          <v-img height="50px" :src="profile.picture"> </v-img>
          <v-sheet
            height="15"
            :color="`#${profile.color.toString(16).padStart(6, '0')}`"
          >
          </v-sheet>
        </v-col>
        <v-col>
          <v-card-title class="pt-2">
            {{ profile.name }}
          </v-card-title>
          <v-card-subtitle>
            <v-chip-group>
              <v-chip
                :key="indexTag"
                v-for="(tag, indexTag) in profile.parsedTags"
                class="mr-2 overflow-y-auto"
              >
                {{ tag }}
              </v-chip>
            </v-chip-group>
          </v-card-subtitle>
          <v-card-text>
            {{ profile.formatedCreationDate }}, assets number :
            {{ profile.assetsNumber }}, id : {{ profile.id }}, owner :
            {{ profile.idUserOwner }}, profil id :
            {{ profile.idProfile }}
          </v-card-text>
        </v-col>
        <v-card-actions class="flex-wrap">
          <v-container fluid class="pa-0">
            <v-col class="pa-0">
              <v-row no-gutters justify="space-between" class="pt-3 flex-wrap">
                <v-btn @click="deleteObjet(scene, $event)" icon>
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
import { APIAsset } from '@/utils/models'
import Vue from 'vue'
import Component from 'vue-class-component'
import CardProfile from '@/utils/cardmodel'
import Unreal from '@/utils/unreal'

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
  private name = ''
  private iconUri = ''
  private isMobileView = false
  show = false
  private profiles: CardProfile[] = []

  unreal = Unreal

  mounted (): void {
    this.requeteAPI()
  }

  // Get all profiles of API
  // @arg No arguments required
  requeteAPI (): void {
    let tmpProfiles: CardProfile[] = []
    API.post(
      this,
      '/resources/ergonomio-profiles',
      JSON.stringify({
        select: [],
        where: []
      })
    ).then((response: Response) => {
      tmpProfiles = ((response as unknown) as Array<Partial<CardProfile>>).map(
        (profile: Partial<CardProfile>) => new CardProfile(profile)
      )
      for (let i = 0; i < tmpProfiles.length; i++) {
        this.profiles.push(tmpProfiles[i])
      }
    })
  }

  createProfile (): void {
    console.log('TODO')
  }

  sendUnreal (profile: CardProfile) {
    console.log(profile)
  }
}
</script>
