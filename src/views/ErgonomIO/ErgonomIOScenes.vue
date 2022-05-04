<template>
  <v-container fluid style="max-height: 100%; overflow: auto;">
    <!-- Titre -->
    <v-container fluid class="text-h3 text-center py-8">
      Scene manager
    </v-container>
    <v-divider></v-divider>
    <!-- Milieu de page : les différentes cartes de scènes -->
    <template>
      <v-row dense class="pa-2">
        Les différentes scènes :
      </v-row>

      <!-- Popup permettant d'afficher des informations sur une scène -->
      <v-row justify="center">
        <v-dialog v-model="popup" max-width="780">
          <v-card>
            <v-card-title> {{ titrePopup }} </v-card-title>
            <v-card-text>
              {{ textePopup }}
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="green darken-1" text @click="popup = false">
                OK
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>

      <!-- Popup permettant d'afficher de créer une scène avec json -->
      <v-row justify="center">
        <v-dialog v-model="creerSceneJson" max-width="780">
          <v-card>
            <v-card-title> Glisser un fichier scene json </v-card-title>

            <v-card-actions>
              <v-btn
                class="ml-6 mt-6 flex-grow-1"
                color="primary"
                @click="openUploadFile"
              >
                <v-icon v-text="'mdi-upload'"></v-icon>
                Upload new
                <input
                  ref="uploadFileInput"
                  hidden
                  type="file"
                  @change="updateUploadFileSceneJson"
                />
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn
                color="green darken-1"
                text
                @click="creerSceneJson = false"
              >
                OK
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>

      <!-- Popup permettant de modifier des données de la scène -->
      <v-row justify="center">
        <v-dialog v-model="modifierScene" max-width="780">
          <v-card>
            <v-card-title> Modifier des données </v-card-title>

            <v-container fluid>
              <v-row>
                <v-col cols="3">
                  <v-card-text>
                    Nouveau titre :
                  </v-card-text>
                </v-col>

                <v-col cols="4">
                  <v-text-field v-model="search"> </v-text-field>
                </v-col>
              </v-row>
            </v-container>

            <v-container fluid>
              <v-row>
                <v-col cols="3">
                  <v-card-text>
                    Nouveau tag :
                  </v-card-text>
                </v-col>

                <v-col cols="4">
                  <v-text-field v-model="nouveauTag"> </v-text-field>
                </v-col>

                <v-col cols="3">
                  <v-btn v-on:click="ajouterTag(sceneChoisie, nouveauTag)" icon>
                    <v-icon v-text="'mdi-plus'"></v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>

            <v-container fluid>
              <v-img height="270" :src="nouvelleImage"> </v-img>
              <v-btn
                class="ml-6 mt-6 flex-grow-1"
                color="primary"
                @click="openUploadFile"
              >
                <v-icon v-text="'mdi-upload'"></v-icon>
                Upload new
                <input
                  ref="uploadFileInput"
                  hidden
                  type="file"
                  @change="updateUploadFile"
                />
              </v-btn>
            </v-container>

            <v-container
              fluid
              :key="indexTag2"
              v-for="(tag, indexTag2) in sceneChoisie.parsedTags"
            >
              <v-row>
                <v-col cols="2">
                  <v-card-text>
                    {{ tag }}
                  </v-card-text>
                </v-col>

                <v-col cols="3">
                  <v-btn v-on:click="supprimerTag(sceneChoisie, tag)" icon>
                    <v-icon v-text="'mdi-delete'"></v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>

            <v-card-actions>
              <v-btn
                color="green darken-1"
                text
                @click="copieScene(sceneChoisie)"
              >
                Faire une copie de la scène
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn color="green darken-1" text @click="save(sceneChoisie)">
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>

      <!-- Les différentes scènes -->
      <v-card
        class="overflow-y-auto d-flex flex-row flex-wrap"
        width="100%"
        max-height="775"
      >
        <v-card
          :key="indexCard"
          v-for="(card, indexCard) in cards"
          :width="tailleCardString"
          class="ma-3"
          elevation="5"
          v-on:click="envoyerUnreal(card)"
        >
          <v-img height="270" :src="card.picture"> </v-img>
          <v-sheet height="4" :color="`#${card.color.toString(16)}`"> </v-sheet>
          <v-card-title>
            {{ card.name }}
            <v-btn v-on:click="editerNomScene(card)" icon>
              <v-icon v-text="'mdi-pencil'"></v-icon>
            </v-btn>
          </v-card-title>
          <v-card-subtitle>
            <v-chip
              :key="indexTag"
              v-for="(tag, indexTag) in card.parsedTags"
              class="mr-2 overflow-y-auto"
            >
              {{ tag }}
            </v-chip>
          </v-card-subtitle>
          <v-card-text>
            {{ card.formatedCreationDate }}, nombre assets :
            {{ card.assetsNumber }}
          </v-card-text>

          <v-card-actions>
            <v-btn color="primary" v-on:click="ergonomioLayout()">
              Layout
            </v-btn>
            <v-btn color="primary" v-on:click="ergonomioVirtualTwin()">
              Virtual Twin
            </v-btn>

            <v-spacer></v-spacer>

            <v-btn v-on:click="downloadScene(card)" icon>
              <v-icon v-text="'mdi-download'"></v-icon>
            </v-btn>
            <v-btn v-on:click="outline(card)" icon>
              <v-icon v-text="'mdi-eye'"></v-icon>
            </v-btn>
            <v-btn v-on:click="clickScene(card)" icon>
              <v-icon v-text="'mdi-information'"></v-icon>
            </v-btn>
            <v-btn v-on:click="supprimerObjet(card)" icon>
              <v-icon v-text="'mdi-delete'"></v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-card>
    </template>
    <!-- Les différents boutons -->
    <v-layout justify-center class="py-4">
      <v-flex class="flex-grow-0 mx-5">
        <!-- Bouton permettant de créer une scène vide -->
        <v-btn
          v-on:click="createEmptyScene"
          class="primary black--text"
          large
          elevation="2"
        >
          Create new empty scene
        </v-btn>
      </v-flex>
      <v-flex class="flex-grow-0 mx-5">
        <!-- Bouton permettant de créer une scène vide -->
        <v-btn
          v-on:click="creerSceneJson = true"
          class="yellow darken-3 font-weight-black"
          large
          elevation="2"
        >
          Créer une scène avec json
        </v-btn>
      </v-flex>
      <v-flex class="flex-grow-0 mx-5">
        <!-- Bouton permettant de charger une scène -->
        <v-btn
          v-on:click="loadScene"
          class="primary black--text"
          large
          elevation="2"
        >
          Load scene
          <input
            accept="application/JSON"
            ref="uploadFileInput"
            hidden
            type="file"
            @change="updateUploadFileChargerScene"
          />
        </v-btn>
      </v-flex>
      <v-flex class="flex-grow-0 mx-5">
        <!-- Bouton permettant de rajouter un objet dans une scène -->
        <v-btn
          v-on:click="addObjectInScene"
          class="primary black--text"
          large
          elevation="2"
        >
          Add object in scene
        </v-btn>
      </v-flex>
      <!-- Sélection de la scene choisie -->
      <v-flex class="flex-grow-0 mx-5">
        <v-select
          :items="cards.map(item => item.name)"
          v-model="variable"
          label="Scène visée"
          dense
        ></v-select>
      </v-flex>
      <v-flex class="flex-grow-0 mx-5">
        <v-btn v-on:click="baisserTailleCard()" icon>
          <v-icon v-text="'mdi-minus'"></v-icon>
        </v-btn>
        <v-btn v-on:click="augmenterTailleCard()" icon>
          <v-icon v-text="'mdi-plus'"></v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
