import { Vue, Prop, Component } from 'vue-property-decorator'
import V from '@/utils/vector'
import T from '@/utils/transform'

@Component
export default class DynamicChartData extends Vue {
  @Prop({
    default: () => []
  })
  protected rawCurves!: { name: string; data: V[] }[]

  @Prop({ default: () => 'X axis' }) private labelX!: string
  @Prop({ default: () => 'Y axis' }) private labelY!: string
  @Prop({ default: () => 50 }) private stepX!: number
  @Prop({ default: () => 50 }) private stepY!: number
  @Prop({ default: () => 1 }) private scaleX!: number
  @Prop({ default: () => 1 }) private scaleY!: number
  @Prop({ default: () => true }) private displayPlot!: boolean

  public curves: { name: string; data: V[] }[] = []

  public step = new V(this.stepX, this.stepY)
  public box: T = new T(new V(0, 0), this.step)
  public gridBox: T = new T(new V(0, 0), this.step)
  public scale = new V(0, 0)

  mounted () {
    this.scale = new V(this.scaleX, this.scaleY)
    this.curves = this.rawCurves.map(curve => {
      return {
        name: curve.name,
        data: curve.data.map(v => v.multV(this.scale))
      }
    })

    if (this.curves.length > 0) {
      this.computeDataBox()
      this.computeGridBox()
    } else {
      this.box = new T(new V(0, 0), this.step)
      this.gridBox = new T(new V(0, 0), this.step)
    }
  }

  // Scale data

  // Compute data box
  public computeDataBox (): void {
    const min = new V(Infinity, Infinity)
    const max = new V(-Infinity, -Infinity)

    this.curves.forEach(curve => {
      curve.data.forEach(v => {
        min.x = v.x < min.x ? v.x : min.x
        min.y = v.y < min.y ? v.y : min.y
        max.x = v.x > max.x ? v.x : max.x
        max.y = v.y > max.y ? v.y : max.y
      })
    })

    this.box.position = min
    this.box.size = max.subV(min)
    this.$parent.$emit('updateBox', this.box)
  }

  // Get grid from step
  public computeGridBox (): void {
    const stepper = (v: V) =>
      v
        .divV(this.step)
        .floor()
        .multV(this.step)
    this.gridBox = new T(
      stepper(this.box.position).subV(this.step),
      stepper(this.box.size).addV(this.step.multN(3))
    )
  }
}
