import Vue, { ComponentOptions, AsyncComponent } from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

// Home
import Home from '../views/Home.vue'

// Contradiction analysis
import AboutContradictionAnalysis from '@/views/ContradictionAnalysis/AboutContradictionAnalysis.vue'
import ContradictionAnalysisSimulation from '@/views/ContradictionAnalysis/SimulationApproach2.vue'
import ContradictionAnalysisGraph from '@/views/ContradictionAnalysis/ExpertApproach2.vue'

// Routing Analysis
import AboutRoutingAnalysis from '@/views/RoutingAnalysis/AboutRoutingAnalysis.vue'
import DrawingShop from '@/views/RoutingAnalysis/RoutingAnalysis.vue'
import BlueprintDrawer from '@/views/RoutingAnalysis/BlueprintDrawer.vue'

// Dynamics Analysis
import DynamicsInput from '@/views/Dynamics/DynamicsInput.vue'
import DynamicsOutput from '@/views/Dynamics/DynamicsOutput.vue'

// Ergonomio
import AboutErgonomIO from '@/views/ErgonomIO/AboutErgonomIO.vue'
import ErgonomIO from '@/views/ErgonomIO/ErgonomIO.vue'
import ErgonomIOAnalysis from '@/views/ErgonomIO/ErgonomIOAnalysis.vue'
import ErgonomIOAsset from '@/views/ErgonomIO/ErgonomIOAsset.vue'
import ErgonomIOAssets from '@/views/ErgonomIO/ErgonomIOAssets.vue'
import ErgonomIOScenes from '@/views/ErgonomIO/ErgonomIOScenes.vue'
import ErgonomIORooms from '@/views/ErgonomIO/ErgonomIORooms.vue'
import ErgonomIODynamicsObjects from '@/views/ErgonomIO/ErgonomIODynamicsObjects.vue'
import ErgonomIOAvatars from '@/views/ErgonomIO/ErgonomIOAvatars.vue'
import ErgonomIOLogin from '@/views/ErgonomIO/ErgonomIOLogin.vue'
import ErgonomioMainMenu from '@/components/ergonomio_ui/ErgonomioMainMenu.vue'
import ErgonomIOProfiles from '@/views/WebMenus/WebMenuProfilesManager.vue'

