<template>
    <v-dialog v-model="show" max-width="800px">
      <!-- Popup -->
      <v-card>
        <v-toolbar color="primary" flat>
          <v-toolbar-title style="color: black">
            <v-icon left v-text="'mdi-file-document'"></v-icon>
            Open file
          </v-toolbar-title>
          <template v-slot:extension>
            <v-tabs v-model="model" center-active show-arrows dark color="white">
              <v-tab :href="'#tab-my-files'">
                <v-icon left v-text="'mdi-cloud'"></v-icon>
                My files
              </v-tab>
              <v-tab :href="'#tab-shared-files'">
                <v-icon left v-text="'mdi-account-multiple'"></v-icon>
                Shared files
              </v-tab>
            </v-tabs>
          </template>
        </v-toolbar>
        <!-- Pages -->
        <v-tabs-items v-model="model">
          <v-tab-item :value="'tab-my-files'">
            <v-card flat class="ma-6" elevation="0">
              <v-data-table
                v-model="selectedFile"
                :headers="headers"
                :items="myfileList"
                item-key="item"
                class="elevation-0"
                :search="search"
                fixed-header
                show-select
                single-select
                multi-sort
                height="400"
                mobile-breakpoint="960"
                no-data-text="No files are uploaded yet."
              >
                <template v-slot:top>
                  <v-text-field
                    v-model="search"
                    label="Search by name"
                    append-icon="mdi-magnify"
                    dense
                    outlined
                    class="mx-4"
                    hide-details
                  ></v-text-field>
                </template>
                <template v-slot:[`item.format`]="{ item }">
                  <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                        <v-chip v-bind="attrs" v-on="on" :color="item.formatInfo.color" dark>
                          {{ item.formatInfo.acronym }}
                        </v-chip>
                    </template>
                    <span>{{ item.formatInfo.acronymText }}</span>
                  </v-tooltip>
                </template>
                <template v-slot:[`item.actions`]="{ item }">
                  <v-icon class="mr-2" @click="fileSettings(item)" v-text="'mdi-cog'" ></v-icon>
                  <v-icon @click="deleteFile(item)" v-text="'mdi-delete'" ></v-icon>
                </template>
                <template v-slot:[`item.date`]="{ item }">
                  <span>{{ item.getDate() }}</span>
                </template>
                <template v-slot:[`item.name`]="{ item }">
                  <span>{{ item.getName() }}</span>
                  <span class="primary--text">{{ item.getExtention() }}</span>
                </template>
              </v-data-table>
            </v-card>
        </v-tab-item>
        <!-- Shared files -->
        <v-tab-item :value="'tab-shared-files'">
          <v-card flat class="ma-6">
            <v-data-table
              v-model="selectedFile"
              :headers="headers"
              :items="sharedFileList"
              item-key="name"
              class="elevation-0"
              :search="search"
              fixed-header
              multi-sort
              height="300"
              no-data-text="No files have been shared yet."
            >
              <template v-slot:top>
                <v-text-field
                    v-model="search"
                    label="Search by name"
                    append-icon="mdi-magnify"
                    dense
                    outlined
                    class="mx-4"
                    hide-details
                  ></v-text-field>
              </template>
            </v-data-table>
          </v-card>
        </v-tab-item>
      </v-tabs-items>
        <!-- Bottom buttons -->
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="show = false">
            Cancel
          </v-btn>
          <v-btn color="primary" @click="openUploadFile" outlined>
            <v-icon left v-text="'mdi-upload'"></v-icon>
            Upload new
            <input ref="uploadFileInput" hidden type="file" @change="updateUploadFile"/>
          </v-btn>
          <v-btn color="primary" @click="validated()" :disabled="selectedFile.length != 1">
            Open selected
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script  lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { DataTableHeader } from 'vuetify/types'
import { FORMAT_TYPE, FORMAT_INFO, FormatInfo } from '@/utils/format'

class FileItem {
  name: string
  date: Date
  formatInfo: FormatInfo
  constructor (name: string, date: Date) {
    this.name = name
    this.date = date
    const formatKey = Object.keys(FORMAT_TYPE)[Math.floor(Math.random() * 4)]
    const formatType = formatKey as FORMAT_TYPE
    this.formatInfo = FORMAT_INFO[formatType]
  }

  getDate (): string {
    return this.date
      .toLocaleString()
      .replace(',', ' ')
      .split(':')
      .slice(0, -1)
      .join(':')
  }

  getName (): string {
    return this.name
      .split('.')
      .slice(0, -1)
      .join('.')
  }

  getExtention ():string {
    return this.name.replace(this.getName(), '')
  }
}

@Component
export default class OpenFilePopUp extends Vue {
    show = false
    uploadFileInput: HTMLInputElement | null = null
    model = 'tab-my-files'
    search = ''
    calories = ''
    headers: DataTableHeader[] = [
      { text: 'Name', value: 'name', align: 'start' },
      {
        text: 'Last use',
        value: 'date',
        align: 'start',
        sort: (a:Date, b:Date):number => {
          return a.getTime() - b.getTime()
        }
      },
      { text: 'Format', value: 'format', align: 'start' },
      { text: 'Action', value: 'actions', align: 'center', sortable: false }
    ]

    myfileList: FileItem[] = []
    sharedFileList: FileItem[] = []
    selectedItem = 0
    selectedFile: FileItem[] = []

    mounted (): void {
      // Generate random file list
      const randomLetter = () => {
        const t = 'abcdefghijklmnopqrstuvwxyz_0123456789-.'
        return t.charAt(Math.floor(Math.random() * t.length))
      }
      for (var i = 0; i < 20; i++) {
        const name = ('123456789').split('').map(randomLetter).join('') + '.xlsx'
        const date : Date = new Date(new Date().getTime() - 100000000 * Math.random())
        this.myfileList.push(new FileItem(name, date))
      }
    }

    open () : void {
      this.show = true
      this.$nextTick(() => {
        this.uploadFileInput = this.$refs.uploadFileInput as HTMLInputElement
        if (this.uploadFileInput != null) {
          this.uploadFileInput.value = ''
        }
      })
    }

    cancel () : void {
      this.$emit('cancel')
      this.show = false
    }

    validated () : void {
      this.$emit('validated', null) // TODO : get file data
      this.show = false
    }

    openUploadFile () : void {
      if (this.uploadFileInput != null) {
        this.uploadFileInput.click()
      } else {
        console.log(this.$refs.uploadFileInput)
      }
    }

    updateUploadFile (e: Event): void {
      if (e.target == null) return
      const target = e.target as HTMLInputElement
      if (target.files != null && target.files.length > 0) {
        // TODO : Upload file and select format before validation
        this.$emit('validated', target.files[0])
        this.show = false
      }
    }

    fileSettings (item:FileItem): void {
      // TODO
      console.log('file settings : ', item)
    }

    deleteFile (item:FileItem) : void {
      // TODO
      console.log('delete file : ', item)
    }
}
</script>