// ============================================================================
// ============================================================================
// ============================================================================

import { Component, Vue } from 'vue-property-decorator'
import API from '@/utils/api'
import Unreal from '@/utils/unreal'
import CardModel from '@/utils/cardModel'

// Scene recue d'unreal
class SceneRecue {
  name = ''
  folder = ''
  type = ''
  position = []
  rotation = []
  scale = []

  constructor () {
    Object.assign(this)
  }
}

class SceneInfo {
  nombreAssets = 0
  idScene = 0

  constructor () {
    Object.assign(this)
  }
}

class Autre {
  scene: SceneInfo = new SceneInfo()
  assets: SceneRecue[] = []

  constructor (params: Partial<SceneRecue>) {
    Object.assign(this, params)
  }
}

// Message venant d'Unreal
class messageUnreal {
  message = ''
  nomScene = ''
  // dataRoom: CardModel = new CardModel({})
  data: Autre = new Autre({})

  constructor (params: Partial<Autre>) {
    Object.assign(this, params)
  }
}

@Component
export default class ErgonomIOAssets extends Vue {
  // Initialisation
  cards: CardModel[] = []
  cards2: CardModel[] = []
  titrePopup = ''
  textePopup = ''
  popup = false
  creerSceneJson = false
  modifierScene = false

