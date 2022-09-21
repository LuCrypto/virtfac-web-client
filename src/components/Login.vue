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
          @focus="changeFocus(true)"
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
          @focus="changeFocus(false)"
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

    <template v-if="unreal.check()">
      <div id="app">
        <SimpleKeyboard @onKeyPress="onKeyPress" />
      </div>
    </template>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Session, User } from '@/utils/session'
import API from '@/utils/api'
import Unreal from '@/utils/unreal'
import SimpleKeyboard from '@/views/ErgonomIO/SimpleKeyboard.vue'

@Component({
  name: 'Login',
  components: {
    SimpleKeyboard
  }
})
// @vuese
// @group COMPONENTS
export default class Login extends Vue {
  login = ''
  password = ''
  clicLogin = true
  waiting = false
  showPassword = false
  redMessage = ''
  waitingBeforeNewTry = 0
  unreal = Unreal
  timeout: ReturnType<typeof setTimeout> | undefined = undefined
  input = ''

  // Quand on appuie sur un bouton
  onKeyPress (button: any): void {
    console.log('button', button)
    const maRegex = /\{.+\}/g

    console.log('button.match(maRegex) : ', button.match(maRegex))

    if (button === '{space}') {
      button = ' '
    } else if (button === '{enter}') {
      this.loginRequest()
      return
    } else if (button === '{tab}') {
      button = '    '
    } else if (button === '{bksp}') {
      if (this.clicLogin) {
        this.login = this.login.slice(0, -1)
      } else {
        this.password = this.password.slice(0, -1)
      }
      return
    } else if (button.match(maRegex)) {
      button = ''
    }

    // this.input += button
    if (this.clicLogin) {
      this.login += button
    } else {
      this.password += button
    }
  }

  changeFocus (login: boolean): void {
    console.log('Change focus')
    this.clicLogin = login
    this.input = ''
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
