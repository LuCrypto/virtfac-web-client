<template>
  <v-dialog v-model="show">
    <!-- Popup -->
    <v-card>
      <!-- Header -->
      <v-toolbar color="primary" flat>
        <v-toolbar-title class="black--text">
          <v-icon left v-text="'mdi-file-document'"></v-icon>
          Open files
        </v-toolbar-title>
      </v-toolbar>

      <!-- Popup content -->
      <v-card :height="this.isMobileView ? 500 : undefined">
        <v-container
          fluid
          style="height: 100%; max-height: 100%"
          class="overflow-y-auto"
        >
          <!-- Header -->
          <v-layout wrap row style="gap: 24px;" class="pa-6">
            <v-layout justify-center>
              <!-- Group settings button -->
              <v-btn
                class="primary black--text mr-6"
                fab
                small
                @click="showMenu = !showMenu"
              >
                <v-icon v-text="'mdi-folder-account'"></v-icon>
              </v-btn>

              <!-- Group selector-->
              <v-select
                :items="myGroupList"
                v-model="selectedGroupId"
                style="min-width: 0;"
                label="Group"
                outlined
                primary
                dense
                hide-details
                item-text="name"
                item-value="idGroup"
                @change="refreshTableKey++"
              ></v-select>
            </v-layout>

            <!-- Search bar -->
            <v-flex grow>
              <v-text-field
                v-model="search"
                ref="searchInput"
                label="Search"
                append-icon="mdi-magnify"
                dense
                hide-details
                outlined
              ></v-text-field>
            </v-flex>
          </v-layout>

          <!-- Tag list -->
          <v-layout row>
            <v-flex class="px-6">
              <v-select
                v-model="tagValues"
                :items="tagList"
                @change="refreshTableKey++"
                label="Tags"
                multiple
                outlined
                dense
                hide-details
              ></v-select>
            </v-flex>
          </v-layout>

          <!-- Button to show column filter -->
          <v-layout row v-if="this.isMobileView">
            <v-btn class="ma-6 flex-grow-1" @click="headerSetup">
              <v-icon left v-text="'mdi-filter-variant'"></v-icon>Set
              columns</v-btn
            >
          </v-layout>

          <!-- Table -->
          <v-layout row grow class="mt-3">
            <v-data-table
              class="elevation-0 flex-grow-1"
              v-model="selectedFile"
              :headers="activeHeaders"
              :items="myfileList"
              :key="refreshTableKey"
              item-key="id"
              :height="this.isMobileView ? undefined : 550"
              :fixed-header="!this.isMobileView"
              :search="'true'"
              :show-select="true"
              :single-select="singleSelect"
              :mobile-breakpoint="this.isMobileView ? 99999 : 0"
              no-data-text="No files are uploaded yet."
              @click:row="toggleSelectedFile"
              :custom-filter="customFilter"
            >
              <!-- Custom header button for "actions" column -->
              <template v-slot:[`header.actions`]>
                <v-icon
                  v-text="'mdi-filter-variant'"
                  @click="headerSetup()"
                ></v-icon>
              </template>

              <!-- Item for "name" column -->
              <template v-slot:[`item.name`]="{ item }">
                <span>{{ item.getName() }}</span>
                <span class="primary--text">{{ item.getExtention() }}</span>
              </template>

              <!-- Item for "modificationDate" column -->
              <template v-slot:[`item.modificationDate`]="{ item }">
                <span>{{ item.getModificationDate() }}</span>
              </template>

              <!-- Item for "creationDate" column -->
              <template v-slot:[`item.creationDate`]="{ item }">
                <span>{{ item.getCreationDate() }}</span>
              </template>

              <!-- Custom item for "formatInfo" column -->
              <template v-slot:[`item.formatInfo`]="{ item }">
                <v-tooltip top>
                  <template v-slot:activator="{ on, attrs }">
                    <v-chip
                      v-bind="attrs"
                      v-on="on"
                      :color="item.formatInfo.color"
                      dark
                    >
                      {{ item.formatInfo.acronym }}
                    </v-chip>
                  </template>
                  <span>{{ item.formatInfo.acronymText }}</span>
                </v-tooltip>
              </template>

              <!-- Custom item for "actions" columns -->
              <template v-slot:[`item.actions`]="{ item }">
                <v-icon
                  @click="fileSettings(item)"
                  v-text="'mdi-dots-horizontal'"
                ></v-icon>
              </template>
            </v-data-table>

            <!-- Small pop up for rows filter -->
            <v-dialog v-model="rowFilterPopUp" max-width="300px">
              <v-card>
                <v-card-title class="text-h5">Choose columns</v-card-title>
                <v-list flat subheader>
                  <v-list-item-group multiple active-class="">
                    <v-list-item
                      @click="selector.active = !selector.active"
                      v-for="(selector, index) in editableHeadersSelector"
                      :key="index"
                    >
                      <template>
                        <v-list-item-action>
                          <v-checkbox
                            :input-value="selector.active"
                          ></v-checkbox>
                        </v-list-item-action>
                        <v-list-item-content>
                          <v-list-item-title>{{
                            selector.header.text
                          }}</v-list-item-title>
                        </v-list-item-content>
                      </template>
                    </v-list-item>
                  </v-list-item-group>
                </v-list>
              </v-card>
            </v-dialog>
          </v-layout>

          <!-- Bottom buttons -->
          <v-layout row justify-end wrap class="px-6 pb-6">
            <v-btn class="ml-6 mt-6 flex-grow-1" text @click="show = false">
              Cancel
            </v-btn>
            <v-btn
              class="ml-6 mt-6 flex-grow-1 black--text"
              color="primary"
              @click="openUploadFile"
            >
              <v-icon left v-text="'mdi-upload'"></v-icon>
              Upload new
              <input
                ref="uploadFileInput"
                hidden
                type="file"
                @change="updateUploadFile"
              />
            </v-btn>
            <v-btn
              class="ml-6 mt-6 flex-grow-1 black--text"
              color="primary"
              @click="validated()"
              :disabled="selectedFile.length != 1"
            >
              Open selected
            </v-btn>
          </v-layout>
        </v-container>
      </v-card>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { DataTableHeader } from 'vuetify/types'