  search = ''
  sceneChoisie: any = new CardModel({ id: 2 })

  nouveauTag = ''
  nouvelleImage = ''

  tailleCard = 30
  tailleCardString = '30%'

  variable = ''

  // Begin
  mounted (): void {
    this.requeteAPI()

    Unreal.callback.$on('unreal-message', (data: unknown) => {
      this.$root.$emit('bottom-message', `Unreal : ${JSON.stringify(data)}`)
      // Unreal.send('Message recu !')
      // Unreal.send(data)

      var maScene = data as Autre
      // var mesData = maScene.assets as string

      Unreal.send(maScene.assets[0].name)
      Unreal.send(maScene.scene.nombreAssets.toString())
      Unreal.send(maScene.scene.idScene.toString())
      Unreal.send(maScene.assets)

      var maCard = new CardModel({
        assetsNumber: maScene.scene.nombreAssets,
        id: maScene.scene.idScene,
        name: 'aymeric.json',
        data: JSON.stringify(maScene.assets)
      })

      this.miseAJourScene(maCard)

      // switch (data.message) {
      //   case 'modifierScene':
      //     Unreal.send('salut ça marche : ')

      //     // this.rooms.push(data.dataRoom)
      //     break
      //   default:
      // }
    })
  }

  // Requête API permettant de récupérer toutes les scènes
  requeteAPI (): void {
    console.log('api ')
    API.post(
      this,
      '/resources/ergonomio-scenes',
      JSON.stringify({
        select: [],
        where: []
      })
    ).then((response: Response) => {
      console.log('response ', response)
      this.cards2 = ((response as unknown) as Array<Partial<CardModel>>).map(
        (scene: Partial<CardModel>) => new CardModel(scene)
      )

      console.log('data : ', this.cards2[0].data)

      for (let i = 0; i < this.cards2.length; i++) {
        this.cards.push(this.cards2[i])
      }
      this.cards2 = []
    })
  }

  // Boutons scènes cards
  ergonomioLayout (): void {
    console.log('ergonomioLayout !')
  }

  ergonomioVirtualTwin (): void {
    console.log('ergonomioVirtualTwin !')
  }

  // Permet de créer une scène vide
  createEmptyScene (): void {
    console.log('creerSceneVide')
    const scene = new CardModel({ id: this.cards.length })
    scene.parsedTags.push('vide')
    this.cards.push(scene)

    this.ajouterSceneAPI(scene)
  }

  // Permet de faire une requête API pour ajouter une scène
  ajouterSceneAPI (scene: CardModel): void {
    API.put(
      this,
      '/resources/ergonomio-scenes',
      JSON.stringify({
        assetsNumber: scene.assetsNumber,
        color: scene.color,
        creationDate: scene.creationDate,
        data: scene.data,
        id: scene.id,
        idProject: scene.idProject,
        idUserOwner: scene.idUserOwner,
        modificationDate: scene.modificationDate,
        name: scene.name,
        picture: scene.picture,
        tags: JSON.stringify(scene.parsedTags)
      })
    ).then((response: Response) => {
      console.log('api modif scene')
    })
  }

