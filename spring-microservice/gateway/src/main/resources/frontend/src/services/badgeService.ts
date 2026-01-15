/**
 * Niveau de certification d'un badge
 */
export enum NiveauCertification {
  BRONZE = 'BRONZE',
  ARGENT = 'ARGENT',
  OR = 'OR',
  PLATINE = 'PLATINE'
}

/**
 * Interface pour un badge de compétence
 */
export interface BadgeCompetence {
  id: number;
  competenceId: number;
  competenceNom: string;
  utilisateurId: string;
  demandeReconnaissanceId?: number;
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

/**
 * Interface pour les statistiques de badges
 */
export interface StatistiquesBadges {
  total: number;
  bronze: number;
  argent: number;
  or: number;
  platine: number;
}

const BASE_URL = '/api/badges';

/**
 * Service pour la gestion des badges de compétence
 */
export const badgeService = {
  /**
   * Récupérer mes badges
   */
  async getMesBadges(actifSeulement: boolean = true): Promise<BadgeCompetence[]> {
    const url = `${BASE_URL}/mes-badges?actifSeulement=${actifSeulement}`;
    const response = await fetch(url, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des badges');
    }

    return response.json();
  },

  /**
   * Récupérer les badges publics d'un utilisateur
   */
  async getBadgesPublics(utilisateurId: string): Promise<BadgeCompetence[]> {
    const response = await fetch(`${BASE_URL}/utilisateur/${utilisateurId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des badges publics');
    }

    return response.json();
  },

  /**
   * Récupérer un badge spécifique
   */
  async getBadge(badgeId: number): Promise<BadgeCompetence> {
    const response = await fetch(`${BASE_URL}/${badgeId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du badge');
    }

    return response.json();
  },

  /**
   * Basculer la visibilité publique d'un badge
   */
  async toggleVisibilite(badgeId: number): Promise<BadgeCompetence> {
    const response = await fetch(`${BASE_URL}/${badgeId}/toggle-visibilite`, {
      method: 'PUT',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erreur lors du changement de visibilité');
    }

    return response.json();
  },

  /**
   * Récupérer les statistiques de badges
   */
  async getStatistiques(): Promise<StatistiquesBadges> {
    const response = await fetch(`${BASE_URL}/statistiques`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des statistiques');
    }

    return response.json();
  },

  /**
   * Définir l'ordre d'affichage des badges
   */
  async definirOrdreAffichage(badgeIds: number[]): Promise<void> {
    const response = await fetch(`${BASE_URL}/ordre-affichage`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(badgeIds),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la définition de l\'ordre');
    }
  },

  /**
   * Obtenir le libellé du niveau de certification
   */
  getNiveauLibelle(niveau: NiveauCertification): string {
    const libelles: Record<NiveauCertification, string> = {
      [NiveauCertification.BRONZE]: 'Bronze - Niveau débutant',
      [NiveauCertification.ARGENT]: 'Argent - Niveau intermédiaire',
      [NiveauCertification.OR]: 'Or - Niveau avancé',
      [NiveauCertification.PLATINE]: 'Platine - Niveau expert'
    };
    return libelles[niveau] || niveau;
  },

  /**
   * Obtenir la couleur associée au niveau
   */
  getNiveauCouleur(niveau: NiveauCertification): string {
    const couleurs: Record<NiveauCertification, string> = {
      [NiveauCertification.BRONZE]: '#CD7F32',
      [NiveauCertification.ARGENT]: '#C0C0C0',
      [NiveauCertification.OR]: '#FFD700',
      [NiveauCertification.PLATINE]: '#E5E4E2'
    };
    return couleurs[niveau] || '#808080';
  },

  /**
   * Obtenir la classe CSS pour le badge selon son niveau
   */
  getNiveauClasse(niveau: NiveauCertification): string {
    const classes: Record<NiveauCertification, string> = {
      [NiveauCertification.BRONZE]: 'badge-bronze',
      [NiveauCertification.ARGENT]: 'badge-argent',
      [NiveauCertification.OR]: 'badge-or',
      [NiveauCertification.PLATINE]: 'badge-platine'
    };
    return classes[niveau] || '';
  }
};

export default badgeService;
