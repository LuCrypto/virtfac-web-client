import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Home from '../views/Home.vue'
import DrawingShop from '@/views/DrawingShop.vue'
import ContradictionAnalysisExpert from '@/views/ContradictionAnalysisExpert.vue'
import ContradictionAnalysisSimulation from '@/views/ContradictionAnalysisSimulation.vue'
import ErgonomIO from '@/views/ErgonomIO.vue'
import ErgonomioMainMenu from '@/components/ergonomio_ui/ErgonomioMainMenu.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'home',
    alias: '/home',
    component: Home
  },
  {
    path: '/drawing-shop',
    name: 'DrawingShop',
    component: DrawingShop
  },
  {
    path: '/contradiction-analysis-expert',
    name: 'ContradictionAnalysisExpert',
    component: ContradictionAnalysisExpert
  },
  {
    path: '/contradiction-analysis-simulation',
    name: 'ContradictionAnalysisSimulation',
    component: ContradictionAnalysisSimulation
  },
  {
    path: '/ergonom-io',
    name: 'ErgonomIO',
    component: ErgonomIO
  },
  {
    path: '/ergonom-io-menu-main',
    name: 'ErgonomioMainMenu',
    component: ErgonomioMainMenu
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
