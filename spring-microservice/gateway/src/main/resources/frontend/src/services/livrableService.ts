/**
 * Service pour la gestion des livrables
 */

import {
  Livrable,
  SoumettreLivrableRequest,
  ValiderLivrableRequest
} from '../types/projet.types';
import { fetchWithAuthHandler } from '../utils/authErrorHandler';

class LivrableService {
  private readonly BASE_URL = '/api/livrables';

  /**
   * Obtenir un livrable par son ID
   */
  async obtenirLivrable(livrableId: number): Promise<Livrable> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/${livrableId}`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération du livrable: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Lister les livrables d'une tâche
   */
  async listerLivrablesTache(tacheId: number): Promise<Livrable[]> {
    const response = await fetch(`${this.BASE_URL}/tache/${tacheId}`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des livrables: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Lister les livrables en attente de validation pour un projet
   */
  async listerLivrablesEnAttenteValidation(projetId: number): Promise<Livrable[]> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/projet/${projetId}/en-attente`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des livrables en attente: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Soumettre un livrable (par l'expert)
   */
  async soumettreLivrable(livrableId: number, request: SoumettreLivrableRequest): Promise<Livrable> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/${livrableId}/soumettre`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la soumission du livrable: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Valider un livrable (par le propriétaire)
   */
  async validerLivrable(livrableId: number, request: ValiderLivrableRequest): Promise<Livrable> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/${livrableId}/valider`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la validation du livrable: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Demander une révision d'un livrable
   */
  async demanderRevision(livrableId: number, commentaire: string): Promise<Livrable> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/${livrableId}/revision`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ commentaire }),
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la demande de révision: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Compter les livrables par statut pour une tâche
   */
  async compterLivrables(tacheId: number, statut?: string): Promise<number> {
    const params = statut ? `?statut=${statut}` : '';
    const response = await fetch(`${this.BASE_URL}/tache/${tacheId}/count${params}`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors du comptage des livrables: ${response.status}`);
    }

    const data = await response.json();
    return data.count;
  }
}

export const livrableService = new LivrableService();