  // Permet de faire une requête API pour supprimer une scène
  supprimerSceneAPi (id: number): void {
    API.delete(this, `/resources/ergonomio-scenes/${id}`, '').then(
      (response: Response) => {
        console.log('supprimer scene')
      }
    )
  }

  // Permet de charger une scène à partir d'un fichier scène
  chargerScene (): void {
    console.log('Charger scene')
    this.openUploadFile()
  }

  // Permet d'activer le fait de pouvoir ajouter un objet
  addObjectInScene (scene: CardModel): void {
    console.log('addObjectInScene')

    console.log('variable : ', this.variable)

    if (this.variable !== '') {
      // Activer le mode pour ajouter des objets dans la scène
      var objectAsset = {
        name: this.variable,
        action: 'ajouterObjetScene'
      }

      var object = {
        menu: 'scene',
        objet: objectAsset
      }

      Unreal.send(object)
    }
  }

  // Permet de mettre à jour la scène
  miseAJourSceneFichier (data: unknown): void {
    console.log('data : ', data)
  }

  // Permet de supprimer la scène en question
  supprimerObjet (scene: CardModel): void {
    console.log('Supprimer objet ')

    const index2 = this.cards.indexOf(scene, 0)

    if (index2 > -1) {
      this.cards.splice(index2, 1)
    }

    this.supprimerSceneAPi(scene.id)

    console.log('length : ', this.cards.length)
    console.log('length : ', this.cards)
  }

  // Permet d'afficher dans une popup des informations sur la scene
  clickScene (scene: CardModel): void {
    console.log('clickScene : ', scene.id)
    this.popup = true
    this.titrePopup = scene.name

    this.textePopup = scene.data

    Unreal.send('test lol quentin fort')
  }

  // Aymeric todo
  outline (scene: CardModel): void {
    console.log('Aymeric todo !')
  }

  // Permet de modifier le nom d'une scène
  editerNomScene (scene: CardModel): void {
    console.log('editerNomScene ')
    this.modifierScene = true
    this.sceneChoisie = scene
  }

  // Permet de télécharger une scène
  downloadScene (scene: CardModel): void {
    console.log('downloadScene ! ')

    const data = JSON.stringify(scene)
    const blob = new Blob([data], { type: 'text/plain' })

    var url = URL.createObjectURL(blob)
    var pom = document.createElement('a')
    pom.setAttribute('style', 'display: none;')
    pom.href = url
    pom.setAttribute('download', scene.name + '.json')
    pom.click()
  }

  // Permet de modifier une scene
  save (scene: CardModel): void {
    console.log('save : ', this.search)
    this.modifierScene = false

    if (this.nouvelleImage !== '') {
      scene.picture = this.nouvelleImage
    }

    if (this.search.length !== 0) scene.name = this.search
    this.miseAJourScene(scene)

    this.nouvelleImage = ''
  }

  // Permet de copier la scène
  copieScene (scene: CardModel): void {
    console.log('copieScene !')

    this.cards.push(scene)
    this.ajouterSceneAPI(scene)
  }

  // Permet d'ajouter un tag à une scène
  ajouterTag (scene: CardModel, tag: string): void {
    console.log('ajouterTag')

    scene.parsedTags.push(tag)
  }

  // Permet de supprimer un tab d'une scène
  supprimerTag (scene: CardModel, tags: string): void {
    console.log('supprimerTag')

    const index = scene.parsedTags.indexOf(tags, 0)

    if (index > -1) {
      scene.parsedTags.splice(index, 1)
    }
    this.miseAJourScene(scene)
  }

