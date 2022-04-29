import { Vue } from 'vue-property-decorator'

declare global {
  interface Window {
    receive: (json: string) => void
    ue: {
      interface: {
        receivejson: (json: string) => Promise<unknown> // Send data to unreal
        getzoom: () => Promise<number>
      }
    }
  }
}

/**
 * To set callback in your Vue component :
 *
 * import Unreal from '@/utils/unreal'
 *
 * Unreal.callback.$on('unreal-message', (data: unknown) => {
 *     this.$root.$emit('bottom-message', `Unreal : ${JSON.stringify(data)}`)
 * })
 *
 */

export default class Unreal {
  // Global vue event emitter for Unreal callback
  static callback = new Vue()

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
      Unreal.callback.$emit('unreal-message', data)
    } catch (error) {
      console.error('[unreal] Json parse fail.', error)
    }
  }
}

// Make the static "receive" function accessible from "window.receive" in Unreal Engine.
window.receive = Unreal.receive
