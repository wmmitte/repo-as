import React, { useState, useEffect } from 'react';
import { Microscope, Search, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { MethodeEvaluationDTO } from '@/types/referentiel.types';

const TYPE_METHODES = [
  { value: 'THEORIQUE', label: 'Théorique' },
  { value: 'PRATIQUE', label: 'Pratique' },
  { value: 'COMPORTEMENTAL', label: 'Comportemental' },
  { value: 'INTEGRE', label: 'Intégré' }
];

const GererMethodesEvaluation: React.FC = () => {
  const [methodes, setMethodes] = useState<MethodeEvaluationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingMethode, setEditingMethode] = useState<MethodeEvaluationDTO | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [methodeToDelete, setMethodeToDelete] = useState<{ id: number; libelle: string } | null>(null);

  // Charger les données initiales
  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/referentiels/methodes-evaluation');
      const data = await response.json();
      setMethodes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des données' });
      setMethodes([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrage
  const methodesFiltrees = methodes.filter(methode => {
    const matchSearch = !searchTerm ||
      methode.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      methode.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchType = !selectedType || methode.typeMethode === selectedType;

    return matchSearch && matchType;
  });

  // CRUD Operations
  const handleCreate = () => {
    setEditingMethode({
      id: 0,
      code: '',
      libelle: '',
      description: '',
      typeMethode: 'PRATIQUE',
      estActif: true
    });
    setShowModal(true);
  };

  const handleEdit = (methode: MethodeEvaluationDTO) => {
    setEditingMethode({ ...methode });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingMethode) return;

    // Validation
    if (!editingMethode.code || !editingMethode.libelle) {
      setMessage({ type: 'error', text: 'Le code et le libellé sont obligatoires' });
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id || '1';

      let response;
      if (!editingMethode.id || editingMethode.id === 0) {
        // Création
        const { id, ...methodeData } = editingMethode;
        response = await fetch('/api/referentiels/methodes-evaluation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': userId
          },
          body: JSON.stringify(methodeData)
        });
      } else {
        // Mise à jour
        response = await fetch(`/api/referentiels/methodes-evaluation/${editingMethode.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': userId
          },
          body: JSON.stringify(editingMethode)
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      setMessage({
        type: 'success',
        text: editingMethode.id === 0 ? 'Méthode créée avec succès' : 'Méthode mise à jour avec succès'
      });
      setShowModal(false);
      setEditingMethode(null);
      chargerDonnees();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Erreur lors de la sauvegarde' });
    }
  };

  const handleDelete = (id: number, libelle: string) => {
    setMethodeToDelete({ id, libelle });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!methodeToDelete) return;

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id || '1';

      const response = await fetch(`/api/referentiels/methodes-evaluation/${methodeToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'X-User-Id': userId
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      setMessage({ type: 'success', text: 'Méthode supprimée avec succès' });
      setShowDeleteModal(false);
      setMethodeToDelete(null);
      chargerDonnees();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
      setShowDeleteModal(false);
      setMethodeToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setMethodeToDelete(null);
  };

  const getTypeLibelle = (typeMethode: string) => {
    const type = TYPE_METHODES.find(t => t.value === typeMethode);
    return type?.label || typeMethode;
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Message de feedback */}
        {message && (
          <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mb-6`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="btn btn-ghost btn-sm">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Total Méthodes</div>
              <div className="stat-value text-primary">{methodes.length}</div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Méthodes Actives</div>
              <div className="stat-value text-success">
                {methodes.filter(m => m.estActif).length}
              </div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Types Différents</div>
              <div className="stat-value text-accent">
                {new Set(methodes.map(m => m.typeMethode)).size}
              </div>
            </div>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Recherche */}
              <div className="flex-1">
                <div className="form-control">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Rechercher une méthode..."
                      className="input input-bordered w-full pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Filtre Type */}
              <div className="form-control w-full md:w-48">
                <select
                  className="select select-bordered"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="">Tous les types</option>
                  {TYPE_METHODES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Bouton Créer */}
              <button onClick={handleCreate} className="btn btn-primary gap-2">
                <Plus className="w-5 h-5" />
                Nouvelle Méthode
              </button>
            </div>
          </div>
        </div>

        {/* Tableau des méthodes */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body p-0">
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th className="w-24">Code</th>
                      <th>Libellé</th>
                      <th className="hidden md:table-cell">Description</th>
                      <th className="hidden lg:table-cell">Type</th>
                      <th className="w-24">Statut</th>
                      <th className="w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {methodesFiltrees.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-gray-500">
                          <Microscope className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p>Aucune méthode trouvée</p>
                        </td>
                      </tr>
                    ) : (
                      methodesFiltrees.map(methode => (
                        <tr key={methode.id}>
                          <td className="font-mono text-sm font-semibold">{methode.code}</td>
                          <td className="font-medium">{methode.libelle}</td>
                          <td className="hidden md:table-cell">
                            <div className="text-sm text-gray-600 truncate max-w-md">
                              {methode.description || '-'}
                            </div>
                          </td>
                          <td className="hidden lg:table-cell">
                            <span className="badge badge-info">
                              {getTypeLibelle(methode.typeMethode)}
                            </span>
                          </td>
                          <td>
                            {methode.estActif ? (
                              <span className="badge badge-success">Actif</span>
                            ) : (
                              <span className="badge badge-error">Inactif</span>
                            )}
                          </td>
                          <td>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(methode)}
                                className="btn btn-ghost btn-sm"
                                title="Modifier"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(methode.id, methode.libelle)}
                                className="btn btn-ghost btn-sm text-error"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de création/édition */}
      {showModal && editingMethode && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">
              {editingMethode.id === 0 ? 'Nouvelle Méthode d\'Évaluation' : 'Modifier la Méthode'}
            </h3>

            <div className="space-y-4">
              {/* Type de méthode */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Type de Méthode *</span>
                </label>
                <select
                  className="select select-bordered"
                  value={editingMethode.typeMethode}
                  onChange={(e) => setEditingMethode({
                    ...editingMethode,
                    typeMethode: e.target.value
                  })}
                  required
                >
                  {TYPE_METHODES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Code et Libellé */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Code *</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={editingMethode.code}
                    onChange={(e) => setEditingMethode({
                      ...editingMethode,
                      code: e.target.value.toUpperCase()
                    })}
                    placeholder="Ex: QCM"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Libellé *</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={editingMethode.libelle}
                    onChange={(e) => setEditingMethode({
                      ...editingMethode,
                      libelle: e.target.value
                    })}
                    placeholder="Ex: Questionnaire à choix multiples"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24"
                  value={editingMethode.description || ''}
                  onChange={(e) => setEditingMethode({
                    ...editingMethode,
                    description: e.target.value
                  })}
                  placeholder="Description détaillée de la méthode..."
                />
              </div>

              {/* Statut Actif */}
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-4">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={editingMethode.estActif}
                    onChange={(e) => setEditingMethode({
                      ...editingMethode,
                      estActif: e.target.checked
                    })}
                  />
                  <span className="label-text font-semibold">Méthode active</span>
                </label>
              </div>
            </div>

            <div className="modal-action">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingMethode(null);
                }}
                className="btn btn-ghost"
              >
                Annuler
              </button>
              <button onClick={handleSave} className="btn btn-primary gap-2">
                <Save className="w-4 h-4" />
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && methodeToDelete && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Confirmer la suppression</h3>
            <div className="alert alert-warning mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Cette action est irréversible !</span>
            </div>
            <p className="py-4">
              Êtes-vous sûr de vouloir supprimer la méthode <strong className="text-error">"{methodeToDelete.libelle}"</strong> ?
            </p>
            <p className="text-sm text-gray-500">
              La méthode sera désactivée et ne sera plus visible.
            </p>
            <div className="modal-action">
              <button onClick={cancelDelete} className="btn btn-ghost">
                Annuler
              </button>
              <button onClick={confirmDelete} className="btn btn-error gap-2">
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GererMethodesEvaluation;
