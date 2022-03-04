export class DelayedCallback {
  private func: { (): void }
  private minCallInterval: number

  private lastCall: number
  private delayCallInstanciated = false

  constructor (func: { (): void }, minCallInterval: number) {
    this.func = func
    this.minCallInterval = minCallInterval
    this.lastCall = 0
  }

  public call () {
    if (Date.now() - this.lastCall > this.minCallInterval) {
      this.func()
      this.lastCall = Date.now()
    } else {
      if (!this.delayCallInstanciated) {
        this.delayCallInstanciated = true
        setTimeout(() => {
          this.delayCallInstanciated = false
          this.call()
        }, this.minCallInterval + 1)
      }
    }
  }
}
