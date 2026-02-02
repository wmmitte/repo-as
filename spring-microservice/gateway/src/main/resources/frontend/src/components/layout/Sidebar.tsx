import React, { useState, useEffect } from 'react';
import { Home, Component, Users, Briefcase, MoreHorizontal, ChevronLeft, ChevronRight, ChevronDown, LogOut, LogIn, FileText, MapPin, Award, Search, Inbox, FolderTree, CheckSquare, Microscope, ListTodo, Send } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import ModalConnexion from '../auth/ModalConnexion';
import ThemeCustomizer from '../theme/ThemeCustomizer';
import { useAuth } from '@/context/AuthContext';
import { useCanAccessExpertiseMenu, useCanManageNetwork, useCanManageReferentiels, useCanManageExpertise, useCanAccessDemandesReconnaissance, useCanManageReferentielsManager } from '@/hooks/usePermissions';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { isAuthenticated, logout, user, openAuthModal } = useAuth();
  const { canManage: canManageReferentiels } = useCanManageReferentiels();
  const { canAccess: canAccessExpertise } = useCanAccessExpertiseMenu();
  const { canManage: canManageNetwork } = useCanManageNetwork();
  const { canManage: canManageExpertise } = useCanManageExpertise();
  const { canAccess: canAccessDemandesReconnaissance } = useCanAccessDemandesReconnaissance();
  const { canManage: canManageReferentielsManager } = useCanManageReferentielsManager();
  const [modalConnexionOuvert, setModalConnexionOuvert] = useState(false);
  const [themeCustomizerOuvert, setThemeCustomizerOuvert] = useState(false);
  const [expertiseMenuOpen, setExpertiseMenuOpen] = useState(false);

  // Log pour déboguer l'état d'authentification et les permissions
  useEffect(() => {
    /*console.log('🔍 [SIDEBAR] État authentification:', { isAuthenticated, user });
    console.log('🔑 [SIDEBAR] Permissions:', {
      canManageReferentiels,
      canAccessExpertise,
      canManageNetwork,
      canManageExpertise,
      canAccessDemandesReconnaissance,
      canManageReferentielsManager
    });*/
  }, [isAuthenticated, user, canManageReferentiels, canAccessExpertise, canManageNetwork, canManageExpertise, canAccessDemandesReconnaissance, canManageReferentielsManager]);

  const handleAuthButtonClick = async () => {
    if (isAuthenticated) {
      // Si l'utilisateur est connecté, on le déconnecte
      await logout();
    } else {
      // Si l'utilisateur n'est pas connecté, on ouvre la modal
      setModalConnexionOuvert(true);
    }
  };

  const handleMenuClick = (e: React.MouseEvent, path: string, requiresAuth: boolean = false) => {
    // Si la page nécessite une authentification et que l'utilisateur n'est pas connecté
    if (requiresAuth && !isAuthenticated) {
      e.preventDefault(); // Empêcher la navigation
      openAuthModal(path); // Ouvrir le modal avec l'URL de destination
      return;
    }
    // Sinon, laisser la navigation normale se faire
  };

  // Filtrer les menus selon les permissions
  const menuItems = [
    { icon: Home, label: 'Aperçu', path: '/' },
   // { icon: Compass, label: 'Explorer', path: '/explorer' },
    { icon: Search, label: 'Rechercher', path: '/rechercher' },
    // Mon réseau - Réservé aux Experts uniquement
    ...(canManageNetwork ? [{ icon: Users, label: 'Mon réseau', path: '/reseau' }] : []),
    { icon: Briefcase, label: 'Projets', path: '/projets' },
    // Mes tâches et candidatures - Réservé aux utilisateurs connectés
    ...(isAuthenticated ? [
      { icon: ListTodo, label: 'Mes tâches', path: '/mes-taches', requiresAuth: true },
      { icon: Send, label: 'Mes candidatures', path: '/mes-candidatures', requiresAuth: true },
    ] : []),
    { icon: MoreHorizontal, label: 'Plus', path: '/plus' },
  ];

  const expertiseSubMenuItems = [
    { icon: FileText, label: 'Mon expertise', path: '/expertise', expertOnly: true },
    { icon: Component, label: 'Compétences', path: '/competences', managerOnly: true },
    { icon: MapPin, label: 'Localisations', path: '/competences/localisations', managerOnly: true },
    { icon: Award, label: 'Certifications', path: '/competences/certifications', managerOnly: true },
    { icon: Inbox, label: 'Demande de reconnaissance', path: '/demandes-reconnaissance', dividerBefore: true, managerOrRhOnly: true },
    { icon: FolderTree, label: 'Domaine métier', path: '/competences/domaines-metier', managerOnly: true },
    { icon: CheckSquare, label: 'Critère d\'évaluation', path: '/competences/criteres-evaluation', managerOnly: true },
    { icon: Microscope, label: 'Méthode d\'évaluation', path: '/competences/methodes-evaluation', managerOnly: true },
  ];

  // Filtrer les items du sous-menu Expertise en fonction des permissions
  const filteredExpertiseSubMenuItems = expertiseSubMenuItems.filter(item => {
    // Si l'item nécessite les permissions Expert, vérifier que l'utilisateur les a
    if (item.expertOnly) {
      return canManageExpertise;
    }
    // Si l'item nécessite les permissions Manager uniquement, vérifier que l'utilisateur les a
    if (item.managerOnly) {
      return canManageReferentielsManager;
    }
    // Si l'item nécessite les permissions Manager ou RH, vérifier que l'utilisateur les a
    if (item.managerOrRhOnly) {
      return canAccessDemandesReconnaissance;
    }
    // Sinon, afficher l'item par défaut
    return true;
  });

  const isActive = (path: string) => location.pathname === path;
  const isExpertiseActive = expertiseSubMenuItems.some(item => location.pathname.startsWith(item.path));

  // Ouvrir automatiquement le menu Expertise si on est sur une page d'expertise
  useEffect(() => {
    if (isExpertiseActive && !collapsed) {
      setExpertiseMenuOpen(true);
    }
  }, [isExpertiseActive, collapsed]);

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200 flex flex-col z-50 transition-all duration-300 shadow-lg ${
      collapsed ? 'w-20' : 'w-64'
    }`}>      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-8 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary-800 shadow-lg transition-all duration-200 z-10"
        aria-label={collapsed ? 'Afficher le sidebar' : 'Masquer le sidebar'}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
      {/* Logo */}
      <div className="px-6 py-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          {!collapsed && <span className="text-xl font-bold text-primary-900">PITM</span>}
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          // Afficher le menu Expertise juste avant Projets (uniquement pour les Experts)
          if (item.label === 'Projets') {
            return (
              <React.Fragment key="expertise-and-projets">
                {/* Menu Expertise avec sous-menus - Réservé aux Experts uniquement */}
                {canAccessExpertise && (
                  <div className="mb-1">
                    <button
                      onClick={() => !collapsed && setExpertiseMenuOpen(!expertiseMenuOpen)}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${
                        collapsed ? 'justify-center' : 'justify-between'
                      } ${isExpertiseActive
                          ? 'text-primary-900 font-semibold'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      title={collapsed ? 'Expertise' : undefined}
                    >
                      <div className="flex items-center gap-4">
                        <Component size={24} strokeWidth={isExpertiseActive ? 2.5 : 2} />
                        {!collapsed && <span className="text-base">Expertise</span>}
                      </div>
                      {!collapsed && (
                        <ChevronDown
                          size={18}
                          className={`transition-transform duration-200 ${expertiseMenuOpen ? 'rotate-180' : ''}`}
                        />
                      )}
                    </button>

                    {/* Sous-menus */}
                    {!collapsed && expertiseMenuOpen && (
                      <div className="ml-4 mt-1 space-y-1">
                        {filteredExpertiseSubMenuItems.map((subItem) => {
                          const SubIcon = subItem.icon;
                          const subActive = isActive(subItem.path);
                          // Toutes les pages du sous-menu Expertise nécessitent une authentification
                          const requiresAuth = true;

                          return (
                            <React.Fragment key={subItem.path}>
                              {/* Diviseur si nécessaire */}
                              {subItem.dividerBefore && (
                                <div className="border-t border-gray-200 my-2"></div>
                              )}

                              <Link
                                to={subItem.path}
                                onClick={(e) => handleMenuClick(e, subItem.path, requiresAuth)}
                                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                                  subActive
                                    ? 'text-primary-900 font-semibold bg-primary/10'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                  }`}
                              >
                                <SubIcon size={20} strokeWidth={subActive ? 2.5 : 2} />
                                <span className="text-sm">{subItem.label}</span>
                              </Link>
                            </React.Fragment>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Menu Projets */}
                <Link
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg mb-1 transition-all duration-200 ${
                    collapsed ? 'justify-center' : ''
                  } ${active
                      ? 'text-primary-900 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={24} strokeWidth={active ? 2.5 : 2} />
                  {!collapsed && <span className="text-base">{item.label}</span>}
                </Link>
              </React.Fragment>
            );
          }
          
          // Vérifier si cette page nécessite une authentification
          const requiresAuth = item.path === '/reseau' || (item as any).requiresAuth === true;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={(e) => handleMenuClick(e, item.path, requiresAuth)}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg mb-1 transition-all duration-200 ${
                collapsed ? 'justify-center' : ''
              } ${active 
                  ? 'text-primary-900 font-semibold' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={24} strokeWidth={active ? 2.5 : 2} />
              {!collapsed && <span className="text-base">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Connect/Disconnect Button */}
      {!collapsed && (
        <div className="px-6 py-4 space-y-3">
          <button 
            onClick={handleAuthButtonClick}
            className={`w-full font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg flex items-center justify-center gap-2 ${
              isAuthenticated
                ? 'bg-rose-500 hover:bg-rose-600 text-white hover:shadow-rose-400/50'
                : 'bg-primary hover:bg-primary-800 text-white hover:shadow-primary/50'
            }`}
          >
            {isAuthenticated ? (
              <>
                <LogOut size={20} />
                Se déconnecter
              </>
            ) : (
              <>
                <LogIn size={20} />
                Se connecter
              </>
            )}
          </button>
          
          {/* Theme Customizer Button 
          <button 
            onClick={() => setThemeCustomizerOuvert(true)}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-all duration-200"
          >
            <Palette size={18} />
            Personnaliser
          </button>
          */}
        </div>
      )}

      
      {/* Connect/Disconnect Button for collapsed sidebar */}
      {collapsed && (
        <div className="px-3 py-4 space-y-2">
          <button 
            onClick={handleAuthButtonClick}
            className={`w-full flex items-center justify-center font-medium py-3 rounded-lg transition-all duration-200 shadow-lg ${
              isAuthenticated
                ? 'bg-rose-500 hover:bg-rose-600 text-white hover:shadow-rose-400/50'
                : 'bg-primary hover:bg-primary-800 text-white hover:shadow-primary/50'
            }`}
            title={isAuthenticated ? 'Se déconnecter' : 'Se connecter'}
          >
            {isAuthenticated ? <LogOut size={20} /> : <LogIn size={20} />}
          </button>
          
          {/* Theme Customizer 
          <button 
            onClick={() => setThemeCustomizerOuvert(true)}
            className="w-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition-all duration-200"
            title="Personnaliser le thème"
          >
            <Palette size={20} />
          </button>
          */}
        </div>
      )}

      {/* Footer Links */}
      {!collapsed && (
        <div className="px-6 py-4 border-t border-slate-200 space-y-2 text-sm">
          <div className="space-y-1">
            <Link 
              to="/entreprise" 
              className="block text-gray-600 hover:text-primary transition-colors"
            >
              Entreprise
            </Link>
            <Link 
              to="/programme" 
              className="block text-gray-600 hover:text-primary transition-colors"
            >
              Programme
            </Link>
            <Link 
              to="/conditions" 
              className="block text-gray-600 hover:text-primary transition-colors"
            >
              Conditions générales
            </Link>
          </div>
          <div className="text-gray-600 text-xs pt-2">
            © 2025 PITM
          </div>
        </div>
      )}

      {/* Modal de connexion */}
      <ModalConnexion 
        isOpen={modalConnexionOuvert}
        onClose={() => setModalConnexionOuvert(false)}
      />
      
      {/* Theme Customizer Modal */}
      <ThemeCustomizer 
        isOpen={themeCustomizerOuvert}
        onClose={() => setThemeCustomizerOuvert(false)}
      />
    </aside>
  );
}
