export class Action {
  undo: { (): Promise<void> }
  redo: { (): Promise<void> }

  constructor (undo: { (): Promise<void> }, redo: { (): Promise<void> }) {
    this.undo = undo
    this.redo = redo
  }
}

export class UndoManager {
  private ctrlHandle = false
  private binded = false

  private undoList = new Array<Action>()
  private redoList = new Array<Action>()

  public addAction (action: Action): void {
    this.undoList.push(action)
    if (this.redoList.length > 0) this.redoList = new Array<Action>()
  }

  public clearActions (): void {
    this.undoList = new Array<Action>()
    this.redoList = new Array<Action>()
  }

  public undo (): Promise<void> {
    if (this.undoList.length > 0) {
      const action = this.undoList.pop() as Action
      this.redoList.push(action)
      return action.undo()
    } else {
      return new Promise<void>(resolve => {
        resolve()
      })
    }
  }

  public redo (): Promise<void> {
    if (this.redoList.length > 0) {
      const action = this.redoList.pop() as Action
      this.undoList.push(action)
      return action.redo()
    } else {
      return new Promise<void>(resolve => {
        resolve()
      })
    }
  }

  public bind (): void {
    if (!this.binded) {
      this.binded = true
      document.addEventListener('keydown', this.onKeyDown)
      document.addEventListener('keyup', this.onKeyUp)
    }
  }

  public unbind (): void {
    if (this.binded) {
      this.binded = false
      document.removeEventListener('keydown', this.onKeyDown)
      document.removeEventListener('keyup', this.onKeyUp)
    }
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey) this.ctrlHandle = true
    if (this.ctrlHandle && e.key.toUpperCase() === 'Z') {
      this.undo()
    }
    if (this.ctrlHandle && e.key.toUpperCase() === 'Y') {
      this.redo()
    }
  }

  private onKeyUp = (e: KeyboardEvent) => {
    if (e.ctrlKey) this.ctrlHandle = false
  }
}
