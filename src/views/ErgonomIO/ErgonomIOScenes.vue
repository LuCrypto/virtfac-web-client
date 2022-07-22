<template>
  <v-container fluid style="max-height: 100%; overflow: auto;">
    <v-card
      style="max-height: 100%; overflow: auto;"
      class="ma-4"
      elevation="5"
      :rounded="unreal.check() ? 'xl' : 'md'"
    >
      <v-container fluid style="max-height: 100%; overflow: auto;" class="pa-0">
        <v-col class="ma-0 pa-0">
          <!-- Title -->
          <v-row no-gutters class="text-h5 text-center pa-4 primary black--text"
            >Your scenes</v-row
          >

          <!-- The different scene -->
          <v-row
            no-gutters
            class="overflow-y-auto flex-grow-1 ma-4"
            style="max-height: 600px;"
          >
            <v-card
              class="ma-2"
              :key="indexScene"
              v-for="(scene, indexScene) in scenes"
              width="300px"
              elevation="5"
              @click="sendUnreal(scene)"
            >
              <v-img height="200" :src="scene.picture">
                <v-btn
                  @click="editNameScene(scene, $event)"
                  class="ma-2"
                  fab
                  dark
                  small
                  style="position: absolute; top: 0; right: 0;"
                >
                  <v-icon>mdi-pen</v-icon>
                </v-btn>
              </v-img>
              <v-sheet
                height="15"
                :color="`#${scene.color.toString(16).padStart(6, '0')}`"
              >
              </v-sheet>
              <v-card-title class="pt-2">
                {{ scene.name }}
              </v-card-title>
              <v-card-subtitle>
                <v-chip-group>
                  <v-chip
                    :key="indexTag"
                    v-for="(tag, indexTag) in scene.parsedTags"
                    class="mr-2 overflow-y-auto"
                  >
                    {{ tag }}
                  </v-chip>
                </v-chip-group>
              </v-card-subtitle>
              <v-card-text>
                {{ scene.formatedCreationDate }}, assets number :
                {{ scene.assetsNumber }}, id : {{ scene.id }}, owner :
                {{ scene.idUserOwner }}, profil id : {{ scene.idProfile }}
              </v-card-text>

              <v-card-actions class="flex-wrap">
                <v-container fluid class="pa-0">
                  <v-col class="pa-0">
                    <v-row no-gutters>
                      <v-btn
                        color="primary"
                        text
                        @click="ergonomioLayout($event)"
                      >
                        Open in layout
                      </v-btn>
                    </v-row>
                    <v-row no-gutters>
                      <v-btn
                        color="primary"
                        text
                        @click="ergonomioVirtualTwin($event)"
                      >
                        Open in virtual twin
                      </v-btn>
                    </v-row>
                    <v-row
                      no-gutters
                      justify="space-between"
                      class="pt-3 flex-wrap"
                    >
                      <v-btn @click="downloadScene(scene, $event)" icon>
                        <v-icon v-text="'mdi-download'"></v-icon>
                      </v-btn>
                      <v-btn @click="outline(scene, $event)" icon>
                        <v-icon v-text="'mdi-eye'"></v-icon>
                      </v-btn>
                      <v-btn @click="clickScene(scene, $event)" icon>
                        <v-icon v-text="'mdi-information'"></v-icon>
                      </v-btn>
                      <v-btn @click="deleteObjet(scene, $event)" icon>
                        <v-icon v-text="'mdi-delete'"></v-icon>
                      </v-btn>
                    </v-row>
                  </v-col>
                </v-container>
              </v-card-actions>
            </v-card>
          </v-row>

          <!-- The different button -->
          <v-container fluid class="mt-8">
            <v-col>
              <v-row
                no-gutters
                justify="space-between"
                class="mb-4"
                style="gap: 10px;"
              >
                <v-btn
                  @click="createEmptyScene"
                  class="primary black--text flex-grow-1"
                  large
                  elevation="2"
                >
                  Create new empty scene
                </v-btn>
                <v-btn
                  @click="openUploadFile"
                  class="primary black--text flex-grow-1"
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
                <v-btn
                  @click="addObjectInScene"
                  class="primary black--text flex-grow-1"
                  large
                  elevation="2"
                >
                  Add object in scene
                </v-btn>
                <v-btn
                  @click="saveCurrentScene"
                  class="primary black--text flex-grow-1"
                  large
                  elevation="2"
                >
                  Save current scene
                </v-btn>
              </v-row>
              <v-row no-gutters>
                <v-select
                  :items="scenes.map(item => item.name)"
                  v-model="sceneForModif"
                  label="Target scene"
                  dense
                ></v-select>
              </v-row>
            </v-col>
          </v-container>

          <!-- Display information on a scene -->
          <v-dialog v-model="popup" max-width="780">
            <v-card>
              <v-card-title> {{ titlePopup }} </v-card-title>
              <v-card-text>
                {{ textPopup }}
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary darken-1" text @click="popup = false">
                  OK
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <!-- For create a scene with json -->
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
                  color="primary darken-1"
                  text
                  @click="createSceneJson = false"
                >
                  OK
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <!-- For modify the data of the scene -->
          <v-dialog v-model="modifyScene" max-width="780">
            <v-card>
              <v-card-title> Modifier des données </v-card-title>

              <v-container fluid>
                <v-row no-gutters>
                  <v-col cols="3">
                    <v-card-text>
                      New title :
                    </v-card-text>
                  </v-col>

                  <v-col cols="4">
                    <v-text-field v-model="search"> </v-text-field>
                  </v-col>
                </v-row>
              </v-container>

              <v-container fluid>
                <v-row no-gutters>
                  <v-col cols="3">
                    <v-card-text>
                      New tag :
                    </v-card-text>
                  </v-col>

                  <v-col cols="4">
                    <v-text-field v-model="newTag"> </v-text-field>
                  </v-col>

                  <v-col cols="3">
                    <v-btn @click="addTag(sceneChoose, newTag)" icon>
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
                <v-row no-gutters>
                  <v-col cols="2">
                    <v-card-text>
                      {{ tag }}
                    </v-card-text>
                  </v-col>

                  <v-col cols="3">
                    <v-btn @click="deleteTag(sceneChoose, tag)" icon>
                      <v-icon v-text="'mdi-delete'"></v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-container>

              <v-card-actions>
                <v-btn
                  color="primary darken-1"
                  text
                  @click="copyScene(sceneChoose)"
                >
                  Do copy of scene
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn color="primary darken-1" text @click="save(sceneChoose)">
                  Save
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-col>
      </v-container>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import API from '@/utils/api'
