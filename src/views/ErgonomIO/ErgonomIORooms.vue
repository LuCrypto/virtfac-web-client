<template>
  <v-container fluid>
    <!-- Title -->
    <v-container v-if="!this.fullpage" fluid class="text-h3 text-center py-8">
      Collaborative sessions
    </v-container>
    <!-- Middle of the page: the different scene cards -->
    <template v-if="connected">
      <!-- The different rooms -->
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
          <v-card
            :key="indexRoom"
            v-for="(room, indexRoom) in rooms"
            height="455"
            width="30%"
            class="ma-3"
            elevation="5"
            :rounded="unrealContext.check() ? 'xl' : 'md'"
          >
            <v-card-title> {{ room.name }} </v-card-title>
            <v-card-subtitle> </v-card-subtitle>
            <v-card-text>
              {{ room.host }}, scene : {{ room.nameScene }}
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

        <!-- The different buttons -->
        <v-container>
          <v-row align="center">
            <v-col>
              <v-btn
                v-on:click="createSession1"
                class="primary black--text"
                large
                elevation="2"
              >
                Create new session
              </v-btn>
            </v-col>

            <v-col>
              <v-select
                class="black--text"
                label="Scene sélectionnée"
                v-model="sceneSelected"
                :items="this.scenes.map(item => item.name)"
                dense
              >
              </v-select>
            </v-col>
          </v-row>

          <v-row align="center">
            <v-col>
              <v-btn
                v-on:click="deleteSession"
                class="primary black--text"
                large
                elevation="2"
              >
                Delete session
              </v-btn>
            </v-col>

            <v-col>
              <v-select
                class="black--text"
                label="Room à supprimer"
                v-model="roomSelectedDelete"
                :items="this.rooms.map(item => item.name)"
                dense
              >
              </v-select>
            </v-col>
          </v-row>
        </v-container>
      </v-row>
    </template>
    <template>
      <div>
        <p class="text-center">
          Please log in.
        </p>
      </div>
    </template>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import API from '@/utils/api'
import Unreal from '@/utils/unreal'
import VueRouter from 'vue-router'
import CardScene from '@/utils/cardmodel'
import { Session } from '@/utils/session'

class Room {
  name = 'room'
  nameScene = ''
  host = ''
  action = 'quitRoom'
  dateCreation = '20/04/2022'
  players = 1

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

  router: VueRouter = this.$router
  query = this.router.currentRoute.query
  fullpage: boolean = this.query.fullpage === 'true'

  sceneSelected = ''
  roomSelectedDelete = ''
  scenes: CardScene[] = []
  roomSave: Room = new Room({})
  informationLogin = Session.getUser()
  connected = false

  unrealContext = Unreal

  mounted (): void {
    if (this.informationLogin != null) {
      this.connected = true
    }

    this.getScenes()

    // eslint-disable-next-line
    Unreal.callback.$on('unreal-message', (data: any) => {
      this.$root.$emit('bottom-message', `Unreal : ${JSON.stringify(data)}`)

      // For debugging
      Unreal.send(data)

      // We treat the different cases of message
      switch (data.message) {
        case 'creer':
          Unreal.send('Bien recu 1 : ' + JSON.stringify(data))
          this.rooms.push(data.dataRoom)
          Unreal.send('Bien recu 2 !')
          break
        case 'refresh':
          this.refreshRoomCurrent()
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
      this.scenes = ((response as unknown) as Array<Partial<CardScene>>).map(
        (scene: Partial<CardScene>) => new CardScene(scene)
      )
      console.log('Scenes : ', this.scenes)
    })
  }

  // Permet de selection une room
  selectedRoom (room: Room): void {
    const objectAsset = {
      action: 'selectionnerRoom',
      ma_room: room
    }

    const object = {
      menu: 'room',
      objet: objectAsset
    }

    Unreal.send(object)
  }

  refreshRoomLobby (rooms: Room[]): void {
    this.rooms = rooms
  }

  refreshRoomCurrent (): void {
    this.rooms = []
  }

  // Quit the currently room
  quitRoomCurrent (): void {
    this.rooms = []
  }

  // For create a session 1
  createSession1 (): void {
    console.log('Creer room with scenen : ', this.sceneSelected)

    Unreal.send('Create session')

    // if i don't have scene
    if (this.sceneSelected === '') {
      // i create a room
      this.sendUnreal(new Room({ action: 'creerRoom' }))
      return
    }

    // Get the selected scene
    let idSceneModif = -1
    for (let i = 0; i < this.scenes.length; i++) {
      if (this.sceneSelected === this.scenes[i].name) {
        idSceneModif = i
        break
      }
    }

    const objectAsset = {
      name: this.scenes[idSceneModif].name,
      assetsNumber: this.scenes[idSceneModif].assetsNumber,
      assets: JSON.parse(this.scenes[idSceneModif].data),
      idScene: this.scenes[idSceneModif].id,
      action: 'chargerScene',
      nameRoom: '',
      creerRoom: 1
    }

    const object = {
      menu: 'scene',
      objet: objectAsset
    }

    // Load scene
    Unreal.send(object)
  }

  // For delete a session
  deleteSession (): void {
    console.assert('deleteSession')

    // Si on a pas de scene à charger
    if (this.roomSelectedDelete === '') {
      // On crée la room
      console.log('Pas de room sélectionnée')
      return
    }

    const objectAsset = {
      action: 'supprimerRoom',
      nameRoom: this.roomSelectedDelete
    }

    const object = {
      menu: 'room',
      objet: objectAsset
    }

    // Load scene
    Unreal.send(object)
  }

  // Join room 1
  joinSession1 (room: Room): void {
    Unreal.send('joinSession 1 : ' + room.nameScene)

    let idSceneModif = -1
    for (let i = 0; i < this.scenes.length; i++) {
      if (room.nameScene === this.scenes[i].name) {
        idSceneModif = i
        break
      }
    }

    const objectAsset = {
      name: this.scenes[idSceneModif].name,
      assetsNumber: this.scenes[idSceneModif].assetsNumber,
      assets: JSON.parse(this.scenes[idSceneModif].data),
      idScene: this.scenes[idSceneModif].id,
      action: 'chargerScene',
      nameRoom: room.name,
      creerRoom: 2
    }

    const object = {
      menu: 'scene',
      objet: objectAsset
    }

    // Load scene
    Unreal.send(object)
  }

  // For leave a session
  leaveSession (): void {
    console.log('leaveSession')

    this.sendUnreal(new Room({ action: 'quitterRoom' }))
  }

  // Send message to unreal instance
  sendUnreal (room: Room): void {
    console.log('asset.name : ', room.name)

    const objectAsset = {
      action: room.action
    }

    const object = {
      menu: 'room',
      objet: objectAsset
    }

    Unreal.send(object)
  }
}
</script>
