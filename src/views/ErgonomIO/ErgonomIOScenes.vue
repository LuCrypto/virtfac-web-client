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
            <v-card-title> {{ titlePopup }} </v-card-title>
            <v-card-text>
              {{ textPopup }}
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
        <v-dialog v-model="createSceneJson" max-width="780">
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
                @click="createSceneJson = false"
              >
                OK
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>

      <!-- Popup permettant de modifier des données de la scène -->
      <v-row justify="center">
        <v-dialog v-model="modifyScene" max-width="780">
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
                  <v-text-field v-model="newTag"> </v-text-field>
                </v-col>

                <v-col cols="3">
                  <v-btn v-on:click="addTag(sceneChoose, newTag)" icon>
                    <v-icon v-text="'mdi-plus'"></v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>

            <v-container fluid>
              <v-img height="270" :src="newImage"> </v-img>
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
              v-for="(tag, indexTag2) in sceneChoose.parsedTags"
            >
              <v-row>
                <v-col cols="2">
                  <v-card-text>
                    {{ tag }}
                  </v-card-text>
                </v-col>

                <v-col cols="3">
                  <v-btn v-on:click="deleteTag(sceneChoose, tag)" icon>
                    <v-icon v-text="'mdi-delete'"></v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>

            <v-card-actions>
              <v-btn
                color="green darken-1"
                text
                @click="copyScene(sceneChoose)"
              >
                Faire une copie de la scène
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn color="green darken-1" text @click="save(sceneChoose)">
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
          :key="indexScene"
          v-for="(scene, indexScene) in scenes"
          :width="sizeCardString"
          class="ma-3"
          elevation="5"
          v-on:click="sendUnreal(scene)"
        >
          <v-img height="270" :src="scene.picture"> </v-img>
          <v-sheet height="4" :color="`#${scene.color.toString(16)}`">
          </v-sheet>
          <v-card-title>
            {{ scene.name }}
            <v-btn v-on:click="editNameScene(scene)" icon>
              <v-icon v-text="'mdi-pencil'"></v-icon>
            </v-btn>
          </v-card-title>
          <v-card-subtitle>
            <v-chip
              :key="indexTag"
              v-for="(tag, indexTag) in scene.parsedTags"
              class="mr-2 overflow-y-auto"
            >
              {{ tag }}
            </v-chip>
          </v-card-subtitle>
          <v-card-text>
            {{ scene.formatedCreationDate }}, nombre assets :
            {{ scene.assetsNumber }}, id : {{ scene.id }}
          </v-card-text>

          <v-card-actions>
            <v-btn color="primary" v-on:click="ergonomioLayout()">
              Layout
            </v-btn>
            <v-btn color="primary" v-on:click="ergonomioVirtualTwin()">
              Virtual Twin
            </v-btn>

            <v-spacer></v-spacer>

            <v-btn v-on:click="downloadScene(scene)" icon>
              <v-icon v-text="'mdi-download'"></v-icon>
            </v-btn>
            <v-btn v-on:click="outline(scene)" icon>
              <v-icon v-text="'mdi-eye'"></v-icon>
            </v-btn>
            <v-btn v-on:click="clickScene(scene)" icon>
              <v-icon v-text="'mdi-information'"></v-icon>
            </v-btn>
            <v-btn v-on:click="deleteObjet(scene)" icon>
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
        <!-- <v-btn
          v-on:click="createSceneJson = true"
          class="yellow darken-3 font-weight-black"
          large
          elevation="2"
        >
          Créer une scène avec json
        </v-btn> -->
      </v-flex>
      <v-flex class="flex-grow-0 mx-5">
        <!-- Bouton permettant de charger une scène -->
        <v-btn
          v-on:click="openUploadFile"
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
            @change="onUploadSceneUpdate"
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
          :items="scenes.map(item => item.name)"
          v-model="sceneForModif"
          label="Scène visée"
          dense
        ></v-select>
      </v-flex>
      <v-flex class="flex-grow-0 mx-5">
        <v-btn v-on:click="decreaseSizeCard()" icon>
          <v-icon v-text="'mdi-minus'"></v-icon>
        </v-btn>
        <v-btn v-on:click="increaseSizeCard()" icon>
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

