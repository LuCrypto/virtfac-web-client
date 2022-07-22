<style>
.centered-input input {
  text-align: center;
}
</style>

<template>
  <v-container
    fluid
    style="height: 100%; max-height: 100%"
    class="overflow-y-auto black rounded-lg"
  >
    <!-- To assign a position to an event -->
    <v-dialog v-model="modifyPositionBooleen">
      <v-container class="d-flex flex-wrap flex-nowrap">
        <!-- X, Y et Z -->
        <v-row align="center">
          <v-col align="center">
            <!-- Axe -->
            <v-sheet max-width="25" :color="axesColorsArray[1]" elevation="1">
              {{ axesArray[1] }}
            </v-sheet>
            <!-- Inputs for coordinates -->
            <v-text-field
              @click:prepend="decrement(1)"
              @click:append-outer="increment(1)"
              v-if="1 != 0"
              v-model="positionEvent['x']"
              outlined
              value="0"
              input="0"
              hide-details
              append-outer-icon="mdi-plus"
              color="primary"
              prepend-icon="mdi-minus"
              align="center"
              single-line
              type="number"
            />
          </v-col>
          <v-col align="center">
            <!-- Axe -->
            <v-sheet max-width="25" :color="axesColorsArray[2]" elevation="1">
              {{ axesArray[2] }}
            </v-sheet>
            <!-- Inputs for coordinates -->
            <v-text-field
              v-if="2 != 0"
              v-model="positionEvent['y']"
              outlined
              hide-details
              append-outer-icon="mdi-plus"
              color="primary"
              @click:append-outer="increment(2)"
              prepend-icon="mdi-minus"
              @click:prepend="decrement(2)"
              align="center"
              single-line
              type="number"
              :key="counter"
            />
          </v-col>
          <v-col align="center">
            <!-- Axe -->
            <v-sheet max-width="25" :color="axesColorsArray[3]" elevation="1">
              {{ axesArray[3] }}
            </v-sheet>
            <!-- Inputs for coordinates -->
            <v-text-field
              v-if="3 != 0"
              v-model="positionEvent['z']"
              outlined
              hide-details
              append-outer-icon="mdi-plus"
              color="primary"
              @click:append-outer="increment(3)"
              prepend-icon="mdi-minus"
              @click:prepend="decrement(3)"
              align="center"
              single-line
              type="number"
              :key="counter"
            />
          </v-col>
          <!-- To save the position of the event -->
          <v-col align="center">
            <v-btn color="primary" text @click="save()">
              Save
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-dialog>

    <!-- Editing a profile -->
    <v-dialog v-model="editProfilBooleen">
      <v-card class="overflow-y-auto rounded-lg">
        <v-container fluid class="d-flex flex-wrap">
          <!-- For the title -->
          <v-row align="center" no-gutters>
            <v-col cols="1" align="center">
              Title :
            </v-col>
            <v-col cols="11" align="center">
              <v-text-field
                v-model="profilEdit.title"
                type="text"
                :value="this.profilEdit.title"
              >
              </v-text-field>
            </v-col>
          </v-row>

          <!-- For the event -->
          <v-container
            v-for="evenement in this.profilEdit.items"
            :key="evenement.title"
          >
            <v-row align="center" no-gutters>
              <!-- Name event -->
              <v-col cols="5" align="center">
                <v-text-field
                  v-model="evenement.name"
                  type="text"
                  :value="evenement.name"
                >
                </v-text-field>
              </v-col>
              <!-- Position -->
              <v-col align="center">
                Position :
              </v-col>
              <v-col align="center">
                <v-text-field
                  class="centered-input mx-4"
                  type="number"
                  v-model="evenement.values.position.x"
                  :value="evenement.values.position.x"
                >
                </v-text-field>
              </v-col>
              <v-col align="center">
                <v-text-field
                  class="centered-input mx-4"
                  type="number"
                  v-model="evenement.values.position.y"
                  :value="evenement.values.position.y"
                >
                </v-text-field>
              </v-col>
              <v-col align="center">
                <v-text-field
                  class="centered-input mx-4"
                  type="number"
                  v-model="evenement.values.position.z"
                  :value="evenement.values.position.z"
                >
                </v-text-field>
              </v-col>
              <!-- Rotation -->
              <v-col align="center">
                Rotation :
              </v-col>
              <v-col align="center">
                <v-text-field
                  class="centered-input mx-4"
                  type="number"
                  v-model="evenement.values.rotation.x"
                  :value="evenement.values.rotation.x"
                >
                </v-text-field>
              </v-col>
              <v-col align="center">
                <v-text-field
                  class="centered-input mx-4"
                  type="number"
                  v-model="evenement.values.rotation.y"
                  :value="evenement.values.rotation.y"
                >
                </v-text-field>
              </v-col>
              <v-col align="center">
                <v-text-field
                  class="centered-input mx-4"
                  type="number"
                  v-model="evenement.values.rotation.z"
                  :value="evenement.values.rotation.z"
                >
                </v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-container>
      </v-card>
      <v-card>
        <v-row>
          <v-col align="center">
            <v-btn
              color="primary"
              class="black--text pa-5"
              small
              @click="saveProfil"
            >
              Save Profil
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>

    <!-- The list of profiles -->
    <v-list>
      <v-list-group
        v-for="item in profils"
        :key="item.title"
        v-model="item.active"
        :prepend-icon="item.action"
        no-action
      >
        <template v-slot:activator>
          <v-list-item-content>
            <v-list-item-title
              v-text="item.title + ' (' + item.id + ')'"
            ></v-list-item-title>
          </v-list-item-content>
        </template>

        <!-- List of events -->
        <v-list-item v-for="(child, index) in item.items" :key="child.title">
          <v-btn
            class="pa-5"
            min-width="90%"
            max-width="90%"
            small
            v-if="!selectedObjectDynamique"
            @click="modifierPositionWithObject(child, item.id)"
          >
            {{ child.name }}
            <br />
          </v-btn>
          <v-btn
            class="pa-5"
            min-width="90%"
            max-width="90%"
            small
            v-if="selectedObjectDynamique"
            @click="modifierPositionWithObject(child, item.id)"
          >
            {{ child.name }}
            Pos :
            {{ roundVector3(child.values.position) }}
            Rot :
            {{ roundVector3(child.values.rotation) }}
          </v-btn>
          <v-btn icon>
            <v-icon
              @click="moveToEvent(child)"
              class="ml-2"
              v-text="'mdi-map-marker'"
              left
            ></v-icon>
          </v-btn>
          <v-btn icon>
            <v-icon
              @click="supprimerEvenement(index)"
              class="ml-2"
              v-text="'mdi-delete'"
              leftr
            ></v-icon>
          </v-btn>
        </v-list-item>
      </v-list-group>
    </v-list>

    <!-- The different buttons -->
    <v-container class="d-flex flex-wrap flex-nowrap">
      <v-row align="center">
        <!-- Allows you to start a profile with the selected object -->
        <v-col align="center">
          <v-btn
            class="primary black--text my-2"
            @click="demarreProfil()"
            large
            elevation="2"
          >
            Start profil
          </v-btn>
        </v-col>
        <!-- Allows to start with all the objects of the scene -->
        <v-col align="center">
          <v-btn
            class="primary black--text my-2"
            @click="demarreProfilGlobal()"
            large
            elevation="2"
          >
            Start global profil
          </v-btn>
        </v-col>
        <!-- Allows you to delete the active profile -->
        <v-col align="center">
          <v-btn
            class="primary black--text my-2"
            @click="supprimerProfil()"
            large
            elevation="2"
          >
            Delete profil
          </v-btn>
        </v-col>
        <!-- Allows you to attach one object to another -->
        <v-col align="center">
          <v-btn
            class="primary black--text my-2"
            @click="attacherObjet()"
            large
            elevation="2"
          >
            Attach an object
          </v-btn>
        </v-col>
        <!-- Add an event -->
        <v-col align="center">
          <v-btn
            @click="ajouterEvenement"
            class="primary black--text my-2"
            large
            elevation="2"
          >
            Add an event
          </v-btn>
        </v-col>

        <v-col align="center">
          <v-btn
            @click="cheminObjetSelectionne"
            class="primary black--text my-2"
            large
            elevation="2"
          >
            Selected path asset
          </v-btn>
        </v-col>

        <v-col align="center">
          <v-btn
            @click="cheminGlobal"
            class="primary black--text my-2"
            large
            elevation="2"
          >
            Global path
          </v-btn>
        </v-col>
      </v-row>
    </v-container>

    <!-- Second button bar -->
    <v-container class="d-flex flex-wrap flex-nowrap">
      <v-row align="center">
        <v-col align="center">
          <v-btn
            class="primary black--text my-2"
            @click="assignerProfilScene()"
            large
            elevation="2"
          >
            Assign a profil to scene
          </v-btn>
        </v-col>

        <!-- Selected profile -->
        <v-col align="center">
          <v-select
            class="black--text"
            label="Selected profil"
            v-model="selectedProfil"
            :items="this.profils.map(item => item.title)"
            dense
          >
          </v-select>
        </v-col>

        <!-- Selected scene -->
        <v-col align="center">
          <v-select
            class="black--text"
            label="Selected scene"
            v-model="selectedScene"
            :items="this.scenes.map(item => item.name)"
            dense
          >
          </v-select>
        </v-col>
      </v-row>
    </v-container>

    <!-- Third button bar -->
    <v-container
      v-if="!unrealContext.check()"
      class="d-flex flex-wrap flex-nowrap"
    >
      <v-row align="center">
        <!-- Allows you to load a witness file for a profile -->
        <v-col align="center">
          <v-btn
            @click="openUploadFile"
            class="primary black--text my-2"
            large
            elevation="2"
          >
            Load a profil file
            <input
              accept="application/JSON"
              ref="uploadFileInput"
              hidden
              type="file"
              @change="onUploadSceneUpdate"
            />
          </v-btn>
        </v-col>

        <!-- Allows you to edit the current profile -->
        <v-col align="center">
          <v-btn
            @click="editerProfil"
            class="primary black--text my-2"
            large
            elevation="2"
          >
            Edit the current profil
          </v-btn>
        </v-col>

        <!-- Allows to listen on the server -->
        <v-col align="center">
          <v-btn
            class="primary black--text my-2"
            @click="ecouterServeur()"
            large
            elevation="2"
          >
            Listen id of server (do nothing)
          </v-btn>
        </v-col>
      </v-row>
    </v-container>

    <!-- Dynamique object -->
    <v-container
      v-if="selectedObjectDynamique"
      class="d-flex flex-wrap flex-nowrap"
    >
      <v-row align="center">
        <!-- Allows you to load a witness file for a profile -->
        <v-col align="center">
          Object dynamique selected !
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import API from '@/utils/api'
import Unreal from '@/utils/unreal'
import VueRouter from 'vue-router'
import { Vector3 } from 'three'
import CardModel from '@/utils/cardmodel'

