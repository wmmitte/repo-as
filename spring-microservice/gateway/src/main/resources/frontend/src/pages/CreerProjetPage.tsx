import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FolderPlus,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Globe,
  Lock,
  AlertCircle
} from 'lucide-react';
import { projetService } from '@/services/projet.service';
import { CreerProjetRequest, VisibiliteProjet } from '@/types/projet.types';

interface ExigenceTemp {
  id: number;
  description: string;
}

export default function CreerProjetPage() {
  const navigate = useNavigate();
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const [formulaire, setFormulaire] = useState({
    nom: '',
    description: '',
    budget: '',
    devise: 'FCFA',
    visibilite: 'PUBLIC' as VisibiliteProjet,
    dateDebutPrevue: '',
    dateFinPrevue: '',
  });

  const [exigences, setExigences] = useState<ExigenceTemp[]>([]);
  const [nouvelleExigence, setNouvelleExigence] = useState('');

  const ajouterExigence = () => {
    if (!nouvelleExigence.trim()) return;
    setExigences([
      ...exigences,
      { id: Date.now(), description: nouvelleExigence.trim() }
    ]);
    setNouvelleExigence('');
  };

  const supprimerExigence = (id: number) => {
    setExigences(exigences.filter(e => e.id !== id));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormulaire(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur(null);

    if (!formulaire.nom.trim()) {
      setErreur('Le nom du projet est requis');
      return;
    }

    setChargement(true);

    try {
      const request: CreerProjetRequest = {
        nom: formulaire.nom.trim(),
        description: formulaire.description.trim() || undefined,
        budget: formulaire.budget ? parseFloat(formulaire.budget) : undefined,
        devise: formulaire.devise,
        visibilite: formulaire.visibilite,
        dateDebutPrevue: formulaire.dateDebutPrevue || undefined,
        dateFinPrevue: formulaire.dateFinPrevue || undefined,
        exigences: exigences.length > 0 ? exigences.map(e => e.description) : undefined,
      };

      const nouveauProjet = await projetService.creerProjet(request);
      navigate(`/projets/${nouveauProjet.id}`);
    } catch (error) {
      console.error('Erreur création projet:', error);
      setErreur('Une erreur est survenue lors de la création du projet');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/projets')} className="btn btn-ghost btn-sm btn-circle">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <FolderPlus className="text-primary" size={24} />
              Nouveau projet
            </h1>
            <p className="text-sm text-base-content/60">
              Créez un projet et commencez à collaborer
            </p>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {erreur && (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              <span>{erreur}</span>
            </div>
          )}

          {/* Informations de base */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-4">
              <h3 className="font-semibold mb-3">Informations générales</h3>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text">Nom du projet *</span>
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formulaire.nom}
                  onChange={handleChange}
                  placeholder="Ex: Refonte site e-commerce"
                  className="input input-bordered input-sm"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  name="description"
                  value={formulaire.description}
                  onChange={handleChange}
                  placeholder="Décrivez votre projet en quelques phrases..."
                  className="textarea textarea-bordered textarea-sm"
                  rows={3}
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text">Visibilité</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="visibilite"
                      value="PUBLIC"
                      checked={formulaire.visibilite === 'PUBLIC'}
                      onChange={handleChange}
                      className="radio radio-primary radio-sm"
                    />
                    <Globe size={16} />
                    <span className="text-sm">Public</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="visibilite"
                      value="PRIVE"
                      checked={formulaire.visibilite === 'PRIVE'}
                      onChange={handleChange}
                      className="radio radio-primary radio-sm"
                    />
                    <Lock size={16} />
                    <span className="text-sm">Privé</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Budget et dates */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-4">
              <h3 className="font-semibold mb-3">Budget et planning</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text flex items-center gap-1">
                      <DollarSign size={14} />
                      Budget estimé
                    </span>
                  </label>
                  <div className="join">
                    <input
                      type="number"
                      name="budget"
                      value={formulaire.budget}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      className="input input-bordered input-sm join-item flex-1"
                    />
                    <select
                      name="devise"
                      value={formulaire.devise}
                      onChange={handleChange}
                      className="select select-bordered select-sm join-item w-24"
                    >
                      <option value="FCFA">FCFA</option>
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text flex items-center gap-1">
                      <Calendar size={14} />
                      Date de début
                    </span>
                  </label>
                  <input
                    type="date"
                    name="dateDebutPrevue"
                    value={formulaire.dateDebutPrevue}
                    onChange={handleChange}
                    className="input input-bordered input-sm"
                  />
                </div>

                <div className="form-control sm:col-start-2">
                  <label className="label py-1">
                    <span className="label-text flex items-center gap-1">
                      <Calendar size={14} />
                      Date de fin prévue
                    </span>
                  </label>
                  <input
                    type="date"
                    name="dateFinPrevue"
                    value={formulaire.dateFinPrevue}
                    onChange={handleChange}
                    className="input input-bordered input-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Exigences */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-4">
              <h3 className="font-semibold mb-3">Exigences du projet</h3>
              <p className="text-sm text-base-content/60 mb-3">
                Listez les conditions ou critères importants pour ce projet
              </p>

              {/* Liste des exigences */}
              {exigences.length > 0 && (
                <ul className="space-y-2 mb-3">
                  {exigences.map((exigence) => (
                    <li key={exigence.id} className="flex items-center gap-2 bg-base-200 p-2 rounded">
                      <span className="flex-1 text-sm">{exigence.description}</span>
                      <button
                        type="button"
                        onClick={() => supprimerExigence(exigence.id)}
                        className="btn btn-ghost btn-xs btn-circle text-error"
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Ajouter exigence */}
              <div className="join w-full">
                <input
                  type="text"
                  value={nouvelleExigence}
                  onChange={(e) => setNouvelleExigence(e.target.value)}
                  placeholder="Ex: Expérience en React requise"
                  className="input input-bordered input-sm join-item flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), ajouterExigence())}
                />
                <button
                  type="button"
                  onClick={ajouterExigence}
                  className="btn btn-sm btn-ghost join-item"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate('/projets')}
              className="btn btn-ghost btn-sm"
              disabled={chargement}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={chargement}
            >
              {chargement ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <>
                  <FolderPlus size={16} />
                  Créer le projet
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
