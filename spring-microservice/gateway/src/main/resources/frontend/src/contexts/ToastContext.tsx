import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// Types
export type TypeToast = 'succes' | 'erreur' | 'avertissement' | 'info';
type EtatAnimation = 'entree' | 'visible' | 'sortie';

export interface Toast {
  id: string;
  message: string;
  type: TypeToast;
  duree?: number;
  etatAnimation?: EtatAnimation;
  timestampCreation?: number;
  estEnPause?: boolean;
}

interface ToastContextType {
  toasts: Toast[];
  succes: (message: string, duree?: number) => void;
  erreur: (message: string | Error | unknown, duree?: number) => void;
  avertissement: (message: string, duree?: number) => void;
  info: (message: string, duree?: number) => void;
  fermer: (id: string) => void;
  fermerTous: () => void;
  pauserToast: (id: string) => void;
  reprendreToast: (id: string) => void;
}

// Configuration des toasts
const CONFIG_TOAST: Record<TypeToast, {
  icone: typeof CheckCircle;
  classeIcone: string;
  classeFond: string;
  classeBordure: string;
  dureeDefaut: number;
}> = {
  succes: {
    icone: CheckCircle,
    classeIcone: 'text-emerald-500',
    classeFond: 'bg-emerald-50',
    classeBordure: 'border-emerald-200',
    dureeDefaut: 5000,
  },
  erreur: {
    icone: XCircle,
    classeIcone: 'text-red-500',
    classeFond: 'bg-red-50',
    classeBordure: 'border-red-200',
    dureeDefaut: 8000,
  },
  avertissement: {
    icone: AlertTriangle,
    classeIcone: 'text-amber-500',
    classeFond: 'bg-amber-50',
    classeBordure: 'border-amber-200',
    dureeDefaut: 6000,
  },
  info: {
    icone: Info,
    classeIcone: 'text-blue-500',
    classeFond: 'bg-blue-50',
    classeBordure: 'border-blue-200',
    dureeDefaut: 5000,
  },
};

// Context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Fonction utilitaire pour extraire le message d'erreur depuis un objet parsé
const extraireMessageDepuisObjet = (obj: Record<string, unknown>): string | null => {
  // Format: { message: "...", erreurs: { field: "..." } }
  if (obj.message && typeof obj.message === 'string') {
    // Si on a des erreurs détaillées, les afficher
    if (obj.erreurs && typeof obj.erreurs === 'object') {
      const erreursDetail = Object.values(obj.erreurs as Record<string, string>);
      if (erreursDetail.length > 0) {
        return erreursDetail.join('. ');
      }
    }
    return obj.message;
  }

  // Format: { error: "..." }
  if (obj.error && typeof obj.error === 'string') {
    return obj.error;
  }

  return null;
};

// Fonction utilitaire pour extraire le message d'erreur
const extraireMessageErreur = (erreur: string | Error | unknown): string => {
  // Cas 1: String simple ou JSON stringifié
  if (typeof erreur === 'string') {
    // Essayer de parser comme JSON
    try {
      const parsed = JSON.parse(erreur);
      if (typeof parsed === 'object' && parsed !== null) {
        const message = extraireMessageDepuisObjet(parsed as Record<string, unknown>);
        if (message) return message;
      }
    } catch {
      // Ce n'est pas du JSON, retourner la string telle quelle
    }
    return erreur;
  }

  // Cas 2: Instance de Error (le message peut être du JSON stringifié)
  if (erreur instanceof Error) {
    // Essayer de parser le message comme JSON
    try {
      const parsed = JSON.parse(erreur.message);
      if (typeof parsed === 'object' && parsed !== null) {
        const message = extraireMessageDepuisObjet(parsed as Record<string, unknown>);
        if (message) return message;
      }
    } catch {
      // Ce n'est pas du JSON, retourner le message tel quel
    }
    return erreur.message;
  }

  // Cas 3: Objet direct (erreur API structurée)
  if (typeof erreur === 'object' && erreur !== null) {
    const message = extraireMessageDepuisObjet(erreur as Record<string, unknown>);
    if (message) return message;
  }

  return 'Une erreur inattendue s\'est produite';
};

