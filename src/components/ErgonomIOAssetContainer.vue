<template>
  <maximizable-container>
    <v-card elevation="3" class="d-flex flex-row flex-grow-1 pa-0 ma-0">
      <pop-up ref="openFilePopUp">
        <open-asset
          @close="$refs.openFilePopUp.close()"
          application="ERGONOM_IO"
          accept=".gltf, .obj, .fbx, .stl, .wrl, .glb"
          :uploadPipeline="onFileUpload"
          :singleSelect="true"
          :openFile="true"
          @fileInput="onFileInput"
        ></open-asset>
      </pop-up>
      <pop-up ref="assetInfo">
        <asset-info
          ref="assetInfoComponent"
          @close="$refs.assetInfo.close()"
        ></asset-info>
      </pop-up>
      <input
        ref="objUpload"
        type="file"
        accept=".gltf, .obj, .fbx, .stl, .wrl, .glb"
        hidden
        @change="onFileUploaded"
      />
      <input
        ref="inputTexture"
        type="file"
        accept=".png, .jpg, .exr, .hdr"
        hidden
        @change="onTextureUploaded"
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
      <v-container
        fluid
        style="width: auto; margin: 0; flex-grow: 1;"
        class="pa-0 ma-0"
      >
        <model-viewer ref="viewer" :displayInspector="true"></model-viewer>
      </v-container>
      <select-pop-up ref="selectPopUp"></select-pop-up>
      <input-field-pop-up ref="inputFieldPopUp"></input-field-pop-up>
    </v-card>
  </maximizable-container>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import ActionContainer from '@/components/ActionContainer.vue'
import { APIAsset } from '@/utils/models'

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
import MaximizableContainer from '@/components/MaximizableContainer.vue'

import {
  BufferGeometry,
  Group,
  Loader,
  Matrix4,
  Mesh,
  MeshLambertMaterial,
  Object3D,
  Vector3
} from 'three'
import { Session } from '@/utils/session'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import PopUp from './PopUp.vue'
import OpenAsset from '@/components/OpenAsset.vue'
import AssetInfo from '@/components/AssetInfo.vue'
import API from '@/utils/api'

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

/*
interface SettingItem {
  id: number
  idApplication: number
  name: string
  json: string
}
*/

