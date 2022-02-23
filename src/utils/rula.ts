import * as THREE from 'three'
import { Matrix4, Vector3 } from 'three'

interface RULABonesSettings {
  name: string
  transform: THREE.Matrix4 | null
}

export class AxisMarker {
  name: string
  parent: THREE.Bone
  mesh: THREE.Mesh = new THREE.Mesh()
  transform: THREE.Matrix4 | null = null
  constructor (parent: THREE.Bone, transform: THREE.Matrix4 | null) {
    this.name = `marker-${parent.name}`
    this.parent = parent
    this.transform = transform
    const geometry = new THREE.CircleGeometry(0.05, 32)
    if (this.transform) {
      geometry.applyMatrix4(this.transform)
    }

    const uniforms = {
      colorB: { type: 'vec3', value: new THREE.Color(0xff0000) },
      colorA: { type: 'vec3', value: new THREE.Color(0x00ff00) }
    }

    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      fragmentShader: this.fragmentShader(),
      vertexShader: this.vertexShader(),
      side: THREE.DoubleSide
    })

    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.matrixAutoUpdate = false
  }

  update (): void {
    const root = this.parent.parent == null ? this.parent : this.parent.parent

    root.getWorldQuaternion(this.mesh.quaternion)
    this.parent.getWorldPosition(this.mesh.position)
    this.mesh.updateMatrix()
  }

  vertexShader (): string {
    return `
      varying vec2 vUv; 
  
      void main() {
        vUv = uv; 
  
        vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * modelViewPosition; 
      }
    `
  }

  fragmentShader (): string {
    return `
      #define M_PI 3.1415926535897932384626433832795
      uniform vec3 colorA; 
      uniform vec3 colorB; 
      varying vec2 vUv;

      void main() {
        vec2 a = vec2(1.0, 0.0);
        vec2 b = vUv - vec2(0.5, 0.5);
        float a_b = dot(a, b);
        float la = length(a);
        float lb = length(b);
        float den = la * lb;
        if(den < 0.0) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
        } else {
          float t = acos(a_b / den);
          float a = b.y < 0.0 ? 2.0 * M_PI - t : t;
          float v = a / (2.0 * M_PI);
          gl_FragColor = vec4(v, v, v, 1.0);
        }
      }
  `
  }
}

export default class RULA {
  axeList: THREE.AxesHelper[] = []
  boneSettings: RULABonesSettings[] = [
    {
      name: 'Spine',
      transform: new THREE.Matrix4().makeRotationFromEuler(
        new THREE.Euler(Math.PI / 2, Math.PI / 2, 0)
      )
    },
    {
      name: 'Neck',
      transform: new THREE.Matrix4().makeRotationFromEuler(
        new THREE.Euler(0, 0, Math.PI / 2)
      )
    },
    {
      name: 'Head',
      transform: new THREE.Matrix4().makeRotationFromEuler(
        new THREE.Euler(0, 0, Math.PI / 2)
      )
    },
    { name: 'RightArm', transform: null },
    { name: 'RightForeArm', transform: null },
    { name: 'RightHand', transform: null },
    { name: 'LeftArm', transform: new THREE.Matrix4().makeScale(-1, 1, 1) },
    { name: 'LeftForeArm', transform: new THREE.Matrix4().makeScale(-1, 1, 1) },
    { name: 'LeftHand', transform: new THREE.Matrix4().makeScale(-1, 1, 1) }
  ]

  scene: THREE.Scene
  markers: AxisMarker[] = []

  constructor (scene: THREE.Scene) {
    this.scene = scene
  }

  createRULAMarkers (skeleton: THREE.SkeletonHelper): void {
    const skeletonBones = skeleton.bones
    const group = new THREE.Group()
    group.name = 'RulaMarkers'

    skeletonBones.map(bone => {
      const setting = this.boneSettings
        .filter(setting => setting.name === bone.name)
        .pop()
      if (setting) {
        // const marker = new AxisMarker(bone, setting.transform)
        // this.markers.push(marker)
        // group.add(marker.mesh)
        const axesHelper = new THREE.AxesHelper(10)
        bone.children.push(axesHelper)
        axesHelper.parent = bone
        axesHelper.name = bone.name
        this.axeList.push(axesHelper)
      }
    })

    this.scene.add(group)
  }

  computeNeckScore (angles: THREE.Vector3): number {
    let score = 0
    // Inclinaison de la tête
    if (angles.x < -5) score += 4
    if (angles.x > 0 && angles.x <= 10) score += 2
    if (angles.x > 10 && angles.x <= 20) score += 3

    // Rotation de la nuque
    if (angles.z < -5 || angles.z > 5) score += 1

    // Inclinaison de la nuque
    if (angles.y < -5 || angles.y > 5) score += 1
    return score
  }

  computeSpineScore (angles: THREE.Vector3): number {
    let score = 0
    // Baissage de tronc
    if (angles.x <= 5) score += 1
    if (angles.x > 5 && angles.x <= 20) score += 2
    if (angles.x > 20 && angles.x <= 60) score += 3
    if (angles.x > 60) score += 4

    // Inclinaison latérale du tronc
    if (angles.z < -5 || angles.z > 5) score += 1

    // Rotation du tronc
    if (angles.y < -5 || angles.z > 5) score += 1

    return score
  }

  update (): void {
    if (this.axeList.length === 0) return

    this.axeList.forEach(axe => {
      if (axe.parent == null) return
      const q = axe.parent.quaternion
      const rot = new THREE.Euler().setFromQuaternion(q, 'XYZ')
      const f = (n: number) => Math.floor(n * 100) / 100
      const a = (n: number) => (n / (2 * Math.PI)) * 360
      const r = new Vector3(a(rot.x), a(rot.y), a(rot.z))
      const score = 0

      switch (axe.name) {
        case 'Spine':
          // score += this.computeSpineScore(r)
          // console.log(axe.name, f(r.x), f(r.y), f(r.z), score)
          break
        case 'Neck':
          // score += this.computeNeckScore(r)
          // console.log(axe.name, f(r.x), f(r.y), f(r.z), score)
          break
      }
    })

    // const index = 0
    // this.markers.forEach((marker, index) => {
    //  marker.update()
    // index++
    // if (index === 3) {
    // const position = marker.position
    // const rotation = (marker.parent && marker.parent.rotation) || {
    //   x: 0,
    //   y: 0,
    //   z: 0
    // }
    // const material = marker.material as THREE.MeshLambertMaterial
    // material.color = new THREE.Color(
    //   Math.abs(Math.sin(rotation.x) * 255),
    //   Math.abs(Math.sin(rotation.y) * 255),
    //   Math.abs(Math.sin(rotation.z) * 255)
    // )
    // }
    // console.log(marker.name, position, rotation)
    // })
  }
}
