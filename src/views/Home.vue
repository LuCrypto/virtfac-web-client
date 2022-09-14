<template>
  <odoo-i-frame src=""></odoo-i-frame>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import OdooIFrame from '@/components/OdooIframe.vue'

@Component({
  name: 'Home',
  components: {
    OdooIFrame
  }
})
// @vuese
// @group VIEWS
export default class Home extends Vue {}
</script>
