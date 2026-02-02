// Types pour le système de gestion de projets

// ==================== ENUMS ====================

export type StatutProjet = 'BROUILLON' | 'PUBLIE' | 'EN_COURS' | 'EN_PAUSE' | 'TERMINE' | 'ANNULE';
export type VisibiliteProjet = 'PRIVE' | 'PUBLIC';
export type StatutTache = 'A_FAIRE' | 'EN_COURS' | 'EN_REVUE' | 'TERMINEE' | 'BLOQUEE' | 'ANNULEE';
export type VisibiliteTache = 'HERITEE' | 'PRIVE' | 'PUBLIC';
export type PrioriteTache = 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE';
export type StatutLivrable = 'A_FOURNIR' | 'SOUMIS' | 'EN_REVUE' | 'ACCEPTE' | 'REFUSE' | 'A_REVISER';
export type StatutCandidature = 'EN_ATTENTE' | 'EN_DISCUSSION' | 'ACCEPTEE' | 'REFUSEE' | 'RETIREE';

// ==================== DTOs ====================

export interface ExigenceProjet {
  id: number;
  projetId: number;
  description: string;
  categorie?: string;
  priorite?: string;
  ordre: number;
}

export interface CritereAcceptation {
  id: number;
  livrableId: number;
  description: string;
  ordre: number;
  estValide: boolean;
  commentaire?: string;
  dateValidation?: string;
}

export interface CompetenceRequise {
  id: number;
  tacheId: number;
  competenceReferenceId: number;
  competenceCode: string;
  competenceLibelle: string;
  niveauRequis: number;
  estObligatoire: boolean;
}

export interface Livrable {
  id: number;
  tacheId: number;
  tacheNom?: string;
  nom: string;
  description?: string;
  statut: StatutLivrable;
  fichierUrl?: string;
  fichierNom?: string;
  fichierTaille?: number;
  fichierType?: string;
  dateSoumission?: string;
  commentaireSoumission?: string;
  valideParId?: string;
  dateValidation?: string;
  commentaireValidation?: string;
  dateCreation: string;
  dateModification?: string;
  criteres: CritereAcceptation[];
}

export interface CommentaireTache {
  id: number;
  tacheId: number;
  parentId?: number;
  auteurId: string;
  contenu: string;
  dateCreation: string;
  dateModification?: string;
  reponses: CommentaireTache[];
}

export interface Tache {
  id: number;
  projetId: number;
  projetNom?: string;
  etapeId?: number;
  etapeNom?: string;
  nom: string;
  description?: string;
  ordre: number;
  budget: number;
  delaiJours?: number;
  statut: StatutTache;
  visibilite: VisibiliteTache;
  priorite: PrioriteTache;
  progression: number;
  expertAssigneId?: string;
  expertNom?: string;
  expertPrenom?: string;
  expertPhotoUrl?: string;
  dateAssignation?: string;
  dateDebutPrevue?: string;
  dateFinPrevue?: string;
  dateDebutEffective?: string;
  dateFinEffective?: string;
  dateCreation: string;
  dateModification?: string;
  livrables: Livrable[];
  competencesRequises: CompetenceRequise[];
  nombreLivrables: number;
  nombreLivrablesValides: number;
  nombreCandidatures: number;
  estIndependante: boolean;
  estDisponible: boolean;
}

export interface Etape {
  id: number;
  projetId: number;
  nom: string;
  description?: string;
  ordre: number;
  dateDebutPrevue?: string;
  dateFinPrevue?: string;
  dateDebutEffective?: string;
  dateFinEffective?: string;
  progression: number;
  dateCreation: string;
  dateModification?: string;
  taches: Tache[];
}