// Classe d'un évènement
interface evenementClass {
  evenement: string
}

class message {
  message = ''
  // eslint-disable-next-line
  object: any

  constructor () {
    Object.assign(this)
  }
}

// Classe pour les assets
class OpcuaModel {
  // Initialisation
  name = 'Asset1.json'
  id = 0
  creationDate = 0
  idProject = 0
  idUserOwner = 0
  modificationDate = 0
  events = ''

  // Permet de récupérer une date en format string
  get formatedCreationDate (): string {
    return new Date(this.creationDate).toLocaleString()
  }

  // Permet de construire un asset
  constructor (params: Partial<OpcuaModel>) {
    Object.assign(this, params)
  }
}

class Values {
  datetime = -1
  idParent = -1
  position: Vector3 = new Vector3(0)
  rotation: Vector3 = new Vector3(0)

  constructor (params: Partial<Values>) {
    Object.assign(this, params)
  }
}

// Type Evenement
class Evenement {
  name = ''
  values: Values = new Values({})

  constructor (params: Partial<Evenement>) {
    Object.assign(this, params)
  }
}

// Type Profil
class Profil {
  action = ''
  title = ''
  active = false
  id = -1
  items: Array<Evenement> = []

  constructor (params: Partial<Profil>) {
    Object.assign(this, params)
  }
}

