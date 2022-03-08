import * as THREE from 'three'

interface RULABonesSettings {
  name: string
  transform: THREE.Matrix4 | null
  marker: THREE.AxesHelper | null
  computeScore: (angles: THREE.Vector3, scores: Map<string, number>) => void
}

class RULALocalScores {
  epaule = 1
  coude = 1
  poignetEtTorsionDuPoignet = 1
  postureDutronc = 1
  jambes = 1
  nuqueTroncEtJambes = 1
  brasEtPoignet = 1
}

const RULA_TABLE_A = [
  [1, 2, 2, 2, 2, 3, 3, 3],
  [2, 2, 2, 2, 3, 3, 3, 3],
  [2, 3, 3, 3, 3, 3, 4, 4],
  [2, 3, 3, 3, 3, 4, 4, 4],
  [3, 3, 3, 3, 3, 4, 4, 4],
  [3, 4, 4, 4, 4, 4, 5, 5],
  [3, 3, 4, 4, 4, 4, 5, 5],
  [3, 4, 4, 4, 4, 4, 5, 5],
  [4, 4, 4, 4, 4, 5, 5, 5],
  [4, 4, 4, 4, 4, 5, 5, 5],
  [4, 4, 4, 4, 4, 5, 5, 5],
  [4, 4, 4, 5, 5, 5, 6, 6],
  [5, 5, 5, 5, 5, 6, 6, 7],
  [5, 6, 6, 6, 6, 6, 7, 7],
  [6, 6, 6, 7, 7, 7, 7, 8],
  [7, 7, 7, 7, 7, 8, 8, 9],
  [8, 8, 8, 8, 8, 9, 9, 9],
  [9, 9, 9, 9, 9, 9, 9, 9]
]
const RULA_TABLE_B = [
  [1, 3, 2, 3, 3, 4, 5, 5, 6, 6, 7, 7],
  [2, 3, 2, 3, 4, 5, 5, 5, 6, 7, 7, 7],
  [3, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 7],
  [5, 5, 5, 6, 6, 7, 7, 7, 7, 7, 8, 8],
  [7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8],
  [8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9]
]
const RULA_TABLE_C = [
  [1, 2, 3, 3, 4, 5, 5],
  [2, 2, 3, 4, 4, 5, 5],
  [3, 3, 3, 4, 4, 5, 6],
  [3, 3, 3, 4, 5, 6, 6],
  [4, 4, 4, 5, 6, 7, 7],
  [4, 4, 5, 6, 6, 7, 7],
  [5, 5, 6, 6, 7, 7, 7],
  [5, 5, 6, 7, 7, 7, 7]
]

