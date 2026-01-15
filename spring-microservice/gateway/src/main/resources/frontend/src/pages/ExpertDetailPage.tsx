import { useParams } from 'react-router-dom';
import ProfilUtilisateur from '@/components/profil/ProfilUtilisateur';

export default function ExpertDetailPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Expert non trouvé</p>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-slate-50">
        <ProfilUtilisateur utilisateurId={id} />
      </div>
  );
}
