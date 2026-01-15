import { createContext, useContext, useState, ReactNode } from 'react';

interface HeaderTab {
  id: string;
  label: string;
}

interface HeaderConfig {
  title?: string;
  actions?: ReactNode;
  tabs?: HeaderTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

interface HeaderContextType {
  config: HeaderConfig;
  setConfig: (config: HeaderConfig) => void;
  resetConfig: () => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

const defaultConfig: HeaderConfig = {};

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<HeaderConfig>(defaultConfig);

  const setConfig = (newConfig: HeaderConfig) => {
    setConfigState({ ...defaultConfig, ...newConfig });
  };

  const resetConfig = () => {
    setConfigState(defaultConfig);
  };

  return (
    <HeaderContext.Provider value={{ config, setConfig, resetConfig }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error('useHeader doit être utilisé dans un HeaderProvider');
  }
  return context;
}
