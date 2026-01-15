import {
  DomaineCompetenceDTO,
  DomaineMetierDTO,
  SousDomaineMetierDTO,
  CritereEvaluationDTO,
  MethodeEvaluationDTO
} from '@/types/referentiel.types';

const API_BASE_URL = '/api/referentiels';

/**
 * Service pour gérer les référentiels de domaines et évaluations
 */
class ReferentielService {

  // ============= Domaines de Compétence =============

  async getDomainesCompetence(): Promise<DomaineCompetenceDTO[]> {
    const response = await fetch(`${API_BASE_URL}/domaines-competence`);
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des domaines de compétence');
    }
    return response.json();
  }

  // ============= Domaines Métier =============

  async getDomainesMetier(): Promise<DomaineMetierDTO[]> {
    const response = await fetch(`${API_BASE_URL}/domaines-metier`);
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des domaines métier');
    }
    return response.json();
  }

  // ============= Sous-Domaines Métier =============

  async getSousDomainesMetier(domaineMetierId?: number): Promise<SousDomaineMetierDTO[]> {
    const url = domaineMetierId
      ? `${API_BASE_URL}/sous-domaines-metier?domaineMetierId=${domaineMetierId}`
      : `${API_BASE_URL}/sous-domaines-metier`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des sous-domaines métier');
    }
    return response.json();
  }

  // ============= Critères d'Évaluation =============

  async getCriteresEvaluation(domaineId?: number): Promise<CritereEvaluationDTO[]> {
    const url = domaineId
      ? `${API_BASE_URL}/criteres-evaluation?domaineId=${domaineId}`
      : `${API_BASE_URL}/criteres-evaluation`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des critères d\'évaluation');
    }
    return response.json();
  }

  // ============= Méthodes d'Évaluation =============

  async getMethodesEvaluation(domaineId?: number): Promise<MethodeEvaluationDTO[]> {
    const url = domaineId
      ? `${API_BASE_URL}/methodes-evaluation?domaineId=${domaineId}`
      : `${API_BASE_URL}/methodes-evaluation`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des méthodes d\'évaluation');
    }
    return response.json();
  }
}

export const referentielService = new ReferentielService();
