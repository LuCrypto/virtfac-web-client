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

  public getRowLabel (row: number) {
    this.checkRow(row)
    return this.data[row][this._nbCol]
  }

  public getColLabel (col: number) {
    this.checkCol(col)
    return this.data[this._nbRow][col]
  }

  public reorderRows (positions: Array<number>) {
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

  public reorderColumns (positions: Array<number>) {
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

  public multScalar (scalar: number) {
    for (let i = 0; i < this.nbRow; i++) {
      for (let j = 0; j < this.nbColumn; j++) {
        this.data[i][j] *= scalar
      }
    }
  }

  public maxValue () {
    let m = this.data[0][0]
    for (let i = 0; i < this.nbRow; i++) {
      for (let j = 0; j < this.nbColumn; j++) {
        if (m < this.data[i][j]) m = this.data[i][j]
      }
    }
    return m
  }

  public minValue () {
    let m = this.data[0][0]
    for (let i = 0; i < this.nbRow; i++) {
      for (let j = 0; j < this.nbColumn; j++) {
        if (m > this.data[i][j]) m = this.data[i][j]
      }
    }
    return m
  }

  public genBlocDiagonal (colGroups: Array<number>, rowGroups: Array<number>) {
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

  public findIndexInRow (
    row: number,
    predicate: { (value: number, index: number, data: Array<number>): boolean }
  ) {
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

  public static groupColConcordance (
    a: Matrix,
    rowGroups: Map<number, number>,
    colGroups: Map<number, number>,
    alpha: number,
    col: number
  ) {
    const beta = 1 - alpha
    let sum = 0
    for (let i = 0; i < a.nbRow; i++) {
      sum +=
        (alpha * a.get(i, col) - beta * (1 - a.get(i, col))) *
        ((rowGroups.get(i) as number) === (colGroups.get(col) as number)
          ? (rowGroups.get(i) as number) === -1
            ? 0
            : 1
          : 0)
    }
    return sum
  }

  public static groupRowConcordance (
    a: Matrix,
    rowGroups: Map<number, number>,
    colGroups: Map<number, number>,
    alpha: number,
    row: number
  ) {
    const beta = 1 - alpha
    let sum = 0
    for (let j = 0; j < a.nbColumn; j++) {
      sum +=
        (alpha * a.get(row, j) - beta * (1 - a.get(row, j))) *
        ((rowGroups.get(row) as number) === (colGroups.get(j) as number)
          ? (rowGroups.get(row) as number) === -1
            ? 0
            : 1
          : 0)
    }
    return sum
  }

  public static blockDiagonalisation (a: Matrix, alpha = 0.5): number {
    const colGroups = new Map<number, number>()
    // colGroups.push(1)
    const rowGroups = new Map<number, number>()

    let nbGroups = 0

    for (let i = 0; i < a.nbColumn; i++) {
      colGroups.set(i, -1)
    }

    for (let i = 0; i < a.nbRow; i++) {
      rowGroups.set(i, -1)
    }

    const currentBMatrix = new Matrix(a.nbRow, a.nbColumn)
    // rowGroups.push(1)
    let rindex = 0
    do {
      const r = a.findIndexInRow(rindex, (v, i, d) => {
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

    // main loop
    let modif = false
    do {
      modif = false
      // assign row
      for (let i = 0; i < a.nbRow; i++) {
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
          if (optimalChoice.score < score) {
            optimalChoice.score = score
            optimalChoice.group = -1
            modif = true
          } else {
            rowGroups.set(i, optimalChoice.group)
          }
        }
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
            if (score < optimalChoice.score) {
              colGroups.set(j, -1)
              rowGroups.set(i, optimalChoice.group)
            } else {
              modif = true
              nbGroups++
              break
            }
          }
        }
      }

      // assign col
      for (let j = 0; j < a.nbColumn; j++) {
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
          if (optimalChoice.score < score) {
            optimalChoice.score = score
            optimalChoice.group = -1
            modif = true
          } else {
            colGroups.set(j, optimalChoice.group)
          }
        }
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
            if (score < optimalChoice.score) {
              colGroups.set(j, optimalChoice.group)
              rowGroups.set(i, -1)
            } else {
              modif = true
              nbGroups++
              break
            }
          }
        }
      }
    } while (modif)

    // console.log(MatrixUtils.groupConcordance(a, rowGroups, colGroups, alpha))

    const rgroups = new Array<Array<number>>()
    const cgroups = new Array<Array<number>>()
    for (let i = 0; i < nbGroups + 1; i++) {
      rgroups.push(new Array<number>())
      cgroups.push(new Array<number>())
    }

    rowGroups.forEach((value, key) => {
      if (value === -1) {
        rgroups[nbGroups].push(key)
      } else {
        rgroups[value].push(key)
      }
    })

    colGroups.forEach((value, key) => {
      if (value === -1) {
        cgroups[nbGroups].push(key)
      } else {
        cgroups[value].push(key)
      }
    })

    const v = MatrixUtils.groupConcordance(a, rowGroups, colGroups, alpha)
    const rg = new Array<number>()
    const cg = new Array<number>()
    for (let i = 0; i < nbGroups + 1; i++) {
      Array.prototype.push.apply(rg, rgroups[i])
      Array.prototype.push.apply(cg, cgroups[i])
    }
    a.reorderRows(rg)
    a.reorderColumns(cg)
    return v
  }

  public static mainTest (alpha = -1) {
    if (alpha === -1) alpha = 0.9
    // const m = new Matrix(randInt(50, 100), randInt(30, 50))
    const m = new Matrix(200, 200)
    const nbfamilly = randInt(0, Math.min(m.nbRow, m.nbColumn) / 2)
    const cGroup = []
    const rGroup = []
    cGroup.push(randInt(1, m.nbColumn - nbfamilly))
    rGroup.push(randInt(1, m.nbRow - nbfamilly))
    for (let i = 1; i < nbfamilly; i++) {
      cGroup.push(randInt(cGroup[i - 1] + 1, m.nbColumn - nbfamilly + i))
      rGroup.push(randInt(rGroup[i - 1] + 1, m.nbRow - nbfamilly + i))
    }
    // m.genBlocDiagonal(cGroup, rGroup)
    const b = m.clone()
    // m.set(1, m.nbColumn - 1, 2)
    for (let i = 0; i < m.nbRow; i++) {
      for (let j = 0; j < m.nbColumn; j++) {
        if (randFloat(0, 1) < 0.2) {
          m.set(i, j, randInt(0, 5))
        }
      }
    }
    m.printMat()
    const maxV = m.maxValue()
    m.multScalar(1 / maxV)
    const initScore = MatrixUtils.concordance(m, m, alpha)

    for (let i = 0; i < m.nbRow; i++) {
      m.switchRows(randInt(0, m.nbRow - 1), randInt(0, m.nbRow - 1))
    }
    for (let j = 0; j < m.nbColumn; j++) {
      m.switchCols(randInt(0, m.nbColumn - 1), randInt(0, m.nbColumn - 1))
    }

    const r = this.blockDiagonalisation(m, alpha)
    m.multScalar(maxV)
    m.printMat()

    console.log({
      initScore: initScore,
      resultScore: r
    })
    return {
      initScore: initScore,
      resultScore: this.blockDiagonalisation(m, alpha)
    }
  }

  public static statTest () {
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
}
