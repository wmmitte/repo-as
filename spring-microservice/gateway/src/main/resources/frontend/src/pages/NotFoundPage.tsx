import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-2xl text-gray-600 mb-8">Page non trouvée</p>
        <Button onClick={() => navigate('/')}>Retour à l'accueil</Button>
      </div>
    </div>
  );
}
