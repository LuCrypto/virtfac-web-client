<template>
  <v-card>
    <v-img height="300px" src="../assets/ergonom_io.png"></v-img>
    <v-col class="px-5" style="transform: translateY(-50px);">
      <v-avatar size="150">
        <v-img :src="user.picture"></v-img>
      </v-avatar>
      <v-list-item color="rgba(0, 0, 0, .4)">
        <v-list-item-content>
          <v-list-item-title class="title"
            >{{ user.firstname }} {{ user.lastname }}</v-list-item-title
          >
          <v-list-item-subtitle>Alias {{ user.pseudo }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-col>
    <v-card-text>
      <v-simple-table>
        <template v-slot:default>
          <tbody>
            <tr>
              <td class="text-right primary--text">Firstname</td>
              <td class="text-left">{{ user.firstname }}</td>
            </tr>
            <tr>
              <td class="text-right primary--text">Lastname</td>
              <td class="text-left">{{ user.lastname }}</td>
            </tr>
            <tr>
              <td class="text-right primary--text">Login</td>
              <td class="text-left">{{ user.login }}</td>
            </tr>
            <tr>
              <td class="text-right primary--text">Mail</td>
              <td class="text-left">{{ user.mail }}</td>
            </tr>
            <tr>
              <td class="text-right primary--text">Phone</td>
              <td class="text-left">{{ user.phone }}</td>
            </tr>
            <tr>
              <td class="text-right primary--text">Pseudo</td>
              <td class="text-left">{{ user.pseudo }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card-text>
    <v-card-actions class="pb-5">
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="logout" dark>
        Log out
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Session, User } from '@/utils/session'

@Component({
  components: {}
})
export default class AccountPopUp extends Vue {
  user: User | null = null

  created (): void {
    this.user = Session.getUser()
  }

  logout (): void {
    Session.deleteUser()
    this.$root.$emit('user-disconnection')
    this.$emit('close')
  }
}
</script>