// Générateur d'ID unique
let compteurId = 0;
const genererIdToast = (): string => {
  compteurId += 1;
  return `toast-${Date.now()}-${compteurId}`;
};

// Type pour les timers compatible navigateur
type TimerType = ReturnType<typeof setTimeout>;


// Provider
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, { timer: TimerType | null; restant: number; debutPause?: number }>>(new Map());

  const supprimerToast = useCallback((id: string) => {
    timersRef.current.delete(id);
    setToasts((precedents) => precedents.filter((t) => t.id !== id));
  }, []);

  const demarrerSortie = useCallback((id: string) => {
    // Annuler le timer si existant
    const timerInfo = timersRef.current.get(id);
    if (timerInfo?.timer) clearTimeout(timerInfo.timer);
    timersRef.current.delete(id);

    setToasts((precedents) =>
      precedents.map((t) =>
        t.id === id ? { ...t, etatAnimation: 'sortie' as EtatAnimation } : t
      )
    );
    // Supprimer après l'animation de sortie (400ms)
    setTimeout(() => supprimerToast(id), 400);
  }, [supprimerToast]);

  const pauserToast = useCallback((id: string) => {
    const timerInfo = timersRef.current.get(id);
    if (timerInfo?.timer) {
      clearTimeout(timerInfo.timer!);
      const maintenant = Date.now();
      timersRef.current.set(id, {
        ...timerInfo,
        timer: null,
        debutPause: maintenant,
      });
    }
    setToasts((precedents) =>
      precedents.map((t) =>
        t.id === id ? { ...t, estEnPause: true } : t
      )
    );
  }, []);

  const reprendreToast = useCallback((id: string) => {
    const timerInfo = timersRef.current.get(id);
    if (timerInfo && timerInfo.debutPause) {
      // Calculer le temps restant
      const tempsEcoule = Date.now() - timerInfo.debutPause;
      const nouveauRestant = Math.max(0, timerInfo.restant - tempsEcoule);

      if (nouveauRestant > 0) {
        const nouveauTimer = setTimeout(() => demarrerSortie(id), nouveauRestant);
        timersRef.current.set(id, {
          timer: nouveauTimer,
          restant: nouveauRestant,
        });
      } else {
        demarrerSortie(id);
      }
    }
    setToasts((precedents) =>
      precedents.map((t) =>
        t.id === id ? { ...t, estEnPause: false } : t
      )
    );
  }, [demarrerSortie]);

  const ajouterToast = useCallback((type: TypeToast, message: string, duree?: number) => {
    const id = genererIdToast();
    const dureeFinale = duree ?? CONFIG_TOAST[type].dureeDefaut;
    const nouveauToast: Toast = {
      id,
      message,
      type,
      duree: dureeFinale,
      etatAnimation: 'entree',
      timestampCreation: Date.now(),
      estEnPause: false,
    };

    setToasts((precedents) => [...precedents, nouveauToast]);

    // Passer à l'état visible après l'animation d'entrée
    setTimeout(() => {
      setToasts((precedents) =>
        precedents.map((t) =>
          t.id === id ? { ...t, etatAnimation: 'visible' as EtatAnimation } : t
        )
      );
    }, 50);

    // Auto-suppression avec animation de sortie
    if (dureeFinale && dureeFinale > 0) {
      const timer = setTimeout(() => demarrerSortie(id), dureeFinale);
      timersRef.current.set(id, { timer, restant: dureeFinale });
    }

    return id;
  }, [demarrerSortie]);

  const succes = useCallback((message: string, duree?: number) => {
    ajouterToast('succes', message, duree);
  }, [ajouterToast]);

  const erreur = useCallback((messageOuErreur: string | Error | unknown, duree?: number) => {
    const message = extraireMessageErreur(messageOuErreur);
    ajouterToast('erreur', message, duree);
  }, [ajouterToast]);

  const avertissement = useCallback((message: string, duree?: number) => {
    ajouterToast('avertissement', message, duree);
  }, [ajouterToast]);

  const info = useCallback((message: string, duree?: number) => {
    ajouterToast('info', message, duree);
  }, [ajouterToast]);

  const fermer = useCallback((id: string) => {
    demarrerSortie(id);
  }, [demarrerSortie]);

  const fermerTous = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, succes, erreur, avertissement, info, fermer, fermerTous, pauserToast, reprendreToast }}>
      {children}
      <ToastContainer toasts={toasts} onFermer={fermer} onPause={pauserToast} onResume={reprendreToast} />
    </ToastContext.Provider>
  );
}

