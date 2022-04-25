<template>
  <v-container fluid>
    <!-- Titre -->
    <v-container
      fluid
      class="text-h3 font-weight-regular text-center black--text py-8"
    >
      Gestionnaire de scène
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

      <!-- Les différentes scènes -->
      <v-card
        class="overflow-y-auto d-flex flex-row flex-wrap"
        width="100%"
        height="775"
      >
        <v-card
          :key="indexCard"
          v-for="(card, indexCard) in cards"
          height="455"
          width="30%"
          class="ma-3"
          elevation="5"
        >
          <v-img height="270" :src="card.picture"> </v-img>
          <v-sheet height="4" :color="`#${card.color.toString(16)}`"> </v-sheet>
          <v-card-title> {{ card.name }} </v-card-title>
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
            <v-btn
              x-small
              depressed
              color="primary"
              v-on:click="ergonomioLayout()"
            >
              Ergonomio Layout
            </v-btn>
            <v-btn
              x-small
              depressed
              color="primary"
              v-on:click="ergonomioVirtualTwin()"
            >
              Ergonomio Virtual Twin
            </v-btn>

            <v-spacer></v-spacer>

            <!-- Boutons permettant de supprimer la scène en question -->
            <v-btn v-on:click="clickScene(card)" icon>
              <v-icon left v-text="'mdi-information'"></v-icon>
            </v-btn>
            <v-btn v-on:click="supprimerObjet(card.id)" icon>
              <v-icon left v-text="'mdi-delete'"></v-icon>
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
          v-on:click="creerSceneVide"
          class="yellow darken-3 font-weight-black"
          large
          elevation="2"
        >
          Créer une scène vide
        </v-btn>
      </v-flex>
      <v-flex class="flex-grow-0 mx-5">
        <!-- Bouton permettant de charger une scène -->
        <v-btn
          v-on:click="chargerScene"
          class="yellow darken-3 font-weight-black"
          large
          elevation="2"
        >
          Charger une scène
        </v-btn>
      </v-flex>
      <v-flex class="flex-grow-0 mx-5">
        <!-- Bouton permettant de rajouter un objet dans une scène -->
        <v-btn
          v-on:click="ajouterObjetScene"
          class="yellow darken-3 font-weight-black"
          large
          elevation="2"
        >
          Ajouter une objet dans la scène
        </v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import API from '@/utils/api'

// Modèle d'une scène
class CardModel {
  // Initialisation
  name = 'Scene1.json'
  picture = 'https://cdn.vuetifyjs.com/images/cards/house.jpg'
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

  get formatedCreationDate (): string {
    return new Date(this.creationDate).toLocaleString()
  }

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

@Component
export default class ErgonomIOAssets extends Vue {
  // Initialisation
  cards: CardModel[] = []
  cards2: CardModel[] = []
  titrePopup = ''
  textePopup = ''
  popup = false

  // Begin
  mounted (): void {
    this.cards.push(new CardModel({ id: this.cards.length }))
    this.requeteAPI()
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
  creerSceneVide (): void {
    console.log('creerSceneVide')
    this.cards.push(new CardModel({ id: this.cards.length }))
  }

  chargerScene (): void {
    console.log('Charger scene')
  }

  ajouterObjetScene (): void {
    console.log('ajouterObjetScene')
  }

  // Permet de supprimer la scène en question
  supprimerObjet (index: number): void {
    console.log('Supprimer objet ', index - 1)
    delete this.cards[index - 1]
    this.cards = this.cards.filter(card => card.id !== index - 1)

    console.log('length : ', this.cards.length)
    console.log('length : ', this.cards)
  }

  // Permet d'afficher dans une popup des informations sur la scene
  clickScene (scene: CardModel): void {
    console.log('clickScene : ', scene.id)
    this.popup = true
    this.titrePopup = scene.name

    this.textePopup = scene.data
  }
}
</script>