@Component
export default class ErgonomIOAssets extends Vue {
  // Default
  router: VueRouter = this.$router
  query = this.router.currentRoute.query
  fullpage: boolean = this.query.fullpage === 'true'
  modifyAsset = true
  unrealContext = Unreal

  transformArray = ['Location', 'Rotation', 'Scale']
  axesArray = ['', 'X', 'Y', 'Z']
  axesColorsArray = ['black', 'red', 'green', 'blue']
  textFieldValue = ''
  counter = 0
  positionEvent = new Vector3(0, 0, 0)
  childSave: Evenement = new Evenement({ name: 'Evenement 1' })
  modifyPositionBooleen = false
  selectedScene = ''
  selectedProfil = ''
  scenes: CardModel[] = []
  firstTime = true
  editProfilBooleen = false
  selectedObjectDynamique = false
  profilEdit: Profil = new Profil({})

  // Profils list
  profils: Array<Profil> = [
    {
      action: 'mdi-calendar-search',
      items: [
        {
          name: 'Evenement 1',
          values: new Values({
            position: new Vector3(0.0, 0.0, 0.0),
            rotation: new Vector3(0.0, 0.0, 0.0),
            idParent: -1,
            datetime: -1
          })
        },
        {
          name: 'Evenement 2',
          values: new Values({
            position: new Vector3(100.0, 0.0, 0.0),
            rotation: new Vector3(0.0, 0.0, 0.0),
            idParent: -1,
            datetime: -1
          })
        },
        {
          name: 'Evenement 3',
          values: new Values({
            position: new Vector3(0.0, 300.0, 0.0),
            rotation: new Vector3(0.0, 0.0, 0.0),
            idParent: -1,
            datetime: -1
          })
        }
      ],
      title: 'Profil 1',
      active: false,
      id: 1
    }
  ]

