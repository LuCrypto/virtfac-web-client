<template>
  <v-container
    fluid
    class="d-flex flex-wrap pt-6 pl-6"
    style="max-height: 100%; overflow: auto;"
  >
    <v-flex>
      <v-card elevation="3" class="mb-6 mr-6">
        <v-card-title>VIRTFac API Documentation</v-card-title>
        <v-card-subtitle
          >Here is the documentation for the application programming interface
          (API). The API is a server on which it is possible for a web browser
          or other (such as a game engine with Ergonomio Virtual Twin) to make
          requests to load or retrieve data from the VIRTFac database. This data
          is then formatted to be usable by a user.</v-card-subtitle
        >
      </v-card>
      <v-card class="mb-6 mr-6">
        <v-treeview :open="[0]" activatable :items="[rootItem]"
          ><template v-slot:prepend="{ item, open }">
            <v-icon v-if="!item.request" :class="open ? 'primary--text' : ''">
              {{
                item.children.length === 0
                  ? 'mdi-send'
                  : open
                  ? 'mdi-folder-open'
                  : 'mdi-folder'
              }}
            </v-icon>
            <div v-else>
              <v-chip
                style="min-width: 65px;"
                class="ma-2"
                :color="getTypeColor(item.request.type)"
              >
                {{ item.request.type }}
              </v-chip>
              {{ item.request.path }}
            </div>
          </template>
        </v-treeview>
      </v-card>
    </v-flex>

    <v-flex>
      <v-card
        v-for="(request, index) in requests"
        :key="index"
        class="mb-6 mr-6"
      >
        <v-card-title
          class="text-h6 black--text py-0 px-2"
          :class="getTypeColor(request.type)"
        >
          <div>
            <b>{{ request.type }} </b>
            <span class="white--text">
              {{ request.path }}
            </span>
          </div>
        </v-card-title>

        <v-card-text class="px-4 py-2">
          <p>Access: {{ request.access }}</p>
          <p>Input: {{ request.documentation.inputInfo }}</p>
          <p>Output: {{ request.documentation.outputInfo }}</p>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import API from '@/utils/api'
import { APIRequest } from '@/utils/models'

interface TreeItem {
  id: number
  name: string
  children: TreeItem[]
  request: APIRequest | null
}

@Component
export default class APIDocumentation extends Vue {
  requests: APIRequest[] = []

  rootItem: TreeItem = {
    id: 0,
    name: 'root',
    children: [],
    request: null
  }

  mounted (): void {
    this.showDocumentation()
  }

  getTypeColor (type: string): string {
    switch (type) {
      case 'get':
      case 'post':
        return 'blue'
      case 'put':
        return 'green'
      case 'delete':
        return 'red'
      case 'patch':
        return 'orange'
    }

    return ''
  }

  showDocumentation (): void {
    API.get(this, '/', null).then((response: Response) => {
      // console.log('hello doc ', response)
      this.requests = (response as unknown) as APIRequest[]

      let id = 0

      this.requests.forEach(request => {
        let itemIterator: TreeItem = this.rootItem

        // Create item hierarchy
        request.path
          .split('/')
          .filter(value => value && !value.includes(':'))
          .forEach(value => {
            const nextIterator = itemIterator.children
              .filter(treeItem => treeItem.name === value)
              .pop()
            if (nextIterator == null) {
              const nextItemIterator = {
                id: ++id,
                name: value,
                children: [],
                request: null
              } as TreeItem
              itemIterator.children.push(nextItemIterator)
              itemIterator = nextItemIterator
            } else {
              itemIterator = nextIterator
            }
          })

        // Create item
        itemIterator.children.push({
          id: ++id,
          name: '',
          children: [],
          request: request
        })
      })
    })
  }
}
</script>
