import XLSX from 'xlsx'
import Table, { Filter } from '@/utils/table'

/**
* Workbook class is used to parse and process different table
*/
export default class Mapper {
  table : Table = new Table('content')

  constructor (worksheet: XLSX.WorkSheet | null) {
    if (worksheet != null) {
      this.extractXLSXTable(worksheet)
      this.table.setRowAsLabelList(0)
      this.table.setColumnAsLabelList(0)
      console.log('table :', this.table)
      console.log('table row 20 :', this.table.getRow(0))
      console.log('table split by filter :', this.table.splitRowsByFilter(new Filter('EmptyRowsSplit', row => {
        return row == null ? false : row.some(value => value != null)
      })))
      console.log('table split by category :', this.table.splitRowsByCategory([
        new Filter('EmptyRowsSplit', row => {
          return row != null && row.length > 0
        }),
        new Filter('EmptyRowsSplit', row => {
          return row != null && row.length > 0 && typeof row[0] === 'undefined'
        })
      ]
      ))
    }
  }

  /**
    * Convert cell address like "A12" in row and column index
    * @param address : Adress of cell like "A12"
    * @returns : Row and column, for exemple with "A12", this return [11, 0]
    */
  convertCellAdressToIndex (address: string): [number, number] {
    const row = parseInt(address.replace(/[A-Z]/g, '')) - 1
    let column = 0
    address.replace(/[0-9]/g, '').split('').reverse().forEach((l, i) => {
      column += (l.charCodeAt(0) - ('A').charCodeAt(0)) + 26 * i
    })
    return [row, column]
  }

  /**
    * Convert Excel worksheet to Table
    * @param worksheet : Worksheet from XLSX file
    */
  extractXLSXTable (worksheet: XLSX.WorkSheet): void {
    this.table.reset(this.table.name)
    Object.keys(worksheet).forEach(key => {
      if (key.indexOf('!') >= 0) return // Meta info filter
      const [row, column] = this.convertCellAdressToIndex(key)
      this.table.setValue(row, column, worksheet[key].v)
    })
  }
}
