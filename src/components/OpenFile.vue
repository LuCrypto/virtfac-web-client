<template>
  <v-card flat>
    <PopUp ref="confirmAction">
      <v-card style="overflow-y:hidden;">
        <v-toolbar color="primary" flat>
          <v-toolbar-title class="black--text">
            <v-icon left v-text="'mdi-check'"></v-icon>
            {{ confirmActionMessage }}
          </v-toolbar-title>
        </v-toolbar>

        <v-layout row style="max-width:100%; max-height:100%" class="px-6 pb-6">
          <v-btn
            class="ml-6 mt-6 flex-grow-1"
            text
            @click="$refs.confirmAction.close()"
          >
            Cancel
          </v-btn>
          <v-btn
            class="ml-6 mt-6 flex-grow-1 black--text"
            color="primary"
            @click="confirmAction()"
          >
            Confirm
          </v-btn>
        </v-layout>
      </v-card>
    </PopUp>
    <!-- Header -->
    <v-toolbar color="primary" flat v-if="this.header">
      <v-toolbar-title class="black--text">
        <v-icon left v-text="'mdi-file-document'"></v-icon>
        {{ openFile ? title : 'Files manager' }}
      </v-toolbar-title>
    </v-toolbar>

    <!-- Popup content -->
    <v-card :height="this.isMobileView && this.header ? 470 : undefined" flat>
      <v-container
        fluid
        style="height: 100%; max-height: 100%"
        class="overflow-y-auto"
      >
        <!-- Header -->
        <v-layout wrap row style="gap: 24px" class="pa-6">
          <v-layout justify-center>
            <!-- Group settings button -->
            <v-btn
              class="primary black--text mr-6"
              fab
              small
              @click="groupSettingsPopUp = !groupSettingsPopUp"
            >
              <v-icon v-text="'mdi-folder-account'"></v-icon>
            </v-btn>

            <!-- Group selector-->
            <v-select
              :items="groupList"
              v-model="selectedGroupId"
              style="min-width: 0"
              label="Group"
              outlined
              primary
              dense
              hide-details
              item-text="name"
              item-value="id"
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
          <v-btn class="ma-6 flex-grow-1" @click="rowFilterPopUp = true">
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
            :height="this.isMobileView ? undefined : 530"
            :fixed-header="!this.isMobileView"
            :search="'true'"
            :show-select="true"
            :single-select="this.singleSelect"
            :mobile-breakpoint="this.isMobileView ? 99999 : 0"
            no-data-text="No files are uploaded yet."
            @click:row="toggleSelectedFile"
            :custom-filter="customFilter"
            :loading="waitingTasks > 0"
            loading-text="Loading... Please wait"
          >
            <!-- Custom header button for "actions" column -->
            <template v-slot:[`header.actions`]>
              <v-icon
                v-text="'mdi-filter-variant'"
                @click="rowFilterPopUp = true"
              ></v-icon>
            </template>

            <!-- Item for "name" column -->
            <template v-slot:[`item.name`]="{ item }">
              <span class="primary--text">{{ item.getName() }}</span>
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
            <template v-slot:[`item.mime`]="{ item }">
              <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                  <v-chip
                    v-bind="attrs"
                    v-on="on"
                    :color="item.fileMIME.structure ? 'primary' : 'grey'"
                    dark
                  >
                    {{ item.fileMIME.formatStructure }}
                  </v-chip>
                </template>
                <span>{{ item.mime }}</span>
              </v-tooltip>
            </template>

            <!-- Custom item for "actions" columns -->
            <template v-slot:[`item.actions`]="{ item }">
              <v-btn class="ml-2" fab x-small color="primary" elevation="3">
                <v-icon
                  @click="deleteFile(item)"
                  v-text="'mdi-delete-forever'"
                ></v-icon>
              </v-btn>
              <v-btn
                class="ml-2"
                elevation="3"
                fab
                x-small
                color="primary"
                :disabled="mimeToExtension.get(item.mime) === 'disable'"
              >
                <v-icon
                  @click="downloadFileData(item)"
                  v-text="'mdi-download'"
                ></v-icon>
              </v-btn>
              <v-btn class="ml-2" fab x-small color="primary" elevation="3">
                <v-icon
                  @click="openFileSettings(item)"
                  v-text="'mdi-dots-horizontal'"
                ></v-icon>
              </v-btn>
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
                        <v-checkbox :input-value="selector.active"></v-checkbox>
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

          <!-- Small pop up for file settings filter -->
          <v-dialog v-model="fileSettingsPopUp" max-width="300px">
            <v-card>
              <v-card-title class="text-h5 black--text primary"
                >File settings</v-card-title
              >
              <v-container fluid class="overflow-y-auto">
                <v-layout wrap column class="px-3 pb-3">
                  <v-flex class="my-3">
                    <h4 class="primary--text">Filename</h4>
                    <v-text-field
                      dense
                      hide-details
                      outlined
                      v-model="fileSettings.name"
                    ></v-text-field>
                  </v-flex>
                  <v-flex>
                    <h4 class="primary--text">Creation date</h4>
                    {{ fileSettings.getCreationDate() }}
                  </v-flex>
                  <v-flex>
                    <h4 class="primary--text">Modification date</h4>
                    {{ fileSettings.getModificationDate() }}
                  </v-flex>
                  <v-flex>
                    <h4 class="primary--text">Tags</h4>
                    {{ fileSettings.tags }}
                  </v-flex>
                  <v-flex>
                    <h4 class="primary--text">Format</h4>
                    {{ fileSettings.mime }}
                  </v-flex>
                  <v-flex class="my-3">
                    <h4 class="primary--text">Structure</h4>
                    <v-select
                      v-model="fileSettings.fileMIME"
                      :items="formatList"
                      item-text="formatStructure"
                      return-object
                      outlined
                      dense
                      hide-details
                    ></v-select>
                  </v-flex>
                </v-layout>
              </v-container>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="fileSettingsPopUp = false"> Cancel </v-btn>
                <v-btn
                  color="primary"
                  class="black--text"
                  @click="saveFileSettings"
                  :disabled="fileSettingsIsSaving"
                >
                  <v-progress-circular
                    v-if="fileSettingsIsSaving"
                    :size="20"
                    :width="3"
                    class="mr-2"
                    indeterminate
                    color="primary"
                  ></v-progress-circular>
                  Save changes
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-layout>

        <!-- Bottom buttons -->
        <v-layout row justify-end wrap class="px-6 pb-6">
          <v-btn class="ml-6 mt-6 flex-grow-1" text @click="cancel()">
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
            :disabled="selectedFile.length == 0 || loadFileTasksNumber > 0"
            v-if="openFile"
          >
            <v-progress-circular
              v-if="loadFileTasks > 0"
              :size="20"
              :width="3"
              class="mr-2"
              :value="(1.0 - loadFileTasks / loadFileTasksNumber) * 100"
              :indeterminate="loadFileTasksNumber === loadFileTasks"
              color="primary"
            ></v-progress-circular>
            Open selected
          </v-btn>
        </v-layout>
      </v-container>
    </v-card>
  </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { DataTableHeader } from 'vuetify/types'
