<template>
  <div
    class="actionContainer"
    ref="actionContainer"
    style="width:100%; height:100%;"
    @contextmenu="onContextMenu"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
    @mouseout="onMouseUp"
    @mousemove="onMouseMove"
    @wheel="onMouseWheel"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
    @touchcancel="onTouchEnd"
    @touchmove="onTouchMove"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import T from '@/utils/transform'
import V from '@/utils/vector'

export class ActionCursorEvent {
  last: V | null = null
  new: V | null = null
  start: V | null = null
}

export class ActionTouchEvent {
  last: V[] = []
  new: V[] = []
}

export class ActionBool {
  value: boolean
  name: string
  constructor (value: boolean, name: string) {
    this.value = value
    this.name = name
  }
}

export class ActionBoolManager {
  mouseClick: ActionBool[] = [
    new ActionBool(false, 'action-left-mouse-click'),
    new ActionBool(false, 'action-middle-mouse-click'),
    new ActionBool(false, 'action-right-mouse-click')
  ]

  mouseDrag: ActionBool[] = [
    new ActionBool(false, 'action-left-mouse-drag'),
    new ActionBool(false, 'action-middle-mouse-drag'),
    new ActionBool(false, 'action-right-mouse-drag')
  ]

  mouseWheel: ActionBool = new ActionBool(false, 'action-mouse-wheel')
  mouseHover: ActionBool = new ActionBool(false, 'action-mouse-hover')
  touchClick: ActionBool = new ActionBool(false, 'action-touch-click')
  touchDrag: ActionBool = new ActionBool(false, 'action-touch-drag')
  touchPinch: ActionBool = new ActionBool(false, 'action-touch-pinch')
  update: ActionBool = new ActionBool(false, 'action-update')
}

export class ActionMouseWheel {
  delta = 0
  position: V = new V(null, null)
  constructor (delta: number | null, position: V | null) {
    this.delta = delta || 0
    this.position = position || new V(null, null)
  }
}

export class ActionMouseButton {
  button: number | null = null
  constructor (button: number | null) {
    this.button = button
  }
}

export class ActionCallbackData {
  transform: T
  scale: number
  mouse: ActionCursorEvent | null
  constructor (transform: T, scale: number, mouse: ActionCursorEvent | null) {
    this.transform = transform
    this.scale = scale
    this.mouse = mouse
  }
}

@Component({
  name: 'ActionContainer'
})
// @vuese
// @group COMPONENTS
export default class ActionContainer extends Vue {
  cursor: ActionCursorEvent = new ActionCursorEvent()
  touch: ActionTouchEvent = new ActionTouchEvent()
  actionMouseButton: ActionMouseButton = new ActionMouseButton(null)
  actionMouseWheel: ActionMouseWheel = new ActionMouseWheel(null, null)
  action: ActionBoolManager = new ActionBoolManager()
  transform: T = new T(null, null)
  scale = 1
  actionContainer: HTMLElement | null = null
  zoomMin = 0.1
  zoomMax = 8

  id: number | undefined = undefined
  unmounted (): void {
    if (this.id) {
      window.cancelAnimationFrame(this.id)
      console.log(`Remove animation frame ${this.id}.`)
    }
    this.id = undefined
  }

  onDeactivated (): void {
    this.unmounted()
  }

  mounted (): void {
    this.actionContainer = this.$refs.actionContainer as HTMLElement
    this.resize()
    this.$root.$on('changeDarkMode', () => this.emitUpdate())
    this.refreshLoop()
  }

  emitUpdate (): void {
    const actionData = new ActionCallbackData(this.transform, this.scale, null)
    this.$emit(this.action.update.name, actionData)
  }

  /**
   * Mouse events manager
   */
  onContextMenu (e: MouseEvent): void {
    e.preventDefault()
  }

  onMouseDown (e: MouseEvent): void {
    this.cursor.new = this.getPosition(e)
    this.cursor.last = this.getPosition(e)
    this.cursor.start = this.getPosition(e)
    this.actionMouseButton.button = e.button
    this.action.mouseHover.value = false
  }

  onMouseUp (): void {
    this.action.mouseClick.forEach(action => {
      action.value = false
    })
    if (
      this.actionMouseButton.button != null &&
      this.actionMouseButton.button <= 2
    ) {
      if (this.action.mouseDrag[this.actionMouseButton.button].value !== true) {
        const action = this.action.mouseClick[this.actionMouseButton.button]
        action.value = true
        this.emitMouseAction(action.name)
      }
      this.action.mouseDrag.forEach(action => {
        action.value = false
      })
    }
    this.actionMouseButton.button = null
    this.action.mouseHover.value = false
  }

  onMouseMove (e: MouseEvent): void {
    this.cursor.new = this.getPosition(e)
    if (
      this.actionMouseButton.button == null ||
      this.actionMouseButton.button > 2
    ) {
      this.action.mouseHover.value = true
      this.cursor.last = this.cursor.new
      this.emitMouseAction(this.action.mouseHover.name)
    } else if (this.cursor.start != null) {
      const mouseDelta = this.cursor.new.subV(this.cursor.start)
      if (mouseDelta.length() > 4) {
        const action = this.action.mouseDrag[this.actionMouseButton.button]
        action.value = true
        this.emitMouseAction(action.name)
      }
      this.cursor.last = this.cursor.new
    }
  }