// Hook
export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast doit être utilisé dans un ToastProvider');
  }
  return context;
}

// Composant ToastContainer
function ToastContainer({
  toasts,
  onFermer,
  onPause,
  onResume
}: {
  toasts: Toast[];
  onFermer: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onFermer={() => onFermer(toast.id)}
          onPause={() => onPause(toast.id)}
          onResume={() => onResume(toast.id)}
        />
      ))}
    </div>
  );
}

// Composant ToastItem avec animations fluides
function ToastItem({
  toast,
  onFermer,
  onPause,
  onResume
}: {
  toast: Toast;
  onFermer: () => void;
  onPause: () => void;
  onResume: () => void;
}) {
  const config = CONFIG_TOAST[toast.type];
  const Icone = config.icone;
  const [progression, setProgression] = useState(100);
  const intervalRef = useRef<TimerType | null>(null);
  const progressionRef = useRef(100);

  // Gérer le survol avec pause/reprise
  const handleMouseEnter = () => {
    onPause();
  };

  const handleMouseLeave = () => {
    onResume();
  };

  // Animation de la barre de progression
  useEffect(() => {
    if (!toast.duree || toast.duree <= 0 || toast.etatAnimation === 'sortie') return;

    const decrementParTick = 100 / (toast.duree / 50); // Mise à jour toutes les 50ms

    intervalRef.current = setInterval(() => {
      if (!toast.estEnPause) {
        progressionRef.current = Math.max(0, progressionRef.current - decrementParTick);
        setProgression(progressionRef.current);
      }
    }, 50);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [toast.duree, toast.etatAnimation, toast.estEnPause]);

  // Classes d'animation selon l'état
  const getClassesAnimation = () => {
    switch (toast.etatAnimation) {
      case 'entree':
        return 'translate-x-full opacity-0 scale-95';
      case 'sortie':
        return 'translate-x-full opacity-0 scale-95';
      case 'visible':
      default:
        return 'translate-x-0 opacity-100 scale-100';
    }
  };

  // Couleur de la barre de progression
  const getCouleurProgression = () => {
    switch (toast.type) {
      case 'succes': return 'bg-emerald-400';
      case 'erreur': return 'bg-red-400';
      case 'avertissement': return 'bg-amber-400';
      case 'info': return 'bg-blue-400';
    }
  };

  return (
    <div
      className={`
        pointer-events-auto
        relative overflow-hidden
        flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm
        ${config.classeFond} ${config.classeBordure}
        transform transition-all duration-400 ease-out
        ${getClassesAnimation()}
        hover:shadow-xl hover:scale-[1.02]
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {/* Icône avec animation de pulse à l'entrée */}
      <div
        className={`
          flex-shrink-0 ${config.classeIcone}
          ${toast.etatAnimation === 'visible' ? 'animate-pulse-once' : ''}
        `}
      >
        <Icone size={22} strokeWidth={2.5} />
      </div>

      {/* Message */}
      <p className="flex-1 text-sm font-medium text-gray-800 leading-relaxed pr-2">
        {toast.message}
      </p>

      {/* Bouton fermer avec animation hover */}
      <button
        onClick={onFermer}
        className="flex-shrink-0 p-1.5 -m-1 rounded-lg hover:bg-black/10 transition-all duration-200 hover:rotate-90 group"
      >
        <X size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
      </button>

      {/* Barre de progression */}
      {toast.duree && toast.duree > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 overflow-hidden">
          <div
            className={`h-full ${getCouleurProgression()} transition-all duration-100 ease-linear`}
            style={{
              width: `${progression}%`,
              opacity: toast.estEnPause ? 0.5 : 1,
            }}
          />
        </div>
      )}

      {/* Indicateur de pause au survol */}
      {toast.estEnPause && toast.duree && toast.duree > 0 && (
        <div className="absolute top-1 right-8 text-[10px] text-gray-400 font-medium animate-fade-in">
          En pause
        </div>
      )}
    </div>
  );
}

export { CONFIG_TOAST };
