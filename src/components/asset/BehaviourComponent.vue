<template>
  <v-container flat class="d-flex pa-0 ma-0">
    <table class="flex-grow-1" cellspacing="0">
      <tr class="primary">
        <td style="width:30%; max-width:100px ;">
          <v-icon class="ma-2"> {{ component.mdiIcon }} </v-icon>
        </td>
        <td
          style="text-align: right; padding-right:10px"
          class="black--text pt-1 pb-1"
        >
          {{ name }}
        </td>
      </tr>
      <tr v-for="item in component.ui" v-bind:key="item.label">
        <td class="pl-2">
          {{ item.label }}
        </td>
        <td v-if="item.inputType === 'number'">
          <v-text-field
            v-model="behaviourInstance.data[item.label]"
            dense
            single-line
            type="number"
            @change="
              value => {
                item.onChange(behaviourInstance.data, value)
              }
            "
          ></v-text-field>
        </td>
        <td v-if="item.inputType === 'string'">
          <v-text-field
            v-model="behaviourInstance.data[item.label]"
            dense
            single-line
            @change="
              value => {
                item.onChange(behaviourInstance.data, value)
              }
            "
          ></v-text-field>
        </td>
        <td v-if="item.inputType === 'boolean'">
          <v-checkbox
            v-model="behaviourInstance.data[item.label]"
            dense
            @change="
              value => {
                item.onChange(behaviourInstance.data, value)
              }
            "
            @click="logState()"
          ></v-checkbox>
        </td>
      </tr>
    </table>
  </v-container>
</template>

<script lang="ts">
import API from '@/utils/api'
import { Behaviour, BehaviourInstance } from '@/utils/assets/behaviour'
import { APIAsset, APIBoundingBox } from '@/utils/models'
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

@Component({
  name: 'BehaviourComponent'
})
// @vuese
// @group COMPONENTS
// Display all information of an asset
export default class BehaviourComponent extends Vue {
  @Prop() private behaviourInstance!: BehaviourInstance

  private component: Behaviour | undefined = undefined
  // private behaviourData: unknown = null
  public name = ''

  created () {
    if (this.component === undefined) {
      const c = Behaviour.behaviours.get(this.behaviourInstance.name)
      if (c === undefined) {
        throw new Error('invalid component : ' + this.behaviourInstance.name)
      }
      this.component = c
    }
    this.name = this.component.name
  }

  public logState () {
    console.log(this.behaviourInstance)
  }
}
</script>