import Unreal from '@/utils/unreal'
import CardScene from '@/utils/cardmodel'
import { haguenauImageAsset } from '@/utils/defaultData'

// Scene recue d'unreal
class SceneReceived {
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
  spawnX = 0
  spawnY = 0
  spawnZ = 0

  constructor () {
    Object.assign(this)
  }
}

class Autre {
  scene: SceneInfo = new SceneInfo()
  assets: SceneReceived[] = []
  name = ''

  constructor (params: Partial<SceneReceived>) {
    Object.assign(this, params)
  }
}

@Component
export default class ErgonomIOAssets extends Vue {
  // Initialisation
  scenes: CardScene[] = []
  scenes2: CardScene[] = []

  titlePopup = ''
  textPopup = ''

  popup = false
  createSceneJson = false
  modifyScene = false

  search = ''
  sceneChoose: CardScene = new CardScene({ id: 2 })

  newTag = ''
  newImage = ''

  sizeCard = 30
  sizeCardString = '30%'

  sceneForModif = ''
  unreal = Unreal

  mounted (): void {
    this.requeteAPI()

    // Get unreal answer
    Unreal.callback.$on('unreal-message', (data: unknown) => {
      this.$root.$emit('bottom-message', `Unreal : ${JSON.stringify(data)}`)

      let maScene
      try {
        maScene = data as Autre
      } catch (e) {
        this.$root.$emit('bottom-message', `Unreal : ${e}`)
      }

      const maCard = new CardScene({
        assetsNumber: maScene?.scene.nombreAssets,
        id: maScene?.scene.idScene,
        data: JSON.stringify(maScene?.assets)
      })

      this.releaseScene(maCard)
    })
  }

