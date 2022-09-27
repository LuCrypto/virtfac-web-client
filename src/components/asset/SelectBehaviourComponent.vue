<template>
  <v-card>
    <!-- Header -->
    <v-toolbar color="primary" flat>
      <v-toolbar-title class="black--text">
        <v-icon left v-text="'mdi-playlist-plus'"></v-icon>
        {{ $vuetify.lang.t('$vuetify.behaviours.selectBehaviour') }}
      </v-toolbar-title>
    </v-toolbar>
    <v-container class="d-flex pa-5" fluid>
      <v-card
        v-for="categ in behaviours"
        v-bind:key="categ.category"
        style="min-width: 200px"
        class="ma-2 d-flex flex-column"
      >
        <v-toolbar color="primary" flat style="max-height:64px; height:64px">
          <v-toolbar-title class="black--text">
            <v-icon left v-text="'mdi-playlist-plus'"></v-icon>
            {{ $vuetify.lang.t('$vuetify.behaviours.category.' + categ.category.toLowerCase()) }}
          </v-toolbar-title>
        </v-toolbar>
        <v-btn
          v-for="behaviour in categ.behaviours"
          v-bind:key="behaviour.name"
          class="ma-3"
          @click="onSelected(behaviour)"
        >
          {{
            $vuetify.lang.t(
              '$vuetify.behaviours.' +
                behaviour.name
                  .replaceAll(' ', '')
                  .toLowerCase()
                  .replaceAll('/', '') +
                '.name'
            )
          }}
        </v-btn>
      </v-card>
    </v-container>
  </v-card>
</template>

<script lang="ts">
import API from '@/utils/api'
import { Behaviour } from '@/utils/assets/behaviour'
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

@Component({
  name: 'SelectBehaviourComponent'
})
// @vuese
// @group COMPONENTS
// Display all information of an asset
export default class SelectBehaviourComponent extends Vue {
  @Prop() private onSelected!: { (selectedBehaviour: Behaviour): void }

  behaviours: Array<{ category: string; behaviours: Array<Behaviour> }> = []

  created () {
    const behavioursMap = new Map<string, Behaviour[]>()

    behavioursMap.set('Miscellaneous', new Array<Behaviour>())
    Behaviour.behaviours.forEach((value, key) => {
      const args = key.split('/')
      if (args.length > 1) {
        const categ = args[0]
        // const name = args.pop()
        const list = behavioursMap.get(categ)
        if (list === undefined) {
          behavioursMap.set(categ, new Array<Behaviour>(value))
        } else {
          list.push(value)
        }
      } else {
        const categ = 'Miscellaneous'
        // const name = args.pop()
        const list = behavioursMap.get(categ)
        if (list === undefined) {
          behavioursMap.set(categ, new Array<Behaviour>(value))
        } else {
          list.push(value)
        }
      }
    })

    behavioursMap.forEach((value, key) => {
      this.behaviours.push({ category: key, behaviours: value })
    })
  }
}
</script>