import API from '@/utils/api'
import { APIFileItem, APIGroupItem } from '@/utils/models'
import { FormatInfo } from '@/utils/format'

class DataTableHeaderSelector {
  active = true
  editable = true
  header: DataTableHeader = { text: '', value: '' }
  constructor (attributes?: Partial<DataTableHeaderSelector>) {
    Object.assign(this, attributes)
  }
}

@Component
export default class OpenFilePopUp extends Vue {
  @Prop({ default: () => 'all' }) private application!: string
  @Prop({ default: () => true }) private singleSelect!: boolean

  tagList: string[] = []
  rowFilterPopUp = false
  rowFilter = []

  tagValues = []
  showMenu = false
  show = true
  waiting = false
  uploadFileInput: HTMLInputElement | null = null
  model = 'tab-my-files'
  search = ''
  calories = ''

  headersSelector: DataTableHeaderSelector[] = [
    new DataTableHeaderSelector({
      header: {
        text: 'Name',
        value: 'name',
        align: 'start',
        sort: (a: string, b: string): number => {
          return a < b ? -1 : a > b ? 1 : 0
        }
      }
    }),
    new DataTableHeaderSelector({
      header: {
        text: 'Last use',
        value: 'modificationDate',
        align: 'start',
        sort: (a: number, b: number): number => {
          return a - b
        }
      }
    }),
    new DataTableHeaderSelector({
      header: {
        text: 'Creation',
        value: 'creationDate',
        align: 'start',
        sort: (a: number, b: number): number => {
          return a - b
        }
      }
    }),
    new DataTableHeaderSelector({
      header: {
        text: 'Format',
        value: 'formatInfo',
        align: 'start',
        sort: (a: FormatInfo, b: FormatInfo): number => {
          return a.acronym < b.acronym ? -1 : a > b ? 1 : 0
        }
      }
    }),
    new DataTableHeaderSelector({
      editable: false,
      header: { text: '', value: 'actions', align: 'end', sortable: false }
    })
  ]

