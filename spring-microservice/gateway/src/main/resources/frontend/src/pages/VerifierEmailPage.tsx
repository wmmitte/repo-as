import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, RefreshCw, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type EtatVerification = 'chargement' | 'succes' | 'erreur' | 'expire';

/**
 * Page de vérification d'email.
 * Appelée quand l'utilisateur clique sur le lien dans l'email.
 */
export default function VerifierEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const { openAuthModal } = useAuth();

  const [etat, setEtat] = useState<EtatVerification>('chargement');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  useEffect(() => {
    if (!token) {
      setEtat('erreur');
      setMessage('Lien de vérification invalide.');
      return;
    }

    verifierToken();
  }, [token]);

  const verifierToken = async () => {
    setEtat('chargement');

    try {
      const response = await fetch(`/api/auth/verifier-email?token=${encodeURIComponent(token)}`);
      const data = await response.json();

      if (data.success) {
        setEtat('succes');
        setMessage(data.message);
      } else if (data.tokenExpire) {
        setEtat('expire');
        setMessage(data.message);
      } else {
        setEtat('erreur');
        setMessage(data.message || 'Une erreur est survenue');
      }
    } catch {
      setEtat('erreur');
      setMessage('Impossible de vérifier votre email. Veuillez réessayer.');
    }
  };

  const renvoyerEmail = async () => {
    if (!email) {
      return;
    }

    setEnvoiEnCours(true);

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
        navigate(`/confirmation-inscription?email=${encodeURIComponent(email)}`);
      }
    } catch {
      // Ignorer l'erreur
    } finally {
      setEnvoiEnCours(false);
    }
  };

  const ouvrirModalConnexion = () => {
    // Ouvrir le modal de connexion d'abord, puis naviguer vers l'accueil
    openAuthModal();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body text-center">
          {/* État: Chargement */}
          {etat === 'chargement' && (
            <>
              <div className="flex justify-center mb-4">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
              </div>
              <h1 className="text-xl font-bold sm:text-2xl">
                Vérification en cours...
              </h1>
              <p className="text-base-content/70 mt-2 text-sm sm:text-base">
                Veuillez patienter pendant que nous vérifions votre email.
              </p>
            </>
          )}

          {/* État: Succès */}
          {etat === 'succes' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-success" />
                </div>
              </div>
              <h1 className="text-xl font-bold text-success sm:text-2xl">
                Email vérifié !
              </h1>
              <p className="text-base-content/70 mt-2 text-sm sm:text-base">
                {message}
              </p>

              <div className="bg-success/10 rounded-lg p-4 mt-4">
                <p className="text-sm text-success-content">
                  Votre compte est maintenant actif. Vous pouvez vous connecter et profiter de toutes les fonctionnalités.
                </p>
              </div>

              <div className="card-actions flex-col gap-2 mt-6">
                <button
                  className="btn btn-primary w-full"
                  onClick={ouvrirModalConnexion}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Se connecter
                </button>
                <button
                  className="btn btn-ghost w-full text-sm"
                  onClick={() => navigate('/')}
                >
                  Retour à l'accueil
                </button>
              </div>
            </>
          )}

          {/* État: Token expiré */}
          {etat === 'expire' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center">
                  <RefreshCw className="w-12 h-12 text-warning" />
                </div>
              </div>
              <h1 className="text-xl font-bold text-warning sm:text-2xl">
                Lien expiré
              </h1>
              <p className="text-base-content/70 mt-2 text-sm sm:text-base">
                {message}
              </p>

              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text text-sm">Entrez votre email pour recevoir un nouveau lien :</span>
                </label>
                <input
                  type="email"
                  placeholder="votre@email.com"
                  className="input input-bordered w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="card-actions flex-col gap-2 mt-4">
                <button
                  className={`btn btn-primary w-full ${envoiEnCours ? 'loading' : ''}`}
                  onClick={renvoyerEmail}
                  disabled={envoiEnCours || !email}
                >
                  {!envoiEnCours && <RefreshCw className="w-4 h-4 mr-2" />}
                  {envoiEnCours ? 'Envoi en cours...' : 'Renvoyer le lien'}
                </button>
                <button
                  className="btn btn-ghost w-full text-sm"
                  onClick={() => navigate('/')}
                >
                  Retour à l'accueil
                </button>
              </div>
            </>
          )}

          {/* État: Erreur */}
          {etat === 'erreur' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center">
                  <XCircle className="w-12 h-12 text-error" />
                </div>
              </div>
              <h1 className="text-xl font-bold text-error sm:text-2xl">
                Erreur de vérification
              </h1>
              <p className="text-base-content/70 mt-2 text-sm sm:text-base">
                {message}
              </p>

              <div className="alert alert-info mt-4 text-xs sm:text-sm text-left">
                <div>
                  <p className="font-semibold">Que faire ?</p>
                  <ul className="list-disc list-inside mt-1">
                    <li>Vérifiez que vous avez utilisé le bon lien</li>
                    <li>Le lien peut avoir déjà été utilisé</li>
                    <li>Demandez un nouveau lien de vérification</li>
                  </ul>
                </div>
              </div>

              <div className="card-actions flex-col gap-2 mt-6">
                <button
                  className="btn btn-primary w-full"
                  onClick={() => navigate('/')}
                >
                  Retour à l'accueil
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
