<template>
  <canvas
    class="nodeViewer"
    ref="canvas"
    style="
      width: 100%;
      height:100%;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;"
  >
  </canvas>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { ActionCallbackData } from '@/components/ActionContainer.vue'
import V from '@/utils/vector'
import T from '@/utils/transform'

class ViewerTheme {
  backgroundColor = 'transparent'
  gridColor = 'black'
  nodeColor = 'orange'
  linkColor = 'white'

  constructor (
    backgroundColor: string | null,
    gridColor: string | null,
    nodeColor: string | null,
    linkColor: string | null
  ) {
    if (backgroundColor) {
      this.backgroundColor = backgroundColor
    }
    if (gridColor) {
      this.gridColor = gridColor
    }
    if (nodeColor) {
      this.nodeColor = nodeColor
    }
    if (linkColor) {
      this.linkColor = linkColor
    }
  }
}

@Component({
  name: 'NodeViewer'
})
// @vuese
// @group COMPONENTS
export default class NodeViewer extends Vue {
  context: CanvasRenderingContext2D | null = null
  scale = 1
  transform: T = new T(null, null)
  canvas: HTMLCanvasElement | null = null
  darkTheme: ViewerTheme = new ViewerTheme(null, '#333333', null, '#dddddd')
  lightTheme: ViewerTheme = new ViewerTheme(null, '#dddddd', null, '#333333')
  theme: ViewerTheme = this.darkTheme

  mounted (): void {
    this.canvas = this.$refs.canvas as HTMLCanvasElement
    this.context = this.canvas.getContext('2d')
    this.update(null)
  }

  untransformingV (v: V): V {
    return v.addV(this.transform.position).multN(this.scale)
  }

  unscalingV (v: V): V {
    return v.multN(this.scale)
  }

  unscalingN (n: number): number {
    return n * this.scale
  }

  getTransform (): T {
    let size: V | null = null
    if (this.canvas != null) {
      size = new V(this.canvas.offsetWidth, this.canvas.offsetHeight)
      this.canvas.width = size.x
      this.canvas.height = size.y
    }
    return new T(null, size)
  }

  update (data: ActionCallbackData | null): void {
    if (data == null) {
      this.scale = 1
      this.transform = this.getTransform()
    } else {
      this.scale = data.scale
      this.transform = data.transform
    }
    if (this.canvas != null) {
      this.canvas.width = this.transform.size.x
      this.canvas.height = this.transform.size.y
    }
    this.draw()
  }

  drawPointGrid (): void {
    if (this.context == null) return
    const canvasSize = this.transform.size
    const step = 100 * this.scale
    const min = 20
    const max = 50
    const count = canvasSize.x / step
    if (count < max) {
      if (count >= min) {
        this.context.globalAlpha = 1 - (count - min) / (max - min)
      }
      const gridSize = 2
      const mod = this.untransformingV(new V(null, null)).modN(step)
      this.context.fillStyle = this.theme.gridColor

      for (let i = 0; i < canvasSize.x; i += step) {
        for (let j = 0; j < canvasSize.y; j += step) {
          this.context.fillRect(
            i + mod.x - gridSize / 2,
            j + mod.y - gridSize / 2,
            gridSize,
            gridSize
          )
        }
      }
      this.context.globalAlpha = 1
    }
  }

  drawLineGrid (): void {
    if (this.context == null) return
    const canvasSize = this.transform.size
    const step = 100 * this.scale
    const min = 20
    const max = 50
    const count = canvasSize.x / step
    if (count < max) {
      if (count >= min) {
        this.context.globalAlpha = 1 - (count - min) / (max - min)
      }
      const gridSize = 1
      const mod = this.untransformingV(new V(null, null)).modN(step)
      this.context.fillStyle = this.theme.gridColor

      for (let i = 0; i < Math.max(canvasSize.x, canvasSize.y); i += step) {
        this.context.fillRect(
          0,
          i + mod.y - gridSize / 2,
          canvasSize.x,
          gridSize
        )
        this.context.fillRect(
          i + mod.x - gridSize / 2,
          0,
          gridSize,
          canvasSize.y
        )
      }
      this.context.globalAlpha = 1
    }
  }

  drawRoundedRectangle (transform: T, radius: number): void {
    if (this.context == null) return

    const x = transform.position.x
    const y = transform.position.y
    const sx = transform.size.x
    const sy = transform.size.y
    const r =
      typeof radius !== 'number'
        ? 0
        : Math.max(0, Math.min(radius, Math.min(sx / 2, sy / 2)))
    this.context.beginPath()
    this.context.moveTo(x + r, y)
    this.context.lineTo(x + sx - r, y)
    this.context.quadraticCurveTo(x + sx, y, x + sx, y + r)
    this.context.lineTo(x + sx, y + sy - r)
    this.context.quadraticCurveTo(x + sx, y + sy, x + sx - r, y + sy)
    this.context.lineTo(x + r, y + sy)
    this.context.quadraticCurveTo(x, y + sy, x, y + sy - r)
    this.context.lineTo(x, y + r)
    this.context.quadraticCurveTo(x, y, x + r, y)
    this.context.closePath()
  }

  drawFlowLink (node1: T, node2: T): void {
    if (this.context == null) return

    const t1 = this.untransformingV(node1.position).addV(
      this.unscalingV(node1.size.divN(2))
    )
    const t2 = this.untransformingV(node2.position).addV(
      this.unscalingV(node2.size.divN(2))
    )
    this.context.beginPath()
    this.context.moveTo(t1.x, t1.y)
    this.context.lineTo(t2.x, t2.y)
    this.context.strokeStyle = this.theme.linkColor
    this.context.lineWidth = this.unscalingN(4)
    this.context.stroke()
  }

  drawFlowNode (node: T): void {
    if (this.context == null) return
    this.context.fillStyle = this.theme.nodeColor
    const t = new T(
      this.untransformingV(node.position),
      this.unscalingV(node.size)
    )
    this.drawRoundedRectangle(t, this.unscalingN(10))
    this.context.fill()
  }

  draw (): void {
    if (this.context == null) return

    // console.log(this.$vuetify.theme)

    this.theme = this.$vuetify.theme.dark ? this.darkTheme : this.lightTheme
    this.context.clearRect(0, 0, this.transform.size.x, this.transform.size.y)
    this.drawLineGrid()
    const nodeList: T[] = [
      new T(new V(0, 0), null),
      new T(new V(0, 70), null),
      new T(new V(70, 70), null),
      new T(new V(0, 140), null),
      new T(new V(70, 140), null),
      new T(new V(140, 140), null),
      new T(new V(0, 210), null),
      new T(new V(70, 210), null),
      new T(new V(140, 210), null)
    ]
    const linkList: number[][] = [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 4],
      [2, 5],
      [3, 6],
      [4, 6],
      [4, 7],
      [5, 7],
      [5, 8]
    ]

    linkList.forEach(link =>
      this.drawFlowLink(nodeList[link[0]], nodeList[link[1]])
    )
    nodeList.forEach(node => this.drawFlowNode(node))
  }
}
</script>
