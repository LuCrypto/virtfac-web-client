import { Graph } from '@/utils/graph/graph'
import { Node } from '@/utils/graph/node'
import { randFloat, randInt } from 'three/src/math/MathUtils'

export class Matrix {
  private data = new Array<Array<number>>()

  private _nbCol: number
  private _nbRow: number

  public get nbColumn (): number {
    return this._nbCol
  }

  public get nbRow (): number {
    return this._nbRow
  }

  /**
   * check if the index of the row is valid
   * @param row
   */
  private checkRow (row: number) {
    if (row < 0 || row >= this._nbRow) {
      throw new Error(
        'invalid matrix row : ' +
          JSON.stringify({
            row: row,
            nbRow: this.nbRow
          })
      )
    }
  }

  /**
   * check if the index of the column is valid
   * @param col
   */
  private checkCol (col: number) {
    if (col < 0 || col >= this._nbCol) {
      throw new Error(
        'invalid matrix col : ' +
          JSON.stringify({
            col: col,
            nbCol: this._nbCol
          })
      )
    }
  }

  public get (row: number, col: number): number {
    this.checkRow(row)
    this.checkCol(col)
    return this.data[row][col]
  }

  public set (row: number, col: number, value: number): void {
    this.checkRow(row)
    this.checkCol(col)
    this.data[row][col] = value
  }

  /**
   * default : index of the row at the creation of the matrix
   * @param row
   * @returns label of row
   */
  public getRowLabel (row: number): number {
    this.checkRow(row)
    return this.data[row][this._nbCol]
  }

  public setRowLabel (row: number, value: number): void {
    this.checkRow(row)
    this.data[row][this._nbCol] = value
  }

  /**
   * default : index of the col at the creation of the matrix
   * @param col
   * @returns label of column
   */
  public getColLabel (col: number): number {
    this.checkCol(col)
    return this.data[this._nbRow][col]
  }

  public setColLabel (col: number, value: number): void {
    this.checkCol(col)
    this.data[this._nbRow][col] = value
  }

  /**
   * reassign position of each rows
   * @param positions
   */
  public reorderRows (positions: Array<number>): void {
    if (positions.length !== this.nbRow) {
      throw new Error('positions needs to place all rows')
    }
    const tmp = this.clone()
    for (let i = 0; i < positions.length; i++) {
      for (let j = 0; j < this.nbColumn + 1; j++) {
        this.data[i][j] = tmp.data[positions[i]][j]
      }
    }
  }

  /**
   * reassign position of each column
   * @param positions
   */
  public reorderColumns (positions: Array<number>): void {
    if (positions.length !== this.nbColumn) {
      throw new Error('positions needs to place all columns')
    }
    const tmp = this.clone()
    for (let j = 0; j < positions.length; j++) {
      for (let i = 0; i < this.nbRow + 1; i++) {
        this.data[i][j] = tmp.data[i][positions[j]]
      }
    }
  }

  public switchRows (row1: number, row2: number): void {
    this.checkRow(row1)
    this.checkRow(row2)
    const tmpR = this.data[row1]
    this.data[row1] = this.data[row2]
    this.data[row2] = tmpR
  }

  public switchCols (col1: number, col2: number): void {
    this.checkCol(col1)
    this.checkCol(col2)
    this.data.forEach(row => {
      const tmp = row[col1]
      row[col1] = row[col2]
      row[col2] = tmp
    })
  }

  public moveRow (row: number, newPos: number): void {
    this.checkRow(row)
    this.checkRow(newPos)
    this.data.splice(row > newPos ? newPos : newPos + 1, 0, this.data[row])
    this.data.splice(row > newPos ? row + 1 : row, 1)
  }

  public moveCol (col: number, newPos: number): void {
    this.checkCol(col)
    this.checkCol(newPos)
    this.data.forEach(row => {
      row.splice(col > newPos ? newPos : newPos + 1, 0, row[col])
      row.splice(col > newPos ? col + 1 : col, 1)
    })
  }

