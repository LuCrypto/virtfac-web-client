<style scoped>
.rounded-icon {
  border-radius: 50%;
  overflow: hidden;
}
.rounded-icon.selected {
  box-shadow: 0 0 0 3px white;
}
</style>

<template>
  <nav class="nav-bar">
    <!-- Vertical bar -->
    <v-app-bar app color="primary" light>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <div class="d-flex align-center">
        <div
          class="display-2 font-weight-black"
          style="user-select: none;"
          @click="clickTitle()"
        >
          VIRTFac
        </div>
      </div>
      <v-spacer></v-spacer>

      <!-- Small login button -->
      <v-btn
        v-if="avatar == null"
        target="#"
        icon
        color="grey darken-4"
        class="mr-2 d-sm-none"
        @click="() => $refs.loginPopUp.open()"
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

      <!-- Language selection -->
      <v-btn icon @click="setLanguage('english')">
        <v-icon
          class="rounded-icon"
          :class="this.$vuetify.lang.current === 'english' ? 'selected' : ''"
          >$vuetify.icons.flagEnglish</v-icon
        >
      </v-btn>
      <v-btn icon @click="setLanguage('french')">
        <v-icon
          class="rounded-icon"
          :class="this.$vuetify.lang.current === 'french' ? 'selected' : ''"
          >$vuetify.icons.flagFrench</v-icon
        >
      </v-btn>
      <v-btn icon @click="setLanguage('german')">
        <v-icon
          class="rounded-icon"
          :class="this.$vuetify.lang.current === 'german' ? 'selected' : ''"
          >$vuetify.icons.flagGerman</v-icon
        >
      </v-btn>
    </v-app-bar>

    <!-- Side nav bar -->
    <v-navigation-drawer
      v-model="drawer"
      app
      width="300"
      mobile-breakpoint="1000"
      :key="$vuetify.theme.dark"
    >
      <v-list>
        <v-list-item-group v-for="(category, i) in categories.keys()" :key="i">
          <v-subheader v-if="avatar != null">{{ category }}</v-subheader>
          <v-list-item
            v-for="(route, j) in categories.get(category)"
            :key="j * i"
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

    <!-- Popups -->
    <pop-up ref="loginPopUp">
      <login @close="$refs.loginPopUp.close()"></login>
    </pop-up>

    <pop-up ref="accountPopUp">
      <account @close="$refs.accountPopUp.close()"></account>
    </pop-up>
  </nav>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { routes, Route } from '@/utils/router'
import { Session, User } from '@/utils/session'
import { APIOdooMenuItem } from '@/utils/models'
import API from '@/utils/api'
import Account from '@/components/Account.vue'
import Login from '@/components/Login.vue'
import PopUp from '@/components/PopUp.vue'
import Home from '../views/Home.vue'

@Component({
  name: 'NavBar',
  components: {
    PopUp,
    Login,
    Account
  }
})
// @vuese
// @group COMPONENTS
export default class NavBar extends Vue {
  drawer = false
  categories: Map<string, Route[]> = new Map()
  avatar: string | null = null
  clickTitleNumber = 0

  created (): void {
    this.updateLanguage()
    this.updateMenu()
    // this.getMainMenu()
  }

  mounted (): void {
    this.$root.$on('user-connection', (user: User) => this.setUser(user))
    this.$root.$on('user-disconnection', () => this.removeUser())
    this.$root.$on('close-navbar', () => (this.drawer = false))
    this.$root.$on('open-navbar', () => (this.drawer = true))
    this.$root.$on('toggle-navbar', () => (this.drawer = !this.drawer))
    this.setUser(Session.getUser())
  }

  updateMenu (): void {
    this.categories = new Map()
    routes
      .filter(route => {
        return route.visibility && !(route.restricted && !this.avatar)
      })
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

  // TODO : Create menu from Odoo menu
  getMainMenu (): void {
    API.get(this, '/odoo/web-main-menu', null).then((response: Response) => {
      const mainMenu = (response as unknown) as APIOdooMenuItem[]

      console.log('MAIN', mainMenu)
      const category = this.categories.get('About us')
      if (!mainMenu || !category) return
      mainMenu.forEach(item => {
        console.log('ITEM', item)
        category.push(
          new Route({
            icon: 'mdi-information-outline',
            name: item.name,
            subname: '',
            category: 'About us',
            replace: true,
            component: Home
          })
        )
      })
    })
  }

  setUser (user: User | null): void {
    if (user != null && user.picture != null) {
      this.avatar = user.picture
    }
    this.updateMenu()
  }

  removeUser (): void {
    this.avatar = null
    this.updateMenu()
  }

  toggleDarkMode (): void {
    this.$vuetify.theme.dark = !this.$vuetify.theme.dark
    Session.setTheme(this.$vuetify.theme.dark ? 'dark' : 'light')
    this.$root.$emit('changeDarkMode')
  }

  clickTitle (): void {
    if (this.clickTitleNumber++ < 10) return
    fetch(
      'https://v2.jokeapi.dev/joke/Any?lang=fr&format=txt&type=twopart'
    ).then(response => {
      response.text().then(text => this.$root.$emit('bottom-message', text))
    })
  }

  setLanguage (language: string): void {
    Session.setLanguage(language)
    this.updateLanguage()
    this.$root.$emit('changeLanguage')
  }

  updateLanguage (): void {
    this.$vuetify.lang.current = Session.getLanguage()
  }
}
</script>
