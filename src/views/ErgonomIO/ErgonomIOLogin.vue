<template>
  <v-container class="spacing-playground pa-6 contradiction-analysis" fluid>
    Hello
  </v-container>
</template>

<script lang="ts">
import AvatarAnimationComponent from '@/components/ErgonomicsAnalysisComponent.vue'
import { Component, Vue } from 'vue-property-decorator'
@Component({
  components: {
    AvatarAnimationComponent
  }
})
export default class ErgonomIOAnalysis extends Vue {
  mounted (): void {
    console.log('Ergonom.io Analysis view.')
  }
}
</script>
