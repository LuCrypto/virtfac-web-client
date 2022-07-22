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
    <!-- Pour affecter une position à un évènement -->
    <v-dialog v-model="modifierPositionBooleen">
      <v-container class="d-flex flex-wrap flex-nowrap">
        <!-- X, Y et Z -->
        <v-row align="center">
          <v-col align="center">
            <!-- Axe -->
            <v-sheet max-width="25" :color="axesColorsArray[1]" elevation="1">
              {{ axesArray[1] }}
            </v-sheet>
            <!-- Inputs pour les coordonnées -->
            <v-text-field
              @click:prepend="decrement(1)"
              @click:append-outer="increment(1)"
              v-if="1 != 0"
              v-model="positionEvenement['x']"
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
            <!-- Inputs pour les coordonnées -->
            <v-text-field
              v-if="2 != 0"
              v-model="positionEvenement['y']"
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
            <!-- Inputs pour les coordonnées -->
            <v-text-field
              v-if="3 != 0"
              v-model="positionEvenement['z']"
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
          <!-- Pour sauvegarder la position de l'évènement -->
          <v-col align="center">
            <v-btn color="primary" text @click="save()">
              Save
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-dialog>

    <!-- Edition d'un profil -->
    <v-dialog v-model="editerProfilBooleen">
      <v-card class="overflow-y-auto rounded-lg">
        <v-container fluid class="d-flex flex-wrap">
          <!-- Pour le titre -->
          <v-row align="center" no-gutters>
            <v-col cols="1" align="center">
              Titre :
            </v-col>
            <v-col cols="11" align="center">
              <v-text-field
                v-model="profilEditer.title"
                type="text"
                :value="this.profilEditer.title"
              >
              </v-text-field>
            </v-col>
          </v-row>

          <!-- Pour les évènements -->
          <v-container
            v-for="evenement in this.profilEditer.items"
            :key="evenement.title"
          >
            <v-row align="center" no-gutters>
              <!-- Nom évènement -->
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

    <!-- La liste des profils -->
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

        <!-- Liste des évènements -->
        <v-list-item v-for="(child, index) in item.items" :key="child.title">
          <v-btn
            class="pa-5"
            min-width="90%"
            max-width="90%"
            small
            v-if="!objetDynamiqueSelectionne"
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
            v-if="objetDynamiqueSelectionne"
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

    <!-- Les différents boutons -->
    <v-container class="d-flex flex-wrap flex-nowrap">
      <v-row align="center">
        <!-- Permet de démarrer un profil avec l'objet sélectionné -->
        <v-col align="center">
          <v-btn
            class="primary black--text my-2"
            @click="demarreProfil()"
            large
            elevation="2"
          >
            Démarrer le profil
          </v-btn>
        </v-col>
        <!-- Permet de démarrer avec tous les objets de la scene -->
        <v-col align="center">
          <v-btn
            class="primary black--text my-2"
            @click="demarreProfilGlobal()"
            large
            elevation="2"
          >
            Démarrer le profil global
          </v-btn>
        </v-col>
        <!-- Permet de supprimer le profil actif -->
        <v-col align="center">
          <v-btn
            class="primary black--text my-2"
            @click="supprimerProfil()"
            large
            elevation="2"
          >
            Supprimer le profil
          </v-btn>
        </v-col>
        <!-- Permet d'attacher un objet à un autre -->
        <v-col align="center">
          <v-btn
            class="primary black--text my-2"
            @click="attacherObjet()"
            large
            elevation="2"
          >
            Attacher un objet
          </v-btn>
        </v-col>
        <!-- Ajouter un evenement -->
        <v-col align="center">
          <v-btn
            @click="ajouterEvenement"
            class="primary black--text my-2"
            large
            elevation="2"
          >
            Ajouter un evenement
          </v-btn>
        </v-col>

        <v-col align="center">
          <v-btn
            @click="cheminObjetSelectionne"
            class="primary black--text my-2"
            large
            elevation="2"
          >
            Chemin objet selectionné
          </v-btn>
        </v-col>

        <v-col align="center">
          <v-btn
            @click="cheminGlobal"
            class="primary black--text my-2"
            large
            elevation="2"
          >
            Chemin global
          </v-btn>
        </v-col>
      </v-row>
    </v-container>

    <!-- Deuxieme barre bouton -->
    <v-container class="d-flex flex-wrap flex-nowrap">
      <v-row align="center">
        <v-col align="center">
          <v-btn
            class="primary black--text my-2"
            @click="assignerProfilScene()"
            large
            elevation="2"
          >
            Assigner un profil à la scène
          </v-btn>
        </v-col>

        <!-- Profil selectionné -->
        <v-col align="center">
          <v-select
            class="black--text"
            label="Profil selectionné"
            v-model="monProfilSelection"
            :items="this.profils.map(item => item.title)"
            dense
          >
          </v-select>
        </v-col>

        <!-- Scene selectionnée -->
        <v-col align="center">
          <v-select
            class="black--text"
            label="Scene selectionnée"
            v-model="maSceneSelection"
            :items="this.scenes.map(item => item.name)"
            dense
          >
          </v-select>
        </v-col>
      </v-row>
    </v-container>

    <!-- Troisième barre bouton -->
    <v-container
      v-if="!unrealContext.check()"
      class="d-flex flex-wrap flex-nowrap"
    >
      <v-row align="center">
        <!-- Permet de charger un fichier witness pour un profil -->
        <v-col align="center">
          <v-btn
            @click="openUploadFile"
            class="primary black--text my-2"
            large
            elevation="2"
          >
            Charger un fichier profil
            <input
              accept="application/JSON"
              ref="uploadFileInput"
              hidden
              type="file"
              @change="onUploadSceneUpdate"
            />
          </v-btn>
        </v-col>

        <!-- Permet d'edtier le profil courant -->
        <v-col align="center">
          <v-btn
            @click="editerProfil"
            class="primary black--text my-2"
            large
            elevation="2"
          >
            Editer le profil courant
          </v-btn>
        </v-col>

        <!-- Permet d'écouter sur le serveur -->
        <v-col align="center">
          <v-btn
            class="primary black--text my-2"
            @click="ecouterServeur()"
            large
            elevation="2"
          >
            Écouter les ids du serveur (do nothing)
          </v-btn>
        </v-col>
      </v-row>
    </v-container>

    <!-- Objet dynamique -->
    <v-container
      v-if="objetDynamiqueSelectionne"
      class="d-flex flex-wrap flex-nowrap"
    >
      <v-row align="center">
        <!-- Permet de charger un fichier witness pour un profil -->
        <v-col align="center">
          Objet dynamique sélectionné !
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
  positionEvenement = new Vector3(0, 0, 0)
  childSave: Evenement = new Evenement({ name: 'Evenement 1' })
  modifierPositionBooleen = false
  maSceneSelection = ''
  monProfilSelection = ''
  scenes: CardModel[] = []
  premiereFois = true
  editerProfilBooleen = false
  objetDynamiqueSelectionne = false
  profilEditer: Profil = new Profil({})

  // Liste des profils
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

  // Begin
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
      // Quand on recoit un nouveau évènement
      if (test.message === 'envoieEvenement') {
        const test2 = test.object as evenementClass
        Unreal.send(test2)

        if (this.premiereFois) {
          this.ajouterProfil('Nouveau Profil', [], 9)
          this.premiereFois = false
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
        Unreal.send('Bien recu position')
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
          Unreal.send("Probleme, impossible de trouver l'id du profil")
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
        Unreal.send('RECU !')

        let indiceChercher = -1
        for (let i = 0; i < this.profils.length; i++) {
          const element = this.profils[i]
          if (element.id === test.object.profil) {
            indiceChercher = i
          }
        }

        if (indiceChercher !== -1) {
          var objectOpcua = {
            action: 'listeEvenement',
            evenements: this.profils[indiceChercher].items,
            nomObjet: test.object.nomObjet
          }
          Unreal.send('RECU 2 !')

          var object = {
            menu: 'opcua',
            objet: objectOpcua
          }

          // On envoie la liste
          Unreal.send(object)
        } else {
          Unreal.send('Probleme')
        }
      } else if (test.message === 'objetDynamiqueSelectionne') {
        Unreal.send('objetDynamiqueSelectionne')
        this.objetDynamiqueSelectionne = true
      } else if (test.message === 'infosObjetDynamique') {
        const indiceProfil = test.object.idProfil
        Unreal.send('infosObjetDynamique : ' + indiceProfil)
        Unreal.send('infosObjetDynamique : ' + JSON.stringify(test.object))

        let indiceProfilTableau = -1
        for (let i = 0; i < this.profils.length; i++) {
          const element = this.profils[i]
          if (element.id === indiceProfil) {
            indiceProfilTableau = i
            break
          }
        }

        if (indiceProfilTableau === -1) {
          Unreal.send("Probleme, impossible de trouver l'id du profil")
        } else {
          if (test.object.vide) {
            Unreal.send('VIDE')
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
            Unreal.send('PLEINS')
            // On parcourt le tableau et on mets à jour
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

  // Permet de récupérer les attributs de l'objet selectionne
  getAttribueObjetDynamique (idProfil: number, attributs: any): void {
    console.log('getAttribueObjetDynamique')
    // this.profils[idProfil].items = attributs
  }

  // Permet de round un Vector3
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

  // Assigner un profil à une scène
  assignerProfilScene (): void {
    console.log('assignerProfilScene')
    if (this.maSceneSelection === '') return
    if (this.monProfilSelection === '') return

    let idSceneModif = -1
    for (let i = 0; i < this.scenes.length; i++) {
      if (this.maSceneSelection === this.scenes[i].name) {
        idSceneModif = i
        break
      }
    }
    if (idSceneModif === -1) return

    let idProfilModif = -1
    for (let i = 0; i < this.scenes.length; i++) {
      if (this.monProfilSelection === this.profils[i].title) {
        idProfilModif = i
        break
      }
    }

    if (idProfilModif === -1) return
    console.log('Assigner')

    const scene = this.scenes[idSceneModif]
    // this.profils[idProfilModif].
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

    var objectOpcua = {
      action: 'rafraichirScene'
    }

    var object = {
      menu: 'opcua',
      objet: objectOpcua
    }

    // On demande de rafraichir les scenes
    Unreal.send(object)
  }

  // Permet de récupérer les scènes
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

  // Ouvre l'édition de profil
  editerProfil (): void {
    let trouver = -1
    for (let i = 0; i < this.profils.length; i++) {
      const element = this.profils[i].active
      if (element) trouver = i
    }

    this.editerProfilBooleen = true
    this.profilEditer = this.profils[trouver]
  }

  // Permet d'ajouter un evenement à un profil
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

  // Permet d'afficher le chemin de l'objet sélectionné
  cheminObjetSelectionne (): void {
    console.log('cheminObjetSelectionne')

    let trouver = -1
    for (let i = 0; i < this.profils.length; i++) {
      const element = this.profils[i].active
      if (element) trouver = i
    }

    var objectOpcua = {
      action: 'cheminObjetSelectionne',
      profil: this.profils[trouver]
    }

    var object = {
      menu: 'opcua',
      objet: objectOpcua
    }

    // On envoie le profil
    Unreal.send(object)
  }

  // Permet d'afficher le chemin de tous les objets du profil
  cheminGlobal (): void {
    console.log('cheminGlobal')

    let trouver = -1
    for (let i = 0; i < this.profils.length; i++) {
      const element = this.profils[i].active
      if (element) trouver = i
    }

    var objectOpcua = {
      action: 'cheminGlobal',
      profil: this.profils[trouver]
    }

    var object = {
      menu: 'opcua',
      objet: objectOpcua
    }

    // On envoie le profil
    Unreal.send(object)
  }

  // Permet de récupérer le fichier qu'on veut upload
  openUploadFile (): void {
    const uploadFileInput = this.$refs.uploadFileInput as HTMLInputElement
    if (uploadFileInput == null) return
    uploadFileInput.value = ''
    uploadFileInput.click()
  }

  // Charger un profil
  onUploadSceneUpdate (e: Event): void {
    if (e.target == null) return
    const target = e.target as HTMLInputElement
    if (target.files != null && target.files.length > 0) {
      [...target.files].forEach(file => {
        const reader = new FileReader()
        reader.onload = e => {
          console.log(e)
          console.log(reader.result)
          const content: string = reader.result as string
          console.log('content : ', content)
          console.log('name : ', file.name)
          const tableau: string[] = content.split('\r\n')

          const nomFichier: string = file.name
          const nomFichierProfil = nomFichier.split('.json')[0]

          // Crée un profil
          this.ajouterProfil(nomFichierProfil, [], -1)

          // Chaque ligne du fichier
          for (let i = 0; i < tableau.length; i++) {
            console.log('tableau : ', tableau[i])
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

  // Permet de sauvegarder le profil modifié
  saveProfil (): void {
    console.log('this.profilEditer : ', this.profilEditer)
    this.editerProfilBooleen = false

    // Mettre à jour le profil
    this.miseAJourProfil(this.profilEditer)
  }

  // Permet d'ajouter un profil à l'API
  ajouterAPIProfil (profil: Profil): void {
    console.log('AJOUTER API PROFIL')
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

  // Mise à jour avec requete API
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

  // API : récupérer les profils
  getProfils (): void {
    console.log('getProfils')
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
      console.log('monAssetTableau : ', monAssetTableau[0])

      for (let i = 0; i < monAssetTableau.length; i++) {
        const element = monAssetTableau[i]

        var monTableau = []
        const monJson = JSON.parse(element.events)

        for (let j = 0; j < monJson.length; j++) {
          const elementObjet = monJson[j]

          console.log('elementObjet : ', elementObjet)

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

          console.log('objet : ', objet)

          monTableau.push(objet)
        }
        this.ajouterProfil(element.name, monTableau, element.id)
      }
      console.log('Profils final : ', this.profils)
    })
  }

  // Permet de démarrer la simulation du profil avec un objet
  demarreProfil (): void {
    let trouver = -1
    for (let i = 0; i < this.profils.length; i++) {
      const element = this.profils[i].active
      if (element) trouver = i
    }

    var objectOpcua = {
      action: 'demarreProfil',
      profil: this.profils[trouver]
    }

    var object = {
      menu: 'opcua',
      objet: objectOpcua
    }

    // On envoie le profil
    Unreal.send(object)
  }

  // Permet de démarrer la simulation du profil avec tous les objets
  demarreProfilGlobal (): void {
    let trouver = -1
    for (let i = 0; i < this.profils.length; i++) {
      const element = this.profils[i].active
      if (element) trouver = i
    }

    var objectOpcua = {
      action: 'demarreProfilGlobal',
      profil: this.profils[trouver]
    }

    var object = {
      menu: 'opcua',
      objet: objectOpcua
    }

    // On envoie le profil
    Unreal.send(object)
  }

  // Permet de supprimer le profil actif
  supprimerProfil (): void {
    let trouver = -1
    for (let i = 0; i < this.profils.length; i++) {
      if (this.profils[i].active) {
        trouver = i
        break
      }
    }

    console.log('trouver : ', trouver)
    console.log('this.profils : ', this.profils)

    // Delete
    this.profils.splice(trouver, 1)
    console.log('this.profils : ', this.profils)

    // Faire requete api
    this.supprimerAPIProfil(this.profils[trouver])
  }

  // Permet de supprimer un profil avec API
  supprimerAPIProfil (profil: Profil): void {
    console.log('supprimerAPIProfil')
    API.delete(
      this,
      `/resources/dynamics-object-profiles/${profil.id}`,
      ''
    ).then((response: Response) => {
      console.log('supprimer profil : ', response)
    })
  }

  // Permet de charger un fichier profil
  chargerProfil (): void {
    console.log('chargerProfil')
  }

  // ???
  ecouterServeur (): void {
    console.log('ecouterServeur !')
  }

  // Permet de supprimer un évènement d'un profil
  supprimerEvenement (indexChild: number): void {
    console.log('supprimerEvenement')

    // On trouve le profil
    let trouver = -1
    for (let i = 0; i < this.profils.length; i++) {
      const element = this.profils[i].active
      if (element) trouver = i
    }

    console.log('taille : ', this.profils[trouver].items.length)

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
    console.log('taille : ', this.profils[trouver].items.length)

    // On mets à jour l'API
    this.miseAJourProfil(this.profils[trouver])
  }

  // Permet de démarrer l'evenement
  moveToEvent (child: Evenement): void {
    Unreal.send('Child : ' + JSON.stringify(child))
    Unreal.send('position : ' + child.values.position.x)

    var objectOpcua = {
      action: 'bougerEvenement',
      position: child.values.position
    }

    var object = {
      menu: 'opcua',
      objet: objectOpcua
    }

    // On envoie la position de l'évènement
    Unreal.send(object)
  }

  // Permet de décrementer la position
  decrement (nombre1: number): void {
    console.log('nombre 1 : ', nombre1)

    if (nombre1 === 1) this.positionEvenement.x--
    else if (nombre1 === 2) this.positionEvenement.y--
    else if (nombre1 === 3) this.positionEvenement.z--
  }

  // Permet d'augmenter la position
  increment (nombre1: number): void {
    console.log('nombre 1 : ', nombre1)

    if (nombre1 === 1) this.positionEvenement.x++
    else if (nombre1 === 2) this.positionEvenement.y++
    else if (nombre1 === 3) this.positionEvenement.z++
  }

  // Permet de modifier la position d'un évènement
  modifierPosition (event: Event, child: Evenement): void {
    // Consume l'event
    event.stopPropagation()

    this.childSave = child
    this.modifierPositionBooleen = true
  }

  // Permet d'attacher un objet à un autre
  attacherObjet (): void {
    console.log('attacherObjet')

    var objectOpcua = {
      action: 'attacherObjet'
    }

    var object = {
      menu: 'opcua',
      objet: objectOpcua
    }

    // On envoie le profil
    Unreal.send(object)
  }

  // Permet de définir la position de l'évènement
  // avec la position de l'objet sélectionné
  modifierPositionWithObject (child: Evenement, idProfilParam: number): void {
    var objectOpcua = {
      action: 'envoiePositionObjetSelectionne',
      childevenement: child,
      idProfil: idProfilParam
    }
    var object = {
      menu: 'opcua',
      objet: objectOpcua
    }

    // On envoie le profil
    Unreal.send(object)
  }

  // Permet d'ajouter un profil permettant de stocker une liste d'profils
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

  // Permet de sauvegarder les modifications des positions sur un évènement
  save (): void {
    this.modifierPositionBooleen = false
    this.childSave.values.position = this.positionEvenement
  }
}
</script>
