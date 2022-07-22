<template>
  <v-card style="overflow:auto">
    <v-container ref="matrixContainer" :style="{ width: this.nbCol * 50 }">
      <v-row no-gutters v-for="i in nbRow" :key="i">
        <v-col
          v-for="j in nbCol"
          :key="j"
          :id="`${i}-${j}`"
          class="matCell"
          @mouseenter="onMouseOver"
        >
          {{ data[i - 1][j - 1] }}
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script lang="ts">
import { Matrix } from '@/utils/matrixUtils'
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
  name: 'MatrixViewer'
})
// @vuese
// @group COMPONENTS
// Component to display a matrix
export default class MatrixViewer extends Vue {
  private matrix: Matrix | null = null

  private nbCol = 0
  private nbRow = 0
  /*
    private get nbCol () : number {
        if (this.matrix === null) return 0
        return this.matrix.nbColumn
    }

    private get nbRow () : number {
        if (this.matrix === null) return 0
        return this.matrix.nbRow
    }
    */

  private data = new Array<Array<string>>(['names'])
  private dataStyle = new Array<Array<string>>([''])

  // @vuese
  // set the matrix to display
  public setMatrix (
    matrix: Matrix,
    rowNames: Array<string>,
    colNames: Array<string>,
    display?: { (matValue: number): string } | undefined
  ) {
    this.matrix = matrix
    this.nbCol = matrix.nbColumn + 1
    this.nbRow = matrix.nbRow + 1

    this.data = new Array<Array<string>>()
    this.dataStyle = new Array<Array<string>>()

    this.data.push(['names'])
    for (let i = 0; i < matrix.nbColumn; i++) {
      this.data[0].push(colNames[i])
    }

    for (let i = 0; i < matrix.nbRow; i++) {
      this.data.push([rowNames[i]])
      for (let j = 0; j < matrix.nbColumn; j++) {
        if (display === undefined) {
          this.data[i + 1].push('' + matrix.get(i, j))
        } else {
          this.data[i + 1].push(display(matrix.get(i, j)))
        }
      }
    }

    (this.$refs.matrixContainer as HTMLElement).style.minWidth = `${this
      .nbCol * 60}px`
    console.log(this.data)
  }

  private oldOveredCoord: Array<number> | null = null

  public onMouseOver (event: MouseEvent) {
    if ((event.relatedTarget as HTMLElement) === null) return
    const coord = (event.target as HTMLElement).id.split('-').map(v => {
      return +v
    })
    if (this.oldOveredCoord !== null) {
      for (let i = 1; i <= this.nbRow; i++) {
        (document.getElementById(
          i + '-' + this.oldOveredCoord[1]
        ) as HTMLElement).classList.remove('highlight')
      }

      for (let i = 1; i <= this.nbCol; i++) {
        (document.getElementById(
          this.oldOveredCoord[0] + '-' + i
        ) as HTMLElement).classList.remove('highlight')
      }
    }
    if (coord[0] > 1 && coord[1] > 1) {
      for (let i = 1; i <= this.nbRow; i++) {
        (document.getElementById(
          i + '-' + coord[1]
        ) as HTMLElement).classList.add('highlight')
      }

      for (let i = 1; i <= this.nbCol; i++) {
        (document.getElementById(
          coord[0] + '-' + i
        ) as HTMLElement).classList.add('highlight')
      }
      this.oldOveredCoord = coord
    } else {
      this.oldOveredCoord = null
    }
  }

  // @vuese
  // loop through html elements of the matrix
  public foreachElement (func: {
    (x: number, y: number, element: HTMLElement): void
  }) {
    for (let i = 1; i <= this.nbRow; i++) {
      for (let j = 1; j <= this.nbCol; j++) {
        func(j, i, document.getElementById(i + '-' + j) as HTMLElement)
      }
    }
  }
}
</script>

<style scoped>
.matCell {
  min-width: 50px;
  text-align: center;
}
.highlight {
  background-color: rgba(117, 117, 117, 0.3);
}
</style>
