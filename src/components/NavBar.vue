<template>
  <nav class="nav-bar">
    <!-- Vertical bar -->
    <v-app-bar app color="primary" light>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <div class="d-flex align-center">
        <div class="display-2 font-weight-black">VIRTFac</div>
      </div>
      <v-spacer></v-spacer>

      <!-- Small login button -->
      <v-btn
        v-if="avatar == null"
        target="#"
        icon
        color="grey darken-4"
        class="mr-2 d-sm-none"
        @click="() => $refs.connexionPopUp.open()"
      >
        <v-icon>mdi-account-circle</v-icon>
      </v-btn>

      <!-- Big login button -->
      <v-btn
        v-if="avatar == null"
        target="#"
        text
        class="mr-2 d-none d-sm-block"
        @click="() => $refs.loginPopUp.open()"
      >
        <v-icon class="mr-2">mdi-account-circle</v-icon>
        <span>Connexion</span>
      </v-btn>

      <!-- Avatar -->
      <v-avatar v-if="avatar != null" @click="() => $refs.accountPopUp.open()">
        <img :src="avatar" alt="Profile picture" />
      </v-avatar>

      <!-- Dark mode switcher -->
      <v-btn
        icon
        @click="toggleDarkMode"
        :color="$vuetify.theme.dark ? 'white' : 'black'"
      >
        <v-icon>mdi-circle-half-full</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Side nav bar -->
    <v-navigation-drawer
      v-model="drawer"
      app
      width="300"
      mobile-breakpoint="1000"
    >
      <v-list>
        <v-list-item-group v-for="(category, i) in categories.keys()" :key="i">
          <v-subheader>{{ category }}</v-subheader>
          <v-list-item
            v-for="(route, j) in categories.get(category)"
            :key="j"
            router
            :to="route.path"
            :href="route.href"
          >
            <v-list-item-action>
              <v-icon>{{ route.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ route.name }}</v-list-item-title>
              <v-list-item-subtitle v-if="route.subname != null">{{
                route.subname
              }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <!-- Popup -->
    <login-pop-up ref="loginPopUp"></login-pop-up>
    <account-pop-up ref="accountPopUp"></account-pop-up>
  </nav>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { routes, Route } from '@/utils/router'
import LoginPopUp from '@/components/popup/LoginPopUp.vue'
import AccountPopUp from '@/components/popup/AccountPopUp.vue'
import { Session, User } from '@/utils/session'

@Component({
  components: {
    LoginPopUp,
    AccountPopUp
  }
})
export default class NavBar extends Vue {
  drawer = true
  categories: Map<string, Route[]> = new Map()
  avatar: string | null = null

  created (): void {
    routes
      .filter(route => route.visibility)
      .forEach(route => {
        if (route.category === undefined) return
        const category = this.categories.get(route.category)
        if (category !== undefined) {
          category.push(route)
        } else {
          this.categories.set(route.category, [route])
        }
      })
  }

  mounted (): void {
    this.$root.$on('user-connection', (user: User) => this.setUser(user))
    this.$root.$on('user-disconnection', () => this.removeUser())
    this.setUser(Session.getUser())
  }

  setUser (user: User | null): void {
    if (user != null && user.picture != null) {
      this.avatar = user.picture
    }
  }

  removeUser (): void {
    this.avatar = null
  }

  toggleDarkMode (): void {
    this.$vuetify.theme.dark = !this.$vuetify.theme.dark
    Session.setTheme('dark')
    this.$root.$emit('changeDarkMode')
  }
}
</script>
