import { APIAsset, APIBoundingBox } from '../models'

export class UiDataField {
  inputType: 'boolean' | 'string' | 'number' | 'object' | 'none' = 'none'
  label = ''
  childs: UiDataField[] | null = null
  onChange: {
    (
      data: Record<string, unknown>,
      value: boolean | string | number | object
    ): void
  }

  constructor (
    label: string,
    inputType: 'boolean' | 'string' | 'number' | 'object' | 'none',
    onChange: {
      (
        data: Record<string, unknown>,
        value: boolean | string | number | object
      ): void
    },
    childs: UiDataField[] | null = null
  ) {
    this.inputType = inputType
    this.label = label
    this.onChange = onChange
    this.childs = childs
  }
}

export class Behaviour {
  public name = ''
  public ui: UiDataField[] | null = null
  public defaultValues: { (asset: APIAsset): unknown } | null = null

  constructor (
    name: string,
    ui: UiDataField[] | null,
    defaultValues: { (asset: APIAsset): unknown } | null
  ) {
    this.name = name
    this.ui = ui
    this.defaultValues = defaultValues
  }

  public static behaviours: Behaviour[] = [
    new Behaviour(
      'Wall/Window',
      [
        new UiDataField('width', 'number', (data, value) => {
          data.width = value
        }),
        new UiDataField('top', 'number', (data, value) => {
          data.top = value
        }),
        new UiDataField('bottom', 'number', (data, value) => {
          data.bottom = value
        })
      ],
      asset => {
        const boundingBox = JSON.parse(asset.boundingBox) as APIBoundingBox
        return {
          width: boundingBox.maxCorner.x - boundingBox.minCorner.x,
          top: boundingBox.maxCorner.y,
          bottom: boundingBox.minCorner.y
        }
      }
    ),
    new Behaviour(
      'Wall/Door',
      [
        new UiDataField('width', 'number', (data, value) => {
          data.width = value
        }),
        new UiDataField('top', 'number', (data, value) => {
          data.top = value
        })
      ],
      asset => {
        const boundingBox = JSON.parse(asset.boundingBox) as APIBoundingBox
        return {
          width: boundingBox.maxCorner.x - boundingBox.minCorner.x,
          top: boundingBox.maxCorner.y
        }
      }
    )
  ]
}
