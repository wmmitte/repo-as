import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormulaireCreationProjet from '@/components/projet/FormulaireCreationProjet';
import { projetService } from '@/services/projet.service';
import { Projet } from '@/types/projet.types';

export default function CreerProjetPage() {
  const navigate = useNavigate();
  const [chargement, setChargement] = useState(false);

  const gererCreationProjet = async (donneesProjet: Omit<Projet, 'id' | 'dateCreation' | 'progression' | 'statut' | 'taches'>) => {
    setChargement(true);
    
    try {
      const nouveauProjet = await projetService.creerProjet(donneesProjet);
      console.log('Projet créé avec succès:', nouveauProjet);
      
      // Rediriger vers la page de détail du projet
      navigate(`/projets/${nouveauProjet.id}`);
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
      alert('Une erreur est survenue lors de la création du projet');
    } finally {
      setChargement(false);
    }
  };

  const gererAnnulation = () => {
    navigate('/projets');
  };

  return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
          <FormulaireCreationProjet
            onSubmit={gererCreationProjet}
            onCancel={gererAnnulation}
            chargement={chargement}
          />
        </div>
      </div>
  );
}