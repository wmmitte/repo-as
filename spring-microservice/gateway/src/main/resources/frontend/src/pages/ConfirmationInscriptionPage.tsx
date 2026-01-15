import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle, RefreshCw, ArrowLeft } from 'lucide-react';

/**
 * Page affichée après l'inscription par email/mot de passe.
 * Informe l'utilisateur qu'un email de vérification a été envoyé.
 */
export default function ConfirmationInscriptionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [messageSucces, setMessageSucces] = useState('');
  const [messageErreur, setMessageErreur] = useState('');

  useEffect(() => {
    // Si pas d'email, rediriger vers l'accueil
    if (!email) {
      navigate('/');
    }
  }, [email, navigate]);

  const renvoyerEmail = async () => {
    setEnvoiEnCours(true);
    setMessageSucces('');
    setMessageErreur('');

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
        setMessageSucces(data.message);
      } else {
        setMessageErreur(data.message || 'Une erreur est survenue');
      }
    } catch {
      setMessageErreur('Impossible de renvoyer l\'email. Veuillez réessayer.');
    } finally {
      setEnvoiEnCours(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body text-center">
          {/* Icône */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-10 h-10 text-primary" />
            </div>
          </div>

          {/* Titre */}
          <h1 className="text-xl font-bold sm:text-2xl">
            Vérifiez votre email
          </h1>

          {/* Message principal */}
          <p className="text-base-content/70 mt-2 text-sm sm:text-base">
            Nous avons envoyé un lien de vérification à :
          </p>
          <p className="font-semibold text-primary break-all text-sm sm:text-base">
            {email}
          </p>

          {/* Instructions */}
          <div className="bg-info/10 rounded-lg p-4 mt-4 text-left">
            <h3 className="font-semibold text-info mb-2 text-sm sm:text-base">
              Prochaines étapes :
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm text-base-content/80">
              <li>Ouvrez votre boîte mail</li>
              <li>Recherchez l'email de "Plateforme Intermediation"</li>
              <li>Cliquez sur le lien de vérification</li>
              <li>Connectez-vous à votre compte</li>
            </ol>
          </div>

          {/* Avertissement expiration */}
          <div className="alert alert-warning mt-4 text-xs sm:text-sm">
            <span>Le lien expire dans 72 heures</span>
          </div>

          {/* Messages de succès/erreur */}
          {messageSucces && (
            <div className="alert alert-success mt-4 text-xs sm:text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>{messageSucces}</span>
            </div>
          )}
          {messageErreur && (
            <div className="alert alert-error mt-4 text-xs sm:text-sm">
              <span>{messageErreur}</span>
            </div>
          )}

          {/* Actions */}
          <div className="card-actions flex-col gap-2 mt-6">
            <button
              className={`btn btn-outline btn-primary w-full ${envoiEnCours ? 'loading' : ''}`}
              onClick={renvoyerEmail}
              disabled={envoiEnCours}
            >
              {!envoiEnCours && <RefreshCw className="w-4 h-4 mr-2" />}
              {envoiEnCours ? 'Envoi en cours...' : 'Renvoyer l\'email'}
            </button>

            <button
              className="btn btn-ghost w-full text-sm"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </button>
          </div>

          {/* Note spam */}
          <p className="text-xs text-base-content/50 mt-4">
            Vous ne trouvez pas l'email ? Vérifiez vos spams ou courriers indésirables.
          </p>
        </div>
      </div>
    </div>
  );
}
