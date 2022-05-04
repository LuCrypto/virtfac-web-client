<template>
  <v-card elevation="3" height="700px" class="d-flex flex-row">
    <input
      ref="objUpload"
      type="file"
      accept=".gltf, .obj, .fbx, .stl, .wrl"
      hidden
      @change="onFileUploaded"
    />
    <v-navigation-drawer stateless permanent :mini-variant="menuCollapse">
      <v-list
        nav
        dense
        class="d-flex flex-column justify-start;"
        style="height: 100%"
      >
        <v-list-item-group v-model="selectedMenuItem" color="primary">
          <v-list-item
            v-for="(menuItem, i) in menuItemList"
            :key="i"
            class="justify-start"
            @click.stop="menuItem.action"
          >
            <v-list-item-icon>
              <v-icon v-text="menuItem.icon"></v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text="menuItem.text"></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
        <v-list-item-group class="mt-auto">
          <v-list-item
            class="justify-start"
            @click="menuCollapse = !menuCollapse"
          >
            <v-list-item-icon>
              <v-icon v-if="menuCollapse" v-text="'mdi-arrow-right'"></v-icon>
              <v-icon v-if="!menuCollapse" v-text="'mdi-arrow-left'"></v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text="'Menu labels'"></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>
    <v-container style="width: auto; margin: 0; flex-grow: 1;">
      <model-viewer ref="viewer"></model-viewer>
    </v-container>
    <select-pop-up ref="selectPopUp"></select-pop-up>
    <input-field-pop-up ref="inputFieldPopUp"></input-field-pop-up>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import ActionContainer, {
  ActionCallbackData
} from '@/components/ActionContainer.vue'
import { APIFile } from '@/utils/models'

import SelectPopUp from '@/components/popup/SelectPopUp.vue'
import InputFieldPopUp from '@/components/popup/InputFieldPopUp.vue'
import ModelViewer from '@/components/ModelViewer.vue'

import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { VRMLLoader } from 'three/examples/jsm/loaders/VRMLLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import { VTKLoader } from 'three/examples/jsm/loaders/VTKLoader'
import { Rhino3dmLoader } from 'three/examples/jsm/loaders/3DMLoader'
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader'
import { TDSLoader } from 'three/examples/jsm/loaders/TDSLoader'

// import {  } from 'three/examples/jsm/loaders/'
import {
  BufferGeometry,
  Group,
  Loader,
  LoadingManager,
  Matrix4,
  Mesh,
  MeshLambertMaterial,
  MeshPhongMaterial,
  Object3D,
  TorusGeometry,
  Vector3
} from 'three'
import { Session } from '@/utils/session'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

class MenuItem {
  text: string
  icon: string
  action: () => void
  constructor (text: string, icon: string, action: () => void) {
    this.text = text
    this.icon = icon
    this.action = action
  }
}

interface SettingItem {
  id: number
  idApplication: number
  name: string
  json: string
}

@Component({
  components: {
    ActionContainer,
    SelectPopUp,
    InputFieldPopUp,
    ModelViewer
  }
})
export default class ErgonomIOAssetContainer extends Vue {
  defaultMaterial = new MeshLambertMaterial({
    color: 0xaaaaaa
  })

  selectedMenuItem = -1
  selectPopUp: SelectPopUp | null = null
  inputFieldPopUp: InputFieldPopUp | null = null
  actionContainer: ActionContainer | null = null
  menuCollapse = false
  // filePopUp: OpenFilePopUp | null = null
  menuItemList: MenuItem[] = []
  fileName = ''
  viewer: ModelViewer | null = null

  currentAsset: Group | null = null

  updateTheme (): void {
    if (this.viewer !== null) {
      if (Session.getTheme() === 'dark') {
        this.viewer.setFogActive(false, 0x1e1e1e)
        this.viewer.setGrid(100, 100, 0x555555, 0x1e1e1e, 0xeeeeee)
      } else {
        this.viewer.setFogActive(false, 0xfefefe)
        this.viewer.setGrid(100, 100, 0xaaaaaa, 0xfefefe, 0x111111)
      }
    }
  }

