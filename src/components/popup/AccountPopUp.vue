<template>
  <v-dialog v-model="show" max-width="600px">
    <!-- Popup -->
    <v-card>
      <!-- Popup -->
      <v-toolbar color="primary" flat>
        <v-toolbar-title style="color: black">
          <v-icon
            left
            style="color: black"
            v-text="'mdi-account-circle'"
          ></v-icon>
          Connexion
        </v-toolbar-title>
      </v-toolbar>
      <v-card-text class="mt-5">
        <div>Todo : Account Settings</div>
      </v-card-text>
      <v-card-actions class="pb-5">
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="logout" dark>
          Log out
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Session } from '@/utils/session'

@Component({
  components: {}
})
export default class AccountPopUp extends Vue {
  show = false
  login = ''
  password = ''
  waiting = false
  showPassword = false

  public open (): void {
    this.show = true
  }

  logout (): void {
    Session.deleteUser()
    this.$root.$emit('user-disconnection')
    this.show = false
  }
}
</script>
