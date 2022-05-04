<template>
  <v-container fluid>
    <!-- Titre -->
    <v-container fluid class="text-h3 font-weight-regular text-center py-8">
      Gestionnaire d'assets
    </v-container>
    <v-divider></v-divider>
    <!-- Milieu de page : les différentes cartes de scènes -->
    <template>
      <!-- Popup permettant de voir l'URI d'un asset -->
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

      <!-- Popup permettant de modifier des données de la scène -->
      <v-row justify="center">
        <v-dialog v-model="modifierAsset" max-width="780">
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
                  <v-text-field v-model="nouveauTag"> </v-text-field>
                </v-col>

                <v-col cols="3">
                  <v-btn v-on:click="ajouterTag(assetChoisie, nouveauTag)" icon>
                    <v-icon v-text="'mdi-plus'"></v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>

            <!-- Permet de changer la preview de l'asset -->
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

            <!-- Permet de supprimer des tags -->
            <v-container
              fluid
              :key="indexTag2"
              v-for="(tag, indexTag2) in assetChoisie.parsedTags"
            >
              <v-row>
                <v-col cols="2">
                  <v-card-text>
                    {{ tag }}
                  </v-card-text>
                </v-col>

                <v-col cols="3">
                  <v-btn v-on:click="supprimerTag(assetChoisie, tag)" icon>
                    <v-icon v-text="'mdi-delete'"></v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="green darken-1" text @click="save(assetChoisie)">
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>

      <v-card class="overflow-y-auto d-flex flex-row" width="100%" height="750">
        <v-card width="25%">
          <v-btn width="90%" class="ma-2" v-on:click="clearCategorie()">
            Effacer le tri
          </v-btn>
          <v-card-title> Les différentes catégories : </v-card-title>

          <v-card-text>
            <v-btn
              class="ma-2"
              :key="indexCategorie"
              v-for="(categorie, indexCategorie) in categorieAsset"
              v-on:click="trierAvecCategorie(categorie)"
            >
              {{ categorie }}
            </v-btn>
          </v-card-text>
        </v-card>

        <v-container class="d-flex flex-wrap">
          <v-card
            width="387"
            :key="indexCard"
            v-for="(card, indexCard) in utilisationCategorie
              ? cardsTriee
              : cards"
            v-on:click="envoyerUnreal(card)"
          >
            <v-list-item :key="card.name">
              <v-img max-width="190" :src="card.picture" class="mr-2"></v-img>

              <v-list-item-content>
                <v-list-item-title v-html="card.name"> </v-list-item-title>

                <v-container class="flex-row">
                  <v-chip
                    :key="indexTag"
                    v-for="(tag, indexTag) in card.parsedTags"
                    class="mr-2 overflow-y-auto"
                  >
                    {{ tag }}
                  </v-chip>
                </v-container>

                <v-list-item-action>
                  <v-btn v-on:click="editerNomAsset(card)" icon>
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
          v-on:click="chargerAsset"
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

@Component
export default class ErgonomIOAssets extends Vue {
  // Initialisation
  cards: CardModel[] = []
  cards2: CardModel[] = []

  utilisationCategorie = false
  cardsTriee: CardModel[] = []
  dialog = false
  popup = false
  textePopup = 'texte popup'
  titrePopup = 'titre popup'
  search = ''

  nouveauTag = ''
  nouvelleImage = ''

  modifierAsset = false
  assetChoisie: CardModel = new CardModel({ id: 1 })

  tailleCard = 30
  tailleCardString = '30%'

  categorieAsset = ['test', 'autre']

  items = [
    { header: 'Today' },
    {
      avatar: 'https://cdn.vuetifyjs.com/images/lists/1.jpg',
      title: 'Brunch this weekend?',
      subtitle:
        '<span class="text--primary">Ali Connors</span> &mdash; I\'ll be in your neighborhood doing errands this weekend. Do you want to hang out?'
    }
  ]

  // Begin
  mounted (): void {
    this.cards.push(new CardModel({ id: this.cards.length }))
    this.cards.push(new CardModel({ id: this.cards.length }))
    this.requeteAPI()
  }

  // Permet d'ouvrir la popup avec les bonnes informations
  clickCard (card: CardModel): void {
    console.log('clickCard : ', card.id)
    this.popup = true
    this.titrePopup = card.name

    if (card.uri.length > 10000) {
      this.textePopup = card.uri.substring(0, 10000) + '........'
    } else {
      this.textePopup = card.uri
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
      this.cards2 = ((response as unknown) as Array<Partial<CardModel>>).map(
        (asset: Partial<CardModel>) => new CardModel(asset)
      )

      for (let i = 0; i < this.cards2.length; i++) {
        this.cards.push(this.cards2[i])
      }
      this.cards2 = []
    })
  }

  // Permet de modifier le nom d'un asset
  editerNomAsset (asset: CardModel): void {
    console.log('editerNomAsset ')
    this.modifierAsset = true
    this.assetChoisie = asset
  }

  // Permet de modifier un asset
  save (asset: CardModel): void {
    console.log('save : ', this.search)
    this.modifierAsset = false

    if (this.nouvelleImage !== '') {
      console.log('Changement image')
      asset.picture = this.nouvelleImage
    }

    if (this.search.length !== 0) asset.name = this.search
    this.miseAJourAsset(asset)

    this.nouvelleImage = ''
  }

  // Permet de mettre à jour une scène
  miseAJourAsset (asset: CardModel): void {
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

  // Permet d'ajouter un tag à un asset
  ajouterTag (asset: CardModel, tag: string): void {
    console.log('ajouterTag')

    asset.parsedTags.push(tag)
  }

  // Permet de supprimer un tab d'un asset
  supprimerTag (asset: CardModel, tags: string): void {
    console.log('supprimerTag')

    const index = asset.parsedTags.indexOf(tags, 0)

    if (index > -1) {
      asset.parsedTags.splice(index, 1)
    }
    this.miseAJourAsset(asset)
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
  chargerAsset (): void {
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
          this.cards.push(test)
          this.ajouterAssetAPI(test)

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
  ajouterAssetAPI (asset: CardModel): void {
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

  // Permet d'afficher les assets de cette catégorie là uniquement
  trierAvecCategorie (categorie: string): void {
    // Active le trie
    this.utilisationCategorie = true

    // Trie les différents assets en fonction de la catégorie
    this.cardsTriee = []
    console.log('categorie : ', categorie)
    console.log('this.cards.length : ', this.cards.length)
    for (let i = 0; i < this.cards.length; i++) {
      var asset = this.cards[i]
      console.log('asset.parsedTags : ', asset.parsedTags)
      console.log('asset.parsedTags : ', asset.parsedTags[0])

      if (asset.parsedTags.some(cat => cat === categorie)) {
        console.log('oui')
        this.cardsTriee.push(asset)
      } else {
        console.log('non')
      }
    }
  }

  // Permet de supprimer le tri de catégorie
  clearCategorie (): void {
    this.utilisationCategorie = false
  }

  // Permet d'envoyer un message à l'instance unreal
  envoyerUnreal (asset: CardModel): void {
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
