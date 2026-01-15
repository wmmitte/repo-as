import { Projet, Tache, Livrable, PropositionProjet } from '@/types/projet.types';

// Données factices pour le développement
const creerTacheFactice = (id: string, nom: string): Tache => ({
  id,
  nom,
  description: `Description détaillée de la tâche ${nom}`,
  ressources: {
    budget: Math.floor(Math.random() * 10000) + 2000,
    expertsRequis: [`expert_${Math.floor(Math.random() * 5) + 1}`],
    duree: Math.floor(Math.random() * 30) + 5
  },
  livrables: [
    {
      id: `livrable_${id}_1`,
      nom: `Livrable ${nom}`,
      description: `Document ou produit livrable pour ${nom}`,
      criteres: [
        {
          id: `critere_${id}_1`,
          description: 'Respect des spécifications techniques',
          statut: 'en_attente'
        },
        {
          id: `critere_${id}_2`, 
          description: 'Tests unitaires passants',
          statut: 'en_attente'
        }
      ],
      statut: 'non_fourni'
    }
  ],
  statut: Math.random() > 0.5 ? 'en_cours' : 'non_commencee',
  progression: Math.floor(Math.random() * 100)
});

const creerProjetFactice = (id: string, nom: string): Projet => ({
  id,
  nom,
  description: `Description détaillée du projet ${nom}`,
  duree: Math.floor(Math.random() * 180) + 30,
  budget: Math.floor(Math.random() * 100000) + 10000,
  exigences: [
    { id: `exigence_${id}_1`, description: 'Interface utilisateur intuitive' },
    { id: `exigence_${id}_2`, description: 'Performance optimale' },
    { id: `exigence_${id}_3`, description: 'Sécurité renforcée' }
  ],
  taches: [
    creerTacheFactice(`tache_${id}_1`, 'Analyse et conception'),
    creerTacheFactice(`tache_${id}_2`, 'Développement'),
    creerTacheFactice(`tache_${id}_3`, 'Tests et validation')
  ],
  statut: 'planification',
  dateCreation: new Date().toISOString(),
  progression: Math.floor(Math.random() * 100),
  proprietaireId: 'utilisateur_1'
});

export const projetService = {
  /**
   * Récupère tous les projets de l'utilisateur
   */
  obtenirProjets: async (): Promise<Projet[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const projets = [
          creerProjetFactice('projet_1', 'Application Mobile E-commerce'),
          creerProjetFactice('projet_2', 'Plateforme de Formation en Ligne'),
          creerProjetFactice('projet_3', 'Système de Gestion de Stock')
        ];
        resolve(projets);
      }, 500);
    });
  },

  /**
   * Récupère un projet par son ID
   */
  obtenirProjet: async (id: string): Promise<Projet | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (id === 'nouveau') {
          resolve(null);
        } else {
          resolve(creerProjetFactice(id, `Projet ${id}`));
        }
      }, 300);
    });
  },

  /**
   * Crée un nouveau projet
   */
  creerProjet: async (projet: Omit<Projet, 'id' | 'dateCreation' | 'progression' | 'statut' | 'taches'>): Promise<Projet> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nouveauProjet: Projet = {
          ...projet,
          id: `projet_${Date.now()}`,
          dateCreation: new Date().toISOString(),
          progression: 0,
          statut: 'planification',
          taches: []
        };
        resolve(nouveauProjet);
      }, 800);
    });
  },

  /**
   * Met à jour un projet
   */
  mettreAJourProjet: async (id: string, projet: Partial<Projet>): Promise<Projet> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const projetMisAJour = {
          ...creerProjetFactice(id, 'Projet Mis à Jour'),
          ...projet,
          id
        };
        resolve(projetMisAJour);
      }, 600);
    });
  },

  /**
   * Ajoute une tâche à un projet
   */
  ajouterTache: async (_projetId: string, tache: Omit<Tache, 'id'>): Promise<Tache> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nouvelleTache: Tache = {
          ...tache,
          id: `tache_${Date.now()}`
        };
        resolve(nouvelleTache);
      }, 400);
    });
  },

  /**
   * Met à jour une tâche
   */
  mettreAJourTache: async (tacheId: string, tache: Partial<Tache>): Promise<Tache> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const tacheMiseAJour = {
          ...creerTacheFactice(tacheId, 'Tâche Mise à Jour'),
          ...tache,
          id: tacheId
        };
        resolve(tacheMiseAJour);
      }, 400);
    });
  },

  /**
   * Soumet un livrable
   */
  soumettrelivrable: async (livrableId: string, fichierUrl: string, commentaire?: string): Promise<Livrable> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const livrable: Livrable = {
          id: livrableId,
          nom: 'Livrable soumis',
          description: 'Description du livrable',
          criteres: [],
          statut: 'fourni',
          fichierUrl,
          dateForniture: new Date().toISOString(),
          commentaires: commentaire
        };
        resolve(livrable);
      }, 600);
    });
  },

  /**
   * Propose un projet à un expert
   */
  proposerProjetAExpert: async (
    expertId: string, 
    _projetId: string, 
    tachesSelectionnees: string[], 
    message?: string
  ): Promise<PropositionProjet> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const proposition: PropositionProjet = {
          id: `proposition_${Date.now()}`,
          projetId: _projetId,
          expertId,
          tachesSelectionnees,
          message,
          statut: 'en_attente',
          dateProposition: new Date().toISOString()
        };
        console.log('Proposition envoyée à l\'expert:', proposition);
        resolve(proposition);
      }, 500);
    });
  }
};