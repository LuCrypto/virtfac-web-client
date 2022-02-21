/**
 * Models.ts lists all the structures resulting from the API requests
 */

import { FORMAT_TYPE, FORMAT_INFO, FormatInfo } from '@/utils/format'

export class APIFileMIME {
  media: string | null = null
  format: string | null = null
  structure: string | null = null

  constructor (attributes?: Partial<APIFileMIME>) {
    Object.assign(this, attributes)
  }

  get structureString (): string {
    return this.structure ? this.structure : '?'
  }

  get formatStructure (): string {
    return `${this.format ? this.format : '?'} / ${
      this.structure ? this.structure : '?'
    }`
  }

  // Convert string to media / format / structure format
  static valuesFromString (
    MIMEString: string | null
  ): [string | null, string | null, string | null] {
    if (!MIMEString) {
      return [null, null, null]
    }
    const split = MIMEString.split('/')
    const [media, tail] = [split.shift(), split.join('/').split('.')]
    const [format, structure] = [tail.shift(), tail.join('.')]
    return [media || null, format || null, structure || null]
  }

  // Create new MIME from string
  static parseFromString (MIMEString: string | null) {
    const [media, format, structure] = APIFileMIME.valuesFromString(MIMEString)
    return new APIFileMIME({ media, format, structure })
  }
}

export class APIFileItem {
  name = ''
  creationDate = 0
  id = 0
  idGroup = 0
  modificationDate = 0
  tags = '[]'
  mime = ''
  fileMIME = new APIFileMIME()
  // formatInfo: FormatInfo

  constructor (attributes?: Partial<APIFileItem>) {
    Object.assign(this, attributes)
    this.fileMIME = APIFileMIME.parseFromString(this.mime)

    // const formatKey = Object.keys(FORMAT_TYPE)[Math.floor(Math.random() * 4)]
    // const formatType = formatKey as FORMAT_TYPE
    // this.formatInfo = FORMAT_INFO[formatType]
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

export class APIFile extends APIFileItem {
  content = ''
  constructor (attributes?: Partial<APIFile>) {
    super(attributes)
    Object.assign(this, attributes)
  }
}