export default class RULA {
  data: Map<string, number>[] = []
  currentScore = 0
  boneSettings: RULABonesSettings[] = [
    {
      name: 'Spine',
      transform: new THREE.Matrix4().makeRotationFromEuler(
        new THREE.Euler(Math.PI / 2, Math.PI / 2, 0)
      ),
      marker: null,
      computeScore: (angles, scores) => {
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

        scores.set('POSTURE_DU_TRONC', score)
      }
    },
    {
      name: 'Neck',
      transform: new THREE.Matrix4().makeRotationFromEuler(
        new THREE.Euler(0, 0, Math.PI / 2)
      ),
      marker: null,
      computeScore: (angles, scores) => {
        let score = 0
        // Inclinaison de la tête
        if (angles.x < -5) score += 4
        if (angles.x > 0 && angles.x <= 10) score += 2
        if (angles.x > 10 && angles.x <= 20) score += 3

        // Rotation de la nuque
        if (angles.z < -5 || angles.z > 5) score += 1

        // Inclinaison de la nuque
        if (angles.y < -5 || angles.y > 5) score += 1
        scores.set('NUQUE', score)
      }
    },
    {
      name: 'RightArm',
      transform: null,
      marker: null,
      computeScore: (angles, scores) => {
        let score = 0

        // Position vers l'arrière de l'épaule
        if (angles.y < -20) score += 2
        if (angles.y > -20 && angles.y < 20) score += 1

        // Position vers l'avant de l'épaule
        if (angles.y >= 20 && angles.y < 45) score += 2
        if (angles.y >= 45 && angles.y < 90) score += 3
        if (angles.y >= 90) score += 4

        // Orientation du bras (= position du coude sur le PDF ??)
        if (angles.x < -10 || angles.x > 10) score += 1

        scores.set('EPAULE_DROITE', score)
      }
    },
    {
      name: 'RightForeArm',
      transform: null,
      marker: null,
      computeScore: (angles, scores) => {
        let score = 0

        if (angles.y < 60) score += 2
        if (angles.y >= 60 && angles.y < 100) score += 1
        if (angles.y >= 100) score += 2

        scores.set('COUDE_DROIT', score)
      }
    },
    {
      name: 'RightHand',
      transform: null,
      marker: null,
      computeScore: (angles, scores) => {
        let score = 0

        // Lever la main vers le haut
        if (angles.z > -5 && angles.z < 5) score += 1
        if (angles.z <= -5 && angles.z > -15) score += 2
        if (angles.z <= -15) score += 3

        // Baisser la main
        if (angles.z >= 5) score += 3

        // Tourner la main (neutre autour de -15° )
        if (angles.y > -10 || angles.y < -20) score += 1
        scores.set('POIGNET_DROIT', score)

        score = 0

        // Torsion du poignet (différence partielle/extrème jugée à +-10°)
        if (angles.x > 5 && angles.x <= 10) score += 1
        if (angles.x > 10) score += 2
        if (angles.x < -5 || angles.x >= -10) score += 1
        if (angles.x < 10) score += 2
        scores.set('TORSION_POIGNET_DROIT', score)
      }
    },
    {
      name: 'LeftArm',
      transform: new THREE.Matrix4().makeScale(-1, 1, 1),
      marker: null,
      computeScore: (angles, scores) => {
        let score = 0

        // Position vers l'arrière de l'épaule
        if (angles.y > 20) score += 2
        if (angles.y > -20 && angles.y < 20) score += 1

        // Position vers l'avant de l'épaule
        if (angles.y <= -20 && angles.y > -45) score += 2
        if (angles.y <= -45 && angles.y > -90) score += 3
        if (angles.y <= -90) score += 4

        // Orientation du bras (= position du coude sur le PDF ??)
        if (angles.x < -10 || angles.x > 10) score += 1

        scores.set('EPAULE_GAUCHE', score)
      }
    },
    {
      name: 'LeftForeArm',
      transform: new THREE.Matrix4().makeScale(-1, 1, 1),
      marker: null,
      computeScore: (angles, scores) => {
        let score = 0

        if (angles.y > -60) score += 2
        if (angles.y <= -60 && angles.y > -100) score += 1
        if (angles.y <= -100) score += 2

        scores.set('COUDE_GAUCHE', score)
      }
    },
    {
      name: 'LeftHand',
      transform: new THREE.Matrix4().makeScale(-1, 1, 1),
      marker: null,
      computeScore: (angles, scores) => {
        let score = 0

        // Lever la main vers le haut
        if (angles.z > -5 && angles.z < 5) score += 1
        if (angles.z >= 5 && angles.z < 15) score += 2
        if (angles.z >= 15) score += 3

        // Baisser la main
        if (angles.z <= -5) score += 3

        // Tourner la main (neutre autour de 15° )
        if (angles.y < 10 || angles.y > 20) score += 1
        scores.set('POIGNET_GAUCHE', score)

        score = 0
        // Torsion du poignet (différence partielle/extrème jugée à +-10°)
        if (angles.x > 5 && angles.x <= 10) score += 1
        if (angles.x > 10) score += 2
        if (angles.x < -5 || angles.x >= -10) score += 1
        if (angles.x < 10) score += 2

        scores.set('TORSION_POIGNET_GAUCHE', score)
      }
    }
  ]

  scene: THREE.Scene

  constructor (scene: THREE.Scene) {
    this.scene = scene
  }

  createRULAMarkers (skeleton: THREE.SkeletonHelper): void {
    skeleton.bones.map(bone => {
      const setting = this.boneSettings
        .filter(setting => setting.name === bone.name)
        .pop()
      if (setting) {
        const axesHelper = new THREE.AxesHelper(10)
        bone.children.push(axesHelper)
        axesHelper.parent = bone
        axesHelper.name = bone.name
        setting.marker = axesHelper
      }
    })
  }

  getLocalScore (
    scores: Map<string, number>,
    name: string,
    min = -Infinity,
    max = Infinity
  ): number {
    const value = scores.get(name) || 1
    return value < min ? min : value > max ? max : value
  }

