<template>
  <v-card elevation="3" height="700" class="d-flex flex-row">
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
    <v-container style="width: auto; margin: 0; flex-grow: 1; padding: 0px">
      <routing-graph-viewer ref="graphViewer"></routing-graph-viewer>
    </v-container>
    <input
      ref="loadGammeFile"
      type="file"
      accept=".xls"
      hidden
      @change="loadGammeFile"
    />
    <pop-up ref="filePopUp">
      <open-file
        @close="$refs.filePopUp.close()"
        application="ALL"
        :singleSelect="true"
        :openFile="true"
        @fileInput="handleFile"
      ></open-file>
    </pop-up>
    <pop-up ref="matrixEditor">
      <matrix-viewer ref="matrixViewer"></matrix-viewer>
    </pop-up>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import ActionContainer from '@/components/ActionContainer.vue'
import OpenFile from '@/components/OpenFile.vue'
import * as XLSX from 'ts-xlsx'
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

@Component({
  name: 'RoutingAnalysisComponent',
  components: {
    RoutingGraphViewer,
    OpenFile,
    PopUp,
    MatrixViewer
  }
})
// @vuese
// @group COMPONENTS
export default class RoutingAnalysisComponent extends Vue {
  selectedMenuItem = -1
  actionContainer: ActionContainer | null = null
  menuCollapse = false
  menuItemList: MenuItem[] = []

  graphViewer: RoutingGraphViewer | null = null

