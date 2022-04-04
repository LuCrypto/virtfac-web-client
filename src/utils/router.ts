import Vue, { ComponentOptions, AsyncComponent } from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Home from '../views/Home.vue'

// Contradiction analysis
import AboutContradictionAnalysis from '@/views/ContradictionAnalysis/AboutContradictionAnalysis.vue'

import AboutRoutingAnalysis from '@/views/RoutingAnalysis/AboutRoutingAnalysis.vue'
import DrawingShop from '@/views/RoutingAnalysis/RoutingAnalysis.vue'
// import ContradictionAnalysisExpert from '@/views/ContradictionAnalysis/ExpertApproach.vue'
import ContradictionAnalysisSimulation from '@/views/ContradictionAnalysis/SimulationApproach2.vue'
import ContradictionAnalysisGraph from '@/views/ContradictionAnalysis/ExpertApproach2.vue'

import AboutErgonomIO from '@/views/ErgonomIO/AboutErgonomIO.vue'
import ErgonomIO from '@/views/ErgonomIO/ErgonomIO.vue'
import ErgonomIOAnalysis from '@/views/ErgonomIO/ErgonomIOAnalysis.vue'
import ErgonomIOAssets from '@/views/ErgonomIO/ErgonomIOAssets.vue'
import ErgonomIOAvatars from '@/views/ErgonomIO/ErgonomIOAvatars.vue'
import ErgonomioMainMenu from '@/components/ergonomio_ui/ErgonomioMainMenu.vue'
import DatabaseViewer from '@/views/APIDocumentation/DatabaseViewer.vue'
import APIDocumentation from '@/views/APIDocumentation/APIDocumentation.vue'

Vue.use(VueRouter)

type Component = ComponentOptions<Vue> | typeof Vue | AsyncComponent

export class Route {
  icon = 'mdi-home'
  name = 'title'
  subname: string | undefined = undefined
  path = ''
  alias: string | undefined = undefined
  href: string | undefined = undefined
  category = 'Other'
  visibility = true
  restricted = true

  replace = false
  component: Component | undefined = undefined
  constructor (attributes?: Partial<Route>) {
    Object.assign(this, attributes)
  }
}

export const routes: Array<Route> = [
  // Web front pages
  new Route({
    icon: 'mdi-home',
    name: 'Home',
    path: '/home',
    category: 'About us',
    restricted: false,
    component: Home
  }),

  // Contradiction analyse
  new Route({
    icon: 'mdi-information-outline',
    name: 'About contradiction',
    subname: '',
    path: '/about-contradiction-analysis-expert',
    category: 'Contradiction Analysis',
    restricted: false,
    component: AboutContradictionAnalysis
  }),
  // new Route({
  //   icon: 'mdi-graph',
  //   name: 'Expert approach',
  //   subname: '',
  //   path: '/contradiction-analysis-expert',
  //   category: 'Contradiction Analysis',
  //   component: ContradictionAnalysisExpert
  // }),
  new Route({
    icon: 'mdi-graph',
    name: 'Expert approach',
    subname: '',
    path: '/contradiction-analysis-expert2',
    category: 'Contradiction Analysis',
    component: ContradictionAnalysisGraph
  }),
  new Route({
    icon: 'mdi-robot',
    name: 'Simulation approach',
    subname: '',
    path: '/contradiction-analysis-simulation',
    category: 'Contradiction Analysis',
    component: ContradictionAnalysisSimulation
  }),

  // Routing analysis
  new Route({
    icon: 'mdi-information-outline',
    name: 'About routing analysis',
    subname: '',
    path: '/about-routing-analysis',
    category: 'Routing  Analysis',
    restricted: false,
    component: AboutRoutingAnalysis
  }),
  new Route({
    icon: 'mdi-arrow-decision',
    name: 'Routing  Analysis',
    subname: 'a.k.a. Drawing Shop',
    path: '/routing-analysis',
    category: 'Routing  Analysis',
    component: DrawingShop
  }),

  // Ergonom.io
  new Route({
    icon: 'mdi-information-outline',
    name: 'About Ergonom.io',
    subname: '',
    path: '/about-ergonom-io',
    category: 'Ergonom.io',
    restricted: false,
    component: AboutErgonomIO
  }),
  new Route({
    icon: 'mdi-factory',
    name: 'Ergonom.io',
    subname: 'A virtual twin tool',
    path: '/ergonom-io',
    category: 'Ergonom.io',
    component: ErgonomIO
  }),
  new Route({
    icon: 'mdi-finance',
    name: 'Gesture analysis',
    subname: 'Tool for ergonomic analysis',
    path: '/ergonom-io-analysis',
    category: 'Ergonom.io',
    component: ErgonomIOAnalysis
  }),
  new Route({
    icon: 'mdi-package-variant-closed',
    name: 'Assets',
    subname: 'Asset management',
    path: '/ergonom-io-assets',
    category: 'Ergonom.io',
    component: ErgonomIOAssets
  }),
  new Route({
    icon: 'mdi-human',
    name: 'Avatars',
    subname: 'Manage your avatars',
    path: '/ergonom-io-avatars',
    category: 'Ergonom.io',
    component: ErgonomIOAvatars
  }),

  // Documentation
  new Route({
    icon: 'mdi-database',
    name: 'Database',
    subname: 'Show database structure',
    path: '/documentation-database',
    category: 'Documentation',
    component: DatabaseViewer
  }),

  new Route({
    icon: 'mdi-database',
    name: 'API',
    subname: 'API documentation',
    path: '/documentation-api',
    category: 'Documentation',
    component: APIDocumentation
  }),

  // Hidded menus
  new Route({
    icon: 'mdi-human',
    name: 'ErgonomioMainMenu',
    subname: 'Ergonomics and flow analysis',
    path: '/ergonom-io-menu-main',
    category: 'Ergonom.io',
    component: ErgonomioMainMenu,
    visibility: false
  })
]

const routesConfigs: Array<RouteConfig> = routes.map(
  route => route as RouteConfig
)

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: routesConfigs
})

export default router
