export interface InformationsPersonnelles {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  motDePasse: string;
  confirmMotDePasse: string;
}

export interface InformationsExpert {
  domaineExpertise: string;
  competences: string[];
  formation?: string;
  tarifHoraire: number;
  disponibilite: string;
  portfolio?: string;
  certifications: string[];
  langues: string[];
  bio: string;
  domainesInteret: string[]; // Domaines de projets d'intérêt
}

export interface InformationsClient {
  nomEntreprise: string;
  secteurActivite: string;
  tailleEntreprise: string;
  poste: string;
  adresse?: string;
  siteWeb?: string;
  description: string;
}

export interface Expert extends InformationsPersonnelles, InformationsExpert {
  id: string;
  type: 'expert';
  avatar?: string;
  isVerified: boolean;
  dateInscription: string;
  stats: {
    projetsRealises: number;
    clientsSatisfaits: number;
    tauxReussite: number;
    anciennete: number;
  };
  avis: AvisExpert[];
  portfolioItems: ProjetPortfolio[];
}

export interface Client extends InformationsPersonnelles, InformationsClient {
  id: string;
  type: 'client';
  avatar?: string;
  isVerified: boolean;
  dateInscription: string;
  projetsPublies: number;
  expertsEmbauches: number;
}

export type Utilisateur = Expert | Client;

// Type unifié pour les nouveaux utilisateurs (sans distinction Expert/Client à l'inscription)
export interface UtilisateurUnifie extends InformationsPersonnelles {
  id: string;
  avatar?: string;
  isVerified: boolean;
  dateInscription: string;

  // Informations professionnelles (optionnelles, à compléter dans Mon Compte)
  // Champs communs entre Expert et Client
  domaineExpertise?: string;
  secteurActivite?: string;
  competences?: string[];
  formation?: string;
  tarifHoraire?: number;
  disponibilite?: string;
  portfolio?: string;
  certifications?: string[];
  langues?: string[];
  bio?: string;
  domainesInteret?: string[];

  // Informations entreprise (optionnelles)
  nomEntreprise?: string;
  tailleEntreprise?: string;
  poste?: string;
  adresse?: string;
  siteWeb?: string;
  description?: string;

  // Statistiques
  stats?: {
    projetsRealises?: number;
    projetsPublies?: number;
    clientsSatisfaits?: number;
    expertsEmbauches?: number;
    tauxReussite?: number;
    anciennete?: number;
  };

  // Portfolio et avis
  avis?: AvisExpert[];
  portfolioItems?: ProjetPortfolio[];
}

export interface ProjetPortfolio {
  id: string;
  titre: string;
  description: string;
  technologies: string[];
  image?: string;
  budget: string;
  duree: string;
  statut: 'En cours' | 'Terminé' | 'En pause';
  clientNom?: string;
  dateDebut: string;
  dateFin?: string;
}

export interface AvisExpert {
  id: string;
  clientId: string;
  clientNom: string;
  entreprise: string;
  note: number; // 1-5
  commentaire: string;
  date: string;
  projet: string;
}

export interface FormulaireInscription {
  etapeActuelle: number;
  typeCompte: 'expert' | 'client' | '';
  informationsPersonnelles: Partial<InformationsPersonnelles>;
  informationsExpert: Partial<InformationsExpert>;
  informationsClient: Partial<InformationsClient>;
  errors: Record<string, string>;
  isLoading: boolean;
}

// Énumérations
export const DOMAINES_EXPERTISE = [
  { value: 'dev-web', label: 'Développement Web' },
  { value: 'dev-mobile', label: 'Développement Mobile' },
  { value: 'design', label: 'Design & UX/UI' },
  { value: 'marketing', label: 'Marketing Digital' },
  { value: 'redaction', label: 'Rédaction & Content' },
  { value: 'consulting', label: 'Conseil & Stratégie' },
  { value: 'finance', label: 'Finance & Comptabilité' },
  { value: 'juridique', label: 'Juridique' },
  { value: 'traduction', label: 'Traduction' },
  { value: 'data-science', label: 'Data Science & IA' },
  { value: 'cybersecurite', label: 'Cybersécurité' },
  { value: 'autre', label: 'Autre' }
] as const;

export const SECTEURS_ACTIVITE = [
  { value: 'technologie', label: 'Technologie' },
  { value: 'finance', label: 'Finance & Banque' },
  { value: 'sante', label: 'Santé' },
  { value: 'education', label: 'Éducation' },
  { value: 'commerce', label: 'Commerce & Retail' },
  { value: 'immobilier', label: 'Immobilier' },
  { value: 'industrie', label: 'Industrie & Manufacturing' },
  { value: 'services', label: 'Services' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'energie', label: 'Énergie' },
  { value: 'transport', label: 'Transport & Logistique' },
  { value: 'gouvernement', label: 'Gouvernement & Public' },
  { value: 'autre', label: 'Autre' }
] as const;

export const DISPONIBILITES = [
  { value: 'temps-plein', label: 'Temps plein' },
  { value: 'temps-partiel', label: 'Temps partiel' },
  { value: 'mission-courte', label: 'Missions courtes' },
  { value: 'ponctuel', label: 'Ponctuel' },
  { value: 'indisponible', label: 'Actuellement indisponible' }
] as const;

export const TAILLES_ENTREPRISE = [
  { value: 'startup', label: 'Startup (1-10 employés)' },
  { value: 'pme', label: 'PME (11-50 employés)' },
  { value: 'moyenne', label: 'Moyenne entreprise (51-200 employés)' },
  { value: 'grande', label: 'Grande entreprise (200+ employés)' }
] as const;

export const LANGUES_DISPONIBLES = [
  'Français (natif)',
  'Français (courant)',
  'Français (intermédiaire)',
  'Anglais (natif)',
  'Anglais (courant)',
  'Anglais (intermédiaire)',
  'Espagnol (natif)',
  'Espagnol (courant)',
  'Espagnol (intermédiaire)',
  'Arabe (natif)',
  'Arabe (courant)',
  'Arabe (intermédiaire)',
  'Allemand (courant)',
  'Allemand (intermédiaire)',
  'Chinois (courant)',
  'Chinois (intermédiaire)'
] as const;

// Interface pour les réponses API
export interface ReponseInscription {
  success: boolean;
  utilisateur: Utilisateur;
  token: string;
  message: string;
}

export interface ReponseConnexion {
  success: boolean;
  utilisateur: Utilisateur;
  token: string;
  message: string;
}