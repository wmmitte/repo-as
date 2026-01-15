import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface RequireAuthProps {
  children: ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, isLoading, openAuthModal } = useAuth();
  const location = useLocation();
  
  // Détecter si on vient d'un callback OAuth
  const isOAuthCallback = location.search.includes('auth=success');

  useEffect(() => {
    // Si l'utilisateur n'est pas authentifié et que le chargement est terminé, afficher le modal
    // SAUF si on vient d'un callback OAuth (il faut laisser le temps à refreshAuth de se terminer)
    if (!isLoading && !isAuthenticated && !isOAuthCallback) {
      const returnUrl = location.pathname + location.search;
      console.log('🔒 [REQUIRE AUTH] Accès refusé, ouverture du modal d\'authentification');
      console.log('📍 [REQUIRE AUTH] Page demandée:', returnUrl);
      openAuthModal(returnUrl);
    }
  }, [isAuthenticated, isLoading, openAuthModal, location, isOAuthCallback]);

  // Si on charge l'authentification OU si c'est un callback OAuth et pas encore authentifié
  // -> afficher le spinner
  if (isLoading || (isOAuthCallback && !isAuthenticated)) {
    console.log('⏳ [REQUIRE AUTH] Chargement...', { isLoading, isOAuthCallback, isAuthenticated });
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Rediriger vers l'accueil mais le modal sera affiché
    return <Navigate to="/" replace state={{ from: location, authRequired: true }} />;
  }

  return <>{children}</>;
}
