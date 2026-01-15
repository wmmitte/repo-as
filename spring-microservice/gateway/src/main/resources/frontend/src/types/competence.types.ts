// Types pour la gestion des compétences et propositions de projets

export interface CompetencePredefinie {
  id: string;
  nom: string;
  description: string;
  categorie: string; // Ex: "Développement", "Design", "Marketing"
  icone?: string;
}

export interface CompetenceUtilisateur {
  id: string;
  competenceId: string;
  nom: string;
  description: string;
  nombreDemandes: number; // Nombre de propositions/projets liés à cette compétence
  dateAjout: string;
}

export interface PropositionProjet {
  id: string;
  competenceId: string;
  nomProjet: string;
  descriptionProjet: string;
  nomClient: string;
  emailClient: string;
  avatarClient?: string;
  entrepriseClient?: string;
  budget?: number;
  devise?: string;
  dureeEstimee?: string; // Ex: "2 semaines", "1 mois"
  dateProposition: string;
  statut: 'en_attente' | 'accepte' | 'refuse';
  priorite?: 'basse' | 'normale' | 'haute';
  type: 'projet' | 'tache'; // Distinguer projets complets et tâches simples
}

export interface DecisionProposition {
  propositionId: string;
  decision: 'accepte' | 'refuse';
  message?: string; // Message optionnel pour le client
  dateDecision: string;
}

