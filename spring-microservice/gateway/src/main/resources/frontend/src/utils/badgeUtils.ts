import { NiveauCertification } from '../services/badgeService';

/**
 * Retourne le niveau du badge avec sa signification entre parenthèses
 * Ex: BRONZE (Débutant), ARGENT (Intermédiaire), OR (Avancé), PLATINE (Expert)
 */
export const obtenirNiveauAvecSignification = (niveau: NiveauCertification): string => {
  const significations: Record<NiveauCertification, string> = {
    [NiveauCertification.BRONZE]: 'BRONZE (Débutant)',
    [NiveauCertification.ARGENT]: 'ARGENT (Intermédiaire)',
    [NiveauCertification.OR]: 'OR (Avancé)',
    [NiveauCertification.PLATINE]: 'PLATINE (Expert)'
  };
  return significations[niveau] || niveau;
};

/**
 * Mappe un code de domaine de compétence vers le niveau visé avec le badge entre parenthèses
 * Utilisé pour l'affichage du "Niveau visé" dans les demandes de reconnaissance
 * SAVOIR → Débutant (Bronze)
 * SAVOIR_FAIRE → Intermédiaire (Argent)
 * SAVOIR_ETRE → Avancé (Or)
 * SAVOIR_AGIR → Expert (Platine)
 */
export const obtenirNiveauViseDepuisDomaine = (codeDomaine: string): string => {
  const mapping: Record<string, string> = {
    'SAVOIR': 'Débutant (Bronze)',
    'SAVOIR_FAIRE': 'Intermédiaire (Argent)',
    'SAVOIR_ETRE': 'Avancé (Or)',
    'SAVOIR_AGIR': 'Expert (Platine)'
  };
  return mapping[codeDomaine] || 'Non spécifié';
};
