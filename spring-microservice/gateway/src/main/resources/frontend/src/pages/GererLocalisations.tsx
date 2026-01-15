import React, { useState, useEffect } from 'react';
import { MapPin, Search, Plus, Edit2, Trash2, ChevronDown, Globe } from 'lucide-react';

interface Pays {
  id: number;
  nom: string;
  codeIso: string;
  estActif: boolean;
  indicePopularite: number;
  nombreVilles: number;
}

interface Ville {
  id: number;
  nom: string;
  paysId: number;
  paysNom: string;
  codePostal?: string;
  estActif: boolean;
  indicePopularite: number;
}

type EditMode = 'pays' | 'ville' | null;

const GererLocalisations: React.FC = () => {
  const [pays, setPays] = useState<Pays[]>([]);
  const [villes, setVilles] = useState<Ville[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPays, setExpandedPays] = useState<Set<number>>(new Set());
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [editingPays, setEditingPays] = useState<Pays | null>(null);
  const [editingVille, setEditingVille] = useState<Ville | null>(null);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'pays' | 'ville'; id: number; nom: string } | null>(null);
  
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [statistiques, setStatistiques] = useState<any>({ totalPays: 0, totalVilles: 0, maxPopularite: 0 });

  // Charger les données
  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      const [paysResponse, villesResponse, statsResponse] = await Promise.all([
        fetch('/api/localisations/pays').then(r => r.json()),
        fetch('/api/localisations/villes').then(r => r.json()),
        fetch('/api/localisations/statistiques').then(r => r.json())
      ]);
      
      setPays(Array.isArray(paysResponse) ? paysResponse : []);
      setVilles(Array.isArray(villesResponse) ? villesResponse : []);
      setStatistiques(statsResponse || { totalPays: 0, totalVilles: 0, maxPopularite: 0 });
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des données' });
    } finally {
      setLoading(false);
    }
  };

  // Recherche
  const rechercherPays = async () => {
    if (!searchTerm) {
      chargerDonnees();
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`/api/localisations/pays/recherche?terme=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      setPays(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la recherche' });
    } finally {
      setLoading(false);
    }
  };

  // Toggle expand pays
  const togglePays = (paysId: number) => {
    const newExpanded = new Set(expandedPays);
    if (newExpanded.has(paysId)) {
      newExpanded.delete(paysId);
    } else {
      newExpanded.add(paysId);
    }
    setExpandedPays(newExpanded);
  };

  // CRUD Pays
  const handleCreatePays = () => {
    setEditMode('pays');
    setEditingPays({
      id: 0,
      nom: '',
      codeIso: '',
      estActif: true,
      indicePopularite: 0,
      nombreVilles: 0
    });
    setShowModal(true);
  };

  const handleEditPays = (p: Pays) => {
    setEditMode('pays');
    setEditingPays({ ...p });
    setShowModal(true);
  };

  const handleSavePays = async () => {
    if (!editingPays || !editingPays.nom.trim()) {
      setMessage({ type: 'error', text: 'Le nom du pays est obligatoire' });
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id || '1';

      let response;
      if (!editingPays.id || editingPays.id === 0) {
        response = await fetch('/api/localisations/pays', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-User-Id': userId
          },
          body: JSON.stringify(editingPays)
        });
      } else {
        response = await fetch(`/api/localisations/pays/${editingPays.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'X-User-Id': userId
          },
          body: JSON.stringify(editingPays)
        });
      }

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: editingPays.id ? 'Pays mis à jour' : 'Pays créé' 
        });
        setShowModal(false);
        setEditingPays(null);
        setEditMode(null);
        chargerDonnees();
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    }
  };

  // CRUD Ville
  const handleCreateVille = (paysId: number) => {
    const p = pays.find(p => p.id === paysId);
    setEditMode('ville');
    setEditingVille({
      id: 0,
      nom: '',
      paysId: paysId,
      paysNom: p?.nom || '',
      codePostal: '',
      estActif: true,
      indicePopularite: 0
    });
    setShowModal(true);
  };

  const handleEditVille = (v: Ville) => {
    setEditMode('ville');
    setEditingVille({ ...v });
    setShowModal(true);
  };

  const handleSaveVille = async () => {
    if (!editingVille || !editingVille.nom.trim()) {
      setMessage({ type: 'error', text: 'Le nom de la ville est obligatoire' });
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id || '1';

      let response;
      if (!editingVille.id || editingVille.id === 0) {
        response = await fetch('/api/localisations/villes', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-User-Id': userId
          },
          body: JSON.stringify(editingVille)
        });
      } else {
        response = await fetch(`/api/localisations/villes/${editingVille.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'X-User-Id': userId
          },
          body: JSON.stringify(editingVille)
        });
      }

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: editingVille.id ? 'Ville mise à jour' : 'Ville créée' 
        });
        setShowModal(false);
        setEditingVille(null);
        setEditMode(null);
        chargerDonnees();
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    }
  };

  // Delete
  const confirmDelete = (type: 'pays' | 'ville', id: number, nom: string) => {
    setDeleteTarget({ type, id, nom });
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id || '1';

      const url = deleteTarget.type === 'pays' 
        ? `/api/localisations/pays/${deleteTarget.id}`
        : `/api/localisations/villes/${deleteTarget.id}`;

      const response = await fetch(url, { 
        method: 'DELETE',
        headers: { 'X-User-Id': userId }
      });

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `${deleteTarget.type === 'pays' ? 'Pays' : 'Ville'} supprimé(e)` 
        });
        setShowDeleteModal(false);
        setDeleteTarget(null);
        chargerDonnees();
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
    }
  };

  // Filtrer les villes par pays
  const getVillesByPays = (paysId: number) => {
    return villes.filter(v => v.paysId === paysId);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Messages */}
        {message && (
          <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mb-6`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="btn btn-sm btn-ghost">✕</button>
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Pays</div>
              <div className="stat-value text-primary">{statistiques.totalPays}</div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Villes</div>
              <div className="stat-value text-success">{statistiques.totalVilles}</div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Plus Populaire</div>
              <div className="stat-value text-accent">{statistiques.maxPopularite}</div>
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
                      placeholder="Rechercher un pays..."
                      className="input input-bordered w-full pr-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && rechercherPays()}
                    />
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm"
                      onClick={rechercherPays}
                    >
                      <Search className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <button className="btn btn-primary gap-2" onClick={handleCreatePays}>
                <Plus className="w-5 h-5" />
                Nouveau Pays
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
            {pays.length === 0 ? (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body text-center text-gray-500 py-8">
                  Aucun pays trouvé
                </div>
              </div>
            ) : (
              pays.map(p => (
                <div key={p.id} className="card bg-base-100 shadow-xl">
                  <div className="card-body p-0">
                    {/* Header du pays */}
                    <div className="flex items-center justify-between p-4 hover:bg-base-200 cursor-pointer"
                         onClick={() => togglePays(p.id)}>
                      <div className="flex items-center gap-4 flex-1">
                        <ChevronDown 
                          className={`w-5 h-5 transition-transform ${expandedPays.has(p.id) ? 'rotate-180' : ''}`}
                        />
                        <Globe className="w-6 h-6 text-primary" />
                        <div>
                          <div className="font-semibold text-lg">{p.nom}</div>
                          <div className="text-sm text-gray-500">
                            {p.codeIso} • {p.nombreVilles} ville{p.nombreVilles > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="badge badge-accent">{p.indicePopularite || 0}</div>
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="btn btn-sm btn-ghost"
                            onClick={() => handleCreateVille(p.id)}
                            title="Ajouter une ville"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            className="btn btn-sm btn-ghost"
                            onClick={() => handleEditPays(p)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            className="btn btn-sm btn-ghost text-error"
                            onClick={() => confirmDelete('pays', p.id, p.nom)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Liste des villes */}
                    {expandedPays.has(p.id) && (
                      <div className="border-t border-base-300">
                        {getVillesByPays(p.id).length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            Aucune ville pour ce pays
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="table table-zebra">
                              <thead>
                                <tr>
                                  <th>Ville</th>
                                  <th>Code Postal</th>
                                  <th>Popularité</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {getVillesByPays(p.id).map(v => (
                                  <tr key={v.id}>
                                    <td>
                                      <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-accent" />
                                        <span className="font-semibold">{v.nom}</span>
                                      </div>
                                    </td>
                                    <td>{v.codePostal || '-'}</td>
                                    <td>
                                      <span className="badge badge-accent">{v.indicePopularite || 0}</span>
                                    </td>
                                    <td>
                                      <div className="flex gap-2">
                                        <button
                                          className="btn btn-sm btn-ghost"
                                          onClick={() => handleEditVille(v)}
                                        >
                                          <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                          className="btn btn-sm btn-ghost text-error"
                                          onClick={() => confirmDelete('ville', v.id, v.nom)}
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
        {showModal && (editingPays || editingVille) && (
          <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
              <h3 className="font-bold text-lg mb-4">
                {editMode === 'pays' 
                  ? (editingPays?.id ? 'Modifier le pays' : 'Nouveau pays')
                  : (editingVille?.id ? 'Modifier la ville' : 'Nouvelle ville')}
              </h3>

              {editMode === 'pays' && editingPays && (
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Nom du pays *</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: France"
                      className="input input-bordered w-full"
                      value={editingPays.nom}
                      onChange={(e) => setEditingPays({ ...editingPays, nom: e.target.value })}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Code ISO</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: FR"
                      maxLength={3}
                      className="input input-bordered w-full"
                      value={editingPays.codeIso}
                      onChange={(e) => setEditingPays({ ...editingPays, codeIso: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>
              )}

              {editMode === 'ville' && editingVille && (
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Pays</span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      value={editingVille.paysId}
                      onChange={(e) => {
                        const paysId = parseInt(e.target.value);
                        const p = pays.find(p => p.id === paysId);
                        setEditingVille({ 
                          ...editingVille, 
                          paysId: paysId,
                          paysNom: p?.nom || ''
                        });
                      }}
                    >
                      {pays.map(p => (
                        <option key={p.id} value={p.id}>{p.nom}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Nom de la ville *</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Paris"
                      className="input input-bordered w-full"
                      value={editingVille.nom}
                      onChange={(e) => setEditingVille({ ...editingVille, nom: e.target.value })}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Code postal</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 75000"
                      className="input input-bordered w-full"
                      value={editingVille.codePostal || ''}
                      onChange={(e) => setEditingVille({ ...editingVille, codePostal: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="modal-action">
                <button 
                  className="btn btn-ghost" 
                  onClick={() => { 
                    setShowModal(false); 
                    setEditingPays(null); 
                    setEditingVille(null);
                    setEditMode(null);
                  }}
                >
                  Annuler
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={editMode === 'pays' ? handleSavePays : handleSaveVille}
                >
                  {(editMode === 'pays' ? editingPays?.id : editingVille?.id) ? 'Mettre à jour' : 'Créer'}
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
                Êtes-vous sûr de vouloir supprimer {deleteTarget.type === 'pays' ? 'le pays' : 'la ville'}{' '}
                <strong>{deleteTarget.nom}</strong> ?
                {deleteTarget.type === 'pays' && (
                  <span className="block mt-2 text-warning">
                    ⚠️ Toutes les villes de ce pays seront également supprimées.
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

export default GererLocalisations;
