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
        style="width: auto; margin: 0; flex-grow: 1; padding: 0px; max-width:none"
      >
        <routing-graph-viewer ref="graphViewer"></routing-graph-viewer>
      </v-container>
      <input
        ref="loadRoutingFile"
        type="file"
        accept=".xls"
        hidden
        @change="loadRoutingFile"
      />
      <pop-up ref="filePopUp">
        <open-file
          @close="$refs.filePopUp.close()"
          application="ROUTING_ANALYSIS"
          :singleSelect="true"
          :openFile="true"
          :uploadPipeline="changeMime"
          @fileInput="handleFile"
        ></open-file>
      </pop-up>
      <pop-up ref="matrixEditor">
        <matrix-viewer ref="matrixViewer"></matrix-viewer>
      </pop-up>
      <select-pop-up ref="selectPopUp"></select-pop-up>
    </v-card>
  </maximizable-container>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import ActionContainer from '@/components/ActionContainer.vue'
import OpenFile from '@/components/OpenFile.vue'
import * as XLSX from 'xlsx'
import PopUp from '@/components/PopUp.vue'
import RoutingGraphViewer from './RoutingGraphViewer.vue'
import { Graph } from '@/utils/graph/graph'
import { Node } from '@/utils/graph/node'
import { Link } from '@/utils/graph/link'
import { Vec2, Vector2 } from '@/utils/graph/Vec'
import { GraphUtils } from '@/utils/graph/graphUtils'
import { GraphLayout } from '@/utils/graph/graphLayout'
import { MatrixUtils, Matrix } from '@/utils/matrixUtils'
import MatrixViewer from '@/components/MatrixViewer.vue'
import SelectPopUp from './popup/SelectPopUp.vue'
import MaximizableContainer from './MaximizableContainer.vue'
import { VAlert } from 'vuetify/lib'
import { APIFile } from '@/utils/models'

class Poste {
  name: string
  public postPostNode: Node | null = null
  public articlePostNode: Node | null = null

  constructor (name: string) {
    this.name = name
  }
}

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

interface ClassifSolution {
  matrix: Matrix
  classif: {
    score: number
    rowAssignment: Map<number, number>
    colAssignment: Map<number, number>
    nbClass: number
  }
  interclassRatio: number
  nbClass: number
  alpha: number
}

@Component({
  name: 'RoutingAnalysisComponent',
  components: {
    RoutingGraphViewer,
    OpenFile,
    PopUp,
    MatrixViewer,
    SelectPopUp,
    MaximizableContainer
  }
})
// @vuese
// @group COMPONENTS
// Content component of the routing-analysis page
export default class RoutingAnalysisComponent extends Vue {
  selectedMenuItem = -1
  actionContainer: ActionContainer | null = null
  menuCollapse = false
  menuItemList: MenuItem[] = []

  graphViewer: RoutingGraphViewer | null = null

  private posteMap = new Map<string, Poste>()

  private filterTransitiveLinksVisible = true

  postPostGraph: Graph | null = null
  postPostMatrix: Matrix | null = null

  articlePostGraph: Graph | null = null
  articlePostMatrix: Matrix | null = null