  public multScalar (scalar: number): void {
    for (let i = 0; i < this.nbRow; i++) {
      for (let j = 0; j < this.nbColumn; j++) {
        this.data[i][j] *= scalar
      }
    }
  }

  public maxValue (): number {
    let m = this.data[0][0]
    for (let i = 0; i < this.nbRow; i++) {
      for (let j = 0; j < this.nbColumn; j++) {
        if (m < this.data[i][j]) m = this.data[i][j]
      }
    }
    return m
  }

  public minValue (): number {
    let m = this.data[0][0]
    for (let i = 0; i < this.nbRow; i++) {
      for (let j = 0; j < this.nbColumn; j++) {
        if (m > this.data[i][j]) m = this.data[i][j]
      }
    }
    return m
  }

  public genBlocDiagonal (
    colGroups: Array<number>,
    rowGroups: Array<number>
  ): void {
    let rowGroupIndex = 0
    for (let i = 0; i < this._nbRow; i++) {
      if (rowGroupIndex < rowGroups.length && rowGroups[rowGroupIndex] === i) {
        rowGroupIndex++
      }
      // const arr = this.data[i]
      let colGroupIndex = 0
      for (let j = 0; j < this._nbCol; j++) {
        if (
          colGroupIndex < colGroups.length &&
          colGroups[colGroupIndex] === j
        ) {
          colGroupIndex++
        }
        this.set(
          i,
          j,
          colGroupIndex === rowGroupIndex &&
            colGroupIndex < colGroups.length &&
            rowGroupIndex < rowGroups.length
            ? 1
            : 0
        )
      }
    }
  }

  /**
   * finds the first column that meets the condition of the predicate
   * @param row
   * @param predicate
   * @returns
   */
  public findIndexInRow (
    row: number,
    predicate: { (value: number, index: number, data: Array<number>): boolean }
  ): number {
    const c = this.data[row].findIndex(predicate)
    return c < this._nbCol ? c : -1
  }

  constructor (nbRow: number, nbColumn: number, defaultValue = 0) {
    this._nbCol = nbColumn
    this._nbRow = nbRow
    for (let i = 0; i < nbRow + 1; i++) {
      this.data.push(new Array<number>())
      for (let j = 0; j < nbColumn; j++) {
        this.data[i].push(defaultValue)
      }
      this.data[i].push(i)
    }
    for (let j = 0; j < nbColumn; j++) {
      this.data[this.nbRow][j] = j
    }
  }

  public clone (): Matrix {
    const m = new Matrix(this.nbRow, this.nbColumn)
    for (let i = 0; i < this._nbRow + 1; i++) {
      for (let j = 0; j < this._nbCol + 1; j++) {
        m.data[i][j] = this.data[i][j]
      }
    }
    return m
  }

  public printMat (): void {
    let str = 'nbRow:' + this._nbRow + ' nbCol:' + this._nbCol
    for (let i = 0; i < this.nbRow + 1; i++) {
      const row = this.data[i]
      str += '\n['
      for (let j = 0; j < this.nbColumn; j++) {
        str += Math.round(row[j]) + ', '
      }
      str = str.slice(0, -2)
      str += ']' + (i < this.nbRow ? ' r:' + this.getRowLabel(i) : ' <= c')
    }

    console.log(str.replaceAll('0', ' '))
  }
}

export class MatrixUtils {
  public static concordance (a: Matrix, b: Matrix, alpha: number): number {
    const beta = 1 - alpha
    let sum = 0
    for (let i = 0; i < a.nbRow; i++) {
      for (let j = 0; j < a.nbColumn; j++) {
        sum += (alpha * a.get(i, j) - beta * (1 - a.get(i, j))) * b.get(i, j)
      }
    }
    return sum
  }

