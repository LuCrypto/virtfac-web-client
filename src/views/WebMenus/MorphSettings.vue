<style scoped>
.selected {
  box-shadow: inset 0 0 0 3px white;
}

.slidecontainer {
  width: 100%; /* Width of the outside container */
}

/* The slider itself */
.slider {
  -webkit-appearance: none; /* Override default CSS styles */
  appearance: none;
  width: 100%; /* Full-width */
  height: 20px; /* Specified height */
  background: #d3d3d3; /* Grey background */
  outline: none; /* Remove outline */
  opacity: 1; /* Set transparency (for mouse-over effects on hover) */
  -webkit-transition: 0.2s; /* 0.2 seconds transition on hover */
  transition: opacity 0.2s;
  border-radius: 15px;
}

/* Mouse-over effects */
.slider:hover {
  opacity: 1; /* Fully shown on mouse-over */
}

/* The slider handle (use -webkit- (Chrome, Opera, Safari, Edge) and -moz- (Firefox) to override default look) */
.slider::-webkit-slider-thumb {
  -webkit-appearance: none; /* Override default look */
  appearance: none;
  width: 25px; /* Set a specific slider handle width */
  height: 25px; /* Slider handle height */
  background: #f5a406; /* Green background */
  cursor: pointer; /* Cursor on hover */
  border-radius: 50%;
}

.slider::-moz-range-thumb {
  width: 40px; /* Set a specific slider handle width */
  height: 40px; /* Slider handle height */
  background: #04aa6d; /* Green background */
  cursor: pointer; /* Cursor on hover */
}
</style>

<template>
  <v-card :rounded="unreal.check() ? 'xl' : 'md'">
    <h1 align="center" :key="objectName">{{ objectName }}</h1>
    <v-container class="d-flex flex-wrap" v-if="!showButton">
      <v-btn
        x-large
        depressed
        color="primary"
        class="black--text"
        @click="
          ;(showButton = !showButton), (gizmoBool = false), (morphBool = false)
        "
        >Retour</v-btn
      >
    </v-container>
    <v-container justify-center class="d-flex flex-wrap" v-if="showButton">
      <v-btn
        x-large
        depressed
        color="primary"
        class="black--text"
        @click="
          ;(gizmoBool = !gizmoBool),
            (showButton = !showButton),
            $root.$emit('bottom-message', `Gizmo`)
        "
        >Gizmo</v-btn
      >

      <v-btn
        v-if="hasMorph"
        x-large
        depressed
        color="primary"
        class="black--text"
        @click="
          ;(morphBool = !morphBool),
            (showButton = !showButton),
            $root.$emit('bottom-message', `Morphs`)
        "
        >Morph</v-btn
      >
    </v-container>

    <!-- MorphTargets -->
    <v-container v-show="morphBool">
      <v-row class="flex-grow-1 justify-center"> MorphTargets </v-row>
      <v-list class="overflow-y-auto">
        <v-sheet v-for="(morphTarget, index) of morphTargetsArray" :key="index">
          {{ morphTarget.name }}
          <div class="slidecontainer mb-4">
            <input
              type="range"
              min="0"
              max="100"
              v-model="morphTarget.weight"
              class="slider"
              id="myRange"
            />
          </div>
        </v-sheet>
      </v-list>
    </v-container>

    <!-- Gizmo 2D-->
    <v-container v-show="gizmoBool">
      <!--Affichage des repères d'axes -->
      <v-row align="center">
        <v-col align="center" v-for="(axes, index) in axesArray" :key="index">
          <v-sheet :color="axesColorsArray[index]" elevation="1">
            {{ axes }}
          </v-sheet>
        </v-col>
      </v-row>
      <!--Affichage des transforms et blocks de numbers-->
      <v-row
        align="center"
        no-gutters
        v-for="(transform, index) in transformArray"
        :key="index"
      >
        <!-- Affiche le nom de la transform -->
        <v-col align="center">{{ transform }} :</v-col>
        <!-- Affiche les X,Y,Z de la transformation -->
        <v-col v-for="n in 3" :key="n" class="pa-2">
          <v-text-field
            v-model="objectTransform.transform[index][n - 1]"
            outlined
            hide-details
            append-outer-icon="mdi-plus"
            color="primary"
            @click:append-outer="increment(index, n - 1)"
            prepend-icon="mdi-minus"
            @click:prepend="decrement(index, n - 1)"
            @input="
              ;(objectTransform.transform[index][n - 1] = parseFloat(
                objectTransform.transform[index][n - 1]
              )),
                SendTransformData(index, n - 1)
            "
            align="center"
            single-line
            type="number"
            :key="counter"
          />
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'

