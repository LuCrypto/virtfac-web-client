<template>
  <v-card elevation="5" class="format-preview mx-auto mt-5" style="padding: 5px; background-color: rgba(255,255,255,0.1);" width="400px">
    <div v-for="rowIndex in shapeList.length" :key="rowIndex" class="d-flex">
      <div
        v-for="columnIndex in shapeList[0].length"
        :key="columnIndex"
        :ref="(rowIndex - 1) + '_' + (columnIndex - 1)"
        class="flex-grow-1" style="margin:5px;"
      >
        <div style="width: 20px; height: 4px; margin: 15px auto; background-color: black; border-radius: 10px;"></div>
      </div>
    </div>
  </v-card>
</template>

<script  lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

@Component
export default class FormatPreview extends Vue {
  @Prop({ default: () => 'aaaaa aaaaa aaaaa aaaaa aaaaa aaaaa' }) private shapes!: string
  @Prop({ default: () => '_____ _____ _____ _____ _____ _____' }) private colors!: string

  shapeList : string[] = []
  colorList : string[] = []

  created (): void {
    this.updateShapeAndColorList()
  }

  mounted (): void {
    this.updateDom()
  }

  getShape (rowIndex: number, columnIndex: number): string {
    return rowIndex >= 0 && rowIndex < this.shapeList.length
      ? this.shapeList[rowIndex].charAt(columnIndex) : ''
  }

  getColor (rowIndex: number, columnIndex: number): string {
    const colors = [
      'rgba(  0,   0,   0, 0)', // _: transparent
      'rgba(255,   0,   0, 0.5)', // r: red
      'rgba(255, 128,   0, 0.5)', // o: orange
      'rgba(255, 255,   0, 0.6)', // y: yellow
      'rgba(  0, 255,   0, 0.4)', // g: green
      'rgba(  0, 255, 255, 0.5)', // c: cyan
      'rgba(  0,   0, 255, 0.5)', // b: blue
      'rgba(128,   0, 255, 0.5)', // p: purple
      'rgba(255,   0, 255, 0.5)', // k: pink
      'rgba(127, 127, 127, 0.5)' // m: middle grey
    ]
    const color = rowIndex >= 0 && rowIndex < this.colorList.length
      ? this.colorList[rowIndex].charAt(columnIndex) || '_' : '_'
    return colors[Math.max(0, ('_roygcbpkm').indexOf(color))]
  }

  getMargin (value: string, rowIndex: number, columnIndex: number): number[] {
    const size = 5
    const marginTop = value !== this.getShape(rowIndex - 1, columnIndex) ? size : 0
    const marginRight = value !== this.getShape(rowIndex, columnIndex + 1) ? size : 0
    const marginBottom = value !== this.getShape(rowIndex + 1, columnIndex) ? size : 0
    const marginLeft = value !== this.getShape(rowIndex, columnIndex - 1) ? size : 0
    return [marginTop, marginRight, marginBottom, marginLeft]
  }

  getPadding (value: string, rowIndex: number, columnIndex: number): number[] {
    const size = 5
    const paddingTop = value === this.getShape(rowIndex - 1, columnIndex) ? size : 0
    const paddingRight = value === this.getShape(rowIndex, columnIndex + 1) ? size : 0
    const paddingBottom = value === this.getShape(rowIndex + 1, columnIndex) ? size : 0
    const paddingLeft = value === this.getShape(rowIndex, columnIndex - 1) ? size : 0
    return [paddingTop, paddingRight, paddingBottom, paddingLeft]
  }

  getBorderRadius (margin: number[]): number[] {
    const size = 4
    const radiusTopLeft = margin[0] && margin[3] ? size : 0
    const radiusTopRight = margin[0] && margin[1] ? size : 0
    const radiusBottomRight = margin[2] && margin[1] ? size : 0
    const radiusBottomLeft = margin[2] && margin[3] ? size : 0
    return [radiusTopLeft, radiusTopRight, radiusBottomRight, radiusBottomLeft]
  }

  convertAttributeToStyle (
    value:string,
    margin:number[],
    padding:number[],
    borderRadius:number[],
    color:string
  ):string {
    return [
      `margin: ${margin.map(size => size + 'px').join(' ')} !important`,
      `padding: ${padding.map(size => size + 'px').join(' ')} !important`,
      `border-radius: ${borderRadius.map(size => size + 'px').join(' ')} !important`,
      `opacity: ${value === '_' ? '0' : '1'}`,
      `background-color: ${color} !important`
    ].join(';')
  }

  updateShapeAndColorList (): void {
    this.shapeList = this.shapes.split(' ')
    this.colorList = this.colors.split(' ')
  }

  updateDom ():void {
    this.updateShapeAndColorList()
    this.shapeList.forEach((row, rowIndex) => {
      row.split('').forEach((_, columnIndex) => {
        const dom = this.$refs[rowIndex + '_' + columnIndex] as HTMLElement[]
        const value = this.getShape(rowIndex, columnIndex)
        const margin = this.getMargin(value, rowIndex, columnIndex)
        const padding = this.getPadding(value, rowIndex, columnIndex)
        const borderRadius = this.getBorderRadius(margin)
        const color = this.getColor(rowIndex, columnIndex)

        dom[0].setAttribute('style', this.convertAttributeToStyle(
          value,
          margin,
          padding,
          borderRadius,
          color
        ))
      })
    })
  }

  @Watch('shapes')
  onShapesChanged (shapes:string):void {
    this.shapes = shapes
    this.updateDom()
  }

  @Watch('Colors')
  onColorsChanged (colors:string):void {
    this.colors = colors
    this.updateDom()
  }
}
</script>
<style lang="scss">
.format-preview {
  * {
    transition-duration: 0.2s;
  }
}
</style>
