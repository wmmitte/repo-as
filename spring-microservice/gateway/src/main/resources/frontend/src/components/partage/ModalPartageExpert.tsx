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

  const lienProfil = `${window.location.origin}/expertise-profil/${expert.id}`;
  
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
                className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30
                         rounded-lg hover:bg-green-500/20 transition-colors group"
              >
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <span className="text-green-700 font-medium group-hover:text-green-800">WhatsApp</span>
              </button>

              <button
                onClick={partagerFacebook}
                className="flex items-center gap-3 p-3 bg-blue-600/10 border border-blue-600/30
                         rounded-lg hover:bg-blue-600/20 transition-colors group"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span className="text-blue-700 font-medium group-hover:text-blue-800">Facebook</span>
              </button>

              <button
                onClick={partagerTwitter}
                className="flex items-center gap-3 p-3 bg-black/5 border border-black/20
                         rounded-lg hover:bg-black/10 transition-colors group"
              >
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <span className="text-gray-700 font-medium group-hover:text-gray-900">X (Twitter)</span>
              </button>

              <button
                onClick={partagerLinkedIn}
                className="flex items-center gap-3 p-3 bg-blue-700/10 border border-blue-700/30
                         rounded-lg hover:bg-blue-700/20 transition-colors group"
              >
                <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </div>
                <span className="text-blue-800 font-medium group-hover:text-blue-900">LinkedIn</span>
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