<template>
  <v-card>
    <!-- Header -->
    <v-toolbar color="primary" flat>
      <v-toolbar-title class="black--text">
        <v-icon left v-text="'mdi-cube'"></v-icon>
        Asset Data
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
                    :src="
                      this.imageMode === 'icon'
                        ? this.iconUri
                        : this.layoutSprite
                    "
                    width="100%"
                    height="100%"
                    max-width="512"
                    max-height="512"
                    @click="
                      imageMode === 'icon'
                        ? (imageMode = 'sprite')
                        : (imageMode = 'icon')
                    "
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
import { APIAsset, APIBoundingBox } from '@/utils/models'
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
  name: 'AssetInfo',
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
// @vuese
// @group COMPONENTS
// Display all information of an asset
export default class AssetInfo extends Vue {
  private name = ''
  private iconUri = ''
  private tags = new Array<string>()
  private knownTags = new Array<string>()
  private knownTagsSet = new Set<string>()
  private id = -1
  private gltfUri: string | null = null
  private layoutSprite = ''
  private boundingBox: APIBoundingBox = new APIBoundingBox(
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 0, z: 0 }
  )

  private imageMode: 'icon' | 'sprite' = 'icon'

  private isMobileView = false

  public getData () {
    return new APIAsset({
      name: this.name,
      picture: this.iconUri,
      layoutSprite: this.layoutSprite,
      uri: this.gltfUri ? this.gltfUri : '',
      boundingBox: JSON.stringify(this.boundingBox),
      id: this.id,
      tags: JSON.stringify(this.tags)
    })
  }

  mounted (): void {
    console.log('mounted')
    API.post(
      this,
      '/resources/assets',
      JSON.stringify({ select: ['tags'] })
    ).then(
      response => {
        const r = (response as unknown) as [{ tags: string }]
        r.forEach(item => {
          item.tags
            .slice(1, -1)
            .split(',')
            .forEach(e => {
              const t = e.replaceAll('"', '')
              if (t.length > 0) {
                if (!this.knownTagsSet.has(t)) {
                  this.knownTagsSet.add(t)
                  this.knownTags.push(t)
                }
              }
            })
        })
      },
      reject => {
        console.error(reject)
      }
    )
  }

  // @vuese
  // Request asset data to the API and refresh display when loaded
  // @arg id: ID of the asset to load
  public loadData (id: number): void {
    if (id === -1) {
    } else {
      this.gltfUri = null
      API.post(
        this,
        '/resources/assets',
        JSON.stringify({
          select: ['tags', 'name', 'picture'],
          where: { id: id }
        })
      ).then(
        response => {
          this.tags = new Array<string>()
          const r = (response as unknown) as [
            {
              tags: string
              name: string
              picture: string
              boundingBox: string
              layoutSprite: string
            }
          ]
          r[0].tags
            .slice(1, -1)
            .split(',')
            .forEach(e => {
              const t = e.replaceAll('"', '')
              if (t.length > 0) {
                this.tags.push(t)
              }
            })
          this.name = r[0].name
          this.iconUri = r[0].picture
          this.id = id
          try {
            this.boundingBox = JSON.parse(r[0].boundingBox)
          } catch {
            console.warn('invalid boundingbox')
          }
          this.layoutSprite = r[0].layoutSprite
          this.onTagChanged()
        },
        reject => {
          console.error(reject)
        }
      )
    }
  }

  // @vuese
  // Set asset data locally
  public setAssetData (
    name: string,
    iconUri: string,
    gltfUri: string | null,
    id: number,
    layoutSprite: string,
    boundingBox: APIBoundingBox
  ): void {
    this.name = name
    this.iconUri = iconUri
    this.id = id
    this.gltfUri = gltfUri
    this.layoutSprite = layoutSprite
    this.boundingBox = boundingBox

    this.tags = new Array<string>()
    if (id !== -1) {
      API.post(
        this,
        '/resources/assets',
        JSON.stringify({ select: ['tags'], where: { id: id } })
      ).then(
        response => {
          const r = (response as unknown) as [{ tags: string }]
          r[0].tags
            .slice(1, -1)
            .split(',')
            .forEach(e => {
              const t = e.replaceAll('"', '')
              if (t.length > 0) {
                this.tags.push(t)
              }
            })
          this.onTagChanged()
        },
        reject => {
          console.error(reject)
        }
      )
    }
  }

  public onTagChanged (): void {
    this.tags.forEach(tag => {
      // const index = this.knownTags.indexOf(tag, 0)
      if (!this.knownTagsSet.has(tag)) {
        this.knownTagsSet.add(tag)
        this.knownTags.push(tag)
      }
    })
  }

  // @vuese
  // remove a tag from the list of affected tags
  public removeTag (tag: string): void {
    this.tags.splice(this.tags.indexOf(tag as never, 0), 1)
  }

  // @vuese
  // cancel local modification of the asset
  cancel (): void {
    this.$emit('cancel')
    this.$emit('close')
  }

  // @vuese
  // save local modification of the asset to the API
  save (): void {
    if (this.id !== -1) {
      let apiFile: unknown = {}
      if (this.gltfUri !== null) {
        apiFile = new APIAsset({
          name: this.name,
          uri: this.gltfUri,
          picture: this.iconUri,
          tags: JSON.stringify(this.tags),
          layoutSprite: this.layoutSprite,
          boundingBox: JSON.stringify(this.boundingBox)
        })
      } else {
        apiFile = {
          name: this.name,
          picture: this.iconUri,
          tags: JSON.stringify(this.tags),
          layoutSprite: this.layoutSprite,
          boundingBox: JSON.stringify(this.boundingBox)
        }
      }
      console.log(apiFile)
      API.patch(this, '/resources/assets/' + this.id, JSON.stringify(apiFile))
        .then(res => {
          console.log(res)
        })
        .catch(err => {
          console.log(err)
        })
    } else {
      console.error('Null asset.')
    }
    this.$emit('close')
  }
}
</script>
