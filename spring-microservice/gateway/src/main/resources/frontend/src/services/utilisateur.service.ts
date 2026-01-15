import { 
  Utilisateur, 
  Expert, 
  Client, 
  FormulaireInscription, 
  ReponseInscription, 
  ReponseConnexion,
  DOMAINES_EXPERTISE 
} from '@/types/utilisateur.types';

// Fonction utilitaire pour générer des données factices
const genererExpertFactice = (id: string, infos: FormulaireInscription): Expert => {
  const { informationsPersonnelles, informationsExpert } = infos;
  
  return {
    id,
    type: 'expert',
    // Informations personnelles
    prenom: informationsPersonnelles.prenom || '',
    nom: informationsPersonnelles.nom || '',
    email: informationsPersonnelles.email || '',
    telephone: informationsPersonnelles.telephone || '',
    motDePasse: informationsPersonnelles.motDePasse || '',
    confirmMotDePasse: informationsPersonnelles.confirmMotDePasse || '',
    
    // Informations expert
    domaineExpertise: informationsExpert.domaineExpertise || '',
    competences: informationsExpert.competences || [],
    formation: informationsExpert.formation || '',
    tarifHoraire: informationsExpert.tarifHoraire || 0,
    disponibilite: informationsExpert.disponibilite || '',
    portfolio: informationsExpert.portfolio || '',
    certifications: informationsExpert.certifications || [],
    langues: informationsExpert.langues || ['Français (natif)'],
    bio: informationsExpert.bio || '',
    domainesInteret: informationsExpert.domainesInteret || [],
    
    // Métadonnées
    avatar: `https://i.pravatar.cc/200?u=${id}`,
    isVerified: Math.random() > 0.7,
    dateInscription: new Date().toISOString(),
    stats: {
      projetsRealises: Math.floor(Math.random() * 50) + 1,
      clientsSatisfaits: Math.floor(Math.random() * 40) + 1,
      tauxReussite: Math.floor(Math.random() * 20) + 80,
      anciennete: Math.floor(Math.random() * 10) + 1
    },
    avis: [],
    portfolioItems: []
  };
};

const genererClientFactice = (id: string, infos: FormulaireInscription): Client => {
  const { informationsPersonnelles, informationsClient } = infos;
  
  return {
    id,
    type: 'client',
    // Informations personnelles
    prenom: informationsPersonnelles.prenom || '',
    nom: informationsPersonnelles.nom || '',
    email: informationsPersonnelles.email || '',
    telephone: informationsPersonnelles.telephone || '',
    motDePasse: informationsPersonnelles.motDePasse || '',
    confirmMotDePasse: informationsPersonnelles.confirmMotDePasse || '',
    
    // Informations client
    nomEntreprise: informationsClient.nomEntreprise || '',
    secteurActivite: informationsClient.secteurActivite || '',
    tailleEntreprise: informationsClient.tailleEntreprise || '',
    poste: informationsClient.poste || '',
    adresse: informationsClient.adresse || '',
    siteWeb: informationsClient.siteWeb || '',
    description: informationsClient.description || '',
    
    // Métadonnées
    avatar: `https://i.pravatar.cc/200?u=${id}`,
    isVerified: Math.random() > 0.8,
    dateInscription: new Date().toISOString(),
    projetsPublies: Math.floor(Math.random() * 20) + 1,
    expertsEmbauches: Math.floor(Math.random() * 15) + 1
  };
};

// Simulation d'une base de données locale
let utilisateursSimules: Utilisateur[] = [];