  public static groupConcordance (
    a: Matrix,
    rowGroups: Map<number, number>,
    colGroups: Map<number, number>,
    alpha: number
  ): number {
    const beta = 1 - alpha
    let sum = 0
    for (let i = 0; i < a.nbRow; i++) {
      for (let j = 0; j < a.nbColumn; j++) {
        sum +=
          (alpha * a.get(i, j) - beta * (1 - a.get(i, j))) *
          ((rowGroups.get(i) as number) === (colGroups.get(j) as number)
            ? (rowGroups.get(i) as number) === -1
              ? 0
              : 1
            : 0)
      }
    }
    return sum
  }

  /**
   * return the concordance score of a column
   * @param a matrix
   * @param rowGroups map that assign row to groups
   * @param colGroups map that assign column to groups
   * @param alpha impact on the score of missing 1 and correct 1 (between 0 and 1 : 0 => only decrease with missing 1, 1 => only grow with correct 1)
   * @param col index of computed column
   * @returns
   */
  public static groupColConcordance (
    a: Matrix,
    rowGroups: Map<number, number>,
    colGroups: Map<number, number>,
    alpha: number,
    col: number
  ): number {
    const beta = 1 - alpha
    let sum = 0
    for (let i = 0; i < a.nbRow; i++) {
      if (
        (rowGroups.get(i) as number) === (colGroups.get(col) as number) &&
        (rowGroups.get(i) as number) !== -1
      ) {
        sum += alpha * a.get(i, col) - beta * (1 - a.get(i, col))
      }
    }
    return sum
  }

  /**
   * return the concordance score of a row
   * @param a matrix
   * @param rowGroups map that assign row to groups
   * @param colGroups map that assign column to groups
   * @param alpha impact on the score of missing 1 and correct 1 (between 0 and 1 : 0 => only decrease with missing 1, 1 => only grow with correct 1)
   * @param row index of computed row
   * @returns
   */
  public static groupRowConcordance (
    a: Matrix,
    rowGroups: Map<number, number>,
    colGroups: Map<number, number>,
    alpha: number,
    row: number
  ): number {
    const beta = 1 - alpha
    let sum = 0
    for (let j = 0; j < a.nbColumn; j++) {
      if (
        (rowGroups.get(row) as number) === (colGroups.get(j) as number) &&
        (rowGroups.get(row) as number) !== -1
      ) {
        sum += alpha * a.get(row, j) - beta * (1 - a.get(row, j))
      }
    }
    return sum
  }

