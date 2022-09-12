<template>
  <v-container fluid style="padding: 0;">
    <!-- Title -->
    <v-container v-if="!this.fullpage" fluid class="text-h3 text-center py-6">
      Collaborative sessions
    </v-container>

    <!-- For get the room token -->
    <v-dialog width="50%" v-model="getRoomTokenBoolean">
      <v-container fluid class="d-flex flex-column align-center">
        <v-row no-gutters dense class="pa-2" style="width: 100%;">
          <v-col> Token room : {{ tokenRoom }} </v-col>
        </v-row>

        <v-row no-gutters dense class="pa-2">
          <v-col class="grow ma-2">
            <v-btn
              @click="setInPaperPress"
              class="primary black--text grow"
              large
              elevation="2"
            >
              {{ setInPaperPressValue }}
            </v-btn>
          </v-col>

          <v-col class="grow ma-2">
            <v-btn
              @click="closeTokenRoom"
              class="primary black--text"
              large
              elevation="2"
            >
              Close
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-dialog>

    <!-- For join a room with a token-->
    <v-dialog hide-overlay width="50%" v-model="joinRoomWithToken">
      <v-container fluid class="d-flex flex-column align-center">
        <div>
          <h3>
            Join room with token
          </h3>
        </div>

        <div class="d-flex justify-center align-center" style="width: 100%">
          <div class="ma-2 flex-grow-1">
            <v-text-field v-model="sendToken" label="Room token"></v-text-field>
          </div>
          <div class="ma-2">
            <v-btn
              @click="getInPaperPress"
              class="primary black--text"
              large
              elevation="2"
            >
              {{ getInPaperPressValue }}
            </v-btn>
          </div>
        </div>

        <v-row no-gutters dense class="pa-2" style="width: 55%">
          <v-col align-self="center" class="ma-2">
            <v-btn
              @click="joinRoom"
              class="primary black--text"
              style="width: 100%"
              large
              elevation="2"
            >
              Join
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-dialog>

    <!-- Middle of the page: the different scene cards -->
    <template v-if="connected">
      <!-- The different rooms -->
      <v-row
        no-gutters
        class="overflow-y-auto flex-grow-1 my-2 rounded-lg"
        style="min-height: 800px;"
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
                Current session : {{ nameCurrentRoom }}
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
                v-on:click="() => displayJoinRoom(room)"
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
        <v-container
          style="background-color: rgb(45, 45, 45); margin: 0; max-width: 100%"
        >
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
                label="Selected scene"
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
                label="Room to delete"
                v-model="roomSelectedDelete"
                :items="this.rooms.map(item => item.name)"
                densed
              >
              </v-select>
            </v-col>
          </v-row>
        </v-container>
      </v-row>
    </template>
    <template v-if="!connected">
      <v-row align="center">
        <v-col>
          <p class="text-center">
            Please log in.
          </p>
        </v-col>
        <v-col>
          <v-btn
            v-on:click="testToken"
            class="primary black--text"
            large
            elevation="2"
          >
            Connect as invite
          </v-btn>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import API from '@/utils/api'
import Unreal from '@/utils/unreal'
import VueRouter from 'vue-router'
import CardScene from '@/utils/cardmodel'
import { Session, User } from '@/utils/session'

class Room {
  name = 'room'
  tokenRoom = 'None'
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
  nameCurrentRoom = 'None'

  router: VueRouter = this.$router
  query = this.router.currentRoute.query
  fullpage: boolean = this.query.fullpage === 'true'

  sceneSelected = ''
  roomSelectedDelete = ''
  scenes: CardScene[] = []
  roomSave: Room = new Room({})
  informationLogin = Session.getUser()
  connected = false
  getRoomTokenBoolean = false
  joinRoomWithToken = false
  sendToken = ''
  tokenRoom = 'testfezfez'
  getInPaperPressValue = 'Paste'
  setInPaperPressValue = 'Copy'
  roomVisee: Room = new Room({})

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

      let roomChoisie = 0
      let nameRoom = ''

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
          // this.quitRoomCurrent()
          break
        case 'changeName':
          // this.changeNameCurrentRoom(data.nameRoom)
          Unreal.send('AVANT BG')
          // Unreal.send('APRES BG : ' + (data.nameRoom as string))
          this.changeNameCurrentRoom(data.nameRoom as string)
          break
        case 'setTokenRoom':
          this.setTokenRoomAndDisplay(data.nameTokenRoom as string)
          break
        case 'getTokenRoom':
          this.setRoomToken(data.nameTokenRoom as string)
          break
        case 'joinRoomGoodToken':
          nameRoom = data.nameRoom as string

          // Find room with his name
          for (let i = 0; i < this.rooms.length; i++) {
            if (this.rooms[i].name === nameRoom) {
              roomChoisie = i
              break
            }
          }

