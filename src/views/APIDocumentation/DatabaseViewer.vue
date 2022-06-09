<template>
  <v-container
    fluid
    :key="updateTables"
    class="d-flex flex-wrap pt-6 pl-6"
    style="max-height: 100%; overflow: auto;"
  >
    <div v-for="[type, tables] in tablesTypes" :key="type">
      <h1 class="mb-6">
        {{ type.charAt(0).toUpperCase() + type.slice(1) }}s tables
      </h1>
      <v-card v-for="table in tables" :key="table.name" class="mb-6 mr-6">
        <v-card-title class="text-h6 primary black--text py-0 px-2"
          >{{ table.name }}
        </v-card-title>
        <v-card-text class="px-0 py-2">
          <v-simple-table dense>
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">
                    Type
                  </th>
                  <th class="text-left">
                    Name
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(field, index) in table.fields" :key="index">
                  <td class="primary--text">
                    <b>{{ field.type }}</b> ({{ field.subtype }})
                  </td>
                  <td
                    :class="
                      field.name === 'id'
                        ? 'green--text'
                        : /id.{1}/i.test(field.name)
                        ? 'blue--text'
                        : 'text--primary'
                    "
                  >
                    {{ field.name }}
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card-text>
      </v-card>
    </div>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import API from '@/utils/api'
import { APIDatabaseTable } from '@/utils/models'

@Component({
  name: 'DatabaseViewer'
})
// @vuese
// @group VIEWS
export default class DatabaseViewer extends Vue {
  tablesTypes = new Map<string, APIDatabaseTable[]>()
  tables: APIDatabaseTable[] = []
  updateTables = 0

  mounted (): void {
    this.showDatabase()
  }

  showDatabase (): void {
    API.get(this, '/database-structure', null).then((response: Response) => {
      const tables = (response as unknown) as APIDatabaseTable[]
      tables.forEach(table => {
        const tableType = this.tablesTypes.get(table.type)
        if (tableType == null) {
          this.tablesTypes.set(table.type, [table])
        } else {
          tableType.push(table)
        }
      })
      this.updateTables++
    })
  }
}
</script>
