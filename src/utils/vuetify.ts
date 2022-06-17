import Vue from 'vue'
import Vuetify from 'vuetify/lib/framework'
import colors from 'vuetify/es5/util/colors'
import { Session } from './session'
import icon from '@/components/icon.vue'

import IconHand from '@/components/icons/IconHand.vue'
import IconHair from '@/components/icons/IconHair.vue'
import IconHat from '@/components/icons/IconHat.vue'
import IconPants from '@/components/icons/IconPants.vue'
import IconShoes from '@/components/icons/IconShoes.vue'
import IconBeard from '@/components/icons/IconBeard.vue'
import IconShirt from '@/components/icons/IconShirt.vue'

class Themes {
  static themes = {
    dark: {
      primary: '#f5a406',
      secondary: colors.orange.base,
      accent: colors.cyan.base,
      error: colors.deepOrange.base,
      warning: colors.brown.base,
      info: colors.teal.base,
      success: colors.lightGreen.base
      // customs: {
      //   value: 1,
      //   backgroundColor: 'transparent',
      //   gridColor: 'black',
      //   nodeColor: 'orange',
      //   linkColor: 'white'
      // }
    },
    light: {
      primary: '#f5a406',
      secondary: colors.orange.base,
      accent: colors.cyan.base,
      error: colors.deepOrange.base,
      warning: colors.brown.base,
      info: colors.teal.base,
      success: colors.lightGreen.base
      // customs: {
      //   value: 1,
      //   backgroundColor: 'transparent',
      //   gridColor: 'black',
      //   nodeColor: 'orange',
      //   linkColor: 'white'
      // }
    }
  }

  static install () {
    Vue.prototype.themes = () => this.themes
  }

  static vuetify () {
    return {
      dark: this.themes.dark,
      light: this.themes.light
    }
  }
}

Vue.use(Vuetify)
Vue.use(Themes)
Vue.prototype.$globals = new Map()
// Vue.mixin({
//   data: () => {
//     return {
//       message: 'Hello World'
//     }
//   }
// })

/**
 * Global instantiation of Vuetify components
 */
export default new Vuetify({
  theme: {
    options: {
      customProperties: true
    },
    dark: Session.getTheme() === 'dark',
    themes: Themes.themes
  },

  icons: {
    values: {
      /* name of our custom icon */
      hand: { component: IconHand /* our custom component */ },
      hair: { component: IconHair },
      hat: { component: IconHat },
      pants: { component: IconPants },
      shirt: { component: IconShirt },
      beard: { component: IconBeard },
      shoes: { component: IconShoes }
    }
  }
})