  public static symetricBlockDiagonalisation (
    a: Matrix,
    alpha = 0.5
  ): { score: number; assigns: Map<number, number> } {
    const bestGroups = new Map<number, number>()

    let nbGroups = 0

    // rowGroups.push(1)
    let rindex = 0
    do {
      const r = a.findIndexInRow(rindex, v => {
        return v !== 0
      })
      // console.log(r, rindex)
      if (r === -1) {
        rindex++
      } else {
        a.moveRow(rindex, 0)
        a.moveCol(r, 0)
        rindex = -1
      }
    } while (rindex !== -1 && rindex < a.nbRow)

    let nbLoops = 0
    let oldScore = 0

    for (let l = 0; l < 10; l++) {
      const groups = new Map<number, number>()
      // init group attribution to collector for all cols and rows
      const order = new Array<number>()

      for (let i = 0; i < a.nbColumn; i++) {
        groups.set(i, -1)
        order.splice(Math.trunc(Math.random() * order.length), 0, i)
      }

      // main loop
      let modif = false
      do {
        modif = false
        // assign row
        order.forEach(i => {
          const optimalChoice = {
            score:
              MatrixUtils.groupRowConcordance(a, groups, groups, alpha, i) +
              MatrixUtils.groupColConcordance(a, groups, groups, alpha, i),
            group: groups.get(i) as number
          }
          {
            // to collector
            groups.set(i, -1)
            const score =
              MatrixUtils.groupRowConcordance(a, groups, groups, alpha, i) +
              MatrixUtils.groupColConcordance(a, groups, groups, alpha, i)
            if (optimalChoice.score <= score) {
              optimalChoice.score = score
              optimalChoice.group = -1
              if (optimalChoice.score < score) modif = true
            } else {
              groups.set(i, optimalChoice.group)
            }
          }
          // search best group
          for (let g = 0; g < nbGroups; g++) {
            groups.set(i, g)
            const score =
              MatrixUtils.groupRowConcordance(a, groups, groups, alpha, i) +
              MatrixUtils.groupColConcordance(a, groups, groups, alpha, i)
            if (score > optimalChoice.score) {
              optimalChoice.score = score
              optimalChoice.group = g
              modif = true
            } else {
              groups.set(i, optimalChoice.group)
            }
          }

          // create new group
          const g = nbGroups
          groups.set(i, g)
          const score =
            MatrixUtils.groupRowConcordance(a, groups, groups, alpha, i) +
            MatrixUtils.groupColConcordance(a, groups, groups, alpha, i)
          if (score <= optimalChoice.score) {
            groups.set(i, optimalChoice.group)
          } else {
            modif = true
            nbGroups++
          }
        })

        nbLoops++
      } while (modif)

      const score = MatrixUtils.groupConcordance(a, groups, groups, alpha)
      if (score > oldScore) {
        bestGroups.clear()

        groups.forEach((value, key) => {
          bestGroups.set(key, value)
        })
        oldScore = score
      }
    }

    const rgroups = new Array<Array<number>>()
    for (let i = 0; i < nbGroups + 1; i++) {
      rgroups.push(new Array<number>())
    }

    bestGroups.forEach((value, key) => {
      if (value === -1) {
        rgroups[nbGroups].push(key)
      } else {
        rgroups[value].push(key)
      }
    })

    // const v = MatrixUtils.groupConcordance(a, rowGroups, colGroups, alpha)
    const rg = new Array<number>()
    for (let i = 0; i < nbGroups + 1; i++) {
      Array.prototype.push.apply(rg, rgroups[i])
    }
    a.reorderRows(rg)
    a.reorderColumns(rg)

    return { score: 0, assigns: bestGroups }
  }

