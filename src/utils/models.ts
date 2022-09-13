import { imageAsset } from '@/utils/defaultData'
/**
 * Models.ts lists all the structures resulting from the API requests
 */

import { min } from 'd3'
import V from './vector'

export interface APIDatabaseField {
  name: string
  type: string
  subtype: string
}

export interface APIDatabaseTable {
  name: string
  type: string
  fields: APIDatabaseField[]
}

export interface APIRequestDocumentation {
  body: APIDatabaseField[]
  inputInfo: string
  outputInfo: string
  params: {
    name: string
    info: string
  }[]
  result: APIDatabaseField[]
}

export interface APIRequest {
  type: string
  path: string
  access: number
  documentation: APIRequestDocumentation
}

export interface APIOdooMenuItem {
  id: number
  name: string
  url: string
  childId: APIOdooMenuItem[]
}

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
  static parseFromString (MIMEString: string | null): APIFileMIME {
    const [media, format, structure] = APIFileMIME.valuesFromString(MIMEString)
    return new APIFileMIME({ media, format, structure })
  }

  // Convert MIME to string
  toString (): string {
    const structure = this.structure != null ? `.${this.structure}` : ''
    const format = this.format != null ? `/${this.format}${structure}` : ''
    return `${this.media}${format}`
  }
}

export class APIFileItem {
  id = 0
  idUserOwner = 0
  idProject = 0
  creationDate = 0
  modificationDate = 0

  name = ''
  color = 0x000000
  tags = '[]'
  fileMIME = new APIFileMIME()
  // formatInfo: FormatInfo

  set mime (mime: string) {
    this.fileMIME = APIFileMIME.parseFromString(mime)
  }

  get mime (): string {
    return this.fileMIME.toString()
  }

  constructor (attributes?: Partial<APIFileItem>) {
    Object.assign(this, attributes)
  }

  // toJSON is automaticaly call by JSON.stringify
  // We need this to add getter mime to JSON
  toJSON (): any {
    const { mime, fileMIME, ...file } = this
    return {
      mime,
      ...file
    }
  }

  getDate (dateValue: number): string {
    const date = new Date(dateValue).toLocaleString().split(', ')
    return (
      date[1] ||
      ''
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

export class APIBoundingBox {
  minCorner: { x: number; y: number; z: number }
  maxCorner: { x: number; y: number; z: number }

  constructor (
    minCorner: { x: number; y: number; z: number },
    maxCorner: { x: number; y: number; z: number }
  ) {
    this.minCorner = minCorner
    this.maxCorner = maxCorner
  }
}

export class APIAsset extends APIFileItem {
  uri = ''
  boundingBox: string = JSON.stringify(
    new APIBoundingBox({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 })
  )

  behaviours = '{}'
  layoutSprite = ''
  picture =
    'data:image/png;base64,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'

  constructor (attributes?: Partial<APIAsset>) {
    super(attributes)
    Object.assign(this, attributes)
    this.mime = this.extractMIMEFromBase64URI()
  }

  extractMIMEFromBase64URI (): string {
    const regexp = /data:(.*);base64,/g
    const result = regexp.exec(this.uri) || [null, null]
    return result[1] || ''
  }
}

export class APIFile extends APIFileItem {
  uri = ''
  constructor (attributes?: Partial<APIFile>) {
    super(attributes)
    Object.assign(this, attributes)
    this.mime = this.extractMIMEFromBase64URI()
  }

  extractMIMEFromBase64URI (): string {
    const regexp = /data:(.*);base64,/g
    const result = regexp.exec(this.uri) || [null, null]
    return result[1] || ''
  }
}

export class APIProfile {
  id = 0
  idUserOwner = 0
  idProject = 0
  creationDate = 0
  modificationDate = 0

  name = ''
  color = 0x000000
  tags = '[]'

  picture = imageAsset
  hairName = ''
  pantName = ''
  shirtName = ''
  headName = ''
  shoesName = ''
  beardName = ''
  hipWidth = 0
  body = 0
  neck = 0
  head = 0
  shoulderWidth = 0
  upperArm = 0
  foreArm = 0
  palm = 0
  upperLeg = 0
  lowerLeg = 0
  heelHeight = 0
  footLength = 0
  femaleFace = 0
  armSize = 0
  breastSize = 0
  bellySize = 0
  lowerBackSize = 0
  hipSize = 0
  buttockSize = 0
  legSize = 0
  skinColor = 0
  hairColor = 0
  beardColor = 0
  eyesColor = 0
  shirtColor1 = 0
  shirtColor2 = 0
  shirtColor3 = 0
  shirtColor4 = 0
  shirtColor5 = 0
  pantsColor1 = 0
  pantsColor2 = 0
  pantsColor3 = 0
  pantsColor4 = 0
  pantsColor5 = 0
  shoesColor1 = 0
  shoesColor2 = 0
  shoesColor3 = 0

  constructor (attributes?: Partial<APIFileItem>) {
    Object.assign(this, attributes)
  }

  getDate (dateValue: number): string {
    const date = new Date(dateValue).toLocaleString().split(', ')
    return (
      date[1] ||
      ''
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
