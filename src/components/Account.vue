<template>
  <v-card :rounded="unreal.check() ? 'xl' : 'md'">
    <v-container>
      <v-row align="center" justify="center" no-gutters>
        <v-avatar size="150">
          <v-img :src="user.picture"></v-img>
        </v-avatar>
      </v-row>
      <v-row align="center" justify="center">
        <h1 class="title">{{ user.firstname }} {{ user.lastname }}</h1>
      </v-row>
      <v-row align="center" justify="center" class="pt-2" no-gutters>
        <h2 class="subtitle-1">Alias {{ user.pseudo }}</h2>
      </v-row>
      <v-row align="center" justify="center" class="pt-2" no-gutters>
        <v-btn color="primary black--text" @click="logout" dark>
          Log out
        </v-btn>
      </v-row>
    </v-container>

    <v-simple-table>
      <template v-slot:default>
        <tbody>
          <tr>
            <td style="width: 50%" class="text-right primary--text">
              Firstname
            </td>
            <td style="width: 50%" class="text-left">{{ user.firstname }}</td>
          </tr>
          <tr>
            <td style="width: 50%" class="text-right primary--text">
              Lastname
            </td>
            <td style="width: 50%" class="text-left">{{ user.lastname }}</td>
          </tr>
          <tr>
            <td style="width: 50%" class="text-right primary--text">Login</td>
            <td style="width: 50%" class="text-left">{{ user.login }}</td>
          </tr>
          <tr>
            <td style="width: 50%" class="text-right primary--text">Mail</td>
            <td style="width: 50%" class="text-left">{{ user.mail }}</td>
          </tr>
          <tr>
            <td style="width: 50%" class="text-right primary--text">Phone</td>
            <td style="width: 50%" class="text-left">{{ user.phone }}</td>
          </tr>
          <tr>
            <td style="width: 50%" class="text-right primary--text">
              Pseudo
            </td>
            <td style="width: 50%" class="text-left">{{ user.pseudo }}</td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Session, User } from '@/utils/session'
import Unreal from '@/utils/unreal'

@Component({
  name: 'Account'
})
// @vuese
// @group COMPONENTS
export default class Account extends Vue {
  user: User | null = null
  unreal = Unreal

  created (): void {
    this.user = Session.getUser()
    Unreal.callback.$on('unreal-message', (data: unknown) => {
      this.$root.$emit('bottom-message', `Unreal : ${JSON.stringify(data)}`)
    })
  }

  logout (): void {
    Session.deleteUser()
    this.$root.$emit('user-disconnection')
    this.$emit('close')
  }
}
</script>
