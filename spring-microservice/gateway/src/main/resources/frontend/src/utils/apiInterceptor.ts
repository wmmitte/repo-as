/**
 * Intercepteur global pour gérer les erreurs d'authentification (401)
 * Déconnecte automatiquement l'utilisateur et le redirige vers l'accueil
 */

let isRedirecting = false;

export const handleApiError = (error: any): never => {
  // Vérifier si c'est une erreur 401 (session expirée)
  if (error.status === 401 || error.message?.includes('401')) {
    if (!isRedirecting) {
      isRedirecting = true;
      console.log('🔒 [API INTERCEPTOR] Session expirée, redirection vers l\'accueil');
      
      // Nettoyer le localStorage si nécessaire
      localStorage.removeItem('pitm_utilisateur');
      
      // Rediriger vers l'accueil
      window.location.href = '/';
    }
  }
  
  throw error;
};

/**
 * Wrapper pour fetch qui gère automatiquement les erreurs 401
 */
export const fetchWithAuth = async (url: string, options?: RequestInit): Promise<Response> => {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Important pour les cookies de session
    });

    // Si 401, gérer l'expiration de session
    if (response.status === 401) {
      handleApiError({ status: 401, message: 'Unauthorized' });
    }

    return response;
  } catch (error) {
    throw error;
  }
};
