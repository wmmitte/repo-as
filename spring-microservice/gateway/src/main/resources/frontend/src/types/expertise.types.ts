/**
 * Types pour la gestion de l'expertise
 */

export interface Expertise {
  id?: number;
  utilisateurId?: string;
  titre: string;
  description: string;
  photoUrl?: string;
  villeId?: number;
  localisationComplete?: string; // "Paris, France"
  disponible: boolean;
  publiee?: boolean;
  dateCreation?: string;
  dateModification?: string;
}

// Fonction utilitaire pour obtenir la localisation complète
export const getLocalisation = (expertise: Expertise): string => {
  return expertise.localisationComplete || '';
};

export interface ExpertiseComplet {
  expertise: Expertise;
  competences: Competence[];
}

export interface Competence {
  id?: number;
  utilisateurId?: string;
  nom: string;
  description?: string;
  niveauMaitrise?: number; // 1-5
  anneesExperience?: number;
  thm?: number; // Taux Horaire Moyen en FCFA
  nombreProjets?: number;
  certifications?: string; // Liste de certifications séparées par des virgules
  estFavorite?: boolean;
  nombreDemandes?: number;
  dateAjout?: string;
  dateModification?: string;
  competenceReferenceId?: number; // ID de la compétence de référence d'origine
}

// Valeurs par défaut pour une nouvelle expertise
export const defaultExpertise: Expertise = {
  titre: '',
  description: '',
  disponible: true,
};
