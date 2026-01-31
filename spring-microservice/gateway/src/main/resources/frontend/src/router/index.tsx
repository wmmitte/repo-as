import { createBrowserRouter } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import HomePage from '@/pages/HomePage';
import ExpertDetailPage from '@/pages/ExpertDetailPage';
import ExplorerPage from '@/pages/ExplorerPage';
import ReseauPage from '@/pages/ReseauPage';
import ProfilPage from '@/pages/ProfilPage';
import MonComptePage from '@/pages/MonComptePage';
import ExpertisePage from '@/pages/ExpertisePage';
import CompetenceDetailPage from '@/pages/CompetenceDetailPage';
import ProjetsPage from '@/pages/ProjetsPage';
import CreerProjetPage from '@/pages/CreerProjetPage';
import ProjetDetailPage from '@/pages/ProjetDetailPage';
import TacheDetailPage from '@/pages/TacheDetailPage';
import MesCandidaturesPage from '@/pages/MesCandidaturesPage';
import MesTachesPage from '@/pages/MesTachesPage';
import PlusPage from '@/pages/PlusPage';
import NotFoundPage from '@/pages/NotFoundPage';
import RequireAuth from '@/components/auth/RequireAuth';
import RequireRole from '@/components/auth/RequireRole';
import GererCompetences from '@/pages/GererCompetences';
import GererPays from '@/pages/GererPays';
import GererVilles from '@/pages/GererVilles';
import GererCertifications from '@/pages/GererCertifications';
import GererLocalisations from '@/pages/GererLocalisations';
import RechercherExpertises from '@/pages/RechercherExpertises';
import ExpertiseProfilPage from '@/pages/ExpertiseProfilPage';
import MesBadges from '@/pages/MesBadges';
import DemandeReconnaissance from '@/pages/DemandeReconnaissance';
import EvaluationDemande from '@/pages/EvaluationDemande';
import ConfirmationInscriptionPage from '@/pages/ConfirmationInscriptionPage';
import VerifierEmailPage from '@/pages/VerifierEmailPage';
import GererDomainesMetier from '@/pages/GererDomainesMetier';
import GererCriteresEvaluation from '@/pages/GererCriteresEvaluation';
import GererMethodesEvaluation from '@/pages/GererMethodesEvaluation';
import MesMessagesPage from '@/pages/MesMessagesPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'explorer',
        element: <ExplorerPage />,
      },
      {
        path: 'rechercher',
        element: <RechercherExpertises />,
      },
      {
        path: 'expertise-profil/:id',
        element: <ExpertiseProfilPage />,
      },
      {
        path: 'reseau',
        element: <ReseauPage />,
      },
      {
        path: 'profil',
        element: <ProfilPage />,
      },
      {
        path: 'profil/:id',
        element: <ProfilPage />,
      },
      {
        path: 'mon-compte',
        element: (
          <RequireAuth>
            <MonComptePage />
          </RequireAuth>
        ),
      },
      {
        path: 'expertise',
        element: (
          <RequireAuth>
            <ExpertisePage />
          </RequireAuth>
        ),
      },
      {
        path: 'expertise/:competenceId',
        element: <CompetenceDetailPage />,
      },
      {
        path: 'competences',
        element: (
          <RequireAuth>
            <GererCompetences />
          </RequireAuth>
        ),
      },
      {
        path: 'competences/pays',
        element: (
          <RequireAuth>
            <GererPays />
          </RequireAuth>
        ),
      },
      {
        path: 'competences/villes',
        element: (
          <RequireAuth>
            <GererVilles />
          </RequireAuth>
        ),
      },
      {
        path: 'competences/certifications',
        element: (
          <RequireAuth>
            <GererCertifications />
          </RequireAuth>
        ),
      },
      {
        path: 'competences/localisations',
        element: (
          <RequireAuth>
            <GererLocalisations />
          </RequireAuth>
        ),
      },
      {
        path: 'projets',
        element: <ProjetsPage />,
      },
      {
        path: 'projets/creer',
        element: (
          <RequireAuth>
            <CreerProjetPage />
          </RequireAuth>
        ),
      },
      {
        path: 'projets/:projetId/taches/:tacheId',
        element: <TacheDetailPage />,
      },
      {
        path: 'projets/:id',
        element: <ProjetDetailPage />,
      },
      {
        path: 'mes-candidatures',
        element: (
          <RequireAuth>
            <MesCandidaturesPage />
          </RequireAuth>
        ),
      },
      {
        path: 'mes-taches',
        element: (
          <RequireAuth>
            <MesTachesPage />
          </RequireAuth>
        ),
      },
      {
        path: 'plus',
        element: <PlusPage />,
      },
      {
        path: 'expert/:id',
        element: <ExpertDetailPage />,
      },
      // Routes de vérification d'email (publiques)
      {
        path: 'confirmation-inscription',
        element: <ConfirmationInscriptionPage />,
      },
      {
        path: 'verifier-email',
        element: <VerifierEmailPage />,
      },
      // Routes de reconnaissance des compétences (Expert)
      {
        path: 'reconnaissance/badges',
        element: (
          <RequireAuth>
            <MesBadges />
          </RequireAuth>
        ),
      },
      // Route de messagerie
      {
        path: 'messages',
        element: (
          <RequireAuth>
            <MesMessagesPage />
          </RequireAuth>
        ),
      },
      // Routes de demandes de reconnaissance (UNIQUEMENT Manager et RH)
      {
        path: 'demandes-reconnaissance',
        element: (
          <RequireRole roles={['manager', 'rh']}>
            <DemandeReconnaissance />
          </RequireRole>
        ),
      },
      {
        path: 'demandes-reconnaissance/evaluer/:id',
        element: (
          <RequireRole roles={['manager', 'rh']}>
            <EvaluationDemande />
          </RequireRole>
        ),
      },
      // Routes de gestion des référentiels (UNIQUEMENT Manager et RH)
      {
        path: 'competences/domaines-metier',
        element: (
          <RequireRole roles={['manager', 'rh']}>
            <GererDomainesMetier />
          </RequireRole>
        ),
      },
      {
        path: 'competences/criteres-evaluation',
        element: (
          <RequireRole roles={['manager', 'rh']}>
            <GererCriteresEvaluation />
          </RequireRole>
        ),
      },
      {
        path: 'competences/methodes-evaluation',
        element: (
          <RequireRole roles={['manager', 'rh']}>
            <GererMethodesEvaluation />
          </RequireRole>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
