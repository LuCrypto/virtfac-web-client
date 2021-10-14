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
          <v-list-item v-for="(routeItem, j) in routeCategory.routeItemList" :key="j" router :to="routeItem.route">
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
  route: string
  constructor (icon: string, title: string, subtitle:string | null, route: string) {
    this.icon = icon
    this.title = title
    this.subtitle = subtitle
    this.route = route
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
      new RouteItem('mdi-home', 'Home', null, '/home'),
      new RouteItem('mdi-rocket-launch', 'Products', null, '/about'),
      new RouteItem('mdi-heart', 'Partners', null, '/about'),
      new RouteItem('mdi-map-marker', 'We were there !', null, '/about'),
      new RouteItem('mdi-calendar-text-outline', 'Events', null, '/about')
    ]),
    new RouteCategory('Softs', [
      new RouteItem('mdi-graph', 'Contradiction Analysis', 'Expert approach', '/contradiction-analysis-expert'),
      new RouteItem('mdi-robot', 'Contradiction Analysis', 'Simulation approach', '/contradiction-analysis-simulation'),
      new RouteItem('mdi-arrow-decision', 'Routing  Analysis', 'a.k.a. Drawing Shop', '/drawing-shop')
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
