import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authService, User, AuthResponse } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  showAuthModal: boolean;
  redirectUrl: string | null;
  login: () => void;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  openAuthModal: (returnUrl?: string) => void;
  closeAuthModal: () => void;
  getRedirectUrl: () => string | null;
  clearRedirectUrl: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Vérifie si l'utilisateur est un utilisateur de l'organisation (Manager ou RH)
 */
const estUtilisateurOrganisation = (user: User | null): boolean => {
  if (!user || !user.roles) return false;
  const roles = user.roles.map(r => r.toLowerCase());
  return roles.includes('manager') || roles.includes('rh');
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  const refreshAuth = useCallback(async (retryCount = 0) => {
    console.log('🔄 [AUTH CONTEXT] Début refreshAuth, retry:', retryCount);
    setIsLoading(true);

    // Si on vient d'OAuth et que c'est le premier essai, attendre un peu que la session soit établie
    const isOAuthCallback = window.location.search.includes('auth=success');
    if (isOAuthCallback && retryCount === 0) {
      console.log('⏳ [AUTH CONTEXT] Callback OAuth détecté, attente de 500ms pour la session...');
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    try {
      const response: AuthResponse = await authService.checkAuth();
      console.log('🔄 [AUTH CONTEXT] Refresh auth response:', response);
      console.log('🔍 [AUTH CONTEXT] authenticated:', response.authenticated);
      console.log('👤 [AUTH CONTEXT] utilisateur:', response.utilisateur);

      // Si on revient d'OAuth mais pas encore authentifié, retry une fois
      if (isOAuthCallback && !response.authenticated && retryCount === 0) {
        console.log('⚠️ [AUTH CONTEXT] Pas encore authentifié après OAuth, retry dans 1s...');
        setIsLoading(false);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return refreshAuth(1); // Retry une fois
      }

      setIsAuthenticated(response.authenticated);
      setUser(response.utilisateur || null);
      console.log('✅ [AUTH CONTEXT] État mis à jour: isAuthenticated=' + response.authenticated);

      if (response.authenticated) {
        // Nettoyer les données de redirection OAuth après l'authentification
        localStorage.removeItem('auth_redirect_url');
        // Nettoyer le cookie (le backend l'a déjà utilisé)
        document.cookie = 'auth_redirect_url=; path=/; max-age=0';
        // Nettoyer le flag de redirection
        sessionStorage.removeItem('auth_redirecting');
        console.log('🧹 [AUTH CONTEXT] Nettoyage des données de redirection OAuth');

        // Si callback OAuth et utilisateur de l'organisation, rediriger vers /demandes-reconnaissance
        if (isOAuthCallback && response.utilisateur) {
          const isOrganisation = estUtilisateurOrganisation(response.utilisateur);
          const currentPath = window.location.pathname;

          // Si utilisateur organisation et pas déjà sur la bonne page
          if (isOrganisation && currentPath !== '/demandes-reconnaissance') {
            console.log('🔀 [AUTH CONTEXT] Utilisateur organisation détecté après OAuth, redirection vers /demandes-reconnaissance');
            window.location.href = '/demandes-reconnaissance';
          }
        }
      } else {
        console.log('❌ [AUTH CONTEXT] Utilisateur non authentifié après refresh');
      }
    } catch (error: any) {
      console.error('❌ [AUTH CONTEXT] Erreur lors du refresh de l\'authentification:', error);

      // Si erreur 401 (session expirée), déconnecter l'utilisateur
      if (error.message?.includes('401') || error.status === 401) {
        console.log('🔒 [AUTH CONTEXT] Session expirée, déconnexion automatique');
        setIsAuthenticated(false);
        setUser(null);
        // Rediriger vers l'accueil si on n'y est pas déjà
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } finally {
      setIsLoading(false);
      console.log('🏁 [AUTH CONTEXT] Fin refreshAuth');
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const login = () => {
    // Ouvrir le modal de connexion au lieu de rediriger directement
    openAuthModal();
  };

  const logout = async () => {
    console.log('🚪 [AUTH CONTEXT] Début logout...');
    console.log('👤 [AUTH CONTEXT] Utilisateur actuel:', user);

    // Vérifier si l'utilisateur est de l'organisation AVANT de le déconnecter
    const isOrganisation = estUtilisateurOrganisation(user);
    console.log('🏢 [AUTH CONTEXT] Utilisateur organisation:', isOrganisation);

    // Déconnecter l'utilisateur
    await authService.logout();

    // Mettre à jour l'état local
    setIsAuthenticated(false);
    setUser(null);
    console.log('✅ [AUTH CONTEXT] État local mis à jour: isAuthenticated=false, user=null');

    // Si utilisateur de l'organisation, ouvrir le modal de connexion après un court délai
    if (isOrganisation) {
      console.log('⏳ [AUTH CONTEXT] Ouverture du modal de connexion pour utilisateur organisation...');
      // Attendre un peu pour que l'état soit bien mis à jour
      setTimeout(() => {
        openAuthModal();
      }, 100);
    }
  };

  const openAuthModal = useCallback((returnUrl?: string) => {
    // Si une URL de retour est fournie, la sauvegarder, sinon utiliser l'URL actuelle
    const urlToSave = returnUrl || window.location.pathname + window.location.search;
    console.log('🔓 [AUTH CONTEXT] Ouverture du modal d\'authentification');
    console.log('📍 [AUTH CONTEXT] URL de retour sauvegardée:', urlToSave);
    setRedirectUrl(urlToSave);
    setShowAuthModal(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    console.log('🔒 [AUTH CONTEXT] Fermeture du modal d\'authentification');
    setShowAuthModal(false);
  }, []);

  const getRedirectUrl = useCallback(() => {
    return redirectUrl;
  }, [redirectUrl]);

  const clearRedirectUrl = useCallback(() => {
    console.log('🧹 [AUTH CONTEXT] Nettoyage de l\'URL de redirection');
    setRedirectUrl(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        showAuthModal,
        redirectUrl,
        login,
        logout,
        refreshAuth,
        openAuthModal,
        closeAuthModal,
        getRedirectUrl,
        clearRedirectUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
