export interface Competence {
  nom: string;
  favorite: boolean;
  anneesExperience?: number;
  thm?: number; // Taux Horaire Moyen en FCFA
  nombreProjets?: number;
  certifications?: string;
  niveauMaitrise?: number; // 1-5
}

export interface Expert {
  id: string;
  nom: string;
  prenom: string;
  titre: string;
  photoUrl: string;
  rating: number;
  nombreProjets: number;
  description: string;
  competences: Competence[];
  experienceAnnees: number;
  tjmMin: number;
  tjmMax: number;
  localisation: string;
  disponible: boolean;
}

export interface FeedResponse {
  pileContenu: Expert[];
  nextCursor: string;
  contexteDerniereMAJ: string;
}

export interface StartResponse {
  visiteurId: string;
  instanceKey: number;
}

export interface SessionData {
  visiteurId: string;
  instanceKey: number;
  ts: number;
}
