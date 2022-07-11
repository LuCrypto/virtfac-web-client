import 'core-js/stable'
import 'regenerator-runtime/runtime'
import Vue from 'vue'
import App from './App.vue'
import router from './utils/router'
import vuetify from './utils/vuetify'

import './main.scss'

const vue = new Vue({
  router,
  vuetify,
  render: h => h(App)
})

Vue.config.devtools = false
Vue.config.productionTip = false
vue.$mount('#app')
