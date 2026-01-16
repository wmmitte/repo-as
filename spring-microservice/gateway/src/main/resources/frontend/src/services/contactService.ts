export interface CreerDemandeContactRequest {
  objet: string;
  message: string;
  emailReponse?: string;
}

export interface DemandeContactDTO {
  id: number;
  expediteurId: string;
  destinataireId: string;
  objet: string;
  message: string;
  emailReponse?: string;
  statut: 'EN_ATTENTE' | 'LUE' | 'REPONDUE' | 'ARCHIVEE';
  dateCreation: string;
  dateLecture?: string;
  dateReponse?: string;
  expediteurNom?: string;
  expediteurPrenom?: string;
  expediteurHasPhoto?: boolean;
  destinataireNom?: string;
  destinatairePrenom?: string;
  destinataireHasPhoto?: boolean;
}

const BASE_URL = '/api/contact';

export const contactService = {
  /**
   * Envoyer une demande de contact à un expert
   */
  async envoyerDemandeContact(destinataireId: string, request: CreerDemandeContactRequest): Promise<DemandeContactDTO> {
    const response = await fetch(`${BASE_URL}/${destinataireId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur lors de l\'envoi du message' }));
      throw new Error(error.message || 'Erreur lors de l\'envoi du message');
    }

    return response.json();
  },

  /**
   * Récupérer les demandes envoyées
   */
  async getDemandesEnvoyees(): Promise<DemandeContactDTO[]> {
    const response = await fetch(`${BASE_URL}/envoyees`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des demandes envoyées');
    }

    return response.json();
  },

  /**
   * Récupérer les demandes reçues
   */
  async getDemandesRecues(): Promise<DemandeContactDTO[]> {
    const response = await fetch(`${BASE_URL}/recues`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des demandes reçues');
    }

    return response.json();
  },

  /**
   * Récupérer les demandes non lues
   */
  async getDemandesNonLues(): Promise<DemandeContactDTO[]> {
    const response = await fetch(`${BASE_URL}/non-lues`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des demandes non lues');
    }

    return response.json();
  },

  /**
   * Compter les demandes non lues
   */
  async compterDemandesNonLues(): Promise<number> {
    const response = await fetch(`${BASE_URL}/non-lues/count`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erreur lors du comptage des demandes');
    }

    const data = await response.json();
    return data.count;
  },

  /**
   * Marquer une demande comme lue
   */
  async marquerCommeLue(demandeId: number): Promise<DemandeContactDTO> {
    const response = await fetch(`${BASE_URL}/${demandeId}/lue`, {
      method: 'PUT',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erreur lors du marquage de la demande');
    }

    return response.json();
  },

  /**
   * Archiver une demande
   */
  async archiverDemande(demandeId: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/${demandeId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'archivage de la demande');
    }
  },
};
