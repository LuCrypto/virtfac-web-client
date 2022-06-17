<template>
  <svg class="histogram" :width="width" :height="height"></svg>
</template>
<script>
import * as d3 from 'd3'

export default {
  name: 'Histogram',
  props: {
    // taille en pixel du composant
    width: { type: Number },
    height: { type: Number },
    // Une liste de nombres
    data: { type: Array },
    // Combien de Bins (combien de barres)
    numBins: { type: Number, default: 40 }
  },
  data () {
    return {
      svg: null
    }
  },
  computed: {
    histogram () {
      const countHistogram = d3
        .histogram()
        .domain(d3.extent(this.data)) // récupère le min et le max de this.data
        .thresholds(this.numBins) // on assigne le nombre de bins
      return countHistogram(this.data) // on appelle la fonction sur nos nouvelles données
        .map(bins => ({ x: bins.x0, y: bins.length })) // on garde uniquement le nombre d'éléments et la valeur de départ de la bin
    }
  },
  watch: {
    data: 'renderSvg',
    numBins: 'renderSvg'
  },
  mounted () {
    this.initSvg()
  },
  methods: {
    initSvg () {
      this.svg = d3.select(this.$el).append('g') // ajout d'un élément g tag dans le DOM
      this.renderSvg()
    },
    renderSvg () {
      // création des scales
      const x = d3
        .scaleBand()
        .padding(0.2)
        .domain(this.histogram.map(d => d.x))
        .rangeRound([0, this.width])
      const y = d3
        .scaleLinear()
        .domain([0, d3.max(this.histogram, d => d.y)])
        .range([0, this.height])

      // On sélectionne les rect + nos données d'histogramme
      const selection = this.svg.selectAll('rect').data(this.histogram)

      selection
        .enter() // quand il y a plus de données que d'élements rect
        .append('rect') // on rajoute un élément rect avec la class "bar"
        .attr('class', 'bar')
        .merge(selection) // on fait un update et un enter
        .attr(
          'transform',
          d => `translate(${x(d.x)} ${this.height}) scale(1 -1)`
        ) // on positionne la barre horizontalement
        .attr('width', x.bandwidth()) // largeur de la barre est définie par la scale x
        .attr('height', d => y(d.y)) // on change la hauteur de la barre

      selection.exit().remove() // quand il y a plus d'élément rect que de data, on supprime les rect
    }
  }
}
</script>
<style scoped>
.histogram >>> rect.bar {
  fill: #009688;
}
</style>
