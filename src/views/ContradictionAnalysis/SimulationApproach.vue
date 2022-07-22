<template>
  <v-container class="spacing-playground pa-6 contradiction-analysis">
    <v-card elevation="3" class="mx-auto mb-6">
      <v-card-title>Contradiction Analysis</v-card-title>
      <v-card-subtitle
        >Contradiction analysis via a simulation approach (Naser)
      </v-card-subtitle>
    </v-card>
    Feature under development, based on the work of Mohamed.
    <v-spacer class="mt-6"></v-spacer>
    <v-btn color="primary" @click="$refs.openFilePopUp.open()">
      <v-icon left v-text="'mdi-file-document'"></v-icon>
      Open file
      <input ref="uploadFileInput" style="display: none" type="file" />
    </v-btn>
    <v-btn color="primary" class="ml-6" @click="openFormatSelectorPopUp">
      <v-icon left v-text="'mdi-file-document'"></v-icon>
      Format Select
      <input ref="uploadFileInput" style="display: none" type="file" />
    </v-btn>
    <v-spacer class="mt-6"></v-spacer>
    <range-bar
      :rangeBarChartData="chartData"
      :defaultRange="[20, 80]"
    ></range-bar>
    <pop-up ref="openFilePopUp">
      <open-file
        @close="$refs.openFilePopUp.close()"
        application="ALL"
        :singleSelect="true"
        :openFile="true"
        @fileInput="handleFile"
      ></open-file>
    </pop-up>
    <format-selector-pop-up
      ref="formatSelectorPopUp"
      @selectedFormat="selectedFormat"
    ></format-selector-pop-up>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import DrawingShopComponent from '@/components/DrawingShopComponent.vue'
import OpenFilePopUp from '@/components/OpenFile.vue'
import FormatSelectorPopUp from '@/components/popup/FormatSelectorPopUp.vue'
import RangeBar, { RangeBarData } from '@/components/charts/RangeBar.vue'
// import Mapper from '@/utils/mapper'
// import CAEExampleFormat1 from '@/exemples/CAEExampleFormat1'

@Component({
  name: 'ContradictionAnalysisExpert',
  components: {
    DrawingShopComponent,
    OpenFilePopUp,
    FormatSelectorPopUp,
    RangeBar
  }
})
// @vuese
// @group VIEWS
export default class ContradictionAnalysisExpert extends Vue {
  formatSelectorPopUp: FormatSelectorPopUp | null = null
  chartTextStyle = '#ffffff'
  chartData = [
    new RangeBarData('label 1', 10),
    new RangeBarData('label 2', 25),
    new RangeBarData('Paris', 30),
    new RangeBarData('label 4', 100),
    new RangeBarData('label 5', 50),
    new RangeBarData('label 6', 75)
  ]

  mounted (): void {
    this.formatSelectorPopUp = this.$refs
      .formatSelectorPopUp as FormatSelectorPopUp
    // this.formatSelectorPopUp.open('ORIGINAL_FORMAT')

    // const mapper = new Mapper(CAEExampleFormat1)

    console.log(this.$data.customProperties)
  }

  openFormatSelectorPopUp (): void {
    if (this.formatSelectorPopUp != null) {
      this.formatSelectorPopUp.open('ORIGINAL_FORMAT')
    } else {
      console.log('this.formatSelectorPopUp is null')
    }
  }

  handleFile (data: HTMLInputElement['files'] | null): void {
    if (data == null) {
      console.log('This type of file cannot be read yet.')
    } else {
      console.log('File read')
    }
  }

  selectedFormat (formatId: string): void {
    console.log('Format ID : ', formatId)
  }
}
</script>