  mounted (): void {
    this.profils = []
    this.getProfils()
    this.getScenes()

    Unreal.callback.$on('unreal-message', (data: unknown) => {
      try {
        this.$root.$emit('bottom-message', `Unreal : ${JSON.stringify(data)}`)
      } catch (error) {
        Unreal.send('PROBLEME : ')
      }

      const test = data as message
      // ======================================================================
      // When we get an event
      if (test.message === 'envoieEvenement') {
        const test2 = test.object as evenementClass
        Unreal.send(test2)

        if (this.firstTime) {
          this.ajouterProfil('New profil', [], 9)
          this.firstTime = false
        }

        this.profils[this.profils.length - 1].items.push({
          name: test2.evenement,
          values: new Values({
            position: new Vector3(0.0, 0.0, 0.0),
            rotation: new Vector3(0.0, 0.0, 0.0),
            idParent: -1,
            datetime: -1
          })
        })
        this.miseAJourProfil(this.profils[this.profils.length - 1])
      } else if (test.message === 'envoiePosition') {
        Unreal.send(test.object)

        let indiceProfilTableau = -1
        for (let i = 0; i < this.profils.length; i++) {
          const element = this.profils[i]
          if (element.id === test.object.idProfil) {
            indiceProfilTableau = i
            break
          }
        }

        if (indiceProfilTableau === -1) {
          Unreal.send('Probleme cannot get id of profil')
        } else {
          for (
            let i = 0;
            i < this.profils[indiceProfilTableau].items.length;
            i++
          ) {
            const element = this.profils[indiceProfilTableau].items[i]
            // Element trouvé
            if (element.name === test.object.name) {
              // Position
              element.values.position = new Vector3(
                test.object.position[0],
                test.object.position[1],
                test.object.position[2]
              )
              // Rotation
              element.values.rotation = new Vector3(
                test.object.rotation[0],
                test.object.rotation[1],
                test.object.rotation[2]
              )
            }
          }
        }
      } else if (test.message === 'envoieListeEvenementProfil') {
        let indiceChercher = -1
        for (let i = 0; i < this.profils.length; i++) {
          const element = this.profils[i]
          if (element.id === test.object.profil) {
            indiceChercher = i
          }
        }

        if (indiceChercher !== -1) {
          const objectOpcua = {
            action: 'listeEvenement',
            evenements: this.profils[indiceChercher].items,
            nomObjet: test.object.nomObjet
          }

          const object = {
            menu: 'opcua',
            objet: objectOpcua
          }

          // On envoie la liste
          Unreal.send(object)
        } else {
          Unreal.send('Probleme')
        }
      } else if (test.message === 'selectedObjectDynamique') {
        Unreal.send('selectedObjectDynamique')
        this.selectedObjectDynamique = true
      } else if (test.message === 'infosObjetDynamique') {
        const indiceProfil = test.object.idProfil

        let indiceProfilTableau = -1
        for (let i = 0; i < this.profils.length; i++) {
          const element = this.profils[i]
          if (element.id === indiceProfil) {
            indiceProfilTableau = i
            break
          }
        }

        if (indiceProfilTableau === -1) {
          Unreal.send('Probleme cannot get id of profil')
        } else {
          if (test.object.vide) {
            for (
              let i = 0;
              i < this.profils[indiceProfilTableau].items.length;
              i++
            ) {
              this.profils[indiceProfilTableau].items[
                i
              ].values.position = new Vector3(0.0, 0.0, 0.0)
              this.profils[indiceProfilTableau].items[
                i
              ].values.rotation = new Vector3(0.0, 0.0, 0.0)
            }
          } else {
            // Update array
            for (
              let i = 0;
              i < this.profils[indiceProfilTableau].items.length;
              i++
            ) {
              this.profils[indiceProfilTableau].items[i].values.position =
                test.object.tableau_position[i]
              this.profils[indiceProfilTableau].items[i].values.rotation =
                test.object.tableau_rotation[i]
            }
          }

          Unreal.send('infosObjetDynamique finis')
        }
      }
    })
  }