// Génération d'experts factices pour tests
const genererExpertsFactices = () => {
  const expertsFactices: Expert[] = [];
  
  for (let i = 1; i <= 20; i++) {
    const domaineAleatoire = DOMAINES_EXPERTISE[Math.floor(Math.random() * DOMAINES_EXPERTISE.length)];
    const competencesDisponibles = ['React', 'Node.js', 'TypeScript', 'Python', 'Java', 'PHP', 'Angular', 'Vue.js'];
    const competencesAleatoires = competencesDisponibles.slice(0, Math.floor(Math.random() * 4) + 1);
    
    const expert = genererExpertFactice(`expert_${i}`, {
      etapeActuelle: 3,
      typeCompte: 'expert',
      informationsPersonnelles: {
        prenom: `Expert${i}`,
        nom: `Dupont`,
        email: `expert${i}@pitm.com`,
        telephone: `+226 70 86 73 ${i.toString().padStart(2, '0')}`,
        motDePasse: 'password123',
        confirmMotDePasse: 'password123'
      },
      informationsExpert: {
        domaineExpertise: domaineAleatoire.value,
        competences: competencesAleatoires,
        tarifHoraire: Math.floor(Math.random() * 10000) + 3000,
        disponibilite: ['temps-plein', 'temps-partiel', 'mission-courte'][Math.floor(Math.random() * 3)],
        bio: `Expert passionné en ${domaineAleatoire.label}.`,
        certifications: [],
        langues: ['Français (natif)', 'Anglais (courant)'],
        domainesInteret: [domaineAleatoire.value]
      },
      informationsClient: {},
      errors: {},
      isLoading: false
    });
    
    expertsFactices.push(expert);
  }
  
  return expertsFactices;
};

// Initialiser avec des données factices
utilisateursSimules = genererExpertsFactices();

