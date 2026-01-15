import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, ChevronDown, Folder } from 'lucide-react';

interface DomaineMetier {
  id: number;
  code: string;
  libelle: string;
  description: string;
  icone: string;
  couleur: string;
  popularite: number;
  estActif: boolean;
  nombreSousDomaines: number;
}

interface SousDomaineMetier {
  sousDomaineId: number;
  codeSousDomaine: string;
  libelleSousDomaine: string;
  domaineId: number;
  libelleDomaine: string;
  nomComplet: string;
  popularite: number;
}

type EditMode = 'domaine' | 'sousDomaine' | null;

const GererDomainesMetier: React.FC = () => {
  const [domaines, setDomaines] = useState<DomaineMetier[]>([]);
  const [sousDomaines, setSousDomaines] = useState<SousDomaineMetier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDomaines, setExpandedDomaines] = useState<Set<number>>(new Set());

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [editingDomaine, setEditingDomaine] = useState<DomaineMetier | null>(null);
  const [editingSousDomaine, setEditingSousDomaine] = useState<SousDomaineMetier | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'domaine' | 'sousDomaine'; id: number; nom: string } | null>(null);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const showInactive = false; // Constante pour affichage futur des éléments inactifs

  // Charger les données
  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      const [domainesResponse, sousDomainesResponse] = await Promise.all([
        fetch('/api/domaines-metier').then(r => r.json()),
        fetch('/api/domaines-metier/sous-domaines').then(r => r.json())
      ]);

      setDomaines(Array.isArray(domainesResponse) ? domainesResponse : []);
      setSousDomaines(Array.isArray(sousDomainesResponse) ? sousDomainesResponse : []);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des données' });
    } finally {
      setLoading(false);
    }
  };

  // Recherche
  const rechercherDomaines = async () => {
    if (!searchTerm) {
      chargerDonnees();
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/domaines-metier/recherche?terme=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      setDomaines(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la recherche' });
    } finally {
      setLoading(false);
    }
  };

  // Toggle expand domaine
  const toggleDomaine = (domaineId: number) => {
    const newExpanded = new Set(expandedDomaines);
    if (newExpanded.has(domaineId)) {
      newExpanded.delete(domaineId);
    } else {
      newExpanded.add(domaineId);
    }
    setExpandedDomaines(newExpanded);
  };

  // CRUD Domaine
  const handleCreateDomaine = () => {
    setEditMode('domaine');
    setEditingDomaine({
      id: 0,
      code: '',
      libelle: '',
      description: '',
      icone: '',
      couleur: '#3B82F6',
      popularite: 0,
      estActif: true,
      nombreSousDomaines: 0
    });
    setShowModal(true);
  };

  const handleEditDomaine = (d: DomaineMetier) => {
    setEditMode('domaine');
    setEditingDomaine({ ...d });
    setShowModal(true);
  };

  const handleSaveDomaine = async () => {
    if (!editingDomaine || !editingDomaine.libelle.trim()) {
      setMessage({ type: 'error', text: 'Le libellé du domaine est obligatoire' });
      return;
    }

    if (!editingDomaine.code.trim()) {
      setMessage({ type: 'error', text: 'Le code du domaine est obligatoire' });
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id || '1';

      let response;
      if (!editingDomaine.id || editingDomaine.id === 0) {
        response = await fetch('/api/domaines-metier', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': userId
          },
          body: JSON.stringify(editingDomaine)
        });
      } else {
        response = await fetch(`/api/domaines-metier/${editingDomaine.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': userId
          },
          body: JSON.stringify(editingDomaine)
        });
      }

      if (response.ok) {
        setMessage({
          type: 'success',
          text: editingDomaine.id ? 'Domaine mis à jour' : 'Domaine créé'
        });
        setShowModal(false);
        setEditingDomaine(null);
        setEditMode(null);
        chargerDonnees();
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Erreur lors de la sauvegarde' });
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    }
  };

  // CRUD Sous-Domaine
  const handleCreateSousDomaine = (domaineId: number) => {
    const d = domaines.find(d => d.id === domaineId);
    setEditMode('sousDomaine');
    setEditingSousDomaine({
      sousDomaineId: 0,
      codeSousDomaine: '',
      libelleSousDomaine: '',
      domaineId: domaineId,
      libelleDomaine: d?.libelle || '',
      nomComplet: '',
      popularite: 0
    });
    setShowModal(true);
  };

  const handleEditSousDomaine = (sd: SousDomaineMetier) => {
    setEditMode('sousDomaine');
    setEditingSousDomaine({ ...sd });
    setShowModal(true);
  };

  const handleSaveSousDomaine = async () => {
    if (!editingSousDomaine || !editingSousDomaine.libelleSousDomaine.trim()) {
      setMessage({ type: 'error', text: 'Le libellé du sous-domaine est obligatoire' });
      return;
    }

    if (!editingSousDomaine.codeSousDomaine.trim()) {
      setMessage({ type: 'error', text: 'Le code du sous-domaine est obligatoire' });
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id || '1';

      const requestBody = {
        domaineId: editingSousDomaine.domaineId,
        code: editingSousDomaine.codeSousDomaine,
        libelle: editingSousDomaine.libelleSousDomaine,
        description: '',
        popularite: editingSousDomaine.popularite
      };

      let response;
      if (!editingSousDomaine.sousDomaineId || editingSousDomaine.sousDomaineId === 0) {
        response = await fetch('/api/domaines-metier/sous-domaines', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': userId
          },
          body: JSON.stringify(requestBody)
        });
      } else {
        response = await fetch(`/api/domaines-metier/sous-domaines/${editingSousDomaine.sousDomaineId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': userId
          },
          body: JSON.stringify({
            ...requestBody,
            estActif: true
          })
        });
      }

      if (response.ok) {
        setMessage({
          type: 'success',
          text: editingSousDomaine.sousDomaineId ? 'Sous-domaine mis à jour' : 'Sous-domaine créé'
        });
        setShowModal(false);
        setEditingSousDomaine(null);
        setEditMode(null);
        chargerDonnees();
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Erreur lors de la sauvegarde' });
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    }
  };

  // Delete
  const confirmDelete = (type: 'domaine' | 'sousDomaine', id: number, nom: string) => {
    setDeleteTarget({ type, id, nom });
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id || '1';

      const url = deleteTarget.type === 'domaine'
        ? `/api/domaines-metier/${deleteTarget.id}`
        : `/api/domaines-metier/sous-domaines/${deleteTarget.id}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'X-User-Id': userId }
      });

      if (response.ok) {
        setMessage({
          type: 'success',
          text: `${deleteTarget.type === 'domaine' ? 'Domaine' : 'Sous-domaine'} supprimé(e)`
        });
        setShowDeleteModal(false);
        setDeleteTarget(null);
        chargerDonnees();
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Erreur lors de la suppression' });
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
    }
  };

  // Filtrer les sous-domaines par domaine
  const getSousDomainesByDomaine = (domaineId: number) => {
    return sousDomaines.filter(sd => sd.domaineId === domaineId);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Messages */}
        {message && (
          <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mb-6`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="btn btn-sm btn-ghost">✕</button>
          </div>
        )}

        

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Domaines Métier</div>
              <div className="stat-value text-primary">{domaines.length}</div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Sous-Domaines</div>
              <div className="stat-value text-secondary">{sousDomaines.length}</div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Plus Populaire</div>
              <div className="stat-value text-accent">
                {domaines.length > 0 ? Math.max(...domaines.map(d => d.popularite || 0)) : 0}
              </div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Affichage</div>
              <div className={`stat-value ${showInactive ? 'text-warning' : 'text-success'}`}>
                {showInactive ? 'Toutes' : 'Actives'}
              </div>
              <div className="stat-desc">
                {showInactive ? 'Actives + Inactives' : 'Uniquement actives'}
              </div>
            </div>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="form-control">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Rechercher un domaine métier..."
                      className="input input-bordered w-full pr-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && rechercherDomaines()}
                    />
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm"
                      onClick={rechercherDomaines}
                    >
                      <Search className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <button className="btn btn-primary gap-2" onClick={handleCreateDomaine}>
                <Plus className="w-5 h-5" />
                Nouveau Domaine
              </button>
            </div>
          </div>
        </div>

        {/* Liste hiérarchique */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="space-y-4">
            {domaines.length === 0 ? (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body text-center text-gray-500 py-8">
                  Aucun domaine métier trouvé
                </div>
              </div>
            ) : (
              domaines.map(d => (
                <div key={d.id} className="card bg-base-100 shadow-xl">
                  <div className="card-body p-0">
                    {/* Header du domaine */}
                    <div className="flex items-center justify-between p-4 hover:bg-base-200 cursor-pointer"
                         onClick={() => toggleDomaine(d.id)}>
                      <div className="flex items-center gap-4 flex-1">
                        <ChevronDown
                          className={`w-5 h-5 transition-transform ${expandedDomaines.has(d.id) ? 'rotate-180' : ''}`}
                        />
                        <Folder className="w-6 h-6 text-primary" style={{ color: d.couleur }} />
                        <div>
                          <div className="font-semibold text-lg">{d.libelle}</div>
                          <div className="text-sm text-gray-500">
                            {d.code} • {d.nombreSousDomaines || 0} sous-domaine{(d.nombreSousDomaines || 0) > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 md:gap-4">
                        <div className="badge badge-accent">{d.popularite}</div>
                        <div className="flex gap-1 md:gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="btn btn-sm btn-ghost"
                            onClick={() => handleCreateSousDomaine(d.id)}
                            title="Ajouter un sous-domaine"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            className="btn btn-sm btn-ghost"
                            onClick={() => handleEditDomaine(d)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            className="btn btn-sm btn-ghost text-error"
                            onClick={() => confirmDelete('domaine', d.id, d.libelle)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Liste des sous-domaines */}
                    {expandedDomaines.has(d.id) && (
                      <div className="border-t border-base-300">
                        {getSousDomainesByDomaine(d.id).length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            Aucun sous-domaine pour ce domaine
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="table table-zebra">
                              <thead>
                                <tr>
                                  <th>Code</th>
                                  <th>Sous-domaine</th>
                                  <th className="hidden md:table-cell">Popularité</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {getSousDomainesByDomaine(d.id).map(sd => (
                                  <tr key={sd.sousDomaineId}>
                                    <td>
                                      <span className="badge badge-outline">{sd.codeSousDomaine}</span>
                                    </td>
                                    <td>
                                      <span className="font-semibold">{sd.libelleSousDomaine}</span>
                                    </td>
                                    <td className="hidden md:table-cell">
                                      <span className="badge badge-accent">{sd.popularite}</span>
                                    </td>
                                    <td>
                                      <div className="flex gap-1 md:gap-2">
                                        <button
                                          className="btn btn-sm btn-ghost"
                                          onClick={() => handleEditSousDomaine(sd)}
                                        >
                                          <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                          className="btn btn-sm btn-ghost text-error"
                                          onClick={() => confirmDelete('sousDomaine', sd.sousDomaineId, sd.libelleSousDomaine)}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Modal d'édition */}
        {showModal && (editingDomaine || editingSousDomaine) && (
          <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
              <h3 className="font-bold text-lg mb-4">
                {editMode === 'domaine'
                  ? (editingDomaine?.id ? 'Modifier le domaine' : 'Nouveau domaine')
                  : (editingSousDomaine?.sousDomaineId ? 'Modifier le sous-domaine' : 'Nouveau sous-domaine')}
              </h3>

              {editMode === 'domaine' && editingDomaine && (
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Code *</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: DEV"
                      className="input input-bordered w-full"
                      value={editingDomaine.code}
                      onChange={(e) => setEditingDomaine({ ...editingDomaine, code: e.target.value.toUpperCase() })}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Libellé *</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Développement"
                      className="input input-bordered w-full"
                      value={editingDomaine.libelle}
                      onChange={(e) => setEditingDomaine({ ...editingDomaine, libelle: e.target.value })}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Description</span>
                    </label>
                    <textarea
                      placeholder="Description du domaine"
                      className="textarea textarea-bordered w-full"
                      value={editingDomaine.description}
                      onChange={(e) => setEditingDomaine({ ...editingDomaine, description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Icône</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 📚"
                        className="input input-bordered w-full"
                        value={editingDomaine.icone}
                        onChange={(e) => setEditingDomaine({ ...editingDomaine, icone: e.target.value })}
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Couleur</span>
                      </label>
                      <input
                        type="color"
                        className="input input-bordered w-full h-12"
                        value={editingDomaine.couleur}
                        onChange={(e) => setEditingDomaine({ ...editingDomaine, couleur: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Popularité</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered w-full"
                      value={editingDomaine.popularite}
                      onChange={(e) => setEditingDomaine({ ...editingDomaine, popularite: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-4">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={editingDomaine.estActif}
                        onChange={(e) => setEditingDomaine({ ...editingDomaine, estActif: e.target.checked })}
                      />
                      <span className="label-text font-semibold">Actif</span>
                    </label>
                  </div>
                </div>
              )}

              {editMode === 'sousDomaine' && editingSousDomaine && (
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Domaine métier</span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      value={editingSousDomaine.domaineId}
                      onChange={(e) => {
                        const domaineId = parseInt(e.target.value);
                        const d = domaines.find(d => d.id === domaineId);
                        setEditingSousDomaine({
                          ...editingSousDomaine,
                          domaineId: domaineId,
                          libelleDomaine: d?.libelle || ''
                        });
                      }}
                    >
                      {domaines.map(d => (
                        <option key={d.id} value={d.id}>{d.libelle}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Code *</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: JAVA"
                      className="input input-bordered w-full"
                      value={editingSousDomaine.codeSousDomaine}
                      onChange={(e) => setEditingSousDomaine({ ...editingSousDomaine, codeSousDomaine: e.target.value.toUpperCase() })}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Libellé *</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Java"
                      className="input input-bordered w-full"
                      value={editingSousDomaine.libelleSousDomaine}
                      onChange={(e) => setEditingSousDomaine({ ...editingSousDomaine, libelleSousDomaine: e.target.value })}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Popularité</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered w-full"
                      value={editingSousDomaine.popularite}
                      onChange={(e) => setEditingSousDomaine({ ...editingSousDomaine, popularite: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              )}

              <div className="modal-action">
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowModal(false);
                    setEditingDomaine(null);
                    setEditingSousDomaine(null);
                    setEditMode(null);
                  }}
                >
                  Annuler
                </button>
                <button
                  className="btn btn-primary"
                  onClick={editMode === 'domaine' ? handleSaveDomaine : handleSaveSousDomaine}
                >
                  {(editMode === 'domaine' ? editingDomaine?.id : editingSousDomaine?.sousDomaineId) ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmation de suppression */}
        {showDeleteModal && deleteTarget && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Confirmer la suppression</h3>
              <p className="py-4">
                Êtes-vous sûr de vouloir supprimer {deleteTarget.type === 'domaine' ? 'le domaine' : 'le sous-domaine'}{' '}
                <strong>{deleteTarget.nom}</strong> ?
                {deleteTarget.type === 'domaine' && (
                  <span className="block mt-2 text-warning">
                    ⚠️ Tous les sous-domaines de ce domaine seront également supprimés.
                  </span>
                )}
              </p>
              <div className="modal-action">
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteTarget(null);
                  }}
                >
                  Annuler
                </button>
                <button className="btn btn-error" onClick={handleDelete}>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GererDomainesMetier;
