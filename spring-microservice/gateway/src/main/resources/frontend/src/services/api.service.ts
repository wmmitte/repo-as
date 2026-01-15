import { FeedResponse } from '@/types/expert.types';

/**
 * Fonction générique pour appeler l'API backend
 */
async function api<T>(path: string, body?: Record<string, unknown>): Promise<T> {
  const resp = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}`);
  }
  
  return resp.json();
}

export const apiService = {
  /**
   * Charge le prochain lot d'experts
   */
  scrollNext: async (
    visiteurId: string,
    afterCursor: string,
    batchSize: number = 5
  ): Promise<FeedResponse> => {
    return api<FeedResponse>('/api/acceuil/api/scroll-next', {
      visiteurId,
      afterCursor,
      batchSize,
    });
  },

  /**
   * Enregistre un événement de dwell (temps passé sur un expert)
   */
  dwell: async (
    visiteurId: string,
    itemId: string,
    eventType: 'DWELL_START' | 'DWELL_STOP',
    dureeDwellMs?: number
  ): Promise<{ ok: boolean }> => {
    const body: Record<string, unknown> = {
      visiteurId,
      itemId,
      eventType,
    };
    if (dureeDwellMs !== undefined) {
      body.dureeDwellMs = dureeDwellMs;
    }
    return api<{ ok: boolean }>('/api/acceuil/api/dwell', body);
  },
};
