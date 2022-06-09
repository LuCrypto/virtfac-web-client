<template>
  <v-container class="spacing-playground pa-6 contradiction-analysis" fluid>
    <account v-if="user != null"></account>
    <login v-if="user == null"></login>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Login from '@/components/Login.vue'
import Account from '@/components/Account.vue'
import { Session, User } from '@/utils/session'
@Component({
  name: 'ErgonomIOLogin',
  components: {
    Login,
    Account
  }
})
// @vuese
// @group VIEWS
export default class ErgonomIOLogin extends Vue {
  user: User | null = null
  mounted (): void {
    this.$root.$on('user-connection', () => this.update())
    this.$root.$on('user-disconnection', () => this.update())
    this.update()
  }

  update (): void {
    this.user = Session.getUser()
  }
}
</script>
