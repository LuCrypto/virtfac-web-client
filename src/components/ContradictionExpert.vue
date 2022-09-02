<template>
  <maximizable-container>
    <v-card elevation="3" class="d-flex flex-row flex-grow-1">
      <v-navigation-drawer stateless permanent :mini-variant="menuCollapse">
        <v-list
          nav
          dense
          class="d-flex flex-column justify-start;"
          style="height: 100%"
        >
          <v-list-item-group v-model="selectedMenuItem" color="primary">
            <v-list-item
              v-for="(menuItem, i) in menuItemList"
              :key="i"
              class="justify-start"
              @click.stop="menuItem.action"
            >
              <v-list-item-icon>
                <v-icon v-text="menuItem.icon"></v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="menuItem.text"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
          <v-list-item-group class="mt-auto">
            <v-list-item
              class="justify-start"
              @click="menuCollapse = !menuCollapse"
            >
              <v-list-item-icon>
                <v-icon v-if="menuCollapse" v-text="'mdi-arrow-right'"></v-icon>
                <v-icon v-if="!menuCollapse" v-text="'mdi-arrow-left'"></v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="'Menu labels'"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-navigation-drawer>
      <v-container
        class="pa-0"
        style="width: auto; margin: 0; flex-grow: 1; position: relative; max-width: none"
      >
        <v-card
          v-if="showFilter"
          style="position: absolute; z-index: 1; left: 5px; top: 5px; width: 250px;"
        >
          <v-toolbar color="primary" flat dense>
            <v-toolbar-title class="black--text" style="padding-left: 50px;">
              Filters
            </v-toolbar-title>
          </v-toolbar>

          <v-card-text class="pt-0 pb-0 mt-4">
            <v-row>
              <v-col class="px-2">
                <v-range-slider
                  dense
                  v-model="filterRange"
                  :max="filterBorder[1]"
                  :min="filterBorder[0]"
                  hint="Link weight filter"
                  persistent-hint
                  class="align-center"
                  @change="refreshFilters"
                >
                  <template v-slot:prepend>
                    <v-text-field
                      dense
                      :value="filterRange[0]"
                      class="mt-0 pt-0"
                      hide-details
                      single-line
                      type="number"
                      style="width: 40px"
                      @change="$set(filterRange, 0, $event)"
                    ></v-text-field>
                  </template>
                  <template v-slot:append>
                    <v-text-field
                      dense
                      readonly
                      :value="filterRange[1]"
                      class="mt-0 pt-0"
                      hide-details
                      single-line
                      type="number"
                      style="width: 40px"
                      @change="$set(filterRange, 1, $event)"
                    ></v-text-field>
                  </template>
                </v-range-slider>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-switch
                  dense
                  v-model="reverseFilter"
                  :label="`${reverseFilter ? 'Show' : 'Hide'} interval`"
                  inset
                  @change="refreshFilters"
                >
                </v-switch>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
        <v-btn
          v-if="showFilter"
          @click="
            () => {
              showFilter = !showFilter
            }
          "
          outlined
          icon
          style="position: absolute; z-index: 2; left: 11px; top: 11px;"
          ><v-icon v-text="'mdi-filter-minus'"></v-icon
        ></v-btn>
        <v-btn
          v-else
          outlined
          icon
          style="position: absolute; z-index: 2; left: 11px; top: 11px;"
          color="primary"
          @click="
            () => {
              showFilter = !showFilter
            }
          "
          ><v-icon v-text="'mdi-filter-plus'"></v-icon
        ></v-btn>

        <NV ref="nodeViewer" :graph="getGraph()" />
      </v-container>
      <pop-up ref="filePopUp">
        <open-file
          @close="$refs.filePopUp.close()"
          application="CONTRADICTION_ANALYSIS"
          :singleSelect="true"
          :openFile="true"
          accept=".xlsx"
          @fileInput="handleFile"
          :fileProcessing="createConstraintProject"
        ></open-file>
      </pop-up>
      <select-pop-up ref="selectPopUp"></select-pop-up>
      <input-field-pop-up ref="inputFieldPopUp"></input-field-pop-up>
    </v-card>
  </maximizable-container>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import ActionContainer from '@/components/ActionContainer.vue'
import OpenFile from '@/components/OpenFile.vue'
import XLSX from 'xlsx'
import NV from '@/components/NV.vue'
import { APIFile } from '@/utils/models'

import { ConstraintGraph } from '@/utils/graph/constraintGraph'
import { Graph } from '@/utils/graph/graph'
import { IWorkBook } from 'ts-xlsx'
import API from '@/utils/api'
import SelectPopUp from '@/components/popup/SelectPopUp.vue'
import InputFieldPopUp from '@/components/popup/InputFieldPopUp.vue'
import { GraphLayout } from '@/utils/graph/graphLayout'
import PopUp from '@/components/PopUp.vue'
import MaximizableContainer from './MaximizableContainer.vue'