class CardModel {
  // Initialisation
  name = 'nouvelleScene.json'
  picture = '@/assets/ergonom_io.png'
  tags = '[]'
  id = 0
  color = '000000'
  assetsNumber = 0
  creationDate = 0
  data = '{}'
  idProject = 0
  idUserOwner = 0
  modificationDate = 0

  parsedData: any = null
  parsedTags: string[] = []

  // Permet de récupérer une date en format string
  get formatedCreationDate (): string {
    return new Date(this.creationDate).toLocaleString()
  }

  // Permet de construire une scène
  constructor (params: Partial<CardModel>) {
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

// Scene recue d'unreal
class SceneRecue {
  name = ''
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
  // message = ''
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
  scenes: CardModel[] = []
  scenes2: CardModel[] = []

  titlePopup = ''
  textPopup = ''

  popup = false
  createSceneJson = false
  modifyScene = false

  search = ''
  sceneChoose: any = new CardModel({ id: 2 })

  newTag = ''
  newImage = ''

  sizeCard = 30
  sizeCardString = '30%'

  sceneForModif = ''

  // Begin
  mounted (): void {
    this.requeteAPI()

    // Permet de récupérer la réponse d'Unreal
    Unreal.callback.$on('unreal-message', (data: unknown) => {
      this.$root.$emit('bottom-message', `Unreal : ${JSON.stringify(data)}`)
      // Unreal.send('Message recu !')
      // Unreal.send(data)

      var maScene
      try {
        maScene = data as Autre
      } catch (e) {
        this.$root.$emit('bottom-message', `Unreal : ${e}`)
      }

      // Unreal.send(maScene.assets[0].name)
      Unreal.send(maScene?.scene.nombreAssets.toString())
      Unreal.send(maScene?.scene.idScene.toString())
      // Unreal.send(maScene.scene.idScene.toString())
      // Unreal.send(maScene?.assets)

      var maCard = new CardModel({
        assetsNumber: maScene?.scene.nombreAssets,
        id: maScene?.scene.idScene,
        name: 'aymeric2',
        data: JSON.stringify(maScene?.assets)
      })

      this.releaseScene(maCard)
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
      this.scenes2 = ((response as unknown) as Array<Partial<CardModel>>).map(
        (scene: Partial<CardModel>) => new CardModel(scene)
      )

      for (let i = 0; i < this.scenes2.length; i++) {
        this.scenes.push(this.scenes2[i])
      }
      this.scenes2 = []
    })
  }

  // Boutons scènes scenes
  ergonomioLayout (): void {
    console.log('ergonomioLayout !')
  }

  ergonomioVirtualTwin (): void {
    console.log('ergonomioVirtualTwin !')
  }

  // Permet de créer une scène vide
  createEmptyScene (): void {
    console.log('creerSceneVide')
    const scene = new CardModel({ id: this.scenes.length })
    scene.parsedTags.push('vide')
    this.scenes.push(scene)

    this.addSceneAPI(scene)
  }

  // Permet de faire une requête API pour ajouter une scène
  addSceneAPI (scene: CardModel): void {
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
      this.refreshScenes()
    })
  }

  // Permet de faire une requête API pour supprimer une scène
  deleteSceneAPi (id: number): void {
    API.delete(this, `/resources/ergonomio-scenes/${id}`, '').then(
      (response: Response) => {
        console.log('supprimer scene')
      }
    )
  }

  // Permet de charger une scène à partir d'un fichier scène
  loadScene (): void {
    console.log('Charger scene')
    this.openUploadFile()
  }