  onMouseWheel (e: WheelEvent): void {
    this.actionMouseWheel = new ActionMouseWheel(e.deltaY, this.getPosition(e))
    this.emitMouseAction(this.action.mouseWheel.name)
    e.preventDefault()
  }

  emitMouseAction (actionName: string): void {
    const actionCursorEvent = new ActionCursorEvent()
    actionCursorEvent.new =
      this.cursor.new == null ? null : this.transforming(this.cursor.new)
    actionCursorEvent.last =
      this.cursor.last == null ? null : this.transforming(this.cursor.last)
    actionCursorEvent.start =
      this.cursor.start == null ? null : this.transforming(this.cursor.start)
    const actionData = new ActionCallbackData(
      this.transform,
      this.scale,
      actionCursorEvent
    )
    this.$emit(actionName, actionData)
  }

  /**
   * Touch action
   */
  onTouchStart (e: TouchEvent): void {
    // this.touch.last[0] = e.touches[0]
    // this.touch.last[1] = e.touches[1]
    this.setActionByTouch(e)
    e.preventDefault()
  }

  onTouchEnd (): void {
    // this.action = null
  }

  onTouchMove (e: TouchEvent): void {
    console.log(e)
    /*
    this.touch.new[0] = this.getPosition(e.touches[0])
    this.touch.last[0] = this.getPosition(this.touch.last[0])

    switch (this.action) {
      case 'move':
        // console.log({
        //   new: this.transforming(this.touch.new[0]),
        //   last: this.transforming(this.touch.last[0])
        // });
        // this.draw();
        break
      case 'pan': {
        const touch = {
          new: this.getPosition(e.touches[1]),
          last: this.getPosition(this.touch.last[1])
        }
        const middle = {
          new: this.touch.new[0].add(touch.new).div(2),
          last: this.touch.last[0].add(touch.last).div(2)
        }
        const length = {
          new: this.touch.new[0].sub(touch.new).length(),
          last: this.touch.last[0].sub(touch.last).length()
        }
        const delta = this.scaling(middle.new.sub(middle.last))
        this.transform.position = this.transform.position.add(delta)
        const zoom = 1 - length.new / length.last
        this.zoomInPosition(zoom, middle.new)

        this.draw()
      } break
    }
    this.touch.last[0] = e.touches[0]
    this.touch.last[1] = e.touches[1]
    e.preventDefault()

    */
  }

  /**
   * Utilities methods
   */
  resize (): void {
    this.$nextTick(() => this.onWindowResize())
  }

  refreshLoop (): void {
    this.onWindowResize()
    this.id = window.requestAnimationFrame(() => this.refreshLoop())
  }

  onWindowResize (): void {
    if (this.actionContainer == null) return

    const size = new V(
      this.actionContainer.clientWidth,
      this.actionContainer.clientHeight
    )

    if (!this.transform.size.equal(size)) {
      this.transform.size = size
      this.emitUpdate()
    }
  }

  drag (): void {
    if (this.cursor.new != null && this.cursor.last != null) {
      const delta = this.scaling(this.cursor.new.subV(this.cursor.last))
      this.transform.position = this.transform.position.addV(delta)
      this.emitUpdate()
    }
  }

  zoom (): void {
    if (this.actionMouseWheel.delta === 0) return
    let zoom = Math.sign(this.actionMouseWheel.delta) / 5

    if (this.scale * (1 - zoom) < this.zoomMin) {
      zoom = -this.zoomMin / this.scale + 1
    }
    if (this.scale * (1 - zoom) > this.zoomMax) {
      zoom = -this.zoomMax / this.scale + 1
    }

    this.zoomInPosition(zoom, this.actionMouseWheel.position)
    this.actionMouseWheel.delta = 0
    this.emitUpdate()
  }

  zoomInPosition (zoom: number, position: V): void {
    this.scale *= 1 - zoom
    const ratio = position.divV(this.transform.size)
    const delta = this.scaling(this.transform.size)
      .multN(zoom)
      .multV(ratio)
    this.transform.position = this.transform.position.addV(delta)
  }

  unscaling (v: V): V {
    return v.multN(this.scale)
  }

  scaling (v: V): V {
    return v.divN(this.scale)
  }

  untransforming (v: V): V {
    return this.unscaling(v.addV(this.transform.position))
  }

  transforming (v: V): V {
    return this.scaling(v).subV(this.transform.position)
  }

  getPosition (e: MouseEvent): V {
    if (this.actionContainer == null) return new V(null, null)
    const r = this.actionContainer.getBoundingClientRect()
    return new V(e.clientX - r.left, e.clientY - r.top)
  }

  setActionByTouch (e: TouchEvent): void {
    console.log('setactionByTouch :', e)
    // this.action.oneTouch.value = e.touches.length === 1
    // this.action.twoTouch.value = !this.action.oneTouch.value
  }
}
</script>

<!--

switch(this.action) {
  case "move": {
    // console.log({
    //   new: this.transforming(this.cursor.new),
    //   last: this.transforming(this.cursor.last)
    // })
    // this.draw();
  } break;
  case "pan": {
    let delta = this.scaling(this.cursor.new.sub(this.cursor.last));
    this.transform.position = this.transform.position.add(delta);
    this.draw();
  } break;
  default: {
    this.$emit("action-hover");
  }
}

-->