  computeGlobalScore (scores: Map<string, number>): void {
    /*
      "POSTURE_DU_TRONC"
      "NUQUE"
      "EPAULE_DROITE"
      "COUDE_DROIT"
      "POIGNET_DROIT"
      "TORSION_POIGNET_DROIT"
      "EPAULE_GAUCHE"
      "COUDE_GAUCHE"
      "POIGNET_GAUCHE"
      "TORSION_POIGNET_GAUCHE"
    */

    // Step 1
    scores.set(
      'EPAULE',
      Math.max(
        this.getLocalScore(scores, 'EPAULE_DROITE'),
        this.getLocalScore(scores, 'EPAULE_GAUCHE')
      )
    )

    // Step 2
    scores.set(
      'COUDE',
      Math.max(
        this.getLocalScore(scores, 'COUDE_DROIT'),
        this.getLocalScore(scores, 'COUDE_GAUCHE')
      )
    )

    // Step 3
    scores.set(
      'POIGNET',
      Math.max(
        this.getLocalScore(scores, 'POIGNET_DROIT'),
        this.getLocalScore(scores, 'POIGNET_GAUCHE')
      )
    )

    // Step 4
    scores.set(
      'TORSION_POIGNET',
      Math.max(
        this.getLocalScore(scores, 'TORSION_POIGNET_DROIT'),
        this.getLocalScore(scores, 'TORSION_POIGNET_GAUCHE')
      )
    )

    // Step 5
    const RowTableA =
      this.getLocalScore(scores, 'EPAULE', 1, 6) +
      this.getLocalScore(scores, 'COUDE', 1, 3)

    const ColumnTableA =
      this.getLocalScore(scores, 'POIGNET', 1, 4) +
      this.getLocalScore(scores, 'TORSION_POIGNET', 1, 2)

    const valueTableA = RULA_TABLE_A[RowTableA][ColumnTableA]

    // Step 6
    const valueMuscleActivityTop = 0

    // Step 7
    const weightScoreTop = 0

    // Step 8
    scores.set(
      'POIGNET_ET_BRAS',
      valueTableA + valueMuscleActivityTop + weightScoreTop
    )

    // Step 9 : "NUQUE"

    // Step 10 : "POSTURE_DU_TRONC"

    // Step 11
    scores.set('JAMBES', 2)

    // Step 12
    const RowTableB = this.getLocalScore(scores, 'NUQUE', 1, 6)
    const ColumnTableB =
      this.getLocalScore(scores, 'POSTURE_DU_TRONC', 1, 6) +
      this.getLocalScore(scores, 'JAMBES', 1, 2)
    const valueTableB = RULA_TABLE_B[RowTableB][ColumnTableB]

    // Step 13
    const valueMuscleActivityBottom = 0

    // Step 14
    const weightScoreBottom = 0

    // Step 15
    scores.set(
      'NUQUE_TRONC_ET_JAMBES',
      valueTableB + valueMuscleActivityBottom + weightScoreBottom
    )

    // Final step
    const RowTableC = this.getLocalScore(scores, 'NUQUE', 1, 8)
    const ColumnTableC = this.getLocalScore(
      scores,
      'NUQUE_TRONC_ET_JAMBES',
      1,
      7
    )
    const valueTableC = RULA_TABLE_C[RowTableC][ColumnTableC]

    scores.set('FINAL_SCORE', valueTableC)
    this.data.push(new Map(scores))
    this.currentScore = valueTableC
  }

  update (): void {
    const scores = new Map<string, number>()

    this.boneSettings.forEach(setting => {
      if (setting.marker == null || setting.marker.parent == null) return

      // Compute angles
      const q = setting.marker.parent.quaternion
      const r = new THREE.Euler().setFromQuaternion(q, 'XYZ')
      const radToDegrees = (n: number) => (n / (2 * Math.PI)) * 360
      const angles = new THREE.Vector3(
        radToDegrees(r.x),
        radToDegrees(r.y),
        radToDegrees(r.z)
      )

      // Compute local score
      setting.computeScore(angles, scores)

      // Debug angle and local score
      const f = (n: number) => Math.floor(n * 100) / 100
      // console.log(
      //   setting.name,
      //   f(angles.x),
      //   f(angles.y),
      //   f(angles.z),
      //   localScore
      // )
    })
    this.computeGlobalScore(scores)
  }

  download (filename: string, text: string) {
    const element = document.createElement('a')
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(text)
    )
    element.setAttribute('download', filename)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  export (): void {
    let csv = ''
    const header = [...this.data[0].keys()].join(',')
    const values = this.data.map(o => [...o.values()].join(',')).join('\n')
    csv += header + '\n' + values
    this.download('data.csv', csv)
  }
}
