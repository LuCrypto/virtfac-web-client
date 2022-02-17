/**
 * Models.ts lists all the structures resulting from the API requests
 */

import { FORMAT_TYPE, FORMAT_INFO, FormatInfo } from '@/utils/format'

export class APIFileItem {
  name = ''
  creationDate = 0
  id = 0
  idGroup = 0
  modificationDate = 0
  tags = '[]'
  formatInfo: FormatInfo

  constructor (attributes?: Partial<APIFileItem>) {
    Object.assign(this, attributes)
    const formatKey = Object.keys(FORMAT_TYPE)[Math.floor(Math.random() * 4)]
    const formatType = formatKey as FORMAT_TYPE
    this.formatInfo = FORMAT_INFO[formatType]
  }

  getDate (dateValue: number): string {
    const date = new Date(dateValue).toLocaleString().split(', ')
    return (
      date[1]
        .split(':')
        .slice(0, -1)
        .join(':') +
      ' ' +
      date[0]
    )
  }

  getModificationDate (): string {
    return this.getDate(this.modificationDate)
  }

  getCreationDate (): string {
    return this.getDate(this.creationDate)
  }

  getName (): string {
    return this.name
      .split('.')
      .slice(0, -1)
      .join('.')
  }

  getExtention (): string {
    return this.name.replace(this.getName(), '')
  }

  getTags (): string[] {
    return this.tags.split(',')
  }
}

export class APIGroupItem {
  id = 0
  idUserOwner = 0
  name = 'unnamed'
  idUser = 0
  idGroup = 0
  isManager = 0

  constructor (attributes?: Partial<APIGroupItem>) {
    Object.assign(this, attributes)
  }
}