import Component from 'vue-class-component'
// import VueCircleSlider from 'vue-circle-slider'
import Unreal from '@/utils/unreal'
import Morph from '@/utils/morph'
import Transform from '@/utils/morphTransform'
import Vec3 from '@/utils/vector3'
import MyAsset from '@/utils/objectClass'
import Name from '@/utils/name'

@Component
export default class ErgonomioSettings extends Vue {
  unreal = Unreal

  counter = 0
  valeurIncr = 0
  Color = this.$vuetify.theme.themes.dark.primary
  objectName = 'Nom de mon Objet'
  sliderTemplate = { label: 'MorphTargets Weight :', val: 0.5, color: 'red' }
  transformArray = ['Location', 'Rotation', 'Scale']
  axesArray = ['', 'X', 'Y', 'Z']
  axesColorsArray = ['black', 'red', 'green', 'blue']
  morphTargetsArray: Morph[] = []
  testName: Name = new Name(null)
  gizmoBool = false
  morphBool = false
  showButton = true
  hasMorph = false

  // tmp en attendant la liaison Unreal
  translation = new Vec3(0, 0, 0)
  rotation = new Vec3(0, 0, 0)
  scale = new Vec3(1, 1, 1)

  objectTransform = new Transform(this.translation, this.rotation, this.scale)

  mounted (): void {
    Unreal.callback.$on('unreal-message', (data: MyAsset) => {
      this.$root.$emit('bottom-message', `Unreal : ${JSON.stringify(data)}`)
      this.objectName = data.name
      this.translation = new Vec3(
        data.translation[0],
        data.translation[1],
        data.translation[2]
      )
      this.rotation = new Vec3(
        data.rotation[0],
        data.rotation[1],
        data.rotation[2]
      )
      this.scale = new Vec3(data.scale[0], data.scale[1], data.scale[2])
      this.objectTransform = new Transform(
        this.translation,
        this.rotation,
        this.scale
      )
      this.initMorph(data.morphs)
      this.counter++
      Unreal.send(data.morphs)
    })
  }

  increment (n: number, m: number): void {
    console.log('increment')
    this.objectTransform.transform[n][m] += 0.01
    this.objectTransform.transform[n][m] =
      Math.round(this.objectTransform.transform[n][m] * 100) / 100
    this.SendTransformData()
    this.counter++
  }

  decrement (n: number, m: number): void {
    console.log('decrement')
    this.objectTransform.transform[n][m] -= 0.01
    this.objectTransform.transform[n][m] =
      Math.round(this.objectTransform.transform[n][m] * 100) / 100
    this.counter++
    this.SendTransformData()
  }

  initMorph (morphArray: Array<Morph>): void {
    this.morphTargetsArray = []
    for (let i = 0; i < morphArray.length; i++) {
      var tmpMorph = new Morph(
        morphArray[i].weight,
        morphArray[i].name,
        morphArray[i].id
      )
      this.morphTargetsArray.push(tmpMorph)
    }
    if (this.morphTargetsArray.length > 0) this.hasMorph = true
    else this.hasMorph = false
  }

  GetTransformData (): void {
    console.log('Communique avec Unreal')
  }

  SendTransformData (): void {
    console.log('Envoie à Unreal')
    Unreal.send(this.objectTransform)
  }

  setName (data: MyAsset): void {
    this.objectName = data.name
  }

  //   <circle-slider
  //   v-model="morphTarget.weight"
  //   :label="morphTarget.name"
  //   :progressColor="Color"
  //   :knobColor="Color"
  //   :stepSize="1"
  //   :min="0"
  //   :max="100"
  //   align="center"
  // ></circle-slider>
}
</script>