  // Permet de mettre à jour une scène
  miseAJourScene (scene: CardModel): void {
    // Requête API pour mettre à jour la scène
    API.patch(
      this,
      `/resources/ergonomio-scenes/${scene.id}`,
      JSON.stringify({
        assetsNumber: scene.assetsNumber,
        color: scene.color,
        creationDate: scene.creationDate,
        data: scene.data,
        id: scene.id,
        idProject: scene.idProject,
        idUserOwner: scene.idUserOwner,
        modificationDate: scene.modificationDate,
        name: scene.name,
        picture: scene.picture,
        tags: JSON.stringify(scene.parsedTags)
      })
    ).then((response: Response) => {
      console.log('api modif scene')
    })
  }

  // Permet de récupérer le fichier qu'on veut upload
  openUploadFile (): void {
    const uploadFileInput = this.$refs.uploadFileInput as HTMLInputElement
    if (uploadFileInput == null) return
    uploadFileInput.value = ''
    uploadFileInput.click()
  }

  // Charger une scène
  updateUploadFileChargerScene (e: Event): void {
    if (e.target == null) return
    const target = e.target as HTMLInputElement
    if (target.files != null && target.files.length > 0) {
      [...target.files].forEach(file => {
        const reader = new FileReader()
        reader.onload = e => {
          console.log(reader.result)
          console.log('============')
          console.log('============')
          console.log('============')
          console.log(JSON.parse(reader.result as string))

          const test = new CardModel(JSON.parse(reader.result as string))
          this.cards.push(test)
          this.ajouterSceneAPI(test)

          console.log('test name : ', test.name)
        }

        reader.onerror = error => {
          console.error(error)
          this.$root.$emit('bottom-message', 'Sorry, we cannot read this file.')
        }
        reader.readAsText(file)
      })
    }
  }

  // Permet de lire le fichier uploadé
  updateUploadFile (e: Event): void {
    if (e.target == null) return
    const target = e.target as HTMLInputElement
    if (target.files != null && target.files.length > 0) {
      [...target.files].forEach(file => {
        const reader = new FileReader()
        reader.onload = () => {
          const fileString = reader.result as string

          this.nouvelleImage = fileString
          console.log('fileString : ', fileString)
        }
        reader.onerror = error => {
          console.error(error)
          this.$root.$emit('bottom-message', 'Sorry, we cannot read this file.')
        }
        reader.readAsDataURL(file)
      })
    }
  }

  // Permet de lire le fichier uploadé
  updateUploadFileSceneJson (e: Event): void {
    if (e.target == null) return
    const target = e.target as HTMLInputElement
    if (target.files != null && target.files.length > 0) {
      [...target.files].forEach(file => {
        const reader = new FileReader()
        reader.onload = () => {
          const fileString = reader.result as string

          // this.nouvelleImage = fileString
          console.log('fileString : ', fileString)
        }
        reader.onerror = error => {
          console.error(error)
          this.$root.$emit('bottom-message', 'Sorry, we cannot read this file.')
        }
        reader.readAsDataURL(file)
      })
    }
  }

  // Permet de baisser la taille des cards
  baisserTailleCard (): void {
    this.tailleCard -= 10
    if (this.tailleCard < 10) this.tailleCard = 10
    this.tailleCardString = this.tailleCard.toString() + '%'
  }

  // Permet d'augmenter la taille des cards
  augmenterTailleCard (): void {
    this.tailleCard += 10
    if (this.tailleCard > 50) this.tailleCard = 50
    this.tailleCardString = this.tailleCard.toString() + '%'
  }

  // Permet d'envoyer un message à l'instance unreal
  // Permet de charger sur la scène cliquée
  envoyerUnreal (scene: CardModel): void {
    console.log('asset.name : ', scene.name)

    var objectAsset = {
      name: scene.name,
      assetsNumber: scene.assetsNumber,
      assets: JSON.parse(scene.data),
      idScene: scene.id,
      action: 'chargerScene'
    }

    var object = {
      menu: 'scene',
      objet: objectAsset
    }

    console.log('data : ', scene.data)

    // Unreal.send(object)
  }
}
</script>
