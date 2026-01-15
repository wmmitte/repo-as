import { useState } from 'react';
import { Projet, Exigence } from '@/types/projet.types';
import Button from '@/components/ui/Button';

interface FormulaireCreationProjetProps {
  onSubmit: (projet: Omit<Projet, 'id' | 'dateCreation' | 'progression' | 'statut' | 'taches'>) => void;
  onCancel: () => void;
  chargement?: boolean;
}

export default function FormulaireCreationProjet({ 
  onSubmit, 
  onCancel, 
  chargement = false 
}: FormulaireCreationProjetProps) {
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [duree, setDuree] = useState<number>(30);
  const [budget, setBudget] = useState<number>(10000);
  const [exigences, setExigences] = useState<Exigence[]>([
    { id: '1', description: '' }
  ]);

  const ajouterExigence = () => {
    const nouvelleExigence: Exigence = {
      id: Date.now().toString(),
      description: ''
    };
    setExigences([...exigences, nouvelleExigence]);
  };

  const supprimerExigence = (id: string) => {
    if (exigences.length > 1) {
      setExigences(exigences.filter(req => req.id !== id));
    }
  };

  const mettreAJourExigence = (id: string, description: string) => {
    setExigences(exigences.map(req => 
      req.id === id ? { ...req, description } : req
    ));
  };

  const gererSoumission = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nom.trim() || !description.trim()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const exigencesValides = exigences.filter(req => req.description.trim() !== '');
    
    const nouveauProjet = {
      nom: nom.trim(),
      description: description.trim(),
      duree,
      budget,
      exigences: exigencesValides,
      proprietaireId: 'utilisateur_actuel'
    };

    onSubmit(nouveauProjet);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Créer un nouveau projet</h2>
        <p className="text-gray-600">Définissez les caractéristiques de votre projet</p>
      </div>

      <form onSubmit={gererSoumission} className="space-y-6">
        {/* Nom du projet */}
        <div>
          <label htmlFor="nom" className="block text-sm font-medium text-gray-800 mb-2">
            Nom du projet *
          </label>
          <input
            type="text"
            id="nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-lg 
                     text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 
                     focus:ring-primary focus:border-transparent"
            placeholder="Ex: Application Mobile E-commerce"
            required
            disabled={chargement}
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-800 mb-2">
            Description du projet *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-lg 
                     text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 
                     focus:ring-primary focus:border-transparent resize-none"
            placeholder="Décrivez l'objectif et le contexte de votre projet..."
            required
            disabled={chargement}
          />
        </div>

        {/* Durée et Budget */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="duree" className="block text-sm font-medium text-gray-800 mb-2">
              Durée estimée (jours)
            </label>
            <input
              type="number"
              id="duree"
              value={duree}
              onChange={(e) => setDuree(parseInt(e.target.value) || 30)}
              min="1"
              max="365"
              className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-lg 
                       text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary 
                       focus:border-transparent"
              disabled={chargement}
            />
          </div>

          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-800 mb-2">
              Budget estimatif (€)
            </label>
            <input
              type="number"
              id="budget"
              value={budget}
              onChange={(e) => setBudget(parseInt(e.target.value) || 10000)}
              min="100"
              step="100"
              className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-lg 
                       text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary 
                       focus:border-transparent"
              disabled={chargement}
            />
          </div>
        </div>

        {/* Exigences du projet */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-800">
              Exigences du projet
            </label>
            <button
              type="button"
              onClick={ajouterExigence}
              className="text-primary hover:text-primary-dark text-sm font-medium 
                       flex items-center gap-1"
              disabled={chargement}
            >
              <span>+</span> Ajouter une exigence
            </button>
          </div>
          
          <div className="space-y-3">
            {exigences.map((exigence, index) => (
              <div key={exigence.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={exigence.description}
                    onChange={(e) => mettreAJourExigence(exigence.id, e.target.value)}
                    className="w-full px-4 py-3 bg-slate-100 border border-slate-200 
                             rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none 
                             focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={`Exigence ${index + 1}`}
                    disabled={chargement}
                  />
                </div>
                {exigences.length > 1 && (
                  <button
                    type="button"
                    onClick={() => supprimerExigence(exigence.id)}
                    className="text-primary hover:text-primary/70 p-2"
                    disabled={chargement}
                  >
                    <span className="sr-only">Supprimer</span>
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={chargement}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={chargement || !nom.trim() || !description.trim()}
          >
            {chargement ? 'Création...' : 'Créer le projet'}
          </Button>
        </div>
      </form>
    </div>
  );
}