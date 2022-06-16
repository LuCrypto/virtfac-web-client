<template>
  <v-container fluid style="max-height: 100%; overflow: auto">
    <pop-up ref="assetInfo">
      <asset-info
        ref="assetInfoComponent"
        @close="$refs.assetInfo.close()"
      ></asset-info>
    </pop-up>
    <!-- Titre -->
    <v-container
      v-if="!this.fullpage"
      class="spacing-playground pa-6 contradiction-analysis"
      fluid
    >
      <v-card elevation="3" class="mx-auto mb-6 flex-grow-1">
        <v-card-title> Asset library </v-card-title>
        <v-card-subtitle> List of all assets </v-card-subtitle>
      </v-card>
    </v-container>

    <!-- Milieu de page : les différentes cartes de scènes -->
    <template>
      <!-- Popup permettant de modifier des données de la scène -->
      <v-row justify="center">
        <v-dialog v-model="modifyAsset" max-width="780">
          <v-card>
            <v-card-title> Modifier des données </v-card-title>

            <!-- Permet de changer le titre de l'asset -->
            <v-container fluid>
              <v-row>
                <v-col cols="3">
                  <v-card-text> Nouveau titre : </v-card-text>
                </v-col>

                <v-col cols="4">
                  <v-text-field v-model="search"> </v-text-field>
                </v-col>
              </v-row>
            </v-container>

            <!-- Permet d'ajouter des tags -->
            <v-container fluid>
              <v-row>
                <v-col cols="3">
                  <v-card-text> Nouveau tag : </v-card-text>
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
            <!-- Permet de changer la preview de l'asset -->
            <v-container fluid>
              <v-img height="270" :src="newImage"> </v-img>
              <v-btn
                class="ml-6 mt-6 flex-grow-1"
                color="green"
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

            <!-- Permet de supprimer des tags -->
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

            <!-- Permet de sauvegarder les modifications -->
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" text @click="save(assetChoose)">
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>

      <!-- Le body de la page centrale -->
      <v-card
        :class="!this.fullpage ? 'ma-10' : 'ma-6'"
        class="d-flex flex-row"
        width="97%"
        height="700"
      >
        <!-- Les différentes catégories -->
        <v-card width="25%">
          <v-btn width="90%" class="ma-2" v-on:click="clearCategory()">
            Reset filter
          </v-btn>
          <v-checkbox
            class="mx-2"
            v-model="displayTag"
            label="Afficher les tags"
          ></v-checkbox>
          <v-card-title> Categories : </v-card-title>

          <v-card-text>
            <v-treeview
              :items="rootItem.children"
              item-key="id"
              activatable
              open-on-click
              @update:active="(values) => scrollOnElement(values)"
            >
              <template v-slot:prepend="{ open }">
                <v-icon :class="open ? 'primary--text' : ''">
                  {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
                </v-icon>
              </template>
            </v-treeview>
          </v-card-text>
        </v-card>

        <!-- Les différents assets -->
        <v-container class="d-flex flex-wrap overflow-y-auto">
          <v-card
            :width="sizeCardString"
            :key="indexCard"
            v-for="(asset, indexCard) in useCategory ? cardsSort : assets"
          >
            <v-list-item :key="asset.name">
              <!-- Image de l'asset -->
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

              <!-- Nom + tags + bouton edit -->
              <v-list-item-content>
                <v-list-item-title v-html="asset.name"> </v-list-item-title>

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
        </v-container>
      </v-card>
    </template>

    <!-- Les différents boutons -->
    <v-layout justify-center class="py-4">
      <v-flex class="flex-grow-0 mx-5">
        <!-- Bouton permettant de charger un asset -->
        <v-btn
          v-on:click="loadAsset"
          class="primary black--text"
          large
          elevation="2"
        >
          Load an asset
          <input
            accept="application/JSON"
            ref="uploadFileInput"
            hidden
            type="file"
            @change="updateUploadFileChargerAsset"
          />
        </v-btn>
      </v-flex>
      <v-flex class="flex-grow-0 mx-5">
        <!-- Permet de réduire la taille des assets -->
        <v-btn v-on:click="decreaseSizeCard()" icon>
          <v-icon v-text="'mdi-minus'"></v-icon>
        </v-btn>
        <!-- Permet d'augmenter la taille des assets -->
        <v-btn v-on:click="increaseSizeCard()" icon>
          <v-icon v-text="'mdi-plus'"></v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
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

// Classe pour les assets
class CardModel {
  // Initialisation
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

  // Permet de récupérer une date en format string
  get formatedCreationDate (): string {
    return new Date(this.creationDate).toLocaleString()
  }

  // Permet de construire un asset
  constructor (params: Partial<CardModel>) {
    Object.assign(this, params)
    try {
      this.parsedTags = JSON.parse(this.tags || '[]')
    } catch (e) {
      console.error(e)
    }
  }
}

// Interface pour les catégories
interface TreeItem {
  id: number
  name: string
  children: TreeItem[]
  asset: CardModel
}

class messageAsset {
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
    AssetInfo
  }
})
// @vuese
// @group VIEWS
export default class ErgonomIOAssets extends Vue {
  // Initialisation
  assets: CardModel[] = []
  assets2: CardModel[] = []