import API from '@/utils/api'
import { APIFileItem, APIGroupItem, APIFile, APIFileMIME } from '@/utils/models'
import { resolve } from 'path'
import PopUp from './PopUp.vue'

class DataTableHeaderSelector {
  active = true
  editable = true
  header: DataTableHeader = { text: '', value: '' }
  constructor (attributes?: Partial<DataTableHeaderSelector>) {
    Object.assign(this, attributes)
  }
}

export type FileProcessing = {
  (file: File): Promise<File>
} | null

@Component({
  name: 'OpenFilePopUp',
  components: {
    PopUp
  }
})
// @vuese
// @group COMPONENTS
// Component to open a file from the API data.
// A user can upload a file, or open one.
// It is possible to filter the files according
// to the application to select only compatible files.
export default class OpenFilePopUp extends Vue {
  // @vuese
  // Application reference to select only compatible files
  @Prop({ default: () => 'all' }) private application!: string
  // @vuese
  // Filter to show only compatible files extensions when upload file browser is open
  @Prop({ default: () => '' }) private accept!: string
  // @vuese
  // Middleware callback executed before file uploading on API
  @Prop({ default: () => null }) private fileProcessing!: FileProcessing
  // @vuese
  // Defines if multiple files can be selected or not
  @Prop({ default: () => true }) private singleSelect!: boolean
  // @vuese
  // Defines whether a file can be opened
  @Prop({ default: () => false }) private openFile!: boolean
  // @vuese
  // Display or not the "File Manager" header.
  @Prop({ default: () => true }) private header!: boolean

