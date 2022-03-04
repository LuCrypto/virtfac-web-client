export class LocalEvent<T> {
  private listeners: Map<unknown, { (arg: T): void }>

  constructor () {
    this.listeners = new Map<unknown, {(arg: T): void }>()
  }

  public addListener (listener: { (arg: T): void }, key: unknown = null) {
    if (key == null) {
      this.listeners.set(listener, listener)
    } else {
      this.listeners.set(key, listener)
    }
  }

  public removeListener (key: unknown) {
    this.listeners.delete(key)
  }

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

export class MapLocalEvent<K, T> extends LocalEvent<{ key: K; arg: T }> {
  private localeventMap: Map<K, LocalEvent<T>> = new Map<K, LocalEvent<T>>()

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

  public removeMappedListener (eventKey: K, listenerOwnerKey: unknown) {
    (this.localeventMap.get(eventKey) as LocalEvent<T>).removeListener(
      listenerOwnerKey
    )
  }

  public notify (arg: { key: K; arg: T }): void {
    super.notify(arg)
    if (this.localeventMap.has(arg.key)) {
      (this.localeventMap.get(arg.key) as LocalEvent<T>).notify(arg.arg)
    }
  }
}
