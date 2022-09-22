<template>
  <odoo-i-frame src="/about-ergonom-io"></odoo-i-frame>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import OdooIFrame from '@/components/OdooIframe.vue'

@Component({
  name: 'AboutErgonomIO',
  components: {
    OdooIFrame
  }
})
// @vuese
// @group VIEWS
export default class AboutErgonomIO extends Vue {}
</script>
