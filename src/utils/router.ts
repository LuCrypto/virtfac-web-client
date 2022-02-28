import Vue, { ComponentOptions, AsyncComponent } from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Home from '../views/Home.vue'

// Contradiction analysis
import AboutContradictionAnalysis from '@/views/ContradictionAnalysis/AboutContradictionAnalysis.vue'

import DrawingShop from '@/views/RoutingAnalysis/RoutingAnalysis.vue'
import ContradictionAnalysisExpert from '@/views/ContradictionAnalysis/ExpertApproach.vue'
import ContradictionAnalysisSimulation from '@/views/ContradictionAnalysis/SimulationApproach.vue'
import ErgonomIO from '@/views/ErgonomIO/ErgonomIO.vue'
import ErgonomioMainMenu from '@/components/ergonomio_ui/ErgonomioMainMenu.vue'

Vue.use(VueRouter)

type Component = ComponentOptions<Vue> | typeof Vue | AsyncComponent

export class Route {
  icon = 'mdi-home'
  name = 'title'
  subname: string | undefined = undefined
  path = ''
  alias: string | undefined = undefined
  href = ''
  category = 'Other'
  visibility = true
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
    path: '/',
    alias: '/home',
    category: 'About us',
    component: Home
  }),
  new Route({
    icon: 'mdi-rocket-launch',
    name: 'Context',
    href:
      '/home#Le_contexte_du_projet_VIRTFac_:_Industrie_4.0.2C_l.27usine_du_futur',
    category: 'About us'
  }),
  new Route({
    icon: 'mdi-code-tags',
    name: 'Developments',
    href: '/home#Les_d.C3.A9veloppements_du_projet',
    category: 'About us'
  }),
  new Route({
    icon: 'mdi-human-dolly',
    name: 'Ergonomie',
    href: '/home#Ergonom.io.2C_l.27ergonomie_pour_l.27industrie_4.0',
    category: 'About us'
  }),
  new Route({
    icon: 'mdi-at',
    name: 'Contacts',
    href: '/home#Contact',
    category: 'About us'
  }),

  // COntradiction analyse
  new Route({
    icon: 'mdi-information-outline',
    name: 'About',
    subname: '',
    path: '/about-contradiction-analysis-expert',
    category: 'Contradiction Analysis',
    component: AboutContradictionAnalysis
  }),
  new Route({
    icon: 'mdi-graph',
    name: 'Expert approach',
    subname: '',
    path: '/contradiction-analysis-expert',
    category: 'Contradiction Analysis',
    component: ContradictionAnalysisExpert
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
    name: 'About',
    subname: '',
    path: '/about-drawing-shop',
    category: 'Routing  Analysis',
    component: DrawingShop
  }),
  new Route({
    icon: 'mdi-arrow-decision',
    name: 'Routing  Analysis',
    subname: 'a.k.a. Drawing Shop',
    path: '/drawing-shop',
    category: 'Routing  Analysis',
    component: DrawingShop
  }),

  // Ergonom.io
  new Route({
    icon: 'mdi-information-outline',
    name: 'About',
    subname: '',
    path: '/about-ergonom-io',
    category: 'Ergonom.io',
    component: ErgonomIO
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
    icon: 'mdi-gesture-swipe',
    name: 'Ergonomics',
    subname: 'Tool for ergonomic analysis',
    path: '/ergonom-io-analysis',
    category: 'Ergonom.io',
    component: ErgonomIO
  }),
  new Route({
    icon: 'mdi-package-variant-closed',
    name: 'Assets',
    subname: 'Asset management',
    path: '/ergonom-io-assets',
    category: 'Ergonom.io',
    component: ErgonomIO
  }),
  new Route({
    icon: 'mdi-human',
    name: 'Avatars',
    subname: 'Manage your avatars',
    path: '/ergonom-io-avatars',
    category: 'Ergonom.io',
    component: ErgonomIO
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
