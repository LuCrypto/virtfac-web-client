import Vue, { ComponentOptions, AsyncComponent } from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Home from '../views/Home.vue'
import DrawingShop from '@/views/DrawingShop.vue'
import ContradictionAnalysisExpert from '@/views/ContradictionAnalysisExpert.vue'
import ContradictionAnalysisSimulation from '@/views/ContradictionAnalysisSimulation.vue'
import ErgonomIO from '@/views/ErgonomIO.vue'
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
  new Route({
    icon: 'mdi-graph',
    name: 'Contradiction Analysis',
    subname: 'Expert approach',
    path: '/contradiction-analysis-expert',
    category: 'Softs',
    component: ContradictionAnalysisExpert
  }),
  new Route({
    icon: 'mdi-robot',
    name: 'Contradiction Analysis',
    subname: 'Simulation approach',
    path: '/contradiction-analysis-simulation',
    category: 'Softs',
    component: ContradictionAnalysisSimulation
  }),
  new Route({
    icon: 'mdi-arrow-decision',
    name: 'Routing  Analysis',
    subname: 'a.k.a. Drawing Shop',
    path: '/drawing-shop',
    category: 'Softs',
    component: DrawingShop
  }),
  new Route({
    icon: 'mdi-human',
    name: 'Ergonom.io',
    subname: 'Ergonomics and flow analysis',
    path: '/ergonom-io',
    category: 'Softs',
    component: ErgonomIO
  }),
  new Route({
    icon: 'mdi-human',
    name: 'ErgonomioMainMenu',
    subname: 'Ergonomics and flow analysis',
    path: '/ergonom-io-menu-main',
    category: 'Softs',
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
