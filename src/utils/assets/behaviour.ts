import { Group, Triangle } from 'three'
import { APIAsset, APIBoundingBox } from '../models'

export class UiDataField {
  inputType: 'boolean' | 'string' | 'number' | 'object' | 'none' = 'none'
  label = ''
  childs: UiDataField[] | null = null
  onChange: {
    (
      data: Record<string, unknown>,
      value: boolean | string | number | Group
    ): void
  }

  constructor (
    label: string,
    inputType: 'boolean' | 'string' | 'number' | 'object' | 'none',
    onChange: {
      (
        data: Record<string, unknown>,
        value: boolean | string | number | Group
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

export class BehaviourInstance {
  public name: string
  public data: unknown = undefined

  constructor (name: string, data?: unknown) {
    this.name = name
    this.data = data
  }
}

export class Behaviour {
  public name = ''
  public ui: UiDataField[] | null = null
  public mdiIcon = ''
  public defaultValues: { (asset: APIAsset): unknown } | null = null

  constructor (
    name: string,
    mdiIcon: string,
    ui: UiDataField[] | null,
    defaultValues: { (asset: APIAsset): unknown } | null
  ) {
    this.name = name
    this.ui = ui
    this.mdiIcon = mdiIcon
    this.defaultValues = defaultValues
  }

  public createBehaviourInstance (asset?: APIAsset): BehaviourInstance {
    if (asset === undefined) return new BehaviourInstance(this.name)
    else {
      return new BehaviourInstance(
        this.name,
        this.defaultValues ? this.defaultValues(asset) : undefined
      )
    }
  }

  public static behaviours: Map<string, Behaviour> = new Map<string, Behaviour>(
    [
      [
        'Wall/Window',
        new Behaviour(
          'Wall/Window',
          'mdi-window-closed-variant',
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
        )
      ],
      [
        'Wall/Door',
        new Behaviour(
          'Wall/Door',
          'mdi-door-closed',
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
      ],
      [
        'Test',
        new Behaviour(
          'Test',
          'mdi-test-tube',
          [
            new UiDataField('string', 'string', (data, value) => {
              data.string = value
            }),
            new UiDataField('number', 'number', (data, value) => {
              data.number = value
            }),
            new UiDataField('boolean', 'boolean', (data, value) => {
              data.boolean = value
            }),
            new UiDataField('object', 'object', (data, value) => {
              data.object = value
            })
          ],
          asset => {
            return { string: '', number: 0, boolean: false, object: null }
          }
        )
      ]
    ]
  )
}
