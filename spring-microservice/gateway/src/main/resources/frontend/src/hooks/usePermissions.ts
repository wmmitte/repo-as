import { useHasRole, useHasAnyRole } from '@/hooks/useUserRoles';

/**
 * Hooks personnalisés pour vérifier les permissions selon les rôles
 * Rôles disponibles: expert, rh, manager
 */

/**
 * Vérifie si l'utilisateur a le rôle Expert
 */
export const useIsExpert = () => {
  const hasRole = useHasRole('expert');
  return { hasRole };
};

/**
 * Vérifie si l'utilisateur a le rôle RH
 */
export const useIsRh = () => {
  const hasRole = useHasRole('rh');
  return { hasRole };
};

/**
 * Vérifie si l'utilisateur a le rôle Manager
 */
export const useIsManager = () => {
  const hasRole = useHasRole('manager');
  return { hasRole };
};

/**
 * Vérifie si l'utilisateur peut gérer les référentiels
 * (domaines métier, critères d'évaluation, méthodes d'évaluation)
 * Réservé au rôle RH uniquement
 */
export const useCanManageReferentiels = () => {
  const canManage = useHasRole('rh');
  return { canManage };
};

/**
 * Vérifie si l'utilisateur peut évaluer les demandes de reconnaissance
 * (Rôle RH uniquement)
 */
export const useCanEvaluate = () => {
  const canEvaluate = useHasRole('rh');
  return { canEvaluate };
};

/**
 * Vérifie si l'utilisateur peut valider les demandes de reconnaissance
 * (Rôle Manager uniquement)
 */
export const useCanValidate = () => {
  const canValidate = useHasRole('manager');
  return { canValidate };
};

/**
 * Vérifie si l'utilisateur peut accéder aux demandes de reconnaissance
 * (Visible pour RH et Managers)
 */
export const useCanAccessDemandesReconnaissance = () => {
  const canAccess = useHasAnyRole(['rh', 'manager']);
  return { canAccess };
};

/**
 * Vérifie si l'utilisateur peut gérer les référentiels manager
 * (compétences, localisations, certifications, domaines métier, critères et méthodes d'évaluation)
 * Réservé au rôle Manager uniquement
 */
export const useCanManageReferentielsManager = () => {
  const canManage = useHasRole('manager');
  return { canManage };
};

/**
 * Vérifie si l'utilisateur peut gérer son expertise
 * (Rôle Expert uniquement)
 */
export const useCanManageExpertise = () => {
  const canManage = useHasRole('expert');
  return { canManage };
};

/**
 * Vérifie si l'utilisateur peut gérer son réseau
 * (Rôle Expert uniquement)
 */
export const useCanManageNetwork = () => {
  const canManage = useHasRole('expert');
  return { canManage };
};

/**
 * Vérifie si l'utilisateur peut accéder au menu Expertise
 * (Visible pour les Experts, RH et Managers)
 * - Experts: accès complet à leur expertise
 * - RH: accès aux référentiels et demandes de reconnaissance
 * - Managers: accès aux demandes de reconnaissance
 */
export const useCanAccessExpertiseMenu = () => {
  const canAccess = useHasAnyRole(['expert', 'rh', 'manager']);
  return { canAccess };
};
