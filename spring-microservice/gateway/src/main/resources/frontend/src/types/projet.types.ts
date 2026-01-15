export interface Exigence {
  id: string;
  description: string;
}

export interface CritereAcceptation {
  id: string;
  description: string;
  statut: 'en_attente' | 'accepte' | 'rejete';
  commentaire?: string;
}

export interface Livrable {
  id: string;
  nom: string;
  description: string;
  criteres: CritereAcceptation[];
  statut: 'non_fourni' | 'fourni' | 'accepte' | 'rejete';
  fichierUrl?: string;
  dateForniture?: string;
  commentaires?: string;
}

export interface RessourceTache {
  budget: number;
  expertsRequis: string[]; // IDs des experts
  duree: number; // en jours
}

export interface Tache {
  id: string;
  nom: string;
  description: string;
  ressources: RessourceTache;
  livrables: Livrable[];
  statut: 'non_commencee' | 'en_cours' | 'terminee' | 'bloquee';
  dateDebut?: string;
  dateFin?: string;
  progression: number; // 0-100
}

export interface Projet {
  id: string;
  nom: string;
  description: string;
  duree: number; // en jours
  budget: number;
  exigences: Exigence[];
  taches: Tache[];
  statut: 'planification' | 'execution' | 'suivi' | 'termine' | 'suspendu';
  dateCreation: string;
  dateDebutPrevue?: string;
  dateFinPrevue?: string;
  progression: number; // 0-100
  proprietaireId: string;
}

export interface PropositionProjet {
  id: string;
  projetId: string;
  expertId: string;
  tachesSelectionnees: string[]; // IDs des tâches
  message?: string;
  statut: 'en_attente' | 'acceptee' | 'refusee';
  dateProposition: string;
}

export interface NotificationExpert {
  id: string;
  expertId: string;
  type: 'proposition_projet' | 'livrable_soumis' | 'commentaire';
  projetId?: string;
  propositionId?: string;
  message: string;
  lu: boolean;
  dateCreation: string;
}