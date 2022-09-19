<template>
  <odoo-i-frame src="/about-routing-analysis"></odoo-i-frame>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import OdooIFrame from '@/components/OdooIframe.vue'

@Component({
  name: 'AboutRoutingAnalysis',
  components: {
    OdooIFrame
  }
})
// @vuese
// @group VIEWS
export default class AboutRoutingAnalysis extends Vue {}
</script>
