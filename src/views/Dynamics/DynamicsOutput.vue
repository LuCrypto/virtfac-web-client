<style scoped>
* >>> .v-stepper__step .mdi::before,
* >>> .v-stepper__step .v-stepper__step__step {
  color: #252525 !important;
  padding: 20px;
}
* >>> .v-stepper__content {
  margin: -14px -36px -16px 43px !important;
}
</style>
<template>
  <v-container fluid class="d-flex flex-column">
    <v-col class="flex-grow-0">
      <v-card flat class="flex-grow-1">
        <v-card-title>Dynamics outputs</v-card-title>
        <v-card-subtitle>
          This tool allows you to upload dynamics simulation files from Witness,
          PlantSimulation or Sympy. These files are then used for example by the
          routing analysis tool.
        </v-card-subtitle>
      </v-card>
    </v-col>
    <v-col class="flex-grow-0">
      <!-- Header -->
      <v-toolbar flat>
        <v-toolbar-title>
          Current file :
          <span class="primary--text">{{ filename ? filename : 'None' }}</span>
        </v-toolbar-title>
      </v-toolbar>

      <v-stepper v-model="step" vertical>
        <!-- Step 1 : import file -->
        <v-stepper-step
          :complete="step > 1"
          step="1"
          editable
          edit-icon="mdi-file"
        >
          Import
          <small class="pt-1">Open your file</small>
        </v-stepper-step>

        <v-stepper-content step="1" editable>
          <v-row no-gutters style="gap: 20px">
            <input
              ref="fileInput"
              type="file"
              id="input"
              style="display: none;"
              accept=".xlsx, .xls, .csv"
              @change="onInputFileChange($event)"
            />
            <v-btn
              outlined
              color="primary"
              class="black--text flex-grow-1"
              @click="
                $refs.fileInput.value = null
                resetInputFile()
                $refs.fileInput.click()
              "
            >
              Open local file
            </v-btn>
            <v-btn color="primary black--text flex-grow-1">
              Open from cloud
            </v-btn>
          </v-row>
        </v-stepper-content>

        <!-- Step 2 : Select sheets -->
        <v-stepper-step
          :complete="step > 2"
          step="2"
          :editable="filename !== ''"
          edit-icon="mdi-table-large"
        >
          Select data sheet
          <small class="pt-1">Select your data by sheet name</small>
        </v-stepper-step>

        <v-stepper-content step="2">
          <v-col>
            <v-select
              :value="selectedSheets.stock"
              :items="sheetsNames"
              label="Stock sheet"
            ></v-select>
            <v-select
              :value="selectedSheets.utilization"
              :items="sheetsNames"
              label="Utilization sheet"
            ></v-select>
            <v-select
              :value="selectedSheets.transport"
              :items="sheetsNames"
              label="Transport sheet"
            ></v-select>
          </v-col>
          <v-btn color="primary" class="black--text" @click="step = 3">
            Continue
          </v-btn>
          <v-btn text @click="step = 2">
            Cancel
          </v-btn>
        </v-stepper-content>

        <!-- Step 3 : Show data content -->
        <v-stepper-step
          :complete="step > 2"
          step="3"
          :editable="
            selectedSheets.stock !== '' &&
              selectedSheets.utilization !== '' &&
              selectedSheets.transport !== ''
          "
        >
          Show data
          <small class="pt-1">
            Show data content
          </small>
        </v-stepper-step>

        <v-stepper-content step="3">
          <v-btn color="primary" class="black--text" @click="step = 4">
            Continue
          </v-btn>
          <v-btn text @click="step = 2">
            Cancel
          </v-btn>
        </v-stepper-content>

        <!-- Step 4 : Charts -->
        <v-stepper-step
          :complete="step > 4"
          step="4"
          :editable="
            selectedSheets.stock !== '' &&
              selectedSheets.utilization !== '' &&
              selectedSheets.transport !== ''
          "
        >
          Graphics
          <small class="pt-1"
            >Display and analyse data from graphical visualisations</small
          >
        </v-stepper-step>

        <v-stepper-content step="4">
          <Histogram
            :data="fakedata"
            :width="300"
            :height="200"
            :num-bins="40"
          />
          <v-btn text>
            Cancel
          </v-btn>
        </v-stepper-content>
      </v-stepper>
    </v-col>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import * as XLSX from 'ts-xlsx'
import * as d3 from 'd3'
import Histogram from '@/components/charts/histogram.vue'

class StockItem {
  time = 0
  resId = 0
  resName = ''
  value = 0
  constructor (row: (string | number)[]) {
    this.time = row[0] as number
    this.resId = row[1] as number
    this.resName = row[2] as string
    this.value = row[3] as number
  }
}

class UtilizationItem {
  resName = ''
  work = 0
  setup = 0
  block = 0
  wait = 0
  fail = 0
  constructor (row: (string | number)[]) {
    this.resName = row[0] as string
    this.work = row[1] as number
    this.setup = row[2] as number
    this.block = row[3] as number
    this.wait = row[4] as number
    this.fail = row[5] as number
  }
}

class TransportItem {
  amount = 0
  time = 0
  constructor (row: (string | number)[]) {
    this.amount = row[0] as number
    this.time = row[1] as number
  }
}

