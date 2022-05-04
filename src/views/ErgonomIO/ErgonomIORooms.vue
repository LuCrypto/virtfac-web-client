<template>
  <v-container fluid>
    <!-- Titre -->
    <v-container fluid class="text-h3 text-center py-8">
      Collaborative sessions
    </v-container>
    <!-- Milieu de page : les différentes cartes de scènes -->
    <template>
      <v-row dense class="pa-2">
        <v-alert dense color="primary" class="flex-grow-1">
          <v-row align="center">
            <v-col class="grow black--text">
              <v-icon left color="black">mdi-account-supervisor-circle</v-icon>
              Current session : None
            </v-col>
            <v-col class="shrink">
              <v-btn @click="leaveSession">Leave session</v-btn>
            </v-col>
          </v-row>
        </v-alert>
      </v-row>
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
            <v-btn
              v-on:click="() => joinSession(card)"
              class="primary black--text"
              large
              elevation="2"
            >
              Join
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-card>
    </template>
    <!-- Les différents boutons -->
    <v-layout justify-center class="py-4">
      <v-flex class="flex-grow-0 mx-5">
        <v-btn
          v-on:click="createSession"
          class="primary black--text"
          large
          elevation="2"
        >
          Create new session
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

  createSession (): void {
    console.log('Create room')
  }

  // TODO : replace "CardModel" by session
  joinSession (session: CardModel): void {
    console.log('Join session : ', JSON.stringify(session))
  }

  leaveSession (): void {
    console.log('Leave session')
  }
}
</script>
