import { useState, useEffect } from 'react';

/**
 * Hook pour vérifier si l'utilisateur a un rôle spécifique
 * @param requiredRole - Le rôle requis (ex: 'manager', 'rh')
 * @returns Un objet { hasRole: boolean, loading: boolean }
 */
export const useHasRole = (requiredRole: string): { hasRole: boolean; loading: boolean } => {
  const [hasRole, setHasRole] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const response = await fetch('/api/me/roles', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          const roles: string[] = data.roles || [];

          // Vérifier si le rôle requis est présent (insensible à la casse)
          const hasRequiredRole = roles.some(
            role => role.toLowerCase() === requiredRole.toLowerCase()
          );

          setHasRole(hasRequiredRole);
        } else {
          setHasRole(false);
        }
      } catch (error) {
        console.error('[useHasRole] Erreur lors de la vérification du rôle:', error);
        setHasRole(false);
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [requiredRole]);

  return { hasRole, loading };
};

/**
 * Hook pour vérifier si l'utilisateur a le rôle MANAGER
 */
export const useIsManager = (): { hasRole: boolean; loading: boolean } => {
  return useHasRole('manager');
};

/**
 * Hook pour vérifier si l'utilisateur a le rôle RH
 */
export const useIsRh = (): { hasRole: boolean; loading: boolean } => {
  return useHasRole('rh');
};

/**
 * Hook pour vérifier si l'utilisateur est un utilisateur de l'organisation
 * (Manager ou RH)
 */
export const useIsOrganisation = (): { isOrganisation: boolean; loading: boolean } => {
  const { hasRole: isManager, loading: loadingManager } = useIsManager();
  const { hasRole: isRh, loading: loadingRh } = useIsRh();

  const loading = loadingManager || loadingRh;
  const isOrganisation = isManager || isRh;

  return { isOrganisation, loading };
};