  // Permet d'activer le fait de pouvoir ajouter un objet
  addObjectInScene (): void {
    console.log('addObjectInScene')

    console.log('sceneForModif : ', this.sceneForModif)

    let idSceneModif
    for (let i = 0; i < this.scenes.length; i++) {
      if (this.sceneForModif === this.scenes[i].name) {
        idSceneModif = this.scenes[i].id
        break
      }
    }

    Unreal.send('addObjectInScene')
    Unreal.send(idSceneModif)

    if (this.sceneForModif !== '') {
      // Activer le mode pour ajouter des objets dans la scène
      var objectAsset = {
        name: this.sceneForModif,
        idScene: idSceneModif,
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
  releaseSceneFichier (data: unknown): void {
    console.log('data : ', data)
  }

  // Permet de supprimer la scène en question
  deleteObjet (scene: CardModel): void {
    console.log('Supprimer objet ')

    const index2 = this.scenes.indexOf(scene, 0)

    if (index2 > -1) {
      this.scenes.splice(index2, 1)
    }

    this.deleteSceneAPi(scene.id)

    console.log('length : ', this.scenes.length)
    console.log('length : ', this.scenes)
  }

  // Permet d'afficher dans une popup des informations sur la scene
  clickScene (scene: CardModel): void {
    console.log('clickScene : ', scene.id)
    this.popup = true
    this.titlePopup = scene.name

    this.textPopup = scene.data
    this.releaseScene(new CardModel({ id: 1 }))
  }

  // Aymeric todo
  outline (scene: CardModel): void {
    console.log('Aymeric todo !')
  }

  // Permet de modifier le nom d'une scène
  editNameScene (scene: CardModel): void {
    console.log('editNameScene ')
    this.modifyScene = true
    this.sceneChoose = scene
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
    this.modifyScene = false

    if (this.newImage !== '') {
      scene.picture = this.newImage
    }

    if (this.search.length !== 0) scene.name = this.search
    this.releaseScene(scene)

    this.newImage = ''
  }

  // Permet de copier la scène
  copyScene (scene: CardModel): void {
    console.log('copyScene !')

    this.scenes.push(scene)
    this.addSceneAPI(scene)
  }

  // Permet d'ajouter un tag à une scène
  addTag (scene: CardModel, tag: string): void {
    console.log('addTag')

    scene.parsedTags.push(tag)
  }

  // Permet de supprimer un tab d'une scène
  deleteTag (scene: CardModel, tags: string): void {
    console.log('deleteTag')

    const index = scene.parsedTags.indexOf(tags, 0)

    if (index > -1) {
      scene.parsedTags.splice(index, 1)
    }
    this.releaseScene(scene)
  }

  // Permet de mettre à jour une scène
  releaseScene (scene: CardModel): void {
    // Requête API pour mettre à jour la scène
    API.patch(
      this,
      `/resources/ergonomio-scenes/${scene.id}`,
      JSON.stringify({
        assetsNumber: scene.assetsNumber,
        // color: scene.color,
        // creationDate: scene.creationDate,
        data: scene.data,
        // id: scene.id,
        // idProject: scene.idProject,
        // idUserOwner: scene.idUserOwner,
        // modificationDate: scene.modificationDate,
        name: scene.name
        // picture: scene.picture,
        // tags: JSON.stringify(scene.parsedTags)
      })
    )
      .then((response: Response) => {
        console.log('api modif scene')
        Unreal.send(response)
        // On mets à jour les cartes
        this.refreshScenes()
      })
      .catch(e => console.error(e))
  }

  refreshScenes (): void {
    this.scenes = []
    this.requeteAPI()
  }

  // Permet de récupérer le fichier qu'on veut upload
  openUploadFile (): void {
    const uploadFileInput = this.$refs.uploadFileInput as HTMLInputElement
    if (uploadFileInput == null) return
    uploadFileInput.value = ''
    uploadFileInput.click()
  }

  // Charger une scène
  onUploadSceneUpdate (e: Event): void {
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

          const test = new Autre(JSON.parse(reader.result as string))

          console.log('============')
          console.log('============')

          console.log('test : ', test)

          const maCarte = new CardModel({
            id: test.scene.idScene,
            assetsNumber: test.scene.nombreAssets,
            data: JSON.stringify(test.assets)
          })

          this.scenes.push(maCarte)
          this.addSceneAPI(maCarte)

          // console.log('test name : ', test.name)
          // console.log('test name : ', test)
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

          this.newImage = fileString
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

          // this.newImage = fileString
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

  // Permet de baisser la taille des scenes
  decreaseSizeCard (): void {
    this.sizeCard -= 10
    if (this.sizeCard < 10) this.sizeCard = 10
    this.sizeCardString = this.sizeCard.toString() + '%'
  }

  // Permet d'augmenter la taille des scenes
  increaseSizeCard (): void {
    this.sizeCard += 10
    if (this.sizeCard > 50) this.sizeCard = 50
    this.sizeCardString = this.sizeCard.toString() + '%'
  }

  // Permet d'envoyer un message à l'instance unreal
  // Permet de charger sur la scène cliquée
  sendUnreal (scene: CardModel): void {
    console.log('asset.name : ', scene.name)
    console.log('asset.id : ', scene.id)
    console.log('asset : ', scene)

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

    Unreal.send(object)
  }
}
</script>
