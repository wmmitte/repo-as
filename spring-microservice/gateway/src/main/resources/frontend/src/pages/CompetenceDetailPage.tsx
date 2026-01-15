import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, XCircle, AlertCircle, DollarSign, Calendar, Briefcase } from 'lucide-react';
import type { CompetenceUtilisateur, PropositionProjet } from '@/types/competence.types';

export default function CompetenceDetailPage() {
  const { competenceId } = useParams<{ competenceId: string }>();
  const navigate = useNavigate();

  const [competence, setCompetence] = useState<CompetenceUtilisateur | null>(null);
  const [propositions, setPropositions] = useState<PropositionProjet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    chargerDonneesCompetence();
  }, [competenceId]);

  const chargerDonneesCompetence = () => {
    setIsLoading(true);

    try {
      // Charger la compétence depuis localStorage
      const utilisateur = JSON.parse(localStorage.getItem('pitm_utilisateur') || '{}');
      const competences = utilisateur.competences || [];

      // Trouver la compétence correspondante
      const compTrouvee = competences.find((c: any) => c === competenceId);

      if (compTrouvee) {
        // Créer l'objet CompetenceUtilisateur
        const comp: CompetenceUtilisateur = {
          id: `user_comp_${compTrouvee}`,
          competenceId: competenceId || '',
          nom: compTrouvee,
          description: `Compétence en ${compTrouvee}`,
          nombreDemandes: Math.floor(Math.random() * 15) + 1,
          dateAjout: new Date().toISOString()
        };
        setCompetence(comp);

        // Charger les propositions (données fictives)
        chargerPropositions(competenceId || '');
      } else {
        // Compétence non trouvée
        setCompetence(null);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const chargerPropositions = (compId: string) => {
    // Générer des propositions fictives basées sur l'ID de compétence
    const propositionsFactices: PropositionProjet[] = [
      {
        id: 'prop_1',
        competenceId: compId,
        nomProjet: 'Développement d\'une plateforme e-commerce',
        descriptionProjet: 'Création d\'une boutique en ligne moderne avec panier, paiement et gestion des commandes. Interface responsive et performante.',
        nomClient: 'Sarah Ouedraogo',
        emailClient: 'sarah.o@entreprise.bf',
        avatarClient: 'https://i.pravatar.cc/200?u=sarah',
        entrepriseClient: 'TechStore BF',
        budget: 2500000,
        devise: 'FCFA',
        dureeEstimee: '6 semaines',
        dateProposition: '2025-01-28',
        statut: 'en_attente',
        priorite: 'haute',
        type: 'projet'
      },
      {
        id: 'prop_2',
        competenceId: compId,
        nomProjet: 'Correction de bugs sur application',
        descriptionProjet: 'Résoudre 5 bugs identifiés dans notre application de gestion. Liste détaillée fournie.',
        nomClient: 'Moussa Traoré',
        emailClient: 'moussa.t@startup.bf',
        entrepriseClient: 'StartupHub',
        budget: 150000,
        devise: 'FCFA',
        dureeEstimee: '1 semaine',
        dateProposition: '2025-01-27',
        statut: 'en_attente',
        priorite: 'normale',
        type: 'tache'
      },
      {
        id: 'prop_3',
        competenceId: compId,
        nomProjet: 'API REST pour application mobile',
        descriptionProjet: 'Développement d\'une API backend complète avec authentification, gestion utilisateurs et base de données MongoDB.',
        nomClient: 'Aminata Kaboré',
        emailClient: 'aminata.k@mobile.bf',
        entrepriseClient: 'MobileFirst',
        budget: 1800000,
        devise: 'FCFA',
        dureeEstimee: '4 semaines',
        dateProposition: '2025-01-26',
        statut: 'en_attente',
        priorite: 'haute',
        type: 'projet'
      },
      {
        id: 'prop_4',
        competenceId: compId,
        nomProjet: 'Optimisation des performances',
        descriptionProjet: 'Améliorer les temps de chargement et optimiser les requêtes de notre application web existante.',
        nomClient: 'Ibrahim Sawadogo',
        emailClient: 'ibrahim.s@tech.bf',
        entrepriseClient: 'WebTech',
        budget: 500000,
        devise: 'FCFA',
        dureeEstimee: '2 semaines',
        dateProposition: '2025-01-25',
        statut: 'en_attente',
        priorite: 'normale',
        type: 'tache'
      }
    ];

    setPropositions(propositionsFactices);
  };

  const traiterProposition = (propId: string, decision: 'accepte' | 'refuse') => {
    setPropositions(prev => prev.map(prop =>
      prop.id === propId ? { ...prop, statut: decision } : prop
    ));

    // Simulation d'envoi de notification au client
    console.log(`Notification envoyée pour proposition ${propId}: ${decision}`);
    alert(`Proposition ${decision === 'accepte' ? 'acceptée' : 'refusée'}. Le client a été notifié.`);
  };

  const retourner = () => {
    navigate('/expertise');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!competence) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <AlertCircle size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Compétence non trouvée</h2>
          <p className="text-gray-600 mb-6">Cette compétence n'existe pas ou a été supprimée.</p>
          <button
            onClick={retourner}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-800 transition-colors"
          >
            <ArrowLeft size={20} />
            Retour aux compétences
          </button>
        </div>
      </div>
    );
  }

  const propositionsEnAttente = propositions.filter(p => p.statut === 'en_attente');
  const propositionsAcceptees = propositions.filter(p => p.statut === 'accepte');
  const propositionsRefusees = propositions.filter(p => p.statut === 'refuse');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête avec bouton retour */}
      <div className="mb-6">
        <button
          onClick={retourner}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          Retour aux compétences
        </button>

        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{competence.nom}</h1>
              <p className="text-gray-600 mb-4">{competence.description}</p>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Briefcase size={16} className="text-gray-600" />
                  <span className="text-gray-700">
                    {propositions.length} {propositions.length > 1 ? 'propositions' : 'proposition'}
                  </span>
                </div>
                {propositionsEnAttente.length > 0 && (
                  <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-medium">
                    {propositionsEnAttente.length} en attente
                  </div>
                )}
                {propositionsAcceptees.length > 0 && (
                  <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                    {propositionsAcceptees.length} acceptée{propositionsAcceptees.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>

            {propositionsEnAttente.length > 0 && (
              <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg animate-pulse">
                {propositionsEnAttente.length}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filtres/Onglets */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button className="flex-1 px-6 py-4 font-medium text-primary bg-primary/5 border-b-2 border-primary whitespace-nowrap">
            Toutes ({propositions.length})
          </button>
          <button className="flex-1 px-6 py-4 font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 whitespace-nowrap">
            En attente ({propositionsEnAttente.length})
          </button>
          <button className="flex-1 px-6 py-4 font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 whitespace-nowrap">
            Acceptées ({propositionsAcceptees.length})
          </button>
          <button className="flex-1 px-6 py-4 font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 whitespace-nowrap">
            Refusées ({propositionsRefusees.length})
          </button>
        </div>
      </div>

      {/* Liste des propositions */}
      <div className="space-y-6">
        {propositions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600">Aucune proposition pour cette compétence</p>
            <p className="text-sm text-gray-500 mt-1">
              Les clients pourront vous soumettre des projets nécessitant {competence.nom}
            </p>
          </div>
        ) : (
          propositions.map((prop) => (
            <div
              key={prop.id}
              className={`bg-white rounded-xl shadow-sm border-2 p-6 transition-all hover:shadow-md ${
                prop.statut === 'en_attente'
                  ? 'border-gray-300'
                  : prop.statut === 'accepte'
                  ? 'border-green-200 bg-green-50/50'
                  : 'border-red-200 bg-red-50/50'
              }`}
            >
              {/* Informations client */}
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={prop.avatarClient || 'https://i.pravatar.cc/100'}
                  alt={prop.nomClient}
                  className="w-16 h-16 rounded-full border-2 border-gray-200"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{prop.nomClient}</h3>
                      {prop.entrepriseClient && (
                        <p className="text-sm text-gray-600">{prop.entrepriseClient}</p>
                      )}
                      <p className="text-xs text-gray-500">{prop.emailClient}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {prop.type === 'projet' ? (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          Projet
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                          Tâche
                        </span>
                      )}
                      {prop.priorite === 'haute' && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                          Urgent
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Détails du projet */}
              <div className="mb-4">
                <h4 className="font-bold text-gray-900 text-xl mb-2">{prop.nomProjet}</h4>
                <p className="text-gray-700">{prop.descriptionProjet}</p>
              </div>

              {/* Informations complémentaires */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                {prop.budget && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <DollarSign size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Budget</p>
                      <p className="font-bold text-gray-900">
                        {prop.budget.toLocaleString()} {prop.devise}
                      </p>
                    </div>
                  </div>
                )}
                {prop.dureeEstimee && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <Calendar size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Durée estimée</p>
                      <p className="font-bold text-gray-900">{prop.dureeEstimee}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <AlertCircle size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Proposé le</p>
                    <p className="font-bold text-gray-900">
                      {new Date(prop.dateProposition).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {prop.statut === 'en_attente' ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => traiterProposition(prop.id, 'accepte')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                  >
                    <Check size={20} />
                    Accepter
                  </button>
                  <button
                    onClick={() => traiterProposition(prop.id, 'refuse')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                  >
                    <XCircle size={20} />
                    Refuser
                  </button>
                </div>
              ) : (
                <div className={`text-center py-3 rounded-lg font-medium ${
                  prop.statut === 'accepte'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {prop.statut === 'accepte' ? '✓ Proposition acceptée' : '✗ Proposition refusée'}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
