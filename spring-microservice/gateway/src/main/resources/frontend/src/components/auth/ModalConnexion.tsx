import { useState } from 'react';
import FormulaireInscription from './FormulaireInscription';
import { authService } from '../../services/authService';
import { useAuth } from '@/context/AuthContext';

interface ModalConnexionProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalConnexion({ isOpen, onClose }: ModalConnexionProps) {
  const { getRedirectUrl, clearRedirectUrl } = useAuth();
  const [modeConnexion, setModeConnexion] = useState<'principal' | 'email'>('principal');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [afficherMotDePasse, setAfficherMotDePasse] = useState(false);
  const [modalInscriptionOuvert, setModalInscriptionOuvert] = useState(false);
  const [afficherConnexion, setAfficherConnexion] = useState(isOpen);
  const [erreurConnexion, setErreurConnexion] = useState('');
  const [chargement, setChargement] = useState(false);
  const [emailNonVerifie, setEmailNonVerifie] = useState(false);
  const [envoiVerificationEnCours, setEnvoiVerificationEnCours] = useState(false);

  // Synchroniser l'état interne avec isOpen
  if (isOpen && !afficherConnexion && !modalInscriptionOuvert) {
    setAfficherConnexion(true);
  }

  if (!afficherConnexion && !modalInscriptionOuvert) return null;

  const gererConnexionEmail = async () => {
    if (!email || !motDePasse) return;

    setChargement(true);
    setErreurConnexion('');
    setEmailNonVerifie(false);

    try {
      const result = await authService.loginWithPassword(email, motDePasse);

      if (result.success) {
        console.log('[CONNEXION EMAIL] Connexion réussie:', result.utilisateur);

        // Vérifier si l'utilisateur est de l'organisation (Manager ou RH)
        const roles = result.utilisateur?.roles?.map(r => r.toLowerCase()) || [];
        const estOrganisation = roles.includes('manager') || roles.includes('rh');

        // Vérifier si le profil est complet et rediriger si nécessaire
        if (result.utilisateur && !result.utilisateur.profilComplet) {
          console.log('[CONNEXION EMAIL] Profil incomplet, redirection vers /mon-compte');
          clearRedirectUrl();
          window.location.href = '/mon-compte?auth=success';
        } else if (estOrganisation) {
          // Si utilisateur de l'organisation, toujours rediriger vers la page des demandes
          console.log('[CONNEXION EMAIL] Utilisateur organisation, redirection vers /demandes-reconnaissance');
          clearRedirectUrl();
          window.location.href = '/demandes-reconnaissance';
        } else {
          // Pour les autres utilisateurs (experts), utiliser l'URL de redirection stockée
          const redirectTo = getRedirectUrl();
          console.log('[CONNEXION EMAIL] URL de redirection:', redirectTo);

          if (redirectTo && redirectTo !== window.location.pathname + window.location.search) {
            console.log('[CONNEXION EMAIL] Redirection vers:', redirectTo);
            clearRedirectUrl();
            window.location.href = redirectTo;
          } else {
            console.log('[CONNEXION EMAIL] Rechargement de la page actuelle');
            clearRedirectUrl();
            window.location.reload();
          }
        }
      } else {
        // Vérifier si c'est une erreur d'email non vérifié
        if (result.emailNonVerifie) {
          setEmailNonVerifie(true);
        }
        setErreurConnexion(result.message || 'Erreur lors de la connexion');
      }
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      setErreurConnexion(error.message || 'Une erreur est survenue');
    } finally {
      setChargement(false);
    }
  };

  const renvoyerEmailVerification = async () => {
    if (!email) return;

    setEnvoiVerificationEnCours(true);

    try {
      const response = await fetch('/api/auth/renvoyer-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        // Rediriger vers la page de confirmation
        window.location.href = `/confirmation-inscription?email=${encodeURIComponent(email)}`;
      }
    } catch {
      // Ignorer l'erreur silencieusement
    } finally {
      setEnvoiVerificationEnCours(false);
    }
  };

  const gererConnexionReseauSocial = async (provider: 'google' | 'facebook' | 'apple') => {
    // Sauvegarder l'URL de redirection dans un cookie ET localStorage pour OAuth
    const redirectTo = getRedirectUrl();
    if (redirectTo) {
      console.log('💾 [MODAL] Sauvegarde de l\'URL de redirection pour OAuth:', redirectTo);
      // localStorage pour le frontend
      localStorage.setItem('auth_redirect_url', redirectTo);
      // Cookie pour le backend (encodage manuel nécessaire)
      document.cookie = `auth_redirect_url=${encodeURIComponent(redirectTo)}; path=/; max-age=600; SameSite=Lax`;
      console.log('🍪 [MODAL] Cookie auth_redirect_url créé (encodé):', encodeURIComponent(redirectTo));
    }

    // Redirection vers le provider OAuth (Google, Facebook, Apple)
    authService.login(provider);
  };

  const ouvrirModalInscription = () => {
    // Fermer d'abord la modale de connexion
    setAfficherConnexion(false);
    // Attendre un court délai pour que la fermeture soit complète
    setTimeout(() => {
      setModalInscriptionOuvert(true);
    }, 200);
  };

  const fermerModalConnexion = () => {
    setAfficherConnexion(false);
    onClose();
  };

  const retournerALaConnexion = () => {
    // Fermer d'abord la modale d'inscription
    setModalInscriptionOuvert(false);
    // Attendre un court délai puis rouvrir la connexion
    setTimeout(() => {
      setAfficherConnexion(true);
    }, 200);
  };

