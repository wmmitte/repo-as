import React, { useState, useEffect } from 'react';
import {
  Component, Search, Plus, Edit2, Trash2,
  LayoutList, LayoutGrid, GitBranch, TrendingUp, X, Save
} from 'lucide-react';
import { referentielService } from '@/services/referentielService';
import { DomaineCompetenceDTO, DomaineMetierDTO, SousDomaineMetierDTO } from '@/types/referentiel.types';
import { useIsManager } from '@/hooks/usePermissions';

interface CompetenceReference {
  id: number;
  code: string;
  libelle: string;
  description: string;
  typeCompetence: string;
  domaine: string;
  sousDomaine: string;
  domaineCompetenceId?: number; // ID du domaine pédagogique
  domaineMetierId?: number; // ID du domaine métier/thématique
  sousDomaineMetierId?: number; // ID du sous-domaine métier
  verbeAction: string;
  objet: string;
  contexte: string;
  ressourcesMobilisees: string;
  criteresPerformance: string;
  referentiel: string;
  organisme: string;
  statut: string;
  indicePopularite: number;
  estActive: boolean;
  sousCompetences?: CompetenceReference[];
}

type VueAffichage = 'liste' | 'cartes' | 'arbre';

const GererCompetences: React.FC = () => {
  const { hasRole: isManager } = useIsManager();
  const [competences, setCompetences] = useState<CompetenceReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomaine, setSelectedDomaine] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [domaines, setDomaines] = useState<string[]>([]);
  const [, setStatistiques] = useState<Record<string, number>>({});
  const [vueAffichage, setVueAffichage] = useState<VueAffichage>('liste');
  const [showModal, setShowModal] = useState(false);
  const [editingCompetence, setEditingCompetence] = useState<CompetenceReference | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [competenceToDelete, setCompetenceToDelete] = useState<{ id: number; libelle: string } | null>(null);

  // États pour les référentiels
  const [domainesCompetence, setDomainesCompetence] = useState<DomaineCompetenceDTO[]>([]);
  const [domainesMetier, setDomainesMetier] = useState<DomaineMetierDTO[]>([]);
  const [sousDomainesMetier, setSousDomainesMetier] = useState<SousDomaineMetierDTO[]>([]);
  const [loadingSousDomaines, setLoadingSousDomaines] = useState(false);

  // Charger les données initiales
  useEffect(() => {
    chargerDonnees();
    chargerReferentiels();
  }, []);

  const chargerReferentiels = async () => {
    try {
      const [domComp, domMet] = await Promise.all([
        referentielService.getDomainesCompetence(),
        referentielService.getDomainesMetier()
      ]);
      setDomainesCompetence(domComp);
      setDomainesMetier(domMet);
    } catch (error) {
      console.error('Erreur lors du chargement des référentiels:', error);
    }
  };

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      const [compResponse, domainesResponse, statsResponse] = await Promise.all([
        fetch(`/api/competences-reference?includeInactive=${showInactive}`).then(r => r.json()),
        fetch('/api/competences-reference/domaines').then(r => r.json()),
        fetch('/api/competences-reference/statistiques').then(r => r.json())
      ]);
      
      // S'assurer que les réponses sont des tableaux/objets valides
      setCompetences(Array.isArray(compResponse) ? compResponse : []);
      setDomaines(Array.isArray(domainesResponse) ? domainesResponse : []);
      setStatistiques(typeof statsResponse === 'object' && statsResponse !== null ? statsResponse : {});
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des données' });
      // Initialiser avec des valeurs par défaut en cas d'erreur
      setCompetences([]);
      setDomaines([]);
      setStatistiques({});
    } finally {
      setLoading(false);
    }
  };

  // Recherche et filtrage
  const rechercherCompetences = async () => {
    try {
      setLoading(true);
      
      if (searchTerm) {
        const response = await fetch(`/api/competences-reference/recherche?terme=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();
        setCompetences(Array.isArray(data) ? data : []);
      } else if (selectedDomaine || selectedType) {
        const params = new URLSearchParams();
        if (selectedDomaine) params.append('domaine', selectedDomaine);
        if (selectedType) params.append('typeCompetence', selectedType);
        const response = await fetch(`/api/competences-reference/recherche-avancee?${params}`);
        const data = await response.json();
        setCompetences(Array.isArray(data) ? data : []);
      } else {
        chargerDonnees();
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setCompetences([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      rechercherCompetences();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm, selectedDomaine, selectedType]);

  // Charger l'arborescence
  const chargerArborescence = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/competences-reference/arborescence');
      const data = await response.json();
      setCompetences(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'arborescence:', error);
      setCompetences([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vueAffichage === 'arbre') {
      chargerArborescence();
    } else {
      chargerDonnees();
    }
  }, [vueAffichage, showInactive]);

  // CRUD Operations
  const handleCreate = () => {
    setEditingCompetence({
      id: 0,
      code: '',
      libelle: '',
      description: '',
      typeCompetence: 'SAVOIR_FAIRE',
      domaine: '',
      sousDomaine: '',
      verbeAction: '',
      objet: '',
      contexte: '',
      ressourcesMobilisees: '',
      criteresPerformance: '',
      referentiel: 'Interne',
      organisme: 'PITM',
      statut: 'VALIDE',
      indicePopularite: 0,
      estActive: true
    });
    setShowModal(true);
  };

  const handleEdit = async (competence: CompetenceReference) => {
    // Mapper les libellés aux IDs des référentiels
    let domaineCompId = competence.domaineCompetenceId;
    let domaineMetId = competence.domaineMetierId;
    let sousDomaineMetId = competence.sousDomaineMetierId;

    // Si les IDs ne sont pas présents, les retrouver à partir des libellés
    if (!domaineCompId && competence.typeCompetence) {
      const domComp = domainesCompetence.find(d => d.code === competence.typeCompetence);
      if (domComp) {
        domaineCompId = domComp.id;
      }
    }

    if (!domaineMetId && competence.domaine) {
      const domMet = domainesMetier.find(d => d.libelle === competence.domaine);
      if (domMet) {
        domaineMetId = domMet.id;

        // Charger les sous-domaines métier pour ce domaine
        try {
          const sousDomaines = await referentielService.getSousDomainesMetier(domMet.id);
          setSousDomainesMetier(sousDomaines);

          // Trouver l'ID du sous-domaine si présent
          if (!sousDomaineMetId && competence.sousDomaine) {
            const sousDomMet = sousDomaines.find(sd => sd.libelle === competence.sousDomaine);
            if (sousDomMet) {
              sousDomaineMetId = sousDomMet.id;
            }
          }
        } catch (error) {
          console.error('Erreur lors du chargement des sous-domaines:', error);
        }
      }
    }

    // Mettre à jour la compétence avec les IDs trouvés
    setEditingCompetence({
      ...competence,
      domaineCompetenceId: domaineCompId,
      domaineMetierId: domaineMetId,
      sousDomaineMetierId: sousDomaineMetId
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingCompetence) return;

    try {
      // Récupérer l'utilisateur connecté depuis le localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id || '1';

      let response;
      if (!editingCompetence.id || editingCompetence.id === 0) {
        // Création - ne pas envoyer l'ID
        const { id, ...competenceData } = editingCompetence;
        response = await fetch('/api/competences-reference', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-User-Id': userId
          },
          body: JSON.stringify(competenceData)
        });
      } else {
        // Mise à jour
        response = await fetch(`/api/competences-reference/${editingCompetence.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'X-User-Id': userId
          },
          body: JSON.stringify(editingCompetence)
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      setMessage({ 
        type: 'success', 
        text: editingCompetence.id === 0 ? 'Compétence créée avec succès' : 'Compétence mise à jour avec succès' 
      });
      setShowModal(false);
      setEditingCompetence(null);
      chargerDonnees();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    }
  };

  const handleDelete = (id: number, libelle: string) => {
    setCompetenceToDelete({ id, libelle });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!competenceToDelete) return;

    try {
      // Récupérer l'utilisateur connecté depuis le localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id || '1';

      const response = await fetch(`/api/competences-reference/${competenceToDelete.id}`, { 
        method: 'DELETE',
        headers: {
          'X-User-Id': userId
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      setMessage({ type: 'success', text: 'Compétence supprimée avec succès' });
      setShowDeleteModal(false);
      setCompetenceToDelete(null);
      chargerDonnees();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
      setShowDeleteModal(false);
      setCompetenceToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCompetenceToDelete(null);
  };

  // Rendu de l'arborescence
  const renderArborescence = (competences: CompetenceReference[], niveau: number = 0) => {
    return competences.map(comp => (
      <div key={comp.id} style={{ marginLeft: `${niveau * 24}px` }} className="my-2">
        <div className="flex items-center gap-2 p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors">
          <GitBranch className="w-4 h-4 text-gray-500" />
          <span className="font-medium">{comp.libelle}</span>
          <span className="badge badge-sm">{comp.domaine}</span>
          <span className="text-xs text-gray-500">({comp.code})</span>
          {isManager && (
            <div className="ml-auto flex gap-2">
              <button onClick={() => handleEdit(comp)} className="btn btn-ghost btn-xs">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(comp.id, comp.libelle)} className="btn btn-ghost btn-xs text-error">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        {comp.sousCompetences && comp.sousCompetences.length > 0 && (
          renderArborescence(comp.sousCompetences, niveau + 1)
        )}
      </div>
    ));
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Bouton d'action - Réservé aux Managers uniquement */}
        {isManager && (
          <div className="flex justify-end mb-6">
            <button onClick={handleCreate} className="btn btn-primary gap-2">
              <Plus className="w-5 h-5" />
              Nouvelle Compétence
            </button>
          </div>
        )}

        {/* Message de feedback */}
        {message && (
          <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mb-4`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="btn btn-ghost btn-sm">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Total Compétences</div>
              <div className="stat-value text-primary">{competences.length}</div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Domaines</div>
              <div className="stat-value text-secondary">{domaines.length}</div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Plus Populaire</div>
              <div className="stat-value text-accent">
                {competences.length > 0 ? Math.max(...competences.map(c => c.indicePopularite || 0)) : 0}
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
                      placeholder="Rechercher une compétence..."
                      className="input input-bordered w-full pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Filtre Domaine Métier */}
              <div className="form-control w-full md:w-48">
                <select
                  className="select select-bordered"
                  value={selectedDomaine}
                  onChange={(e) => setSelectedDomaine(e.target.value)}
                >
                  <option value="">Tous les domaines</option>
                  {domainesMetier.map(domaine => (
                    <option key={domaine.id} value={domaine.libelle}>{domaine.libelle}</option>
                  ))}
                </select>
              </div>

              {/* Filtre Domaine de Compétence */}
              <div className="form-control w-full md:w-48">
                <select
                  className="select select-bordered"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="">Tous les types</option>
                  {domainesCompetence.map(domaine => (
                    <option key={domaine.id} value={domaine.code}>{domaine.libelle}</option>
                  ))}
                </select>
              </div>

              {/* Toggle Compétences Inactives */}
              <div className="form-control">
                <label className="label cursor-pointer gap-2">
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={showInactive}
                    onChange={(e) => setShowInactive(e.target.checked)}
                  />
                  <span className="label-text">Afficher inactives</span>
                </label>
              </div>

              {/* Boutons de vue */}
              <div className="btn-group">
                <button
                  className={`btn ${vueAffichage === 'liste' ? 'btn-active' : ''}`}
                  onClick={() => setVueAffichage('liste')}
                >
                  <LayoutList className="w-5 h-5" />
                </button>
                <button
                  className={`btn ${vueAffichage === 'cartes' ? 'btn-active' : ''}`}
                  onClick={() => setVueAffichage('cartes')}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  className={`btn ${vueAffichage === 'arbre' ? 'btn-active' : ''}`}
                  onClick={() => setVueAffichage('arbre')}
                >
                  <GitBranch className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Affichage des compétences */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              {vueAffichage === 'liste' && (
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Libellé</th>
                        <th>Domaine</th>
                        <th>Type</th>
                        <th>Popularité</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {competences.map(comp => (
                        <tr key={comp.id}>
                          <td className="font-mono text-sm">{comp.code}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="font-medium">{comp.libelle}</div>
                              {!comp.estActive && (
                                <span className="badge badge-error badge-sm">Inactive</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-md">
                              {comp.description}
                            </div>
                          </td>
                          <td>
                            <div className="badge badge-primary">{comp.domaine}</div>
                            {comp.sousDomaine && (
                              <div className="badge badge-ghost badge-sm mt-1">{comp.sousDomaine}</div>
                            )}
                          </td>
                          <td>
                            <span className="badge badge-secondary">{comp.typeCompetence}</span>
                          </td>
                          <td>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4 text-success" />
                              <span>{comp.indicePopularite || 0}</span>
                            </div>
                          </td>
                          <td>
                            {isManager && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEdit(comp)}
                                  className="btn btn-ghost btn-sm"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(comp.id, comp.libelle)}
                                  className="btn btn-ghost btn-sm text-error"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {vueAffichage === 'cartes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {competences.map(comp => (
                    <div key={comp.id} className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow">
                      <div className="card-body">
                        <h3 className="card-title text-lg">{comp.libelle}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{comp.description}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="badge badge-primary badge-sm">{comp.domaine}</span>
                          <span className="badge badge-secondary badge-sm">{comp.typeCompetence}</span>
                          <span className="badge badge-ghost badge-sm">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {comp.indicePopularite || 0}
                          </span>
                          {!comp.estActive && (
                            <span className="badge badge-error badge-sm">Inactive</span>
                          )}
                        </div>
                        {isManager && (
                          <div className="card-actions justify-end mt-4">
                            <button
                              onClick={() => handleEdit(comp)}
                              className="btn btn-ghost btn-sm"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(comp.id, comp.libelle)}
                              className="btn btn-ghost btn-sm text-error"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {vueAffichage === 'arbre' && (
                <div className="space-y-2">
                  {renderArborescence(competences)}
                </div>
              )}

              {competences.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Component className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Aucune compétence trouvée</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de création/édition */}
      {showModal && editingCompetence && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <h3 className="font-bold text-lg mb-4">
              {editingCompetence.id === 0 ? 'Nouvelle Compétence' : 'Modifier la Compétence'}
            </h3>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {/* Code et Libellé */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Code</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={editingCompetence.code}
                    onChange={(e) => setEditingCompetence({...editingCompetence, code: e.target.value})}
                    placeholder="Auto-généré si vide"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Libellé *</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={editingCompetence.libelle}
                    onChange={(e) => setEditingCompetence({...editingCompetence, libelle: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24"
                  value={editingCompetence.description}
                  onChange={(e) => setEditingCompetence({...editingCompetence, description: e.target.value})}
                />
              </div>

              {/* Domaine métier et Sous-domaine métier */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Domaine métier (thématique)</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={editingCompetence.domaineMetierId || ''}
                    onChange={async (e) => {
                      const id = e.target.value ? parseInt(e.target.value) : undefined;
                      const domaine = domainesMetier.find(d => d.id === id);
                      setEditingCompetence({
                        ...editingCompetence,
                        domaineMetierId: id,
                        domaine: domaine?.libelle || '',
                        sousDomaineMetierId: undefined,
                        sousDomaine: ''
                      });

                      // Charger les sous-domaines
                      if (id) {
                        setLoadingSousDomaines(true);
                        try {
                          const sousDomaines = await referentielService.getSousDomainesMetier(id);
                          setSousDomainesMetier(sousDomaines);
                        } catch (error) {
                          console.error('Erreur chargement sous-domaines:', error);
                        } finally {
                          setLoadingSousDomaines(false);
                        }
                      } else {
                        setSousDomainesMetier([]);
                      }
                    }}
                  >
                    <option value="">-- Sélectionner --</option>
                    {domainesMetier.map((domaine) => (
                      <option key={domaine.id} value={domaine.id}>
                        {domaine.libelle}
                      </option>
                    ))}
                  </select>
                  <label className="label">
                    <span className="label-text-alt">Technique, Management, Relationnel, etc.</span>
                  </label>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Sous-domaine métier</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={editingCompetence.sousDomaineMetierId || ''}
                    onChange={(e) => {
                      const id = e.target.value ? parseInt(e.target.value) : undefined;
                      const sousDomaine = sousDomainesMetier.find(sd => sd.id === id);
                      setEditingCompetence({
                        ...editingCompetence,
                        sousDomaineMetierId: id,
                        sousDomaine: sousDomaine?.libelle || ''
                      });
                    }}
                    disabled={!editingCompetence.domaineMetierId || loadingSousDomaines}
                  >
                    <option value="">-- Sélectionner --</option>
                    {sousDomainesMetier.map((sousDomaine) => (
                      <option key={sousDomaine.id} value={sousDomaine.id}>
                        {sousDomaine.libelle}
                      </option>
                    ))}
                  </select>
                  {loadingSousDomaines && (
                    <label className="label">
                      <span className="label-text-alt text-info">
                        <span className="loading loading-spinner loading-xs mr-1"></span>
                        Chargement...
                      </span>
                    </label>
                  )}
                  {!editingCompetence.domaineMetierId && (
                    <label className="label">
                      <span className="label-text-alt">Sélectionnez d'abord un domaine métier</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Domaine de compétence */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Domaine de compétence (pédagogique)</span>
                </label>
                <select
                  className="select select-bordered"
                  value={editingCompetence.domaineCompetenceId || ''}
                  onChange={(e) => {
                    const id = e.target.value ? parseInt(e.target.value) : undefined;
                    const domaine = domainesCompetence.find(d => d.id === id);
                    setEditingCompetence({
                      ...editingCompetence,
                      domaineCompetenceId: id,
                      typeCompetence: domaine?.code || ''
                    });
                  }}
                >
                  <option value="">-- Sélectionner --</option>
                  {domainesCompetence.map((domaine) => (
                    <option key={domaine.id} value={domaine.id}>
                      {domaine.libelle}
                    </option>
                  ))}
                </select>
              </div>

              {/* Formulation normée */}
              <div className="grid grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Verbe d'action</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={editingCompetence.verbeAction}
                    onChange={(e) => setEditingCompetence({...editingCompetence, verbeAction: e.target.value})}
                    placeholder="Ex: Concevoir, Analyser..."
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Objet</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={editingCompetence.objet}
                    onChange={(e) => setEditingCompetence({...editingCompetence, objet: e.target.value})}
                    placeholder="Ex: une architecture..."
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Contexte</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={editingCompetence.contexte}
                    onChange={(e) => setEditingCompetence({...editingCompetence, contexte: e.target.value})}
                    placeholder="Ex: en environnement agile"
                  />
                </div>
              </div>
            </div>

            <div className="modal-action">
              <button onClick={() => setShowModal(false)} className="btn btn-ghost">
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
      {showDeleteModal && competenceToDelete && (
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
              Êtes-vous sûr de vouloir supprimer la compétence <strong className="text-error">"{competenceToDelete.libelle}"</strong> ?
            </p>
            <p className="text-sm text-gray-500">
              La compétence sera désactivée et ne sera plus visible dans le référentiel.
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

export default GererCompetences;
