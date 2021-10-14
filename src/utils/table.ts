/**
 * The Cell class is used to structure Table data in a unique format
 * (Cells are not stored in the Table class, it is just a class
 * instantiated when we want to access Table data)
 */
// export class Cell {
//   value : (string | number | null) = null
//   rowLabel: string | number | null = ''
//   columnLabel: string | number | null = ''
//   constructor (
//     value: string | number | null,
//     rowLabel: string | number | null,
//     columnLabel: string | number | null
//   ) {
//     this.value = value
//     this.rowLabel = rowLabel
//     this.columnLabel = columnLabel
//   }
// }

/**
 * Class and method interface to define filter (used to categorize the data)
 */
interface FilterMethod {
  (row: (string | number | null)[]): boolean;
}
export class Filter {
  name = ''
  method: FilterMethod = () => false
  constructor (name: string, method: FilterMethod) {
    this.name = name
    this.method = method
  }
}

/**
 * The Table class is used to access, filter and categorize tables of values
 */
export default class Table {
  public name = 'default'
  private data : (string | number | null)[][] = []
  private rowLabelList: (string | number | null)[] = []
  private columnLabelList : (string | number | null)[] = []
  private rowNumber = 0
  private columnNumber = 0

  /**
   * Create Table instance
   * @param name Name of table
   * @param worksheet XLSX worksheet
   */
  constructor (name: string | null) {
    this.reset(name)
  }

  /**
   * Reset all data of table
   */
  reset (name: string | null): void {
    this.name = name || this.name
    this.data = []
    this.rowLabelList = []
    this.columnLabelList = []
    this.rowNumber = 0
    this.columnNumber = 0
  }

  /**
   * Set value by its position
   * @param rowIndex index of row
   * @param columnIndex index of columnIndex
   * @param value new value of cell
   */
  setValue (rowIndex:number, columnIndex:number, value: string | number | null): void {
    this.data[rowIndex] == null && (this.data[rowIndex] = [])
    this.data[rowIndex][columnIndex] = value
    if (this.rowNumber < rowIndex + 1) {
      this.rowNumber = rowIndex + 1
    }
    if (this.columnNumber < columnIndex + 1) {
      this.columnNumber = columnIndex + 1
    }
  }

  /**
   * Get cell value from its position
   * @param rowIndex index of row
   * @param columnIndex index of column
   * @returns cell object containing value, and row / column labels
   */
  getValue (rowIndex:number, columnIndex:number): string | number | null {
    const value = this.data[rowIndex] == null ? null : this.data[rowIndex][columnIndex]
    return value == null ? null : value
  }

  /**
   * Get row cells list
   * @param rowIndex index of row
   * @returns row values in list
   */
  getRow (rowIndex: number): (string | number | null)[] {
    return [...Array(this.columnNumber)].map((_, columnIndex) =>
      this.getValue(rowIndex, columnIndex)
    )
  }

  /**
   * Get column cells list
   * @param columnIndex index of column
   * @returns column values in list
   */
  getColumn (columnIndex: number): (string | number | null)[] {
    return [...Array(this.rowNumber)].map((_, rowIndex) =>
      this.getValue(rowIndex, columnIndex)
    )
  }

  /**
   * Set an entire row
   * @param rowIndex index of row
   * @param row row to set
   */
  setRow (rowIndex: number, row: (string | number | null)[]): void {
    for (let columnIndex = 0; columnIndex < row.length; columnIndex++) {
      this.setValue(rowIndex, columnIndex, row[columnIndex])
    }
  }

  /**
   * Set an entire column
   * @param columnIndex index of column
   * @param column column to set
   */
  setColumn (columnIndex: number, column: (string | number | null)[]): void {
    for (let rowIndex = 0; rowIndex < column.length; rowIndex++) {
      this.setValue(rowIndex, columnIndex, column[rowIndex])
    }
  }

  /**
   * Remove entire row
   * @param rowIndex index of row
   */
  removeRow (rowIndex: number): void {
    if (rowIndex >= 0 && rowIndex < this.rowNumber) {
      this.data.splice(rowIndex, 1)
      this.rowNumber -= 1
      this.rowLabelList.splice(rowIndex, 1)
    }
  }

  /**
   * Remove entire column
   * @param columnIndex index of column
   */
  removeColumn (columnIndex: number): void {
    if (columnIndex >= 0 && columnIndex < this.columnNumber) {
      this.data.forEach((_, rowIndex) => {
        this.data[rowIndex].splice(columnIndex, 1)
      })
      this.columnNumber -= 1
      this.columnLabelList.splice(columnIndex, 1)
    }
  }

