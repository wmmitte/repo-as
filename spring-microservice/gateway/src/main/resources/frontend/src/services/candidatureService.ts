/**
 * Service pour la gestion des candidatures
 */

import {
  Candidature,
  CreerCandidatureRequest,
  RepondreCandidatureRequest,
  PageResponse
} from '../types/projet.types';
import { fetchWithAuthHandler } from '../utils/authErrorHandler';

class CandidatureService {
  private readonly BASE_URL = '/api/candidatures';

  /**
   * Créer une candidature sur un projet ou une tâche
   */
  async creerCandidature(request: CreerCandidatureRequest): Promise<Candidature> {
    const response = await fetchWithAuthHandler(this.BASE_URL, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la création de la candidature: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Obtenir une candidature par son ID
   */
  async obtenirCandidature(candidatureId: number): Promise<Candidature> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/${candidatureId}`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération de la candidature: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Lister mes candidatures (en tant qu'expert)
   */
  async listerMesCandidatures(): Promise<Candidature[]> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/mes-candidatures`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération de mes candidatures: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Lister mes candidatures avec pagination
   */
  async listerMesCandidaturesPaginees(page: number = 0, size: number = 10): Promise<PageResponse<Candidature>> {
    const response = await fetchWithAuthHandler(
      `${this.BASE_URL}/mes-candidatures/page?page=${page}&size=${size}`,
      {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération de mes candidatures: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Lister les candidatures sur un projet (pour le propriétaire)
   */
  async listerCandidaturesProjet(projetId: number): Promise<Candidature[]> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/projet/${projetId}`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des candidatures: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Lister les candidatures sur une tâche (pour le propriétaire)
   */
  async listerCandidaturesTache(tacheId: number): Promise<Candidature[]> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/tache/${tacheId}`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des candidatures: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Lister les candidatures en attente (pour le propriétaire)
   */
  async listerCandidaturesEnAttente(): Promise<Candidature[]> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/en-attente`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des candidatures en attente: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Compter les candidatures en attente
   */
  async compterCandidaturesEnAttente(): Promise<number> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/en-attente/count`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors du comptage des candidatures: ${response.status}`);
    }

    const data = await response.json();
    return data.count;
  }

  /**
   * Répondre à une candidature (accepter, refuser, mettre en discussion)
   */
  async repondreCandidature(candidatureId: number, request: RepondreCandidatureRequest): Promise<Candidature> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/${candidatureId}/repondre`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la réponse à la candidature: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Retirer une candidature (par l'expert)
   */
  async retirerCandidature(candidatureId: number): Promise<void> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/${candidatureId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Erreur lors du retrait de la candidature: ${response.status}`);
    }
  }
}

export const candidatureService = new CandidatureService();