  get activeHeaders (): DataTableHeader[] {
    return this.headersSelector
      .filter(selector => selector.active)
      .map(selector => selector.header)
  }

  get editableHeadersSelector (): DataTableHeaderSelector[] {
    return this.headersSelector.filter(selector => selector.editable)
  }

  myfileList: APIFileItem[] = []
  sharedFileList: APIFileItem[] = []
  selectedItem = 0
  selectedFile: APIFileItem[] = []
  refreshTableKey = 0

  /** Group bar */
  myGroupList: APIGroupItem[] = this.initialGroupList()
  selectedGroupId = 0

  mounted (): void {
    this.myfileList = []
    this.waiting = true
    this.getAllGroups()
    this.getAllFiles()
  }

  initialGroupList (): APIGroupItem[] {
    return [new APIGroupItem({ id: 0, name: 'All' })]
  }

  getAllGroups (): void {
    API.get(this, '/get-all-groups', null).then((groupList: any) => {
      this.myGroupList = this.initialGroupList()
      groupList.forEach((groupInfo: Partial<APIGroupItem>) => {
        this.myGroupList.push(new APIGroupItem(groupInfo))
      })
    })
  }

  getAllFiles (): void {
    API.get(
      this,
      '/files-by-application',
      new URLSearchParams({
        application: this.application
      })
    ).then((fileList: any) => {
      fileList.forEach((fileInfo: Partial<APIFileItem>) => {
        if (fileInfo.name && fileInfo.creationDate) {
          this.myfileList.push(new APIFileItem(fileInfo))
        }
      })
      this.getAllTags()
    })
  }

  getAllTags (): void {
    this.tagList = []
    this.myfileList.forEach(fileItem => {
      fileItem.tags.split(',').forEach(tag => {
        if (!this.tagList.includes(tag)) {
          this.tagList.push(tag)
        }
      })
    })
  }

  open (): void {
    this.show = true
    this.$nextTick(() => {
      this.uploadFileInput = this.$refs.uploadFileInput as HTMLInputElement
      if (this.uploadFileInput != null) {
        this.uploadFileInput.value = ''
      }
    })
  }

  /*
    "value" is not used, because value take each column value without column information.
    Instead, I use "item" with all data included in current row.
    "search" is also not used, because his value are always set to 'true' (because with
    empty value, the custom filter is not called).
    Instead, we use this.seach who is binded value of search bar.
    To refresh customFilter with tag list, we update :key binded on this.refreshTableKey
    on table component when tag list changes.
   */

  customFilter (value: any, search: string | null, item: APIFileItem): boolean {
    const itemTags = item.getTags()
    const groupFilter =
      this.selectedGroupId === 0 || item.idGroup === this.selectedGroupId
    const searchFilter =
      this.search == null ||
      item.name.toLocaleUpperCase().indexOf(this.search.toLocaleUpperCase()) !==
        -1
    const tagFilter = !this.tagValues.some(tag => !itemTags.includes(tag))
    return groupFilter && searchFilter && tagFilter
  }

  cancel (): void {
    this.$emit('cancel')
    this.show = false
  }

  validated (): void {
    this.$emit('validated', null) // TODO : get file data
    this.show = false
  }

  openUploadFile (): void {
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

  // Toggle row selection on click
  toggleSelectedFile (item: any, row: any): void {
    row.select(!row.isSelected)
  }

  fileSettings (item: APIFileItem): void {
    // TODO
    console.log('file settings : ', item)
  }

  deleteFile (item: APIFileItem): void {
    // TODO
    console.log('delete file : ', item)
  }

  headerSetup (): void {
    // TODO
    this.rowFilterPopUp = true
  }

  updateTagList (tagName: string): void {
    this.tagList = this.tagList.filter(tag => tag !== tagName)
  }

  get isMobileView () {
    return this.$vuetify.breakpoint.smAndDown
  }
}
</script>