  postPostGraph: Graph | null = null
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
      new MenuItem('Open Gamme File', 'mdi-file-document', () => {
        (this.$refs.loadGammeFile as HTMLInputElement).click()
      }),
      new MenuItem('Remove feedback link', 'mdi-file-document', () => {
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
      new MenuItem('Show transitive link', 'mdi-file-document', () => {
        if (this.postPostGraph !== null) {
          const transitiveSet = GraphUtils.getTransitiveLinks(
            this.postPostGraph
          )
          const linkMap = this.postPostGraph.getData<Map<Link, Array<Node>>>(
            'attachedNodes'
          )
          transitiveSet.forEach(l => {
            (linkMap.get(l) as Array<Node>).forEach(n => {
              n.foreachLink(displayedLink => {
                displayedLink.setData<string>('stroke-dasharray', '5')
                displayedLink.setData<string>('color', '#F1C40F')
              })
            })
          })
        }
      }),
      new MenuItem('Remove transitive link', 'mdi-file-document', () => {
        if (this.postPostGraph !== null) {
          const transitiveSet = GraphUtils.getTransitiveLinks(
            this.postPostGraph
          )
          transitiveSet.forEach(l => {
            l.getOriginNode().removeLink(l.getNode())
          })
        }
      }),
      new MenuItem('Level layout', 'mdi-file-document', () => {
        if (this.postPostGraph !== null && this.graphViewer !== null) {
          const nbLevel = GraphUtils.computeLevels(this.postPostGraph, 'level')
          /*
          const nodeArray = new Array<number>(nbLevel)
          for (let i = 0; i < nbLevel; i++) {
            nodeArray[i] = 0
          }
          this.postPostGraph.foreachNode(n => {
            const level = n.getData<number>('level')
            nodeArray[level]++
            n.getData<Vec2>('position').x = level * 100
            n.getData<Vec2>('position').y = nodeArray[level] * 200
          })
          this.postPostGraph.foreachNode(n => {
            n.foreachLink(l => {
              l.setData<boolean>('visible', true)
            })
          })
          this.graphViewer.setGraph(this.postPostGraph)
          */
          GraphLayout.levelLayout(
            this.postPostGraph,
            'level',
            'position',
            100,
            200
          )
          this.postPostGraph.foreachNode(n => {
            n.foreachLink(l => {
              l.setData<boolean>('visible', true)
            })
          })
          this.graphViewer.setGraph(this.postPostGraph)
        }
      }),
      new MenuItem('Classification Article/Poste', 'mdi-file-document', () => {
        if (this.articlePostGraph !== null) {
          if (this.articlePostMatrix === null) {
            this.articlePostMatrix = MatrixUtils.matrixFromBipartiGraph(
              this.articlePostGraph,
              'matCelltype',
              'index'
            )
          }
          const classif = MatrixUtils.blockDiagonalisation(
            this.articlePostMatrix
          )
          this.articlePostMatrix.printMat()

          const colorMap = new Map<string, string>()
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

          this.articlePostGraph.foreachNode(n => {
            if (n.getData<'row' | 'col'>('matCelltype') === 'col') {
              const group = classif.colAssignment.get(
                n.getData<number>('index')
              ) as number
              if (group === -1) {
                colorMap.set(n.getData<string>('name'), notAssignedColor)
              } else {
                colorMap.set(
                  n.getData<string>('name'),
                  colArray[group % colArray.length]
                )
              }
            }
          })

          if (this.postPostGraph !== null) {
            this.postPostGraph.foreachNode(n => {
              const color = colorMap.get(n.getData<string>('name'))
              if (color !== undefined) {
                n.setData<string>('color', color)
              }
            })
          }

          if (this.graphViewer !== null) {
            this.graphViewer.setGraph(this.postPostGraph)
          }
        }
      }),
      new MenuItem('Classification Poste/Poste', 'mdi-file-document', () => {
        if (this.postPostGraph !== null) {
          const m = MatrixUtils.matrixFromGraph(this.postPostGraph, 'index')
          m.printMat()
          const classif = MatrixUtils.symetricBlockDiagonalisation(m)
          m.printMat()

          const colorMap = new Map<string, string>()
          const colArray: string[] = [
            '#9B59B6',
            '#2980B9',
            '#A93226',
            '#6C3483',
            '#1F618D',
            '#117A65'
          ]
          const notAssignedColor = '#f5a406'

          this.postPostGraph.foreachNode(n => {
            if (n.getData<'row' | 'col'>('matCelltype') === 'col') {
              const group = classif.assigns.get(
                n.getData<number>('index')
              ) as number
              if (group === -1) {
                colorMap.set(n.getData<string>('name'), notAssignedColor)
              } else {
                colorMap.set(
                  n.getData<string>('name'),
                  colArray[group % colArray.length]
                )
              }
            }
          })

          if (this.postPostGraph !== null) {
            this.postPostGraph.foreachNode(n => {
              const color = colorMap.get(n.getData<string>('name'))
              if (color !== undefined) {
                n.setData<string>('color', color)
              }
            })
          }

          if (this.graphViewer !== null) {
            this.graphViewer.setGraph(this.postPostGraph)
          }
        }
      }),
      new MenuItem('Show matrix', 'mdi-file-document', () => {
        (this.$refs.matrixEditor as PopUp).open()
        requestAnimationFrame(() => {
          if (this.articlePostGraph !== null) {
            if (this.articlePostMatrix === null) {
              this.articlePostMatrix = MatrixUtils.matrixFromBipartiGraph(
                this.articlePostGraph,
                'matCelltype',
                'index'
              )
            }
            const rowNames = new Array<string>(this.articlePostMatrix.nbRow)
            const colNames = new Array<string>(this.articlePostMatrix.nbColumn)
            this.articlePostGraph.foreachNode(n => {
              if (n.getData<'row' | 'col'>('matCelltype') === 'col') {
                colNames[n.getData<number>('index')] = n.getData<string>('name')
              } else {
                rowNames[n.getData<number>('index')] = n.getData<string>('name')
              }
            })
            ;(this.$refs.matrixViewer as MatrixViewer).setMatrix(
              this.articlePostMatrix,
              rowNames,
              colNames,
              v => {
                return v === 0 ? '' : '' + v
              }
            )
          }
        })
      })
    )
  }

  inputFile (): void {
    const input = this.$refs.inputFile as HTMLInputElement
    input.value = ''
    input.click()
  }

