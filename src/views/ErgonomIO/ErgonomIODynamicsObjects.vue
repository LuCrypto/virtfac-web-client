<template>
  <v-container>
    <!-- Pour affecter une position à un évènement -->
    <v-dialog v-model="modifierPositionBooleen">
      <v-container class="d-flex flex-wrap flex-nowrap">
        <!-- X, Y et Z -->
        <v-row align="center">
          <v-col align="center">
            <!-- Axe -->
            <v-sheet max-width="25" :color="axesColorsArray[1]" elevation="1">
              {{ axesArray[1] }}
            </v-sheet>
            <!-- Inputs pour les coordonnées -->
            <v-text-field
              @click:prepend="decrement(1)"
              @click:append-outer="increment(1)"
              v-if="1 != 0"
              v-model="positionEvenement['x']"
              outlined
              value="0"
              input="0"
              hide-details
              append-outer-icon="mdi-plus"
              color="primary"
              prepend-icon="mdi-minus"
              align="center"
              single-line
              type="number"
            />
          </v-col>
          <v-col align="center">
            <!-- Axe -->
            <v-sheet max-width="25" :color="axesColorsArray[2]" elevation="1">
              {{ axesArray[2] }}
            </v-sheet>
            <!-- Inputs pour les coordonnées -->
            <v-text-field
              v-if="2 != 0"
              v-model="positionEvenement['y']"
              outlined
              hide-details
              append-outer-icon="mdi-plus"
              color="primary"
              @click:append-outer="increment(2)"
              prepend-icon="mdi-minus"
              @click:prepend="decrement(2)"
              align="center"
              single-line
              type="number"
              :key="counter"
            />
          </v-col>
          <v-col align="center">
            <!-- Axe -->
            <v-sheet max-width="25" :color="axesColorsArray[3]" elevation="1">
              {{ axesArray[3] }}
            </v-sheet>
            <!-- Inputs pour les coordonnées -->
            <v-text-field
              v-if="3 != 0"
              v-model="positionEvenement['z']"
              outlined
              hide-details
              append-outer-icon="mdi-plus"
              color="primary"
              @click:append-outer="increment(3)"
              prepend-icon="mdi-minus"
              @click:prepend="decrement(3)"
              align="center"
              single-line
              type="number"
              :key="counter"
            />
          </v-col>
          <!-- Pour sauvegarder la position de l'évènement -->
          <v-col align="center">
            <v-btn color="primary" text @click="save()">
              Save
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-dialog>

    <!-- La liste des profils -->
    <v-list>
      <v-list-group
        v-for="item in profils"
        :key="item.title"
        v-model="item.active"
        :prepend-icon="item.action"
        no-action
      >
        <template v-slot:activator>
          <v-list-item-content>
            <v-list-item-title v-text="item.title"></v-list-item-title>
          </v-list-item-content>
        </template>

        <!-- Liste des évènements -->
        <v-list-item v-for="child in item.items" :key="child.title">
          <v-btn
            color="primary"
            class="black--text"
            @click="moveToEvent(child)"
          >
            {{ child.evenement }}
            <br />
            Position :
            {{ child.position }}
            <!-- Permet de pouvoir modifier la position de l'évènement -->
            <v-btn icon>
              <v-icon
                @click="modifierPosition($event, child)"
                class="ml-2 black--text"
                v-text="'mdi-pencil'"
                left
              ></v-icon>
            </v-btn>
          </v-btn>
        </v-list-item>
      </v-list-group>
    </v-list>

    <!-- Les différents boutons -->
    <v-container class="d-flex flex-wrap flex-nowrap">
      <v-row align="center">
        <!-- Permet de démarrer un profil avec l'objet sélectionné -->
        <v-col align="center">
          <v-btn
            class="primary black--text my-2"
            @click="demarreProfil()"
            large
            elevation="2"
          >
            Démarrer le profil
          </v-btn>
        </v-col>
        <!-- Permet d'écouter sur le serveur -->
        <v-col align="center">
          <v-btn
            class="primary black--text my-2"
            @click="ecouterServeur()"
            large
            elevation="2"
          >
            Écouter les ids du serveur
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import API from '@/utils/api'
import Unreal from '@/utils/unreal'
import VueRouter, { RouterMode } from 'vue-router'
import { Vector2 } from '@/utils/graph/Vec'
import { Vector3 } from 'three'

// Classe d'un évènement
class evenementClass {
  evenement = ''

  constructor () {
    Object.assign(this)
  }
}