@Component({
  name: 'ErgonomIOAssetContainer',
  components: {
    ActionContainer,
    SelectPopUp,
    InputFieldPopUp,
    ModelViewer,
    PopUp,
    OpenAsset,
    AssetInfo,
    MaximizableContainer
  }
})
// @vuese
// @group COMPONENTS
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
  currentAssetApiId = -1
  currentAssetName = ''
  currentAssetPicture = ''
  inputField: InputFieldPopUp | null = null

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
    this.inputField = this.$refs.inputFieldPopUp as InputFieldPopUp
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
      new MenuItem('Load local file', 'mdi-upload', () => {
        (this.$refs.objUpload as HTMLElement).click()
        return true
      })
    )
    this.menuItemList.push(
      new MenuItem('Open Asset', 'mdi-file-document', () => {
        (this.$refs.openFilePopUp as PopUp).open()
      })
    )
    this.menuItemList.push(
      new MenuItem('Save Asset', 'mdi-content-save-edit', () => {
        // this.patchFileFromAsset()
        (this.$refs.assetInfo as PopUp).open()
        requestAnimationFrame(() => {
          if (this.currentAsset !== null) {
            this.ObjectToGLTFUri(this.currentAsset as Group).then(gltf => {
              (this.$refs.assetInfoComponent as AssetInfo).setAssetData(
                this.currentAssetName,
                this.currentAssetPicture,
                gltf,
                this.currentAssetApiId
              )
            })
          } else {
            (this.$refs.assetInfoComponent as AssetInfo).setAssetData(
              this.currentAssetName,
              this.currentAssetPicture,
              null,
              this.currentAssetApiId
            )
          }
        })
      })
    )
    this.menuItemList.push(
      new MenuItem('Download File', 'mdi-download', () => {
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
    this.menuItemList.push(
      new MenuItem('Apply Scale', 'mdi-pencil-ruler', () => {
        if (this.currentAsset === null) return
        if (this.inputField != null) {
          this.inputField.open('enter scale multiplier', '1', '1', input => {
            if (input != null) {
              const scale = +input.replaceAll(',', '.').replaceAll(' ', '')
              if (this.currentAsset === null) return
              this.currentAsset.scale.multiplyScalar(scale)
            }
          })
        }
      })
    )
    this.menuItemList.push(
      new MenuItem('Capture Image', 'mdi-camera', () => {
        if (this.viewer !== null) {
          this.viewer.beginScreenshotSession(
            uri => {
              this.currentAssetPicture = uri
              /*
              const dlLink = document.createElement('a')
              dlLink.download = this.currentAssetName.replace('.gltf', '.png')
              dlLink.href = uri
              dlLink.click()
              */
            },
            512,
            512,
            true,
            true
          )
        }
      })
    )
    /*
    this.menuItemList.push(
      new MenuItem('Change Asset Name', 'mdi-form-textbox', () => {
        if (this.inputField === null) return
        this.inputField.open(
          'Enter Asset Name',
          this.currentAssetName.replace('.gltf', ''),
          this.currentAssetName.replace('.gltf', ''),
          value => {
            if (value != null) {
              this.currentAssetName = value + '.gltf'
            }
          }
        )
      })
    )
    */
    /*
    this.menuItemList.push(
      new MenuItem('Load env texture', 'mdi-upload', () => {
        (this.$refs.inputTexture as HTMLElement).click()
        return true
      })
    )
    */
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

  /*
  onUpdate (data: ActionCallbackData): void {
    //
  }
*/

  inputFile (): void {
    const input = this.$refs.inputFile as HTMLInputElement
    input.value = ''
    input.click()
  }

  public loadObjectAsync (
    url: string,
    extension: string,
    onLoaded: { (object: Group): void },
    onProgress?: { (event: ProgressEvent<EventTarget>): void }
  ): void {
    const loaders = new Map<string, Loader>([
      ['gltf', new GLTFLoader()],
      ['glb', new GLTFLoader()],
      ['obj', new OBJLoader()],
      ['fbx', new FBXLoader()],
      ['stl', new STLLoader()],
      ['wrl', new VRMLLoader()],
      ['vtk', new VTKLoader()],
      ['3dm', new Rhino3dmLoader()],
      ['ply', new PLYLoader()],
      ['tds', new TDSLoader()]
    ])

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
          } else if (extension === 'gltf' || extension === 'glb') {
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
  }

  exportGltf (): void {
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

  onFileUploaded (event: Event): void {
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

  onTextureUploaded (event: Event): void {
    if (event != null && event.target != null) {
      const f: File = ((event.target as HTMLInputElement).files as FileList)[0]
      if (f != null) {
        if (this.viewer !== null) {
          this.viewer.setEnvMap(URL.createObjectURL(f), 'HDR')
        }
      }
      const reader = new FileReader()
      reader.onload = () => {
        const fileString = reader.result as string
        console.log(fileString)
      }
      reader.onerror = error => {
        console.error(error)
        this.$root.$emit('bottom-message', 'Sorry, we cannot read this file.')
      }
      reader.readAsDataURL(f)
    }
  }

  applyTransform (): void {
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

  switchAxisMode (): void {
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

  switchSnapMode (): void {
    if (this.viewer !== null) this.viewer.switchMeshControlSnap()
  }

  onFileInput (files: APIAsset[]): void {
    const file = files.pop()
    if (file != null) {
      // const fileContent = file.uri.split('base64,')[1]
      // const content = atob(fileContent)
      this.loadObjectAsync(file.uri, 'gltf', obj => {
        if (this.viewer !== null) {
          if (this.currentAsset !== null) {
            this.viewer.controlMesh(null)
            this.viewer.removeObjectToScene(this.currentAsset)
          }
          this.viewer.addObjectToScene(obj)
          this.viewer.controlMesh(obj)
          this.currentAsset = obj
          this.currentAssetApiId = file.id
          this.currentAssetName = file.name
          this.currentAssetPicture = file.picture
        }
      })
    } else {
      console.error('Unable to open selected file.')
      this.$root.$emit('bottom-message', 'Unable to open selected file.')
    }
  }

  onFileUpload (file: File): Promise<File> {
    return new Promise<File>(resolve => {
      const extension = (file.name.split('.').pop() as string).toLowerCase()
      this.loadObjectAsync(
        URL.createObjectURL(file),
        extension,
        obj => {
          const gltfExporter = new GLTFExporter()
          gltfExporter.parse(
            obj,
            gltf => {
              const blob = new Blob([JSON.stringify(gltf)], {
                type: 'model/gltf+json'
              })
              const f = new File(
                [blob],
                file.name.substring(0, file.name.length - extension.length) +
                  'gltf',
                { type: 'model/gltf+json' }
              )
              resolve(f)
            },
            {}
          )
        },
        event => {
          console.log((event.loaded / event.total) * 100 + '% loaded')
        }
      )
    })
  }

  public ObjectToGLTFUri (object: Group): Promise<string> {
    return new Promise((resolve, reject) => {
      const exporter = new GLTFExporter()
      exporter.parse(
        object,
        gltf => {
          const blob = new Blob([JSON.stringify(gltf)], {
            type: 'model/gltf+json'
          })
          const f = new File([blob], this.currentAssetName, {
            type: 'model/gltf+json'
          })
          const reader = new FileReader()
          reader.onload = () => {
            const fileString = reader.result as string
            resolve(fileString)
          }
          reader.onerror = error => {
            reject(error)
          }
          reader.readAsDataURL(f)
        },
        {}
      )
    })
  }

  patchFileFromAsset (): void {
    if (this.currentAssetApiId !== -1 && this.currentAsset !== null) {
      const exporter = new GLTFExporter()
      exporter.parse(
        this.currentAsset,
        gltf => {
          const blob = new Blob([JSON.stringify(gltf)], {
            type: 'model/gltf+json'
          })
          const f = new File([blob], this.currentAssetName, {
            type: 'model/gltf+json'
          })
          const reader = new FileReader()
          reader.onload = () => {
            const fileString = reader.result as string
            const apiFile = new APIAsset({
              name: this.currentAssetName,
              uri: fileString,
              picture: this.currentAssetPicture
            })
            API.patch(
              this,
              '/resources/assets/' + this.currentAssetApiId,
              JSON.stringify(apiFile.toJSON())
            )
              .then(res => {
                console.log(res)
              })
              .catch(err => {
                console.log(err)
              })
          }
          reader.onerror = error => {
            console.error(error)
            this.$root.$emit(
              'bottom-message',
              'Sorry, we cannot read this file.'
            )
          }
          reader.readAsDataURL(f)
        },
        {}
      )
    } else {
      console.error('Null asset.')
    }
  }
}
</script>
