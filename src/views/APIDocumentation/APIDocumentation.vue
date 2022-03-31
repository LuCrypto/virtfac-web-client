<template>
  <v-container fluid class="d-flex flex-wrap pt-6 pl-6">
    <h1>API Documentation</h1>
    <v-flex>
      <v-card
        v-for="(request, index) in requests"
        :key="index"
        class="mb-6 mr-6"
      >
        <v-card-title
          class="text-h6 black--text py-0 px-2"
          :class="getRequestClass(request.type)"
          ><b>{{ request.type }} </b> {{ request.path }}
        </v-card-title>
        <v-card-text class="px-0 py-2">
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

@Component
export default class APIDocumentation extends Vue {
  requests: APIRequest[] = []

  mounted (): void {
    this.showDocumentation()
  }

  showDocumentation (): void {
    API.get(this, '/', null).then((response: Response) => {
      console.log('hello doc ', response)
      this.requests = (response as unknown) as APIRequest[]
    })
  }

  getRequestClass (requestType: string): string {
    switch (requestType) {
      case 'get':
        return 'green'
      case 'post':
        return 'green'
      case 'put':
        return 'blue'
      case 'delete':
        return 'red'
      default:
        return 'primary'
    }
  }
}
</script>
