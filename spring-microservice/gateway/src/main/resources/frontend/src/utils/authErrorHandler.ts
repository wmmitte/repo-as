/**
 * Gestionnaire global des erreurs d'authentification
 * Permet d'ouvrir le modal de connexion depuis n'importe où
 */

let globalAuthModalHandler: (() => void) | null = null;

export const setGlobalAuthModalHandler = (handler: () => void) => {
  globalAuthModalHandler = handler;
};

export const handleAuthError = (status: number) => {
  if ((status === 401 || status === 403) && globalAuthModalHandler) {
    console.log(`🔒 [AUTH ERROR HANDLER] Erreur ${status} détectée, ouverture du modal`);
    globalAuthModalHandler();
  }
};

/**
 * Wrapper pour les appels fetch qui gère automatiquement les erreurs d'authentification
 */
export const fetchWithAuthHandler = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const response = await fetch(input, init);
  
  if (response.status === 401 || response.status === 403) {
    handleAuthError(response.status);
  }
  
  return response;
};
