import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// Types
export type TypeToast = 'succes' | 'erreur' | 'avertissement' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: TypeToast;
  duree?: number;
}

interface ToastContextType {
  toasts: Toast[];
  succes: (message: string, duree?: number) => void;
  erreur: (message: string | Error | unknown, duree?: number) => void;
  avertissement: (message: string, duree?: number) => void;
  info: (message: string, duree?: number) => void;
  fermer: (id: string) => void;
  fermerTous: () => void;
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

// Provider
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const ajouterToast = useCallback((type: TypeToast, message: string, duree?: number) => {
    const id = genererIdToast();
    const nouveauToast: Toast = {
      id,
      message,
      type,
      duree: duree ?? CONFIG_TOAST[type].dureeDefaut,
    };

    setToasts((precedents) => [...precedents, nouveauToast]);

    // Auto-suppression
    if (nouveauToast.duree && nouveauToast.duree > 0) {
      setTimeout(() => {
        setToasts((precedents) => precedents.filter((t) => t.id !== id));
      }, nouveauToast.duree);
    }

    return id;
  }, []);

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
    setToasts((precedents) => precedents.filter((t) => t.id !== id));
  }, []);

  const fermerTous = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, succes, erreur, avertissement, info, fermer, fermerTous }}>
      {children}
      <ToastContainer toasts={toasts} onFermer={fermer} />
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
function ToastContainer({ toasts, onFermer }: { toasts: Toast[]; onFermer: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast, index) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onFermer={() => onFermer(toast.id)}
          index={index}
        />
      ))}
    </div>
  );
}

// Composant ToastItem
function ToastItem({ toast, onFermer, index }: { toast: Toast; onFermer: () => void; index: number }) {
  const config = CONFIG_TOAST[toast.type];
  const Icone = config.icone;

  return (
    <div
      className={`
        pointer-events-auto
        flex items-start gap-3 p-4 rounded-xl border shadow-lg
        ${config.classeFond} ${config.classeBordure}
        animate-in slide-in-from-right-5 fade-in duration-300
      `}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className={`flex-shrink-0 ${config.classeIcone}`}>
        <Icone size={22} />
      </div>
      <p className="flex-1 text-sm font-medium text-gray-800 leading-relaxed">
        {toast.message}
      </p>
      <button
        onClick={onFermer}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors"
      >
        <X size={16} className="text-gray-400" />
      </button>
    </div>
  );
}

export { CONFIG_TOAST };
