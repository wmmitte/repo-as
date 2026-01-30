/**
 * Service pour la gestion des tâches de projet
 */

import {
  Tache,
  Livrable,
  CommentaireTache,
  CreerTacheRequest,
  ModifierTacheRequest,
  CreerCommentaireRequest,
  PageResponse
} from '../types/projet.types';
import { fetchWithAuthHandler } from '../utils/authErrorHandler';

class TacheService {
  private readonly BASE_URL = '/api/taches';

  // ==================== TÂCHES ====================

  /**
   * Créer une nouvelle tâche
   */
  async creerTache(request: CreerTacheRequest): Promise<Tache> {
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
      throw new Error(`Erreur lors de la création de la tâche: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Modifier une tâche existante
   */
  async modifierTache(tacheId: number, request: ModifierTacheRequest): Promise<Tache> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/${tacheId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la modification de la tâche: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Obtenir une tâche par son ID
   */
  async obtenirTache(tacheId: number): Promise<Tache> {
    const response = await fetch(`${this.BASE_URL}/${tacheId}`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération de la tâche: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Lister les tâches d'un projet
   */
  async listerTachesProjet(projetId: number): Promise<Tache[]> {
    const response = await fetch(`${this.BASE_URL}/projet/${projetId}`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des tâches: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Lister mes tâches assignées
   */
  async listerMesTaches(): Promise<Tache[]> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/mes-taches`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération de mes tâches: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Changer le statut d'une tâche
   */
  async changerStatut(tacheId: number, statut: string): Promise<Tache> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/${tacheId}/statut`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ statut }),
    });

    if (!response.ok) {
      throw new Error(`Erreur lors du changement de statut: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Assigner un expert à une tâche
   */
  async assignerExpert(tacheId: number, expertId: string): Promise<Tache> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/${tacheId}/assigner`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ expertId }),
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de l'assignation de l'expert: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Désassigner un expert d'une tâche
   */
  async desassignerExpert(tacheId: number): Promise<Tache> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/${tacheId}/desassigner`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la désassignation: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Supprimer une tâche
   */
  async supprimerTache(tacheId: number): Promise<void> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/${tacheId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la suppression de la tâche: ${response.status}`);
    }
  }

  // ==================== LIVRABLES ====================

  /**
   * Ajouter un livrable à une tâche
   */
  async ajouterLivrable(tacheId: number, nom: string, description?: string): Promise<Livrable> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/${tacheId}/livrables`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ nom, description }),
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de l'ajout du livrable: ${response.status}`);
    }

    return await response.json();
  }

  // ==================== COMMENTAIRES ====================

  /**
   * Ajouter un commentaire à une tâche
   */
  async ajouterCommentaire(request: CreerCommentaireRequest): Promise<CommentaireTache> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/commentaires`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de l'ajout du commentaire: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Lister les commentaires d'une tâche
   */
  async listerCommentaires(tacheId: number): Promise<CommentaireTache[]> {
    const response = await fetch(`${this.BASE_URL}/${tacheId}/commentaires`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des commentaires: ${response.status}`);
    }

    return await response.json();
  }

  // ==================== ENDPOINTS PUBLICS ====================

  /**
   * Lister les tâches disponibles
   */
  async listerTachesDisponibles(page: number = 0, size: number = 10): Promise<PageResponse<Tache>> {
    const response = await fetch(`${this.BASE_URL}/disponibles?page=${page}&size=${size}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des tâches disponibles: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Lister les tâches disponibles par compétences
   */
  async listerTachesDisponiblesParCompetences(
    competenceIds: number[],
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<Tache>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    competenceIds.forEach(id => params.append('competenceIds', id.toString()));

    const response = await fetch(`${this.BASE_URL}/disponibles/par-competences?${params}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des tâches: ${response.status}`);
    }

    return await response.json();
  }
}

export const tacheService = new TacheService();
