<template>
  <nav class="nav-bar">
    <!-- Vertical bar -->
    <v-app-bar app color="primary" light>
      <v-app-bar-nav-icon @click="drawer=!drawer"></v-app-bar-nav-icon>
      <div class="d-flex align-center">
        <div class="display-2 font-weight-black">VIRTFac</div>
      </div>
      <v-spacer></v-spacer>
      <v-btn target="#" icon color="grey darken-4" class="mr-2 d-sm-none">
        <v-icon>mdi-account-circle</v-icon>
      </v-btn>
      <v-btn target="#" text class="mr-2 d-none d-sm-block">
        <span class="mr-4">Connexion</span>
        <v-icon>mdi-account-circle</v-icon>
      </v-btn>
      <v-btn icon @click="toggleDarkMode" :color="getInvertThemeColor">
        <v-icon>mdi-circle-half-full</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Side nav bar -->
    <v-navigation-drawer v-model="drawer" app width="300" mobile-breakpoint="1000">
      <v-list>
        <v-list-item-group v-for="(routeCategory, i) in routeCategoryList" :key="i">
          <v-subheader>{{ routeCategory.header }}</v-subheader>
          <v-list-item v-for="(routeItem, j) in routeCategory.routeItemList" :key="j" router :to="routeItem.to" :href="routeItem.href">
            <v-list-item-action>
              <v-icon>{{ routeItem.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ routeItem.title }}</v-list-item-title>
              <v-list-item-subtitle v-if="routeItem.subtitle != null">{{ routeItem.subtitle }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>
  </nav>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

class RouteItem {
  icon: string
  title: string
  subtitle: string | null
  to: string
  href: string
  constructor (icon: string, title: string, subtitle:string | null, to: string, href: string) {
    this.icon = icon
    this.title = title
    this.subtitle = subtitle
    this.to = to
    this.href = href
  }
}

class RouteCategory {
  header: string
  routeItemList: RouteItem[]
  constructor (header: string, routeItemList: RouteItem[]) {
    this.header = header
    this.routeItemList = routeItemList
  }
}

@Component
export default class NavBar extends Vue {
  drawer = true
  routeCategoryList: RouteCategory[] = [
    new RouteCategory('About us', [
      new RouteItem('mdi-home', 'Home', null, '/home', ''),
      new RouteItem('mdi-rocket-launch', 'Context', null, '', '/home#Le_contexte_du_projet_VIRTFac_:_Industrie_4.0.2C_l.27usine_du_futur'),
      new RouteItem('mdi-code-tags', 'Developments', null, '', '/home#Les_d.C3.A9veloppements_du_projet'),
      new RouteItem('mdi-human-dolly', 'Ergonomie', null, '', '/home#Ergonom.io.2C_l.27ergonomie_pour_l.27industrie_4.0'),
      new RouteItem('mdi-at', 'Contacts', null, '', '/home#Contact')
    ]),
    new RouteCategory('Softs', [
      new RouteItem('mdi-graph', 'Contradiction Analysis', 'Expert approach', '/contradiction-analysis-expert', ''),
      new RouteItem('mdi-robot', 'Contradiction Analysis', 'Simulation approach', '/contradiction-analysis-simulation', ''),
      new RouteItem('mdi-arrow-decision', 'Routing  Analysis', 'a.k.a. Drawing Shop', '/drawing-shop', ''),
      new RouteItem('mdi-human', 'Ergonom.io', 'Ergonomics and flow analysis', '/ergonom-io', '')
    ])
  ]

  toggleDarkMode () : void{
    this.$vuetify.theme.dark = !this.$vuetify.theme.dark
    this.$root.$emit('changeDarkMode')
  }

  get getInvertThemeColor () : string {
    return this.$vuetify.theme.dark ? 'white' : 'black'
  }
}
</script>
