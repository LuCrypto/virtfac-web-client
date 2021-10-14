<template>
  <v-container class="home" fluid>
    <v-card elevation="3" class="mx-auto">
      <v-card-title>V.I.R.T.Fac</v-card-title>
      <v-card-subtitle>(Virtual Innovative Real Time Factory)</v-card-subtitle>
      <v-img src="@/assets/photo_01.jpg"></v-img>
    </v-card>
    <v-card elevation="3" class="mx-auto my-12" max-width="1000px">
      <v-card-text>
        V.I.R.T.Fac (Virtual Innovative Real Time Factory) : Optimiser
        le passage à l’industrie 4.0 : planifier le bon système de
        production au bon moment. La digitalisation progressive des moyens
        de production permet une mesure plus précise des activités de ses
        composants. Cela confère un nouveau rôle aux outils numériques pour
        la reconfiguration, l’optimisation et l’évolution des systèmes de production.
        Ils permettent de relier les informations mesurées à diverses échelles du
        système et la performance globale de l’usine. Intégrés, ces outils
        fonctionnent comme une usine virtuelle.
      </v-card-text>
    </v-card>
    <v-card elevation="3" class="mx-auto my-12" max-width="1000px">
      <v-card-text>
        Ils permettent d’anticiper d’une part, l’impact des changements externes
        sur le système existant et, d’autre part, la pertinence des réponses
        proposées pour y faire face.<br>
        Le projet V.I.R.T.Fac développe, avec le concours d’entreprises engagées
        dans l’industrie 4.0, une plateforme reliant les données d’entreprise
        aux composants de l’usine virtuelle. Un démonstrateur intégrant la
        plateforme et les outils d’usine virtuelle remplit des fonctions
        d’information, d’expérimentation, de service, de formation et de
        recherche. Il permet d’accompagner les entreprises à divers degrés
        de maturité digitale dans la planification d’évolution de leur
        système de production, et d’aborder des problématiques de recherche
        induites par l’arrivé et la connexion des nouvelles technologies
        de production. L’accès via internet au démonstrateur permet
        l’information et la formation de divers publics à ces concepts.
      </v-card-text>

      <v-img src="@/assets/img_02.png" contain max-height="300" style="filter: sepia(100%) hue-rotate(314deg) saturate(400) contrast(0.8)"></v-img>
    </v-card>
    <v-card elevation="3" class="mx-auto my-12" max-width="1000px">
      <v-card-text>
        Partenaires du projet
        INSTITUT NATIONAL DES SCIENCES APPLIQUÉES DE STRASBOURG   PORTEUR DE PROJET
        96 523 €
      </v-card-text>
    </v-card>
    <v-card elevation="3" class="mx-auto my-12" max-width="1000px">
      <v-card-text>
        HOCHSCHULE OFFENBURG
        91 546.50 €
      </v-card-text>
    </v-card>
    <v-card elevation="3" class="mx-auto my-12" max-width="1000px">
      <v-card-text>
        UNITED PLANET
        MINISTERIUM FÜR WISSENSCHAFT, FORSCHUNG UND KUNST BADEN-WÜRTTEMBERG
        121 874.51 €
      </v-card-text>
    </v-card>
    <v-card elevation="3" class="mx-auto my-12" max-width="1000px">
      <v-card-text>
        MINISTERIUM FÜR WISSENSCHAFT, WEITERBILDUNG UND KULTUR RHEINLAND-PFALZ
        18 749.93 €
      </v-card-text>
    </v-card>
    <v-card elevation="3" class="mx-auto my-12" max-width="1000px">
      <v-card-text>
        UNIVERSITÉ DE STRASBOURG
        61 929.50 €

        CHAMBRE DE COMMERCE ET D'INDUSTRIE (CCI) D'ALSACE
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class Home extends Vue {}
</script>
