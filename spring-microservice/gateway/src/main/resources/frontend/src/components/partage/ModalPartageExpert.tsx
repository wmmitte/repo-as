import { useState } from 'react';
import { Expert } from '@/types/expert.types';
import Button from '@/components/ui/Button';

interface ModalPartageExpertProps {
  expert: Expert;
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalPartageExpert({ expert, isOpen, onClose }: ModalPartageExpertProps) {
  const [lienCopie, setLienCopie] = useState(false);
  const [emailDestination, setEmailDestination] = useState('');
  const [messagePersonnalise, setMessagePersonnalise] = useState('');

  if (!isOpen) return null;

  const lienProfil = `${window.location.origin}/expert/${expert.id}`;
  
  const copierLien = async () => {
    try {
      await navigator.clipboard.writeText(lienProfil);
      setLienCopie(true);
      setTimeout(() => setLienCopie(false), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      // Fallback pour les navigateurs ne supportant pas clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = lienProfil;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setLienCopie(true);
      setTimeout(() => setLienCopie(false), 2000);
    }
  };

  const partagerWhatsApp = () => {
    const message = messagePersonnalise.trim() || 
      `Découvrez le profil de ${expert.prenom} ${expert.nom}, ${expert.titre}`;
    const urlWhatsApp = `https://wa.me/?text=${encodeURIComponent(`${message}\n\n${lienProfil}`)}`;
    window.open(urlWhatsApp, '_blank');
  };

  const partagerEmail = () => {
    const sujet = `Profil expert - ${expert.prenom} ${expert.nom}`;
    const corps = messagePersonnalise.trim() || 
      `Bonjour,\n\nJe vous partage le profil de ${expert.prenom} ${expert.nom}, ${expert.titre}.\n\nVous pouvez consulter son profil ici :`;
    
    const mailto = `mailto:${emailDestination}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(`${corps}\n\n${lienProfil}`)}`;
    window.location.href = mailto;
  };

  const partagerFacebook = () => {
    const urlFacebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(lienProfil)}`;
    window.open(urlFacebook, '_blank', 'width=600,height=400');
  };

  const partagerTwitter = () => {
    const message = messagePersonnalise.trim() || 
      `Découvrez le profil de ${expert.prenom} ${expert.nom}, ${expert.titre}`;
    const urlTwitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(lienProfil)}`;
    window.open(urlTwitter, '_blank', 'width=600,height=400');
  };

  const partagerLinkedIn = () => {
    const urlLinkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(lienProfil)}`;
    window.open(urlLinkedIn, '_blank', 'width=600,height=400');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Partager le profil</h3>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 text-xl"
            >
              ✕
            </button>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <img
              src={expert.photoUrl}
              alt={`${expert.prenom} ${expert.nom}`}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h4 className="font-semibold text-gray-800">{expert.prenom} {expert.nom}</h4>
              <p className="text-sm text-gray-600">{expert.titre}</p>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-6">
          {/* Copier le lien */}
          <div>
            <h5 className="font-medium text-gray-800 mb-3">Copier le lien</h5>
            <div className="bg-slate-100 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={lienProfil}
                  readOnly
                  className="flex-1 bg-transparent text-gray-700 text-sm focus:outline-none"
                />
                <Button
                  onClick={copierLien}
                  size="sm"
                  className={lienCopie ? 'bg-success/20 text-success' : ''}
                >
                  {lienCopie ? '✓ Copié' : 'Copier'}
                </Button>
              </div>
            </div>
          </div>

          {/* Message personnalisé */}
          <div>
            <h5 className="font-medium text-gray-800 mb-3">Message personnalisé (optionnel)</h5>
            <textarea
              value={messagePersonnalise}
              onChange={(e) => setMessagePersonnalise(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-lg 
                       text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 
                       focus:ring-primary focus:border-transparent resize-none"
              placeholder="Ajoutez un message personnel à votre partage..."
            />
          </div>

          {/* Options de partage */}
          <div>
            <h5 className="font-medium text-gray-800 mb-4">Partager via</h5>
            
            {/* Réseaux sociaux */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={partagerWhatsApp}
                className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 
                         rounded-lg hover:bg-green-500/20 transition-colors"
              >
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-gray-900 font-bold">
                  W
                </div>
                <span className="text-gray-800 font-medium">WhatsApp</span>
              </button>

              <button
                onClick={partagerFacebook}
                className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 
                         rounded-lg hover:bg-primary/20 transition-colors"
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-gray-900 font-bold">
                  f
                </div>
                <span className="text-gray-800 font-medium">Facebook</span>
              </button>

              <button
                onClick={partagerTwitter}
                className="flex items-center gap-3 p-3 bg-sky-500/10 border border-sky-500/20 
                         rounded-lg hover:bg-sky-500/20 transition-colors"
              >
                <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center text-gray-900 font-bold">
                  X
                </div>
                <span className="text-gray-800 font-medium">Twitter</span>
              </button>

              <button
                onClick={partagerLinkedIn}
                className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 
                         rounded-lg hover:bg-primary/20 transition-colors"
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-gray-900 font-bold">
                  in
                </div>
                <span className="text-gray-800 font-medium">LinkedIn</span>
              </button>
            </div>

            {/* Partage par email */}
            <div className="bg-slate-100 border border-slate-200 rounded-lg p-4">
              <h6 className="font-medium text-gray-800 mb-3">Partager par email</h6>
              <div className="flex gap-3">
                <input
                  type="email"
                  value={emailDestination}
                  onChange={(e) => setEmailDestination(e.target.value)}
                  placeholder="Adresse email du destinataire"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded 
                           text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 
                           focus:ring-primary focus:border-transparent"
                />
                <Button
                  onClick={partagerEmail}
                  disabled={!emailDestination.trim()}
                  size="sm"
                >
                  Envoyer
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Pied de page */}
        <div className="p-6 border-t border-slate-200">
          <div className="flex justify-end">
            <Button variant="secondary" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}