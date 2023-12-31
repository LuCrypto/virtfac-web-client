export default {
  general: {
    openFile: 'Ouvrir Fichier',
    import: 'Importer',
    export: 'Exporter',
    menuLabels: 'Menu labels',
    confirm: 'Confirmer',
    cancel: 'Annuler',
    open: 'Ouvrir',
    close: 'Fermer',
    enterName: 'Entrer Nom',
    enterText: 'Entrer Text',
    inputField: 'Champ de text',
    name: 'Nom',
    date: 'Date',
    download: 'Télécherger',
    delete: 'Supprimer'
  },
  assetEditor: {
    title: "Ergonom.io Editeur d'Objet",
    description: "Outil d'édition d'objet 3D pour ergonom.io",
    openAsset: 'Ouvrir Objet',
    assetData: "Données de l'Objet",
    applyTransform: 'Appliquer Transformation',
    switchAxisMode: "Changer de mode d'Axe",
    switchSnapMode: "Changer mode d'accrochage",
    applyScale: "Changer l'échelle",
    captureImage: 'Capturer une Image',
    saveOnAPI: "Sauvegarder sur l'API"
  },
  blueprintEditor: {
    title: 'Éditeur de plan',
    description:
      "Outil pour l'édition de plan d'usine et d'export en scene ergonom.io",
    openFile: 'Ouvrir Fichier',
    defineScale: 'Définir Échelle',
    defineScalePlaceholder: 'entrer la distance de référence (en mètre) :',
    exportGLTF: 'Exporter GLTF',
    saveBlueprint: 'Sauvegarder Plan',
    saveScene: 'Sauvegarder Scene',
    selectFurniture: 'Sélectionner Fourniture',
    placeFurniture: 'Placer Fourniture',
    placeWall: 'Placer Mur',
    removeWall: 'Supprimer Mur'
  },
  constraintAnalysis: {
    title: 'Analyse de Contradiction',
    description: "Outil d'analyse de contradictions par un expert",
    openFile: 'Ouvrir Fichier',
    saveShape: 'Sauvegarder Disposition',
    loadShape: 'Charger Disposition',
    layouts: 'Dispositions',
    downloadImage: 'Télécharger Image',
    defaultLayout: 'Disposition par défaut',
    verticalHierarchy: 'Hiérarchie Verticale',
    horizontalHierarchy: 'Hiérarchie Horizontale',
    circle: 'Cercle',
    horizontalOrdering: 'Arrangement Horizontale'
  },
  selectPopUp: {
    selectItem: 'Sélectionner Item'
  },
  behaviours: {
    category: {
      miscellaneous: 'Divers',
      wall: 'Mur'
    },
    walldoor: {
      name: 'Porte',
      fields: {
        width: 'Largeur',
        top: 'Sommet'
      }
    },
    wallwindow: {
      name: 'Fenêtre',
      fields: {
        width: 'Largeur',
        top: 'Sommet',
        bottom: 'Bas'
      }
    }
  },
  routingAnalysis: {
    title: 'Analyse de Gamme',
    description:
      'Analyse de gamme utilisant des opérations algorithmique de gestion de graphe',
    saveRoutingGraph: 'Sauvegarder la Gamme',
    showHideFeedbacklink: 'Affcher/Masquer Retour Arrière',
    showHideTransitiveLink: 'Affcher/Masquer Liens Transitifs',
    levelLayout: 'Disposition par Niveau',
    clusteringPartMachine: 'Classification Article/Poste',
    clusteringMachineMachine: 'Classification Poste/Poste',
    showMatrix: 'Afficher Matrice',
    defaultRoutingGraphName: 'gamme sans nom',
    importFileType: 'Type de fichier à importer',
    exportFileType: 'Type de fichier à exporter',
    routingFile: 'Fichier de Gamme',
    partMachineMatrix: 'Matrice Article/Poste',
    machineMachineMatrix: 'Matrice Poste/Poste',
    machineOrderMatrix: "Order Matrice d'ordre sur les postes",
    clustering: 'Classification',
    alpha: 'Alpha',
    interclassRatio: 'Taux Interclasse (%)',
    nbClass: 'Nombre de classes',
    matrixType: 'Type de Matrice'
  },
  gestureAnalysis: {
    gestureAnalysis: 'Analyse des gestes',
    openClassicBVH: 'Ouvrir BVH classique',
    openBlenderBVH: 'Ouvrir BVH blender',
    toggleAvatar: "Afficher l'avatar",
    inputSkeleton: "Squelette d'entree",
    outputSkeleton: 'Squelette de sortie',
    addAsset: 'Ajouter un actif',
    toggleTransform: 'Afficher la transformation',
    resetTransform: 'Réinitialiser la transformation',
    toggleRULAMArkers: 'Afficher les marqueurs RULA',
    toggleAngleInspector: "Afficher l'inspecteur d'angle",
    getCSVData: 'Obtenir des donnees CSV',
    getXLSMAnalyser: 'Obtenir un analyseur XLSM',
    time: 'TEMPS',
    menuLabels: 'Étiquettes de menu'
  },
  assetLibrary: {
    assetLibrary: "Bibliothèque d'objets",
    listOfAllAssets: 'Liste de tous les objets',
    resetFilter: 'Réinitialiser le filtre',
    displayTags: 'Afficher les balises',
    categories: 'Catégories',
    loadAnAsset: 'Charger un object',
    deleteModeAsset: 'Supprimer un objet',
    assetData: "Données d'objet",
    name: 'Nom',
    tags: 'Tags',
    cancel: 'Annuler',
    save: 'Sauvegarder',
    newTitle: 'Nouveau titre',
    newTags: 'Nouveaux tags',
    uploadNew: 'Télécharger un nouveau',
    uCantUse:
      "Vous ne pouvez pas utiliser le gestionnaire d'actifs en multijoueur"
  },
  dynamicsObject: {
    dynamicsObjects: 'Objets dynamiques',
    oPCUA: 'OPC UA',
    startProfil: 'Démarrer le profil',
    startGlobalProfil: 'Démarrer le profil global',
    selectedPathAsset: "Chemin d'actif sélectionné",
    globalPath: 'Chemin global',
    loadAProfilFile: 'Charger un fichier de profil',
    editTheCurrentProfil: 'Modifier le profil actuel',
    deleteProfil: 'Supprimer le profil',
    addAnEvent: 'Ajouter un evenement',
    attachAnObject: 'Attacher un objet',
    listenIdOfServer: "Écouter l'ID du serveur",
    assignAProfilToScene: 'Assigner un profil à la scène',
    selectedProfil: 'Profil sélectionné',
    selectedScene: 'Scène sélectionnée',
    title: 'Titre',
    saveProfil: 'Enregistrer le profil',
    position: 'Position',
    rotation: 'Rotation',
    objetDynamicSelected: 'Objet dynamique sélectionné'
  },
  scenes: {
    scenes: 'Scenes',
    sceneManagement: 'Gestion de la scene',
    yourScenes: 'Vos scènes',
    assetsNumber: "Nombre d'objets",
    owner: 'Propriétaire',
    openInLayout: 'Ouvrir dans la mise en page',
    openInVirtualTwin: 'Ouvrir dans le jumeau virtuel',
    createNewEmptyScene: 'Créer une nouvelle scène vide',
    loadScene: 'Charger la scène',
    addObjectInScene: 'Ajouter un objet dans la scène',
    saveCurrentScene: 'Enregistrer la scène actuelle',
    backToHome: "Retour à la page d'accueil",
    targetScene: 'Scène cible',
    glisserJson: 'Glisser un fichier JSON',
    modifyData: 'Modifier les données',
    doCopyOfScene: 'Faire une copie de la scène',
    profil: 'Profil'
  },
  rooms: {
    collaborativesSessions: 'Sessions collaboratives',
    forVirtualMeetings: 'Pour les réunions virtuelles',
    currentSession: 'Session actuelle',
    leaveSession: 'Quitter la session',
    createNewSession: 'Créer une nouvelle session',
    selectedScene: 'Scène sélectionnée',
    deleteSession: 'Supprimer la session',
    roomToDelete: 'Salle à supprimer',
    tokenRoom: 'Jeton de la salle',
    close: 'Fermer',
    joinRoomWithToken: 'Rejoindre la salle avec le jeton',
    join: 'Rejoindre',
    scene: 'Scène'
  },
  mainMenu: {
    groups: 'Groupes',
    files: 'Fichiers',
    dynamicsObjects: 'Objets dynamiques',
    scenes: 'Scenes',
    assetsLibrary: "Bibliothèque d'objets",
    gestureAnalysis: 'Analyse des gestes',
    collaborativeSessions: 'Sessions collaboratives',
    aboutContradiction: 'À propos de Contradiction',
    expertApproach: 'Approche experte',
    simulationApproach: 'Approche de simulation',
    aboutRoutingAnalysis: "À propos de l'analyse de routage",
    routingAnalysis: 'Analyse de routage',
    blueprintEditor: 'Éditeur de plan',
    input: 'Entrée',
    output: 'Sortie',
    aboutErgonomIO: "À propos d'ErgonomIO",
    virtualTwin: 'Jumeau virtuel',
    assetEditor: "Éditeur d'actifs",
    avatars: 'Avatars',
    database: 'Base de données',
    API: 'API',
    help: 'Aide',
    codeStructure: 'Structure du code',
    ergonomioLogin: 'Connexion ErgonomIO',
    ergonomioMainMenu: 'Menu principal ErgonomIO',
    home: 'Accueil',

    // Subnames
    groupManagement: 'Gestion des groupes',
    akaDrawingShop: 'Alias Drawing Shop',
    shareDynamicsFiles: 'Partager les flux',
    DynamicsAnalysis: 'Analyse des flux',
    VirtualRealityTool: 'Outil de réalité virtuelle',
    ToolForErgonomicAnalysis: "Outil d'analyse ergonomique",
    SceneManagement: 'Gestion des scènes',
    ListOfAllAssets: 'Liste de tous les actifs',
    UploadEditAssets: 'Chargement et modification des actifs',
    ForVirtualMeetings: 'Réunions virtuelles',
    OPCUA: 'OPC UA',
    ManageYourAvatars: 'Avatars',
    ProfilesManager: 'Profils',
    ShowDatabaseStructure: 'Base de données',
    InterfaceDocumentation: 'Documentation',
    ApplicationsGuide: 'Guide',
    OfVueProject: 'Projet de vue',
    ErgonomicsLogin: "Connexion à l'ergonomie",
    ErgonomicsAndFlowAnalysis: 'Ergonomie et analyse des flux'
  }
}
