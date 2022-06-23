<template>
  <v-container fluid>
    <!-- Titre -->
    <v-container v-if="!this.fullpage" fluid class="text-h3 text-center py-8">
      Collaborative sessions
    </v-container>
    <!-- Milieu de page : les différentes cartes de scènes -->
    <template>
      <!-- Les différentes rooms -->
      <v-row
        no-gutters
        class="overflow-y-auto flex-grow-1 ma-4 rounded-lg"
        style="max-height: 800px;background-color: rgb(30,30,30);"
      >
        <v-row no-gutters dense class="pa-2">
          <v-alert
            dense
            :rounded="unrealContext.check() ? 'xl' : 'md'"
            color="primary"
            class="flex-grow-1"
          >
            <v-row align="center">
              <v-col class="grow black--text">
                <v-icon left color="black"
                  >mdi-account-supervisor-circle</v-icon
                >
                Current session : None
              </v-col>
              <v-col class="shrink">
                <v-btn @click="leaveSession">Leave session</v-btn>
              </v-col>
            </v-row>
          </v-alert>
        </v-row>
        <v-card
          class="overflow-y-auto d-flex flex-row flex-wrap"
          width="100%"
          height="600"
          :rounded="unrealContext.check() ? 'xl' : 'md'"
        >
          <!-- v-on:click="selectionRoom(room)" -->
          <v-card
            :key="indexRoom"
            v-for="(room, indexRoom) in rooms"
            height="455"
            width="30%"
            class="ma-3"
            elevation="5"
            :rounded="unrealContext.check() ? 'xl' : 'md'"
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
              {{ room.host }}, scene : {{ room.nomScene }}
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                v-on:click="() => joinSession1(room)"
                class="primary black--text"
                large
                elevation="2"
              >
                Join
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-card>

        <!-- Les différents boutons -->
        <v-layout justify-center class="py-4">
          <v-flex class="flex-grow-0 mx-5">
            <!-- Permet de créer une room -->
            <v-btn
              v-on:click="createSession1"
              class="primary black--text"
              large
              elevation="2"
            >
              Create new session
            </v-btn>
          </v-flex>
          <v-flex class="flex-grow-0 mx-5">
            <!-- Permet de créer une room -->
            <v-select
              class="black--text"
              label="Scene sélectionnée"
              v-model="maSceneSelection"
              :items="this.scenes.map(item => item.name)"
              dense
            >
            </v-select>
          </v-flex>
        </v-layout>
      </v-row>
    </template>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import API from '@/utils/api'
import Unreal from '@/utils/unreal'
import VueRouter, { RouterMode } from 'vue-router'
import { imageAsset, haguenauImageAsset } from '@/utils/defaultData'

class CardModel {
  // Initialisation
  name = ''
  picture = imageAsset
  tags = '[]'
  id = 0
  color = 0
  assetsNumber = 0
  creationDate = 0
  data = '{}'
  idProject = 0
  idUserOwner = 0
  modificationDate = 0
  spawnX = 0
  spawnY = 0
  spawnZ = 0

  parsedData: any = null
  parsedTags: string[] = []

  // Permet de récupérer une date en format string
  get formatedCreationDate (): string {
    return new Date(this.creationDate).toLocaleString()
  }

  // Permet de construire une scène
  constructor (params: Partial<CardModel>) {
    this.name = `NewScene_${String(Date.now()).slice(-7)}`
    this.color = Math.floor(Math.random() * 16777215)
    Object.assign(this, params)
    try {
      console.log(params.tags)
      this.parsedData = JSON.parse(this.data || '[]')
      this.parsedTags = JSON.parse(this.tags || '[]')
      console.log(this.parsedTags)
    } catch (e) {
      console.error(e)
    }
  }
}

class Room {
  nom = 'room'
  nomScene = ''
  host = ''
  action = 'quitterRoom'
  dateCreation = '20/04/2022'
  joueurs = 1
  // Mettre la scene

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

@Component
export default class ErgonomIOAssets extends Vue {
  rooms: Room[] = []

  router: VueRouter = this.$router
  query = this.router.currentRoute.query
  fullpage: boolean = this.query.fullpage === 'true'

