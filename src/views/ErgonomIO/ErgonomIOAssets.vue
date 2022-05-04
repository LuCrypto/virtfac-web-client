<template>
  <v-container fluid style="max-height: 100%; overflow: auto;">
    <!-- Titre -->
    <v-container
      fluid
      class="text-h3 font-weight-regular text-center black--text py-8"
    >
      Gestionnaire d'assets
    </v-container>
    <v-divider></v-divider>
    <!-- Milieu de page : les différentes cartes de scènes -->
    <template>
      <v-row dense class="pa-2">
        Les différents assets :
      </v-row>
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
              v-for="(tag, indexTag) in card.tags"
              class="mr-2 overflow-y-auto"
            >
              {{ tag }}
            </v-chip>
          </v-card-subtitle>
          <v-card-text>
            {{ card.dateCreation }}
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-card>
    </template>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import API from '@/utils/api'

class CardModel {
  name = 'Asset1.json'
  picture = 'https://cdn.vuetifyjs.com/images/cards/house.jpg'
  tags = '[]'
  dateCreation = '04/22/2022'
  id = 0
  color = ''
  assetsNumber = 0
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
}
</script>
