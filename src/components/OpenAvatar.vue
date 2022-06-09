<template>
  <v-card>
    <!-- Header -->
    <v-toolbar color="primary" flat>
      <v-toolbar-title class="black--text">
        <v-icon left v-text="'mdi-file-document'"></v-icon>
        {{ openFile ? 'Open Avatar' : 'Files manager' }}
      </v-toolbar-title>
    </v-toolbar>

    <!-- Popup content -->
    <v-card :height="this.isMobileView ? 470 : undefined">
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
              @click="groupSettingsPopUp = !groupSettingsPopUp"
            >
              <v-icon v-text="'mdi-folder-account'"></v-icon>
            </v-btn>

            <!-- Group selector-->
            <v-select
              :items="groupList"
              v-model="selectedGroupId"
              style="min-width: 0;"
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
            :height="this.isMobileView ? undefined : '362'"
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
            dense
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
              <v-icon
                @click="openFileSettings(item)"
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
                <v-btn text @click="fileSettingsPopUp = false">
                  Cancel
                </v-btn>
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
import { APIGroupItem, APIFileMIME, APIAsset } from '@/utils/models'

@Component
export default class OpenAvatarPopUp extends Vue {
  @Prop({ default: () => 'all' }) private application!: string
  @Prop({ default: () => true }) private singleSelect!: boolean
  @Prop({ default: () => false }) private openFile!: boolean
  @Prop({ default: () => '' }) private accept!: string
  @Prop({ default: () => null }) private uploadPipeline!: {
    (file: File): Promise<File>
  } | null
}
</script>