export interface Projet {
  id: number;
  proprietaireId: string;
  nom: string;
  description?: string;
  budget: number;
  devise: string;
  statut: StatutProjet;
  visibilite: VisibiliteProjet;
  dateCreation: string;
  dateModification?: string;
  dateDebutPrevue?: string;
  dateFinPrevue?: string;
  dateDebutEffective?: string;
  dateFinEffective?: string;
  progression: number;
  nombreVues: number;
  etapes: Etape[];
  tachesIndependantes: Tache[];
  exigences: ExigenceProjet[];
  nombreTaches: number;
  nombreCandidatures: number;
}

export interface ProjetResume {
  id: number;
  proprietaireId: string;
  nom: string;
  description?: string;
  budget: number;
  devise: string;
  statut: StatutProjet;
  visibilite: VisibiliteProjet;
  dateDebutPrevue?: string;
  dateFinPrevue?: string;
  progression: number;
  nombreVues: number;
  dateCreation: string;
  nombreTaches: number;
  nombreTachesDisponibles: number;
  nombreCandidatures: number;
  nombreEtapes: number;
  nombreLivrables: number;
}

export interface Candidature {
  id: number;
  projetId: number;
  projetNom?: string;
  tacheId?: number;
  tacheNom?: string;
  expertId: string;
  expertNom?: string;
  expertPrenom?: string;
  expertPhotoUrl?: string;
  expertTitre?: string;
  message?: string;
  tarifPropose?: number;
  delaiProposeJours?: number;
  statut: StatutCandidature;
  reponseClient?: string;
  dateReponse?: string;
  dateCreation: string;
  dateModification?: string;
  estSurTache: boolean;
}

// ==================== Request DTOs ====================

export interface CreerProjetRequest {
  nom: string;
  description?: string;
  budget?: number;
  devise?: string;
  visibilite?: VisibiliteProjet;
  dateDebutPrevue?: string;
  dateFinPrevue?: string;
  exigences?: string[];
}

export interface ModifierProjetRequest {
  nom?: string;
  description?: string;
  budget?: number;
  devise?: string;
  visibilite?: VisibiliteProjet;
  dateDebutPrevue?: string;
  dateFinPrevue?: string;
}

export interface CreerEtapeRequest {
  projetId: number;
  nom: string;
  description?: string;
  ordre?: number;
  dateDebutPrevue?: string;
  dateFinPrevue?: string;
}

export interface CompetenceRequiseRequest {
  competenceReferenceId: number;
  niveauRequis?: number;
  estObligatoire?: boolean;
}

export interface LivrableRequest {
  nom: string;
  description?: string;
  criteresAcceptation?: string[];
}

export interface CreerTacheRequest {
  projetId: number;
  etapeId?: number;
  nom: string;
  description?: string;
  ordre?: number;
  budget?: number;
  delaiJours?: number;
  visibilite?: VisibiliteTache;
  priorite?: PrioriteTache;
  dateDebutPrevue?: string;
  dateFinPrevue?: string;
  competencesRequises?: CompetenceRequiseRequest[];
  livrables?: LivrableRequest[];
}

export interface ModifierTacheRequest {
  nom?: string;
  description?: string;
  ordre?: number;
  budget?: number;
  delaiJours?: number;
  visibilite?: VisibiliteTache;
  priorite?: PrioriteTache;
  progression?: number;
  dateDebutPrevue?: string;
  dateFinPrevue?: string;
}

export interface CreerCandidatureRequest {
  projetId: number;
  tacheId?: number;
  message?: string;
  tarifPropose?: number;
  delaiProposeJours?: number;
}

export interface RepondreCandidatureRequest {
  action: 'ACCEPTER' | 'REFUSER' | 'EN_DISCUSSION';
  reponse?: string;
}

export interface SoumettreLivrableRequest {
  fichierUrl?: string;
  fichierNom?: string;
  fichierTaille?: number;
  fichierType?: string;
  commentaire?: string;
}

export interface ValiderLivrableRequest {
  accepte: boolean;
  commentaire?: string;
  criteresValidation?: { critereId: number; estSatisfait: boolean }[];
}

export interface CreerCommentaireRequest {
  tacheId: number;
  parentId?: number;
  contenu: string;
}

// ==================== Pagination ====================

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
