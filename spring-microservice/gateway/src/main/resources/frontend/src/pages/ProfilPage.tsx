import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProfilUtilisateur from '@/components/profil/ProfilUtilisateur';

export default function ProfilPage() {
  const { id } = useParams<{ id?: string }>();
  const [utilisateurId, setUtilisateurId] = useState<string | null>(null);

  useEffect(() => {
    // Si un ID est fourni dans l'URL, l'utiliser
    if (id) {
      setUtilisateurId(id);
    } else {
      // Sinon, récupérer l'ID de l'utilisateur connecté depuis le localStorage
      const sessionData = localStorage.getItem('pitm_session');
      if (sessionData) {
        try {
          const session = JSON.parse(sessionData);
          setUtilisateurId(session.visiteurId);
        } catch (error) {
          console.error('Erreur lors de la lecture de la session:', error);
          // ID par défaut pour les tests
          setUtilisateurId('visiteur_' + Date.now());
        }
      } else {
        // ID par défaut pour les tests
        setUtilisateurId('visiteur_' + Date.now());
      }
    }
  }, [id]);

  if (!utilisateurId) {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Chargement du profil...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-slate-50">
        <ProfilUtilisateur utilisateurId={utilisateurId} />
      </div>
  );
}