          this.joinSession1(this.rooms[roomChoisie])
          break
        default:
      }
    })
  }

  // Set the room token in the paper press
  setInPaperPress (): void {
    this.setInPaperPressValue = 'Done !'

    const objectAsset = {
      action: 'setInPaperPress',
      token: this.tokenRoom
    }

    const object = {
      menu: 'room',
      objet: objectAsset
    }

    Unreal.send(object)
  }

  // Get the room token from the paper press
  getInPaperPress (): void {
    this.getInPaperPressValue = 'Done !'

    const objectAsset = {
      action: 'getInPaperPress'
    }

    const object = {
      menu: 'room',
      objet: objectAsset
    }

    Unreal.send(object)
  }

  // After get the paste of the unreal client, we put in input room token
  setRoomToken (token: string): void {
    this.sendToken = token
  }

  // Join room with token
  joinRoom (): void {
    console.log('join room : ', this.sendToken)

    const objectAsset = {
      action: 'joinRoomWithToken',
      token: this.sendToken,
      room: this.roomVisee.name
    }

    const object = {
      menu: 'room',
      objet: objectAsset
    }

    Unreal.send(object)
  }

  // Close the popup for get the room token
  closeTokenRoom (): void {
    this.getRoomTokenBoolean = false
  }

  // For get all scenes on API
  // @arg No arguments required
  getScenes (): void {
    API.post(
      this,
      '/resources/ergonomio-scenes',
      JSON.stringify({
        select: [],
        where: []
      })
    ).then((response: Response) => {
      this.scenes = ((response as unknown) as Array<Partial<CardScene>>).map(
        (scene: Partial<CardScene>) => new CardScene(scene)
      )
    })
  }

  // Set name of the current room
  changeNameCurrentRoom (newName: string): void {
    this.nameCurrentRoom = newName
  }

  // Set token room after room creation and display
  setTokenRoomAndDisplay (tokenRoom: string): void {
    this.tokenRoom = tokenRoom
    this.getRoomTokenBoolean = true
  }

  displayJoinRoom (room: Room): void {
    this.joinRoomWithToken = true
    this.roomVisee = room
  }

  // Allows you to select a room
  // @arg No arguments required
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

  // temporary function
  testToken (): void {
    // Option 1
    API.post(
      this,
      '/login',
      JSON.stringify({
        login: 'ljager',
        password: 'luc'
      })
    )
      .then((json: any) => {
        const user = new User(json)
        Session.setUser(user)
        this.$root.$emit('bottom-message', `Welcome back ${user.pseudo}.`)
        this.$root.$emit('user-connection', user)
        // this.login = ''
        // this.password = ''
        this.$emit('close')

        const objectAsset = {
          action: 'refreshAllConnectAsInvite'
        }

        const object = {
          menu: 'room',
          objet: objectAsset
        }

        // Load scene
        Unreal.send(object)
      })
      .catch(e => {
        this.$root.$emit('bottom-message', 'Login or password are incorrect.')
      })
  }

  // refreshRoomLobby
  // @arg No arguments required
  refreshRoomLobby (rooms: Room[]): void {
    this.rooms = rooms
  }

  // refreshRoomCurrent
  // @arg No arguments required
  refreshRoomCurrent (): void {
    this.rooms = []
  }

  // Quit the currently room
  // @arg No arguments required
  quitRoomCurrent (): void {
    this.rooms = []
  }

  // For create a session 1
  // @arg No arguments required
  createSession1 (): void {
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

    console.log('INFOOOS')
    console.log(this.scenes[idSceneModif].idProfile)

    // Make request
    const objectAsset = {
      name: this.scenes[idSceneModif].name,
      assetsNumber: this.scenes[idSceneModif].assetsNumber,
      assets: JSON.parse(this.scenes[idSceneModif].data),
      idScene: this.scenes[idSceneModif].id,
      idProfil: this.scenes[idSceneModif].idProfile,
      action: 'chargerScene',
      nameRoom: '', // ?
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
  // @arg No arguments required
  deleteSession (): void {
    console.assert('deleteSession')

    // Si on a pas de scene à charger
    if (this.roomSelectedDelete === '') {
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
  // @arg No arguments required
  joinSession1 (room: Room): void {
    Unreal.send('joinSession 1 : ' + room.name)
    Unreal.send('joinSession 1 : ' + room.nameScene)
    Unreal.send('joinSession 1 : ' + room.host)
    Unreal.send('joinSession 1 : ' + room.action)
    Unreal.send('joinSession 1 : ' + room.dateCreation)
    Unreal.send('joinSession 1 : ' + room.players)

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
      idProfil: this.scenes[idSceneModif].idProfile,
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
  // @arg No arguments required
  leaveSession (): void {
    this.sendUnreal(new Room({ action: 'quitterRoom' }))
  }

  // Send message to unreal instance
  // @arg No arguments required
  sendUnreal (room: Room): void {
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
