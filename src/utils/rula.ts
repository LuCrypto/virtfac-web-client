import * as THREE from 'three'

export default class RULA {
  bonesWithMarkersNames = [
    'Hips',
    'Spine3',
    'Neck',
    'Head',
    'RightArm',
    'RightForeArm',
    'RightHand',
    'LeftArm',
    'LeftForeArm',
    'LeftHand'
  ]

  markers: Map<string, THREE.Mesh> = new Map<string, THREE.Mesh>()

  // constructor () {}

  createRULAMarkers (skeleton: THREE.SkeletonHelper): void {
    const skeletonBones = skeleton.bones
    skeletonBones.map(bone => {
      if (this.bonesWithMarkersNames.includes(bone.name)) {
        const geometry = new THREE.SphereGeometry(10, 16, 8)
        const material = new THREE.MeshLambertMaterial({ color: 0xffff00 })
        const sphere = new THREE.Mesh(geometry, material)
        sphere.name = bone.name
        bone.children.push(sphere)
        sphere.parent = bone
        this.markers.set(bone.name, sphere)
      }
    })
  }

  update (): void {
    let index = 0
    this.markers.forEach(marker => {
      index++
      // if (index === 3) {
      const position = marker.position
      const rotation = (marker.parent && marker.parent.rotation) || {
        x: 0,
        y: 0,
        z: 0
      }
      const material = marker.material as THREE.MeshLambertMaterial
      material.color = new THREE.Color(
        Math.abs(Math.sin(rotation.x) * 255),
        Math.abs(Math.sin(rotation.y) * 255),
        Math.abs(Math.sin(rotation.z) * 255)
      )
      // }
      // console.log(marker.name, position, rotation)
    })
  }
}
