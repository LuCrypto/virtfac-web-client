<template>
    <v-dialog v-model="show" max-width="600px">
      <!-- Popup -->
      <v-card>
        <v-toolbar color="primary" flat>
          <v-toolbar-title style="color: black">
            <v-icon left v-text="'mdi-file-document'"></v-icon>
            Select format of your data
          </v-toolbar-title>
        </v-toolbar>
        <!-- Pages -->
        <div class="pa-6">
          <v-select
            class="pt-3 pb-6"
            v-model="selectedFormat"
            :items="availableFormatList"
            label="Select format"
            item-text="text"
            :hint="selectedFormat.hint"
            persistent-hint
            return-object
          >
          <template slot='item' slot-scope='{ item }'>
            <div :class="{'null-list-item': item.id==='NULL'}">{{ item.text }}</div>
          </template>
          <template slot='selection' slot-scope='{ item }'>
            <div :class="{'null-list-item': item.id==='NULL'}">{{ item.text }}</div>
          </template>
          </v-select>
          <div>The following figure shows a schematic view of the selected data format :</div>
          <format-preview
            :shapes="selectedFormat.shapes"
            :colors="selectedFormat.colors"
          ></format-preview>
        </div>

        <!-- Bottom buttons -->
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="cancel()">
            Cancel
          </v-btn>
          <v-btn color="primary" @click="validated()">
            Use this format
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script  lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import FormatPreview from '@/components/FormatPreview.vue'
import { FORMAT_TYPE, FORMAT_INFO, FormatInfo } from '@/utils/format'

@Component({
  components: {
    FormatPreview
  }
})
export default class FormatSelectorPopUp extends Vue {
    show = false
    availableFormatList : FormatInfo[] = Object.keys(FORMAT_INFO).map(key => FORMAT_INFO[key as FORMAT_TYPE])
    selectedFormat: FormatInfo = this.availableFormatList[0]

    mounted (): void {
      console.log('Data Format Selector Popup is open.')
    }

    open (id:string) : void {
      this.selectedFormat = this.availableFormatList
        .filter(format => format.id === id).pop() || this.availableFormatList[0]
      this.show = true
    }

    cancel ():void {
      this.$emit('cancel')
      this.show = false
    }

    validated (): void {
      this.$emit('validated', this.selectedFormat.id)
      this.show = false
    }
}
</script>