  return (
    <>
      {afficherConnexion && !modalInscriptionOuvert && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4 overflow-hidden shadow-2xl">
        {/* En-tête */}
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between p-5">
            {modeConnexion === 'email' && (
              <button
                onClick={() => setModeConnexion('principal')}
                className="text-gray-800 hover:text-black transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h2 className="text-xl font-bold text-center flex-1 text-gray-900">
              Connecte-toi à PITM
            </h2>
            <button
              onClick={fermerModalConnexion}
              className="text-gray-800 hover:text-black transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Onglets de basculement */}
          {modeConnexion === 'principal' && (
            <div className="flex border-t border-gray-200">
              <button
                onClick={() => setModeConnexion('principal')}
                className="flex-1 py-3 text-center font-medium text-primary border-b-2 border-primary"
              >
                Réseaux sociaux
              </button>
              <button
                onClick={() => setModeConnexion('email')}
                className="flex-1 py-3 text-center font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300 transition-colors"
              >
                Email / Mot de passe
              </button>
            </div>
          )}
        </div>

        {/* Contenu principal */}
        <div className="p-6">
          {modeConnexion === 'principal' ? (
            <div className="space-y-4">
              {/* Option Facebook */}
              <button
                onClick={() => gererConnexionReseauSocial('facebook')}
                className="w-full flex items-center gap-4 p-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-lg">
                  <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span className="text-lg font-medium text-gray-900">Continuer avec Facebook</span>
              </button>

              {/* Option Google */}
              <button
                onClick={() => gererConnexionReseauSocial('google')}
                className="w-full flex items-center gap-4 p-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <span className="text-lg font-medium text-gray-900">Continuer avec Google</span>
              </button>

              {/* Option Apple */}
              <button
                onClick={() => gererConnexionReseauSocial('apple')}
                className="w-full flex items-center gap-4 p-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                </div>
                <span className="text-lg font-medium text-gray-900">Continuer avec Apple</span>
              </button>
            </div>
          ) : (
            /* Formulaire de connexion par email/password */
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!chargement && email && motDePasse) {
                  gererConnexionEmail();
                }
              }}
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Connexion par email</h3>
                <p className="text-gray-700 text-sm mt-2">
                  Utilisez votre adresse email et votre mot de passe
                </p>
              </div>

              {/* Message d'erreur */}
              {erreurConnexion && (
                <div className={`border px-4 py-3 rounded-lg text-sm ${emailNonVerifie ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-red-50 border-red-200 text-red-700'}`}>
                  <p>{erreurConnexion}</p>
                  {emailNonVerifie && (
                    <button
                      type="button"
                      onClick={renvoyerEmailVerification}
                      disabled={envoiVerificationEnCours}
                      className="mt-2 text-primary underline font-medium hover:text-primary/80 disabled:opacity-50"
                    >
                      {envoiVerificationEnCours ? 'Envoi en cours...' : 'Renvoyer l\'email de vérification'}
                    </button>
                  )}
                </div>
              )}

              {/* Email */}
              <div>
                <input
                  type="email"
                  placeholder="Adresse email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-100 border-0 rounded-lg p-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                  autoComplete="email"
                  required
                />
              </div>

              {/* Mot de passe */}
              <div className="relative">
                <input
                  type={afficherMotDePasse ? "text" : "password"}
                  placeholder="Mot de passe"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  className="w-full bg-gray-100 border-0 rounded-lg p-3 pr-12 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setAfficherMotDePasse(!afficherMotDePasse)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {afficherMotDePasse ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    )}
                  </svg>
                </button>
              </div>

              {/* Lien mot de passe oublié */}
              <div className="text-right">
                <button type="button" className="text-sm text-gray-600 hover:text-gray-900 underline">
                  Mot de passe oublié ?
                </button>
              </div>

              {/* Bouton de connexion */}
              <button
                type="submit"
                disabled={!email || !motDePasse || chargement}
                className="w-full bg-primary text-white py-3 rounded-xl font-semibold disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed hover:bg-primary-800 transition-colors"
              >
                {chargement ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          )}
        </div>

        {/* Pied de page */}
        <div className="border-t border-gray-200 p-5">
          <div className="text-center text-sm text-gray-700">
            {modeConnexion === 'principal' && (
              <>
                <p className="mb-3 leading-relaxed">
                  En continuant avec un compte basé dans le pays suivant :{' '}
                  <span className="font-semibold text-black">Burkina Faso</span>, tu acceptes nos{' '}
                  <button className="text-black underline font-medium hover:text-gray-700">Conditions d'utilisation</button> et
                  reconnais avoir lu notre{' '}
                  <button className="text-black underline font-medium hover:text-gray-700">Politique de confidentialité</button>.
                </p>
              </>
            )}
            <div className="mt-4">
              <span className="text-gray-800">Tu n'as pas de compte ? </span>
              <button
                onClick={ouvrirModalInscription}
                className="text-primary font-semibold hover:text-primary/90 transition-colors"
              >
                S'inscrire
              </button>
            </div>
          </div>
        </div>
          </div>
        </div>
      )}

      {/* Modal d'inscription */}
      <FormulaireInscription
        isOpen={modalInscriptionOuvert}
        onClose={() => {
          setModalInscriptionOuvert(false);
          // Fermer complètement (ne pas rouvrir la connexion)
          onClose();
        }}
        onRetourConnexion={retournerALaConnexion}
      />
    </>
  );
}