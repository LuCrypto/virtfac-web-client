<template>
  <v-card :rounded="unreal.check() ? 'xl' : 'md'">
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
    <v-card-text class="pt-5 px-5 pb-0">
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
      <div class="red--text mt-3" v-if="redMessage">
        {{ redMessage }}
      </div>
    </v-card-text>
    <v-card-actions class="pb-5">
      <v-spacer></v-spacer>
      <div v-if="waitingBeforeNewTry != 0" class="mr-2 red--text">
        Next try in {{ waitingBeforeNewTry }} seconds
      </div>
      <v-btn
        color="primary"
        @click="loginRequest"
        class="black--text"
        :disabled="!login || !password || waiting || waitingBeforeNewTry != 0"
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
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Session, User } from '@/utils/session'
import API from '@/utils/api'
import Unreal from '@/utils/unreal'

@Component({
  name: 'Login'
})
// @vuese
// @group COMPONENTS
export default class Login extends Vue {
  login = ''
  password = ''
  waiting = false
  showPassword = false
  redMessage = ''
  waitingBeforeNewTry = 0
  unreal = Unreal
  timeout: ReturnType<typeof setTimeout> | undefined = undefined

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
        const user = new User(json)
        Session.setUser(user)
        this.$root.$emit('bottom-message', `Welcome back ${user.pseudo}.`)
        this.$root.$emit('user-connection', user)
        this.login = ''
        this.password = ''
        this.$emit('close')
      })
      .catch((reason: any) => {
        this.redMessage = reason.message
        this.waitingBeforeNewTry = Math.ceil(reason.waiting / 1000)
        if (this.timeout) {
          clearTimeout(this.timeout)
        }
        this.updateTimer()
      })
      .finally(() => {
        this.waiting = false
      })
  }

  updateTimer () {
    if (this.waitingBeforeNewTry > 0) {
      this.waitingBeforeNewTry -= 1
      this.timeout = setTimeout(() => this.updateTimer(), 1000)
    }
  }
}
</script>