  useCategory = false
  cardsSort: CardModel[] = []
  dialog = false
  popup = false
  textPopup = 'texte popup'
  titlePopup = 'titre popup'
  search = ''

  newTag = ''
  newImage = ''

  modifyAsset = false
  displayTag = false
  assetChoose: CardModel = new CardModel({ id: 1 })

  sizeCard = 30
  sizeCardString = '30%'

  categoryAsset = ['test', 'autre']
  tableauCategory: string[] = []

  router: VueRouter = this.$router
  query = this.router.currentRoute.query
  fullpage: boolean = this.query.fullpage === 'true'

  rootItem: TreeItem = {
    id: 0,
    name: 'root',
    children: [],
    asset: new CardModel({})
  }

  // Begin
  mounted (): void {
    this.requeteAPI()

    Unreal.callback.$on('unreal-message', (data: unknown) => {
      this.$root.$emit('bottom-message', `Unreal : ${JSON.stringify(data)}`)

      Unreal.send(data)

      var monObjet = data as messageAsset
      Unreal.send(monObjet.message)
      Unreal.send(monObjet.id)
      Unreal.send(monObjet.position)

      API.post(
        this,
        '/resources/assets',
        JSON.stringify({
          select: [],
          where: [{ id: monObjet.id }]
        })
      ).then((response: Response) => {
        const monAssetTableau = (
          response as unknown as Array<Partial<CardModel>>
        ).map((asset: Partial<CardModel>) => new CardModel(asset))

        const monAsset = monAssetTableau[0]

        var objectAsset = {
          action: 'aRecup',
          name: monAsset.name,
          id: monAsset.id,
          uri: monAsset.uri,
          position: monObjet.position,
          rotation: monObjet.rotation,
          scale: monObjet.scale
        }

        var object = {
          menu: 'asset',
          objet: objectAsset
        }

        Unreal.send(object)
      })
    })
  }

  // Permet de créer un exemple des différentes catégorie avec une hiérarchie
  createCategory (): void {
    let idUnique = 1
    for (let i = 0; i < 5; i++) {
      const test: TreeItem = {
        id: idUnique,
        name: 'Category ' + idUnique.toString(),
        children: [],
        asset: new CardModel({})
      }
      idUnique++

      for (let j = 0; j < 3; j++) {
        const test2: TreeItem = {
          id: idUnique,
          name: 'Categorie ' + idUnique.toString(),
          children: [],
          asset: new CardModel({})
        }
        idUnique++
        test.children.push(test2)
      }

      this.rootItem.children.push(test)
    }
  }

  // Permet d'ouvrir la popup avec les bonnes informations
  clickCard (card: CardModel): void {
    console.log('clickCard : ', card.id)
    this.popup = true
    this.titlePopup = card.name

    if (card.uri.length > 10000) {
      this.textPopup = card.uri.substring(0, 10000) + '........'
    } else {
      this.textPopup = card.uri
    }
  }

  // Requête API pour récupérer les différents assets
  requeteAPI (): void {
    console.log('api ')
    API.post(
      this,
      '/resources/assets',
      JSON.stringify({ select: ['name', 'picture', 'id', 'tags'] })
    ).then((response: Response) => {
      console.log('response ', response)
      this.assets2 = (response as unknown as Array<Partial<CardModel>>).map(
        (asset: Partial<CardModel>) => new CardModel(asset)
      )

      for (let i = 0; i < this.assets2.length; i++) {
        this.assets.push(this.assets2[i])
      }
      this.assets2 = []
      this.getAllCategory()
    })
  }

  // Permet de modifier le nom d'un asset
  editNameAsset (asset: CardModel): void {
    // this.modifyAsset = true
    // this.assetChoose = asset
    console.log('editNameAsset')
    ;(this.$refs.assetInfo as PopUp).open()
    requestAnimationFrame(() => {
      (this.$refs.assetInfoComponent as AssetInfo).loadData(asset.id)
    })
  }

  // Permet de modifier un asset
  save (asset: CardModel): void {
    console.log('save : ', this.search)
    this.modifyAsset = false

    if (this.newImage !== '') {
      console.log('Changement image')
      asset.picture = this.newImage
    }

    if (this.search.length !== 0) asset.name = this.search
    this.releaseAsset(asset)

    this.newImage = ''
  }

