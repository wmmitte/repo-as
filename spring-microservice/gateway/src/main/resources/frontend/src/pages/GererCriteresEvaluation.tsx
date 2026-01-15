import React, { useState, useEffect } from 'react';
import { CheckSquare, Search, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { referentielService } from '@/services/referentielService';
import { DomaineCompetenceDTO, CritereEvaluationDTO, MethodeEvaluationDTO } from '@/types/referentiel.types';

const GererCriteresEvaluation: React.FC = () => {
  const [criteres, setCriteres] = useState<CritereEvaluationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomaine, setSelectedDomaine] = useState<number | null>(null);
  const [domainesCompetence, setDomainesCompetence] = useState<DomaineCompetenceDTO[]>([]);
  const [methodesEvaluation, setMethodesEvaluation] = useState<MethodeEvaluationDTO[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCritere, setEditingCritere] = useState<CritereEvaluationDTO | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [critereToDelete, setCritereToDelete] = useState<{ id: number; libelle: string } | null>(null);

  // Charger les données initiales
  useEffect(() => {
    chargerDonnees();
    chargerDomainesCompetence();
    chargerMethodesEvaluation();
  }, []);

  const chargerDomainesCompetence = async () => {
    try {
      const domaines = await referentielService.getDomainesCompetence();
      setDomainesCompetence(domaines);
    } catch (error) {
      console.error('Erreur lors du chargement des domaines:', error);
    }
  };

  const chargerMethodesEvaluation = async () => {
    try {
      const methodes = await referentielService.getMethodesEvaluation();
      setMethodesEvaluation(methodes);
    } catch (error) {
      console.error('Erreur lors du chargement des méthodes:', error);
    }
  };

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/referentiels/criteres-evaluation');
      const data = await response.json();
      setCriteres(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des données' });
      setCriteres([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrage
  const criteresFiltres = criteres.filter(critere => {
    const matchSearch = !searchTerm ||
      critere.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      critere.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchDomaine = !selectedDomaine || critere.domaineId === selectedDomaine;

    return matchSearch && matchDomaine;
  });

  // CRUD Operations
  const handleCreate = () => {
    setEditingCritere({
      id: 0,
      domaineId: domainesCompetence.length > 0 ? domainesCompetence[0].id : 0,
      code: '',
      libelle: '',
      description: '',
      estActif: true,
      methodeIds: []
    });
    setShowModal(true);
  };

  const handleEdit = (critere: CritereEvaluationDTO) => {
    setEditingCritere({ ...critere });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingCritere) return;

    // Validation
    if (!editingCritere.code || !editingCritere.libelle) {
      setMessage({ type: 'error', text: 'Le code et le libellé sont obligatoires' });
      return;
    }

    if (!editingCritere.domaineId) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner un domaine de compétence' });
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id || '1';

      let response;
      if (!editingCritere.id || editingCritere.id === 0) {
        // Création
        const { id, ...critereData } = editingCritere;
        response = await fetch('/api/referentiels/criteres-evaluation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': userId
          },
          body: JSON.stringify(critereData)
        });
      } else {
        // Mise à jour
        response = await fetch(`/api/referentiels/criteres-evaluation/${editingCritere.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': userId
          },
          body: JSON.stringify(editingCritere)
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      setMessage({
        type: 'success',
        text: editingCritere.id === 0 ? 'Critère créé avec succès' : 'Critère mis à jour avec succès'
      });
      setShowModal(false);
      setEditingCritere(null);
      chargerDonnees();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Erreur lors de la sauvegarde' });
    }
  };

  const handleDelete = (id: number, libelle: string) => {
    setCritereToDelete({ id, libelle });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!critereToDelete) return;

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id || '1';

      const response = await fetch(`/api/referentiels/criteres-evaluation/${critereToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'X-User-Id': userId
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      setMessage({ type: 'success', text: 'Critère supprimé avec succès' });
      setShowDeleteModal(false);
      setCritereToDelete(null);
      chargerDonnees();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
      setShowDeleteModal(false);
      setCritereToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCritereToDelete(null);
  };

  const getDomaineLibelle = (domaineId: number) => {
    const domaine = domainesCompetence.find(d => d.id === domaineId);
    return domaine?.libelle || 'Inconnu';
  };

  const getMethodesLibelles = (methodeIds?: number[]) => {
    if (!methodeIds || methodeIds.length === 0) return [];
    return methodeIds
      .map(id => {
        const methode = methodesEvaluation.find(m => m.id === id);
        return methode ? methode.libelle : null;
      })
      .filter(Boolean) as string[];
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
              <div className="stat-title">Total Critères</div>
              <div className="stat-value text-primary">{criteres.length}</div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Critères Actifs</div>
              <div className="stat-value text-success">
                {criteres.filter(c => c.estActif).length}
              </div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Domaines Couverts</div>
              <div className="stat-value text-accent">
                {new Set(criteres.map(c => c.domaineId)).size}
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
                      placeholder="Rechercher un critère..."
                      className="input input-bordered w-full pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Filtre Domaine */}
              <div className="form-control w-full md:w-64">
                <select
                  className="select select-bordered"
                  value={selectedDomaine || ''}
                  onChange={(e) => setSelectedDomaine(e.target.value ? parseInt(e.target.value) : null)}
                >
                  <option value="">Tous les domaines</option>
                  {domainesCompetence.map(domaine => (
                    <option key={domaine.id} value={domaine.id}>{domaine.libelle}</option>
                  ))}
                </select>
              </div>

              {/* Bouton Créer */}
              <button onClick={handleCreate} className="btn btn-primary gap-2">
                <Plus className="w-5 h-5" />
                Nouveau Critère
              </button>
            </div>
          </div>
        </div>

        {/* Tableau des critères */}
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
                      <th className="hidden lg:table-cell">Domaine</th>
                      <th className="hidden xl:table-cell">Méthodes</th>
                      <th className="w-24">Statut</th>
                      <th className="w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {criteresFiltres.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-gray-500">
                          <CheckSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p>Aucun critère trouvé</p>
                        </td>
                      </tr>
                    ) : (
                      criteresFiltres.map(critere => (
                        <tr key={critere.id}>
                          <td className="font-mono text-sm font-semibold">{critere.code}</td>
                          <td className="font-medium">{critere.libelle}</td>
                          <td className="hidden md:table-cell">
                            <div className="text-sm text-gray-600 truncate max-w-md">
                              {critere.description || '-'}
                            </div>
                          </td>
                          <td className="hidden lg:table-cell">
                            <span
                              className="badge badge-secondary max-w-[150px] truncate"
                              title={getDomaineLibelle(critere.domaineId)}
                            >
                              {getDomaineLibelle(critere.domaineId)}
                            </span>
                          </td>
                          <td className="hidden xl:table-cell">
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {getMethodesLibelles(critere.methodeIds).length > 0 ? (
                                getMethodesLibelles(critere.methodeIds).slice(0, 2).map((libelle, index) => (
                                  <span
                                    key={index}
                                    className="badge badge-sm badge-outline truncate max-w-[90px]"
                                    title={libelle}
                                  >
                                    {libelle}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-gray-500">Aucune</span>
                              )}
                              {getMethodesLibelles(critere.methodeIds).length > 2 && (
                                <span
                                  className="badge badge-sm badge-ghost"
                                  title={getMethodesLibelles(critere.methodeIds).slice(2).join(', ')}
                                >
                                  +{getMethodesLibelles(critere.methodeIds).length - 2}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            {critere.estActif ? (
                              <span className="badge badge-success">Actif</span>
                            ) : (
                              <span className="badge badge-error">Inactif</span>
                            )}
                          </td>
                          <td>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(critere)}
                                className="btn btn-ghost btn-sm"
                                title="Modifier"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(critere.id, critere.libelle)}
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
      {showModal && editingCritere && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">
              {editingCritere.id === 0 ? 'Nouveau Critère d\'Évaluation' : 'Modifier le Critère'}
            </h3>

            <div className="space-y-4">
              {/* Domaine de compétence */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Domaine de Compétence *</span>
                </label>
                <select
                  className="select select-bordered"
                  value={editingCritere.domaineId}
                  onChange={(e) => setEditingCritere({
                    ...editingCritere,
                    domaineId: parseInt(e.target.value)
                  })}
                  required
                >
                  <option value="">-- Sélectionner --</option>
                  {domainesCompetence.map(domaine => (
                    <option key={domaine.id} value={domaine.id}>
                      {domaine.libelle}
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
                    value={editingCritere.code}
                    onChange={(e) => setEditingCritere({
                      ...editingCritere,
                      code: e.target.value.toUpperCase()
                    })}
                    placeholder="Ex: QUAL_CODE"
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
                    value={editingCritere.libelle}
                    onChange={(e) => setEditingCritere({
                      ...editingCritere,
                      libelle: e.target.value
                    })}
                    placeholder="Ex: Qualité du code"
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
                  value={editingCritere.description || ''}
                  onChange={(e) => setEditingCritere({
                    ...editingCritere,
                    description: e.target.value
                  })}
                  placeholder="Description détaillée du critère..."
                />
              </div>

              {/* Méthodes d'évaluation */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Méthodes d'Évaluation</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4 border border-base-300 rounded-lg max-h-48 overflow-y-auto">
                  {methodesEvaluation.length === 0 ? (
                    <p className="text-sm text-gray-500 col-span-2">Aucune méthode disponible</p>
                  ) : (
                    methodesEvaluation.map(methode => (
                      <label key={methode.id} className="label cursor-pointer justify-start gap-2">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          checked={editingCritere.methodeIds?.includes(methode.id) || false}
                          onChange={(e) => {
                            const currentIds = editingCritere.methodeIds || [];
                            const newIds = e.target.checked
                              ? [...currentIds, methode.id]
                              : currentIds.filter(id => id !== methode.id);
                            setEditingCritere({
                              ...editingCritere,
                              methodeIds: newIds
                            });
                          }}
                        />
                        <span className="label-text text-sm">
                          {methode.libelle}
                          <span className="text-xs text-gray-500 ml-1">({methode.typeMethode})</span>
                        </span>
                      </label>
                    ))
                  )}
                </div>
                <label className="label">
                  <span className="label-text-alt text-gray-500">
                    Sélectionnez une ou plusieurs méthodes d'évaluation pour ce critère
                  </span>
                </label>
              </div>

              {/* Statut Actif */}
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-4">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={editingCritere.estActif}
                    onChange={(e) => setEditingCritere({
                      ...editingCritere,
                      estActif: e.target.checked
                    })}
                  />
                  <span className="label-text font-semibold">Critère actif</span>
                </label>
              </div>
            </div>

            <div className="modal-action">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingCritere(null);
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
      {showDeleteModal && critereToDelete && (
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
              Êtes-vous sûr de vouloir supprimer le critère <strong className="text-error">"{critereToDelete.libelle}"</strong> ?
            </p>
            <p className="text-sm text-gray-500">
              Le critère sera désactivé et ne sera plus visible.
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

export default GererCriteresEvaluation;
