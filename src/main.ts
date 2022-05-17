import 'core-js/stable'
import 'regenerator-runtime/runtime'
import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import router from './utils/router'
import vuetify from './utils/vuetify'

import './main.scss'

const vue = new Vue({
  router,
  vuetify,
  render: h => h(App)
})

const query = vue.$router.currentRoute.query
if (query.fullpage === 'true') {
  require('./unreal.scss')
}

Vue.config.devtools = false
Vue.config.productionTip = false
vue.$mount('#app')
