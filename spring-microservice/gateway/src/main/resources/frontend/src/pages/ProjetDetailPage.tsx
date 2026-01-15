import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHeaderConfig } from '@/hooks/useHeaderConfig';
import OngletPlanification from '@/components/projet/OngletPlanification';
import OngletExecution from '@/components/projet/OngletExecution';
import OngletSuivi from '@/components/projet/OngletSuivi';
import { projetService } from '@/services/projet.service';
import { Projet } from '@/types/projet.types';
import Loader from '@/components/ui/Loader';

export default function ProjetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('planification');
  const [projet, setProjet] = useState<Projet | null>(null);
  const [chargement, setChargement] = useState(true);

  const tabs = [
    { id: 'planification', label: 'Planification' },
    { id: 'execution', label: 'Exécution' },
    { id: 'suivi', label: 'Suivi du projet' },
  ];

  // Configurer le Header avec les onglets
  useHeaderConfig({
    tabs,
    activeTab,
    onTabChange: setActiveTab,
  });

  useEffect(() => {
    const chargerProjet = async () => {
      if (!id) {
        navigate('/projets');
        return;
      }

      setChargement(true);
      try {
        const projetData = await projetService.obtenirProjet(id);
        if (projetData) {
          setProjet(projetData);
        } else {
          navigate('/projets');
        }
      } catch (error) {
        console.error('Erreur lors du chargement du projet:', error);
        navigate('/projets');
      } finally {
        setChargement(false);
      }
    };

    chargerProjet();
  }, [id, navigate]);

  const mettreAJourProjet = (projetMisAJour: Projet) => {
    setProjet(projetMisAJour);
  };

  const renderTabContent = () => {
    if (!projet) return null;

    switch (activeTab) {
      case 'planification':
        return (
          <OngletPlanification 
            projet={projet} 
            onProjetUpdate={mettreAJourProjet}
          />
        );

      case 'execution':
        return (
          <OngletExecution 
            projet={projet} 
            onProjetUpdate={mettreAJourProjet}
          />
        );

      case 'suivi':
        return (
          <OngletSuivi 
            projet={projet} 
            onProjetUpdate={mettreAJourProjet}
          />
        );

      default:
        return null;
    }
  };

  if (chargement) {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader />
        </div>
    );
  }

  if (!projet) {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Projet non trouvé</h2>
            <button 
              onClick={() => navigate('/projets')}
              className="text-primary hover:text-primary-dark"
            >
              Retour aux projets
            </button>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-slate-50">
        {/* En-tête du projet */}
        <div className="bg-white border-b border-slate-200 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{projet.nom}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Créé le {new Date(projet.dateCreation).toLocaleDateString('fr-FR')}</span>
                  <span>•</span>
                  <span>Budget: {projet.budget.toLocaleString('fr-FR')} €</span>
                  <span>•</span>
                  <span>Durée: {projet.duree} jours</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 mb-1">Progression</div>
                <div className="text-2xl font-bold text-primary">{projet.progression}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu des onglets */}
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            {renderTabContent()}
          </div>
        </div>
      </div>
  );
}