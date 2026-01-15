/**
 * Service pour la gestion du profil utilisateur
 */

export interface ProfilPersonnel {
  typePersonne: 'PHYSIQUE' | 'MORALE';
  nom: string;
  prenom: string; // Null pour les personnes morales
  email: string;
  telephone: string;
  // Champs conservés pour compatibilité avec le backend mais non utilisés
  dateNaissance?: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  pays?: string;
  bio?: string;
  photoUrl?: string;
}

export interface ProfilProfessionnel {
  domaineExpertise?: string;
  experience?: string;
  biographie?: string;
  
  // Listes
  domainesInteret?: string[];
}

export interface ProfilComplet {
  id: string;
  informationsPersonnelles: ProfilPersonnel;
  informationsProfessionnelles: ProfilProfessionnel;
  profilComplet: boolean;
  hasOAuthProvider: boolean;
  hasPhoto: boolean;
}

export interface UpdateProfilData {
  // Type de personne
  typePersonne: 'PHYSIQUE' | 'MORALE';
  
  // Informations personnelles obligatoires
  nom: string;
  prenom: string; // Optionnel pour les personnes morales
  telephone: string;
  dateNaissance?: string; // Obligatoire pour personnes physiques (Date de naissance), morales (Date de création)
  
  // Informations professionnelles
  domaineExpertise?: string;
  experience?: string;
  biographie?: string;
  
  // Listes (envoyées comme JSON strings)
  domainesInteret?: string;
}

class ProfilService {
  private readonly API_URL = '/api/profil';

  /**
   * Récupère le profil de l'utilisateur connecté
   */
  async getProfil(): Promise<ProfilComplet> {
    const response = await fetch(this.API_URL, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du profil');
    }

    return response.json();
  }

  /**
   * Met à jour le profil de l'utilisateur
   */
  async updateProfil(data: UpdateProfilData): Promise<{ success: boolean; message: string; profil: ProfilComplet }> {
    const response = await fetch(this.API_URL, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      // Essayer de parser l'erreur, sinon utiliser le status
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const text = await response.text();
          if (text) {
            const error = JSON.parse(text);
            throw new Error(error.error || 'Erreur lors de la mise à jour du profil');
          }
        }
      } catch (e) {
        // Si le parsing échoue, utiliser le message par défaut
      }
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    // Gestion robuste de la réponse JSON
    const contentType = response.headers.get('content-type');
    let result: any = { success: true, message: 'Profil mis à jour', profil: {} };
    
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (text) {
        try {
          result = JSON.parse(text);
        } catch (e) {
          console.error('Erreur parsing JSON:', e);
          // Retourner un succès par défaut si parsing échoue mais status OK
        }
      }
    }
    
    return result;
  }

  /**
   * Vérifie si le profil est complet
   */
  async isProfilComplet(): Promise<boolean> {
    const response = await fetch(`${this.API_URL}/complet`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la vérification du profil');
    }

    const data = await response.json();
    return data.profilComplet;
  }

  /**
   * Upload une photo de profil
   */
  async uploadPhoto(file: File): Promise<{ success: boolean; message: string }> {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await fetch(`${this.API_URL}/photo`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de l\'upload de la photo');
    }

    return data;
  }

  /**
   * Récupère l'URL de la photo de profil
   */
  getPhotoUrl(): string {
    return `${this.API_URL}/photo?t=${Date.now()}`;
  }

  /**
   * Supprime la photo de profil
   */
  async supprimerPhoto(): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.API_URL}/photo`, {
      method: 'DELETE',
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de la suppression de la photo');
    }

    return data;
  }

  /**
   * Change le mot de passe de l'utilisateur
   */
  async changerMotDePasse(motDePasseActuel: string, nouveauMotDePasse: string, confirmationMotDePasse: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.API_URL}/mot-de-passe`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        motDePasseActuel,
        nouveauMotDePasse,
        confirmationMotDePasse,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors du changement de mot de passe');
    }

    return data;
  }
}

export const profilService = new ProfilService();