// Liste des compétences prédéfinies
export const COMPETENCES_PREDEFINIES: CompetencePredefinie[] = [
  // Développement Web
  {
    id: 'comp_react',
    nom: 'React',
    description: 'Bibliothèque JavaScript pour créer des interfaces utilisateur interactives',
    categorie: 'Développement Web',
    icone: '⚛️'
  },
  {
    id: 'comp_vue',
    nom: 'Vue.js',
    description: 'Framework JavaScript progressif pour construire des interfaces web modernes',
    categorie: 'Développement Web',
    icone: '🟢'
  },
  {
    id: 'comp_angular',
    nom: 'Angular',
    description: 'Framework TypeScript complet pour applications web d\'entreprise',
    categorie: 'Développement Web',
    icone: '🅰️'
  },
  {
    id: 'comp_nodejs',
    nom: 'Node.js',
    description: 'Environnement d\'exécution JavaScript côté serveur',
    categorie: 'Développement Backend',
    icone: '🟩'
  },
  {
    id: 'comp_express',
    nom: 'Express.js',
    description: 'Framework web minimaliste et flexible pour Node.js',
    categorie: 'Développement Backend',
    icone: '🚂'
  },
  {
    id: 'comp_typescript',
    nom: 'TypeScript',
    description: 'Superset typé de JavaScript qui compile en JavaScript pur',
    categorie: 'Développement Web',
    icone: '📘'
  },
  {
    id: 'comp_javascript',
    nom: 'JavaScript',
    description: 'Langage de programmation pour le web dynamique et interactif',
    categorie: 'Développement Web',
    icone: '📜'
  },
  {
    id: 'comp_html_css',
    nom: 'HTML/CSS',
    description: 'Langages de balisage et de style pour structurer et designer le web',
    categorie: 'Développement Web',
    icone: '🎨'
  },
  {
    id: 'comp_tailwind',
    nom: 'Tailwind CSS',
    description: 'Framework CSS utilitaire pour créer rapidement des designs personnalisés',
    categorie: 'Développement Web',
    icone: '🎨'
  },

  // Développement Backend
  {
    id: 'comp_python',
    nom: 'Python',
    description: 'Langage polyvalent pour développement web, data science et automatisation',
    categorie: 'Développement Backend',
    icone: '🐍'
  },
  {
    id: 'comp_django',
    nom: 'Django',
    description: 'Framework Python de haut niveau pour développement web rapide',
    categorie: 'Développement Backend',
    icone: '🎸'
  },
  {
    id: 'comp_flask',
    nom: 'Flask',
    description: 'Micro-framework Python léger et flexible pour applications web',
    categorie: 'Développement Backend',
    icone: '🧪'
  },
  {
    id: 'comp_php',
    nom: 'PHP',
    description: 'Langage de script côté serveur pour développement web dynamique',
    categorie: 'Développement Backend',
    icone: '🐘'
  },
  {
    id: 'comp_laravel',
    nom: 'Laravel',
    description: 'Framework PHP élégant pour applications web avec syntaxe expressive',
    categorie: 'Développement Backend',
    icone: '🔺'
  },
  {
    id: 'comp_java',
    nom: 'Java',
    description: 'Langage orienté objet robuste pour applications d\'entreprise',
    categorie: 'Développement Backend',
    icone: '☕'
  },
  {
    id: 'comp_spring',
    nom: 'Spring Boot',
    description: 'Framework Java pour créer des applications robustes et scalables',
    categorie: 'Développement Backend',
    icone: '🌱'
  },

  // Développement Mobile
  {
    id: 'comp_react_native',
    nom: 'React Native',
    description: 'Framework pour créer des apps mobiles natives avec React',
    categorie: 'Développement Mobile',
    icone: '📱'
  },
  {
    id: 'comp_flutter',
    nom: 'Flutter',
    description: 'Framework Google pour créer des apps multi-plateformes',
    categorie: 'Développement Mobile',
    icone: '🦋'
  },
  {
    id: 'comp_swift',
    nom: 'Swift',
    description: 'Langage Apple pour développement iOS et macOS natif',
    categorie: 'Développement Mobile',
    icone: '🍎'
  },
  {
    id: 'comp_kotlin',
    nom: 'Kotlin',
    description: 'Langage moderne pour développement Android natif',
    categorie: 'Développement Mobile',
    icone: '🤖'
  },

  // Bases de données
  {
    id: 'comp_mysql',
    nom: 'MySQL',
    description: 'Système de gestion de base de données relationnelle open-source',
    categorie: 'Base de données',
    icone: '🐬'
  },
  {
    id: 'comp_postgresql',
    nom: 'PostgreSQL',
    description: 'Base de données relationnelle avancée et conforme aux standards',
    categorie: 'Base de données',
    icone: '🐘'
  },
  {
    id: 'comp_mongodb',
    nom: 'MongoDB',
    description: 'Base de données NoSQL orientée documents flexible et scalable',
    categorie: 'Base de données',
    icone: '🍃'
  },
  {
    id: 'comp_redis',
    nom: 'Redis',
    description: 'Stockage de données en mémoire pour cache et messages',
    categorie: 'Base de données',
    icone: '🔴'
  },

  // Design
  {
    id: 'comp_figma',
    nom: 'Figma',
    description: 'Outil de design collaboratif pour interfaces et prototypes',
    categorie: 'Design',
    icone: '🎨'
  },
  {
    id: 'comp_adobe_xd',
    nom: 'Adobe XD',
    description: 'Solution Adobe pour design et prototypage d\'expériences',
    categorie: 'Design',
    icone: '🎨'
  },
  {
    id: 'comp_photoshop',
    nom: 'Photoshop',
    description: 'Logiciel de retouche et création d\'images professionnelles',
    categorie: 'Design',
    icone: '🖼️'
  },
  {
    id: 'comp_illustrator',
    nom: 'Illustrator',
    description: 'Création de graphiques vectoriels et illustrations',
    categorie: 'Design',
    icone: '✏️'
  },
  {
    id: 'comp_ui_ux',
    nom: 'UI/UX Design',
    description: 'Conception d\'interfaces et d\'expériences utilisateur optimales',
    categorie: 'Design',
    icone: '🎯'
  },

  // DevOps & Cloud
  {
    id: 'comp_docker',
    nom: 'Docker',
    description: 'Plateforme de conteneurisation pour déploiement d\'applications',
    categorie: 'DevOps',
    icone: '🐳'
  },
  {
    id: 'comp_kubernetes',
    nom: 'Kubernetes',
    description: 'Orchestration de conteneurs pour applications cloud-native',
    categorie: 'DevOps',
    icone: '☸️'
  },
  {
    id: 'comp_aws',
    nom: 'AWS',
    description: 'Services cloud Amazon pour infrastructure et déploiement',
    categorie: 'Cloud',
    icone: '☁️'
  },
  {
    id: 'comp_azure',
    nom: 'Microsoft Azure',
    description: 'Plateforme cloud Microsoft pour applications d\'entreprise',
    categorie: 'Cloud',
    icone: '☁️'
  },
  {
    id: 'comp_gcp',
    nom: 'Google Cloud',
    description: 'Infrastructure cloud Google pour applications scalables',
    categorie: 'Cloud',
    icone: '☁️'
  },
  {
    id: 'comp_git',
    nom: 'Git',
    description: 'Système de contrôle de version distribué pour code source',
    categorie: 'DevOps',
    icone: '📦'
  },

  // Data & IA
  {
    id: 'comp_machine_learning',
    nom: 'Machine Learning',
    description: 'Algorithmes d\'apprentissage automatique et modèles prédictifs',
    categorie: 'Data Science',
    icone: '🤖'
  },
  {
    id: 'comp_tensorflow',
    nom: 'TensorFlow',
    description: 'Framework open-source pour machine learning et deep learning',
    categorie: 'Data Science',
    icone: '🧠'
  },
  {
    id: 'comp_data_analysis',
    nom: 'Analyse de données',
    description: 'Exploration et visualisation de données pour insights business',
    categorie: 'Data Science',
    icone: '📊'
  },

  // Marketing & Communication
  {
    id: 'comp_seo',
    nom: 'SEO',
    description: 'Optimisation pour moteurs de recherche et visibilité web',
    categorie: 'Marketing Digital',
    icone: '🔍'
  },
  {
    id: 'comp_google_ads',
    nom: 'Google Ads',
    description: 'Publicité en ligne sur Google et réseau display',
    categorie: 'Marketing Digital',
    icone: '📢'
  },
  {
    id: 'comp_social_media',
    nom: 'Social Media Marketing',
    description: 'Stratégies marketing sur réseaux sociaux',
    categorie: 'Marketing Digital',
    icone: '📱'
  },
  {
    id: 'comp_content_writing',
    nom: 'Rédaction de contenu',
    description: 'Création de textes engageants pour web et marketing',
    categorie: 'Communication',
    icone: '✍️'
  },

  // Autres
  {
    id: 'comp_gestion_projet',
    nom: 'Gestion de projet',
    description: 'Planification et coordination de projets complexes',
    categorie: 'Management',
    icone: '📋'
  },
  {
    id: 'comp_agile_scrum',
    nom: 'Agile/Scrum',
    description: 'Méthodologies agiles pour développement itératif',
    categorie: 'Management',
    icone: '🔄'
  }
];
