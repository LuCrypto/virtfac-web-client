<template>
  <nav class="nav-bar">
    <!-- Vertical bar -->
    <v-app-bar app color="primary" light>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <div class="d-flex align-center">
        <div class="display-2 font-weight-black">VIRTFac</div>
      </div>
      <v-spacer></v-spacer>
      <v-btn target="#" icon color="grey darken-4" class="mr-2 d-sm-none">
        <v-icon>mdi-account-circle</v-icon>
      </v-btn>
      <v-btn target="#" text class="mr-2 d-none d-sm-block">
        <span class="mr-4" @click="openConnexionPopup()">Connexion</span>
        <v-icon>mdi-account-circle</v-icon>
        <connexion-pop-up ref="connexionPopUp"></connexion-pop-up>
      </v-btn>
      <v-btn
        icon
        @click="toggleDarkMode"
        :color="this.$vuetify.theme.dark ? 'white' : 'black'"
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
  connexionPopup: ConnexionPopUp | null = null
  categories: Map<string, Route[]> = new Map()

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
    this.connexionPopup = this.$refs.connexionPopup as ConnexionPopUp
  }

  openConnexionPopup (): void {
    if (this.connexionPopup) {
      console.log(this.connexionPopup)
      this.connexionPopup.open()
    }
  }

  toggleDarkMode (): void {
    this.$vuetify.theme.dark = !this.$vuetify.theme.dark
    this.$root.$emit('changeDarkMode')
  }

  get getInvertThemeColor (): string {
    return this.$vuetify.theme.dark ? 'white' : 'black'
  }
}
</script>