@Component
export default class ErgonomIOAssets extends Vue {
  // Default
  router: VueRouter = this.$router
  query = this.router.currentRoute.query
  fullpage: boolean = this.query.fullpage === 'true'
  modifyAsset = true
  unrealContext = Unreal

  transformArray = ['Location', 'Rotation', 'Scale']
  axesArray = ['', 'X', 'Y', 'Z']
  axesColorsArray = ['black', 'red', 'green', 'blue']
  textFieldValue = ''
  counter = 0
  positionEvenement = new Vector3(0, 0, 0)
  childSave = { evenement: 'Evenement 1', position: new Vector3(0, 0, 0) }
  modifierPositionBooleen = false

  // Liste des profils
  profils = [
    {
      action: 'mdi-calendar-search',
      items: [{ evenement: 'Evenement 1', position: new Vector3(0, 0, 0) }],
      title: 'Profil 1',
      active: false
    },
    {
      action: 'mdi-calendar-search',
      items: [
        { evenement: 'Evenement 1', position: new Vector3(0, 0, 0) },
        { evenement: 'Evenement 2', position: new Vector3(0, 0, 0) },
        { evenement: 'Evenement 3', position: new Vector3(0, 0, 0) }
      ],
      title: 'Profil 2',
      active: false
    },
    {
      action: 'mdi-calendar-search',
      items: [{ evenement: 'Evenement 1', position: new Vector3(0, 0, 0) }],
      title: 'Profil 3',
      active: false
    }
  ]

  // Begin
  mounted (): void {
    this.ajouterProfil()

    Unreal.callback.$on('unreal-message', (data: unknown) => {
      try {
        this.$root.$emit('bottom-message', `Unreal : ${JSON.stringify(data)}`)
      } catch (error) {
        Unreal.send('PROBLEME : ')
      }

      const test = data as evenementClass

      Unreal.send(data as evenementClass)

      // Unreal.send(data as evenementClass)

      // this.ajouterProfil()
      this.profils[this.profils.length - 1].items.push({
        evenement: test.evenement,
        position: new Vector3(0, 0, 0)
      })

      // Unreal.send(data)

      // var monObjet = data as messageAsset
      // Unreal.send(monObjet.message)
    })
  }

  // Permet de démarrer la simulation du profil
  demarreProfil (): void {
    var objectOpcua = {
      action: 'demarreProfil'
    }

    var object = {
      menu: 'opcua',
      objet: objectOpcua
    }

    // On envoie le profil
    Unreal.send(object)
  }

  // ???
  ecouterServeur (): void {
    console.log('ecouterServeur !')
  }

  // Permet d'afficher une palette sur un évènement
  moveToEvent (child: any): void {
    console.log('Position : ', child.position)
    const monVecteur = child.position as Vector3
    console.log('Position : ', monVecteur.toArray())

    var objectOpcua = {
      action: 'bougerEvenement',
      position: monVecteur.toArray()
    }

    var object = {
      menu: 'opcua',
      objet: objectOpcua
    }

    // On envoie la position de l'évènement
    Unreal.send(object)
  }

  // Permet de décrementer la position
  decrement (nombre1: number): void {
    console.log('nombre 1 : ', nombre1)

    if (nombre1 === 1) this.positionEvenement.x--
    else if (nombre1 === 2) this.positionEvenement.y--
    else if (nombre1 === 3) this.positionEvenement.z--
  }

  // Permet d'augmenter la position
  increment (nombre1: number): void {
    console.log('nombre 1 : ', nombre1)

    if (nombre1 === 1) this.positionEvenement.x++
    else if (nombre1 === 2) this.positionEvenement.y++
    else if (nombre1 === 3) this.positionEvenement.z++
  }

  // Permet de modifier la position d'un évènement
  modifierPosition (event: Event, child: any): void {
    // Consume l'event
    event.stopPropagation()

    this.childSave = child
    this.modifierPositionBooleen = true
  }

  // Permet d'ajouter un profil permettant de stocker une liste d'profils
  ajouterProfil (): void {
    const objet = {
      action: 'mdi-calendar-search',
      items: [{ evenement: 'Evenement 1', position: new Vector3(0, 0, 0) }],
      title: 'Profil 4',
      active: false
    }

    this.profils.push(objet)
  }

  // Permet de sauvegarder les modifications des positions sur un évènement
  save (): void {
    this.modifierPositionBooleen = false
    this.childSave.position = this.positionEvenement
  }
}
</script>
