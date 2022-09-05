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
    fr: 'Score : Epaules',
    en: 'Score : Shoulders'
  }),

  // Right shoulders
  RIGHT_SHOULDER: new RULALabels('RIGHT_SHOULDER', {
    fr: 'Score : Epaule droite',
    en: 'Score : Right shoulder'
  }),
  RIGHT_SHOULDER_ANGLE_1: new RULALabels('RIGHT_SHOULDER_ANGLE_1', {
    fr: 'Angle : Position avant arriere du bras droit',
    en: 'Angle : Forward and backward position of the right arm'
  }),
  RIGHT_SHOULDER_ANGLE_2: new RULALabels('RIGHT_SHOULDER_ANGLE_2', {
    fr: 'Angle : Abduction du bras droit',
    en: 'Angle : Abduction of the right arm'
  }),
  RIGHT_SHOULDER_SCORE_1: new RULALabels('RIGHT_SHOULDER_SCORE_1', {
    fr: 'Score : Position avant arriere du bras droit',
    en: 'Score : Forward and backward position of the right arm'
  }),
  RIGHT_SHOULDER_SCORE_2: new RULALabels('RIGHT_SHOULDER_SCORE_2', {
    fr: 'Score : Abduction du bras droit',
    en: 'Score : Abduction of the right arm'
  }),

  // Left shoulders
  LEFT_SHOULDER: new RULALabels('LEFT_SHOULDER', {
    fr: 'Score : Epaule gauche',
    en: 'Score : Left shoulder'
  }),
  LEFT_SHOULDER_ANGLE_1: new RULALabels('LEFT_SHOULDER_ANGLE_1', {
    fr: 'Angle : Position avant arriere du bras gauche',
    en: 'Angle : Forward and backward position of the left arm'
  }),
  LEFT_SHOULDER_ANGLE_2: new RULALabels('LEFT_SHOULDER_ANGLE_2', {
    fr: 'Angle : Abduction du bras gauche',
    en: 'Angle : Abduction of the left arm'
  }),
  LEFT_SHOULDER_SCORE_1: new RULALabels('LEFT_SHOULDER_SCORE_1', {
    fr: 'Score : Position avant arriere du bras gauche',
    en: 'Score : Forward and backward position of the left arm'
  }),
  LEFT_SHOULDER_SCORE_2: new RULALabels('LEFT_SHOULDER_SCORE_2', {
    fr: 'Score : Abduction du bras gauche',
    en: 'Score : Abduction of the left arm'
  }),

  ELBOWS: new RULALabels('ELBOWS', {
    fr: 'Score : Coudes',
    en: 'Score : Elbows'
  }),

  // Right elbow
  RIGHT_ELBOW: new RULALabels('RIGHT_ELBOW', {
    fr: 'Score : Coude droit',
    en: 'Score : Right elbow'
  }),
  RIGHT_ELBOW_ANGLE_1: new RULALabels('RIGHT_ELBOW_ANGLE_1', {
    fr: 'Angle : Position avant arriere du coude droit',
    en: 'Angle : Forward and backward position of the right elbow'
  }),
  RIGHT_ELBOW_ANGLE_2: new RULALabels('RIGHT_ELBOW_ANGLE_2', {
    fr: 'Angle : Abduction du coude droit',
    en: 'Angle : Abduction of the right elbow'
  }),
  RIGHT_ELBOW_SCORE_1: new RULALabels('RIGHT_ELBOW_SCORE_1', {
    fr: 'Score : Position avant arriere du coude droit',
    en: 'Score : Forward and backward position of the right elbow'
  }),
  RIGHT_ELBOW_SCORE_2: new RULALabels('RIGHT_ELBOW_SCORE_2', {
    fr: 'Score : Abduction du coude droit',
    en: 'Score : Abduction of the right elbow'
  }),

  // Left elbow
  LEFT_ELBOW: new RULALabels('LEFT_ELBOW', {
    fr: 'Score : Coude gauche',
    en: 'Score : Left elbow'
  }),
  LEFT_ELBOW_ANGLE_1: new RULALabels('LEFT_ELBOW_ANGLE_1', {
    fr: 'Angle : Position avant arriere du coude gauche',
    en: 'Angle : Forward and backward position of the left elbow'
  }),
  LEFT_ELBOW_ANGLE_2: new RULALabels('LEFT_ELBOW_ANGLE_2', {
    fr: 'Angle : Abduction du coude gauche',
    en: 'Angle : Abduction of the left elbow'
  }),
  LEFT_ELBOW_SCORE_1: new RULALabels('LEFT_ELBOW_SCORE_1', {
    fr: 'Score : Position avant arriere du coude gauche',
    en: 'Score : Forward and backward position of the left elbow'
  }),
  LEFT_ELBOW_SCORE_2: new RULALabels('LEFT_ELBOW_SCORE_2', {
    fr: 'Score : Abduction du coude gauche',
    en: 'Score : Abduction of the left elbow'
  }),

  WRISTS: new RULALabels('WRISTS', {
    fr: 'Score : Poignets',
    en: 'Score : Wrists'
  }),

  // Right wrist
  RIGHT_WRIST: new RULALabels('RIGHT_WRIST', {
    fr: 'Score : Poignet droit',
    en: 'Score : Right wrist'
  }),
  RIGHT_WRIST_ANGLE_1: new RULALabels('RIGHT_WRIST_ANGLE_1', {
    fr: 'Angle : Lever / baisser la main droite',
    en: 'Angle : Raise / lower your right hand'
  }),
  RIGHT_WRIST_ANGLE_2: new RULALabels('RIGHT_WRIST_ANGLE_2', {
    fr: 'Angle : Tourner la main droite',
    en: 'Angle : Turn your right hand'
  }),
  RIGHT_WRIST_SCORE_1: new RULALabels('RIGHT_WRIST_SCORE_1', {
    fr: 'Score : Lever / baisser la main doite',
    en: 'Score : Raise / lower your right hand'
  }),
  RIGHT_WRIST_SCORE_2: new RULALabels('RIGHT_WRIST_SCORE_2', {
    fr: 'Score : Tourner la main droite',
    en: 'Score : Turn your right hand'
  }),

  LEFT_WRIST: new RULALabels('LEFT_WRIST', {
    fr: 'Score : Poignet gauche',
    en: 'Score : Left wrist'
  }),
  LEFT_WRIST_ANGLE_1: new RULALabels('LEFT_WRIST_ANGLE_1', {
    fr: 'Angle : Lever / baisser la main gauche',
    en: 'Angle : Raise / lower your left hand'
  }),
  LEFT_WRIST_ANGLE_2: new RULALabels('LEFT_WRIST_ANGLE_2', {
    fr: 'Angle : Tourner la main gauche',
    en: 'Angle : Turn your left hand'
  }),
  LEFT_WRIST_SCORE_1: new RULALabels('LEFT_WRIST_SCORE_1', {
    fr: 'Score : Lever / baisser la main gauche',
    en: 'Score : Raise / lower your left hand'
  }),
  LEFT_WRIST_SCORE_2: new RULALabels('LEFT_WRIST_SCORE_2', {
    fr: 'Score : Tourner la main gauche',
    en: 'Score : Turn your left hand'
  }),

  WRISTS_TWIST: new RULALabels('WRISTS_TWIST', {
    fr: 'Score : Torsion poignets',
    en: 'Score : Wrists twist'
  }),

  RIGHT_WRIST_TWIST_ANGLE: new RULALabels('RIGHT_WRIST_TWIST_ANGLE', {
    fr: 'Angle : Torsion du poignet droit',
    en: 'Angle : Twist wrist'
  }),
  RIGHT_WRIST_TWIST: new RULALabels('RIGHT_WRIST_TWIST', {
    fr: 'Score : Torsion poignet droit',
    en: 'Score : Right wrist twist'
  }),

  LEFT_WRIST_TWIST_ANGLE: new RULALabels('LEFT_WRIST_TWIST_ANGLE', {
    fr: 'Angle : Torsion du poignet gauche',
    en: 'Angle : Left twist wrist'
  }),
  LEFT_WRIST_TWIST: new RULALabels('LEFT_WRIST_TWIST', {
    fr: 'Score : Torsion poignet gauche',
    en: 'Score : Left wrist twist'
  }),

  // Neck
  NECK_ANGLE_1: new RULALabels('NECK_ANGLE_1', {
    fr: 'Angle : Inclinaison de la tete',
    en: 'Angle : Head tilt'
  }),
  NECK_ANGLE_2: new RULALabels('NECK_ANGLE_2', {
    fr: 'Angle : Rotation de la nuque',
    en: 'Angle : Neck rotation'
  }),
  NECK_ANGLE_3: new RULALabels('NECK_ANGLE_3', {
    fr: 'Angle : Inclinaison de la nuque',
    en: 'Angle : Neck tilt'
  }),
  NECK_SCORE_1: new RULALabels('NECK_SCORE_1', {
    fr: 'Score : Inclinaison de la tete',
    en: 'Score : Head tilt'
  }),
  NECK_SCORE_2: new RULALabels('NECK_SCORE_2', {
    fr: 'Score : Rotation de la nuque',
    en: 'Score : Neck rotation'
  }),
  NECK_SCORE_3: new RULALabels('NECK_SCORE_3', {
    fr: 'Score : Inclinaison de la nuque',
    en: 'Score : Neck tilt'
  }),
  NECK: new RULALabels('NECK', {
    fr: 'Score : Nuque',
    en: 'Score : Neck'
  }),

  // Trunk
  TRUNK_POSTURE_ANGLE_1: new RULALabels('TRUNK_POSTURE_ANGLE_1', {
    fr: 'Angle : Abaissement du tronc',
    en: 'Angle : Trunk lowering'
  }),
  TRUNK_POSTURE_ANGLE_2: new RULALabels('TRUNK_POSTURE_ANGLE_2', {
    fr: 'Angle : Inclinaison laterale du tronc',
    en: 'Angle : Lateral tilt of the trunk'
  }),
  TRUNK_POSTURE_ANGLE_3: new RULALabels('TRUNK_POSTURE_ANGLE_3', {
    fr: 'Angle : Rotation du tronc',
    en: 'Angle : Trunk rotation'
  }),

  TRUNK_POSTURE_SCORE_1: new RULALabels('TRUNK_POSTURE_SCORE_1', {
    fr: 'Score : Abaissement du tronc',
    en: 'Score : Trunk lowering'
  }),
  TRUNK_POSTURE_SCORE_2: new RULALabels('TRUNK_POSTURE_SCORE_2', {
    fr: 'Score : Inclinaison laterale du tronc',
    en: 'Score : Lateral tilt of the trunk'
  }),
  TRUNK_POSTURE_SCORE_3: new RULALabels('TRUNK_POSTURE_SCORE_3', {
    fr: 'Score : Rotation du tronc',
    en: 'Score : Trunk rotation'
  }),

  TRUNK_POSTURE: new RULALabels('TRUNK_POSTURE', {
    fr: 'Score : Posture du tronc',
    en: 'Score : Trunck posture'
  }),

  LEGS: new RULALabels('LEGS', {
    fr: 'Score : Jambes',
    en: 'Score : Legs'
  }),

  // Computed data from RULA table
  WRIST_AND_ARM: new RULALabels('WRIST_AND_ARM', {
    fr: 'Score : Poignet et bras',
    en: 'Score : Wrist and arm'
  }),
  NECK_TRUNK_AND_LEGS: new RULALabels('NECK_TRUNK_AND_LEGS', {
    fr: 'Score : Nuque tronc et jambes',
    en: 'Score : Neck trunk and legs'
  }),
  FINAL_SCORE: new RULALabels('FINAL_SCORE', {
    fr: 'Score : Final result',
    en: 'Score : Resultat final'
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
  axeMarker: THREE.AxesHelper | null
  pointMarker: THREE.Mesh | null
  computeScore: (angles: THREE.Vector3, scores: Map<string, number>) => void
}

export default class RULA {
  data: Map<string, number>[] = []
  boneSettings: RULABonesSettings[] = [
    {
      boneName: 'Spine',
      axeMarker: null,
      pointMarker: null,
      computeScore: (
        angles: THREE.Vector3,
        scores: Map<string, number>
      ): void => {
        // Baissage de tronc
        let score1 = 0
        if (angles.x <= 5) score1 += 1
        if (angles.x > 5 && angles.x <= 20) score1 += 2
        if (angles.x > 20 && angles.x <= 60) score1 += 3
        if (angles.x > 60) score1 += 4

        scores.set(RULA_LABELS.TRUNK_POSTURE_ANGLE_1.key, angles.x)
        scores.set(RULA_LABELS.TRUNK_POSTURE_SCORE_1.key, score1)

        // Inclinaison laterale du tronc
        let score2 = 0
        if (angles.z < -5 || angles.z > 5) score2 += 1
        scores.set(RULA_LABELS.TRUNK_POSTURE_ANGLE_2.key, angles.z)
        scores.set(RULA_LABELS.TRUNK_POSTURE_SCORE_2.key, score2)

        // Rotation du tronc
        let score3 = 0
        if (angles.y < -5 || angles.y > 5) score3 += 1
        scores.set(RULA_LABELS.TRUNK_POSTURE_ANGLE_3.key, angles.y)
        scores.set(RULA_LABELS.TRUNK_POSTURE_SCORE_3.key, score3)

        // Total
        const total = score1 + score2 + score3
        scores.set(RULA_LABELS.TRUNK_POSTURE.key, total)
      }
    },
    {
      boneName: 'Head',
      axeMarker: null,
      pointMarker: null,
      computeScore: (
        angles: THREE.Vector3,
        scores: Map<string, number>
      ): void => {
        // Inclinaison de la tete
        let score1 = 0
        if (angles.x > 0) score1 += 4
        if (angles.x <= 0 && angles.x >= -10) score1 += 1
        if (angles.x < -10 && angles.x >= -20) score1 += 2
        if (angles.x < -20) score1 += 3
        scores.set(RULA_LABELS.NECK_ANGLE_1.key, angles.x)
        scores.set(RULA_LABELS.NECK_SCORE_1.key, score1)

        // Rotation de la nuque
        let score2 = 0
        if (angles.z < -5 || angles.z > 5) score2 += 1
        scores.set(RULA_LABELS.NECK_ANGLE_2.key, angles.z)
        scores.set(RULA_LABELS.NECK_SCORE_2.key, score2)

        // Inclinaison de la nuque
        let score3 = 0
        if (angles.y < -5 || angles.y > 5) score3 += 1
        scores.set(RULA_LABELS.NECK_ANGLE_3.key, angles.y)
        scores.set(RULA_LABELS.NECK_SCORE_3.key, score3)

        // Total
        const total = score1 + score2 + score3
        scores.set(RULA_LABELS.NECK.key, total)
      }
    },
    {
      boneName: 'RightArm',
      axeMarker: null,
      pointMarker: null,
      computeScore: (
        angles: THREE.Vector3,
        scores: Map<string, number>
      ): void => {
        // Position avant arriere du bras
        let score1 = 0
        if (angles.y < -20) score1 += 2
        if (angles.y > -20 && angles.y < 20) score1 += 1
        if (angles.y >= 20 && angles.y < 45) score1 += 2
        if (angles.y >= 45 && angles.y < 90) score1 += 3
        if (angles.y >= 90) score1 += 4
        scores.set(RULA_LABELS.RIGHT_SHOULDER_ANGLE_1.key, angles.y)
        scores.set(RULA_LABELS.RIGHT_SHOULDER_SCORE_1.key, score1)

        // Abduction du bras droit
        let score2 = 0
        if (angles.z < -10 || angles.z > 10) score2 += 1
        scores.set(RULA_LABELS.RIGHT_SHOULDER_ANGLE_2.key, angles.z)
        scores.set(RULA_LABELS.RIGHT_SHOULDER_SCORE_2.key, score2)

        // Total
        const total = score1 + score2
        scores.set(RULA_LABELS.RIGHT_SHOULDER.key, total)
      }
    },
    {
      boneName: 'RightForeArm',
      axeMarker: null,
      pointMarker: null,
      computeScore: (
        angles: THREE.Vector3,
        scores: Map<string, number>
      ): void => {
        // Orientation avant arriete du coude
        let score1 = 0
        if (angles.y < 60) score1 += 2
        if (angles.y >= 60 && angles.y < 100) score1 += 1
        if (angles.y >= 100) score1 += 2
        scores.set(RULA_LABELS.RIGHT_ELBOW_ANGLE_1.key, angles.y)
        scores.set(RULA_LABELS.RIGHT_ELBOW_SCORE_1.key, score1)

        // Abduction du coude
        let score2 = 0
        if (angles.x < -10 || angles.x > 10) score2 += 1
        scores.set(RULA_LABELS.RIGHT_ELBOW_ANGLE_2.key, angles.x)
        scores.set(RULA_LABELS.RIGHT_ELBOW_SCORE_2.key, score2)

        // Total
        const total = score1 + score2
        scores.set(RULA_LABELS.RIGHT_ELBOW.key, total)
      }
    },
    {
      boneName: 'RightHand',
      axeMarker: null,
      pointMarker: null,
      computeScore: (
        angles: THREE.Vector3,
        scores: Map<string, number>
      ): void => {
        // Lever / baisser la main (neutre autour de 25°)
        const neutral = -25
        let score1 = 0
        if (angles.z > neutral - 5 && angles.z < neutral + 5) score1 += 1
        if (angles.z <= neutral - 5 && angles.z > neutral - 15) score1 += 2
        if (angles.z <= neutral - 15) score1 += 3
        if (angles.z >= neutral + 5) score1 += 3
        scores.set(RULA_LABELS.RIGHT_WRIST_ANGLE_1.key, angles.z)
        scores.set(RULA_LABELS.RIGHT_WRIST_SCORE_1.key, score1)

        // Tourner la main (neutre autour de -10° )
        let score2 = 0
        if (angles.y < -10 || angles.y > 10) score2 += 1
        scores.set(RULA_LABELS.RIGHT_WRIST_ANGLE_2.key, angles.y)
        scores.set(RULA_LABELS.RIGHT_WRIST_SCORE_2.key, score2)

        // Total right wrist
        const total = score1 + score2
        scores.set(RULA_LABELS.RIGHT_WRIST.key, total)

        // Torsion du poignet (difference partielle/extreme jugee à +-5)
        let score3 = 0
        if (angles.x > -5 && angles.x <= 5) score3 += 1
        else score3 += 2
        scores.set(RULA_LABELS.RIGHT_WRIST_TWIST_ANGLE.key, angles.x)
        scores.set(RULA_LABELS.RIGHT_WRIST_TWIST.key, score3)
      }
    },
    {
      boneName: 'LeftArm',
      axeMarker: null,
      pointMarker: null,
      computeScore: (
        angles: THREE.Vector3,
        scores: Map<string, number>
      ): void => {
        // Position avant arriere du bras droit
        let score1 = 0
        if (angles.y > 20) score1 += 2
        if (angles.y > -20 && angles.y < 20) score1 += 1
        if (angles.y <= -20 && angles.y > -45) score1 += 2
        if (angles.y <= -45 && angles.y > -90) score1 += 3
        if (angles.y <= -90) score1 += 4
        scores.set(RULA_LABELS.LEFT_SHOULDER_ANGLE_1.key, angles.y)
        scores.set(RULA_LABELS.LEFT_SHOULDER_SCORE_1.key, score1)

        // Abduction du bras gauche
        let score2 = 0
        if (angles.z < -10 || angles.z > 10) score2 += 1
        scores.set(RULA_LABELS.LEFT_SHOULDER_ANGLE_2.key, angles.z)
        scores.set(RULA_LABELS.LEFT_SHOULDER_SCORE_2.key, score2)

        // Total
        const total = score1 + score2
        scores.set(RULA_LABELS.LEFT_SHOULDER.key, total)
      }
    },
    {
      boneName: 'LeftForeArm',
      axeMarker: null,
      pointMarker: null,
      computeScore: (
        angles: THREE.Vector3,
        scores: Map<string, number>
      ): void => {
        // Orientation avant arriete du coude
        let score1 = 0
        if (angles.y > -60) score1 += 2
        if (angles.y <= -60 && angles.y > -100) score1 += 1
        if (angles.y <= -100) score1 += 2
        scores.set(RULA_LABELS.LEFT_ELBOW_ANGLE_1.key, angles.y)
        scores.set(RULA_LABELS.LEFT_ELBOW_SCORE_1.key, score1)

        // Abduction du coude
        let score2 = 0
        if (angles.x < -10 || angles.x > 10) score2 += 1
        scores.set(RULA_LABELS.LEFT_ELBOW_ANGLE_2.key, angles.x)
        scores.set(RULA_LABELS.LEFT_ELBOW_SCORE_2.key, score2)

        // Total
        const total = score1 + score2
        scores.set(RULA_LABELS.LEFT_ELBOW.key, total)
      }
    },
    {
      boneName: 'LeftHand',
      axeMarker: null,
      pointMarker: null,
      computeScore: (
        angles: THREE.Vector3,
        scores: Map<string, number>
      ): void => {
        // Lever / baisser la main
        let score1 = 0
        const neutral = 25
        if (angles.z > neutral - 5 && angles.z < neutral + 5) score1 += 1
        if (angles.z >= neutral + 5 && angles.z < neutral + 15) score1 += 2
        if (angles.z >= neutral + 15) score1 += 3
        if (angles.z <= neutral - 5) score1 += 3
        scores.set(RULA_LABELS.LEFT_WRIST_ANGLE_1.key, angles.z)
        scores.set(RULA_LABELS.LEFT_WRIST_SCORE_1.key, score1)

        // Tourner la main (neutre autour de -10° )
        let score2 = 0
        if (angles.y < -10 || angles.y > 10) score2 += 1
        scores.set(RULA_LABELS.LEFT_WRIST_ANGLE_2.key, angles.y)
        scores.set(RULA_LABELS.LEFT_WRIST_SCORE_2.key, score2)

        // Total right wrist
        const total = score1 + score2
        scores.set(RULA_LABELS.LEFT_WRIST.key, total)

        // Torsion du poignet (difference partielle/extreme jugee à +-5)
        let score3 = 0
        if (angles.x > -5 && angles.x <= 5) score3 += 1
        else score3 += 2
        scores.set(RULA_LABELS.LEFT_WRIST_TWIST_ANGLE.key, angles.x)
        scores.set(RULA_LABELS.LEFT_WRIST_TWIST.key, score3)
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

    const valueTableA = RULA_TABLE_A[RowTableA - 1][ColumnTableA - 1]

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

    const valueTableB = RULA_TABLE_B[RowTableB - 1][ColumnTableB - 1]

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
    const valueTableC = RULA_TABLE_C[RowTableC - 1][ColumnTableC - 1]

    scores.set(RULA_LABELS.FINAL_SCORE.key, valueTableC)
  }

  /* This method attaches a marker to each bone, which is then used as a
   * reference for calculating the RULA score */
  createRULAMarkers (skeleton: THREE.SkeletonHelper): void {
    skeleton.bones.map(bone => {
      const setting = this.boneSettings
        .filter(setting => setting.boneName === bone.name)
        .pop()
      if (setting) {
        // Create axe marker
        const axeMarker = new THREE.AxesHelper(10)
        bone.children.push(axeMarker)
        axeMarker.parent = bone
        axeMarker.name = bone.name
        setting.axeMarker = axeMarker

        // Create point marker
        const geometry = new THREE.SphereGeometry(5, 8, 6)
        const material = new THREE.MeshBasicMaterial({ color: 0x000000 })
        const pointMarker = new THREE.Mesh(geometry, material)
        bone.children.push(pointMarker)
        pointMarker.parent = bone
        pointMarker.name = bone.name
        setting.pointMarker = pointMarker
      }
    })
  }

  removeRULAMarkers (skeleton: THREE.SkeletonHelper) {
    console.log('TODO : Remove rula markers', skeleton)
  }

  static getMarkerColor (value: number): number {
    return value <= 2
      ? 0x1b7570
      : value <= 4
        ? 0xe9ce09
        : value <= 6
          ? 0xe8a30a
          : 0xba2d52
  }

  updateRULAMarkers (
    markerValues: Map<string, number>,
    markerType: number
  ): void {
    const getScoreLabelByBoneName = {
      Spine: 'TRUNK_POSTURE',
      Head: 'NECK',
      RightArm: 'RIGHT_SHOULDER',
      RightForeArm: 'RIGHT_ELBOW',
      RightHand: 'RIGHT_WRIST',
      LeftArm: 'LEFT_SHOULDER',
      LeftForeArm: 'LEFT_ELBOW',
      LeftHand: 'LEFT_WRIST'
    }

    this.boneSettings.forEach(setting => {
      if (!setting.pointMarker || !setting.axeMarker) return
      switch (markerType) {
        case 0:
          setting.pointMarker.visible = false
          setting.axeMarker.visible = false
          break
        case 1:
          setting.pointMarker.visible = true
          setting.axeMarker.visible = false
          break
        case 2:
          setting.pointMarker.visible = false
          setting.axeMarker.visible = true
          break
        case 3:
          setting.pointMarker.visible = true
          setting.axeMarker.visible = true
          break
      }

      const marker = setting.pointMarker
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
      if (setting.axeMarker == null || setting.axeMarker.parent == null) return

      // Compute angles
      const q = setting.axeMarker.parent.quaternion
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