  public static blockDiagonalisation (
    a: Matrix,
    alpha = 0.5
  ): {
    score: number
    rowAssignment: Map<number, number>
    colAssignment: Map<number, number>
  } {
    const bestColGroups = new Map<number, number>()
    const bestRowGroups = new Map<number, number>()

    let nbGroups = 0

    // rowGroups.push(1)
    let rindex = 0
    do {
      const r = a.findIndexInRow(rindex, v => {
        return v !== 0
      })
      // console.log(r, rindex)
      if (r === -1) {
        rindex++
      } else {
        a.moveRow(rindex, 0)
        a.moveCol(r, 0)
        rindex = -1
      }
    } while (rindex !== -1 && rindex < a.nbRow)

    let nbLoops = 0
    let oldScore = 0

    for (let l = 0; l < 10; l++) {
      const colGroups = new Map<number, number>()
      const rowGroups = new Map<number, number>()
      // init group attribution to collector for all cols and rows
      const rowOrder = new Array<number>()
      const colOrder = new Array<number>()

      for (let i = 0; i < a.nbColumn; i++) {
        colGroups.set(i, -1)
        colOrder.splice(Math.trunc(Math.random() * colOrder.length), 0, i)
      }

      for (let i = 0; i < a.nbRow; i++) {
        rowGroups.set(i, -1)
        rowOrder.splice(Math.trunc(Math.random() * rowOrder.length), 0, i)
      }

      // main loop
      let modif = false
      do {
        modif = false
        // assign row
        rowOrder.forEach(i => {
          const optimalChoice = {
            score: MatrixUtils.groupRowConcordance(
              a,
              rowGroups,
              colGroups,
              alpha,
              i
            ),
            group: rowGroups.get(i) as number
          }
          {
            // to collector
            rowGroups.set(i, -1)
            const score = MatrixUtils.groupRowConcordance(
              a,
              rowGroups,
              colGroups,
              alpha,
              i
            )
            if (optimalChoice.score <= score) {
              optimalChoice.score = score
              optimalChoice.group = -1
              if (optimalChoice.score < score) modif = true
            } else {
              rowGroups.set(i, optimalChoice.group)
            }
          }
          // search best group
          for (let g = 0; g < nbGroups; g++) {
            rowGroups.set(i, g)
            const score = MatrixUtils.groupRowConcordance(
              a,
              rowGroups,
              colGroups,
              alpha,
              i
            )
            if (score > optimalChoice.score) {
              optimalChoice.score = score
              optimalChoice.group = g
              modif = true
            } else {
              rowGroups.set(i, optimalChoice.group)
            }
          }

          // create new group
          const g = nbGroups
          for (let j = 0; j < a.nbColumn; j++) {
            const v = a.get(i, j)
            if (v !== 0 && (colGroups.get(j) as number) === -1) {
              rowGroups.set(i, g)
              colGroups.set(j, g)
              const score = MatrixUtils.groupRowConcordance(
                a,
                rowGroups,
                colGroups,
                alpha,
                i
              )
              if (score <= optimalChoice.score) {
                colGroups.set(j, -1)
                rowGroups.set(i, optimalChoice.group)
              } else {
                modif = true
                nbGroups++
                break
              }
            }
          }
        })

        // assign col
        colOrder.forEach(j => {
          const optimalChoice = {
            score: MatrixUtils.groupColConcordance(
              a,
              rowGroups,
              colGroups,
              alpha,
              j
            ),
            group: colGroups.get(j) as number
          }
          {
            // to collector
            colGroups.set(j, -1)
            const score = MatrixUtils.groupColConcordance(
              a,
              rowGroups,
              colGroups,
              alpha,
              j
            )
            if (optimalChoice.score <= score) {
              optimalChoice.score = score
              optimalChoice.group = -1
              if (optimalChoice.score < score) modif = true
            } else {
              colGroups.set(j, optimalChoice.group)
            }
          }
          // search best group
          for (let g = 0; g < nbGroups; g++) {
            colGroups.set(j, g)
            const score = MatrixUtils.groupColConcordance(
              a,
              rowGroups,
              colGroups,
              alpha,
              j
            )
            if (score > optimalChoice.score) {
              optimalChoice.score = score
              optimalChoice.group = g
              modif = true
            } else {
              colGroups.set(j, optimalChoice.group)
            }
          }

          // create new group
          const g = nbGroups
          for (let i = 0; i < a.nbRow; i++) {
            const v = a.get(i, j)
            if (v !== 0 && (rowGroups.get(i) as number) === -1) {
              rowGroups.set(i, g)
              colGroups.set(j, g)
              const score = MatrixUtils.groupColConcordance(
                a,
                rowGroups,
                colGroups,
                alpha,
                j
              )
              if (score <= optimalChoice.score) {
                colGroups.set(j, optimalChoice.group)
                rowGroups.set(i, -1)
              } else {
                modif = true
                nbGroups++
                break
              }
            }
          }
        })
        nbLoops++
      } while (modif)

      const score = MatrixUtils.groupConcordance(a, rowGroups, colGroups, alpha)
      if (score > oldScore) {
        bestColGroups.clear()
        bestRowGroups.clear()

        colGroups.forEach((value, key) => {
          bestColGroups.set(key, value)
        })
        rowGroups.forEach((value, key) => {
          bestRowGroups.set(key, value)
        })
        oldScore = score
      }
    }

    console.log('nbLoops: ' + nbLoops)
    // console.log(MatrixUtils.groupConcordance(a, rowGroups, colGroups, alpha))

    /*
    bestRowGroups.forEach((value, key) => {
      a.setRowLabel(key, value)
    })

    bestColGroups.forEach((value, key) => {
      a.setColLabel(key, value)
    })
    */

    const rgroups = new Array<Array<number>>()
    const cgroups = new Array<Array<number>>()
    for (let i = 0; i < nbGroups + 1; i++) {
      rgroups.push(new Array<number>())
      cgroups.push(new Array<number>())
    }

    bestRowGroups.forEach((value, key) => {
      if (value === -1) {
        rgroups[nbGroups].push(key)
      } else {
        rgroups[value].push(key)
      }
    })

    bestColGroups.forEach((value, key) => {
      if (value === -1) {
        cgroups[nbGroups].push(key)
      } else {
        cgroups[value].push(key)
      }
    })

    const resRow = new Map<number, number>()
    const resCol = new Map<number, number>()

    const map = new Map<number, number>()
    map.set(-1, -1)

    bestRowGroups.forEach((value, key) => {
      if (!map.has(value)) {
        map.set(value, map.size)
      }
      bestRowGroups.set(key, map.get(value) as number)
      resRow.set(a.getRowLabel(key), map.get(value) as number)
    })
    bestColGroups.forEach((value, key) => {
      if (!map.has(value)) {
        map.set(value, map.size)
      }
      bestColGroups.set(key, map.get(value) as number)
      resCol.set(a.getColLabel(key), map.get(value) as number)
    })

    // const v = MatrixUtils.groupConcordance(a, rowGroups, colGroups, alpha)
    const rg = new Array<number>()
    const cg = new Array<number>()
    for (let i = 0; i < nbGroups + 1; i++) {
      Array.prototype.push.apply(rg, rgroups[i])
      Array.prototype.push.apply(cg, cgroups[i])
    }
    a.reorderRows(rg)
    a.reorderColumns(cg)

    return {
      score: oldScore,
      rowAssignment: resRow,
      colAssignment: resCol
    }
  }