// Documentation
import DatabaseViewer from '@/views/APIDocumentation/DatabaseViewer.vue'
import APIDocumentation from '@/views/APIDocumentation/APIDocumentation.vue'
import HelpEditor from '@/views/APIDocumentation/HelpEditor.vue'
import CodeStructure from '@/views/APIDocumentation/CodeStructure.vue'

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
    name: 'home',
    path: '/home',
    alias: '/',
    category: 'About us',
    restricted: false,
    component: Home
  }),

  // Contradiction analyse
  new Route({
    icon: 'mdi-information-outline',
    name: 'aboutContradiction',
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
    name: 'expertApproach',
    subname: '',
    path: '/contradiction-analysis-expert2',
    category: 'Contradiction Analysis',
    component: ContradictionAnalysisGraph
  }),
  new Route({
    icon: 'mdi-robot',
    name: 'simulationApproach',
    subname: '',
    path: '/contradiction-analysis-simulation',
    category: 'Contradiction Analysis',
    component: ContradictionAnalysisSimulation
  }),

  // Routing analysis
  new Route({
    icon: 'mdi-information-outline',
    name: 'aboutRoutingAnalysis',
    subname: '',
    path: '/about-routing-analysis',
    category: 'Routing  Analysis',
    restricted: false,
    component: AboutRoutingAnalysis
  }),
  new Route({
    icon: 'mdi-arrow-decision',
    name: 'routingAnalysis',
    subname: 'a.k.a. Drawing Shop',
    path: '/routing-analysis',
    category: 'Routing  Analysis',
    component: DrawingShop
  }),
  new Route({
    icon: 'mdi-floor-plan',
    name: 'blueprintEditor',
    subname: 'a.k.a. Drawing Shop',
    path: '/blueprint-editor',
    category: 'Routing  Analysis',
    component: BlueprintDrawer
  }),

  // Dynamics analysis
  new Route({
    icon: 'mdi-share-variant',
    name: 'input',
    subname: 'shareDynamicsFiles',
    path: '/dynamics-input',
    category: 'Dynamics Analysis',
    component: DynamicsInput
  }),
  new Route({
    icon: 'mdi-chart-box',
    name: 'output',
    subname: 'Dynamics analysis',
    path: '/dynamics-output',
    category: 'Dynamics Analysis',
    component: DynamicsOutput
  }),

  // Ergonom.io
  new Route({
    icon: 'mdi-information-outline',
    name: 'aboutErgonomIO',
    subname: '',
    path: '/about-ergonom-io',
    category: 'Ergonom.io',
    restricted: false,
    component: AboutErgonomIO
  }),
  new Route({
    icon: 'mdi-factory',
    name: 'virtualTwin',
    subname: 'Virtual reality tool',
    path: '/ergonom-io',
    category: 'Ergonom.io',
    component: ErgonomIO
  }),
  new Route({
    icon: 'mdi-finance',
    name: 'gestureAnalysis',
    subname: 'Tool for ergonomic analysis',
    path: '/ergonom-io-analysis',
    category: 'Ergonom.io',
    component: ErgonomIOAnalysis
  }),
  new Route({
    icon: 'mdi-nature-people',
    name: 'scenes',
    subname: 'Scene management',
    path: '/ergonom-io-scene',
    category: 'Ergonom.io',
    component: ErgonomIOScenes
  }),
  new Route({
    icon: 'mdi-package-variant-closed',
    name: 'assetsLibrary',
    subname: 'List of all assets',
    path: '/ergonom-io-assets',
    category: 'Ergonom.io',
    component: ErgonomIOAssets
  }),
  new Route({
    icon: 'mdi-cube-send',
    name: 'assetEditor',
    subname: 'Upload & edit assets',
    path: '/ergonom-io-asset',
    category: 'Ergonom.io',
    component: ErgonomIOAsset
  }),
  new Route({
    icon: 'mdi-account-supervisor-circle',
    name: 'collaborativeSessions',
    subname: 'For virtual meetings',
    path: '/ergonom-io-rooms',
    category: 'Ergonom.io',
    component: ErgonomIORooms
  }),
  new Route({
    icon: 'mdi-factory',
    name: 'dynamicsObjects',
    subname: 'OPC UA',
    path: '/ergonom-io-opcua',
    category: 'Ergonom.io',
    component: ErgonomIODynamicsObjects
  }),
  new Route({
    icon: 'mdi-human',
    name: 'avatars',
    subname: 'Manage your avatars',
    path: '/ergonom-io-avatars',
    category: 'Ergonom.io',
    component: ErgonomIOAvatars
  }),
  new Route({
    icon: 'mdi-human',
    name: 'avatars',
    subname: 'Profiles manager',
    path: '/ergonom-io-profiles-manager',
    category: 'Ergonom.io',
    component: ErgonomIOProfiles
  }),

  // Documentation
  new Route({
    icon: 'mdi-database',
    name: 'database',
    subname: 'Show database structure',
    path: '/documentation-database',
    category: 'Documentation',
    component: DatabaseViewer
  }),

  new Route({
    icon: 'mdi-swap-horizontal',
    name: 'API',
    subname: 'Interface documentation',
    path: '/documentation-api',
    category: 'Documentation',
    component: APIDocumentation
  }),

  new Route({
    icon: 'mdi-help-circle-outline',
    name: 'help',
    subname: 'Applications guide',
    path: '/help-editor',
    category: 'Documentation',
    component: HelpEditor
  }),
  new Route({
    icon: 'mdi-xml',
    name: 'codeStructure',
    subname: 'Of vue project',
    path: '/code-structure',
    category: 'Documentation',
    component: CodeStructure
  }),

  // Hidded menus
  new Route({
    icon: 'mdi-human',
    name: 'ergonomioLogin',
    subname: 'Ergonomics login',
    path: '/ergonom-io-login',
    category: 'Ergonom.io',
    component: ErgonomIOLogin,
    visibility: false
  }),

  new Route({
    icon: 'mdi-human',
    name: 'ergonomioMainMenu',
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
