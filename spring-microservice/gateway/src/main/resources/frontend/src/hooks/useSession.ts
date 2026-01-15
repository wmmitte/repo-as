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
      console.log('🚀 [SESSION] Initialisation de la session...');
      const session = loadSession();
      console.log('🔍 [SESSION] Session chargée:', session);

      if (session.visiteurId && !isExpired(session.ts)) {
        // Session existante valide
        console.log('✅ [SESSION] Session existante valide:', session.visiteurId);
        setVisiteurId(session.visiteurId);
      } else {
        // Pas de session ou expirée: créer une nouvelle
        if (session.visiteurId && isExpired(session.ts)) {
          console.log('⏱️ [SESSION] Session expirée, nettoyage...');
          clearSession();
        } else {
          console.log('🆕 [SESSION] Pas de session, création d\'une nouvelle...');
        }

        // Génération d'un visiteurId local (sans appel API)
        const newId = `v-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        console.log('✅ [SESSION] VisiteurId généré localement:', newId);
        setVisiteurId(newId);

        // Sauvegarde de la session sans instanceKey (le processus BPMN sera démarré plus tard)
        saveSession(newId, 0); // instanceKey à 0 car pas encore d'instance BPMN
        console.log('💾 [SESSION] Session sauvegardée (sans instance BPMN)');
      }

      setIsInitialized(true);
      console.log('✅ [SESSION] Initialisation terminée');
    };

    initSession();
  }, []);

  const startNewSession = (customVisiteurId?: string): void => {
    const newId = customVisiteurId || `v-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setVisiteurId(newId);
    saveSession(newId, 0); // Pas d'instanceKey pour le moment
    console.log('✅ [SESSION] Nouvelle session créée:', newId);
  };

  return {
    visiteurId,
    isInitialized,
    startNewSession,
  };
};
