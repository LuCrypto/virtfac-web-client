import { imageAsset } from '@/utils/defaultData'

export default class CardProfile {
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
  hairName = ''
  pantName = ''
  shirtName = ''
  headName = ''
  shoesName = ''
  beardName = ''
  hipWidth = 0
  body = 0
  neck = 0
  head = 0
  shoulderWidth = 0
  upperArm = 0
  foreArm = 0
  palm = 0
  upperLeg = 0
  lowerLeg = 0
  heelHeight = 0
  footLength = 0
  femaleFace = 0
  armSize = 0
  breastSize = 0
  bellySize = 0
  lowerBackSize = 0
  hipSize = 0
  buttockSize = 0
  legSize = 0
  skinColor = 0
  hairColor = 0
  beardColor = 0
  eyesColor = 0
  shirtColor1 = 0
  shirtColor2 = 0
  shirtColor3 = 0
  shirtColor4 = 0
  shirtColor5 = 0
  pantsColor1 = 0
  pantsColor2 = 0
  pantsColor3 = 0
  pantsColor4 = 0
  pantsColor5 = 0
  shoesColor1 = 0
  shoesColor2 = 0
  shoesColor3 = 0

  // eslint-disable-next-line
  parsedData: any = null
  parsedTags: string[] = []

  // Permet de récupérer une date en format string
  get formatedCreationDate (): string {
    return new Date(this.creationDate).toLocaleString()
  }

  // Permet de construire une scène
  constructor (params: Partial<CardProfile>) {
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
