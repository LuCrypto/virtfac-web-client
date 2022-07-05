import { imageAsset } from '@/utils/defaultData'

export default class CardModel {
  // Initialisation
  name = ''
  picture = imageAsset
  tags = '[]'
  id = 0
  color = 0
  assetsNumber = 0
  creationDate = 0
  data = '{}'
  idProject = 0
  idUserOwner = 0
  modificationDate = 0
  spawnX = 0
  spawnY = 0
  spawnZ = 0
  idProfile = 0

  // eslint-disable-next-line
  parsedData: any = null
  parsedTags: string[] = []

  // Permet de récupérer une date en format string
  get formatedCreationDate (): string {
    return new Date(this.creationDate).toLocaleString()
  }

  // Permet de construire une scène
  constructor (params: Partial<CardModel>) {
    this.name = `NewScene_${String(Date.now()).slice(-7)}`
    this.color = Math.floor(Math.random() * 16777215)
    Object.assign(this, params)
    try {
      console.log(params.tags)
      this.parsedData = JSON.parse(this.data || '[]')
      this.parsedTags = JSON.parse(this.tags || '[]')
      console.log(this.parsedTags)
    } catch (e) {
      console.error(e)
    }
  }
}
