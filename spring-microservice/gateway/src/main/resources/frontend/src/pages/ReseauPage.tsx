import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, CheckCircle2, UserMinus, Users } from 'lucide-react';
import { useHeaderConfig } from '@/hooks/useHeaderConfig';

interface Expertise {
  utilisateurId: string;
  titre: string;
  description: string;
  photoUrl?: string;
  localisation?: string;
  disponible: boolean;
  typePersonne?: string;
  competences?: Array<{
    nom: string;
  }>;
}

export default function ReseauPage() {
  const [expertsReseau, setExpertsReseau] = useState<Expertise[]>([]);
  const [loading, setLoading] = useState(true);

  useHeaderConfig({
    title: "Mon réseau d'experts",
  });

  useEffect(() => {
    chargerExpertsReseau();
  }, []);

  const chargerExpertsReseau = async () => {
    try {
      setLoading(true);
      
      // Charger les experts du réseau depuis l'API
      const response = await fetch('/api/expertise/reseau');
      
      if (response.ok) {
        const data = await response.json();
        setExpertsReseau(Array.isArray(data) ? data : []);
      } else {
        setExpertsReseau([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des experts du réseau:', error);
      setExpertsReseau([]);
    } finally {
      setLoading(false);
    }
  };

  const retirerDuReseau = async (utilisateurId: string) => {
    try {
      const response = await fetch(`/api/expertise/reseau/${utilisateurId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Mettre à jour l'état
        setExpertsReseau(prev => prev.filter(exp => exp.utilisateurId !== utilisateurId));
      }
    } catch (error) {
      console.error('Erreur lors du retrait de l\'expert du réseau:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-96">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {expertsReseau.length === 0 && !loading ? (
          <div className="text-center py-16">
            <Users className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Aucun expert dans votre réseau
            </h3>
            <p className="text-gray-500 mb-6">
              Vous n'avez pas encore ajouté d'experts à votre réseau
            </p>
            <Link to="/rechercher" className="btn btn-primary">
              Rechercher des experts
            </Link>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {expertsReseau.map((expert) => (
                <div 
                  key={expert.utilisateurId} 
                  className="card bg-base-100 shadow-lg hover:shadow-xl transition-all border border-base-300"
                >
                  <div className="card-body p-4">
                    {/* En-tête */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="avatar">
                        <div className="w-16 h-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                          {expert.photoUrl ? (
                            <img src={expert.photoUrl} alt={expert.titre} />
                          ) : (
                            <div className="bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-2xl">
                              {expert.titre.charAt(0)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link 
                          to={`/expertise-profil/${expert.utilisateurId}`}
                          className="font-bold text-base hover:text-primary transition-colors line-clamp-2"
                        >
                          {expert.titre}
                        </Link>
                        {expert.disponible && (
                          <div className="badge badge-success badge-sm gap-1 mt-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Disponible
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Localisation */}
                    {expert.localisation && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{expert.localisation}</span>
                      </div>
                    )}

                    {/* Compétences */}
                    {expert.competences && expert.competences.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {expert.competences.slice(0, 3).map((comp, idx) => (
                            <span key={idx} className="badge badge-primary badge-xs">
                              {comp.nom}
                            </span>
                          ))}
                          {expert.competences.length > 3 && (
                            <span className="badge badge-ghost badge-xs">
                              +{expert.competences.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-base-300">
                      <Link
                        to={`/expertise-profil/${expert.utilisateurId}`}
                        className="btn btn-primary btn-sm flex-1"
                      >
                        Voir profil
                      </Link>
                      <button
                        onClick={() => retirerDuReseau(expert.utilisateurId)}
                        className="btn btn-outline btn-error btn-sm"
                        title="Retirer du réseau"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
