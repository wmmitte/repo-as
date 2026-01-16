import { useEffect } from 'react';
import { useHeader } from '@/contexts/HeaderContext';

interface HeaderTab {
  id: string;
  label: string;
}

interface HeaderConfigOptions {
  title?: string;
  showSearch?: boolean;
  actions?: React.ReactNode;
  visiteurId?: string;
  onStartSession?: (customId?: string) => Promise<void>;
  tabs?: HeaderTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

/**
 * Hook pour configurer le Header depuis une page
 * La configuration est appliquée au montage et réinitialisée au démontage
 */
export function useHeaderConfig(config: HeaderConfigOptions) {
  const { setConfig, resetConfig } = useHeader();

  // Créer une clé stable pour les tabs (basée sur les labels qui contiennent les compteurs)
  const tabsKey = config.tabs?.map(t => t.label).join('|') || '';

  useEffect(() => {
    setConfig(config);

    return () => {
      resetConfig();
    };
  }, [
    config.title,
    config.showSearch,
    config.visiteurId,
    config.activeTab,
    tabsKey, // Se met à jour quand les labels des tabs changent (incluant les compteurs)
    // Ignorer les fonctions et ReactNode dans les deps pour éviter les re-renders infinis
  ]);
}
