import { useRef, useCallback } from 'react';
import { apiService } from '@/services/api.service';

export const useDwellTracking = (visiteurId: string) => {
  const currentItemRef = useRef<string | null>(null);
  const dwellStartRef = useRef<number | null>(null);

  const startDwell = useCallback(
    async (itemId: string) => {
      if (!visiteurId || !itemId) return;

      // Arrêter le dwell précédent si existant
      if (currentItemRef.current && dwellStartRef.current) {
        const dwellMs = Date.now() - dwellStartRef.current;
        try {
          await apiService.dwell(
            visiteurId,
            currentItemRef.current,
            'DWELL_STOP',
            dwellMs
          );
        } catch (error) {
          console.error('Failed to stop dwell:', error);
        }
      }

      // Démarrer le nouveau dwell
      currentItemRef.current = itemId;
      dwellStartRef.current = Date.now();
      
      try {
        await apiService.dwell(visiteurId, itemId, 'DWELL_START');
      } catch (error) {
        console.error('Failed to start dwell:', error);
      }
    },
    [visiteurId]
  );

  const stopDwell = useCallback(async () => {
    if (!visiteurId || !currentItemRef.current || !dwellStartRef.current) return;

    const dwellMs = Date.now() - dwellStartRef.current;
    try {
      await apiService.dwell(
        visiteurId,
        currentItemRef.current,
        'DWELL_STOP',
        dwellMs
      );
    } catch (error) {
      console.error('Failed to stop dwell:', error);
    }

    currentItemRef.current = null;
    dwellStartRef.current = null;
  }, [visiteurId]);

  return {
    startDwell,
    stopDwell,
  };
};
