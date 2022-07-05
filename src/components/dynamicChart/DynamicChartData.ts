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
  private data!: V[]

  public box: T = new T()

  mounted () {
    this.computeDataBox()
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
    console.log('computed data box :', this.box)
    this.$parent.$emit('updateBox', this.box)
  }
}