  mounted (): void {
    this.$root.$on('changeDarkMode', () => {
      this.updateTheme()
    })
    this.actionContainer = this.$refs.actionContainer as ActionContainer
    // this.filePopUp = this.$refs.filePopUp as OpenFilePopUp
    this.selectPopUp = this.$refs.selectPopUp as SelectPopUp
    this.inputFieldPopUp = this.$refs.inputFieldPopUp as InputFieldPopUp
    this.viewer = this.$refs.viewer as ModelViewer

    this.viewer.setFogActive(false)
    this.updateTheme()

    this.menuItemList.push(
      new MenuItem('Upload file', 'mdi-upload', () => {
        (this.$refs.objUpload as HTMLElement).click()
        return true
      })
    )
    this.menuItemList.push(
      new MenuItem('Open File', 'mdi-file-document', () => {
        this.openFilePopUp()
      })
    )
    this.menuItemList.push(
      new MenuItem('Save File', 'mdi-file-document', () => {
        this.exportGltf()
      })
    )
    this.menuItemList.push(
      new MenuItem('Apply Transform', 'mdi-axis-arrow', () => {
        this.applyTransform()
      })
    )
    this.menuItemList.push(
      new MenuItem('Switch Axis Mode', 'mdi-axis-z-arrow', () => {
        this.switchAxisMode()
      })
    )
    this.menuItemList.push(
      new MenuItem('Switch Snap Mode', 'mdi-ruler', () => {
        this.switchSnapMode()
      })
    )
    // const mapper = new Mapper(CAEExampleFormat1)
  }

  onRightMouseDrag (): void {
    if (this.actionContainer != null) {
      this.actionContainer.drag()
    }
  }

  onMouseWheel (): void {
    if (this.actionContainer != null) {
      this.actionContainer.zoom()
    }
  }

  onUpdate (data: ActionCallbackData): void {
    //
  }

  inputFile (): void {
    const input = this.$refs.inputFile as HTMLInputElement
    input.value = ''
    input.click()
  }

  handleFile (files: APIFile[]): void {
    if (files == null) {
      console.log('This type of file cannot be read yet.')
    } else {
      /*
      console.log(files, ' : coucou', typeof files)
      const workbook = XLSX.read(files[0].uri.split('base64,')[1], {
        type: 'base64'
      })
      console.log(workbook)
      this.constraintGraph.loadXLSX(workbook as IWorkBook)
      this.fileName = files[0].name
      */
    }
  }

  // dropHandler(e : )
  saveShape (): void {
    /*
    if (this.inputFieldPopUp != null) {
      this.inputFieldPopUp.open(
        'Save Shape',
        'enter shape name',
        this.fileName,
        text => {
          if (text != null) {
            const settingOBJ = {
              name: text,
              type: 'graph_position',
              initialProject: this.fileName,
              date: new Date(),
              data: this.constraintGraph.getRawGraph().toJsonOBJ()
            }
            API.post(
              this,
              '/application-settings',
              JSON.stringify({
                idApplication: 2,
                name: text,
                json: JSON.stringify(settingOBJ)
              })
            )
          }
        }
      )
    }
    */
  }

  openFilePopUp (): void {
    /*
    if (this.filePopUp != null) {
      // this.filePopUp.open()
    } else {
      console.log('this.filePopUp is null')
    }
    */
  }

  public loadObjectAsync (
    url: string,
    extension: string,
    onLoaded: { (object: Group): void },
    onProgress?: { (event: ProgressEvent<EventTarget>): void }
  ) {
    const loaders = new Map<string, Loader>([
      ['gltf', new GLTFLoader()],
      ['obj', new OBJLoader()],
      ['fbx', new FBXLoader()],
      ['stl', new STLLoader()],
      ['wrl', new VRMLLoader()],
      ['vtk', new VTKLoader()],
      ['3dm', new Rhino3dmLoader()],
      ['ply', new PLYLoader()],
      ['tds', new TDSLoader()]
    ])
    /*
    if (extension === 'gltf') {
      if (this.viewer !== null) {
        this.viewer.loadGLTFFromPath(url)
      }
    }
    else {
    */
    const loader = loaders.get(extension)
    if (loader !== undefined) {
      loader.loadAsync(url, onProgress).then(
        object => {
          if (extension === 'obj') {
            if (object instanceof Object3D) {
              object.traverse(child => {
                if (child instanceof Mesh) {
                  child.material = this.defaultMaterial
                }
              })
            }
          } else if (extension === 'fbx') {
            if (object instanceof Object3D) {
              const m = new Matrix4()
              m.scale(new Vector3(0.01, 0.01, 0.01))
              object.applyMatrix4(m)
              object.updateMatrix()
              object.traverse(child => {
                if (child instanceof Mesh) {
                  child.updateMatrix()
                  child.geometry.applyMatrix4(child.matrixWorld)

                  child.position.set(0, 0, 0)
                  child.rotation.set(0, 0, 0)
                  child.scale.set(1, 1, 1)
                  child.updateMatrix()
                }
              })
              object.updateMatrix()
            }
          } else if (extension === 'stl') {
            if (object instanceof BufferGeometry) {
              console.log('rescale')
              const m = new Matrix4()
              // m.scale(new Vector3(0.01, 0.01, 0.01))
              m.makeRotationX(-Math.PI / 2)
              object.applyMatrix4(m)
            }
            object = new Mesh(object, this.defaultMaterial)
            /*
              mesh.traverse(child => {
                if (child instanceof Mesh) {
                  child.castShadow = true
                  child.receiveShadow = true
                }
              })
              */
            const group = new Group()
            group.add(object)
            onLoaded(group)
          } else if (extension === 'gltf') {
            object = object.scene
          }

          if (object instanceof Object3D) {
            object.traverse(child => {
              if (child instanceof Mesh) {
                child.castShadow = true
                child.receiveShadow = true
              }
            })
          } else {
            console.log(typeof object, object)
          }
          if (object instanceof Mesh) {
            object.castShadow = true
            object.receiveShadow = true
          }
          onLoaded(object)

          /*
            if (this.viewer !== null) {
              // this.viewer.addObjectToScene(object)
              console.log('hello3')
            }
            console.log('hello')
            const gltfExporter = new GLTFExporter()
            gltfExporter.parse(
              object,
              gltf => {
                console.log('hello2')
                const file = new Blob([JSON.stringify(gltf)], {
                  type: 'text/plain'
                })
                if (this.viewer !== null) {
                  this.viewer.loadGLTFFromPath(URL.createObjectURL(file))
                  console.log('hello3')
                }
              },
              {}
            )
            */
        },
        reason => {
          console.log(reason)
        }
      )
    }
    // }
  }

