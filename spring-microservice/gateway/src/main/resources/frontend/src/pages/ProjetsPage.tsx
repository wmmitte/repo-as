import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHeaderConfig } from '@/hooks/useHeaderConfig';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { projetService } from '@/services/projet.service';
import { Projet } from '@/types/projet.types';

export default function ProjetsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('mes-projets');
  const [projets, setProjets] = useState<Projet[]>([]);
  const [chargement, setChargement] = useState(true);

  const tabs = [
    { id: 'mes-projets', label: 'Mes Projets' },
    { id: 'planification', label: 'Planification' },
    { id: 'execution', label: 'Exécution' },
    { id: 'suivi-controle', label: 'Suivi-contrôle' },
    { id: 'amelioration', label: 'Amélioration' },
  ];

  // Configurer le Header avec les onglets
  useHeaderConfig({
    tabs,
    activeTab,
    onTabChange: setActiveTab,
  });

  useEffect(() => {
    const chargerProjets = async () => {
      setChargement(true);
      try {
        const projetsData = await projetService.obtenirProjets();
        setProjets(projetsData);
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
      } finally {
        setChargement(false);
      }
    };

    chargerProjets();
  }, []);

  const obtenirCouleurStatut = (statut: string) => {
    switch (statut) {
      case 'planification':
        return 'bg-primary/20 text-primary';
      case 'execution':
        return 'bg-warning/20 text-warning';
      case 'suivi':
        return 'bg-info/20 text-info';
      case 'termine':
        return 'bg-success/20 text-success';
      case 'suspendu':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-600';
    }
  };

  const obtenirLibelleStatut = (statut: string) => {
    switch (statut) {
      case 'planification':
        return 'Planification';
      case 'execution':
        return 'En exécution';
      case 'suivi':
        return 'Suivi';
      case 'termine':
        return 'Terminé';
      case 'suspendu':
        return 'Suspendu';
      default:
        return statut;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'mes-projets':
        return (
          <div className="space-y-6">
            {/* En-tête avec bouton de création */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Mes Projets</h3>
                <p className="text-gray-600 mt-1">Gérez et suivez vos projets</p>
              </div>
              <Button onClick={() => navigate('/projets/creer')}>
                + Créer un projet
              </Button>
            </div>

            {/* Liste des projets */}
            {chargement ? (
              <div className="flex justify-center py-12">
                <Loader />
              </div>
            ) : projets.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
                <div className="text-gray-600 text-4xl mb-4">📋</div>
                <h4 className="text-lg font-semibold text-gray-700 mb-2">Aucun projet</h4>
                <p className="text-gray-600 mb-6">Créez votre premier projet pour commencer</p>
                <Button onClick={() => navigate('/projets/creer')}>
                  Créer mon premier projet
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projets.map((projet) => (
                  <div 
                    key={projet.id} 
                    className="bg-white border border-slate-200 rounded-xl p-6 hover:border-primary/50 
                             transition-colors cursor-pointer"
                    onClick={() => navigate(`/projets/${projet.id}`)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2">{projet.nom}</h4>
                        <p className="text-gray-600 text-sm line-clamp-2">{projet.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ml-3 ${obtenirCouleurStatut(projet.statut)}`}>
                        {obtenirLibelleStatut(projet.statut)}
                      </span>
                    </div>

                    {/* Progression */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progression</span>
                        <span>{projet.progression}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all" 
                          style={{ width: `${projet.progression}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Métadonnées */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Budget:</span>
                        <span className="text-gray-700">{projet.budget.toLocaleString('fr-FR')} €</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Durée:</span>
                        <span className="text-gray-700">{projet.duree} jours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tâches:</span>
                        <span className="text-gray-700">{projet.taches.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Créé le:</span>
                        <span className="text-gray-700">
                          {new Date(projet.dateCreation).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>

                    {/* Actions rapides */}
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">
                          {projet.exigences.length} exigence{projet.exigences.length > 1 ? 's' : ''}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/projets/${projet.id}`);
                          }}
                          className="text-primary hover:text-primary/80 text-xs font-medium"
                        >
                          Voir détails →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'planification':
        return (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Phase de Planification</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center font-semibold">1</div>
                  <div className="flex-1">
                    <p className="text-gray-800">Définition des objectifs</p>
                    <p className="text-sm text-gray-600">Clarifier la vision et les résultats attendus</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center font-semibold">2</div>
                  <div className="flex-1">
                    <p className="text-gray-800">Analyse des ressources</p>
                    <p className="text-sm text-gray-600">Identifier les compétences et budgets nécessaires</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center font-semibold">3</div>
                  <div className="flex-1">
                    <p className="text-gray-800">Planification des tâches</p>
                    <p className="text-sm text-gray-600">Décomposer en étapes et définir les délais</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'execution':
        return (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Phase d'Exécution</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-100 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Tâches en cours</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-600">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      <span>Développement backend API</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      <span>Design interface utilisateur</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-slate-100 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Tâches terminées</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-600">
                      <span className="w-2 h-2 bg-success rounded-full"></span>
                      <span>Configuration environnement</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <span className="w-2 h-2 bg-success rounded-full"></span>
                      <span>Analyse des besoins</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'suivi-controle':
        return (
          <div className="space-y-4">
            {projets.map((projet) => (
              <div key={projet.id} className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{projet.nom}</h3>
                    <span className={`text-sm px-3 py-1 rounded-full ${obtenirCouleurStatut(projet.statut)}`}>
                      {obtenirLibelleStatut(projet.statut)}
                    </span>
                  </div>
                  <span className="text-gray-600">{projet.progression}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all" 
                    style={{ width: `${projet.progression}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'amelioration':
        return (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Axes d'Amélioration</h3>
              <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-slate-100 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-warning/20 text-warning rounded-lg flex items-center justify-center text-xl">⚡</div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Optimisation des processus</h4>
                    <p className="text-sm text-gray-600">Réduire le temps de développement de 20%</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 bg-slate-100 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-info/20 text-info rounded-lg flex items-center justify-center text-xl">📊</div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Amélioration de la qualité</h4>
                    <p className="text-sm text-gray-600">Augmenter la couverture des tests à 90%</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 bg-slate-100 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-success/20 text-success rounded-lg flex items-center justify-center text-xl">🎯</div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Formation continue</h4>
                    <p className="text-sm text-gray-600">Développer les compétences de l'équipe</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-6xl mx-auto">
          {renderTabContent()}
        </div>
      </div>
  );
}
