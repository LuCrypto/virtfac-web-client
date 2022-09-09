<template>
  <v-card>
    <!-- Header -->
    <v-toolbar color="primary" flat>
      <v-toolbar-title class="black--text">
        <v-icon left v-text="'mdi-cube'"></v-icon>
        Save Avatar Data
      </v-toolbar-title>
    </v-toolbar>

    <!-- Popup content -->
    <v-card :height="this.isMobileView ? 470 : undefined" max-height="100%">
      <v-container
        fluid
        class="overflow-y-auto"
        style="height: 100%; max-height: 100%"
      >
        <v-layout min-width="iconSize">
          <v-row class="flex-grow-1 pa-4">
            <v-col wrap>
              <v-layout justify-center>
                <v-card
                  elevation="5"
                  :max-width="iconSize"
                  :max-height="iconSize"
                  style="aspect-ratio:100%"
                >
                  <v-img
                    flex-grow-1
                    :src="this.iconUri"
                    width="100%"
                    height="100%"
                    max-width="512"
                    max-height="512"
                  ></v-img
                ></v-card>
              </v-layout>
            </v-col>
            <v-col class="flex-grow-1">
              <v-container min-width="128" class="flex-grow-1">
                <v-text-field
                  label="Name"
                  :placeholder="this.name"
                  v-model="name"
                  :value="this.name"
                ></v-text-field>
                <v-combobox
                  label="Tags"
                  v-model="tags"
                  :items="this.knownTags"
                  multiple
                  chips
                  @change="this.onTagChanged"
                >
                  <template v-slot:selection="data">
                    <v-chip @click="data.parent.selectItem(data.item)">
                      <v-avatar
                        class="primary white--text"
                        left
                        v-text="data.item.slice(0, 1).toUpperCase()"
                      ></v-avatar>
                      {{ data.item }}
                      <v-icon size="10" style="margin-left:10px"
                        >mdi-close</v-icon
                      >
                    </v-chip>
                  </template></v-combobox
                >
              </v-container>
            </v-col></v-row
          >
        </v-layout>
        <v-layout row justify-end wrap class="px-6 pb-6">
          <v-btn class="flex-grow-1 mt-6" @click="this.cancel">Cancel</v-btn>
          <v-btn
            class="flex-grow-1 black--text ml-6 mt-6"
            color="primary"
            @click="this.save"
            >Save</v-btn
          >
        </v-layout>
      </v-container>
    </v-card>
  </v-card>
</template>

<script lang="ts">
import API from '@/utils/api'
import { APIAsset } from '@/utils/models'
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
  computed: {
    iconSize () {
      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
          return 256
        case 'sm':
          return 256
        case 'md':
          return 256
        case 'lg':
          return 512
        case 'xl':
          return 512
      }
    }
  }
})
export default class AvatarInfo extends Vue {
  private name = ''
  private iconUri = ''
  private tags = new Array<string>()
  private knownTags = new Array<string>()
  private knownTagsSet = new Set<string>()
  private id = -1
  private gltfUri: string | null = null

  private isMobileView = false

  cancel (): void {
    this.$emit('cancel')
    this.$emit('close')
  }

  save (): void {
    console.log('TODO : Save Avatar profile')
    this.$emit('close')
  }

  onTagChanged (): void {
    console.log('Todo : Tag manager ?')
  }
}
</script>
