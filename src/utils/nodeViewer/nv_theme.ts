export class NvTheme {
  public name = 'default'

  public backgroundColor = '#d2d2d2'
  public gridColor = '#ffffff'
  public gridSize = '50'
  public gridPointPercent = '99'
  public nodeTextColor = '#151515'
  public nodeContentBackgroundColor = '#ffffff'
  public nodeContentBackgroundOpacity = 1
  public nodeSocketBackgroundColor = '#f3f3f3'
  public nodeSocketBackgroundOpacity = 1
  public nodeDefaultSocketColor = '#151515'
  public nodeBorderRadius = '8px'
  public nodeSpacing = '8px'

  public toolboxLinkBorderStyle = '5px solid'
  public toolboxLinkBorderSide: 'left' | 'right' | 'top' | 'bottom' = 'left'

  public toolboxIncreaseColor = '#27AE60'
  public toolboxDecreaseColor = '#E74C3C'
  public toolboxLinkTypeStyle = '3px solid'
  public toolboxLinkTypeSide: 'left' | 'right' | 'top' | 'bottom' = 'right'

  public nodeTextBackgroundColor = ''
  public nodeTextBackgroundBlur = 'blur(2px)'

  constructor (attributes?: Partial<NvTheme>) {
    Object.assign(this, attributes)
    if (this.nodeTextBackgroundColor === '') {
      this.nodeTextBackgroundColor =
        this.nodeContentBackgroundColor.substring(0, 7) + '10'
    }
  }
}
