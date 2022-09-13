<template>
  <v-card>
    <tr v-for="item in component.ui" v-bind:key="item.label">
      <td>
        {{ item.label }}
      </td>
      <td v-if="item.inputType === 'number'">
        <v-text-field
          v-model="behaviourData.x"
          dense
          single-line
          type="number"
        ></v-text-field>
      </td>
    </tr>
  </v-card>
</template>

<script lang="ts">
import API from '@/utils/api'
import { Behaviour } from '@/utils/assets/behaviour'
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
  @Prop() private component!: Behaviour
  @Prop() private apiAsset!: APIAsset

  private behaviourData: unknown = null

  mounted () {
    this.behaviourData = (JSON.parse(this.apiAsset.behaviours) as Record<
      string,
      unknown
    >)[this.component.name]
  }
}
</script>
