export default class Name {
  name: string

  constructor (name: string | null) {
    this.name = name || 'undefined'
  }
}
