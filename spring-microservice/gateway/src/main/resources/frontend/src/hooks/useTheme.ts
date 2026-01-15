import { useState, useEffect } from 'react';

export type Theme = 'pitm-light' | 'pitm-dark';

export interface ThemeConfig {
  name: string;
  displayName: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
}

// Configuration des thèmes disponibles
export const THEMES: Record<Theme, ThemeConfig> = {
  'pitm-light': {
    name: 'pitm-light',
    displayName: 'Thème Clair',
    primaryColor: '#1A3D64',
    secondaryColor: '#64748b',
    backgroundColor: '#f8fafc',
    textColor: '#1e293b'
  },
  'pitm-dark': {
    name: 'pitm-dark',
    displayName: 'Thème Sombre',
    primaryColor: '#1A3D64',
    secondaryColor: '#94a3b8',
    backgroundColor: '#0f172a',
    textColor: '#f1f5f9'
  }
};

const STORAGE_KEY = 'pitm-theme';
const DEFAULT_THEME: Theme = 'pitm-light';

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState<Theme>(DEFAULT_THEME);

  // Charger le thème depuis le localStorage au montage
  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (savedTheme && THEMES[savedTheme]) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme(DEFAULT_THEME);
    }
  }, []);

  // Appliquer le thème au DOM
  const applyTheme = (theme: Theme) => {
    const html = document.documentElement;
    html.setAttribute('data-theme', theme);
    
    // Mettre à jour les variables CSS personnalisées si nécessaire
    const themeConfig = THEMES[theme];
    const root = document.documentElement.style;
    
    // Vous pouvez ajouter ici d'autres personnalisations CSS
    root.setProperty('--current-primary', themeConfig.primaryColor);
    root.setProperty('--current-background', themeConfig.backgroundColor);
    root.setProperty('--current-text', themeConfig.textColor);
  };

  // Changer de thème
  const changeTheme = (theme: Theme) => {
    setCurrentTheme(theme);
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  };

  // Basculer entre les thèmes disponibles
  const toggleTheme = () => {
    const themes = Object.keys(THEMES) as Theme[];
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    changeTheme(themes[nextIndex]);
  };

  // Personnaliser la couleur principale
  const customizePrimaryColor = (color: string) => {
    const root = document.documentElement.style;
    root.setProperty('--primary-500', color);
    root.setProperty('--current-primary', color);
    
    // Sauvegarder la couleur personnalisée
    localStorage.setItem('pitm-custom-primary', color);
    
    // Calculer automatiquement les nuances de la couleur
    generateColorShades(color);
  };

  // Générer automatiquement les nuances d'une couleur
  const generateColorShades = (baseColor: string) => {
    // Fonction utilitaire pour calculer les nuances
    const hexToHsl = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!result) return { h: 0, s: 0, l: 0 };
      
      const r = parseInt(result[1], 16) / 255;
      const g = parseInt(result[2], 16) / 255;
      const b = parseInt(result[3], 16) / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      
      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
          default: h = 0;
        }
        h /= 6;
      }
      
      return { h: h * 360, s: s * 100, l: l * 100 };
    };

    const hslToHex = (h: number, s: number, l: number) => {
      l /= 100;
      const a = s * Math.min(l, 1 - l) / 100;
      const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
      };
      return `#${f(0)}${f(8)}${f(4)}`;
    };

    const { h, s, l } = hexToHsl(baseColor);
    const root = document.documentElement.style;
    
    // Générer les nuances en modifiant la luminosité
    const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
    const luminosities = [95, 90, 80, 65, 50, l, 35, 25, 15, 10];
    
    shades.forEach((shade, index) => {
      const color = hslToHex(h, s, luminosities[index]);
      root.setProperty(`--primary-${shade}`, color);
    });
  };

  // Charger la couleur personnalisée si elle existe
  useEffect(() => {
    const customPrimary = localStorage.getItem('pitm-custom-primary');
    if (customPrimary) {
      customizePrimaryColor(customPrimary);
    }
  }, []);

  return {
    currentTheme,
    themeConfig: THEMES[currentTheme],
    availableThemes: THEMES,
    changeTheme,
    toggleTheme,
    customizePrimaryColor,
    isLight: currentTheme === 'pitm-light',
    isDark: currentTheme === 'pitm-dark'
  };
}