@Component({
  name: 'DynamicsOutput',
  components: {
    Histogram
  }
})
// @vuese
// @group VIEWS
export default class DynamicsOutput extends Vue {
  step = 1
  filename = ''
  sheetsNames: string[] = []
  selectedSheets = {
    stock: '',
    utilization: '',
    transport: ''
  }

  dataLists: {
    stocks: StockItem[]
    utilizations: UtilizationItem[]
    transports: TransportItem[]
  } = {
    stocks: [],
    utilizations: [],
    transports: []
  }

  fakedata = d3.range(0, 2000).map(d3.randomNormal())

  resetInputFile (): void {
    this.filename = ''
    this.sheetsNames = []
    this.selectedSheets = {
      stock: '',
      utilization: '',
      transport: ''
    }
  }

  onInputFileChange (event: Event): void {
    const input = event.target as HTMLInputElement
    if (!input.files) {
      return
    }
    const file = [...input.files].pop()
    if (!file) {
      this.filename = ''
      return
    }

    // Read file
    const fileReader = new FileReader()

    // Load XLSX
    fileReader.onload = event => {
      const data = event.target?.result
      this.filename = file.name
      let workbook = null
      try {
        workbook = XLSX.read(data, {
          type: 'binary'
        })
      } catch (error) {
        this.$root.$emit('bottom-message', 'Cannot parse data file.')
        console.error('error', error)
        return
      }

      // Get all sheets name and set default sheets by names
      this.step = 2
      this.getDataSheets(workbook)
      this.computeCharts(workbook)
    }

    // Load error
    fileReader.onerror = error => {
      console.error(error)
      this.$root.$emit('bottom-message', 'Cannot read this file.')
      this.filename = ''
    }

    // Start file reading
    fileReader.readAsBinaryString(file)
  }

  computeCharts (workbook: XLSX.IWorkBook): void {
    // Check sheets names
    const stock = this.selectedSheets.stock
    const utilization = this.selectedSheets.utilization
    const transport = this.selectedSheets.transport
    if ([stock, utilization, transport].some(sheetName => !sheetName)) {
      return
    }

    // Store each values, slice(1) is to remove headers
    this.dataLists.stocks = this.sheetToArray(workbook.Sheets[stock])
      .slice(1)
      .map(row => new StockItem(row))

    this.dataLists.utilizations = this.sheetToArray(
      workbook.Sheets[utilization]
    )
      .slice(1)
      .map(row => new UtilizationItem(row))

    this.dataLists.transports = this.sheetToArray(workbook.Sheets[transport])
      .slice(1)
      .map(row => new TransportItem(row))

    console.log(this.dataLists)
  }

  getCellCoordinate (cellCoordinate: string): { x: number; y: number } | null {
    if (typeof cellCoordinate !== 'string') return null

    const match = cellCoordinate.match(/^([A-Z][A-Z]*)([1-9][0-9]*)$/)
    if (!match) return null

    const letterToNumber = (letter: string) => {
      let n = 0
      const A = 'A'.charCodeAt(0)
      const N = 'Z'.charCodeAt(0) - A + 1
      letter
        .split('')
        .reverse()
        .forEach((c, i) => {
          n += Math.pow(N, i) * (c.charCodeAt(0) - A + 1)
        })
      return n
    }

    return {
      x: letterToNumber(match[1]) - 1,
      y: parseInt(match[2]) - 1
    }
  }

  sheetToArray (sheet: XLSX.IWorkSheet): (string | number)[][] {
    const sheetArray: (string | number)[][] = [[]]
    Object.keys(sheet).map(cell => {
      const coordinate = this.getCellCoordinate(cell)
      if (coordinate) {
        if (sheetArray[coordinate.y] === undefined) {
          sheetArray[coordinate.y] = []
        }
        sheetArray[coordinate.y][coordinate.x] = sheet[cell].v
      }
    })
    return sheetArray
  }

  getDataSheets (workbook: XLSX.IWorkBook): void {
    this.sheetsNames = workbook.SheetNames
    this.sheetsNames.forEach(sheetName => {
      const name = sheetName
        .toLowerCase()
        .replace(/\s/g, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')

      // Search stock sheet
      if (
        !this.selectedSheets.stock &&
        [
          'stock',
          'stockpile',
          'reserve',
          'inventaire',
          'approvisionnement',
          'provision',
          'marchandise',
          'lager',
          'bestand',
          'vorrat'
        ].some(searchName => name.includes(searchName))
      ) {
        this.selectedSheets.stock = sheetName
        return
      }

      // Search utilization sheet
      if (
        !this.selectedSheets.utilization &&
        [
          'utilization',
          'use',
          'utilisation',
          'usage',
          'nutzung',
          'verwendung',
          'gebrauch',
          'benutzung'
        ].some(searchName => name.includes(searchName))
      ) {
        this.selectedSheets.utilization = sheetName
        return
      }

      // Search transport sheet
      if (
        !this.selectedSheets.transport &&
        [
          'transport',
          'transportation',
          'beforderung',
          'verkehr'
        ].some(searchName => name.includes(searchName))
      ) {
        this.selectedSheets.transport = sheetName
      }
    })
  }
}
</script>