  mounted (): void {
    this.actionContainer = this.$refs.actionContainer as ActionContainer
    this.graphViewer = this.$refs.graphViewer as RoutingGraphViewer

    // const graph = GraphUtils.genOrderGraph().displayGraph
    // this.graphViewer.setGraph(graph)

    this.menuItemList.push(
      new MenuItem('Open File', 'mdi-file-document', () => {
        (this.$refs.filePopUp as PopUp).open()
      }),
      new MenuItem('Import', 'mdi-application-import', () => {
        (this.$refs.selectPopUp as SelectPopUp).open(
          [
            {
              text: 'Import file type',
              value: 'txt',
              align: 'left',
              sortable: false,
              sort: (a, b) => {
                return 0
              }
            }
          ],
          [
            {
              txt: 'Routing file',
              callback: () => {
                // console.log('Article/Poste Matrix')
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = '.xls, .xlsx'
                input.oninput = this.loadRoutingFile
                input.click()
              }
            },
            {
              txt: 'Part/Machine Matrix',
              callback: () => {
                // console.log('Article/Poste Matrix')
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = '.xls, .xlsx'
                input.oninput = this.loadArticlePosteMatrix
                input.click()
              }
            },
            {
              txt: 'Machine/Machine Matrix',
              callback: () => {
                // console.log('Article/Poste Matrix')
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = '.xls, .xlsx'
                input.oninput = this.loadPostePosteMatrix
                input.click()
              }
            },
            {
              txt: 'Clustering',
              callback: () => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = '.xls, .xlsx'
                input.oninput = this.loadClassification
                input.click()
              }
            }
          ],
          item => {
            if (item !== null) {
              ((item as Record<string, unknown>).callback as { (): void })()
            }
          }
        )
      }),
      new MenuItem('Export', 'mdi-application-export', () => {
        (this.$refs.selectPopUp as SelectPopUp).open(
          [
            {
              text: 'Export file type',
              value: 'txt',
              align: 'left',
              sortable: false,
              sort: (a, b) => {
                return 0
              }
            }
          ],
          [
            {
              txt: 'Part/Machine Matrix',
              callback: () => {
                this.saveArticlePosteMatrix()
              }
            },
            {
              txt: 'Machine/Machine Matrix',
              callback: () => {
                this.savePostePosteMatrix()
              }
            },
            {
              txt: 'Clustering',
              callback: () => {
                this.saveClassification()
              }
            }
          ],
          item => {
            if (item !== null) {
              ((item as Record<string, unknown>).callback as { (): void })()
            }
          }
        )
      }),
      new MenuItem('Remove feedback link', 'mdi-backspace', () => {
        if (this.postPostGraph !== null) {
          this.postPostGraph.foreachNode(n => {
            n.foreachLink(l => {
              if (l.getDataOrDefault<boolean>('goBack', false)) {
                n.removeLink(l.getNode())
              }
            })
          })
        }
      }),
      new MenuItem(
        'Show/Hide transitive link',
        'mdi-chart-sankey-variant',
        () => {
          if (this.postPostGraph !== null) {
            const transitiveSet = GraphUtils.getTransitiveLinks(
              this.postPostGraph
            )
            const linkMap = this.postPostGraph.getData<Map<Link, Array<Node>>>(
              'attachedNodes'
            )
            this.filterTransitiveLinksVisible = !this
              .filterTransitiveLinksVisible

            transitiveSet.forEach(l => {
              l.setData<boolean>('isTransitive', true)
              if (this.graphViewer !== null) {
                if (this.graphViewer.getGraph() === this.postPostGraph) {
                  l.setData<boolean>(
                    'visible',
                    this.filterTransitiveLinksVisible
                  )
                }
              }
              (linkMap.get(l) as Array<Node>).forEach(n => {
                n.foreachLink(displayedLink => {
                  // displayedLink.setData<string>('stroke-dasharray', '5')
                  // displayedLink.setData<string>('color', '#F1C40F')
                  displayedLink.setData<boolean>(
                    'visible',
                    this.filterTransitiveLinksVisible
                  )
                })
              })
            })
          }
          if (this.graphViewer !== null) {
            this.graphViewer.setGraph(this.graphViewer.getGraph())
          }
        }
      ),
      new MenuItem('Level layout', 'mdi-file-tree', () => {
        if (this.postPostGraph !== null && this.graphViewer !== null) {
          const nbLevel = GraphUtils.computeLevels(this.postPostGraph, 'level')
          GraphLayout.levelLayout(
            this.postPostGraph,
            'level',
            'position',
            100,
            200
          )
          this.postPostGraph.foreachNode(n => {
            n.foreachLink(l => {
              l.setData<boolean>(
                'visible',
                this.filterTransitiveLinksVisible ||
                  !l.getDataOrDefault<boolean>('isTransitive', false)
              )
            })
          })
          this.graphViewer.setGraph(this.postPostGraph)
        }
      }),
      new MenuItem('Clustering Part/Machine', 'mdi-matrix', () => {
        if (this.articlePostGraph !== null) {
          if (this.articlePostMatrix === null) {
            this.articlePostMatrix = MatrixUtils.matrixFromBipartiGraph(
              this.articlePostGraph,
              'matCelltype',
              'index'
            )
          }
          const solutions = new Array<ClassifSolution>()
          const pas = 0.1
          for (let i = pas; i < 1; i += pas) {
            const copy = this.articlePostMatrix.clone()
            const classif = MatrixUtils.blockDiagonalisation(copy, i)
            const interclassRatio = MatrixUtils.computeInterclassRatio(
              copy,
              classif.rowAssignment,
              classif.colAssignment
            )
            solutions.push({
              matrix: copy,
              classif: classif,
              interclassRatio: Math.round(interclassRatio * 1000) / 10,
              nbClass: classif.nbClass,
              alpha: Math.round(i * 100) / 100
            })
          }

          const applyClassif = (classif: ClassifSolution) => {
            this.articlePostMatrix = classif.matrix
            const colorMap = new Map<string, string>()
            const groupMap = new Map<string, number>()
            const colArray: string[] = [
              '#9B59B6',
              '#2980B9',
              '#A93226',
              '#6C3483',
              '#1F618D',
              '#117A65',
              '#2ECC71'
            ]
            const notAssignedColor = '#f5a406'
            if (this.articlePostGraph !== null) {
              this.articlePostGraph.foreachNode(n => {
                let group = 0
                if (n.getData<'row' | 'col'>('matCelltype') === 'col') {
                  group = classif.classif.colAssignment.get(
                    n.getData<number>('index')
                  ) as number
                } else {
                  group = classif.classif.rowAssignment.get(
                    n.getData<number>('index')
                  ) as number
                }
                n.setData<number>('classifGroup', group)
                groupMap.set(n.getData<string>('name'), group)
                if (group === -1) {
                  colorMap.set(n.getData<string>('name'), notAssignedColor)
                  n.setData<string>('color', notAssignedColor)
                } else {
                  colorMap.set(
                    n.getData<string>('name'),
                    colArray[group % colArray.length]
                  )
                  n.setData<string>('color', colArray[group % colArray.length])
                }
              })

              if (this.postPostGraph !== null) {
                this.postPostGraph.foreachNode(n => {
                  const color = colorMap.get(n.getData<string>('name'))
                  if (color !== undefined) {
                    n.setData<string>('color', color)
                    n.setData<number>(
                      'classifGroup',
                      groupMap.get(n.getData<string>('name')) as number
                    )
                  }
                })
              }

              if (this.graphViewer !== null) {
                this.graphViewer.setGraph(this.graphViewer.getGraph())
              }
            }
          }
          ;(this.$refs.selectPopUp as SelectPopUp).open(
            [
              SelectPopUp.createNumberHeader('Alpha', 'alpha'),
              SelectPopUp.createNumberHeader(
                'Interclass ratio (%)',
                'interclassRatio'
              ),
              SelectPopUp.createNumberHeader('Nb Class', 'nbClass')
            ],
            solutions,
            item => {
              if (item !== null) applyClassif(item as ClassifSolution)
            }
          )
        }
      }),
      new MenuItem('Clustering Machine/Machine', 'mdi-matrix', () => {
        if (this.postPostGraph !== null) {
          const m = MatrixUtils.matrixFromGraph(this.postPostGraph, 'index')
          m.printMat()
          const classif = MatrixUtils.symetricBlockDiagonalisation(m)
          m.printMat()

          if (this.postPostMatrix === null) {
            this.postPostMatrix = MatrixUtils.matrixFromGraph(
              this.postPostGraph,
              'index'
            )
          }
          const solutions = new Array<ClassifSolution>()
          const pas = 0.1
          for (let i = pas; i < 1; i += pas) {
            const copy = this.postPostMatrix.clone()
            const classif = MatrixUtils.symetricBlockDiagonalisation(copy, i)
            const interclassRatio = MatrixUtils.computeInterclassRatio(
              copy,
              classif.assigns,
              classif.assigns
            )
            solutions.push({
              matrix: copy,
              classif: {
                score: classif.score,
                rowAssignment: classif.assigns,
                colAssignment: classif.assigns,
                nbClass: classif.nbClass
              },
              interclassRatio: Math.round(interclassRatio * 1000) / 10,
              nbClass: classif.nbClass,
              alpha: Math.round(i * 100) / 100
            })
          }

          const applyClassif = (classif: {
            matrix: Matrix
            assignment: Map<number, number>
          }) => {
            this.postPostMatrix = classif.matrix
            const colArray: string[] = [
              '#9B59B6',
              '#2980B9',
              '#A93226',
              '#6C3483',
              '#1F618D',
              '#117A65',
              '#2ECC71'
            ]
            const notAssignedColor = '#f5a406'
            if (this.postPostGraph !== null) {
              this.postPostGraph.foreachNode(n => {
                const group = classif.assignment.get(
                  n.getData<number>('index')
                ) as number
                n.setData<number>('classifGroup', group)
                if (group === -1) {
                  n.setData<string>('color', notAssignedColor)
                } else {
                  n.setData<string>('color', colArray[group % colArray.length])
                  console.log(group)
                }
              })

              if (this.graphViewer !== null) {
                this.graphViewer.setGraph(this.graphViewer.getGraph())
              }
            }
          }
          ;(this.$refs.selectPopUp as SelectPopUp).open(
            [
              SelectPopUp.createNumberHeader('Alpha', 'alpha'),
              SelectPopUp.createNumberHeader(
                'Interclass ratio (%)',
                'interclassRatio'
              ),
              SelectPopUp.createNumberHeader('Nb Class', 'nbClass')
            ],
            solutions,
            item => {
              if (item !== null) {
                const it = item as ClassifSolution
                applyClassif({
                  matrix: it.matrix,
                  assignment: it.classif.rowAssignment
                })
              }
            }
          )
        }
      }),
      new MenuItem('Show matrix', 'mdi-database', () => {
        const choices = new Array<Record<string, unknown>>()
        if (this.postPostGraph !== null) {
          if (this.postPostMatrix === null) {
            this.postPostMatrix = MatrixUtils.matrixFromGraph(
              this.postPostGraph,
              'index'
            )
          }
          choices.push({
            txt: 'Poste/Poste Matrix',
            callback: () => {
              (this.$refs.matrixEditor as PopUp).open()
              this.displayClassifMatrix(
                this.postPostMatrix as Matrix,
                this.postPostGraph as Graph,
                'classifGroup'
              )
            }
          })
        }
        if (this.articlePostGraph !== null) {
          if (this.articlePostMatrix === null) {
            this.articlePostMatrix = MatrixUtils.matrixFromBipartiGraph(
              this.articlePostGraph,
              'matCelltype',
              'index'
            )
          }
          choices.push({
            txt: 'Article/Poste Matrix',
            callback: () => {
              (this.$refs.matrixEditor as PopUp).open()
              this.displayClassifMatrix(
                this.articlePostMatrix as Matrix,
                this.articlePostGraph as Graph,
                'classifGroup',
                'matCelltype'
              )
            }
          })
        }

        if (choices.length === 1) {
          (choices[0].callback as { (): void })()
        } else if (choices.length > 1) {
          (this.$refs.selectPopUp as SelectPopUp).open(
            [
              {
                text: 'Import file type',
                value: 'txt',
                align: 'left',
                sortable: false,
                sort: (a, b) => {
                  return 0
                }
              }
            ],
            choices,
            item => {
              if (item !== null) {
                const it = item as Record<string, unknown>
                ;(it.callback as { (): void })()
              }
            }
          )
        }
      })
    )
  }

  inputFile (): void {
    const input = this.$refs.inputFile as HTMLInputElement
    input.value = ''
    input.click()
  }

  handleFile (file: APIFile[]): void {
    if (file == null) {
      console.log('This type of file cannot be read yet.')
    } else {
      var workbook = XLSX.read(file[0].uri.split('base64,')[1], {
        type: 'base64'
      })
      this.loadRoutingXLSX(workbook)
    }
  }

  // @vuese
  // Download the part/machine matrix in xlsx format to the client
  saveArticlePosteMatrix () {
    if (this.articlePostGraph !== null) {
      if (this.articlePostMatrix === null) {
        this.articlePostMatrix = MatrixUtils.matrixFromBipartiGraph(
          this.articlePostGraph,
          'matCelltype',
          'index'
        )
      }

      const rowNodeIndexMap = new Map<number, Node>()
      const colNodeIndexMap = new Map<number, Node>()
      this.articlePostGraph.foreachNode(n => {
        if (n.getData<'col' | 'row'>('matCelltype') === 'col') {
          colNodeIndexMap.set(n.getData<number>('index'), n)
        } else {
          rowNodeIndexMap.set(n.getData<number>('index'), n)
        }
      })

      const data = new Array<Array<unknown>>()
      for (let i = 0; i < this.articlePostMatrix.nbRow + 1; i++) {
        data.push(
          new Array<unknown>(this.articlePostMatrix.nbColumn + 1).fill('')
        )
      }
      data[0][0] = 'names'

      for (let i = 0; i < this.articlePostMatrix.nbRow; i++) {
        data[i + 1][0] = (rowNodeIndexMap.get(
          this.articlePostMatrix.getRowLabel(i)
        ) as Node).getData<string>('name')
      }
      for (let i = 0; i < this.articlePostMatrix.nbColumn; i++) {
        data[0][i + 1] = (colNodeIndexMap.get(
          this.articlePostMatrix.getColLabel(i)
        ) as Node).getData<string>('name')
      }
      for (let i = 0; i < this.articlePostMatrix.nbRow; i++) {
        for (let j = 0; j < this.articlePostMatrix.nbColumn; j++) {
          data[i + 1][j + 1] = this.articlePostMatrix.get(i, j)
        }
      }

      const ws = XLSX.utils.aoa_to_sheet(data)
      const wb = XLSX.utils.book_new()

      wb.SheetNames = ['Part Machine Matrix']

      wb.Sheets['Part Machine Matrix'] = ws

      const uri = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' })
      const buf = new ArrayBuffer(uri.length)
      const view = new Uint8Array(buf)
      for (let i = 0; i < uri.length; i++) view[i] = uri.charCodeAt(i) & 0xff
      const a = document.createElement('a')
      const blob = new Blob([buf], {
        type:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      const file = new File([blob], 'part/machine matrix.xlsx')
      a.href = URL.createObjectURL(file)
      a.download = 'part/machine matrix.xlsx'
      a.click()
    }
  }

  // @vuese
  // Download the part/part matrix in xlsx format to the client
  savePostePosteMatrix () {
    if (this.postPostGraph !== null) {
      const data = new Array<Array<unknown>>()
      let nbNode = 1
      this.postPostGraph.foreachNode(n => {
        n.setData<number>('__index', nbNode)
        nbNode++
      })
      for (let i = 0; i < nbNode; i++) {
        data.push(new Array(nbNode).fill(0))
      }

      this.postPostGraph.foreachNode(n => {
        const index = n.getData<number>('__index')
        const name = n.getData<string>('name')
        data[0][index] = name
        data[index][0] = name
        n.foreachLink(l => {
          data[index][
            l.getNode().getData<number>('__index')
          ] = l.getDataOrDefault<number>('weight', 1)
        })
      })

      data[0][0] = 'names'
      const ws = XLSX.utils.aoa_to_sheet(data)
      const wb = XLSX.utils.book_new()

      /*
      ws.B2.s = {
        fill: {
          patternType: 'solid',
          fgColor: { rgb: 'F5F4ED', theme: 3, tint: 0.3999755851924192 },
          bgColor: { indexed: 64 }
        }
      }
      */

      wb.SheetNames = ['Machine Matrix']

      wb.Sheets['Machine Matrix'] = ws

      const uri = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' })
      const buf = new ArrayBuffer(uri.length)
      const view = new Uint8Array(buf)
      for (let i = 0; i < uri.length; i++) view[i] = uri.charCodeAt(i) & 0xff
      const a = document.createElement('a')
      const blob = new Blob([buf], {
        type:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      const file = new File([blob], 'machine matrix.xlsx')
      a.href = URL.createObjectURL(file)
      a.download = 'machine matrix.xlsx'
      a.click()
    }
  }

  // @vuese
  // Download the classification in xlsx format to the client
  saveClassification () {
    const data = new Array<Array<unknown>>()
    const savedSet = new Set<string>()

    data.push(['Element Name', 'Group id (-1 = no group)'])
    if (this.postPostGraph !== null) {
      this.postPostGraph.foreachNode(n => {
        data.push([
          n.getData<string>('name'),
          n.getData<number>('classifGroup')
        ])
        savedSet.add(n.getData<string>('name'))
      })
    }
    if (this.articlePostGraph !== null) {
      this.articlePostGraph.foreachNode(n => {
        if (!savedSet.has(n.getData<string>('name'))) {
          data.push([
            n.getData<string>('name'),
            n.getData<number>('classifGroup')
          ])
          savedSet.add(n.getData<string>('name'))
        }
      })
    }
    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()

    wb.SheetNames = ['Clustering']

    wb.Sheets.Clustering = ws

    const uri = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' })
    const buf = new ArrayBuffer(uri.length)
    const view = new Uint8Array(buf)
    for (let i = 0; i < uri.length; i++) view[i] = uri.charCodeAt(i) & 0xff
    const a = document.createElement('a')
    const blob = new Blob([buf], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const file = new File([blob], 'clustering.xlsx')
    a.href = URL.createObjectURL(file)
    a.download = 'clustering.xlsx'
    a.click()
  }

  // @vuese
  // Load a classification from xlsx format from a client file
  loadClassification (event: Event) {
    if (event != null && event.target != null) {
      const f: File = ((event.target as HTMLInputElement).files as FileList)[0]
      if (f != null) {
        let array: any
        const fileReader = new FileReader()
        fileReader.onload = e => {
          array = fileReader.result
          const data = new Uint8Array(array)
          var arr = []
          for (let i = 0; i !== data.length; ++i) {
            arr[i] = String.fromCharCode(data[i])
          }
          const wb = XLSX.read(arr.join(''), {
            type: 'binary',
            cellStyles: true
          })

          const sheet = wb.Sheets[wb.SheetNames[0]]

          const nameOf: { (x: number, y: number): string } = (x, y) => {
            return XLSX.utils.encode_cell({ c: x, r: y })
          }

          const groupMap = new Map<string, number>()

          let i = 1
          let name = sheet[nameOf(0, i)]
          while (name !== undefined) {
            const g = +sheet[nameOf(1, i)].v
            groupMap.set(name.v, g)
            i++
            name = sheet[nameOf(0, i)]
          }

          const colArray: string[] = [
            '#9B59B6',
            '#2980B9',
            '#A93226',
            '#6C3483',
            '#1F618D',
            '#117A65',
            '#2ECC71'
          ]
          const notAssignedColor = '#f5a406'

          if (this.postPostGraph !== null) {
            this.postPostGraph.foreachNode(n => {
              const group = groupMap.get(n.getData<string>('name'))
              n.setData<number | undefined>('classifGroup', group)
              if (group === undefined) {
                n.setData<undefined>('color', undefined)
              } else if (group === -1) {
                n.setData<string>('color', notAssignedColor)
              } else {
                n.setData<string>('color', colArray[group % colArray.length])
              }
            })
          }

          if (this.articlePostGraph !== null) {
            this.articlePostGraph.foreachNode(n => {
              const group = groupMap.get(n.getData<string>('name'))
              n.setData<number | undefined>('classifGroup', group)
              if (group === undefined) {
                n.setData<undefined>('color', undefined)
              } else if (group === -1) {
                n.setData<string>('color', notAssignedColor)
              } else {
                n.setData<string>('color', colArray[group % colArray.length])
              }
            })
          }

          if (this.graphViewer !== null) {
            this.graphViewer.setGraph(this.graphViewer.getGraph())
          }
        }
        fileReader.readAsArrayBuffer(f)
      }
    }
  }

  // @vuese
  // Load a part/machine matrix from xlsx format from a client file
  loadArticlePosteMatrix (event: Event) {
    if (event != null && event.target != null) {
      const f: File = ((event.target as HTMLInputElement).files as FileList)[0]
      if (f != null) {
        if (this.articlePostGraph !== null) {
          this.postPostGraph = null
          this.posteMap = new Map<string, Poste>()
        }

        this.articlePostGraph = new Graph()

        let array: any
        const fileReader = new FileReader()
        fileReader.onload = e => {
          array = fileReader.result
          const data = new Uint8Array(array)
          var arr = []
          for (let i = 0; i !== data.length; ++i) {
            arr[i] = String.fromCharCode(data[i])
          }
          const wb = XLSX.read(arr.join(''), {
            type: 'binary',
            cellStyles: true
          })

          const sheet = wb.Sheets[wb.SheetNames[0]]
          console.log(sheet.B2)

          console.log(sheet)
          const nameOf: { (x: number, y: number): string } = (x, y) => {
            return XLSX.utils.encode_cell({ c: x, r: y })
          }

          let value = sheet[nameOf(1, 0)]
          let i = 1
          const colArray = new Array<string>('name')
          const rowArray = new Array<Node>(new Node())
          while (value !== undefined) {
            colArray.push(value.v)

            let poste: Poste | null = null
            if (!this.posteMap.has(value.v)) {
              this.posteMap.set(value.v, new Poste(value.v))
            }
            poste = this.posteMap.get(value.v) as Poste
            if (this.articlePostGraph !== null) {
              const node = new Node()
                .setData<string>('name', value.v)
                .setData<'row' | 'col'>('matCelltype', 'col') as Node
              this.articlePostGraph.addNode(node)
              poste.articlePostNode = node
            }
            i++
            value = sheet[nameOf(i, 0)]
          }

          i = 1
          value = sheet[nameOf(0, 1)]
          while (value !== undefined) {
            if (this.articlePostGraph !== null) {
              const node = new Node()
                .setData<string>('name', value.v)
                .setData<'row' | 'col'>('matCelltype', 'row') as Node
              this.articlePostGraph.addNode(node)
              rowArray.push(node)
            }
            i++
            value = sheet[nameOf(0, i)]
          }

          for (let x = 1; x < colArray.length; x++) {
            for (let y = 1; y < rowArray.length; y++) {
              const value = sheet[nameOf(x, y)]
              const w = value ? +value.v : 0
              if (w > 0) {
                const link = rowArray[y].addLink(
                  (this.posteMap.get(colArray[x]) as Poste)
                    .articlePostNode as Node
                )
                link.setData<number>('weight', w)
              }
            }
          }
        }

        fileReader.readAsArrayBuffer(f)
      }
    }
  }

  // @vuese
  // Load a machine/machine matrix from xlsx format from a client file
  loadPostePosteMatrix (event: Event) {
    if (event != null && event.target != null) {
      const f: File = ((event.target as HTMLInputElement).files as FileList)[0]
      if (f != null) {
        if (this.postPostGraph !== null) {
          this.articlePostGraph = null
          this.articlePostMatrix = null
          this.posteMap = new Map<string, Poste>()
        }

        const order = GraphUtils.genOrderGraph()
        this.postPostGraph = order.graph

        let array: any
        const fileReader = new FileReader()
        fileReader.onload = e => {
          array = fileReader.result
          const data = new Uint8Array(array)
          var arr = []
          for (let i = 0; i !== data.length; ++i) {
            arr[i] = String.fromCharCode(data[i])
          }
          const wb = XLSX.read(arr.join(''), {
            type: 'binary',
            cellStyles: true
          })

          const sheet = wb.Sheets[wb.SheetNames[0]]
          console.log(sheet.B2)

          console.log(sheet)
          const nameOf: { (x: number, y: number): string } = (x, y) => {
            return XLSX.utils.encode_cell({ c: x, r: y })
          }

          let value = sheet[nameOf(1, 0)]
          let i = 1
          const colArray = new Array<string>('name')
          const rowArray = new Array<string>('name')
          while (value !== undefined) {
            colArray.push(value.v)
            let poste: Poste | null = null
            if (!this.posteMap.has(value.v)) {
              this.posteMap.set(value.v, new Poste(value.v))
            }
            poste = this.posteMap.get(value.v) as Poste
            if (this.postPostGraph !== null) {
              const node = new Node().setData<string>('name', value.v) as Node
              this.postPostGraph.addNode(node)
              poste.postPostNode = node
            }
            i++
            value = sheet[nameOf(i, 0)]
          }

          i = 1
          value = sheet[nameOf(0, 1)]
          while (value !== undefined) {
            // colArray.push(value.v)
            rowArray.push(value.v)
            console.log(value.v)

            let poste: Poste | null = null
            if (!this.posteMap.has(value.v)) {
              this.posteMap.set(value.v, new Poste(value.v))
            }
            poste = this.posteMap.get(value.v) as Poste
            if (poste.postPostNode === null && this.postPostGraph !== null) {
              const node = new Node().setData<string>('name', value.v) as Node
              this.postPostGraph.addNode(node)
              poste.postPostNode = node
            }
            i++
            value = sheet[nameOf(0, i)]
          }

          for (let x = 1; x < colArray.length; x++) {
            for (let y = 1; y < rowArray.length; y++) {
              const value = sheet[nameOf(x, y)]
              const w = value ? +value.v : 0
              if (w > 0) {
                const link = ((this.posteMap.get(rowArray[y]) as Poste)
                  .postPostNode as Node).addLink(
                  (this.posteMap.get(colArray[x]) as Poste).postPostNode as Node
                )
                link.setData<number>('weight', w)
              }
            }
          }
          const nbNode = this.posteMap.size
          const xSpread = nbNode * 60
          const xOffset = -xSpread / 2

          let linkCount = 0

          order.graph.setData<number>('fasScore', 0)
          order.graph.foreachNode(n => {
            n.foreachLink(l => {
              linkCount++
              if (l.getDataOrDefault<boolean>('goBack', false)) {
                order.graph.setData<number>(
                  'fasScore',
                  order.graph.getData<number>('fasScore') +
                    l.getDataOrDefault<number>('weight', 1)
                )
              }
            })
          })

          GraphUtils.orderAlgo(
            order.graph,
            nbNode,
            xSpread,
            xOffset,
            linkCount / nbNode
          )
          ;(this.graphViewer as RoutingGraphViewer).setGraph(order.displayGraph)
        }

        fileReader.readAsArrayBuffer(f)
      }
    }
  }

  // @vuese
  // Load a routing file from xlsx format from a client file
  loadRoutingFile (event: Event) {
    console.log('file uploaded')
    if (event != null && event.target != null) {
      const f: File = ((event.target as HTMLInputElement).files as FileList)[0]
      if (f != null) {
        let array: any
        const fileReader = new FileReader()
        fileReader.onload = e => {
          array = fileReader.result
          const data = new Uint8Array(array)
          var arr = []
          for (let i = 0; i !== data.length; ++i) {
            arr[i] = String.fromCharCode(data[i])
          }
          const wb = XLSX.read(arr.join(''), { type: 'binary' })

          this.loadRoutingXLSX(wb)
        }

        fileReader.readAsArrayBuffer(f)
      }
    }
  }

  // @vuese
  // Load routing worksheet to the routing analysis session
  loadRoutingXLSX (wb: XLSX.WorkBook) {
    const searchSheet = (source: string, name: string) => {
      return source.includes(name) && source.includes('data')
    }

    // console.log(wb)

    const itemSheet =
      wb.Sheets[
        wb.SheetNames.find(value => {
          return searchSheet(value.toLowerCase(), 'item')
        }) as string
      ]
    const posteSheet =
      wb.Sheets[
        wb.SheetNames.find(value => {
          return searchSheet(value.toLowerCase(), 'poste')
        }) as string
      ]
    const routingSheet =
      wb.Sheets[
        wb.SheetNames.find(value => {
          return searchSheet(value.toLowerCase(), 'gamme')
        }) as string
      ]

    // console.log(routingSheet)
    const nameOf: { (x: number, y: number): string } = (x, y) => {
      return XLSX.utils.encode_cell({ c: x, r: y })
    }

    const itemRefMap = new Map<string, string>()
    const posteRefMap = new Map<string, string>()

    let i = 1
    while (itemSheet[nameOf(0, i)] !== undefined) {
      itemRefMap.set(itemSheet[nameOf(0, i)].v, itemSheet[nameOf(1, i)].v)
      i++
    }
    i = 1
    while (posteSheet[nameOf(0, i)] !== undefined) {
      posteRefMap.set(posteSheet[nameOf(0, i)].v, posteSheet[nameOf(1, i)].v)
      i++
    }

    let phaseValue = +routingSheet[nameOf(1, 1)].v
    let row = 1
    let nodeValue = routingSheet[nameOf(2, 1)].v

    if (nodeValue === undefined) return
    const posteMap = new Map<string, Node>()
    const posteMapforArticle = new Map<string, Node>()
    const articleMap = new Map<string, Node>()

    const orderGraph = GraphUtils.genOrderGraph()
    this.postPostGraph = orderGraph.graph
    this.articlePostGraph = new Graph()

    posteMap.set(
      nodeValue,
      orderGraph.graph.addNode(
        new Node().setData<string>(
          'name',
          posteRefMap.get(nodeValue) as string
        ) as Node
      )
    )

    let article = routingSheet[nameOf(0, 1)].v
    articleMap.set(
      article,
      this.articlePostGraph.addNode(
        new Node()
          .setData<string>('name', itemRefMap.get(article) as string)
          .setData<'row' | 'col'>('matCelltype', 'row') as Node
      )
    )
    posteMapforArticle.set(
      nodeValue,
      this.articlePostGraph.addNode(
        new Node()
          .setData<string>('name', posteRefMap.get(nodeValue) as string)
          .setData<'row' | 'col'>('matCelltype', 'col')
          .setData<number>('nbOF', 1)
          .setData<Set<Node>>(
            'articleSet',
            new Set<Node>([articleMap.get(article) as Node])
          ) as Node
      )
    )
    ;(articleMap.get(article) as Node).addLink(
      posteMapforArticle.get(nodeValue) as Node
    )

    do {
      row++
      // console.log(row)
      // console.log(nodeValue + " : " + phaseValue);
      const next = routingSheet[nameOf(2, row)]
      if (next !== undefined) {
        const nextNode = next.v
        const nextPhase = +routingSheet[nameOf(1, row)].v

        const nextArticle = routingSheet[nameOf(0, row)].v
        if (!articleMap.has(nextArticle)) {
          articleMap.set(
            nextArticle,
            this.articlePostGraph.addNode(
              new Node()
                .setData<string>('name', itemRefMap.get(nextArticle) as string)
                .setData<'row' | 'col'>('matCelltype', 'row') as Node
            )
          )
        }
        if (!posteMap.has(nextNode)) {
          // console.log(('add Node : ' + posteRefMap.get(nextNode)) as string)
          posteMap.set(
            nextNode,
            orderGraph.graph.addNode(
              new Node().setData<string>(
                'name',
                posteRefMap.get(nextNode) as string
              ) as Node
            )
          )
          posteMapforArticle.set(
            nextNode,
            this.articlePostGraph.addNode(
              new Node()
                .setData<string>('name', posteRefMap.get(nextNode) as string)
                .setData<'row' | 'col'>('matCelltype', 'col')
                .setData<number>('nbOF', 1)
                .setData<Set<Node>>(
                  'articleSet',
                  new Set<Node>([articleMap.get(nextArticle) as Node])
                ) as Node
            )
          )
        } else {
          const node = posteMapforArticle.get(nextNode) as Node
          node
            .getData<Set<Node>>('articleSet')
            .add(articleMap.get(nextArticle) as Node)
          node.setData<number>('nbOF', node.getData<number>('nbOF') + 1)
        }

        (articleMap.get(nextArticle) as Node).addLink(
          posteMapforArticle.get(nextNode) as Node
        )

        if (article === nextArticle) {
          const n1 = posteMap.get(nodeValue) as Node
          const n2 = posteMap.get(nextNode) as Node
          let link = n1.getLink(n2)
          if (link === undefined) {
            link = n1
              .addLink(n2)
              .setData<Map<string, number>>(
                'articleWeight',
                new Map<string, number>()
              ) as Link
          }
          link.setData<number>(
            'weight',
            link.getDataOrDefault<number>('weight', 0) + 1
          )
          const articleWeightMap = link.getData<Map<string, number>>(
            'articleWeight'
          )
          if (!articleWeightMap.has(nextArticle)) {
            articleWeightMap.set(nextArticle, 0)
          }
          articleWeightMap.set(
            nextArticle,
            (articleWeightMap.get(nextArticle) as number) + 1
          )
        }

        phaseValue = nextPhase
        nodeValue = nextNode
        article = nextArticle
      } else {
        nodeValue = undefined
      }
    } while (nodeValue !== undefined)

    posteMapforArticle.forEach(n => {
      console.log({
        name: n.getData<string>('name'),
        nbOF: n.getData<number>('nbOF'),
        nbArticle: n.getData<Set<Node>>('articleSet').size
      })
    })

    const nbNode = posteMap.size
    const xSpread = nbNode * 60
    const xOffset = -xSpread / 2

    let linkCount = 0

    orderGraph.graph.setData<number>('fasScore', 0)
    orderGraph.graph.foreachNode(n => {
      n.foreachLink(l => {
        linkCount++
        if (l.getDataOrDefault<boolean>('goBack', false)) {
          orderGraph.graph.setData<number>(
            'fasScore',
            orderGraph.graph.getData<number>('fasScore') +
              l.getDataOrDefault<number>('weight', 1)
          )
        }
      })
    })

    GraphUtils.orderAlgo(
      orderGraph.graph,
      nbNode,
      xSpread,
      xOffset,
      linkCount / nbNode
    )
    if (this.graphViewer !== null) {
      this.graphViewer.setGraph(orderGraph.displayGraph)
    }
  }

  private changeMime (xlsx: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = () => {
        const xlsxUri = reader.result as string

        const bstr = atob(xlsxUri.split('base64,')[1])
        let n = bstr.length
        const u8arr = new Uint8Array(n)
        while (n--) u8arr[n] = bstr.charCodeAt(n)

        const f = new File([u8arr], xlsx.name, {
          type: 'application/json;application=virtfac/routing'
        })
        resolve(f)
      }
      reader.onerror = error => {
        reject(error)
      }
      reader.readAsDataURL(xlsx)
    })
  }

  private displayClassifMatrix (
    matrix: Matrix,
    attachedGraph: Graph,
    classifField: string,
    nodeTypeField?: string | undefined
  ) {
    requestAnimationFrame(() => {
      matrix.printMat()

      /*
      const rowNodes = new Array<Node>(matrix.nbRow)
      const colNodes = new Array<Node>(matrix.nbColumn)
      const rowNames = new Array<string>(matrix.nbRow)
      const colNames = new Array<string>(matrix.nbColumn)
      if (nodeTypeField === undefined) {
        attachedGraph.foreachNode(n => {
          colNames[n.getData<number>('index')] = n.getData<string>('name')
          colNodes[n.getData<number>('index')] = n
          rowNames[n.getData<number>('index')] = n.getData<string>('name')
          rowNodes[n.getData<number>('index')] = n
        })
      } else {
        attachedGraph.foreachNode(n => {
          if (n.getData<'row' | 'col'>('matCelltype') === 'col') {
            colNames[n.getData<number>('index')] = n.getData<string>('name')
            colNodes[n.getData<number>('index')] = n
          } else {
            rowNames[n.getData<number>('index')] = n.getData<string>('name')
            rowNodes[n.getData<number>('index')] = n
          }
        })
      }
      console.log(colNames)
      */

      const rowNodeIndexMap = new Map<number, Node>()
      const colNodeIndexMap = new Map<number, Node>()
      if (nodeTypeField === undefined) {
        attachedGraph.foreachNode(n => {
          colNodeIndexMap.set(n.getData<number>('index'), n)
          rowNodeIndexMap.set(n.getData<number>('index'), n)
        })
      } else {
        attachedGraph.foreachNode(n => {
          if (n.getData<'col' | 'row'>(nodeTypeField) === 'col') {
            colNodeIndexMap.set(n.getData<number>('index'), n)
          } else {
            rowNodeIndexMap.set(n.getData<number>('index'), n)
          }
        })
      }
      (this.$refs.matrixViewer as MatrixViewer).setMatrix(
        matrix,
        new Array<string>(matrix.nbRow).fill('').map((v, index) => {
          return (rowNodeIndexMap.get(
            matrix.getRowLabel(index)
          ) as Node).getData<string>('name')
        }),
        new Array<string>(matrix.nbColumn).fill('').map((v, index) => {
          return (colNodeIndexMap.get(
            matrix.getColLabel(index)
          ) as Node).getData<string>('name')
        }),
        v => {
          return v === 0 ? '' : '' + v
        }
      )
      requestAnimationFrame(() => {
        const rnode = (index: number) => {
          return rowNodeIndexMap.get(index) as Node
        }
        const cnode = (index: number) => {
          return colNodeIndexMap.get(index) as Node
        }
        ;(this.$refs.matrixViewer as MatrixViewer).foreachElement(
          (x, y, el) => {
            if (x >= 2 && y >= 2) {
              if (
                rnode(matrix.getRowLabel(y - 2)).getData<number>(
                  classifField
                ) ===
                  cnode(matrix.getColLabel(x - 2)).getData<number>(
                    classifField
                  ) &&
                cnode(matrix.getColLabel(x - 2)).getDataOrDefault<number>(
                  classifField,
                  -1
                ) !== -1
              ) {
                el.style.backgroundColor = cnode(
                  matrix.getColLabel(x - 2)
                ).getData<string>('color')
              } else {
                el.style.backgroundColor = ''
              }
            }
          }
        )
      })
    })
  }
}
</script>