class MenuItem {
  text: string
  icon: string
  action: () => void
  constructor (text: string, icon: string, action: () => void) {
    this.text = text
    this.icon = icon
    this.action = action
  }
}

class ConstraintProject {
  public xlsxUri = ''
  public shapes = new Array<{ date: number; name: string; data: unknown }>()

  constructor (xlsxUri: string) {
    this.xlsxUri = xlsxUri
  }
}

interface SettingItem {
  id: number
  idApplication: number
  name: string
  json: string
}

@Component({
  name: 'ContradictionExpert',
  components: {
    ActionContainer,
    OpenFile,
    PopUp,
    NV,
    SelectPopUp,
    InputFieldPopUp,
    MaximizableContainer
  }
})
// @vuese
// @group COMPONENTS
// Content component of the page contradiction-analysis-expert
export default class ContradictionExpert extends Vue {
  selectedMenuItem = -1
  nodeViewer: NV | null = null
  selectPopUp: SelectPopUp | null = null
  inputFieldPopUp: InputFieldPopUp | null = null
  actionContainer: ActionContainer | null = null
  menuCollapse = false
  menuItemList: MenuItem[] = []
  constraintGraph: ConstraintGraph = new ConstraintGraph()
  fileName = ''
  openedFile: APIFile | null = null
  openedProject: ConstraintProject | null = null
  showFilter = false
  filterRange = [-10, 10]
  filterBorder = [-10, 10]
  reverseFilter = true

  // @vuese
  // get raw constraint graph
  getGraph (): Graph {
    return (this.constraintGraph as ConstraintGraph).getRawGraph()
  }

  mounted (): void {
    // this.constraintGraph = new ConstraintGraph()
    this.nodeViewer = this.$refs.nodeViewer as NV
    this.actionContainer = this.$refs.actionContainer as ActionContainer
    this.selectPopUp = this.$refs.selectPopUp as SelectPopUp
    this.inputFieldPopUp = this.$refs.inputFieldPopUp as InputFieldPopUp

    this.menuItemList.push(
      new MenuItem('Open File', 'mdi-file-document', () => {
        (this.$refs.filePopUp as PopUp).open()
      })
    )
    this.menuItemList.push(
      new MenuItem('Save shape', 'mdi-graph-outline', () => {
        this.saveShape()
      })
    )
    this.menuItemList.push(
      new MenuItem('Load shape', 'mdi-graph-outline', () => {
        this.loadShape()
      })
    )
    this.menuItemList.push(new MenuItem('Settings', 'mdi-cog', () => true))
    this.menuItemList.push(
      new MenuItem('Layouts', 'mdi-graphql', () => {
        this.selectLayout()
      })
    )
    this.menuItemList.push(
      new MenuItem('Save image', 'mdi-camera', () => {
        (this.nodeViewer as NV).exportToPNG()
        return true
      })
    )

    // const mapper = new Mapper(CAEExampleFormat1)
  }

  onRightMouseDrag (): void {
    if (this.actionContainer != null) {
      this.actionContainer.drag()
    }
  }

  onMouseWheel (): void {
    if (this.actionContainer != null) {
      this.actionContainer.zoom()
    }
  }

  /*
  onUpdate (data: ActionCallbackData): void {
    if (this.nodeViewer != null) {
      // this.nodeViewer.update(data)
    }
  }
  */

  handleFile (files: APIFile[]): void {
    if (files == null) {
      console.log('This type of file cannot be read yet.')
    } else {
      this.openedFile = files[0]
      this.openedProject = JSON.parse(
        atob(files[0].uri.split('base64,')[1])
      ) as ConstraintProject
      console.log(this.openedFile, this.openedProject)

      const workbook = XLSX.read(
        this.openedProject.xlsxUri.split('base64,')[1],
        {
          type: 'base64'
        }
      )
      this.constraintGraph.loadXLSX(workbook as IWorkBook)
      this.fileName = files[0].name
      // this.projectId = files[0].idProject
      this.filterBorder = [0, 0]
      this.constraintGraph.getGraph().foreachLink(l => {
        const w = l.getDataOrDefault<number>('weight', 0)
        if (w > this.filterBorder[1]) {
          this.filterBorder[1] = w
        }
        if (w < this.filterBorder[0]) {
          this.filterBorder[0] = w
        }
      })
      this.filterRange = [this.filterBorder[0], this.filterBorder[1]]
    }
  }

