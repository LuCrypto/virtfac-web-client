<template>
  <v-container
    fluid
    class="d-flex flex-wrap pt-6 pl-6"
    style="max-height: 100%; overflow: auto;"
  >
    <v-container
      class="d-flex flex-column"
      style="max-height: 100%; overflow: auto;"
    >
      <v-card elevation="3" class="mb-6">
        <v-card-title>VIRTFac API Documentation</v-card-title>
        <v-card-subtitle
          >Here is the documentation for the application programming interface
          (API). The API is a server on which it is possible for a web browser
          or other (such as a game engine with Ergonomio Virtual Twin) to make
          requests to load or retrieve data from the VIRTFac database. This data
          is then formatted to be usable by a user.</v-card-subtitle
        >
      </v-card>
      <v-card class="flex-grow-1 d-flex flex-column" style="overflow: auto;">
        <v-toolbar
          v-if="$vuetify.breakpoint.mdAndDown"
          elevation="3"
          class="mb-2"
        >
          <v-app-bar-nav-icon
            @click.stop="showURLNavigation = !showURLNavigation"
            ><v-icon class="primary--text">mdi-folder</v-icon>
          </v-app-bar-nav-icon>
        </v-toolbar>
        <div class="flex-grow-1 d-flex" style="overflow: auto;">
          <v-navigation-drawer
            v-model="showURLNavigation"
            :permanent="$vuetify.breakpoint.lgAndUp"
            width="auto"
            :absolute="$vuetify.breakpoint.mdAndDown"
          >
            <v-treeview
              :items="rootItem.children"
              item-key="id"
              activatable
              open-on-click
              @update:active="values => scrollOnElement(values)"
            >
              <template v-slot:prepend="{ item, open }">
                <v-icon
                  v-if="!item.request"
                  :class="open ? 'primary--text' : ''"
                >
                  {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
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

              <template v-slot:label="{ item }">
                <div class="pr-4" style="cursor: pointer">{{ item.name }}</div>
              </template>
            </v-treeview>
          </v-navigation-drawer>
          <v-col style="overflow: auto;">
            <v-card
              v-for="(item, index) in requests"
              :key="index"
              :id="`request-item-${index}`"
              class="ma-4"
              :color="
                activeRequest !== index
                  ? ''
                  : $vuetify.theme.dark
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(0,0,0,0.1)'
              "
            >
              <v-card-title class="py-0 px-2" :class="getTypeColor(item.type)">
                <div>
                  <span style="text-transform: capitalize;">
                    {{ item.type }}
                  </span>
                  <span class="white--text">
                    {{ item.path }}
                  </span>
                </div>
              </v-card-title>

              <v-card-text class="pa-4 text--primary">
                <!-- Access -->
                <v-list-item two-line>
                  <v-list-item-content>
                    <v-list-item-title>
                      Request access : {{ item.access }}</v-list-item-title
                    >
                    <v-list-item-subtitle>
                      <div
                        class="text-wrap"
                        v-html="getAccessDocumentation(item.access)"
                      ></div
                    ></v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <!-- Input informations -->
                <v-list-item two-line>
                  <v-list-item-content>
                    <v-list-item-title>Input informations :</v-list-item-title>
                    <v-list-item-subtitle>
                      <div class="text-wrap">
                        {{ item.documentation.inputInfo }}
                      </div>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <!-- Output information -->
                <v-list-item two-line>
                  <v-list-item-content>
                    <v-list-item-title>Output informations :</v-list-item-title>
                    <v-list-item-subtitle>
                      <div class="text-wrap">
                        {{ item.documentation.inputInfo }}
                      </div>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item two-line>
                  <v-list-item-content>
                    <v-list-item-title
                      >Data format to be provided to the request
                      :</v-list-item-title
                    >
                    <v-list-item-subtitle
                      v-if="item.documentation.body.length > 0"
                    >
                      <v-card elevation="3" class="ma-2">
                        <v-simple-table dense>
                          <template v-slot:default>
                            <thead>
                              <tr>
                                <th class="text-left">
                                  Type
                                </th>
                                <th class="text-left">
                                  Field
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr
                                v-for="(field, index) in item.documentation
                                  .body"
                                :key="index"
                              >
                                <td>
                                  <b>{{ field.type }}</b> ({{ field.subtype }})
                                </td>
                                <td class="text--primary">
                                  {{ field.name }}
                                </td>
                              </tr>
                            </tbody>
                          </template>
                        </v-simple-table>
                      </v-card>
                    </v-list-item-subtitle>

                    <v-list-item-subtitle v-else
                      >No data required.</v-list-item-subtitle
                    >
                  </v-list-item-content>
                </v-list-item>

                <v-list-item two-line>
                  <v-list-item-content>
                    <v-list-item-title
                      >Parameters to be provided in request URL
                      :</v-list-item-title
                    >

                    <v-list-item-subtitle
                      v-if="item.documentation.params.length > 0"
                    >
                      <v-card elevation="3" class="ma-2">
                        <v-simple-table dense>
                          <template v-slot:default>
                            <thead>
                              <tr>
                                <th class="text-left">
                                  Informations
                                </th>
                                <th class="text-left">
                                  Field
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr
                                v-for="(field, index) in item.documentation
                                  .params"
                                :key="index"
                              >
                                <td>
                                  <b>{{ field.info }}</b>
                                </td>
                                <td class="text--primary">
                                  {{ field.name }}
                                </td>
                              </tr>
                            </tbody>
                          </template>
                        </v-simple-table>
                      </v-card>
                    </v-list-item-subtitle>
                    <v-list-item-subtitle v-else
                      >No parameter required.</v-list-item-subtitle
                    >
                  </v-list-item-content>
                </v-list-item>
              </v-card-text>
            </v-card>
          </v-col>
        </div>
      </v-card>
    </v-container>
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
  requestsReferences: Map<number, number> = new Map<number, number>()
  showURLNavigation = true
  activeRequest = -1

  rootItem: TreeItem = {
    id: 0,
    name: 'root',
    children: [],
    request: null
  }

  mounted (): void {
    this.showDocumentation()
  }

  getAccessDocumentation (access: number): string {
    switch (access) {
      case 0:
        return 'Anyone can access this path.'
      case 1:
        return 'This path is accessible to standard <b>logged-in</b> users.'
      case 2:
        return 'This path is accessible to connected <b>manager</b> users.'
      case 3:
        return 'This path is accessible to connected <b>administrator</b> users.'
      case 4:
        return 'This path is accessible to connected <b>root</b> users.'
    }
    return 'This type of access is not defined.'
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

  scrollOnElement (values: number[]): void {
    this.activeRequest = -1
    if (values.length === 0) return

    const index = values.pop() || 0
    this.activeRequest = this.requestsReferences.get(index) || -1
    if (this.activeRequest < 0) return

    const id = `#request-item-${this.activeRequest}`
    const dom = document.querySelector(id)

    if (dom) {
      dom.scrollIntoView()
    }
  }

  showDocumentation (): void {
    API.get(this, '/', null).then((response: Response) => {
      // console.log('hello doc ', response)
      this.requests = (response as unknown) as APIRequest[]

      console.log(this.requests)

      let id = 0

      this.requests.forEach((request, requestReference) => {
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
                request: null,
                reference: null
              } as TreeItem
              itemIterator.children.push(nextItemIterator)
              itemIterator = nextItemIterator
            } else {
              itemIterator = nextIterator
            }
          })

        // Create item
        const navigationItem = {
          id: ++id,
          name: '',
          children: [],
          request: request
        }
        itemIterator.children.push(navigationItem)

        // Set reference
        this.requestsReferences.set(id, requestReference)
      })
    })
  }
}
</script>