  // Allows to round a Vector3
  // @arg No arguments required
  roundVector3 (vector: any): Vector3 {
    if (vector[0] == null) {
      return new Vector3(
        Math.round(vector.x * 100) / 100,
        Math.round(vector.y * 100) / 100,
        Math.round(vector.z * 100) / 100
      )
    } else {
      return new Vector3(
        Math.round(vector[0] * 100) / 100,
        Math.round(vector[1] * 100) / 100,
        Math.round(vector[2] * 100) / 100
      )
    }
  }

  // Assign a profile to a scene
  // @arg No arguments required
  assignerProfilScene (): void {
    if (this.selectedScene === '') return
    if (this.selectedProfil === '') return

    let idSceneModif = -1
    for (let i = 0; i < this.scenes.length; i++) {
      if (this.selectedScene === this.scenes[i].name) {
        idSceneModif = i
        break
      }
    }
    if (idSceneModif === -1) return

    let idProfilModif = -1
    for (let i = 0; i < this.scenes.length; i++) {
      if (this.selectedProfil === this.profils[i].title) {
        idProfilModif = i
        break
      }
    }

    if (idProfilModif === -1) return

    const scene = this.scenes[idSceneModif]
    scene.idProfile = this.profils[idProfilModif].id

    // On mets à jour la scene sélectionnée
    API.patch(
      this,
      `/resources/ergonomio-scenes/${scene.id}`,
      JSON.stringify({
        idProfile: scene.idProfile
      })
    )
      .then((response: Response) => {
        console.log('api modif scene : ', response)
      })
      .catch(e => console.error(e))

    const objectOpcua = {
      action: 'rafraichirScene'
    }

    const object = {
      menu: 'opcua',
      objet: objectOpcua
    }

    // On demande de rafraichir les scenes
    Unreal.send(object)
  }

