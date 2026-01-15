/**
 * Service pour la gestion de l'expertise
 */

import { Expertise, ExpertiseComplet, Competence } from '../types/expertise.types';
import { fetchWithAuthHandler } from '../utils/authErrorHandler';

class ExpertiseService {
  private readonly BASE_URL = '/api/expertise';

  /**
   * Récupère l'expertise complète (profil + compétences)
   */
  async getExpertiseComplete(): Promise<ExpertiseComplet> {
    const response = await fetchWithAuthHandler(this.BASE_URL, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération de l'expertise: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Récupère uniquement le profil d'expertise (sans les compétences)
   */
  async getMonExpertise(): Promise<Expertise> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/mon-expertise`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération de l'expertise: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Crée ou met à jour l'expertise
   */
  async saveExpertise(expertise: Expertise): Promise<Expertise> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/mon-expertise`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(expertise),
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la sauvegarde de l'expertise: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Publie l'expertise (la rend visible sur l'accueil)
   */
  async publierExpertise(): Promise<Expertise> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/mon-expertise/publier`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la publication de l'expertise: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Dépublie l'expertise (la retire de l'accueil)
   */
  async depublierExpertise(): Promise<Expertise> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/mon-expertise/depublier`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la dépublication de l'expertise: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Récupère toutes les expertises publiées (pour l'accueil)
   */
  async getExpertisesPubliees(): Promise<Expertise[]> {
    const response = await fetch(`${this.BASE_URL}/public/expertises`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des expertises: ${response.status}`);
    }

    return await response.json();
  }

  // ==================== GESTION DES COMPÉTENCES ====================

  /**
   * Récupère toutes les compétences de l'utilisateur connecté
   */
  async getCompetences(): Promise<Competence[]> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/competences`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des compétences: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Ajoute une nouvelle compétence
   */
  async addCompetence(competence: Competence): Promise<Competence> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/competences`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(competence),
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de l'ajout de la compétence: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Met à jour une compétence existante
   */
  async updateCompetence(id: number, competence: Competence): Promise<Competence> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/competences/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(competence),
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la mise à jour de la compétence: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Supprime une compétence
   */
  async deleteCompetence(id: number): Promise<void> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/competences/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la suppression de la compétence: ${response.status}`);
    }
  }

  /**
   * Récupère les informations détaillées d'une compétence d'un utilisateur spécifique
   */
  async getCompetenceUtilisateur(utilisateurId: string, competenceId: number): Promise<Competence> {
    const response = await fetchWithAuthHandler(
      `${this.BASE_URL}/utilisateur/${utilisateurId}/competence/${competenceId}`,
      {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération de la compétence: ${response.status}`);
    }

    return await response.json();
  }
}

export const expertiseService = new ExpertiseService();