  /**
   * Insert row at the end of array
   * @param row row to push
   */
  pushRow (row: (string | number | null)[]): void {
    this.setRow(this.rowNumber, row)
  }

  /**
   * Insert column at the end of array
   * @param column column to push
   */
  pushColumn (column: (string | number | null)[]): void {
    this.setColumn(this.columnNumber, column)
  }

  /**
   * Set row as rowLabelList and remove row from data
   * @param rowIndex index of row
   */
  setRowAsLabelList (rowIndex: number): void {
    this.rowLabelList = this.getRow(rowIndex)
    this.data.splice(rowIndex, 1)
    this.columnLabelList.length > 0 && this.columnLabelList.splice(rowIndex, 1)
  }

  /**
   * Set column as columnLabelList and remove column from data
   * @param columnIndex index of column
   */
  setColumnAsLabelList (columnIndex: number): void {
    this.columnLabelList = this.getColumn(columnIndex)
    this.data.map(row => row && row.splice(columnIndex, 1))
    this.rowLabelList.length > 0 && this.rowLabelList.splice(columnIndex, 1)
  }

  /**
   * Calculate the number of rows and columns of the
   * table according to its content
   */
  computeSize () : void {
    this.rowNumber = this.data.length
    this.columnNumber = 0
    this.data.forEach(row => {
      this.columnNumber = Math.max(this.columnNumber, row.length)
    })
  }

  /**
   * Removes values that are not validated by the filter.
   * The remaining values are separated into subtables.
   * @param filter Filter to filter to keep or not a value
   * @param rowDirection the direction of the split (true for a row split, false for a column split)
   * @returns the result of the filtering, separated into different tables
   */
  private splitDataByFilter (filter : Filter, rowDirection: boolean): Table[] {
    const tableList : Table[] = []
    let currentTable : Table | null = null
    const maxIndex = rowDirection ? this.rowNumber : this.columnNumber
    for (let dataIndex = 0; dataIndex < maxIndex; dataIndex++) {
      const data = rowDirection ? this.getRow(dataIndex) : this.getColumn(dataIndex)
      if (filter.method(data)) {
        if (currentTable == null) {
          currentTable = new Table(this.name + '_' + tableList.length)
          tableList.push(currentTable)
        }
        currentTable.pushRow(data)
      } else {
        if (currentTable != null) {
          currentTable.computeSize()
        }
        currentTable = null
      }
    }
    return tableList
  }

  /**
   * Removes rows that are not validated by the filter.
   * The remaining rows are separated into subtables.
   * @param filter Filter to filter to keep or not a row
   * @returns the result of the filtering, separated into different tables
   */
  splitRowsByFilter (filter: Filter): Table[] {
    return this.splitDataByFilter(filter, true)
  }

  /**
   * Removes columns that are not validated by the filter.
   * The remaining columns are separated into subtables.
   * @param filter Filter to filter to keep or not a row
   * @returns the result of the filtering, separated into different tables
   */
  splitColumnByFilter (filter: Filter): Table[] {
    return this.splitDataByFilter(filter, false)
  }

  /**
   * Categorize data according to several filter functions
   * @param filterList list of filter
   * @param rowDirection the direction of the split (true for a row split, false for a column split)
   * @returns return list of table for each categories
   */
  private splitDataByCategory (filterList : Filter[], rowDirection: boolean): Table[] {
    const maxIndex = rowDirection ? this.rowNumber : this.columnNumber
    return filterList.map(filter => {
      const table = new Table(filter.name)
      for (let dataIndex = 0; dataIndex < maxIndex; dataIndex++) {
        const data = rowDirection ? this.getRow(dataIndex) : this.getColumn(dataIndex)
        if (filter.method(data)) {
          rowDirection ? table.pushRow(data) : table.pushColumn(data)
        }
      }
      table.data = this.data.filter(row => filter.method(row))
      return table
    })
  }

  /**
   * Categorize rows according to several filter functions
   * @param filterList list of filter
   * @returns return list of table for each categories
   */
  splitRowsByCategory (filterList : Filter[]): Table[] {
    return this.splitDataByCategory(filterList, true)
  }

  /**
   * Categorize columns according to several filter functions
   * @param filterList list of filter
   * @returns return list of table for each categories
   */
  splitColumnsByCategory (filterList : Filter[]): Table[] {
    return this.splitDataByCategory(filterList, false)
  }
}
