<template>
  <v-container fluid :key="updateTables" class="d-flex flex-wrap pt-6 pl-6">
    <v-card
      v-for="[tableName, fields] in tables"
      :key="tableName"
      class="mb-6 mr-6"
    >
      <v-card-title class="text-h6 primary black--text py-0 px-2"
        >{{ tableName }}
      </v-card-title>
      <v-card-text class="pa-6">
        <div v-for="(field, index) in fields.fields" :key="index">
          <span class="primary--text">{{ field.type }} </span>
          <span :class="field.isReference ? 'blue--text' : 'text--primary'"
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
import { APIDatabaseStructureItem } from '@/utils/models'

interface DatabaseTable {
  fields: {
    name: string
    type: string
    isReference: boolean
  }[]
}

@Component
export default class DatabaseViewer extends Vue {
  tables: Map<string, DatabaseTable> = new Map<string, DatabaseTable>()
  updateTables = 0

  mounted (): void {
    console.log('Database Viewer.')
    this.showDatabase()
  }

  showDatabase (): void {
    API.get(this, '/database-structure', null, null).then(
      (response: Response) => {
        const items = (response as unknown) as APIDatabaseStructureItem[]
        items.forEach(item => {
          const table = this.tables.get(item.tableName)
          const field = {
            name: item.name,
            type: item.type,
            isReference: /id.{1}/i.test(item.name)
          }
          if (table) {
            table.fields.push(field)
          } else {
            this.tables.set(item.tableName, { fields: [field] })
          }
        })
        console.log(this.tables)
        this.updateTables++
      }
    )
  }
}
</script>