  // Permet de mettre à jour une scène
  releaseAsset (asset: CardModel): void {
    // Requête API pour mettre à jour la scène
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
      .then((res) => {
        console.log(res)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  // Permet de récupérer le fichier qu'on veut upload
  openUploadFile (): void {
    const uploadFileInput = this.$refs.uploadFileInput as HTMLInputElement
    if (uploadFileInput == null) return
    uploadFileInput.value = ''
    uploadFileInput.click()
  }

  // Permet de lire le fichier uploadé
  updateUploadFile (e: Event): void {
    if (e.target == null) return
    const target = e.target as HTMLInputElement
    if (target.files != null && target.files.length > 0) {
      [...target.files].forEach((file) => {
        const reader = new FileReader()
        reader.onload = () => {
          const fileString = reader.result as string

          this.newImage = fileString
          console.log('fileString : ', fileString)
        }
        reader.onerror = (error) => {
          console.error(error)
          this.$root.$emit('bottom-message', 'Sorry, we cannot read this file.')
        }
        reader.readAsDataURL(file)
      })
    }
  }

  // Permet de trier avec une catégorie à travers la hiérarchie
  scrollOnElement (values: number[]): void {
    console.log('values : ', values)
    if (values.length !== 0) {
      const element = values[0]
      console.log('values : ', this.rootItem.children[element - 1].name)
      this.sortWithCategory(this.rootItem.children[element - 1].name)
    } else {
      console.log('clear !')
      this.clearCategory()
    }
  }

  // Permet d'ajouter un tag à un asset
  addTag (asset: CardModel, tag: string): void {
    console.log('addTag')

    asset.parsedTags.push(tag)
  }

  // Permet de supprimer un tab d'un asset
  deleteTag (asset: CardModel, tags: string): void {
    console.log('deleteTag')

    const index = asset.parsedTags.indexOf(tags, 0)

    if (index > -1) {
      asset.parsedTags.splice(index, 1)
    }
    this.releaseAsset(asset)
  }

  // Permet de télécharger un asset
  downloadAsset (asset: CardModel): void {
    console.log('downloadAsset ! ')

    const data = JSON.stringify(asset)
    const blob = new Blob([data], { type: 'text/plain' })

    var url = URL.createObjectURL(blob)
    var pom = document.createElement('a')
    pom.setAttribute('style', 'display: none;')
    pom.href = url
    pom.setAttribute('download', asset.name + '.json')
    pom.click()
  }

  // Permet de charger une scène à partir d'un fichier scène
  loadAsset (): void {
    console.log('Charger asset')
    this.openUploadFile()
  }

  // Charger un asset
  updateUploadFileChargerAsset (e: Event): void {
    if (e.target == null) return
    const target = e.target as HTMLInputElement
    if (target.files != null && target.files.length > 0) {
      [...target.files].forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          console.log(reader.result)
          console.log('============')
          console.log('============')
          console.log('============')
          console.log(JSON.parse(reader.result as string))

          const test = new CardModel(JSON.parse(reader.result as string))
          this.assets.push(test)
          this.addAssetAPI(test)

          console.log('test name : ', test.name)
        }

        reader.onerror = (error) => {
          console.error(error)
          this.$root.$emit('bottom-message', 'Sorry, we cannot read this file.')
        }
        reader.readAsText(file)
      })
    }
  }

  // Permet de faire une requête API pour ajouter un asset
  addAssetAPI (asset: CardModel): void {
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
      console.log('api modif asset')
    })
  }

  // Permet de baisser la taille des assets
  decreaseSizeCard (): void {
    console.log('decreaseSizeCard')
    this.sizeCard -= 10
    if (this.sizeCard < 30) this.sizeCard = 30
    this.sizeCardString = this.sizeCard.toString() + '%'
  }

  // Permet d'augmenter la taille des assets
  increaseSizeCard (): void {
    this.sizeCard += 10
    if (this.sizeCard > 60) this.sizeCard = 60
    this.sizeCardString = this.sizeCard.toString() + '%'
  }

  // Permet d'afficher les assets de cette catégorie là uniquement
  sortWithCategory (categorie: string): void {
    // Active le trie
    this.useCategory = true

    // Trie les différents assets en fonction de la catégorie
    this.cardsSort = []
    for (let i = 0; i < this.assets.length; i++) {
      var asset = this.assets[i]

      if (asset.parsedTags.some((cat) => cat === categorie)) {
        this.cardsSort.push(asset)
      }
    }
  }

  // Permet de supprimer le tri de catégorie
  clearCategory (): void {
    this.useCategory = false
  }

  // Permet de récupérer toutes les catégories différentes des assets
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
        asset: new CardModel({})
      }
      idUnique++

      this.rootItem.children.push(test)
    }
  }

  // Permet d'envoyer l'asset à l'instance d'unreal
  sendUnreal (asset: CardModel): void {
    console.log('asset.name : ', asset.name)
    console.log('asset.name : ', asset.id)

    API.post(
      this,
      '/resources/assets',
      JSON.stringify({
        select: [],
        where: [{ id: asset.id }]
      })
    ).then((response: Response) => {
      const monAssetTableau = (
        response as unknown as Array<Partial<CardModel>>
      ).map((asset: Partial<CardModel>) => new CardModel(asset))

      const monAsset = monAssetTableau[0]

      console.log(monAsset)

      var objectAsset = {
        action: 'envoieAsset',
        name: monAsset.name,
        id: monAsset.id,
        uri: monAsset.uri
      }

      var object = {
        menu: 'asset',
        objet: objectAsset
      }

      Unreal.send(object)
    })
  }
}
</script>