  // Get scenes
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
      console.log('response ', response)
      this.scenes = ((response as unknown) as Array<Partial<CardModel>>).map(
        (scene: Partial<CardModel>) => new CardModel(scene)
      )
    })
  }

  // Open edit profil
  // @arg No arguments required
  editerProfil (): void {
    let trouver = -1
    for (let i = 0; i < this.profils.length; i++) {
      const element = this.profils[i].active
      if (element) trouver = i
    }

    this.editProfilBooleen = true
    this.profilEdit = this.profils[trouver]
  }

  // Add event to a profil
  // @arg No arguments required
  ajouterEvenement (): void {
    let trouver = -1
    for (let i = 0; i < this.profils.length; i++) {
      const element = this.profils[i].active
      if (element) trouver = i
    }

    this.profils[trouver].items.push(
      new Evenement({ name: 'Nouveau evenement' })
    )

    // Mettre à jour le profil
    this.miseAJourProfil(this.profils[trouver])
  }

  // Display the path of selected asset
  // @arg No arguments required
  cheminObjetSelectionne (): void {
    let trouver = -1
    for (let i = 0; i < this.profils.length; i++) {
      const element = this.profils[i].active
      if (element) trouver = i
    }

    const objectOpcua = {
      action: 'cheminObjetSelectionne',
      profil: this.profils[trouver]
    }

    const object = {
      menu: 'opcua',
      objet: objectOpcua
    }

    // On envoie le profil
    Unreal.send(object)
  }

  // Display the path of all assets of profil
  // @arg No arguments required
  cheminGlobal (): void {
    let trouver = -1
    for (let i = 0; i < this.profils.length; i++) {
      const element = this.profils[i].active
      if (element) trouver = i
    }

    const objectOpcua = {
      action: 'cheminGlobal',
      profil: this.profils[trouver]
    }

    const object = {
      menu: 'opcua',
      objet: objectOpcua
    }

    // On envoie le profil
    Unreal.send(object)
  }

  // Get upload file
  // @arg No arguments required
  openUploadFile (): void {
    const uploadFileInput = this.$refs.uploadFileInput as HTMLInputElement
    if (uploadFileInput == null) return
    uploadFileInput.value = ''
    uploadFileInput.click()
  }

  // Load a profil
  // @arg No arguments required
  onUploadSceneUpdate (e: Event): void {
    if (e.target == null) return
    const target = e.target as HTMLInputElement
    if (target.files != null && target.files.length > 0) {
      [...target.files].forEach(file => {
        const reader = new FileReader()
        reader.onload = _ => {
          const content: string = reader.result as string
          const tableau: string[] = content.split('\r\n')

          const nomFichier: string = file.name
          const nomFichierProfil = nomFichier.split('.json')[0]

          // Crée un profil
          this.ajouterProfil(nomFichierProfil, [], -1)

          // Chaque ligne du fichier
          for (let i = 0; i < tableau.length; i++) {
            const tableau2: string[] = tableau[i].split(':')

            const datetimeInput = Number(tableau2[0])
            const evenementName = tableau2[1]

            const objet: Evenement = {
              name: evenementName,
              values: new Values({
                position: new Vector3(0.0, 0.0, 0.0),
                rotation: new Vector3(0.0, 0.0, 0.0),
                idParent: -1,
                datetime: datetimeInput
              })
            }

            // Ajoute évènement au profil
            this.profils[this.profils.length - 1].items.push(objet)
          }

          // Mettre à jour l'API
          this.ajouterAPIProfil(this.profils[this.profils.length - 1])
        }

        reader.onerror = error => {
          console.error(error)
          this.$root.$emit('bottom-message', 'Sorry, we cannot read this file.')
        }
        reader.readAsText(file)
      })
    }
  }

  // Save the modify profil
  // @arg No arguments required
  saveProfil (): void {
    this.editProfilBooleen = false

    // Mettre à jour le profil
    this.miseAJourProfil(this.profilEdit)
  }

  // api request for adding the profil to API
  // @arg No arguments required
  ajouterAPIProfil (profil: Profil): void {
    API.put(
      this,
      '/resources/dynamics-object-profiles',
      JSON.stringify({
        name: profil.title,
        events: JSON.stringify(profil.items),
        idProject: 0
      })
    ).then((response: Response) => {
      console.log('api ajouter profil : ', response)
      this.getProfils()
    })
  }

  // Update with api request
  // @arg No arguments required
  miseAJourProfil (profil: Profil): void {
    API.patch(
      this,
      `/resources/dynamics-object-profiles/${profil.id}`,
      JSON.stringify({
        name: profil.title,
        events: JSON.stringify(profil.items)
      })
    )
      .then((response: Response) => {
        console.log('api modif scene : ', response)
      })
      .catch(e => console.error(e))
  }

  // Get all profils with api request
  // @arg No arguments required
  getProfils (): void {
    this.profils = []

    API.post(
      this,
      '/resources/dynamics-object-profiles',
      JSON.stringify({
        select: [],
        where: []
      })
    ).then((response: Response) => {
      console.log('response : ', response)
      const monAssetTableau = ((response as unknown) as Array<
        Partial<OpcuaModel>
      >).map((opcua: Partial<OpcuaModel>) => new OpcuaModel(opcua))

      for (let i = 0; i < monAssetTableau.length; i++) {
        const element = monAssetTableau[i]

        const monTableau = []
        const monJson = JSON.parse(element.events)

        for (let j = 0; j < monJson.length; j++) {
          const elementObjet = monJson[j]

          let objet: Evenement
          if (elementObjet.values.position[0] == null) {
            objet = {
              name: elementObjet.name,
              values: new Values({
                position: new Vector3(
                  elementObjet.values.position.x,
                  elementObjet.values.position.y,
                  elementObjet.values.position.z
                ),
                rotation: new Vector3(
                  elementObjet.values.rotation.x,
                  elementObjet.values.rotation.y,
                  elementObjet.values.rotation.z
                ),
                idParent: elementObjet.values.idParent,
                datetime: -1
              })
            }
          } else {
            objet = {
              name: elementObjet.name,
              values: new Values({
                position: new Vector3(
                  elementObjet.values.position[0],
                  elementObjet.values.position[1],
                  elementObjet.values.position[2]
                ),
                rotation: new Vector3(
                  elementObjet.values.rotation[0],
                  elementObjet.values.rotation[1],
                  elementObjet.values.rotation[2]
                ),
                idParent: elementObjet.values.idParent,
                datetime: -1
              })
            }
          }

          monTableau.push(objet)
        }
        this.ajouterProfil(element.name, monTableau, element.id)
      }
    })
  }

  // Start the simulation of profil with an asset
  // @arg No arguments required
  demarreProfil (): void {
    let trouver = -1
    for (let i = 0; i < this.profils.length; i++) {
      const element = this.profils[i].active
      if (element) trouver = i
    }

    const objectOpcua = {
      action: 'demarreProfil',
      profil: this.profils[trouver]
    }

    const object = {
      menu: 'opcua',
      objet: objectOpcua
    }

    // On envoie le profil
    Unreal.send(object)
  }

  // Start the simulation of profil for all assets
  // @arg No arguments required
  demarreProfilGlobal (): void {
    let trouver = -1
    for (let i = 0; i < this.profils.length; i++) {
      const element = this.profils[i].active
      if (element) trouver = i
    }

    const objectOpcua = {
      action: 'demarreProfilGlobal',
      profil: this.profils[trouver]
    }

    const object = {
      menu: 'opcua',
      objet: objectOpcua
    }

    // On envoie le profil
    Unreal.send(object)
  }

  // Delete the selected profil
  // @arg No arguments required
  supprimerProfil (): void {
    let trouver = -1
    for (let i = 0; i < this.profils.length; i++) {
      if (this.profils[i].active) {
        trouver = i
        break
      }
    }

    // Delete
    this.profils.splice(trouver, 1)

    // Faire requete api
    this.supprimerAPIProfil(this.profils[trouver])
  }

  // Delete profil with api request
  // @arg No arguments required
  supprimerAPIProfil (profil: Profil): void {
    API.delete(
      this,
      `/resources/dynamics-object-profiles/${profil.id}`,
      ''
    ).then((response: Response) => {
      console.log('supprimer profil : ', response)
    })
  }

  // Load a profil file
  // @arg No arguments required
  chargerProfil (): void {
    console.log('chargerProfil')
  }

  // For listening the server
  // @arg No arguments required
  ecouterServeur (): void {
    console.log('ecouterServeur !')
  }

  // Delete an event of a profil
  // @arg No arguments required
  supprimerEvenement (indexChild: number): void {
    // On trouve le profil
    let trouver = -1
    for (let i = 0; i < this.profils.length; i++) {
      const element = this.profils[i].active
      if (element) trouver = i
    }

    // On enleve l'element
    const tableauIntermediaire = []
    for (let i = 0; i < this.profils[trouver].items.length; i++) {
      const element = this.profils[trouver].items[i]
      if (i !== indexChild) tableauIntermediaire.push(element)
    }

    // On mets à jour le tableau d'evenements
    this.profils[trouver].items = []
    for (let i = 0; i < tableauIntermediaire.length; i++) {
      this.profils[trouver].items.push(tableauIntermediaire[i])
    }

    // On mets à jour l'API
    this.miseAJourProfil(this.profils[trouver])
  }

  // For start an event
  // @arg No arguments required
  moveToEvent (child: Evenement): void {
    const objectOpcua = {
      action: 'bougerEvenement',
      position: child.values.position
    }

    const object = {
      menu: 'opcua',
      objet: objectOpcua
    }

    // On envoie la position de l'évènement
    Unreal.send(object)
  }

  // Decrement position
  // @arg No arguments required
  decrement (nombre1: number): void {
    if (nombre1 === 1) this.positionEvent.x--
    else if (nombre1 === 2) this.positionEvent.y--
    else if (nombre1 === 3) this.positionEvent.z--
  }

  // Increment position
  // @arg No arguments required
  increment (nombre1: number): void {
    if (nombre1 === 1) this.positionEvent.x++
    else if (nombre1 === 2) this.positionEvent.y++
    else if (nombre1 === 3) this.positionEvent.z++
  }

  // Modify the position of an event
  // @arg No arguments required
  modifierPosition (event: Event, child: Evenement): void {
    // Consume l'event
    event.stopPropagation()

    this.childSave = child
    this.modifyPositionBooleen = true
  }

  // Attach asset to an another
  // @arg No arguments required
  attacherObjet (): void {
    const objectOpcua = {
      action: 'attacherObjet'
    }

    const object = {
      menu: 'opcua',
      objet: objectOpcua
    }

    // On envoie le profil
    Unreal.send(object)
  }

  // Define position of event with the position of selected asset
  // @arg No arguments required
  modifierPositionWithObject (child: Evenement, idProfilParam: number): void {
    const objectOpcua = {
      action: 'envoiePositionObjetSelectionne',
      childevenement: child,
      idProfil: idProfilParam
    }
    const object = {
      menu: 'opcua',
      objet: objectOpcua
    }

    // On envoie le profil
    Unreal.send(object)
  }

  // Add profil with api request
  // @arg No arguments required
  ajouterProfil (
    nomProfil: string,
    itemsTableau: Array<Evenement>,
    idParam: number
  ): void {
    this.profils.push(
      new Profil({
        action: 'mdi-calendar-search',
        items: itemsTableau,
        title: nomProfil,
        active: false,
        id: idParam
      })
    )
  }

  // Save positions changes on event
  // @arg No arguments required
  save (): void {
    this.modifyPositionBooleen = false
    this.childSave.values.position = this.positionEvent
  }
}
</script>
