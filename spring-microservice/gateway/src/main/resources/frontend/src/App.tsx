import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/router';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import ModalConnexion from '@/components/auth/ModalConnexion';
import { setGlobalAuthModalHandler } from '@/utils/authErrorHandler';

function AppContent() {
  const { showAuthModal, closeAuthModal, openAuthModal } = useAuth();

  // Enregistrer le handler global pour les erreurs d'authentification
  useEffect(() => {
    setGlobalAuthModalHandler(openAuthModal);
  }, [openAuthModal]);

  return (
    <div data-theme="pitm-light" className="min-h-screen">
      <RouterProvider router={router} />
      {/* Modal de connexion global */}
      <ModalConnexion isOpen={showAuthModal} onClose={closeAuthModal} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}
