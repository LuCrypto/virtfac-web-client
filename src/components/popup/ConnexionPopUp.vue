<template>
  <v-dialog v-model="show" max-width="600px">
    <!-- Popup -->
    <v-card>
      Connexion
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({
  components: {}
})
export default class ConnexionPopUp extends Vue {
  show = false

  mounted (): void {
    console.log('Data Format Selector Popup is open.')
  }

  public open (): void {
    this.show = true
  }

  cancel (): void {
    this.$emit('cancel')
    this.show = false
  }

  validated (): void {
    this.$emit('validated')
    this.show = false
  }
}
</script>
