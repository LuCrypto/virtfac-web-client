import 'core-js/stable'
import 'regenerator-runtime/runtime'
import Vue from 'vue'
import App from './App.vue'
import router from './utils/router'
import vuetify from './utils/vuetify'
import { Session } from './utils/session'

import './main.scss'

Session.setTheme(Session.getTheme())
Session.setLanguage(Session.getLanguage())

const vue = new Vue({
  router,
  vuetify,
  render: h => h(App)
})

router.beforeEach((to: any, from: any) => {
  vue.$root.$emit('reload', to)
  return false
})

Vue.config.devtools = false
Vue.config.productionTip = false
vue.$mount('#app')
