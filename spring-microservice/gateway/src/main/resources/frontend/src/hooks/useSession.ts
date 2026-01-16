import { useState, useEffect } from 'react';
import { loadSession, saveSession, clearSession, isExpired } from '@/utils/session.utils';

/**
 * Hook de gestion de session visiteur.
 *
 * Ce hook génère et maintient un identifiant unique de visiteur (visiteurId)
 * sans créer d'instance BPMN. Le processus BPMN sera démarré ultérieurement
 * et associé aux utilisateurs identifiés selon leur profil.
 */
export const useSession = () => {
  const [visiteurId, setVisiteurId] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initSession = () => {
       const session = loadSession();
 
      if (session.visiteurId && !isExpired(session.ts)) {
        // Session existante valide
         setVisiteurId(session.visiteurId);
      } else {
        // Pas de session ou expirée: créer une nouvelle
        if (session.visiteurId && isExpired(session.ts)) {
           clearSession();
        } else {
         }

        // Génération d'un visiteurId local (sans appel API)
        const newId = `v-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
         setVisiteurId(newId);

        // Sauvegarde de la session sans instanceKey (le processus BPMN sera démarré plus tard)
        saveSession(newId, 0); // instanceKey à 0 car pas encore d'instance BPMN
       }

      setIsInitialized(true);
     };

    initSession();
  }, []);

  const startNewSession = (customVisiteurId?: string): void => {
    const newId = customVisiteurId || `v-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setVisiteurId(newId);
    saveSession(newId, 0); // Pas d'instanceKey pour le moment
   };

  return {
    visiteurId,
    isInitialized,
    startNewSession,
  };
};
