<template>
  <v-container fluid>
    <!-- Titre -->
    <v-container fluid class="text-h3 text-center py-8">
      Collaborative sessions
    </v-container>
    <!-- Milieu de page : les différentes cartes de scènes -->
    <template>
      <v-row dense class="pa-2">
        <v-alert dense color="primary" class="flex-grow-1">
          <v-row align="center">
            <v-col class="grow black--text">
              <v-icon left color="black">mdi-account-supervisor-circle</v-icon>
              Current session : None
            </v-col>
            <v-col class="shrink">
              <v-btn @click="leaveSession">Leave session</v-btn>
            </v-col>
          </v-row>
        </v-alert>
      </v-row>

      <!-- Les différentes rooms -->
      <v-card
        class="overflow-y-auto d-flex flex-row flex-wrap"
        width="100%"
        height="660"
      >
        <v-card
          :key="indexRoom"
          v-for="(room, indexRoom) in rooms"
          height="455"
          width="30%"
          class="ma-3"
          elevation="5"
          v-on:click="selectionRoom(room)"
        >
          <!-- <v-img height="270" :src="room.picture"> </v-img> -->
          <!-- <v-sheet height="4" :color="`#${room.color.toString(16)}`"> </v-sheet> -->
          <v-card-title> {{ room.nom }} </v-card-title>
          <v-card-subtitle>
            <!-- <v-chip
              :key="indexTag"
              v-for="(tag, indexTag) in room.tags"
              class="mr-2 overflow-y-auto"
            >
              {{ tag }}
            </v-chip> -->
          </v-card-subtitle>
          <v-card-text>
            {{ room.dateCreation }}, nombre de joueurs : {{ room.joueurs }}
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              v-on:click="() => joinSession(room)"
              class="primary black--text"
              large
              elevation="2"
            >
              Join
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-card>
    </template>
    <!-- Les différents boutons -->
    <v-layout justify-center class="py-4">
      <v-flex class="flex-grow-0 mx-5">
        <!-- Permet de créer une room -->
        <v-btn
          v-on:click="createSession"
          class="primary black--text"
          large
          elevation="2"
        >
          Create new session
        </v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import API from '@/utils/api'
import Unreal from '@/utils/unreal'
import { RouterMode } from 'vue-router'

class Room {
  nom = 'room'
  nomScene = 'nom_scene'
  host = ''
  action = 'quitterRoom'
  dateCreation = '20/04/2022'
  joueurs = 1

  constructor (params: Partial<Room>) {
    Object.assign(this, params)
  }
}

// Message venant d'Unreal
class messageUnreal {
  message = ''
  dataRoom: Room = new Room({})

  constructor (params: Partial<Room>) {
    Object.assign(this, params)
  }
}

@Component({
  name: 'ErgonomIORooms'
})
// @vuese
// @group VIEWS
export default class ErgonomIORooms extends Vue {
  rooms: Room[] = []

  // Begin
  mounted (): void {
    // this.rooms.push(new Room({ nom: 'test' }))
    // this.requeteAPI()

    Unreal.callback.$on('unreal-message', (data: messageUnreal) => {
      this.$root.$emit('bottom-message', `Unreal : ${JSON.stringify(data)}`)

      switch (data.message) {
        case 'creer':
          this.rooms.push(data.dataRoom)
          break
        case 'refresh':
          this.refreshRoomActuelle()
          break
        case 'quitterRoomActuelle':
          this.quitRoomCurrent()
          break
        default:
      }
    })
  }

  // Permet de selection une room
  selectionRoom (room: Room): void {
    var objectAsset = {
      action: 'selectionnerRoom',
      ma_room: room
    }

    var object = {
      menu: 'room',
      objet: objectAsset
    }

    Unreal.send(object)
  }

  // Permet de créer une room dans le lobby
  refreshRoomLobby (rooms: Room[]): void {
    this.rooms = rooms
  }

  refreshRoomActuelle () {
    this.rooms = []
  }

  // Permet de quitter la room actuelle
  quitRoomCurrent () {
    this.rooms = []
  }

  // Permet de créer une room
  createSession (): void {
    console.log('Creer room')
    this.sendUnreal(new Room({ action: 'creerRoom' }))
  }

  // Permet de rejoindre une room
  joinSession (): void {
    console.log('Rejoindre room')

    var objectAsset = {
      action: 'rejoindreRoom'
    }

    var object = {
      menu: 'room',
      objet: objectAsset
    }

    Unreal.send(object)
  }

  // Permet de quitter une room
  leaveSession (): void {
    console.log('Quitter room')
    this.sendUnreal(new Room({ action: 'quitterRoom' }))
  }

  // Permet d'envoyer un message à l'instance unreal
  sendUnreal (room: Room): void {
    console.log('asset.nom : ', room.nom)

    var objectAsset = {
      action: room.action
    }

    var object = {
      menu: 'room',
      objet: objectAsset
    }

    Unreal.send(object)
  }
}
</script>
