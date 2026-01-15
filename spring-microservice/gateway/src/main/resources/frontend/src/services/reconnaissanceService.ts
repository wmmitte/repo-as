import {
  DemandeReconnaissanceDTO,
  CreateDemandeReconnaissanceRequest,
  PieceJustificativeDTO,
  BadgeCompetenceDTO,
  TypePiece,
} from '@/types/reconnaissance.types';

const BASE_URL = '/api/reconnaissance-competences';

export const reconnaissanceService = {
  /**
   * Soumettre une nouvelle demande de reconnaissance
   */
  async soumettreDemande(request: CreateDemandeReconnaissanceRequest): Promise<DemandeReconnaissanceDTO> {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erreur lors de la soumission de la demande');
    }

    return response.json();
  },

  /**
   * Ajouter une pièce justificative à une demande
   */
  async ajouterPieceJustificative(
    demandeId: number,
    file: File,
    typePiece: TypePiece,
    description?: string
  ): Promise<PieceJustificativeDTO> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('typePiece', typePiece);
    if (description) {
      formData.append('description', description);
    }

    const response = await fetch(`${BASE_URL}/${demandeId}/pieces`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erreur lors de l\'ajout de la pièce justificative');
    }

    return response.json();
  },

  /**
   * Récupérer mes demandes de reconnaissance
   */
  async getMesDemandes(): Promise<DemandeReconnaissanceDTO[]> {
    const response = await fetch(`${BASE_URL}/mes-demandes`, {
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
   * Annuler une demande
   */
  async annulerDemande(demandeId: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/${demandeId}/annuler`, {
      method: 'PUT',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erreur lors de l\'annulation de la demande');
    }
  },

  /**
   * Resoumettre une demande après complément
   */
  async resoumettreApresComplement(demandeId: number, nouveauCommentaire?: string): Promise<DemandeReconnaissanceDTO> {
    const response = await fetch(`${BASE_URL}/${demandeId}/resoumettre`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/plain',
      },
      credentials: 'include',
      body: nouveauCommentaire || '',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erreur lors de la resoumission');
    }

    return response.json();
  },

  /**
   * Supprimer une pièce justificative
   */
  async supprimerPiece(demandeId: number, pieceId: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/${demandeId}/pieces/${pieceId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erreur lors de la suppression de la pièce');
    }
  },

  /**
   * Récupérer mes badges
   */
  async getMesBadges(actifSeulement: boolean = true): Promise<BadgeCompetenceDTO[]> {
    const response = await fetch(`${BASE_URL}/badges/mes-badges?actifSeulement=${actifSeulement}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des badges');
    }

    return response.json();
  },

  /**
   * Modifier la visibilité publique d'un badge
   */
  async toggleVisibiliteBadge(badgeId: number): Promise<BadgeCompetenceDTO> {
    const response = await fetch(`${BASE_URL}/badges/${badgeId}/visibilite`, {
      method: 'PUT',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la modification de la visibilité');
    }

    return response.json();
  },

  /**
   * Définir l'ordre d'affichage des badges
   */
  async definirOrdreBadges(badgeIds: number[]): Promise<void> {
    const response = await fetch(`${BASE_URL}/badges/ordre`, {
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
   * Récupérer les badges publics d'un expert (pour affichage sur profil public)
   */
  async getBadgesExpert(utilisateurId: string): Promise<BadgeCompetenceDTO[]> {
    const response = await fetch(`${BASE_URL}/badges/expert/${utilisateurId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des badges de l\'expert');
    }

    return response.json();
  },
};