  @Prop({ default: () => 'Open File' }) private title!: string
  waitingTasks = 3

  /* Group bar */
  groupSettingsPopUp = false
  groupList: APIGroupItem[] = []
  selectedGroupId = 0

  /* Search bar */
  search = ''

  /* Tag list input */
  tagList: string[] = []
  tagValues = []

  /* Table row filter */
  rowFilterPopUp = false
  rowFilter = []

  /*
  downloadableMime = new Map<string,{(fileid:number):void}>(
    [
      ['g',(id) => {

      }]
    ])
*/
  mimeToExtension = new Map<string, string>([
    ['application/json', 'json'],
    ['application/json;application=virtfac/blueprint/routing', 'json'],
    ['application/json;application=virtfac/blueprint/building', 'json'],
    ['text/csv', 'csv'],
    [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'xlsx'
    ],
    ['application/xlsx', 'xlsx'],
    ['application/json;application=virtfac/constraint', 'xlsx'],
    ['application/json;application=virtfac/routing', 'xlsx']
  ])

  downloadOverideFunctions = new Map<
    string,
    {(fileId: number): Promise<string> }
      >([
        [
          'application/json;application=virtfac/constraint',
          id => {
            return new Promise<string>(resolve => {
              resolve('')
            })
          }
        ],
        [
          'application/json;application=virtfac/routing',
          id => {
            return new Promise<string>(resolve => {
              resolve('')
            })
          }
        ]
      ])

