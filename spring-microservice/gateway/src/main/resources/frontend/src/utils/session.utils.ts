import { SessionData } from '@/types/expert.types';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Sauvegarde la session visiteur dans le localStorage.
 *
 * Note: instanceKey n'est plus stocké car le processus BPMN n'est plus
 * créé automatiquement pour les visiteurs. Il sera géré ultérieurement
 * pour les utilisateurs identifiés.
 */
export const saveSession = (visiteurId: string, _instanceKey?: number): void => {
  try {
    localStorage.setItem('visiteurId', visiteurId);
    localStorage.setItem('sessionTs', String(Date.now()));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
};

/**
 * Charge la session visiteur depuis le localStorage.
 *
 * Note: instanceKey retourne toujours 0 car il n'est plus utilisé
 * pour les visiteurs anonymes.
 */
export const loadSession = (): SessionData => {
  try {
    const visiteurId = localStorage.getItem('visiteurId') || '';
    const ts = Number(localStorage.getItem('sessionTs') || '0');
    return { visiteurId, instanceKey: 0, ts };
  } catch (error) {
    console.error('Failed to load session:', error);
    return { visiteurId: '', instanceKey: 0, ts: 0 };
  }
};

/**
 * Efface la session visiteur du localStorage.
 */
export const clearSession = (): void => {
  try {
    localStorage.removeItem('visiteurId');
    localStorage.removeItem('sessionTs');
    // Nettoyage de l'ancien instanceKey si présent
    localStorage.removeItem('instanceKey');
  } catch (error) {
    console.error('Failed to clear session:', error);
  }
};

export const isExpired = (ts: number): boolean => {
  if (!ts || isNaN(ts)) return true;
  return Date.now() - ts > DAY_MS;
};
