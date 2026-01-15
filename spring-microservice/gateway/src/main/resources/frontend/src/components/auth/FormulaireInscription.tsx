import { useState } from 'react';
import { authService } from '../../services/authService';

interface FormulaireInscriptionProps {
  isOpen: boolean;
  onClose: () => void;
  onRetourConnexion?: () => void;
}

export default function FormulaireInscription({ isOpen, onClose, onRetourConnexion }: FormulaireInscriptionProps) {
  const [modeInscription, setModeInscription] = useState<'social' | 'email'>('social');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmMotDePasse, setConfirmMotDePasse] = useState('');
  const [afficherMotDePasse, setAfficherMotDePasse] = useState(false);
  const [afficherConfirmMotDePasse, setAfficherConfirmMotDePasse] = useState(false);
  const [erreurInscription, setErreurInscription] = useState('');
  const [chargement, setChargement] = useState(false);
  
  if (!isOpen) return null;

  const gererInscription = (provider: 'google' | 'facebook' | 'apple') => {
    // Redirection directe vers le provider OAuth (Google, Facebook, Apple)
    // Le paramètre kc_idp_hint permet de sauter la page de sélection Keycloak
    authService.login(provider);
  };

  const gererInscriptionEmail = async () => {
    setErreurInscription('');

    // Validations
    if (!nom || !prenom || !email || !motDePasse || !confirmMotDePasse) {
      setErreurInscription('Tous les champs sont obligatoires');
      return;
    }

    if (motDePasse !== confirmMotDePasse) {
      setErreurInscription('Les mots de passe ne correspondent pas');
      return;
    }

    if (motDePasse.length < 8) {
      setErreurInscription('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setChargement(true);

    try {
      const response = await authService.registerWithPassword({
        nom,
        prenom,
        email,
        motDePasse
      });

      if (response.success) {
        console.log('[INSCRIPTION EMAIL] Inscription réussie, email de vérification envoyé');

        // Rediriger vers la page de confirmation (vérification email requise)
        window.location.href = `/confirmation-inscription?email=${encodeURIComponent(email)}`;
      } else {
        setErreurInscription(response.message || 'Échec de l\'inscription');
      }
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      setErreurInscription(error.message || 'Erreur lors de l\'inscription');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md mx-4 overflow-hidden shadow-2xl">
        {/* En-tête */}
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between p-5">
            <h2 className="text-xl font-bold text-center flex-1 text-gray-900">
              Créer un compte PITM
            </h2>
            <button
              onClick={onClose}
              className="text-gray-800 hover:text-black transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Onglets de basculement */}
          <div className="flex border-t border-gray-200">
            <button
              onClick={() => setModeInscription('social')}
              className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
                modeInscription === 'social'
                  ? 'text-primary border-primary'
                  : 'text-gray-600 hover:text-gray-900 border-transparent hover:border-gray-300'
              }`}
            >
              Réseaux sociaux
            </button>
            <button
              onClick={() => setModeInscription('email')}
              className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
                modeInscription === 'email'
                  ? 'text-primary border-primary'
                  : 'text-gray-600 hover:text-gray-900 border-transparent hover:border-gray-300'
              }`}
            >
              Email / Mot de passe
            </button>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="p-6">
          {modeInscription === 'social' ? (
            <>
              <div className="text-center mb-6">
                <p className="text-gray-600">
                  Choisissez votre méthode d'inscription
                </p>
              </div>

              <div className="space-y-4">
            {/* Option Facebook */}
            <button
              onClick={() => gererInscription('facebook')}
              disabled={false}
              className="w-full flex items-center gap-4 p-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
              onClick={() => gererInscription('google')}
              disabled={false}
              className="w-full flex items-center gap-4 p-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
              onClick={() => gererInscription('apple')}
              disabled={false}
              className="w-full flex items-center gap-4 p-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              </div>
              <span className="text-lg font-medium text-gray-900">Continuer avec Apple</span>
            </button>
              </div>
            </>
          ) : (
            /* Formulaire d'inscription par email */
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Inscription par email</h3>
                <p className="text-gray-700 text-sm mt-2">
                  Créez votre compte avec votre adresse email
                </p>
              </div>

              {/* Message d'erreur */}
              {erreurInscription && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {erreurInscription}
                </div>
              )}

              {/* Nom et Prénom */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="flex-1 bg-gray-100 border-0 rounded-lg p-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                  autoComplete="family-name"
                />
                <input
                  type="text"
                  placeholder="Prénom"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  className="flex-1 bg-gray-100 border-0 rounded-lg p-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                  autoComplete="given-name"
                />
              </div>

              {/* Email */}
              <div>
                <input
                  type="email"
                  placeholder="Adresse email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-100 border-0 rounded-lg p-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                  autoComplete="email"
                />
              </div>

              {/* Mot de passe */}
              <div className="relative">
                <input
                  type={afficherMotDePasse ? "text" : "password"}
                  placeholder="Mot de passe (min. 8 caractères)"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  className="w-full bg-gray-100 border-0 rounded-lg p-3 pr-12 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                  autoComplete="new-password"
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

              {/* Confirmation mot de passe */}
              <div className="relative">
                <input
                  type={afficherConfirmMotDePasse ? "text" : "password"}
                  placeholder="Confirmer le mot de passe"
                  value={confirmMotDePasse}
                  onChange={(e) => setConfirmMotDePasse(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !chargement && nom && prenom && email && motDePasse && confirmMotDePasse && gererInscriptionEmail()}
                  className="w-full bg-gray-100 border-0 rounded-lg p-3 pr-12 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setAfficherConfirmMotDePasse(!afficherConfirmMotDePasse)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {afficherConfirmMotDePasse ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    )}
                  </svg>
                </button>
              </div>

              {/* Bouton d'inscription */}
              <button
                onClick={gererInscriptionEmail}
                disabled={!nom || !prenom || !email || !motDePasse || !confirmMotDePasse || chargement}
                className="w-full bg-primary text-white py-3 rounded-xl font-semibold disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed hover:bg-primary-800 transition-colors"
              >
                {chargement ? 'Inscription...' : 'Créer mon compte'}
              </button>
            </div>
          )}
        </div>

        {/* Pied de page */}
        <div className="border-t border-gray-200 p-5">
          <div className="text-center text-sm text-gray-700">
            <p className="mb-3 leading-relaxed">
              En créant un compte, tu acceptes nos{' '}
              <button className="text-black underline font-medium hover:text-gray-700">
                Conditions d'utilisation
              </button>{' '}
              et reconnais avoir lu notre{' '}
              <button className="text-black underline font-medium hover:text-gray-700">
                Politique de confidentialité
              </button>.
            </p>
            <p className="text-xs text-gray-600 mt-2 mb-3">
              Après inscription, vous pourrez compléter votre profil dans la section "Mon Compte"
            </p>
            <div className="mt-4">
              <span className="text-gray-800">Tu as déjà un compte ? </span>
              <button
                onClick={onRetourConnexion || onClose}
                className="text-primary font-semibold hover:text-primary/90 transition-colors"
              >
                Se connecter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
