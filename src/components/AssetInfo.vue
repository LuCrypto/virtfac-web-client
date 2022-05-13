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
        <v-layout min-width="128">
          <v-row class="flex-grow-1 pa-4">
            <v-col wrap>
              <v-layout justify-center>
                <v-card
                  elevation="5"
                  max-width="512"
                  max-height="512"
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
              <v-card min-width="128" class="flex-grow-1" elevation="5">
                <v-toolbar color="primary" flat>
                  <v-toolbar-title class="black--text">
                    Data
                  </v-toolbar-title>
                </v-toolbar>
                <v-container>
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
              </v-card>
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
import { Prop } from 'vue-property-decorator'
import { set } from 'vue/types/umd'

@Component({})
export default class AssetInfo extends Vue {
  private name = ''
  private iconUri = ''
  private tags = new Array<string>()
  private knownTags = new Array<string>()
  private knownTagsSet = new Set<string>()
  private id = -1
  private gltfUri: string | null = null

  private isMobileView = false

  mounted (): void {
    console.log('mounted')
    API.post(
      this,
      '/resources/assets',
      JSON.stringify({ select: ['tags'] })
    ).then(
      response => {
        const r = (response as unknown) as [{ tags: string }]
        const tagSet = new Set<string>()
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

  public loadData (id: number) {
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
            { tags: string; name: string; picture: string }
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
          this.onTagChanged()
        },
        reject => {
          console.error(reject)
        }
      )
    }
  }

  public setAssetData (
    name: string,
    iconUri: string,
    gltfUri: string | null,
    id: number
  ): void {
    this.name = name
    this.iconUri = iconUri
    this.id = id
    this.gltfUri = gltfUri

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

  public onTagChanged () {
    this.tags.forEach(tag => {
      // const index = this.knownTags.indexOf(tag, 0)
      if (!this.knownTagsSet.has(tag)) {
        this.knownTagsSet.add(tag)
        this.knownTags.push(tag)
      }
    })
  }

  public removeTag (tag: string) {
    this.tags.splice(this.tags.indexOf(tag as never, 0), 1)
    console.log(tag)
  }

  cancel (): void {
    this.$emit('cancel')
    this.$emit('close')
  }

  save (): void {
    if (this.id !== -1) {
      let apiFile: unknown = {}
      if (this.gltfUri !== null) {
        apiFile = new APIAsset({
          name: this.name,
          uri: this.gltfUri,
          picture: this.iconUri,
          tags: JSON.stringify(this.tags)
        })
      } else {
        apiFile = {
          name: this.name,
          picture: this.iconUri,
          tags: JSON.stringify(this.tags)
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
