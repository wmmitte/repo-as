/**
 * Types pour le système de reconnaissance des compétences
 */

export enum StatutDemande {
  EN_ATTENTE = 'EN_ATTENTE',
  ASSIGNEE_RH = 'ASSIGNEE_RH',
  EN_COURS_EVALUATION = 'EN_COURS_EVALUATION',
  EN_ATTENTE_VALIDATION = 'EN_ATTENTE_VALIDATION',
  EN_COURS_TRAITEMENT = 'EN_COURS_TRAITEMENT', // Deprecated
  COMPLEMENT_REQUIS = 'COMPLEMENT_REQUIS',
  APPROUVEE = 'APPROUVEE',
  REJETEE = 'REJETEE',
  ANNULEE = 'ANNULEE',
}

export enum NiveauCertification {
  BRONZE = 'BRONZE',
  ARGENT = 'ARGENT',
  OR = 'OR',
  PLATINE = 'PLATINE',
}

export enum TypePiece {
  CERTIFICAT = 'CERTIFICAT',
  DIPLOME = 'DIPLOME',
  PROJET = 'PROJET',
  RECOMMANDATION = 'RECOMMANDATION',
  EXPERIENCE = 'EXPERIENCE',
  PUBLICATION = 'PUBLICATION',
  AUTRE = 'AUTRE',
}

export enum Recommandation {
  APPROUVER = 'APPROUVER',
  REJETER = 'REJETER',
  DEMANDER_COMPLEMENT = 'DEMANDER_COMPLEMENT',
  EN_COURS = 'EN_COURS',
}

export interface PieceJustificativeDTO {
  id: number;
  demandeId: number;
  typePiece: TypePiece;
  nom: string;
  nomOriginal: string;
  urlFichier: string;
  tailleOctets: number;
  typeMime: string;
  description?: string;
  dateAjout: string;
  estVerifie: boolean;
  dateVerification?: string;
}

export interface EvaluationCompetenceDTO {
  id: number;
  demandeId: number;
  traitantId: string;
  noteGlobale: number;
  criteres?: string;
  recommandation: Recommandation;
  commentaire?: string;
  dateEvaluation: string;
  tempsEvaluationMinutes?: number;
}

export interface BadgeCompetenceDTO {
  id: number;
  competenceId: number;
  competenceNom: string;
  utilisateurId: string;
  demandeReconnaissanceId: number;
  dateObtention: string;
  niveauCertification: NiveauCertification;
  validitePermanente: boolean;
  dateExpiration?: string;
  estActif: boolean;
  dateRevocation?: string;
  motifRevocation?: string;
  estPublic: boolean;
  ordreAffichage: number;
  estValide: boolean;
}

export interface DemandeReconnaissanceDTO {
  id: number;
  utilisateurId: string;
  competenceId: number;
  competenceReferenceId?: number;
  competenceNom: string;
  statut: StatutDemande;
  dateCreation: string;
  dateDerniereModification?: string;
  dateTraitement?: string;
  traitantId?: string;
  traitantNom?: string;
  managerId?: string;
  dateAssignation?: string;
  dateEvaluation?: string;
  commentaireExpert?: string;
  commentaireManagerAssignation?: string; // Instructions du Manager au RH (visible uniquement par le RH)
  commentaireRhEvaluation?: string; // Commentaire du RH lors de l'évaluation (visible par le Manager, pas par l'expert)
  commentaireTraitant?: string; // Commentaire final du Manager (visible par l'expert)
  niveauVise?: NiveauCertification;
  priorite: number;
  pieces?: PieceJustificativeDTO[];
  evaluation?: EvaluationCompetenceDTO;
  nombrePieces: number;
  badge?: BadgeCompetenceDTO;
}

export interface CreateDemandeReconnaissanceRequest {
  competenceId: number;
  commentaire?: string;
}

export interface EvaluationRequest {
  recommandation: Recommandation;
  commentaire?: string;
  tempsEvaluationMinutes?: number;
  criteres?: string;
  noteGlobale?: number;
}

export interface StatistiquesTraitementDTO {
  totalDemandes: number;
  demandesEnAttente: number;
  demandesEnCours: number;
  demandesApprouvees: number;
  demandesRejetees: number;
  demandesComplementRequis: number;
  demandesParStatut: Record<string, number>;
  demandesParTraitant?: Record<string, number>;
  tauxApprobation?: number;
  tempsTraitementMoyen?: number;
  noteMoyenne?: number;
  mesDemandesEnCours?: number;
  mesDemandesTraitees?: number;
}

export interface ApprobationRequest {
  commentaire?: string;
  validitePermanente: boolean;
  dateExpiration?: string; // ISO 8601 format
}

export interface UtilisateurRhDTO {
  userId: string;
  nom: string;
  email: string;
  nombreDemandesEnCours: number;
  nombreDemandesTraitees: number;
  tauxApprobation: number;
  noteMoyenne: number;
}

export interface AssignationRhRequest {
  rhId: string;
  commentaire?: string;
}
