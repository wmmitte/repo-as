import { createContext, useContext, ReactNode } from 'react';
import { useTheme, Theme, ThemeConfig, THEMES } from '@/hooks/useTheme';

interface ThemeContextType {
  currentTheme: Theme;
  themeConfig: ThemeConfig;
  availableThemes: Record<Theme, ThemeConfig>;
  changeTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  customizePrimaryColor: (color: string) => void;
  isLight: boolean;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const themeData = useTheme();

  return (
    <ThemeContext.Provider value={themeData}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}

// Export des types et constantes pour utilisation externe
export type { Theme, ThemeConfig };
export { THEMES };