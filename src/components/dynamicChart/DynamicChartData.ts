import { Vue, Prop, Component } from 'vue-property-decorator'
import V from '@/utils/vector'
import T from '@/utils/transform'

@Component
export default class DynamicChartData extends Vue {
  @Prop({
    default: () =>
      [...Array(100)].map((v, i) =>
        new V(i + 5 * Math.random(), i + 5 * Math.random())
          .multN(10)
          .subN(100 + Math.random() * 20)
      )
  })
  protected data!: V[]

  @Prop({
    default: () => (size: V) => null
  })
  private setSize!: (size: V) => void

  public step = new V(50, 50)
  public box: T = new T(new V(0, 0), this.step)
  public gridBox: T = new T(new V(0, 0), this.step)

  mounted () {
    this.computeDataBox()
    this.computeGridBox()
  }

  // Compute data box
  public computeDataBox (): void {
    const min = new V(Infinity, Infinity)
    const max = new V(-Infinity, -Infinity)
    this.data.forEach(v => {
      min.x = v.x < min.x ? v.x : min.x
      min.y = v.y < min.y ? v.y : min.y
      max.x = v.x > max.x ? v.x : max.x
      max.y = v.y > max.y ? v.y : max.y
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