  handleFile (file: File | null): void {
    if (file == null) {
      console.log('This type of file cannot be read yet.')
    } else {
      const reader = new FileReader()
      const name = file.name
      reader.onload = e => {
        if (e == null || e.target == null) {
          console.error('Cannot read file...')
          return
        }
        var data = e.target.result
        var workbook = XLSX.read(data, { type: 'binary' })
        console.log(
          'Excel File = ',
          name,
          workbook,
          JSON.stringify(workbook.Sheets[workbook.SheetNames[0]])
        )
        // const mapper = new Mapper(workbook.Sheets[workbook.SheetNames[0]])
      }
      reader.readAsBinaryString(file)
    }
  }

  selectSheetPopUp (workbook: Record<string, unknown>): void {
    console.log(workbook)
    // this.$refs.excel.active = true;
    // console.log(workbook);
  }

  loadGammeFile (event: Event) {
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

          const sheet: XLSX.IWorkSheet = wb.Sheets[wb.SheetNames[0]]

          console.log(sheet)
          const nameOf: { (x: number, y: number): string } = (x, y) => {
            return XLSX.utils.encode_cell({ c: x, r: y })
          }

          let phaseValue = +sheet[nameOf(2, 1)].v
          let row = 1
          let nodeValue = sheet[nameOf(1, 1)].v

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
              new Node().setData<string>('name', nodeValue) as Node
            )
          )
          posteMapforArticle.set(
            nodeValue,
            this.articlePostGraph.addNode(
              new Node()
                .setData<string>('name', nodeValue)
                .setData<'row' | 'col'>('matCelltype', 'col') as Node
            )
          )
          console.log(nodeValue)

          const article = sheet[nameOf(0, 1)].v
          articleMap.set(
            article,
            this.articlePostGraph.addNode(
              new Node()
                .setData<string>('name', article)
                .setData<'row' | 'col'>('matCelltype', 'row') as Node
            )
          )
          ;(articleMap.get(article) as Node).addLink(
            posteMapforArticle.get(nodeValue) as Node
          )

          do {
            row++
            // console.log(nodeValue + " : " + phaseValue);
            const next = sheet[nameOf(1, row)]
            if (next !== undefined) {
              const nextNode = next.v
              const nextPhase = +sheet[nameOf(2, row)].v
              if (!posteMap.has(nextNode)) {
                console.log('add Node : ' + nextNode)
                posteMap.set(
                  nextNode,
                  orderGraph.graph.addNode(
                    new Node().setData<string>('name', nextNode) as Node
                  )
                )
                posteMapforArticle.set(
                  nextNode,
                  this.articlePostGraph.addNode(
                    new Node()
                      .setData<string>('name', nextNode)
                      .setData<'row' | 'col'>('matCelltype', 'col') as Node
                  )
                )
              }
              const nextArticle = sheet[nameOf(0, row)].v
              if (!articleMap.has(nextArticle)) {
                articleMap.set(
                  nextArticle,
                  this.articlePostGraph.addNode(
                    new Node()
                      .setData<string>('name', nextArticle)
                      .setData<'row' | 'col'>('matCelltype', 'row') as Node
                  )
                )
              }
              (articleMap.get(nextArticle) as Node).addLink(
                posteMapforArticle.get(nextNode) as Node
              )

              if (nextPhase > phaseValue) {
                const n1 = posteMap.get(nodeValue) as Node
                const n2 = posteMap.get(nextNode) as Node
                let link = n1.getLink(n2)
                if (link === undefined) {
                  link = n1.addLink(n2)
                }
                link.setData<number>(
                  'weight',
                  link.getDataOrDefault<number>('weight', 0) + 1
                )
              } else {
                // console.log('link ignored')
              }

              phaseValue = nextPhase
              nodeValue = nextNode
            } else {
              nodeValue = undefined
            }
          } while (nodeValue !== undefined)

          console.log(posteMap.get('P6'))
          console.log('loading ' + posteMap.size + ' postes')
          console.log('out')
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

        fileReader.readAsArrayBuffer(f)
      }
    }
  }
}
</script>
