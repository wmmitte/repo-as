import { useState, useEffect } from 'react';
import { Utilisateur, Expert, Client } from '@/types/utilisateur.types';
import { utilisateurService } from '@/services/utilisateur.service';

interface ProfilUtilisateurProps {
  utilisateurId?: string;
}

export default function ProfilUtilisateur({ utilisateurId }: ProfilUtilisateurProps) {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [ongletActif, setOngletActif] = useState('apropos');
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    chargerProfil();
  }, [utilisateurId]);

  const chargerProfil = async () => {
    try {
      setChargement(true);
      
      let idUtilisateur = utilisateurId;
      
      // Si pas d'ID fourni, utiliser l'utilisateur connecté
      if (!idUtilisateur) {
        const utilisateurConnecte = localStorage.getItem('pitm_utilisateur');
        if (utilisateurConnecte) {
          const userData = JSON.parse(utilisateurConnecte);
          idUtilisateur = userData.id;
        }
      }
      
      if (idUtilisateur) {
        const profil = await utilisateurService.obtenirProfil(idUtilisateur);
        setUtilisateur(profil);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    } finally {
      setChargement(false);
    }
  };

  if (chargement) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!utilisateur) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Profil non trouvé</p>
      </div>
    );
  }

  const onglets = utilisateur.type === 'expert' 
    ? [
        { 
          id: 'apropos', 
          label: 'À propos', 
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )
        },
        { 
          id: 'competences', 
          label: 'Compétences', 
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        },
        { 
          id: 'portfolio', 
          label: 'Portfolio', 
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          )
        }
      ]
    : [
        { 
          id: 'apropos', 
          label: 'À propos', 
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )
        },
        { 
          id: 'entreprise', 
          label: 'Entreprise', 
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          )
        },
        { 
          id: 'projets', 
          label: 'Projets', 
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )
        }
      ];

  const renduEnTete = () => (
    <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
      <div className="flex items-start gap-6">
        {/* Avatar */}
        <div className="relative">
          <img
            src={utilisateur.avatar || `https://i.pravatar.cc/200?u=${utilisateur.id}`}
            alt={`${utilisateur.prenom} ${utilisateur.nom}`}
            className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-lg"
          />
          {utilisateur.isVerified && (
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>

        {/* Informations principales */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {utilisateur.prenom} {utilisateur.nom}
          </h1>
          
          {utilisateur.type === 'expert' && (
            <div className="mb-3">
              <p className="text-lg text-primary font-semibold mb-1">
                {(utilisateur as Expert).domaineExpertise ? 
                  (utilisateur as Expert).domaineExpertise.charAt(0).toUpperCase() + 
                  (utilisateur as Expert).domaineExpertise.slice(1).replace('-', ' ') 
                  : 'Expert'
                }
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Burkina Faso
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  {(utilisateur as Expert).stats.tauxReussite}% réussite
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  {(utilisateur as Expert).tarifHoraire} FCFA/h
                </span>
              </div>
            </div>
          )}

          {utilisateur.type === 'client' && (
            <div className="mb-3">
              <p className="text-lg text-primary font-semibold mb-1">
                {(utilisateur as Client).poste} chez {(utilisateur as Client).nomEntreprise}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {(utilisateur as Client).secteurActivite}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {(utilisateur as Client).tailleEntreprise}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {utilisateur.email}
                </span>
              </div>
            </div>
          )}

          {/* Statistiques */}
          {utilisateur.type === 'expert' && (
            <div className="grid grid-cols-3 gap-6 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{(utilisateur as Expert).stats.projetsRealises}</p>
                <p className="text-sm text-gray-600">Projets réalisés</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{(utilisateur as Expert).stats.clientsSatisfaits}</p>
                <p className="text-sm text-gray-600">Clients satisfaits</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{(utilisateur as Expert).stats.anciennete}</p>
                <p className="text-sm text-gray-600">Années d'exp.</p>
              </div>
            </div>
          )}

          {utilisateur.type === 'client' && (
            <div className="grid grid-cols-2 gap-6 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{(utilisateur as Client).projetsPublies}</p>
                <p className="text-sm text-gray-600">Projets publiés</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{(utilisateur as Client).expertsEmbauches}</p>
                <p className="text-sm text-gray-600">Experts embauchés</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-800 transition-colors">
            Contacter
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Partager
          </button>
        </div>
      </div>
    </div>
  );

  const renduOnglets = () => (
    <div className="bg-white rounded-xl shadow-sm border mb-6">
      <div className="flex border-b border-gray-200">
        {onglets.map((onglet) => (
          <button
            key={onglet.id}
            onClick={() => setOngletActif(onglet.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 transition-colors relative ${
              ongletActif === onglet.id
                ? 'text-primary bg-primary/5'
                : 'text-gray-600 hover:text-gray-700'
            }`}
          >
            <span>{onglet.icon}</span>
            <span className="font-medium">{onglet.label}</span>
            {ongletActif === onglet.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const renduContenuExpert = () => {
    const expert = utilisateur as Expert;
    
    switch (ongletActif) {
      case 'apropos':
        return (
          <div className="space-y-6">
            {/* Bio */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">À propos</h3>
              <p className="text-gray-700 leading-relaxed">{expert.bio}</p>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700">{expert.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-700">{expert.telephone}</span>
                </div>
                {expert.portfolio && (
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <a href={expert.portfolio} className="text-primary hover:underline">
                      Portfolio
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'competences':
        return (
          <div className="space-y-6">
            {/* Compétences */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Compétences principales</h3>
              <div className="flex flex-wrap gap-2">
                {expert.competences.map((competence, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                  >
                    {competence}
                  </span>
                ))}
              </div>
            </div>

            {/* Langues */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Langues</h3>
              <div className="space-y-2">
                {expert.langues.map((langue, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-gray-700">{langue}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Disponibilité */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Disponibilité</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                expert.disponibilite === 'indisponible' 
                  ? 'bg-primary/10 text-primary'
                  : 'bg-green-100 text-green-700'
              }`}>
                {expert.disponibilite?.charAt(0).toUpperCase() + expert.disponibilite?.slice(1).replace('-', ' ') || 'Non spécifiée'}
              </span>
            </div>
          </div>
        );

      case 'portfolio':
        return (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio</h3>
            <div className="text-center py-8 text-gray-600">
              <p>Aucun projet ajouté pour le moment</p>
              <p className="text-sm mt-2">Les projets apparaîtront ici une fois ajoutés</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renduContenuClient = () => {
    const client = utilisateur as Client;
    
    switch (ongletActif) {
      case 'apropos':
        return (
          <div className="space-y-6">
            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">À propos</h3>
              <p className="text-gray-700 leading-relaxed">{client.description}</p>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700">{client.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-700">{client.telephone}</span>
                </div>
                {client.adresse && (
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-700">{client.adresse}</span>
                  </div>
                )}
                {client.siteWeb && (
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <a href={client.siteWeb} className="text-primary hover:underline">
                      Site web
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'entreprise':
        return (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Informations entreprise</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Nom de l'entreprise</p>
                <p className="text-gray-900">{client.nomEntreprise}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Secteur d'activité</p>
                <p className="text-gray-900">{client.secteurActivite}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Taille de l'entreprise</p>
                <p className="text-gray-900">{client.tailleEntreprise}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Poste</p>
                <p className="text-gray-900">{client.poste}</p>
              </div>
            </div>
          </div>
        );

      case 'projets':
        return (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Projets publiés</h3>
            <div className="text-center py-8 text-gray-600">
              <p>Aucun projet publié pour le moment</p>
              <p className="text-sm mt-2">Les projets apparaîtront ici une fois publiés</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {renduEnTete()}
      {renduOnglets()}
      <div>
        {utilisateur.type === 'expert' ? renduContenuExpert() : renduContenuClient()}
      </div>
    </div>
  );
}