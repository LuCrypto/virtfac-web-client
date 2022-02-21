import Vue from 'vue'
import App from './App.vue'
import router from './utils/router'
import vuetify from './utils/vuetify'

import './main.scss'

Vue.config.devtools = false
Vue.config.productionTip = false

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
