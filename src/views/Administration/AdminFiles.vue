<template>
  <v-container
    fluid
    class="d-flex flex-column ma-0 pa-0"
    style="background-color: rgba(128, 128, 128)"
  >
    <!-- <input
      ref="fileUpload"
      type="file"
      hidden
      @change="onFileUploaded"
      multiple
    />
    <v-card class="flex-grow-1" flat>
      <v-data-table
        :headers="headers"
        :items="files"
        style="min-height:420px; max-height:70%; overflow-y:scroll"
        dense
      >
        <template v-slot:item.name="{ item }">
          <td
            class="primary--text"
            style="max-width:300px; overflow-x:hidden;  white-space:nowrap"
          >
            {{ item.name }}
          </td>
        </template>
        <template v-slot:item.mime="item">
          <div style="overflow-x:hidden; white-space: nowrap;">
            <v-chip
              v-for="app in applicationsOfMime(item.value)"
              v-bind:key="app.name"
              :color="app.color"
              class="black--text ma-1"
              small
              >{{ $vuetify.lang.t('$vuetify.application.' + app.name) }}</v-chip
            >
          </div>
        </template>
        <template v-slot:item.modificationDate="item">
          <v-chip small>
            {{ new Date(item.value).toLocaleDateString() }}
          </v-chip>
        </template>
      </v-data-table>
      <v-card>
        <v-btn @click="upload">
          Upload
        </v-btn>
      </v-card>
    </v-card> -->
    <open-file> </open-file>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import API from '@/utils/api'
import { APIFile, APIGroup } from '@/utils/models'
import OpenFile from '@/components/OpenFile.vue'
import { read } from 'fs'

class User {
  id = 0
  name = ''
  constructor (values: Partial<User>) {
    Object.assign(this, values)
  }
}

@Component({
  name: 'AdminFiles',
  components: {
    OpenFile
  }
})
// @vuese
// @group VIEWS
export default class AdminFiles extends Vue {
  private files = new Array<{
    id: number
    name: string
    mime: string
    modificationDate: number
  }>()

  private applications = new Map<string, string>([
    ['ERGONOM_IO_ANALYSIS', '#3371ff'],
    ['CONTRADICTION_ANALYSIS', '#2ECC71'],
    ['ROUTING_ANALYSIS', '#2ECC71'],
    ['ERGONOM_IO', 'primary'],
    ['DYNAMICS_INPUT', '#3498DB'],
    ['DYNAMICS_OUTPUT', '#3498DB'],
    ['BLUEPRINT_EDITOR', 'primary']
  ])

  private applicationMimes = new Map<string, string[]>([
    ['application/bvh', ['ERGONOM_IO_ANALYSIS']],
    ['application/bvh.noitom', ['ERGONOM_IO_ANALYSIS']],
    ['application/bvh.mixamo', ['ERGONOM_IO_ANALYSIS']],
    ['application/bvh.biovision', ['ERGONOM_IO_ANALYSIS']],
    ['application/octet-stream', ['ERGONOM_IO_ANALYSIS']],
    ['image/raw', ['ERGONOM_IO_ANALYSIS']],
    ['image/raw.noitom', ['ERGONOM_IO_ANALYSIS']],
    ['application/fbx', ['ERGONOM_IO_ANALYSIS']],
    ['application/fbx.noitom', ['ERGONOM_IO_ANALYSIS']],
    ['application/fbx.mixamo', ['ERGONOM_IO_ANALYSIS']],
    [
      'application/json;application=virtfac/constraint',
      ['CONTRADICTION_ANALYSIS']
    ],
    ['application/json;application=virtfac/routing', ['ROUTING_ANALYSIS']],
    ['model/gltf+json', ['ERGONOM_IO']],
    ['model/gltf-binary', ['ERGONOM_IO']],
    ['application/xlsx', ['DYNAMICS_INPUT', 'DYNAMICS_OUTPUT']],
    [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ['DYNAMICS_INPUT', 'DYNAMICS_OUTPUT']
    ],
    [
      'application/json;application=virtfac/blueprint/building',
      ['BLUEPRINT_EDITOR']
    ],
    [
      'application/json;application=virtfac/blueprint/routing',
      ['BLUEPRINT_EDITOR']
    ]
  ])

  private applicationsOfMime (mime: string) {
    const apps = this.applicationMimes.get(mime)
    if (apps === undefined) {
      return []
    } else {
      const res = new Array<{ name: string; color: string }>()
      apps.forEach(app => {
        let color = this.applications.get(app)
        if (color === undefined) {
          color = '#F0F0F0'
        }
        res.push({
          name: app.replaceAll('_', '').toLocaleLowerCase(),
          color: color
        })
      })
      return res
    }
  }

  private headers = [
    {
      text: '$vuetify.adminFiles.name$Name',
      align: 'start',
      sortable: true,
      value: 'name'
    },
    {
      text: '$vuetify.adminFiles.mime$Mime',
      align: 'start',
      sortable: true,
      value: 'mime'
    },
    {
      text: '$vuetify.adminFiles.modificationDate$Last Modification',
      align: 'end',
      sortable: true,
      value: 'modificationDate'
    }
  ]

  //
  mounted () {
    API.post(
      this,
      '/resources/files',
      JSON.stringify({ select: ['id', 'name', 'mime', 'modificationDate'] })
    ).then(res => {
      ((res as unknown) as {
        id: number
        name: string
        mime: string
        modificationDate: number
      }[]).forEach(file => {
        this.files.push(file)
      })
    })
  }

  private upload () {
    (this.$refs.fileUpload as HTMLInputElement).click()
  }
  /*
  onFileUploaded (e: InputEvent) {
    const files = (e.target as HTMLInputElement).files as FileList | null
    if (files !== null) {
      for (let i = 0; i < files.length; i++) {
        console.log(files[i].name, files[i].type)

        const reader = new FileReader()
        reader.onload = () => {
          const apiFile = new APIFile({
            name: files[i].name,
            mime: files[i].type,
            uri: reader.result
          })
          API.put(
            this,
            '/resources/files',
            JSON.stringify(apiFile.toJSON())
          ).then(res => {
            API.post(
              this,
              '/resources/files',
              JSON.stringify({
                select: ['id', 'name', 'mime', 'modificationDate'],
                where: [{ id: ((res as unknown) as number[])[0] }]
              })
            ).then(res => {
              ((res as unknown) as {
                id: number
                name: string
                mime: string
                modificationDate: number
              }[]).forEach(file => {
                this.files.push(file)
              })
            })
          })
        }
      }
    }
  }
  */
}
</script>