export const utilisateurService = {
  /**
   * Inscription d'un nouvel utilisateur
   */
  inscrire: async (formulaire: FormulaireInscription): Promise<ReponseInscription> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Vérifier si l'email existe déjà
          const emailExiste = utilisateursSimules.find(
            u => u.email === formulaire.informationsPersonnelles.email
          );
          
          if (emailExiste) {
            reject({
              success: false,
              message: 'Cet email est déjà utilisé'
            });
            return;
          }
          
          // Générer un nouvel utilisateur
          const nouvelId = `${formulaire.typeCompte}_${Date.now()}`;
          let nouvelUtilisateur: Utilisateur;
          
          if (formulaire.typeCompte === 'expert') {
            nouvelUtilisateur = genererExpertFactice(nouvelId, formulaire) as Expert;
          } else {
            nouvelUtilisateur = genererClientFactice(nouvelId, formulaire) as Client;
          }
          
          // Ajouter à la "base de données"
          utilisateursSimules.push(nouvelUtilisateur);
          
          // Générer un token factice
          const token = `token_${nouvelId}_${Date.now()}`;
          
          resolve({
            success: true,
            utilisateur: nouvelUtilisateur,
            token,
            message: 'Inscription réussie ! Bienvenue sur PITM.'
          });
          
        } catch (error) {
          reject({
            success: false,
            message: 'Erreur lors de l\'inscription'
          });
        }
      }, 1500); // Simulation latence réseau
    });
  },

  /**
   * Connexion d'un utilisateur
   */
  connecter: async (email: string, motDePasse: string): Promise<ReponseConnexion> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Chercher l'utilisateur
        const utilisateur = utilisateursSimules.find(u => u.email === email);
        
        if (!utilisateur) {
          reject({
            success: false,
            message: 'Email ou mot de passe incorrect'
          });
          return;
        }
        
        // Vérifier le mot de passe (en prod, utiliser un hash)
        if (utilisateur.motDePasse !== motDePasse) {
          reject({
            success: false,
            message: 'Email ou mot de passe incorrect'
          });
          return;
        }
        
        // Générer un token factice
        const token = `token_${utilisateur.id}_${Date.now()}`;
        
        resolve({
          success: true,
          utilisateur,
          token,
          message: 'Connexion réussie'
        });
        
      }, 1000);
    });
  },

  /**
   * Récupérer le profil d'un utilisateur
   */
  obtenirProfil: async (utilisateurId: string): Promise<Utilisateur | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const utilisateur = utilisateursSimules.find(u => u.id === utilisateurId);
        resolve(utilisateur || null);
      }, 500);
    });
  },

  /**
   * Mettre à jour le profil d'un utilisateur
   */
  mettreAJourProfil: async (utilisateurId: string, donneesModifiees: Partial<Utilisateur>): Promise<Utilisateur> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = utilisateursSimules.findIndex(u => u.id === utilisateurId);
        
        if (index === -1) {
          reject(new Error('Utilisateur non trouvé'));
          return;
        }
        
        // Mettre à jour l'utilisateur
        utilisateursSimules[index] = {
          ...utilisateursSimules[index],
          ...donneesModifiees
        } as Utilisateur;
        
        resolve(utilisateursSimules[index]);
      }, 800);
    });
  },

  /**
   * Rechercher des experts
   */
  rechercherExperts: async (filtres?: {
    domaine?: string;
    competences?: string[];
    tarifMax?: number;
    disponibilite?: string;
  }): Promise<Expert[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let expertsFiltrés = utilisateursSimules.filter(u => u.type === 'expert') as Expert[];
        
        if (filtres) {
          if (filtres.domaine) {
            expertsFiltrés = expertsFiltrés.filter(e => e.domaineExpertise === filtres.domaine);
          }
          
          if (filtres.competences && filtres.competences.length > 0) {
            expertsFiltrés = expertsFiltrés.filter(e => 
              filtres.competences!.some(comp => 
                e.competences.some(eComp => 
                  eComp.toLowerCase().includes(comp.toLowerCase())
                )
              )
            );
          }
          
          if (filtres.tarifMax) {
            expertsFiltrés = expertsFiltrés.filter(e => e.tarifHoraire <= filtres.tarifMax!);
          }

          if (filtres.disponibilite) {
            expertsFiltrés = expertsFiltrés.filter(e => e.disponibilite === filtres.disponibilite);
          }
        }
        
        // Trier par rating/réputation
        expertsFiltrés.sort((a, b) => b.stats.tauxReussite - a.stats.tauxReussite);
        
        resolve(expertsFiltrés);
      }, 600);
    });
  },

  /**
   * Changer le mot de passe d'un utilisateur
   */
  changerMotDePasse: async (
    utilisateurId: string,
    ancienMotDePasse: string,
    nouveauMotDePasse: string
  ): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const utilisateur = utilisateursSimules.find(u => u.id === utilisateurId);

        if (!utilisateur) {
          reject({
            success: false,
            message: 'Utilisateur non trouvé'
          });
          return;
        }

        // Vérifier l'ancien mot de passe
        if (utilisateur.motDePasse !== ancienMotDePasse) {
          reject({
            success: false,
            message: 'L\'ancien mot de passe est incorrect'
          });
          return;
        }

        // Mettre à jour le mot de passe
        utilisateur.motDePasse = nouveauMotDePasse;
        utilisateur.confirmMotDePasse = nouveauMotDePasse;

        resolve({
          success: true,
          message: 'Mot de passe modifié avec succès'
        });
      }, 800);
    });
  },

  /**
   * Obtenir les statistiques générales
   */
  obtenirStatistiques: async (): Promise<{
    totalExperts: number;
    totalClients: number;
    expertsDispo: number;
    domainesPopulaires: { domaine: string; count: number }[];
  }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const experts = utilisateursSimules.filter(u => u.type === 'expert') as Expert[];
        const clients = utilisateursSimules.filter(u => u.type === 'client') as Client[];

        const expertsDispo = experts.filter(e =>
          e.disponibilite && e.disponibilite !== 'indisponible'
        ).length;

        // Compter les domaines populaires
        const compteurDomaines: Record<string, number> = {};
        experts.forEach(expert => {
          if (expert.domaineExpertise) {
            compteurDomaines[expert.domaineExpertise] = (compteurDomaines[expert.domaineExpertise] || 0) + 1;
          }
        });

        const domainesPopulaires = Object.entries(compteurDomaines)
          .map(([domaine, count]) => ({ domaine, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        resolve({
          totalExperts: experts.length,
          totalClients: clients.length,
          expertsDispo,
          domainesPopulaires
        });
      }, 400);
    });
  }
};