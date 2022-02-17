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
        <v-form>
          <v-text-field
            prepend-icon="mdi-login"
            name="login"
            label="Login"
            type="text"
            v-model="login"
            @keyup.enter="loginRequest"
          ></v-text-field>
          <v-text-field
            id="password"
            prepend-icon="mdi-lock"
            name="password"
            label="Password"
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="() => (showPassword = !showPassword)"
            @keyup.enter="loginRequest"
          ></v-text-field>
        </v-form>
        <div>
          To create an account, you need an organization manager to send you a
          login link.
        </div>
      </v-card-text>
      <v-card-actions class="pb-5">
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          @click="loginRequest"
          dark
          :disabled="!login || !password || waiting"
        >
          <v-progress-circular
            v-if="waiting"
            :size="20"
            :width="3"
            class="mr-2"
            indeterminate
            color="primary"
          ></v-progress-circular>
          Sign in
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Session, User } from '@/utils/session'
import API from '@/utils/api'

@Component({
  components: {}
})
export default class LoginPopUp extends Vue {
  show = false
  login = ''
  password = ''
  waiting = false
  showPassword = false

  mounted (): void {
    console.log('Data Format Selector Popup is open.')
    this.$emit('message', 'Hello World !')
  }

  public open (): void {
    this.show = true
  }

  loginRequest (): void {
    this.waiting = true
    API.post(
      this,
      '/login',
      JSON.stringify({
        login: this.login,
        password: this.password
      })
    )
      .then((json: any) => {
        const user = new User(json.user)
        Session.setUser(user)
        this.$root.$emit('bottom-message', `Welcome back ${user.pseudo}.`)
        this.$root.$emit('user-connection', user)
        this.login = ''
        this.password = ''
        this.show = false
      })
      .finally(() => {
        this.waiting = false
      })
  }
}
</script>
