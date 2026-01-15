/**
 * Types pour les référentiels de domaines et évaluations
 */

export interface DomaineCompetenceDTO {
  id: number;
  code: string;
  libelle: string;
  description?: string;
  ordreAffichage?: number;
  estActif: boolean;
}

export interface DomaineMetierDTO {
  id: number;
  code: string;
  libelle: string;
  description?: string;
  icone?: string;
  couleur?: string;
  ordreAffichage?: number;
  estActif: boolean;
}

export interface SousDomaineMetierDTO {
  id: number;
  domaineMetierId: number;
  code: string;
  libelle: string;
  description?: string;
  ordreAffichage?: number;
  estActif: boolean;
}

export interface CritereEvaluationDTO {
  id: number;
  domaineId: number;
  code: string;
  libelle: string;
  description?: string;
  estActif: boolean;
  methodeIds?: number[];
}

export interface MethodeEvaluationDTO {
  id: number;
  code: string;
  libelle: string;
  description?: string;
  typeMethode: string;
  estActif: boolean;
}