  public static mainTest (
    alpha = -1
  ): { initScore: number; resultScore: number } {
    if (alpha === -1) alpha = 0.5
    // const m = new Matrix(randInt(50, 100), randInt(30, 50))

    let output = ''

    for (let currentTest = 0; currentTest < 1; currentTest++) {
      const startTime = Date.now()
      const m = new Matrix(50, 50)
      const nbfamilly = randInt(0, Math.min(m.nbRow, m.nbColumn) / 2)
      const cGroup = []
      const rGroup = []
      cGroup.push(randInt(1, m.nbColumn - nbfamilly))
      rGroup.push(randInt(1, m.nbRow - nbfamilly))
      for (let i = 1; i < nbfamilly; i++) {
        cGroup.push(randInt(cGroup[i - 1] + 1, m.nbColumn - nbfamilly + i))
        rGroup.push(randInt(rGroup[i - 1] + 1, m.nbRow - nbfamilly + i))
      }
      m.genBlocDiagonal(cGroup, rGroup)
      const z = m.clone()
      // const b = m.clone()
      // m.set(1, m.nbColumn - 1, 2)
      for (let i = 0; i < m.nbRow; i++) {
        for (let j = 0; j < m.nbColumn; j++) {
          if (randFloat(0, 1) < 0.2) {
            m.set(i, j, randInt(0, 1))
          }
        }
      }
      m.printMat()
      const maxV = m.maxValue()
      m.multScalar(1 / maxV)
      const initScore = MatrixUtils.concordance(m, z, alpha)
      // let r = 0
      for (let k = 0; k < 1; k++) {
        const a = m.clone()
        for (let i = 0; i < a.nbRow; i++) {
          a.switchRows(randInt(0, a.nbRow - 1), randInt(0, a.nbRow - 1))
        }
        for (let j = 0; j < m.nbColumn; j++) {
          a.switchCols(randInt(0, a.nbColumn - 1), randInt(0, a.nbColumn - 1))
        }
        a.printMat()

        const r = this.blockDiagonalisation(a, alpha).score
        a.multScalar(maxV)
        a.printMat()

        console.log({
          initScore: initScore,
          resultScore: r,
          duration: Date.now() - startTime
        })
        output += initScore + ';' + r + '\n'
      }
    }

    console.log(output)
    return {
      initScore: 0,
      resultScore: 0
    }
  }

