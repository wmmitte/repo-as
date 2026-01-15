import { useState } from 'react';
import { useThemeContext } from './ThemeProvider';

interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ThemeCustomizer({ isOpen, onClose }: ThemeCustomizerProps) {
  const { 
    currentTheme, 
    themeConfig, 
    availableThemes, 
    changeTheme, 
    customizePrimaryColor 
  } = useThemeContext();
  
  const [couleurPersonnalisee, setCouleurPersonnalisee] = useState(themeConfig.primaryColor);

  if (!isOpen) return null;

  const appliquerCouleurPersonnalisee = () => {
    customizePrimaryColor(couleurPersonnalisee);
  };

  const couleursPredefinies = [
    { nom: 'Bleu PITM', couleur: '#1A3D64' },
    { nom: 'Bleu Moderne', couleur: '#3B82F6' },
    { nom: 'Violet', couleur: '#8B5CF6' },
    { nom: 'Vert', couleur: '#10B981' },
    { nom: 'Orange', couleur: '#F59E0B' },
    { nom: 'Rouge', couleur: '#EF4444' },
    { nom: 'Rose', couleur: '#EC4899' },
    { nom: 'Cyan', couleur: '#06B6D4' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Personnaliser le thème</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-6">
          {/* Sélection du thème */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Thème</h3>
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(availableThemes).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => changeTheme(key as any)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    currentTheme === key
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{theme.displayName}</div>
                      <div className="text-sm text-gray-600">
                        {key === 'pitm-light' ? 'Interface claire et moderne' : 'Interface sombre et élégante'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div 
                        className="w-6 h-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: theme.backgroundColor }}
                      ></div>
                      <div 
                        className="w-6 h-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: theme.primaryColor }}
                      ></div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Couleur principale personnalisée */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Couleur principale</h3>
            
            {/* Couleurs prédéfinies */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">Couleurs prédéfinies</p>
              <div className="grid grid-cols-4 gap-3">
                {couleursPredefinies.map((item) => (
                  <button
                    key={item.couleur}
                    onClick={() => {
                      setCouleurPersonnalisee(item.couleur);
                      customizePrimaryColor(item.couleur);
                    }}
                    className={`aspect-square rounded-lg border-2 transition-all hover:scale-105 ${
                      couleurPersonnalisee === item.couleur
                        ? 'border-gray-900 shadow-lg'
                        : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: item.couleur }}
                    title={item.nom}
                  >
                    {couleurPersonnalisee === item.couleur && (
                      <svg className="w-6 h-6 text-gray-900 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Sélecteur de couleur personnalisée */}
            <div>
              <p className="text-sm text-gray-600 mb-3">Couleur personnalisée</p>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={couleurPersonnalisee}
                  onChange={(e) => setCouleurPersonnalisee(e.target.value)}
                  className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={couleurPersonnalisee}
                  onChange={(e) => setCouleurPersonnalisee(e.target.value)}
                  placeholder="#166064"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
                <button
                  onClick={appliquerCouleurPersonnalisee}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-800 transition-colors"
                >
                  Appliquer
                </button>
              </div>
            </div>
          </div>

          {/* Aperçu */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Aperçu</h3>
            <div className="p-4 border border-gray-200 rounded-lg bg-slate-50">
              <div className="space-y-3">
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-800 transition-colors">
                  Bouton principal
                </button>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    Badge
                  </span>
                  <span className="px-3 py-1 bg-primary/5 text-primary border border-primary rounded-full text-sm">
                    Badge bordé
                  </span>
                </div>
                <p className="text-gray-600">
                  Texte d'exemple avec <span className="text-primary font-medium">couleur principale</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pied de page */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-between">
            <button
              onClick={() => {
                customizePrimaryColor('#166064');
                setCouleurPersonnalisee('#166064');
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Réinitialiser
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-800 transition-colors"
            >
              Terminé
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}