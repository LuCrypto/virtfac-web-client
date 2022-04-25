<template>
  <v-container fluid>
    <!-- Titre -->
    <v-container
      fluid
      class="text-h3 font-weight-regular text-center black--text py-8"
    >
      Lobbys des rooms
    </v-container>
    <v-divider></v-divider>
    <!-- Milieu de page : les différentes cartes de scènes -->
    <template>
      <v-row dense class="pa-2">
        Ma room actuelle : None
      </v-row>
      <v-row dense class="pa-2">
        Les différentes rooms :
      </v-row>

      <!-- Les différentes rooms -->
      <v-card
        class="overflow-y-auto d-flex flex-row flex-wrap"
        width="100%"
        height="675"
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
              v-for="(tag, indexTag) in card.tags"
              class="mr-2 overflow-y-auto"
            >
              {{ tag }}
            </v-chip>
          </v-card-subtitle>
          <v-card-text>
            {{ card.dateCreation }}, nombre de joueurs : {{ card.playerNumber }}
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-card>
    </template>
    <!-- Les différents boutons -->
    <v-layout justify-center class="py-4">
      <v-flex class="flex-grow-0 mx-5">
        <!-- Permet de créer une room -->
        <v-btn
          v-on:click="creerRoom"
          class="yellow darken-3 font-weight-black"
          large
          elevation="2"
        >
          Créer une room
        </v-btn>
      </v-flex>
      <v-flex class="flex-grow-0 mx-5">
        <!-- Permet de rejoindre une room -->
        <v-btn
          v-on:click="rejoindreRoom"
          class="yellow darken-3 font-weight-black"
          large
          elevation="2"
        >
          Rejoindre une room
        </v-btn>
      </v-flex>
      <v-flex class="flex-grow-0 mx-5">
        <!-- Permet de quitter une room -->
        <v-btn
          v-on:click="quitterRoom"
          class="yellow darken-3 font-weight-black"
          large
          elevation="2"
        >
          Quitter la room
        </v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import API from '@/utils/api'

class CardModel {
  name = 'Room1.json'
  picture = 'https://cdn.vuetifyjs.com/images/cards/house.jpg'
  tags = '[]'
  dateCreation = '04/22/2022'
  id = 0
  color = ''
  playerNumber = 0
  creationDate = 0
  data = ''
  idProject = 0
  idUserOwner = 0
  modificationDate = 0

  constructor (params: Partial<CardModel>) {
    const { data, tags, ...others } = params
    Object.assign(this, others)

    try {
      this.data = JSON.parse(data || '[]')
      this.tags = JSON.parse(tags || '[]')
      // this.color = atob(color || '000000')
    } catch (e) {
      console.error(e)
    }
  }
}

@Component
export default class ErgonomIOAssets extends Vue {
  cards: CardModel[] = []
  cards2: CardModel[] = []

  mounted (): void {
    this.cards.push(new CardModel({ id: this.cards.length }))
    this.requeteAPI()
  }

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

  creerRoom (): void {
    console.log('Creer room')
  }

  rejoindreRoom (): void {
    console.log('Rejoindre room')
  }

  quitterRoom (): void {
    console.log('Rejoindre room')
  }
}
</script>
