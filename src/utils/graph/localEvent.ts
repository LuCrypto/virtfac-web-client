export class LocalEvent<T> {
  private listeners: Map<unknown, { (arg: T): void }>

  constructor () {
    this.listeners = new Map<unknown, {(arg: T): void }>()
  }

  /**
   *
   * @param listener function to be call on notification
   * @param key reference of the listener owner (used to remove the listener)
   */
  public addListener (listener: { (arg: T): void }, key: unknown = null) {
    if (key == null) {
      this.listeners.set(listener, listener)
    } else {
      this.listeners.set(key, listener)
    }
  }

  /**
   *
   * @param key reference to the listener owner
   */
  public removeListener (key: unknown) {
    this.listeners.delete(key)
  }

  /**
   *
   * @param arg argument to send to listeners
   */
  public notify (arg: T): void {
    this.listeners.forEach((v: { (arg: T): void }) => {
      try {
        v(arg)
      } catch (error) {
        console.error(error)
      }
    })
  }
}

/**
 * LocalEvent that also contained a `Map<K,LocalEvent<T>>` of LocalEvent
 */
export class MapLocalEvent<K, T> extends LocalEvent<{ key: K; arg: T }> {
  private localeventMap: Map<K, LocalEvent<T>> = new Map<K, LocalEvent<T>>()

  /**
   *
   * @param eventKey key of the LocalEvent
   * @param listener function to be call on notification on the event key
   * @param listenerOwnerKey reference of the listener owner (used to remove the listener)
   */
  public addMappedListener (
    eventKey: K,
    listener: { (arg: T): void },
    listenerOwnerKey: unknown = null
  ) {
    if (!this.localeventMap.has(eventKey)) {
      this.localeventMap.set(eventKey, new LocalEvent<T>())
    }

    (this.localeventMap.get(eventKey) as LocalEvent<T>).addListener(
      listener,
      listenerOwnerKey
    )
  }

  /**
   *
   * @param eventKey key of the LocalEvent
   * @param listenerOwnerKey reference of the listener owner
   */
  public removeMappedListener (eventKey: K, listenerOwnerKey: unknown) {
    (this.localeventMap.get(eventKey) as LocalEvent<T>).removeListener(
      listenerOwnerKey
    )
  }

  /**
   * notify the listeners of a mapped event
   * @param arg contain the key of the event to notify and the arguments to send to the listeners
   */
  public notify (arg: { key: K; arg: T }): void {
    super.notify(arg)
    if (this.localeventMap.has(arg.key)) {
      (this.localeventMap.get(arg.key) as LocalEvent<T>).notify(arg.arg)
    }
  }
}
