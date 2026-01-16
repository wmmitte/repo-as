import { useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Bell, Settings, UserCircle, Mail } from 'lucide-react';
import { useHeader } from '@/contexts/HeaderContext';
import { useAuth } from '@/context/AuthContext';
import { contactService } from '@/services/contactService';

export default function Header() {
  const { config } = useHeader();
  const {
    title,
    actions,
    tabs,
    activeTab,
    onTabChange
  } = config;
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [nombreMessagesNonLus, setNombreMessagesNonLus] = useState(0);

  // Charger le nombre de messages non lus
  useEffect(() => {
    if (isAuthenticated) {
      chargerNombreMessagesNonLus();
      // Rafraîchir toutes les 30 secondes
      const interval = setInterval(chargerNombreMessagesNonLus, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const chargerNombreMessagesNonLus = async () => {
    try {
      const count = await contactService.compterDemandesNonLues();
      setNombreMessagesNonLus(count);
    } catch (error) {
      // Silencieux en cas d'erreur
    }
  };

  // Déterminer le titre en fonction de la route si non fourni
  const getPageTitle = () => {
    if (title) return title;

    const path = location.pathname;
    if (path === '/') return 'Aperçu';
    if (path === '/explorer') return 'Explorer';
    if (path === '/rechercher') return 'Rechercher des Expertises';
    if (path.startsWith('/expertise-profil/')) return 'Profil d\'Expertise';
    if (path === '/suivis') return 'Suivis';
    if (path === '/profil') return 'Mon Profil';
    if (path === '/mon-compte') return 'Mon Compte';
    if (path === '/expertise') return 'Mon Expertise';
    if (path === '/competences/certifications') return 'Certifications';
    if (path === '/competences/localisations') return 'Localisations';
    if (path === '/competences/domaines-metier') return 'Domaines Métier';
    if (path === '/competences/criteres-evaluation') return 'Critères d\'Évaluation';
    if (path === '/competences/methodes-evaluation') return 'Méthodes d\'Évaluation';
    if (path === '/competences') return 'Référentiel de Compétences';
    if (path === '/projets') return 'Mes Projets';
    if (path === '/messages') return 'Messagerie';
    if (path === '/plus') return 'Plus';
    if (path.startsWith('/expert/')) return 'Détail Expert';
    return 'PITM';
  };


  return (
    <header className="sticky top-0 bg-white border-b border-slate-200 z-40">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Titre de la page */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
          </div>

          {/* Actions personnalisées et icônes - toujours à droite */}
          <div className="flex items-center gap-4">
          {/* Actions personnalisées */}
          {actions}

          {/* Icônes d'action */}
          {isAuthenticated && (
            <>
              {/* Messagerie */}
              <Link
                to="/messages"
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative"
                title="Messagerie"
              >
                <Mail size={24} className="text-gray-600 hover:text-gray-800" />
                {nombreMessagesNonLus > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-error text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                    {nombreMessagesNonLus > 9 ? '9+' : nombreMessagesNonLus}
                  </span>
                )}
              </Link>

              {/* Mon Compte */}
              <Link to="/mon-compte" className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Mon Compte">
                <UserCircle size={24} className="text-gray-600 hover:text-gray-800" />
              </Link>
            </>
          )}

          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative">
            <Bell size={24} className="text-gray-600 hover:text-gray-800" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
          </button>

          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <Settings size={24} className="text-gray-600 hover:text-gray-800" />
          </button>
        </div>
        </div>
      </div>

      {/* Onglets (si fournis) */}
      {tabs && tabs.length > 0 && (
        <div className="border-t border-slate-200">
          <div className="flex gap-1 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className={`px-6 py-3 font-medium text-sm transition-all relative
                  ${activeTab === tab.id
                    ? 'text-primary'
                    : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
