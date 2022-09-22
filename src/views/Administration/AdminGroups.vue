<template>
  <v-container
    fluid
    class="d-flex flex-column"
    style="background-color: rgba(128, 128, 128, 0.2)"
  >
    <v-img contain src="peoples.png" max-height="300px"></v-img>

    <v-card height="350px">
      <v-navigation-drawer absolute permanent left>
        <template v-slot:prepend>
          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title
                ><v-icon left>mdi-account-multiple</v-icon>Vos
                groupes</v-list-item-title
              >
            </v-list-item-content>
          </v-list-item>
        </template>

        <v-divider></v-divider>

        <v-list dense>
          <v-list-item
            link
            v-for="(group, groupIndex) in groups"
            :key="groupIndex"
          >
            <v-list-item-content>
              <v-list-item-title>{{ group.name }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-card-text>
        <v-btn>Coucou</v-btn>
      </v-card-text>
    </v-card>

    <v-list
      class="pa-0"
      style="overflow-y: auto; overflox-x: none; background-color: rgba(128, 128, 128, 0.1); border-radius: 4px; flex-grow: 1;"
    >
      <v-list-group
        v-for="(group, index) in groups"
        :key="index"
        v-model="group.selected"
        prepend-icon="mdi-account-multiple"
        no-action
      >
        <template v-slot:activator>
          <v-list-item-content
            :color="`#${group.color.toString(16).padStart(6, '0')}`"
          >
            <v-list-item-title v-text="group.name"></v-list-item-title>
          </v-list-item-content>
        </template>

        <div v-if="group.users.length > 0">
          <v-list-item
            link
            v-for="(user, userIndex) in group.users"
            :key="userIndex"
          >
            <v-list-item-title v-text="user.name"></v-list-item-title>
            <v-list-item-icon>
              <v-icon color="red" v-text="'mdi-cog'"></v-icon>
            </v-list-item-icon>
          </v-list-item>
        </div>
        <v-list-item v-else> No users in this group</v-list-item>
      </v-list-group>
    </v-list>
    <v-card-actions class="px-0 pt-4" style="display: flex;">
      <v-btn color="primary" class="black--text" style="flex-grow: 1;">
        <v-icon left>
          mdi-plus
        </v-icon>
        Ajouter un groupe
      </v-btn>
    </v-card-actions>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import API from '@/utils/api'
import { APIGroup } from '@/utils/models'

class User {
  id = 0
  name = ''
  constructor (values: Partial<User>) {
    Object.assign(this, values)
  }
}

class Group extends APIGroup {
  users: User[] = []
  selected = false
  constructor (values: Partial<Group>) {
    super(values)
    Object.assign(this, values)
  }
}

@Component({
  name: 'Home',
  components: {}
})
// @vuese
// @group VIEWS
export default class AdminGroups extends Vue {
  apiGroups: APIGroup[] = []
  selectedGroup = 0
  groups: Group[] = []
  mounted (): void {
    this.getAPIProfiles()
  }

  getAPIProfiles (): void {
    API.get(this, '/user/groups', null).then((response: Response) => {
      this.apiGroups = (response as unknown) as APIGroup[]
      this.refreshGroups()
    })
  }

  refreshGroups (): void {
    this.groups = this.apiGroups.map(apiGroup => {
      const users = ['John', 'Jess', 'Quentin', 'Hugo'].map(
        name => new User({ name: name })
      )
      return new Group({ users: users, ...apiGroup })
    })
  }
}
</script>
