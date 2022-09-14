import Vue from 'vue'
import Vuetify from 'vuetify/lib/framework'
import colors from 'vuetify/es5/util/colors'
import { Session } from './session'

import IconHand from '@/components/icons/IconHand.vue'
import IconHair from '@/components/icons/IconHair.vue'
import IconHat from '@/components/icons/IconHat.vue'
import IconPants from '@/components/icons/IconPants.vue'
import IconShoes from '@/components/icons/IconShoes.vue'
import IconBeard from '@/components/icons/IconBeard.vue'
import IconShirt from '@/components/icons/IconShirt.vue'
import IconMorph from '@/components/icons/IconMorph.vue'
import IconPlayerData from '@/components/icons/IconPlayerData.vue'
import IconSettings from '@/components/icons/IconSettings.vue'
import IconColours from '@/components/icons/IconColours.vue'
import IconFlagEnglish from '@/components/icons/IconFlagEnglish.vue'
import IconFlagGerman from '@/components/icons/IconFlagGerman.vue'
import IconFlagFrench from '@/components/icons/IconFlagFrench.vue'

import english from '@/utils/translations/english'
import german from '@/utils/translations/german'
import french from '@/utils/translations/french'

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
    },
    light: {
      primary: '#f5a406',
      secondary: colors.orange.base,
      accent: colors.cyan.base,
      error: colors.deepOrange.base,
      warning: colors.brown.base,
      info: colors.teal.base,
      success: colors.lightGreen.base
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

  lang: {
    locales: {
      english,
      french,
      german
    },
    current: Session.getLanguage()
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
      shoes: { component: IconShoes },
      morph: { component: IconMorph },
      settings: { component: IconSettings },
      playerData: { component: IconPlayerData },
      colours: { component: IconColours },
      flagEnglish: { component: IconFlagEnglish },
      flagGerman: { component: IconFlagGerman },
      flagFrench: { component: IconFlagFrench }
    }
  }
})
