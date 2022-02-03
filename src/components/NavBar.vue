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
        @click="() => $refs.connexionPopUp.open()"
      >
        <v-icon class="mr-2">mdi-account-circle</v-icon>
        <span>Connexion</span>
      </v-btn>

      <!-- Avatar -->
      <v-avatar v-if="avatar != null">
        <img :src="avatar" alt="John" />
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
    <connexion-pop-up ref="connexionPopUp"></connexion-pop-up>
  </nav>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { routes, Route } from '@/utils/router'
import ConnexionPopUp from '@/components/popup/ConnexionPopUp.vue'

@Component({
  components: {
    ConnexionPopUp
  }
})
export default class NavBar extends Vue {
  drawer = true
  categories: Map<string, Route[]> = new Map()
  avatar = null

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
    this.$root.$on('user-connection', () => {
      console.log('USER : ', Vue.prototype.$globals.get('user'))
      this.avatar = Vue.prototype.$globals.get('user').picture
    })
  }

  toggleDarkMode (): void {
    this.$vuetify.theme.dark = !this.$vuetify.theme.dark
    this.$root.$emit('changeDarkMode')
  }
}
</script>