  maSceneSelection = ''
  scenes: CardModel[] = []
  maRoomSauvegarder = new Room({})

  unrealContext = Unreal

  // Begin
  mounted (): void {
    this.getScenes()

    Unreal.callback.$on('unreal-message', (data: any) => {
      this.$root.$emit('bottom-message', `Unreal : ${JSON.stringify(data)}`)

      Unreal.send(data)

      switch (data.message) {
        case 'creer':
          Unreal.send('Bien recu 1 : ' + JSON.stringify(data))
          this.rooms.push(data.dataRoom)
          Unreal.send('Bien recu 2 !')
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

  getScenes (): void {
    API.post(
      this,
      '/resources/ergonomio-scenes',
      JSON.stringify({
        select: [],
        where: []
      })
    ).then((response: Response) => {
      console.log('response ', response)
      this.scenes = ((response as unknown) as Array<Partial<CardModel>>).map(
        (scene: Partial<CardModel>) => new CardModel(scene)
      )
      console.log('Scenes : ', this.scenes)
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

  // ???
  refreshRoomActuelle () {
    this.rooms = []
  }

  // Permet de quitter la room actuelle
  quitRoomCurrent () {
    this.rooms = []
  }

  // Permet de créer une room
  createSession1 (): void {
    console.log('Creer room with scenen : ', this.maSceneSelection)

    Unreal.send('Create session')

    // Si on a pas de scene à charger
    if (this.maSceneSelection === '') {
      // On crée la room
      this.sendUnreal(new Room({ action: 'creerRoom' }))
      return
    }

    let idSceneModif = -1
    for (let i = 0; i < this.scenes.length; i++) {
      if (this.maSceneSelection === this.scenes[i].name) {
        idSceneModif = i
        break
      }
    }

    Unreal.send('Cherche la scene : ' + idSceneModif)

    var objectAsset = {
      name: this.scenes[idSceneModif].name,
      assetsNumber: this.scenes[idSceneModif].assetsNumber,
      assets: JSON.parse(this.scenes[idSceneModif].data),
      idScene: this.scenes[idSceneModif].id,
      action: 'chargerScene',
      nomRoom: '',
      creerRoom: 1
    }

    var object = {
      menu: 'scene',
      objet: objectAsset
    }

    Unreal.send('Crée element')

    // On charge la scene
    Unreal.send(object)

    Unreal.send('Taille scene : ' + this.scenes.length)
  }

  // Deuxieme partie de create session
  // createSession2 (): void {
  //   console.log('create session')
  //   // On crée la room
  //   this.sendUnreal(new Room({ action: 'creerRoom' }))
  // }

  // Permet de rejoindre une room partie 1
  joinSession1 (room: Room): void {
    Unreal.send('joinSession 1 : ' + room.nomScene)
    let idSceneModif = -1
    for (let i = 0; i < this.scenes.length; i++) {
      Unreal.send('joinSession nom : ' + this.scenes[i].name)
      if (room.nomScene === this.scenes[i].name) {
        idSceneModif = i
        break
      }
    }

    Unreal.send('joinSession 2 : ' + idSceneModif)

    var objectAsset = {
      name: this.scenes[idSceneModif].name,
      assetsNumber: this.scenes[idSceneModif].assetsNumber,
      assets: JSON.parse(this.scenes[idSceneModif].data),
      idScene: this.scenes[idSceneModif].id,
      action: 'chargerScene',
      nomRoom: room.nom,
      creerRoom: 2
    }

    Unreal.send('joinSession 3')

    var object = {
      menu: 'scene',
      objet: objectAsset
    }

    Unreal.send('Crée element')

    // On charge la scene
    Unreal.send(object)
  }

  // Permet de rejoindre une room partie 2
  // joinSession2 (room : Room): void {
  //   console.log('Rejoindre room')

  //   var objectAsset = {
  //     action: 'rejoindreRoom',
  //     ma_room: room
  //   }

  //   var object = {
  //     menu: 'room',
  //     objet: objectAsset
  //   }

  //   Unreal.send(object)
  // }

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
