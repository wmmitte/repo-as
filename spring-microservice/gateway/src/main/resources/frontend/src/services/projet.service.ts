/**
 * Service pour la gestion des projets
 */

import {
  Projet,
  ProjetResume,
  Etape,
  ExigenceProjet,
  CreerProjetRequest,
  ModifierProjetRequest,
  CreerEtapeRequest,
  PageResponse,
  Candidature
} from '../types/projet.types';
import { fetchWithAuthHandler } from '../utils/authErrorHandler';

class ProjetService {
  private readonly BASE_URL = '/api/projets';

  // ==================== PROJETS ====================

  /**
   * Créer un nouveau projet
   */
  async creerProjet(request: CreerProjetRequest): Promise<Projet> {
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
      throw new Error(`Erreur lors de la création du projet: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Modifier un projet existant
   */
  async modifierProjet(projetId: number, request: ModifierProjetRequest): Promise<Projet> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/${projetId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la modification du projet: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Obtenir un projet par son ID
   */
  async obtenirProjet(projetId: number): Promise<Projet> {
    const response = await fetch(`${this.BASE_URL}/${projetId}`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération du projet: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Lister mes projets (en tant que propriétaire)
   */
  async listerMesProjets(): Promise<ProjetResume[]> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/mes-projets`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des projets: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Publier un projet
   */
  async publierProjet(projetId: number): Promise<Projet> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/${projetId}/publier`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la publication du projet: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Dépublier un projet
   */
  async depublierProjet(projetId: number): Promise<Projet> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/${projetId}/depublier`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la dépublication du projet: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Changer le statut d'un projet
   */
  async changerStatut(projetId: number, statut: string): Promise<Projet> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/${projetId}/statut`, {
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
   * Supprimer un projet
   */
  async supprimerProjet(projetId: number): Promise<void> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/${projetId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la suppression du projet: ${response.status}`);
    }
  }

  // ==================== ÉTAPES ====================

  /**
   * Créer une étape
   */
  async creerEtape(request: CreerEtapeRequest): Promise<Etape> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/etapes`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la création de l'étape: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Supprimer une étape
   */
  async supprimerEtape(etapeId: number): Promise<void> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/etapes/${etapeId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la suppression de l'étape: ${response.status}`);
    }
  }

  // ==================== EXIGENCES ====================

  /**
   * Ajouter une exigence
   */
  async ajouterExigence(projetId: number, description: string): Promise<ExigenceProjet> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/${projetId}/exigences`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ description }),
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de l'ajout de l'exigence: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Supprimer une exigence
   */
  async supprimerExigence(exigenceId: number): Promise<void> {
    const response = await fetchWithAuthHandler(`${this.BASE_URL}/exigences/${exigenceId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la suppression de l'exigence: ${response.status}`);
    }
  }

  // ==================== ENDPOINTS PUBLICS ====================

  /**
   * Lister les projets publics
   */
  async listerProjetsPublics(page: number = 0, size: number = 10): Promise<PageResponse<ProjetResume>> {
    const response = await fetch(`${this.BASE_URL}/public?page=${page}&size=${size}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des projets publics: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Rechercher des projets publics
   */
  async rechercherProjetsPublics(recherche: string, page: number = 0, size: number = 10): Promise<PageResponse<ProjetResume>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    if (recherche) {
      params.set('q', recherche);
    }

    const response = await fetch(`${this.BASE_URL}/public/recherche?${params}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la recherche de projets: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Lister les projets avec des tâches disponibles
   */
  async listerProjetsAvecTachesDisponibles(page: number = 0, size: number = 10): Promise<PageResponse<ProjetResume>> {
    const response = await fetch(`${this.BASE_URL}/public/avec-taches-disponibles?page=${page}&size=${size}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des projets: ${response.status}`);
    }

    return await response.json();
  }

  // ==================== CANDIDATURES ====================

  /**
   * Lister mes candidatures (en tant qu'expert)
   */
  async listerMesCandidatures(): Promise<Candidature[]> {
    const response = await fetchWithAuthHandler('/api/candidatures/mes-candidatures', {
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
}

export const projetService = new ProjetService();
