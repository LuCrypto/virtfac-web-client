<template>
  <v-container fluid :key="updateTables" class="d-flex flex-wrap pt-6 pl-6">
    <v-card v-for="table in tables" :key="table.name" class="mb-6 mr-6">
      <v-card-title class="text-h6 primary black--text py-0 px-2"
        >{{ table.name }}
      </v-card-title>
      <v-card-text class="pa-6">
        <div v-for="(field, index) in table.fields" :key="index">
          <span class="primary--text">{{ field.type }} </span>
          <span
            :class="/id.{1}/i.test(field.name) ? 'blue--text' : 'text--primary'"
            >{{ field.name }}
          </span>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import API from '@/utils/api'
import { APIDatabaseTable, APIDatabaseField } from '@/utils/models'

@Component
export default class DatabaseViewer extends Vue {
  tables: APIDatabaseTable[] = []
  updateTables = 0

  mounted (): void {
    console.log('Database Viewer.')
    this.showDatabase()
  }

  showDatabase (): void {
    API.get(this, '/database-structure', null).then((response: Response) => {
      console.log('response : ', response)

      this.tables = (response as unknown) as APIDatabaseTable[]
      console.log(this.tables)
      this.updateTables++
    })
  }
}
</script>
