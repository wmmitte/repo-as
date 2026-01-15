import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, TrendingUp, X, Save } from 'lucide-react';

interface Certification {
  id: number;
  intitule: string;
  description: string;
  organismeDelivrant: string;
  urlVerification: string;
  estActive: boolean;
  indicePopularite: number;
}

const GererCertifications: React.FC = () => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCertification, setEditingCertification] = useState<Certification | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [certificationToDelete, setCertificationToDelete] = useState<{ id: number; intitule: string } | null>(null);
  const [statistiques, setStatistiques] = useState<{ total: number; actives: number; maxPopularite: number }>({ total: 0, actives: 0, maxPopularite: 0 });

  // Charger les données initiales
  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      const [certResponse, statsResponse] = await Promise.all([
        fetch('/api/certifications').then(r => r.json()),
        fetch('/api/certifications/statistiques').then(r => r.json())
      ]);
      
      setCertifications(Array.isArray(certResponse) ? certResponse : []);
      setStatistiques(typeof statsResponse === 'object' && statsResponse !== null ? statsResponse : { total: 0, actives: 0, maxPopularite: 0 });
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des données' });
      setCertifications([]);
      setStatistiques({ total: 0, actives: 0, maxPopularite: 0 });
    } finally {
      setLoading(false);
    }
  };

  // Recherche
  const rechercherCertifications = async () => {
    try {
      setLoading(true);
      
      if (searchTerm) {
        const response = await fetch(`/api/certifications/recherche?terme=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();
        setCertifications(Array.isArray(data) ? data : []);
      } else {
        chargerDonnees();
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la recherche' });
    } finally {
      setLoading(false);
    }
  };

  // CRUD Operations
  const handleCreate = () => {
    setEditingCertification({
      id: 0,
      intitule: '',
      description: '',
      organismeDelivrant: '',
      urlVerification: '',
      estActive: true,
      indicePopularite: 0
    });
    setShowModal(true);
  };

  const handleEdit = (certification: Certification) => {
    setEditingCertification({ ...certification });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingCertification || !editingCertification.intitule.trim()) {
      setMessage({ type: 'error', text: 'L\'intitulé est obligatoire' });
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id || '1';

      let response;
      if (!editingCertification.id || editingCertification.id === 0) {
        // Création
        const { id, ...certificationData } = editingCertification;
        response = await fetch('/api/certifications', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-User-Id': userId
          },
          body: JSON.stringify(certificationData)
        });
      } else {
        // Mise à jour
        response = await fetch(`/api/certifications/${editingCertification.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'X-User-Id': userId
          },
          body: JSON.stringify(editingCertification)
        });
      }

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: editingCertification.id ? 'Certification mise à jour avec succès' : 'Certification créée avec succès' 
        });
        setShowModal(false);
        setEditingCertification(null);
        chargerDonnees();
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    }
  };

  const confirmDelete = (certification: Certification) => {
    setCertificationToDelete({ id: certification.id, intitule: certification.intitule });
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!certificationToDelete) return;

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id || '1';

      const response = await fetch(`/api/certifications/${certificationToDelete.id}`, { 
        method: 'DELETE',
        headers: {
          'X-User-Id': userId
        }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Certification supprimée avec succès' });
        setShowDeleteModal(false);
        setCertificationToDelete(null);
        chargerDonnees();
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
    }
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
              <div className="stat-title">Total</div>
              <div className="stat-value text-primary">{statistiques.total}</div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Actives</div>
              <div className="stat-value text-success">{statistiques.actives}</div>
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
                      placeholder="Rechercher une certification..."
                      className="input input-bordered w-full pr-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && rechercherCertifications()}
                    />
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm"
                      onClick={rechercherCertifications}
                    >
                      <Search className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <button className="btn btn-primary gap-2" onClick={handleCreate}>
                <Plus className="w-5 h-5" />
                Nouvelle Certification
              </button>
            </div>
          </div>
        </div>

        {/* Liste des certifications */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Intitulé</th>
                      <th>Organisme</th>
                      <th>Popularité</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certifications.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center text-gray-500 py-8">
                          Aucune certification trouvée
                        </td>
                      </tr>
                    ) : (
                      certifications.map(cert => (
                        <tr key={cert.id}>
                          <td>
                            <div className="font-semibold">{cert.intitule}</div>
                            {cert.description && (
                              <div className="text-sm text-gray-500 truncate max-w-md">
                                {cert.description}
                              </div>
                            )}
                          </td>
                          <td>{cert.organismeDelivrant || '-'}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-accent" />
                              <span className="font-semibold">{cert.indicePopularite}</span>
                            </div>
                          </td>
                          <td>
                            <div className="flex gap-2">
                              <button
                                className="btn btn-sm btn-ghost"
                                onClick={() => handleEdit(cert)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                className="btn btn-sm btn-ghost text-error"
                                onClick={() => confirmDelete(cert)}
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

        {/* Modal d'édition */}
        {showModal && editingCertification && (
          <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
              <h3 className="font-bold text-lg mb-4">
                {editingCertification.id ? 'Modifier la certification' : 'Nouvelle certification'}
              </h3>

              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Intitulé *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: AWS Certified Solutions Architect"
                    className="input input-bordered w-full"
                    value={editingCertification.intitule}
                    onChange={(e) => setEditingCertification({ ...editingCertification, intitule: e.target.value })}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Description</span>
                  </label>
                  <textarea
                    placeholder="Description de la certification..."
                    className="textarea textarea-bordered w-full h-24"
                    value={editingCertification.description}
                    onChange={(e) => setEditingCertification({ ...editingCertification, description: e.target.value })}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Organisme délivrant</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Amazon Web Services"
                    className="input input-bordered w-full"
                    value={editingCertification.organismeDelivrant}
                    onChange={(e) => setEditingCertification({ ...editingCertification, organismeDelivrant: e.target.value })}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">URL de vérification</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    className="input input-bordered w-full"
                    value={editingCertification.urlVerification}
                    onChange={(e) => setEditingCertification({ ...editingCertification, urlVerification: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-action">
                <button className="btn btn-ghost" onClick={() => { setShowModal(false); setEditingCertification(null); }}>
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </button>
                <button className="btn btn-primary" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  {editingCertification.id ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmation de suppression */}
        {showDeleteModal && certificationToDelete && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Confirmer la suppression</h3>
              <p className="py-4">
                Êtes-vous sûr de vouloir supprimer la certification <strong>{certificationToDelete.intitule}</strong> ?
              </p>
              <div className="modal-action">
                <button className="btn btn-ghost" onClick={() => { setShowDeleteModal(false); setCertificationToDelete(null); }}>
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

export default GererCertifications;