  public static statTest (): void {
    const n = 1
    const pArray = new Array<Promise<void>>()
    for (let alpha = 0.2; alpha <= 1.01; alpha += 0.05) {
      pArray.push(
        new Promise<void>(resolve => {
          let sumDiff = 0
          let sumAbs = 0
          let sumRefAbs = 0
          for (let i = 0; i < n; i++) {
            const res = this.mainTest(alpha)
            sumDiff += res.resultScore - res.initScore
            sumAbs += res.resultScore
            sumRefAbs += res.initScore
          }
          console.log(
            'alpha: ' +
              Math.round(alpha * 100) / 100 +
              ' resultDiff: ' +
              Math.round(sumDiff) / n +
              ' absResult: ' +
              Math.round(sumAbs) / n +
              ' absInit: ' +
              Math.round(sumRefAbs) / n +
              ' ratio: ' +
              Math.round((sumDiff / sumRefAbs) * 100) / 100
          )
          resolve()
        })
      )
    }
    pArray.forEach(p => {
      p.then(() => {
        console.log('end')
      })
    })
  }

  public static matrixFromBipartiGraph (
    graph: Graph,
    cellTypeField: string,
    outputIndexField: string
  ) {
    const rowMap = new Map<Node, number>()
    const colMap = new Map<Node, number>()

    graph.foreachNode(n => {
      if (n.getData<'row' | 'col'>(cellTypeField) === 'row') {
        n.setData<number>(outputIndexField, rowMap.size)
        rowMap.set(n, rowMap.size)
      } else {
        n.setData<number>(outputIndexField, colMap.size)
        colMap.set(n, colMap.size)
      }
    })

    const matrix = new Matrix(rowMap.size, colMap.size, 0)

    rowMap.forEach((row, key) => {
      key.foreachLink(l => {
        const col = colMap.get(l.getNode()) as number
        matrix.set(row, col, 1)
      })
    })
    colMap.forEach((col, key) => {
      key.foreachLink(l => {
        const row = colMap.get(l.getNode()) as number
        matrix.set(row, col, 1)
      })
    })

    return matrix
  }

  public static matrixFromGraph (graph: Graph, outputIndexField: string) {
    const indexMap = new Map<Node, number>()

    graph.foreachNode(n => {
      n.setData<number>(outputIndexField, indexMap.size)
      indexMap.set(n, indexMap.size)
    })

    const matrix = new Matrix(indexMap.size, indexMap.size, 0)

    graph.foreachNode(n => {
      const nIndex = indexMap.get(n) as number
      n.foreachLink(l => {
        const n2Index = indexMap.get(l.getNode()) as number
        matrix.set(nIndex, n2Index, 1)
      })
    })

    return matrix
  }

  public static computeInterclassRatio (
    matrix: Matrix,
    rowClasses: Map<number, number>,
    colClasses: Map<number, number>
  ): number {
    let nbInterclass = 0
    let nbTotal = 0
    for (let i = 0; i < matrix.nbRow; i++) {
      for (let j = 0; j < matrix.nbColumn; j++) {
        const v = matrix.get(i, j)
        if (v !== 0) {
          nbTotal += v
          if (
            (rowClasses.get(matrix.getRowLabel(i)) as number) !==
              (colClasses.get(matrix.getColLabel(j)) as number) ||
            rowClasses.get(matrix.getRowLabel(i)) === -1
          ) {
            nbInterclass += v
          }
        }
      }
    }

    return nbInterclass / nbTotal
  }
}
