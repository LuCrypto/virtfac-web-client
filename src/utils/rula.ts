import * as THREE from 'three'

class RULALabels {
  key: string
  name = {
    fr: '',
    en: ''
  }

  constructor (key: string, name: { fr: string; en: string }) {
    this.key = key
    Object.assign(this.name, name)
  }
}

export const RULA_LABELS = {
  SHOULDERS: new RULALabels('SHOULDERS', {
    fr: 'Epaules',
    en: 'Shoulders'
  }),
  RIGHT_SHOULDER: new RULALabels('RIGHT_SHOULDER', {
    fr: 'Epaule droite',
    en: 'Right shoulder'
  }),
  LEFT_SHOULDER: new RULALabels('LEFT_SHOULDER', {
    fr: 'Epaule gauche',
    en: 'Left shoulder'
  }),

  ELBOWS: new RULALabels('ELBOWS', {
    fr: 'Coudes',
    en: 'Elbows'
  }),
  RIGHT_ELBOW: new RULALabels('RIGHT_ELBOW', {
    fr: 'Coude droit',
    en: 'Right elbow'
  }),
  LEFT_ELBOW: new RULALabels('LEFT_ELBOW', {
    fr: 'Coude gauche',
    en: 'Left elbow'
  }),

  WRISTS: new RULALabels('WRISTS', {
    fr: 'Poignets',
    en: 'Wrists'
  }),
  RIGHT_WRIST: new RULALabels('RIGHT_WRIST', {
    fr: 'Poignet droit',
    en: 'Right wrist'
  }),
  LEFT_WRIST: new RULALabels('LEFT_WRIST', {
    fr: 'Poignet gauche',
    en: 'Left wrist'
  }),

  WRISTS_TWIST: new RULALabels('WRISTS_TWIST', {
    fr: 'Torsion poignets',
    en: 'Wrists twist'
  }),
  RIGHT_WRIST_TWIST: new RULALabels('RIGHT_WRIST_TWIST', {
    fr: 'Torsion poignet droit',
    en: 'Right wrist twist'
  }),
  LEFT_WRIST_TWIST: new RULALabels('LEFT_WRIST_TWIST', {
    fr: 'Torsion poignet gauche',
    en: 'Left wrist twist'
  }),

  NECK: new RULALabels('NECK', {
    fr: 'Nuque',
    en: 'Neck'
  }),

  TRUNK_POSTURE: new RULALabels('TRUNK_POSTURE', {
    fr: 'Posture du tronc',
    en: 'Trunck posture'
  }),

  LEGS: new RULALabels('LEGS', {
    fr: 'Jambes',
    en: 'Legs'
  }),

  // Computed data from RULA table
  WRIST_AND_ARM: new RULALabels('WRIST_AND_ARM', {
    fr: 'Poignet et bras',
    en: 'Wrist and arm'
  }),
  NECK_TRUNK_AND_LEGS: new RULALabels('NECK_TRUNK_AND_LEGS', {
    fr: 'Nuque tronc et jambes',
    en: 'Neck trunk and legs'
  }),
  FINAL_SCORE: new RULALabels('FINAL_SCORE', {
    fr: 'Score final',
    en: 'Final score'
  })
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

interface RULABonesSettings {
  boneName: string
  marker: THREE.AxesHelper | THREE.Mesh | null
  computeScore: (angles: THREE.Vector3, scores: Map<string, number>) => void
}

export default class RULA {
  data: Map<string, number>[] = []
  boneSettings: RULABonesSettings[] = [
    {
      boneName: 'Spine1',
      marker: null,
      computeScore: (
        angles: THREE.Vector3,
        scores: Map<string, number>
      ): void => {
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

        scores.set(RULA_LABELS.TRUNK_POSTURE.key, score)
      }
    },
    {
      boneName: 'Neck',
      marker: null,
      computeScore: (
        angles: THREE.Vector3,
        scores: Map<string, number>
      ): void => {
        let score = 0
        // Inclinaison de la tête
        if (angles.x < -5) score += 4
        if (angles.x > 0 && angles.x <= 10) score += 2
        if (angles.x > 10 && angles.x <= 20) score += 3

        // Rotation de la nuque
        if (angles.z < -5 || angles.z > 5) score += 1

        // Inclinaison de la nuque
        if (angles.y < -5 || angles.y > 5) score += 1
        scores.set(RULA_LABELS.NECK.key, score)
      }
    },
    {
      boneName: 'RightArm',
      marker: null,
      computeScore: (
        angles: THREE.Vector3,
        scores: Map<string, number>
      ): void => {
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

        scores.set(RULA_LABELS.RIGHT_SHOULDER.key, score)
      }
    },
    {
      boneName: 'RightForeArm',
      marker: null,
      computeScore: (
        angles: THREE.Vector3,
        scores: Map<string, number>
      ): void => {
        let score = 0

        if (angles.y < 60) score += 2
        if (angles.y >= 60 && angles.y < 100) score += 1
        if (angles.y >= 100) score += 2

        scores.set(RULA_LABELS.RIGHT_ELBOW.key, score)
      }
    },
    {
      boneName: 'RightHand',
      marker: null,
      computeScore: (
        angles: THREE.Vector3,
        scores: Map<string, number>
      ): void => {
        let score = 0

        // Lever la main vers le haut
        if (angles.z > -5 && angles.z < 5) score += 1
        if (angles.z <= -5 && angles.z > -15) score += 2
        if (angles.z <= -15) score += 3

        // Baisser la main
        if (angles.z >= 5) score += 3

        // Tourner la main (neutre autour de -15° )
        if (angles.y > -10 || angles.y < -20) score += 1
        scores.set(RULA_LABELS.RIGHT_WRIST.key, score)

        score = 0

        // Torsion du poignet (différence partielle/extrème jugée à +-10°)
        if (angles.x > 5 && angles.x <= 10) score += 1
        if (angles.x > 10) score += 2
        if (angles.x < -5 || angles.x >= -10) score += 1
        if (angles.x < 10) score += 2
        scores.set(RULA_LABELS.RIGHT_WRIST_TWIST.key, score)
      }
    },
    {
      boneName: 'LeftArm',
      marker: null,
      computeScore: (
        angles: THREE.Vector3,
        scores: Map<string, number>
      ): void => {
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

        scores.set(RULA_LABELS.LEFT_SHOULDER.key, score)
      }
    },
    {
      boneName: 'LeftForeArm',
      marker: null,
      computeScore: (
        angles: THREE.Vector3,
        scores: Map<string, number>
      ): void => {
        let score = 0

        if (angles.y > -60) score += 2
        if (angles.y <= -60 && angles.y > -100) score += 1
        if (angles.y <= -100) score += 2

        scores.set(RULA_LABELS.LEFT_ELBOW.key, score)
      }
    },
    {
      boneName: 'LeftHand',
      marker: null,
      computeScore: (
        angles: THREE.Vector3,
        scores: Map<string, number>
      ): void => {
        let score = 0

        // Lever la main vers le haut
        if (angles.z > -5 && angles.z < 5) score += 1
        if (angles.z >= 5 && angles.z < 15) score += 2
        if (angles.z >= 15) score += 3

        // Baisser la main
        if (angles.z <= -5) score += 3

        // Tourner la main (neutre autour de 15° )
        if (angles.y < 10 || angles.y > 20) score += 1
        scores.set(RULA_LABELS.LEFT_WRIST.key, score)

        score = 0
        // Torsion du poignet (différence partielle/extrème jugée à +-10°)
        if (angles.x > 5 && angles.x <= 10) score += 1
        if (angles.x > 10) score += 2
        if (angles.x < -5 || angles.x >= -10) score += 1
        if (angles.x < 10) score += 2

        scores.set(RULA_LABELS.LEFT_WRIST_TWIST.key, score)
      }
    }
  ]

  scene: THREE.Scene

  constructor (scene: THREE.Scene) {
    this.scene = scene
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
    // Step 1
    scores.set(
      RULA_LABELS.SHOULDERS.key,
      Math.max(
        this.getLocalScore(scores, RULA_LABELS.RIGHT_SHOULDER.key),
        this.getLocalScore(scores, RULA_LABELS.LEFT_SHOULDER.key)
      )
    )

    // Step 2
    scores.set(
      RULA_LABELS.ELBOWS.key,
      Math.max(
        this.getLocalScore(scores, RULA_LABELS.RIGHT_ELBOW.key),
        this.getLocalScore(scores, RULA_LABELS.LEFT_ELBOW.key)
      )
    )

    // Step 3
    scores.set(
      RULA_LABELS.WRISTS.key,
      Math.max(
        this.getLocalScore(scores, RULA_LABELS.RIGHT_WRIST.key),
        this.getLocalScore(scores, RULA_LABELS.LEFT_WRIST.key)
      )
    )

    // Step 4
    scores.set(
      RULA_LABELS.WRISTS_TWIST.key,
      Math.max(
        this.getLocalScore(scores, RULA_LABELS.RIGHT_WRIST_TWIST.key),
        this.getLocalScore(scores, RULA_LABELS.LEFT_WRIST_TWIST.key)
      )
    )

    // Step 5
    const RowTableA =
      this.getLocalScore(scores, RULA_LABELS.SHOULDERS.key, 1, 6) +
      this.getLocalScore(scores, RULA_LABELS.ELBOWS.key, 1, 3)

    const ColumnTableA =
      this.getLocalScore(scores, RULA_LABELS.WRISTS.key, 1, 4) +
      this.getLocalScore(scores, RULA_LABELS.WRISTS_TWIST.key, 1, 2)

    const valueTableA = RULA_TABLE_A[RowTableA][ColumnTableA]

    // Step 6
    const valueMuscleActivityTop = 0

    // Step 7
    const weightScoreTop = 0

    // Step 8
    scores.set(
      RULA_LABELS.WRIST_AND_ARM.key,
      valueTableA + valueMuscleActivityTop + weightScoreTop
    )

    // Step 9 : "NECK" is already calculated during the update

    // Step 10 : "TRUNK_POSTURE" is already calculated during the update

    // Step 11
    scores.set(RULA_LABELS.LEGS.key, 2)

    // Step 12
    const RowTableB = this.getLocalScore(scores, RULA_LABELS.NECK.key, 1, 6)
    const ColumnTableB =
      this.getLocalScore(scores, RULA_LABELS.TRUNK_POSTURE.key, 1, 6) +
      this.getLocalScore(scores, RULA_LABELS.LEGS.key, 1, 2)
    const valueTableB = RULA_TABLE_B[RowTableB][ColumnTableB]

    // Step 13
    const valueMuscleActivityBottom = 0

    // Step 14
    const weightScoreBottom = 0

    // Step 15
    scores.set(
      RULA_LABELS.NECK_TRUNK_AND_LEGS.key,
      valueTableB + valueMuscleActivityBottom + weightScoreBottom
    )

    // Final step
    const RowTableC = this.getLocalScore(scores, RULA_LABELS.NECK.key, 1, 8)
    const ColumnTableC = this.getLocalScore(
      scores,
      RULA_LABELS.NECK_TRUNK_AND_LEGS.key,
      1,
      7
    )
    const valueTableC = RULA_TABLE_C[RowTableC][ColumnTableC]

    scores.set(RULA_LABELS.FINAL_SCORE.key, valueTableC)
  }

  /* This method attaches a marker to each bone, which is then used as a
   * reference for calculating the RULA score */
  createRULAMarkers (
    skeleton: THREE.SkeletonHelper,
    markerType: 'AXIS' | 'SPHERE' = 'SPHERE'
  ): void {
    skeleton.bones.map(bone => {
      const setting = this.boneSettings
        .filter(setting => setting.boneName === bone.name)
        .pop()
      if (setting) {
        let marker: THREE.AxesHelper | THREE.Mesh | null = null

        switch (markerType) {
          case 'AXIS':
            marker = new THREE.AxesHelper(10)
            break
          case 'SPHERE':
            {
              const geometry = new THREE.SphereGeometry(10, 8, 6)
              const material = new THREE.MeshBasicMaterial({ color: 0x000000 })
              marker = new THREE.Mesh(geometry, material)
            }
            break
        }

        if (!marker) return

        bone.children.push(marker)
        marker.parent = bone
        marker.name = bone.name
        setting.marker = marker
      }
    })
  }

  static getMarkerColor (value: number): number {
    return value < 3 ? 0x27ae60 : value < 6 ? 0xd35400 : 0xe74c3c
  }

  updateRULAMarkers (markerValues: Map<string, number>): void {
    const getScoreLabelByBoneName = {
      Spine1: 'TRUNK_POSTURE',
      Neck: 'NECK',
      RightArm: 'RIGHT_SHOULDER',
      RightForeArm: 'RIGHT_ELBOW',
      RightHand: 'RIGHT_WRIST',
      LeftArm: 'LEFT_SHOULDER',
      LeftForeArm: 'LEFT_ELBOW',
      LeftHand: 'LEFT_WRIST'
    }

    this.boneSettings.forEach(setting => {
      const marker = setting.marker
      if (marker instanceof THREE.Mesh) {
        const name = setting.boneName
        if (name in getScoreLabelByBoneName) {
          const key = name as keyof typeof getScoreLabelByBoneName
          const label = getScoreLabelByBoneName[key]

          if (markerValues.has(label)) {
            const value = markerValues.get(label) as number
            marker.material = new THREE.MeshBasicMaterial({
              color: RULA.getMarkerColor(value)
            })
          }
        }
      }
    })
  }

  compute (): Map<string, number> {
    const scores = new Map<string, number>()

    // Compute all score
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

      // Compute local score and store it in "scores" map
      setting.computeScore(angles, scores)
    })

    // Compute global score stored in "scores" map
    this.computeGlobalScore(scores)
    return scores
  }
}
