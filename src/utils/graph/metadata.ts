import { MapLocalEvent } from '@/utils/graph/localEvent'

export class MetaData {
  private dataChanged: MapLocalEvent<
    string,
    { value: unknown }
  > = new MapLocalEvent<string, { value: unknown }>()

  public onDataChanged () {
    return this.dataChanged
  }

  private data: Map<string, unknown>
  public foreachData (func: { (value: unknown, key: string): void }): void {
    this.data.forEach(func)
  }

  ///
  // #region SET
  ///

  /**
   *
   * @param key
   * @param value
   * @returns this
   */
  public setData<T> (key: string, value: T): MetaData {
    if (value === undefined) this.data.delete(key)
    else this.data.set(key, value)
    this.dataChanged.notify({ key: key, arg: { value: value } })

    return this
  }

  /**
   * Copy key/value pair of a metadata to an other MetaData object
   * @param key
   * @param source
   * @returns this
   */
  public copyData<T> (key: string, source: MetaData): MetaData {
    this.setData<T>(key, source.getData<T>(key))
    this.dataChanged.notify({
      key: key,
      arg: { value: source.getData<T>(key) }
    })
    return this
  }

  public copyAllData (source: MetaData): void {
    source.data.forEach((value, key) => {
      this.setData(key, value)
    })
  }
  // #endregion
  ///

  ///
  // #region GET
  ///
  public getData<T> (key: string): T {
    return this.data.get(key) as T
  }

  /**
   *
   * @param key
   * @param defaultValue
   * @returns if the key exists : return getData<T>(key) else : return defaultValue
   */
  public getDataOrDefault<T> (key: string, defaultValue: T): T {
    const tmp = this.data.get(key) as T
    if (tmp === undefined) return defaultValue
    return tmp
  }

  /**
   * if the key doesn't exists : add defaultValue to key
   * @param key
   * @param defaultValue
   * @returns getData<T>(key)
   */
  public getOrAddData<T> (key: string, defaultValue: T): T {
    const tmp = this.data.get(key)
    if (tmp === undefined) {
      this.data.set(key, defaultValue)
      this.dataChanged.notify({ key: key, arg: { value: defaultValue } })
      return defaultValue
    }
    return tmp as T
  }
  // #endregion
  ///

  constructor () {
    this.data = new Map<string, unknown>()
  }
}
