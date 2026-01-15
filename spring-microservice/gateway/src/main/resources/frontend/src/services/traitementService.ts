import {
  DemandeReconnaissanceDTO,
  EvaluationRequest,
  EvaluationCompetenceDTO,
  PieceJustificativeDTO,
  StatistiquesTraitementDTO,
  StatutDemande,
  ApprobationRequest,
  UtilisateurRhDTO,
  AssignationRhRequest,
} from '@/types/reconnaissance.types';

const BASE_URL = '/api/demandes-reconnaissance';

export const traitementService = {
  /**
   * Récupérer les demandes disponibles pour traitement
   */
  async getDemandesATraiter(statut?: StatutDemande): Promise<DemandeReconnaissanceDTO[]> {
    const url = statut ? `${BASE_URL}?statut=${statut}` : BASE_URL;
    const response = await fetch(url, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des demandes');
    }

    return response.json();
  },

  /**
   * Récupérer les demandes assignées
   */
  async getDemandesAssignees(): Promise<DemandeReconnaissanceDTO[]> {
    const response = await fetch(`${BASE_URL}/demandes`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des demandes');
    }

    return response.json();
  },

  /**
   * Récupérer les détails d'une demande
   */
  async getDemandeDetails(demandeId: number): Promise<DemandeReconnaissanceDTO> {
    const response = await fetch(`${BASE_URL}/${demandeId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des détails');
    }

    return response.json();
  },

  /**
   * S'assigner une demande
   */
  async assignerDemande(demandeId: number): Promise<DemandeReconnaissanceDTO> {
    const response = await fetch(`${BASE_URL}/${demandeId}/assigner`, {
      method: 'PUT',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erreur lors de l\'assignation');
    }

    return response.json();
  },

  /**
   * Évaluer une demande
   */
  async evaluerDemande(demandeId: number, evaluation: EvaluationRequest): Promise<EvaluationCompetenceDTO> {
    const response = await fetch(`${BASE_URL}/${demandeId}/evaluer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(evaluation),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erreur lors de l\'évaluation');
    }

    return response.json();
  },

  /**
   * Approuver une demande avec définition de la validité du badge
   */
  async approuverDemande(
    demandeId: number, 
    request: ApprobationRequest
  ): Promise<DemandeReconnaissanceDTO> {
    const response = await fetch(`${BASE_URL}/${demandeId}/approuver`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erreur lors de l\'approbation');
    }

    return response.json();
  },

  /**
   * Rejeter une demande
   */
  async rejeterDemande(demandeId: number, motif: string): Promise<DemandeReconnaissanceDTO> {
    const response = await fetch(`${BASE_URL}/${demandeId}/rejeter`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/plain',
      },
      credentials: 'include',
      body: motif,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erreur lors du rejet');
    }

    return response.json();
  },

  /**
   * Demander des compléments d'information
   */
  async demanderComplement(demandeId: number, commentaire: string): Promise<DemandeReconnaissanceDTO> {
    const response = await fetch(`${BASE_URL}/${demandeId}/complements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      credentials: 'include',
      body: commentaire,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erreur lors de la demande de complément');
    }

    return response.json();
  },

  /**
   * Marquer une pièce justificative comme vérifiée
   */
  async marquerPieceVerifiee(pieceId: number): Promise<PieceJustificativeDTO> {
    const response = await fetch(`${BASE_URL}/pieces/${pieceId}/verifier`, {
      method: 'PUT',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la vérification de la pièce');
    }

    return response.json();
  },

  /**
   * Obtenir les statistiques de traitement
   */
  async getStatistiques(): Promise<StatistiquesTraitementDTO> {
    const response = await fetch(`${BASE_URL}/statistiques`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des statistiques');
    }

    return response.json();
  },

  /**
   * Révoquer un badge (admin uniquement)
   */
  async revoquerBadge(badgeId: number, motif: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/badges/${badgeId}/revoquer`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/plain',
      },
      credentials: 'include',
      body: motif,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erreur lors de la révocation du badge');
    }
  },

  // ========== Workflow Manager/RH ==========

  /**
   * Récupérer la liste des utilisateurs RH disponibles avec leurs statistiques
   * (MANAGER uniquement)
   */
  async getUtilisateursRh(): Promise<UtilisateurRhDTO[]> {
    const response = await fetch(`${BASE_URL}/rh-disponibles`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des utilisateurs RH');
    }

    return response.json();
  },

  /**
   * Assigner une demande à un utilisateur RH spécifique
   * (MANAGER uniquement)
   */
  async assignerDemandeAuRh(
    demandeId: number,
    request: AssignationRhRequest
  ): Promise<DemandeReconnaissanceDTO> {
    const response = await fetch(`${BASE_URL}/${demandeId}/assigner-rh`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erreur lors de l\'assignation au RH');
    }

    return response.json();
  },

  /**
   * Récupérer les demandes assignées aux RH (vue Manager)
   * (MANAGER uniquement)
   */
  async getDemandesAssigneesParManager(): Promise<DemandeReconnaissanceDTO[]> {
    const response = await fetch(`${BASE_URL}/assignees`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des demandes assignées');
    }

    return response.json();
  },

  /**
   * Récupérer les demandes en attente de validation par le Manager
   * (MANAGER uniquement)
   */
  async getDemandesEnAttenteValidation(): Promise<DemandeReconnaissanceDTO[]> {
    const response = await fetch(`${BASE_URL}/a-valider`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des demandes à valider');
    }

    return response.json();
  },

  /**
   * Soumettre l'évaluation au Manager après avoir évalué la demande
   * (RH uniquement)
   */
  async soumettreEvaluationAuManager(demandeId: number): Promise<DemandeReconnaissanceDTO> {
    const response = await fetch(`${BASE_URL}/${demandeId}/soumettre-evaluation`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erreur lors de la soumission de l\'évaluation');
    }

    return response.json();
  },

  /**
   * Approuver une demande (décision finale du Manager)
   * (MANAGER uniquement)
   */
  async approuverDemandeManager(
    demandeId: number,
    request: ApprobationRequest
  ): Promise<DemandeReconnaissanceDTO> {
    const response = await fetch(`${BASE_URL}/${demandeId}/approuver-manager`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erreur lors de l\'approbation');
    }

    return response.json();
  },

  /**
   * Rejeter une demande (décision finale du Manager)
   * (MANAGER uniquement)
   */
  async rejeterDemandeManager(demandeId: number, motif: string): Promise<DemandeReconnaissanceDTO> {
    const response = await fetch(`${BASE_URL}/${demandeId}/rejeter-manager`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/plain',
      },
      credentials: 'include',
      body: motif,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erreur lors du rejet');
    }

    return response.json();
  },

  /**
   * Demander des compléments (décision Manager, retour au RH)
   * (MANAGER uniquement)
   */
  async demanderComplementManager(demandeId: number, commentaire: string): Promise<DemandeReconnaissanceDTO> {
    const response = await fetch(`${BASE_URL}/${demandeId}/complements-manager`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      credentials: 'include',
      body: commentaire,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erreur lors de la demande de complément');
    }

    return response.json();
  },
};