  /* Table properties */
  refreshTableKey = 0
  myfileList: APIFileItem[] = []
  selectedFile: APIFileItem[] = []
  selectedFileAfterLoad = 0
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
        value: 'mime',
        align: 'start',
        sort: (a: string, b: string): number => {
          return a < b ? -1 : a > b ? 1 : 0
        }
      },
      active: false
    }),
    new DataTableHeaderSelector({
      editable: false,
      header: { text: '', value: 'actions', align: 'end', sortable: false }
    })
  ]

  /* File loader */
  loadFileTasks = 0
  loadFileTasksNumber = 0

  /* File settings */
  fileSettingsPopUp = false
  fileSettings: APIFileItem = new APIFileItem()
  fileSettingsIsSaving = false
  myFormatList: APIFileMIME[] = []

  // @vuese
  // Getter to check mobile view
  // @arg No arguments required
  get isMobileView (): boolean {
    return this.$vuetify.breakpoint.smAndDown
  }

  // @vuese
  // Getter to get active file table header
  // @arg No arguments required
  get activeHeaders (): DataTableHeader[] {
    return this.headersSelector
      .filter(selector => selector.active)
      .map(selector => selector.header)
  }

  // @vuese
  // Getter for filtered file table headers
  // @arg No arguments required
  get editableHeadersSelector (): DataTableHeaderSelector[] {
    return this.headersSelector.filter(selector => selector.editable)
  }

  // @vuese
  // Getter for format list with automatic MIME filter
  // @arg No arguments required
  get formatList (): APIFileMIME[] {
    return this.myFormatList.filter(
      mime =>
        mime.media === this.fileSettings.fileMIME.media &&
        mime.format === this.fileSettings.fileMIME.format
    )
  }

  // @vuese
  // Mounted function
  // @arg No arguments required
  mounted (): void {
    console.log('open file mounted')
    this.load()
  }

  // @vuese
  // Load function to get all groups and formats
  // @arg No arguments required
  load (): void {
    this.fileSettingsIsSaving = false
    this.getAllGroups()
    this.getAllFormats()
  }

  // @vuese
  // Load groups from API
  // @arg No arguments required
  getAllGroups (): void {
    API.get(this, '/user/groups', null).then((reponse: Response) => {
      const groupListData = (reponse as unknown) as APIGroupItem[]
      this.groupList = [new APIGroupItem({ id: 0, name: 'All' })]
      groupListData.forEach((groupInfo: Partial<APIGroupItem>) => {
        this.groupList.push(new APIGroupItem(groupInfo))
      })
      this.waitingTasks -= 1
    })
  }

  // @vuese
  // Load formats from API
  // @arg No arguments required
  getAllFormats (): void {
    if (this.application === 'all') {
      this.myFormatList = []
      this.getAllFiles(
        JSON.stringify({
          select: [
            'id',
            'idUserOwner',
            'idProject',
            'creationDate',
            'modificationDate',
            'name',
            'color',
            'tags',
            'mime'
          ]
        })
      )

      this.waitingTasks -= 1
    } else {
      API.get(this, '/application/formats/' + this.application, null).then(
        (response: Response) => {
          this.myFormatList = []
          const formatList = (response as unknown) as string[]
          this.getAllFiles(
            JSON.stringify({
              select: [
                'id',
                'idUserOwner',
                'idProject',
                'creationDate',
                'modificationDate',
                'name',
                'color',
                'tags',
                'mime'
              ],
              where: formatList.map(format => {
                return {
                  mime: format
                }
              })
            })
          )

          this.myFormatList = formatList.map(MIME =>
            APIFileMIME.parseFromString(MIME)
          )
          this.waitingTasks -= 1
        }
      )
    }
  }

  // @vuese
  // Get all compatible file list from API
  // @arg The argument is a json value representing select and where to filter files
  getAllFiles (fileParams: string): void {
    API.post(this, '/resources/files', fileParams).then(
      (response: Response) => {
        const fileList = (response as unknown) as APIFileItem[]
        this.myfileList = []
        fileList.forEach((fileInfo: Partial<APIFileItem>) => {
          if (fileInfo.name && fileInfo.creationDate) {
            const fileItem = new APIFileItem(fileInfo)
            this.myfileList.push(fileItem)
            if (this.selectedFileAfterLoad !== 0) {
              this.selectedFile = [fileItem]
            }
          }
        })
        this.getAllTags()
        this.waitingTasks -= 1
      }
    )
  }

  // @vuese
  // Get all tags from file list
  // @arg No arguments required
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

  // @vuese
  // Custom file filter method to show files by tags, groups, and search bar
  // "value" argument is not used, because value take each column value without column information.
  // Instead, I use "item" with all data included in current row.
  // "search" argument is also not used, because his value are always set to 'true' (because with
  // empty value, the custom filter is not called).
  // Instead, we use this.seach who is binded value of search bar.
  // To refresh customFilter with tag list, we update :key binded on this.refreshTableKey
  // on table component when tag list changes.
  // @arg item from file list
  customFilter (
    _value: unknown,
    _search: string | null,
    item: APIFileItem
  ): boolean {
    const itemTags = item.getTags()
    const groupFilter = this.selectedGroupId === 0 // TODO : Update filter
    const searchFilter =
      this.search == null ||
      item.name.toLocaleUpperCase().indexOf(this.search.toLocaleUpperCase()) !==
        -1
    const tagFilter = !this.tagValues.some(tag => !itemTags.includes(tag))
    return groupFilter && searchFilter && tagFilter
  }

  openUploadFile (): void {
    const uploadFileInput = this.$refs.uploadFileInput as HTMLInputElement
    uploadFileInput.accept = this.accept
    if (uploadFileInput == null) return
    uploadFileInput.value = ''
    uploadFileInput.click()
  }

  uploadFile (file: APIFile): void {
    console.log('Upload file with mime :', file.mime)
    API.put(this, '/resources/files', JSON.stringify(file.toJSON()))
      .then((response: Response) => {
        const id = ((response as unknown) as { id: number }).id
        this.selectedFileAfterLoad = id
        this.load()
      })
      .catch(_ => {
        console.error('Fail posted resource :', file)
      })
  }

  updateUploadFile (e: Event): void {
    if (e.target == null) return
    const target = e.target as HTMLInputElement
    if (target.files != null && target.files.length > 0) {
      let uploadedFiles = 0

      const uploadFileFunc = (f: File) => {
        const reader = new FileReader()
        reader.onload = () => {
          const fileString = reader.result as string
          this.uploadFile(
            new APIFile({
              name: f.name,
              uri: fileString
            })
          )

          // Reset file input once each file is loaded
          uploadedFiles++
          if (target.files && uploadedFiles === target.files.length) {
            target.value = ''
          }
        }
        reader.onerror = error => {
          console.error(error)
          // Send message to root container to display error
          // @arg String message to display
          this.$root.$emit('bottom-message', 'Sorry, we cannot read this file.')
        }
        reader.readAsDataURL(f)
      }
      ;[...target.files].forEach(file => {
        if (this.fileProcessing !== null) {
          this.fileProcessing(file).then(uploadFileFunc)
        } else {
          uploadFileFunc(file)
        }
      })
    }
  }

  async downloadFileData (item: APIFile): Promise<void> {
    const dataFunction = this.downloadOverideFunctions.get(item.mime)
    let uri = ''
    if (dataFunction !== undefined) {
      await dataFunction(item.id).then(data => {
        uri = data
      })
    } else {
      await API.post(
        this,
        '/resources/files',
        JSON.stringify({
          where: { id: item.id },
          select: ['uri']
        })
      ).then(asset => {
        const res = (asset as unknown) as APIFile[]
        uri = res[0].uri
      })
    }
    const a = document.createElement('a')
    a.href = uri
    a.download =
      item.name +
      (this.mimeToExtension.get(item.mime) !== undefined
        ? (('.' + this.mimeToExtension.get(item.mime)) as string)
        : '')
    a.click()
  }

  confirmActionMessage = ''
  confirmAction: { (): void } | undefined = undefined

  deleteFile (item: APIFile): void {
    this.confirmAction = () => {
      API.delete(this, `/resources/files/${item.id}`, '').then(res => {
        this.myfileList.splice(this.myfileList.indexOf(item, 0), 1)
      })
      ;(this.$refs.confirmAction as PopUp).close()
    }
    this.confirmActionMessage = 'Delete "' + item.name + '" premanently ?'
    ;(this.$refs.confirmAction as PopUp).open()
  }

  // Toggle row selection on click
  toggleSelectedFile (
    _item: APIFileItem,
    row: {
      expand: (value: boolean) => void
      headers: DataTableHeader[]
      isExpanded: boolean
      isMobile: boolean
      isSelected: boolean
      item: APIFileItem
      select: (value: boolean) => void
    }
  ): void {
    row.select(!row.isSelected)
  }

  openFileSettings (item: APIFileItem): void {
    this.fileSettings = new APIFileItem(item)
    this.fileSettingsPopUp = true
  }

  saveFileSettings (): void {
    this.fileSettingsIsSaving = true
    console.log(this.fileSettings)
    API.patch(
      this,
      `/resources/files/${this.fileSettings.id}`,
      JSON.stringify(this.fileSettings.toJSON())
    ).then((response: Response) => {
      const fileUpdate = (response as unknown) as APIFileItem
      this.fileSettingsIsSaving = false
      this.fileSettingsPopUp = false
      this.myfileList.forEach(file => {
        if (file.id === this.fileSettings.id) {
          Object.assign(file, fileUpdate)
        }
      })
    })
  }

  /* Popup actions */

  reset (): void {
    this.selectedFile = []
    this.selectedFileAfterLoad = 0
    this.loadFileTasks = 0
    this.loadFileTasksNumber = 0
  }

  cancel (): void {
    this.reset()

    // Open file action is cancelled
    // @arg No arguments required
    this.$emit('cancel')

    // Close the parent popup (if it exists)
    // @arg No arguments required
    this.$emit('close')
  }

  validated (): void {
    this.loadFileTasks = this.selectedFile.length
    this.loadFileTasksNumber = this.loadFileTasks
    const fileIdList = this.selectedFile.map(file => {
      return {
        id: file.id
      }
    })
    API.post(
      this,
      '/resources/files',
      JSON.stringify({
        where: fileIdList
      })
    ).then((response: Response) => {
      const fileResult = (response as unknown) as APIFile[]
      this.loadFileTasks -= 1
      if (this.loadFileTasks === 0) {
        // Send file content to parent component
        // @arg fileResult an array of selected files content
        this.$emit('fileInput', fileResult)

        // Close the parent popup (if it exists)
        this.reset()
        this.$emit('close')
      }
    })
  }
}
</script>
