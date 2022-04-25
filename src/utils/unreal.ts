declare global {
  interface Window {
    ue: {
      interface: {
        receivejson: (json: string) => Promise<unknown>
        getzoom: () => Promise<number>
      }
    }
  }
}

export default class Unreal {
  // Method name definition
  static sendMethodName: string = 'ReceiveJson'.toLowerCase()

  static callback: (data: unknown) => void | null = (data: unknown) => {
    console.log('[unreal] received data :', data)
  }

  // Check if unreal context is detected
  static check (): boolean {
    return 'ue' in window && 'interface' in window.ue
  }

  // Get browser zoom from Unreal
  static getResolution (): Promise<number> {
    return new Promise<number>(resolve => {
      if (Unreal.check() && 'getzoom' in window.ue.interface) {
        window.ue.interface
          .getzoom()
          .then(zoom => resolve(zoom))
          .catch(() => resolve(1))
      } else {
        resolve(1)
      }
    })
  }

  // Send data to unreal
  static send (data: unknown): void {
    if (Unreal.check() && 'receivejson' in window.ue.interface) {
      const json = JSON.stringify(data)
      window.ue.interface
        .receivejson(json)
        .then(json => Unreal.receive(json as string))
        .catch(error =>
          console.error('[unreal] Error response from Unreal.', error)
        )
    } else {
      console.error('[unreal] Context is not detected. Try to send : ', data)
    }
  }

  // Parse Json to data and call callback
  static receive (json: string): void {
    if (!Unreal.check()) return
    try {
      const data = JSON.parse(json)
      if (Unreal.callback != null) {
        Unreal.callback(data)
      }
    } catch (error) {
      console.error('[unreal] Json parse fail.', error)
    }
  }
}