  createConstraintProject (xlsx: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const xlsxUri = reader.result as string
        const constraintProject = new ConstraintProject(xlsxUri)

        const blob = new Blob([JSON.stringify(constraintProject)], {
          type: 'application/json;application=virtfac/constraint'
        })
        const f = new File([blob], xlsx.name, {
          type: 'application/json;application=virtfac/constraint'
        })
        resolve(f)
      }
      reader.onerror = error => {
        reject(error)
      }
      reader.readAsDataURL(xlsx)
    })
  }

  // @vuese
  // Save nodes position to the API
  saveShape (): void {
    //*
    if (this.openedProject !== null && this.openedFile !== null) {
      this.openedProject.shapes.push({
        date: Date.now(),
        name: 'shape ' + this.openedProject.shapes.length,
        data: this.constraintGraph.getRawGraph().toJsonOBJ()
      })

      API.patch(
        this,
        '/resources/files/' + this.openedFile.id,
        JSON.stringify({
          uri:
            'data:application/json;base64,' +
            Buffer.from(JSON.stringify(this.openedProject), 'utf-8').toString(
              'base64'
            )
        })
      )
        .then(console.log)
        .catch(console.error)
    }
  }

  selectLayout (): void {
    const headers = new Array<{
      text: string
      value: string
      align: string
      sortable: boolean
      sort: {(a: unknown, b: unknown): number }
        }>({
          text: 'Name',
          value: 'name',
          align: 'start',
          sortable: false,
          sort: () => 0
        })
    if (this.selectPopUp !== null) {
      this.selectPopUp.open(
        headers,
        [
          {
            name: 'Default Layout',
            exec: () => {
              this.constraintGraph.refreshPosition()
            }
          },
          {
            name: 'Vertical Hierarchy',
            exec: () => {
              GraphLayout.verticalHierarchyLayout(this.getGraph(), 500)
            }
          },
          {
            name: 'Horizontal Hierarchy',
            exec: () => {
              GraphLayout.horizontalHierarchyLayout(this.getGraph(), 500)
            }
          },
          {
            name: 'Circle',
            exec: () => {
              GraphLayout.circleLayout(this.getGraph(), 500)
            }
          },
          {
            name: 'Horizontal Ordering',
            exec: () => {
              GraphLayout.horizontalOrdering(this.getGraph(), 400)
            }
          }
        ],
        item => {
          if (item === null) return
          ;((item as Record<string, unknown>).exec as { (): void })()
        }
      )
    }
  }

  // @vuese
  // Load nodes position from the API
  loadShape (): void {
    if (this.openedFile === null) return
    if (this.openedProject === null) return

    const headers = new Array<{
      text: string
      value: string
      align: string
      sortable: boolean
      sort: {(a: unknown, b: unknown): number }
        }>(
        {
          text: 'Name',
          value: 'name',
          align: 'start',
          sortable: true,
          sort: (a: unknown, b: unknown) => {
            return (a as string).localeCompare(b as string)
          }
        },
        {
          text: 'Date',
          value: 'date',
          align: 'end',
          sortable: true,
          sort: (a: unknown, b: unknown) => {
            return new Date(a as string) > new Date(b as string) ? 1 : -1
          }
        }
        )
    const m = new Array<{
      name: string
      date: string
      return: unknown
    }>()
    this.openedProject.shapes.forEach(item => {
      const it = {
        name: item.name,
        date:
          new Date(item.date).toLocaleTimeString() +
          ' ' +
          new Date(item.date).toLocaleDateString(),
        return: item.data
      }
      m.push(it)
    })

    if (this.selectPopUp != null) {
      this.selectPopUp.open(
        headers,
        m,
        item => {
          if (item != null) {
            this.getGraph().applyJson(
              (item as Record<string, unknown>).return as Record<
                string,
                unknown
              >
            )
          }
        },
        new Array<{
          text: string
          icon: string
          action: {(item: unknown): void }
            }>(
            {
              text: 'download',
              icon: 'mdi-download',
              action: item => {
                const a = document.createElement('a')
                const file = new Blob(
                  [JSON.stringify((item as Record<string, unknown>).return)],
                  {
                    type: 'application/json'
                  }
                )
                a.href = URL.createObjectURL(file)
                a.download =
                ((item as Record<string, unknown>).name as string) + '.json'
                a.click()
              }
            },
            {
              text: 'delete',
              icon: 'mdi-delete-outline',
              action: () => {
                console.log('delete item')
              }
            }
            )
      )
    }
  }

  // @vuese
  // Update shown/hidden links related to the selected filters
  refreshFilters () {
    this.constraintGraph.getGraph().foreachLink(l => {
      const w = l.getDataOrDefault<number>('weight', 0)
      const inInterval = w <= this.filterRange[1] && w >= this.filterRange[0]
      l.setData<boolean>(
        'visible',
        this.reverseFilter ? inInterval : !inInterval
      )
    })
  }
}
</script>
