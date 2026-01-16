import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';

interface RequireRoleProps {
  children: ReactNode;
  roles: string[]; // Liste des rôles autorisés (au moins un doit correspondre)
}

/**
 * Composant pour protéger une route en vérifiant à la fois :
 * 1. Que l'utilisateur est authentifié
 * 2. Qu'il possède au moins un des rôles requis
 *
 * Exemple d'utilisation :
 * <RequireRole roles={['manager', 'rh']}>
 *   <FileTraitement />
 * </RequireRole>
 */
export default function RequireRole({ children, roles }: RequireRoleProps) {
  const { isAuthenticated, isLoading: authLoading, openAuthModal } = useAuth();
  const { roles: userRoles, loading: rolesLoading } = useUserRoles();
  const location = useLocation();

  const isOAuthCallback = location.search.includes('auth=success');
  const isLoading = authLoading || rolesLoading;

  // Si en cours de chargement ou callback OAuth
  if (isLoading || (isOAuthCallback && !isAuthenticated)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  // Vérifier d'abord l'authentification
  if (!isAuthenticated) {
    const returnUrl = location.pathname + location.search;
     openAuthModal(returnUrl);
    return <Navigate to="/" replace state={{ from: location, authRequired: true }} />;
  }

  // Vérifier les rôles
  const hasRequiredRole = userRoles.some(userRole =>
    roles.some(requiredRole =>
      userRole.toLowerCase() === requiredRole.toLowerCase()
    )
  );

  if (!hasRequiredRole) { 

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Accès Refusé
            </h1>
            <p className="text-gray-600 mb-6">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Cette page est réservée aux utilisateurs avec les rôles : {roles.join(', ')}
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="btn btn-primary"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
