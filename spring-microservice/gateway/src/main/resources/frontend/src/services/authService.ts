/**
 * Service d'authentification centralisé
 * Gère toutes les interactions avec le service Auth via Keycloak
 */

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  photoUrl?: string;
  actif: boolean;
  profilComplet?: boolean;
  roles?: string[]; // Rôles de l'utilisateur (expert, rh, manager)
}

export interface AuthResponse {
  authenticated: boolean;
  utilisateur?: User;
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  utilisateur?: User;
  emailNonVerifie?: boolean;
  email?: string;
}

class AuthService {
  private readonly AUTH_SERVICE_URL = '/api';
  private readonly OAUTH_URL = '/oauth2';

  /**
   * Redirige vers Keycloak pour l'authentification
   * @param provider - Provider OAuth à utiliser (google, facebook, apple)
   *                   Si spécifié, redirige directement vers le provider sans afficher la page Keycloak
   */
  login(provider?: 'google' | 'facebook' | 'apple'): void {
    let authUrl = `${this.OAUTH_URL}/authorization/keycloak`;
    
    // Si un provider est spécifié, ajouter kc_idp_hint pour sauter la page Keycloak
    if (provider) {
      authUrl += `?kc_idp_hint=${provider}`;
    }
    
    window.location.href = authUrl;
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   * Fonctionne pour OAuth2 ET email/password car le Gateway crée le même type de contexte
   */
  async checkAuth(): Promise<AuthResponse> {
    try {
     

      const response = await fetch(`${this.AUTH_SERVICE_URL}/me`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

 
      if (!response.ok) {
        // Pour 401 (non authentifié) ou autres erreurs, retourner non authentifié
        // Ne pas lancer d'erreur pour permettre l'accès aux pages publiques
        return { authenticated: false };
      }

      const data = await response.json();
       return data;
    } catch (error) {
       throw error;
    }
  }

  /**
   * Inscription avec email et mot de passe
   * Appelle le Gateway qui crée un contexte d'authentification, comme OAuth2
   */
  async registerWithPassword(data: RegisterRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.AUTH_SERVICE_URL}/gateway/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });

      // Vérifier si la réponse a du contenu
      const contentType = response.headers.get('content-type');
      let result: any = {};
      
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        if (text) {
          result = JSON.parse(text);
        }
      }

      if (!response.ok) {
        return {
          success: false,
          message: result.message || `Erreur ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        utilisateur: result.utilisateur,
      };
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      return {
        success: false,
        message: error.message || 'Erreur réseau',
      };
    }
  }

  /**
   * Connexion avec email et mot de passe
   * Appelle le Gateway qui crée un contexte d'authentification, comme OAuth2
   */
  async loginWithPassword(email: string, motDePasse: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.AUTH_SERVICE_URL}/gateway/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, motDePasse }),
      });

      // Vérifier si la réponse a du contenu
      const contentType = response.headers.get('content-type');
      let result: any = {};
      
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        if (text) {
          result = JSON.parse(text);
        }
      }

      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Email ou mot de passe incorrect',
          emailNonVerifie: result.emailNonVerifie || false,
          email: result.email,
        };
      }

      return {
        success: true,
        utilisateur: result.utilisateur,
      };
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      return {
        success: false,
        message: error.message || 'Erreur réseau',
      };
    }
  }

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    try {
 
      // 1. D'abord invalider la session backend
      await fetch('/logout', {
        method: 'POST',
        credentials: 'include',
      });
 
      // 2. Ensuite nettoyer tout côté client
      // Nettoyer localStorage
      localStorage.clear();
 
      // Nettoyer sessionStorage
      sessionStorage.clear();
 
      // Supprimer tous les cookies
      const cookies = document.cookie.split(';');
 
      cookies.forEach(cookie => {
        const name = cookie.split('=')[0].trim();
        // Supprimer avec différents chemins et domaines possibles
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        document.cookie = `${name}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        document.cookie = `${name}=; path=/api; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      });

 
      // Note: La redirection est gérée par le AuthContext
    } catch (error) {
       // Même en cas d'erreur, on nettoie quand même côté client
      localStorage.clear();
      sessionStorage.clear();
      // Ne pas rediriger automatiquement, laisser le AuthContext gérer
    }
  }
}

export const authService = new AuthService();
