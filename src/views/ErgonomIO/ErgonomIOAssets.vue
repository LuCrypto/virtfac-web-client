<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>

<template>
  <v-container class="spacing-playground pa-6 d-flex flex-column" fluid>
    <!-- <template>
      <div id="app">
        <input
          :value="input"
          class="input"
          @input="onInputChange"
          placeholder="Tap on the virtual keyboard to start"
        />
        <SimpleKeyboard
          @onChange="onChange"
          @onKeyPress="onKeyPress"
          :input="input"
        />
      </div>
    </template> -->

    <pop-up ref="assetInfo">
      <asset-info
        ref="assetInfoComponent"
        @close="$refs.assetInfo.close()"
      ></asset-info>
    </pop-up>
    <!-- Title -->
    <v-card elevation="3" class="mb-4" v-if="!this.fullpage">
      <v-card-title>
        {{ $vuetify.lang.t('$vuetify.assetLibrary.assetLibrary') }}
      </v-card-title>
      <v-card-subtitle>
        {{ $vuetify.lang.t('$vuetify.assetLibrary.listOfAllAssets') }}
      </v-card-subtitle>
    </v-card>

    <!-- Modify data of scene -->
    <v-card elevation="3" class="pa-0 d-flex flex-grow-1 flex-column" fluid style="overflow-y:scroll">
      <v-dialog v-model="modifyAsset" max-width="780">
        <v-row justify="center">
          <v-card>
            <v-card-title>
              {{ $vuetify.lang.t('$vuetify.assetLibrary.assetData') }}
            </v-card-title>

            <!-- Change title of asset -->
            <v-container fluid>
              <v-row>
                <v-col cols="3">
                  <v-card-text>
                    {{ $vuetify.lang.t('$vuetify.assetLibrary.newTitle') }} :
                  </v-card-text>
                </v-col>

                <v-col cols="4">
                  <v-text-field v-model="search"> </v-text-field>
                </v-col>
              </v-row>
            </v-container>

            <!-- Add tags -->
            <v-container fluid>
              <v-row>
                <v-col cols="3">
                  <v-card-text>
                    {{ $vuetify.lang.t('$vuetify.assetLibrary.newTags') }} :
                  </v-card-text>
                </v-col>

                <v-col cols="4">
                  <v-text-field v-model="newTag"> </v-text-field>
                </v-col>

                <v-col cols="3">
                  <v-btn v-on:click="addTag(assetChoose, newTag)" icon>
                    <v-icon v-text="'mdi-plus'"></v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>
            <!-- Change preview of asset -->
            <v-container fluid>
              <v-img height="270" :src="newImage"> </v-img>
              <v-btn
                class="ml-6 mt-6 flex-grow-1"
                color="green"
                @click="openUploadFile"
              >
                <v-icon v-text="'mdi-upload'"></v-icon>
                {{ $vuetify.lang.t('$vuetify.assetLibrary.uploadNew') }}
                <input
                  ref="uploadFileInput"
                  hidden
                  type="file"
                  @change="updateUploadFile"
                />
              </v-btn>
            </v-container>

            <!-- Delete tags -->
            <v-container
              fluid
              :key="indexTag2"
              v-for="(tag, indexTag2) in assetChoose.parsedTags"
            >
              <v-row>
                <v-col cols="2">
                  <v-card-text>
                    {{ tag }}
                  </v-card-text>
                </v-col>

                <v-col cols="3">
                  <v-btn v-on:click="deleteTag(assetChoose, tag)" icon>
                    <v-icon v-text="'mdi-delete'"></v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>

            <!-- Save changes -->
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" text @click="save(assetChoose)">
                {{ $vuetify.lang.t('$vuetify.assetLibrary.save') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-row>
      </v-dialog>

      <!-- Middle of the page: the different assets cards -->
      <v-container
        v-if="this.multi"
        class="d-flex align-center justify-center"
        style="height: 100%;"
      >
        <h1>
          {{ $vuetify.lang.t('$vuetify.assetLibrary.uCantUse') }}
        </h1>
      </v-container>

      <v-card
        v-if="!this.multi"
        class="d-flex flex-column flex-grow-1"
        style="overflow-y: hidden;"
        :rounded="unrealContext.check() ? 'xl' : 'md'"
      >
        <v-card
          class="d-flex flex-grow-1 justify-space-around"
          fluid
          :rounded="unrealContext.check() ? 'xl' : 'md'"
          style="overflow-y: scroll;"
          flat
        >
          <!-- The different categories -->
          <v-card width="25%">
            <v-btn width="90%" class="ma-2" v-on:click="clearCategory()">
              {{ $vuetify.lang.t('$vuetify.assetLibrary.resetFilter') }}
            </v-btn>
            <v-checkbox
              class="mx-2"
              v-model="displayTag"
              :label="$vuetify.lang.t('$vuetify.assetLibrary.displayTags')"
            ></v-checkbox>
            <v-card-title>
              {{ $vuetify.lang.t('$vuetify.assetLibrary.categories') }} :
            </v-card-title>

            <v-card-text>
              <v-treeview
                :items="rootItem.children"
                item-key="id"
                activatable
                open-on-click
                @update:active="values => scrollOnElement(values)"
              >
                <template v-slot:prepend="{ open }">
                  <v-icon :class="open ? 'primary--text' : ''">
                    {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
                  </v-icon>
                </template>
              </v-treeview>
            </v-card-text>
          </v-card>

          <!-- The different assets -->
          <v-card
            class="d-flex flex-wrap justify-space-around overflow-y-auto"
            flat
            style="width: 75%;"
          >
            <v-card
              :width="sizeCardString"
              :key="indexCard"
              v-for="(asset, indexCard) in useCategory ? cardsSort : assets"
              class="mx-2 my-2"
            >
              <v-list-item :key="asset.name" class="px-2">
                <!-- Asset image  -->
                <v-hover>
                  <template v-slot:default="{ hover }">
                    <v-btn
                      :style="{ filter: hover ? 'brightness(90%)' : 'none' }"
                      class="mr-1"
                      v-on:click="sendUnreal(asset)"
                      height="90"
                      width="90"
                    >
                      <v-img
                        max-width="90"
                        :src="asset.picture"
                        class="mr-1"
                      ></v-img>
                    </v-btn>
                  </template>
                </v-hover>

                <v-list-item-content>
                  <v-list-item-title
                    style="margin-left: 10px;"
                    v-html="asset.name"
                  >
                  </v-list-item-title>

                  <v-container v-if="displayTag" class="flex-row">
                    <v-chip
                      :key="indexTag"
                      v-for="(tag, indexTag) in asset.parsedTags"
                      class="ma-1 overflow-y-auto"
                    >
                      {{ tag }}
                    </v-chip>
                  </v-container>

                  <v-list-item-action>
                    <v-btn v-on:click="editNameAsset(asset)" icon>
                      <v-icon color="grey lighten-1">mdi-pencil</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </v-list-item-content>
              </v-list-item>
            </v-card>
          </v-card>
        </v-card>

        <!-- The different buttons -->
        <v-container
          class="d-flex justify-space-around align-center"
          style="width: 75%; margin-left: 25%;"
        >
          <!-- Button to load an asset -->
          <v-btn
            v-on:click="loadAsset"
            class="primary black--text"
            large
            elevation="2"
          >
            {{ $vuetify.lang.t('$vuetify.assetLibrary.loadAnAsset') }}
            <input
              accept="application/JSON"
              ref="uploadFileInput"
              hidden
              type="file"
              @change="updateUploadFileChargerAsset"
            />
          </v-btn>
          <v-btn
            v-on:click="deleteModeAsset"
            class="primary black--text"
            large
            elevation="2"
          >
            {{ $vuetify.lang.t('$vuetify.assetLibrary.deleteModeAsset') }}
          </v-btn>
          <div>
            <!-- Allows you to reduce the size of your assets -->
            <v-btn v-on:click="decreaseSizeCard()" icon>
              <v-icon v-text="'mdi-minus'"></v-icon>
            </v-btn>
            <!-- Allows to increase the size of the assets -->
            <v-btn v-on:click="increaseSizeCard()" icon>
              <v-icon v-text="'mdi-plus'"></v-icon>
            </v-btn>
          </div>
        </v-container>
      </v-card>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import API from '@/utils/api'
import Unreal from '@/utils/unreal'
import { APIAsset } from '@/utils/models'
import AssetInfo from '@/components/AssetInfo.vue'
import PopUp from '@/components/PopUp.vue'
import VueRouter from 'vue-router'
import SimpleKeyboard from '@/views/ErgonomIO/SimpleKeyboard.vue'

// Class for assets
class CardAsset {
  // Initialization
  name = 'Asset1.json'
  picture = 'https://cdn.vuetifyjs.com/images/cards/house.jpg'
  tags = '[]'
  dateCreation = '04/22/2022'
  id = 0
  color = 3371519
  creationDate = 0
  idProject = 0
  idUserOwner = 0
  modificationDate = 0
  colorBackground = 'red'
  uri = ''
  mime = ''
  parsedTags: string[] = []

  // Allows you to retrieve a date in string format
  get formatedCreationDate (): string {
    return new Date(this.creationDate).toLocaleString()
  }

  // Allows you to build an asset
  constructor (params: Partial<CardAsset>) {
    Object.assign(this, params)
    try {
      this.parsedTags = JSON.parse(this.tags || '[]')
    } catch (e) {
      console.error(e)
    }
  }
}

// Interface for categories
interface TreeItem {
  id: number
  name: string
  children: TreeItem[]
  asset: CardAsset
}

class MessageAsset {
  message = ''
  id = 0
  position = []
  rotation = []
  scale = []

  constructor () {
    Object.assign(this)
  }
}

@Component({
  name: 'ErgonomIOAssets',
  components: {
    PopUp,
    AssetInfo,
    SimpleKeyboard
  }
})

// @vuese
// @group VIEWS
export default class ErgonomIOAssets extends Vue {
  // Initialization
  assets: CardAsset[] = []
  assets2: CardAsset[] = []

  useCategory = false
  cardsSort: CardAsset[] = []
  dialog = false
  popup = false
  textPopup = 'texte popup'
  titlePopup = 'titre popup'
  search = ''
  input = ''

  newTag = ''
  newImage = ''

  modifyAsset = false
  displayTag = false
  assetChoose: CardAsset = new CardAsset({ id: 1 })

  sizeCard = 30
  sizeCardString = '30%'

  categoryAsset = ['test', 'autre']
  tableauCategory: string[] = []

  router: VueRouter = this.$router
  query = this.router.currentRoute.query
  fullpage: boolean = this.query.fullpage === 'true'
  multi = false
  deleteMode = false

  rootItem: TreeItem = {
    id: 0,
    name: 'root',
    children: [],
    asset: new CardAsset({})
  }

  unrealContext = Unreal

  mounted (): void {
    this.requeteAPI()

    Unreal.callback.$on('unreal-message', (data: any) => {
      this.$root.$emit('bottom-message', `Unreal : ${JSON.stringify(data)}`)

      let monObjet: MessageAsset = new MessageAsset()
      switch (data.message) {
        case 'recupererAsset':
          monObjet = data as MessageAsset

          // Unreal.send('Oui je suis recupererAsset')
          // Unreal.send(monObjet.id)

          API.post(
            this,
            '/resources/assets',
            JSON.stringify({
              select: [],
              where: [{ id: 46 }]
            })
          ).then((response: Response) => {
            // Unreal.send('response')
            // Unreal.send(response)

            const monAssetTableau = ((response as unknown) as Array<
              Partial<CardAsset>
            >).map((asset: Partial<CardAsset>) => new CardAsset(asset))

            const monAsset = monAssetTableau[0]

            const objectAsset = {
              action: 'aRecup',
              name: monAsset.name,
              id: monAsset.id,
              uri: monAsset.uri,
              position: monObjet.position,
              rotation: monObjet.rotation,
              scale: monObjet.scale
            }

            const object = {
              menu: 'asset',
              objet: objectAsset
            }

            Unreal.send(object)
          })
          break
        case 'infosMulti':
          this.multi = data.multi
          break
        default:
          console.error('Unknown message', data)
      }
    })
  }

  // Keyboard
  // When the input changes
  onChange (input: any): void {
    // console.log('input : ', input)
    this.input = input
  }

  // When a button is pressed
  onKeyPress (button: any): void {
    console.log('button', button)
  }

  // When the input changes
  onInputChange (input: any): void {
    this.input = input.target.value
  }

  // Create example of the different categories with a hierarchy
  // @arg No arguments required
  createCategory (): void {
    let idUnique = 1

    // Create the root
    for (let i = 0; i < 5; i++) {
      const test: TreeItem = {
        id: idUnique,
        name: 'Category ' + idUnique.toString(),
        children: [],
        asset: new CardAsset({})
      }
      idUnique++

      // Create the children
      for (let j = 0; j < 3; j++) {
        const test2: TreeItem = {
          id: idUnique,
          name: 'Categorie ' + idUnique.toString(),
          children: [],
          asset: new CardAsset({})
        }
        idUnique++
        test.children.push(test2)
      }

      this.rootItem.children.push(test)
    }
  }

  // Open popup with good informations
  // @arg No arguments required
  clickCard (card: CardAsset): void {
    this.popup = true
    this.titlePopup = card.name
    this.textPopup =
      card.uri.length > 10000
        ? card.uri.substring(0, 10000) + '........'
        : card.uri
  }

  // Api request for get the different assets
  // @arg No arguments required
  requeteAPI (): void {
    API.post(
      this,
      '/resources/assets',
      JSON.stringify({ select: ['name', 'picture', 'id', 'tags'] })
    ).then((response: Response) => {
      this.assets2 = ((response as unknown) as Array<Partial<CardAsset>>).map(
        (asset: Partial<CardAsset>) => new CardAsset(asset)
      )

      for (let i = 0; i < this.assets2.length; i++) {
        this.assets.push(this.assets2[i])
      }
      this.assets2 = []
      this.getAllCategory()
    })
  }

  // Modify name of asset
  // @arg No arguments required
  editNameAsset (asset: CardAsset): void {
    (this.$refs.assetInfo as PopUp).open()
    requestAnimationFrame(() => {
      (this.$refs.assetInfoComponent as AssetInfo).loadData(asset.id)
    })
  }

  // Modify name of asset
  // @arg No arguments required
  save (asset: CardAsset): void {
    this.modifyAsset = false

    if (this.newImage !== '') {
      asset.picture = this.newImage
    }

    if (this.search.length !== 0) asset.name = this.search

    this.releaseAsset(asset)
    this.newImage = ''
  }

  // Update scene
  // @arg No arguments required
  releaseAsset (asset: CardAsset): void {
    const apiFile = new APIAsset({
      name: asset.name,
      uri: asset.uri,
      picture: asset.picture,
      tags: JSON.stringify(asset.parsedTags)
    })
    API.patch(
      this,
      '/resources/assets/' + asset.id,
      JSON.stringify(apiFile.toJSON())
    )
      .then(res => {
        console.log(res)
      })
      .catch(err => {
        console.log(err)
      })
  }

  // Get file of upload
  // @arg No arguments required
  openUploadFile (): void {
    const uploadFileInput = this.$refs.uploadFileInput as HTMLInputElement
    if (uploadFileInput == null) return
    uploadFileInput.value = ''
    uploadFileInput.click()
  }

  // Read the upload file
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

  // Some with category
  // @arg No arguments required
  scrollOnElement (values: number[]): void {
    if (values.length !== 0) {
      const element = values[0]
      this.sortWithCategory(this.rootItem.children[element - 1].name)
    } else {
      this.clearCategory()
    }
  }

  // Add tag to asset
  // @arg No arguments required
  addTag (asset: CardAsset, tag: string): void {
    asset.parsedTags.push(tag)
  }

  // Delete tag of asset
  // @arg No arguments required
  deleteTag (asset: CardAsset, tags: string): void {
    const index = asset.parsedTags.indexOf(tags, 0)

    if (index > -1) {
      asset.parsedTags.splice(index, 1)
    }

    this.releaseAsset(asset)
  }

  // Download asset
  // @arg No arguments required
  downloadAsset (asset: CardAsset): void {
    const data = JSON.stringify(asset)
    const blob = new Blob([data], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const pom = document.createElement('a')

    pom.setAttribute('style', 'display: none;')
    pom.href = url
    pom.setAttribute('download', asset.name + '.json')
    pom.click()
  }

  // Load scene from scene file
  // @arg No arguments required
  loadAsset (): void {
    this.openUploadFile()
  }

  // Can switch in destruction mode
  deleteModeAsset (): void {
    this.deleteMode = !this.deleteMode

    const objectAsset = {
      action: 'deleteModeAsset',
      deleteMode: this.deleteMode
    }

    const object = {
      menu: 'asset',
      objet: objectAsset
    }

    Unreal.send(object)
  }

  // Load asset
  // @arg No arguments required
  updateUploadFileChargerAsset (e: Event): void {
    if (e.target == null) return
    const target = e.target as HTMLInputElement
    if (target.files != null && target.files.length > 0) {
      [...target.files].forEach(file => {
        const reader = new FileReader()
        reader.onload = _ => {
          const test = new CardAsset(JSON.parse(reader.result as string))
          this.assets.push(test)
          this.addAssetAPI(test)
        }

        reader.onerror = error => {
          console.error(error)
          this.$root.$emit('bottom-message', 'Sorry, we cannot read this file.')
        }
        reader.readAsText(file)
      })
    }
  }

  // api request for adding an asset
  // @arg No arguments required
  addAssetAPI (asset: CardAsset): void {
    API.put(
      this,
      '/resources/assets',
      new APIAsset({
        color: asset.color,
        creationDate: asset.creationDate,
        id: asset.id,
        idProject: asset.idProject,
        idUserOwner: asset.idUserOwner,
        mime: asset.mime,
        modificationDate: asset.modificationDate,
        name: asset.name,
        tags: JSON.stringify(asset.parsedTags),
        uri: asset.uri
      }).toJSON()
    ).then((response: Response) => {
      console.log('api modif asset : ', response)
    })
  }

  // Decrease size of asset cards
  // @arg No arguments required
  decreaseSizeCard (): void {
    this.sizeCard -= 10
    if (this.sizeCard < 30) this.sizeCard = 30
    this.sizeCardString = this.sizeCard.toString() + '%'
  }

  // Increase size of asset cards
  // @arg No arguments required
  increaseSizeCard (): void {
    this.sizeCard += 10
    if (this.sizeCard > 60) this.sizeCard = 60
    this.sizeCardString = this.sizeCard.toString() + '%'
  }

  // Display asset of the category
  // @arg No arguments required
  sortWithCategory (categorie: string): void {
    // Activate the sorting
    this.useCategory = true

    // Sorts the different assets according to the category
    this.cardsSort = []
    for (let i = 0; i < this.assets.length; i++) {
      const asset = this.assets[i]

      if (asset.parsedTags.some(cat => cat === categorie)) {
        this.cardsSort.push(asset)
      }
    }
  }

  // Delete the active sort
  // @arg No arguments required
  clearCategory (): void {
    this.useCategory = false
  }

  // Get all categories of different assets
  // @arg No arguments required
  getAllCategory (): void {
    for (let i = 0; i < this.assets.length; i++) {
      const asset = this.assets[i]
      for (let j = 0; j < asset.parsedTags.length; j++) {
        const tag = asset.parsedTags[j]

        let dedans = false
        for (let k = 0; k < this.tableauCategory.length; k++) {
          const tag2 = this.tableauCategory[k]
          if (tag === tag2) {
            dedans = true
            break
          }
        }
        if (!dedans) {
          this.tableauCategory.push(tag)
        }
      }
    }

    let idUnique = 1
    for (let i = 0; i < this.tableauCategory.length; i++) {
      const test: TreeItem = {
        id: idUnique,
        name: this.tableauCategory[i],
        children: [],
        asset: new CardAsset({})
      }
      idUnique++

      this.rootItem.children.push(test)
    }
  }

  // Send asset for unreal instance
  // @arg No arguments required
  sendUnreal (asset: CardAsset): void {
    API.post(
      this,
      '/resources/assets',
      JSON.stringify({
        select: [],
        where: [{ id: asset.id }]
      })
    ).then((response: Response) => {
      const monAssetTableau = ((response as unknown) as Array<
        Partial<CardAsset>
      >).map((asset: Partial<CardAsset>) => new CardAsset(asset))

      const monAsset = monAssetTableau[0]
      const objectAsset = {
        action: 'envoieAsset',
        name: monAsset.name,
        id: monAsset.id,
        uri: monAsset.uri
      }

      const object = {
        menu: 'asset',
        objet: objectAsset
      }

      Unreal.send(object)
    })
  }
}
</script>
