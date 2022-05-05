<template>
  <v-container fluid style="max-height: 100%; overflow: auto;">
    <!-- Titre -->
    <v-container fluid class="text-h3 text-center py-8">
      Asset library
    </v-container>
    <v-divider></v-divider>
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
                  <v-card-text>
                    Nouveau titre :
                  </v-card-text>
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
                  <v-card-text>
                    Nouveau tag :
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

            <!-- Permet de changer la preview de l'asset -->
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

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="green darken-1" text @click="save(assetChoose)">
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>

      <v-card class="overflow-y-auto d-flex flex-row" width="100%" height="750">
        <v-card width="25%">
          <v-btn width="90%" class="ma-2" v-on:click="clearCategory()">
            Effacer le tri
          </v-btn>
          <v-card-title> Les différentes catégories : </v-card-title>

          <v-card-text>
            <v-btn
              class="ma-2"
              :key="indexCategorie"
              v-for="(categorie, indexCategorie) in categoryAsset"
              v-on:click="sortWithCategory(categorie)"
            >
              {{ categorie }}
            </v-btn>

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
                <!-- Les elements -->
                <!-- <div v-else>
                  <v-chip
                    style="min-width: 65px;"
                    class="ma-2"
                    :color="getTypeColor(item.request.type)"
                  >
                    {{ item.request.type }}
                  </v-chip>
                  {{ item.request.path }}
                </div> -->
              </template>

              <!-- <template v-slot:label="{ item }">
                <div class="pr-4" style="cursor: pointer">{{ item.name }}</div>
              </template> -->
            </v-treeview>
          </v-card-text>
        </v-card>

        <v-container class="d-flex flex-wrap">
          <v-card
            :width="sizeCardString"
            :key="indexCard"
            v-for="(asset, indexCard) in useCategory ? cardsSort : assets"
            v-on:click="sendUnreal(asset)"
          >
            <v-list-item :key="asset.name">
              <v-img max-width="190" :src="asset.picture" class="mr-2"></v-img>

              <v-list-item-content>
                <v-list-item-title v-html="asset.name"> </v-list-item-title>

                <v-container class="flex-row">
                  <v-chip
                    :key="indexTag"
                    v-for="(tag, indexTag) in asset.parsedTags"
                    class="mr-2 overflow-y-auto"
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
          class="yellow darken-3 font-weight-black"
          large
          elevation="2"
        >
          Charger un asset
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
import { Component, Vue } from 'vue-property-decorator'
import API from '@/utils/api'
import Unreal from '@/utils/unreal'

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

interface TreeItem {
  id: number
  name: string
  children: TreeItem[]
  asset: CardModel
}

@Component
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
  assetChoose: CardModel = new CardModel({ id: 1 })

  sizeCard = 30
  sizeCardString = '30%'

  categoryAsset = ['test', 'autre']

  items = [
    { header: 'Today' },
    {
      avatar: 'https://cdn.vuetifyjs.com/images/lists/1.jpg',
      title: 'Brunch this weekend?',
      subtitle:
        '<span class="text--primary">Ali Connors</span> &mdash; I\'ll be in your neighborhood doing errands this weekend. Do you want to hang out?'
    }
  ]

  rootItem: TreeItem = {
    id: 0,
    name: 'root',
    children: [],
    asset: new CardModel({})
  }

  // Begin
  mounted (): void {
    this.assets.push(new CardModel({ id: this.assets.length }))
    this.assets.push(new CardModel({ id: this.assets.length }))
    this.requeteAPI()
    this.createCategory()
  }

  // Permet de créer un exemple des différentes catégorie avec une hiérarchie
  createCategory (): void {
    let idUnique = 1
    for (let i = 0; i < 5; i++) {
      const test: TreeItem = {
        id: idUnique,
        name: 'Categorie ' + idUnique.toString(),
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
      '/resources/files',
      JSON.stringify({
        select: [],
        where: []
      })
    ).then((response: Response) => {
      console.log('response ', response)
      this.assets2 = ((response as unknown) as Array<Partial<CardModel>>).map(
        (asset: Partial<CardModel>) => new CardModel(asset)
      )

      for (let i = 0; i < this.assets2.length; i++) {
        this.assets.push(this.assets2[i])
      }
      this.assets2 = []
    })
  }

  // Permet de modifier le nom d'un asset
  editNameAsset (asset: CardModel): void {
    console.log('editNameAsset ')
    this.modifyAsset = true
    this.assetChoose = asset
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
    API.patch(
      this,
      `/resources/files/${asset.id}`,
      JSON.stringify({
        color: asset.color,
        creationDate: asset.creationDate,
        id: asset.id,
        idProject: asset.idProject,
        idUserOwner: asset.idUserOwner,
        modificationDate: asset.modificationDate,
        name: asset.name,
        tags: JSON.stringify(asset.parsedTags),
        uri: asset.uri
      })
    ).then((response: Response) => {
      console.log('api modif asset')
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

  // Permet de trier avec une catégorie à travers la hiérarchie
  scrollOnElement (values: number[]): void {
    console.log('values : ', values)

    if (values !== []) {
      if (values[0] === 2) {
        console.log('Trie test !')
        this.sortWithCategory('test')
      } else {
        this.clearCategory()
      }
    } else {
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
      [...target.files].forEach(file => {
        const reader = new FileReader()
        reader.onload = e => {
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

        reader.onerror = error => {
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
      '/resources/files',
      JSON.stringify({
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
      })
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
    if (this.sizeCard > 50) this.sizeCard = 50
    this.sizeCardString = this.sizeCard.toString() + '%'
  }

  // Permet d'afficher les assets de cette catégorie là uniquement
  sortWithCategory (categorie: string): void {
    // Active le trie
    this.useCategory = true

    // Trie les différents assets en fonction de la catégorie
    this.cardsSort = []
    console.log('categorie : ', categorie)
    console.log('this.assets.length : ', this.assets.length)
    for (let i = 0; i < this.assets.length; i++) {
      var asset = this.assets[i]
      console.log('asset.parsedTags : ', asset.parsedTags)
      console.log('asset.parsedTags : ', asset.parsedTags[0])

      if (asset.parsedTags.some(cat => cat === categorie)) {
        console.log('oui')
        this.cardsSort.push(asset)
      } else {
        console.log('non')
      }
    }
  }

  // Permet de supprimer le tri de catégorie
  clearCategory (): void {
    this.useCategory = false
  }

  // Permet d'envoyer un message à l'instance unreal
  sendUnreal (asset: CardModel): void {
    console.log('asset.name : ', asset.name)

    var objectAsset = {
      name: asset.name
    }

    var object = {
      menu: 'asset',
      objet: objectAsset
    }

    Unreal.send(object)
  }
}
</script>