  exportGltf () {
    if (this.currentAsset === null) return
    const gltfExporter = new GLTFExporter()
    gltfExporter.parse(
      this.currentAsset,
      gltf => {
        const file = new Blob([JSON.stringify(gltf)], {
          type: 'text/plain'
        })
        // todo send to API
        const link = document.createElement('a')
        link.download = 'export.gltf'
        link.href = URL.createObjectURL(file)
        link.click()
      },
      {}
    )
  }

  onFileUploaded (event: Event) {
    console.log('file uploaded')
    if (event != null && event.target != null) {
      const f: File = ((event.target as HTMLInputElement).files as FileList)[0]
      if (f != null) {
        const extension = (f.name.split('.').pop() as string).toLowerCase()
        this.loadObjectAsync(
          URL.createObjectURL(f),
          extension,
          obj => {
            if (this.viewer !== null) {
              if (this.currentAsset !== null) {
                this.viewer.controlMesh(null)
                this.viewer.removeObjectToScene(this.currentAsset)
              }
              this.viewer.addObjectToScene(obj)
              this.viewer.controlMesh(obj)
              this.currentAsset = obj
            }
          },
          event => {
            console.log((event.loaded / event.total) * 100 + '% loaded')
          }
        )
      }
    }
  }

  applyTransform () {
    if (this.currentAsset === null) return
    this.currentAsset.updateMatrix()
    // this.currentAsset.applyMatrix4(this.currentAsset.matrix)
    this.currentAsset.traverse(child => {
      if (child instanceof Mesh) {
        child.geometry.applyMatrix4(child.matrixWorld)
      }
    })
    this.currentAsset.position.set(0, 0, 0)
    this.currentAsset.rotation.set(0, 0, 0)
    this.currentAsset.scale.set(1, 1, 1)
    this.currentAsset.updateMatrix()
  }

  switchAxisMode () {
    if (this.viewer === null) return
    switch (this.viewer.getMeshControlMode()) {
      case 'translate':
        this.viewer.setMeshControlMode('rotate')
        break
      case 'rotate':
        this.viewer.setMeshControlMode('scale')
        break
      case 'scale':
        this.viewer.setMeshControlMode('translate')
        break
    }
  }

  switchSnapMode () {
    if (this.viewer !== null) this.viewer.switchMeshControlSnap()
  }
}

/*
updateUploadFile (e: Event): void {
    if (e.target == null) return
    const target = e.target as HTMLInputElement
    if (target.files != null && target.files.length > 0) {
      // TODO : Upload file and select format before validation

      [...target.files].forEach(file => {
        const reader = new FileReader()
        reader.onload = () => {
          const fileString = reader.result as string
          this.uploadFile(
            new APIFile({
              name: file.name,
              uri: fileString
            })
          )
        }
        reader.onerror = error => {
          console.error(error)
          this.$root.$emit('bottom-message', 'Sorry, we cannot read this file.')
        }
        reader.readAsDataURL(file)
      })
    }
  }
*/
</script>
