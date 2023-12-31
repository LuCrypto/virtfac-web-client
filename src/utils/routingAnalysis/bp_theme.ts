export class BpTheme {
  public readonly BackgroundColor: string = '#1E1E1E'
  public readonly WallNodeSize: number = 8
  public readonly WallNodeColor: string = '#F0F3F4'
  public readonly WallNodeHoverColor: string = '#F5A406'
  public readonly WallLinkStrokeWidth: number = 2
  public readonly DoubleWallWidth: number = 2
  public readonly WallLinkColor: string = '#D7DBDD'
  public readonly WallSnapLineColor: string = '#3498DB'
  public readonly WallLinkColliderWidth: number = 10
  public readonly WallNodeColliderRange: number = 15
  public readonly WindowWidth: number = 2
  public readonly WallFurnitureColor: string = '#F5A506'
  public readonly EraseColor: string = '#E74C3C'

  constructor (attributes?: Partial<BpTheme>) {
    Object.assign(this, attributes)
  }
}