  // Get all scenes of API
  // @arg No arguments required
  requeteAPI (): void {
    API.post(
      this,
      '/resources/ergonomio-scenes',
      JSON.stringify({
        select: [],
        where: []
      })
    ).then((response: Response) => {
      this.scenes2 = ((response as unknown) as Array<Partial<CardScene>>).map(
        (scene: Partial<CardScene>) => new CardScene(scene)
      )
      for (let i = 0; i < this.scenes2.length; i++) {
        this.scenes.push(this.scenes2[i])
      }
      this.scenes2 = []
    })
  }

  // Stop the event
  // @arg No arguments required
  ergonomioLayout (event: Event): void {
    event.stopPropagation()
  }

  // Stop the event
  // @arg No arguments required
  ergonomioVirtualTwin (event: Event): void {
    event.stopPropagation()
  }

  // Create an empty scene
  // @arg No arguments required
  createEmptyScene (): void {
    const scene = new CardScene({ id: this.scenes.length })
    scene.parsedTags.push('vide')
    this.scenes.push(scene)
    this.addSceneAPI(scene)
  }

  // Create api request for add a new scene
  // @arg No arguments required
  addSceneAPI (scene: CardScene): void {
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
        spawnX: scene.spawnX,
        spawnY: scene.spawnY,
        spawnZ: scene.spawnZ,
        tags: JSON.stringify(scene.parsedTags),
        idProfile: scene.idProfile
      })
    ).then((response: Response) => {
      this.refreshScenes()
    })
  }

  // Create api request for delete a scene
  // @arg No arguments required
  deleteSceneAPi (id: number): void {
    API.delete(this, `/resources/ergonomio-scenes/${id}`, '').then(
      (response: Response) => {
        console.log('supprimer scene : ', response)
      }
    )
  }

  // Load scene from a scene file
  // @arg No arguments required
  loadScene (): void {
    this.openUploadFile()
  }

  // Allow adding objects
  // @arg No arguments required
  addObjectInScene (): void {
    let idSceneModif
    for (let i = 0; i < this.scenes.length; i++) {
      if (this.sceneForModif === this.scenes[i].name) {
        idSceneModif = this.scenes[i].id
        break
      }
    }

    if (this.sceneForModif !== '') {
      const objectAsset = {
        name: this.sceneForModif,
        idScene: idSceneModif,
        action: 'ajouterObjetScene'
      }

      const object = {
        menu: 'scene',
        objet: objectAsset
      }

      Unreal.send(object)
    }
  }

  // Save current scene
  // @arg No arguments required
  saveCurrentScene (): void {
    const objectAsset = {
      action: 'sauvegarderSceneCourante'
    }

    const object = {
      menu: 'scene',
      objet: objectAsset
    }

    Unreal.send(object)
  }

  // Update the scene
  // @arg No arguments required
  releaseSceneFichier (data: unknown): void {
    console.log('data : ', data)
  }

  // Delete the selected scene
  // @arg No arguments required
  deleteObjet (scene: CardScene, event: Event): void {
    event.stopPropagation()

    const index2 = this.scenes.indexOf(scene, 0)

    if (index2 > -1) {
      this.scenes.splice(index2, 1)
    }

    this.deleteSceneAPi(scene.id)
  }

  // Display popup with information of scene
  // @arg No arguments required
  clickScene (scene: CardScene, event: Event): void {
    event.stopPropagation()

    this.popup = true
    this.titlePopup = scene.name

    this.textPopup = scene.data
    this.releaseScene(new CardScene({ id: 1 }))
  }

  // Aymeric todo
  // @arg No arguments required
  outline (scene: CardScene, event: Event): void {
    event.stopPropagation()
  }

  // Modify the name of scene
  // @arg No arguments required
  editNameScene (scene: CardScene, event: Event): void {
    event.stopPropagation()
    this.modifyScene = true
    this.sceneChoose = scene
  }

  // Download a scene
  // @arg No arguments required
  downloadScene (scene: CardScene, event: Event): void {
    event.stopPropagation()

    const data = JSON.stringify(scene)
    const blob = new Blob([data], { type: 'text/plain' })

    const url = URL.createObjectURL(blob)
    const pom = document.createElement('a')

    pom.setAttribute('style', 'display: none;')
    pom.href = url
    pom.setAttribute('download', scene.name + '.json')
    pom.click()
  }

  // Modify a scene
  // @arg No arguments required
  save (scene: CardScene): void {
    this.modifyScene = false

    if (this.newImage !== '') {
      scene.picture = this.newImage
    }

    if (this.search.length !== 0) scene.name = this.search
    this.releaseScene(scene)
    this.newImage = ''
  }

  // Copy scene
  // @arg No arguments required
  copyScene (scene: CardScene): void {
    this.scenes.push(scene)
    this.addSceneAPI(scene)
  }

  // Add tag to scene
  // @arg No arguments required
  addTag (scene: CardScene, tag: string): void {
    scene.parsedTags.push(tag)
  }

  // Delete tag from scene
  // @arg No arguments required
  deleteTag (scene: CardScene, tags: string): void {
    const index = scene.parsedTags.indexOf(tags, 0)

    if (index > -1) {
      scene.parsedTags.splice(index, 1)
    }
    this.releaseScene(scene)
  }

  // Update a scene
  // @arg No arguments required
  releaseScene (scene: CardScene): void {
    // Requête API pour mettre à jour la scène
    API.patch(
      this,
      `/resources/ergonomio-scenes/${scene.id}`,
      JSON.stringify({
        assetsNumber: scene.assetsNumber,
        data: scene.data
      })
    )
      .then((response: Response) => {
        Unreal.send(response)
        // Refresh scenes
        this.refreshScenes()
      })
      .catch(e => console.error(e))
  }

  // Refresh scenes
  // @arg No arguments required
  refreshScenes (): void {
    this.scenes = []
    this.requeteAPI()
  }

  // Get file that is upload
  // @arg No arguments required
  openUploadFile (): void {
    const uploadFileInput = this.$refs.uploadFileInput as HTMLInputElement
    if (uploadFileInput == null) return
    uploadFileInput.value = ''
    uploadFileInput.click()
  }

  // Load a scene
  // @arg No arguments required
  onUploadSceneUpdate (e: Event): void {
    if (e.target == null) return
    const target = e.target as HTMLInputElement
    if (target.files != null && target.files.length > 0) {
      [...target.files].forEach(file => {
        const reader = new FileReader()
        reader.onload = e => {
          const test = new Autre(JSON.parse(reader.result as string))
          const maCarte = new CardScene({
            id: test.scene.idScene,
            assetsNumber: test.scene.nombreAssets,
            data: JSON.stringify(test.assets)
          })

          this.scenes.push(maCarte)
          this.addSceneAPI(maCarte)
        }

        reader.onerror = error => {
          console.error(error)
          this.$root.$emit('bottom-message', 'Sorry, we cannot read this file.')
        }
        reader.readAsText(file)
      })
    }
  }

  // Read upload file
  // @arg No arguments required
  updateUploadFile (e: Event): void {
    if (e.target == null) return
    const target = e.target as HTMLInputElement
    if (target.files != null && target.files.length > 0) {
      [...target.files].forEach(file => {
        const reader = new FileReader()
        reader.onload = () => {
          const fileString = reader.result as string

          this.newImage = fileString
        }
        reader.onerror = error => {
          console.error(error)
          this.$root.$emit('bottom-message', 'Sorry, we cannot read this file.')
        }
        reader.readAsDataURL(file)
      })
    }
  }

  // Read upload file scne
  // @arg No arguments required
  updateUploadFileSceneJson (e: Event): void {
    if (e.target == null) return
    const target = e.target as HTMLInputElement
    if (target.files != null && target.files.length > 0) {
      [...target.files].forEach(file => {
        const reader = new FileReader()
        reader.onload = () => {
          const fileString = reader.result as string

          // this.newImage = fileString
        }
        reader.onerror = error => {
          console.error(error)
          this.$root.$emit('bottom-message', 'Sorry, we cannot read this file.')
        }
        reader.readAsDataURL(file)
      })
    }
  }

  // Load selected scene
  // @arg No arguments required
  sendUnreal (scene: CardScene): void {
    const objectAsset = {
      name: scene.name,
      assetsNumber: scene.assetsNumber,
      assets: JSON.parse(scene.data),
      idScene: scene.id,
      action: 'chargerScene',
      nomRoom: '',
      creerRoom: 0,
      idProfil: scene.idProfile
    }

    const object = {
      menu: 'scene',
      objet: objectAsset
    }

    Unreal.send(object)
  }
}
</script>
