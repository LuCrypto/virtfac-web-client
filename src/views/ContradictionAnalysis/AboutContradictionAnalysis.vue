<template>
  <odoo-i-frame
    src="http://10.244.77.203/about-contradiction-analysis"
  ></odoo-i-frame>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import OdooIFrame from '@/components/OdooIframe.vue'

@Component({
  name: 'AboutContradictionAnalysis',
  components: {
    OdooIFrame
  }
})
// @vuese
// @group VIEWS
export default class AboutContradictionAnalysis extends Vue {}
</script>
