import { useAuth } from '@/context/AuthContext';

export interface UserRoles {
  roles: string[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook pour récupérer les rôles de l'utilisateur connecté
 * Les rôles sont extraits directement du User dans le AuthContext
 */
export function useUserRoles(): UserRoles {
  const { user, isLoading } = useAuth();

  // Si l'utilisateur n'est pas connecté ou en cours de chargement
  if (!user || isLoading) {
    return { roles: [], loading: isLoading, error: null };
  }

  // Récupérer les rôles depuis l'utilisateur
  const roles = user.roles || [];
  console.log('🔑 [ROLES] Rôles de l\'utilisateur:', roles);

  return { roles, loading: false, error: null };
}

/**
 * Hook pour vérifier si l'utilisateur a un rôle spécifique
 */
export function useHasRole(requiredRole: string): boolean {
  const { roles, loading } = useUserRoles();

  if (loading) return false;

  return roles.some(role =>
    role.toLowerCase() === requiredRole.toLowerCase()
  );
}

/**
 * Hook pour vérifier si l'utilisateur a au moins un des rôles spécifiés
 */
export function useHasAnyRole(requiredRoles: string[]): boolean {
  const { roles, loading } = useUserRoles();

  if (loading) return false;

  return roles.some(role =>
    requiredRoles.some(req => req.toLowerCase() === role.toLowerCase())
  );
}

/**
 * Hook pour vérifier si l'utilisateur peut accéder à la file traitant
 * Seuls les rôles Manager et RH peuvent y accéder
 */
export function useCanAccessFileTraitant(): boolean {
  return useHasAnyRole(['manager', 'rh']);
}
