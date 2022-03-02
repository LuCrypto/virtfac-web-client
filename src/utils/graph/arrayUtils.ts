export class ArrayUtils {
  public static indexOfMin<T> (
    array: Array<T>,
    evalFunc: { (v: T): number },
    weight: Array<number> | undefined = undefined
  ): number {
    let min = 0
    let minEval = evalFunc(array[0])
    for (let i = 1; i < array.length; i++) {
      let tmp = evalFunc(array[i])
      if (weight !== undefined) tmp *= weight[i]
      if (tmp < minEval) {
        minEval = tmp
        min = i
      }
    }
    return min
  }

  public static refOfMin<K, V> (
    map: Map<K, V>,
    evalFunc: { (k: K, v: V): number }
  ): K | undefined {
    let tmpEval: number | undefined
    let tmpRef: K | undefined
    map.forEach((value, key) => {
      const e: number = evalFunc(key, value)
      if (tmpEval === undefined || tmpEval > e) {
        tmpEval = e
        tmpRef = key
      }
    })
    return tmpRef
  }
}
