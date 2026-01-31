import { useState, useEffect } from 'react';
import {
  Mail, Send, Inbox, Archive, Clock, CheckCheck, Eye,
  ArrowLeft, MessageCircle, RefreshCw, ChevronRight, X,
  Trash2, MailOpen, Reply, FolderOpen, ExternalLink, Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHeaderConfig } from '@/hooks/useHeaderConfig';
import { contactService, DemandeContactDTO } from '@/services/contactService';
import { useToast } from '@/contexts/ToastContext';
import AvatarUtilisateur from '@/components/ui/AvatarUtilisateur';

type DossierType = 'recus' | 'envoyes' | 'archives';
type StatutDemande = 'EN_ATTENTE' | 'LUE' | 'REPONDUE' | 'ARCHIVEE';

interface Dossier {
  id: DossierType;
  label: string;
  icon: typeof Inbox;
  count?: number;
}

const STATUT_CONFIG: Record<StatutDemande, { label: string; color: string; icon: typeof Clock }> = {
  EN_ATTENTE: { label: 'Non lu', color: 'badge-warning', icon: Clock },
  LUE: { label: 'Lu', color: 'badge-info', icon: Eye },
  REPONDUE: { label: 'Répondu', color: 'badge-success', icon: CheckCheck },
  ARCHIVEE: { label: 'Archivé', color: 'badge-ghost', icon: Archive },
};

export default function MesMessagesPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [dossierActif, setDossierActif] = useState<DossierType>('recus');
  const [messagesRecus, setMessagesRecus] = useState<DemandeContactDTO[]>([]);
  const [messagesEnvoyes, setMessagesEnvoyes] = useState<DemandeContactDTO[]>([]);
  const [messageSelectionne, setMessageSelectionne] = useState<DemandeContactDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [nombreNonLus, setNombreNonLus] = useState(0);
  const [reponse, setReponse] = useState('');
  const [afficherFormReponse, setAfficherFormReponse] = useState(false);

  // Vue mobile
  const [vueMobile, setVueMobile] = useState<'dossiers' | 'liste' | 'detail'>('liste');

  useHeaderConfig({});

  useEffect(() => {
    chargerMessages();
  }, []);

  const chargerMessages = async () => {
    try {
      setLoading(true);
      const [recus, envoyes, countNonLus] = await Promise.all([
        contactService.getDemandesRecues(),
        contactService.getDemandesEnvoyees(),
        contactService.compterDemandesNonLues()
      ]);
      setMessagesRecus(recus);
      setMessagesEnvoyes(envoyes);
      setNombreNonLus(countNonLus);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
      toast.erreur('Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  const marquerCommeLu = async (message: DemandeContactDTO) => {
    if (message.statut === 'EN_ATTENTE') {
      try {
        const updated = await contactService.marquerCommeLue(message.id);
        setMessagesRecus(prev => prev.map(m => m.id === message.id ? updated : m));
        setMessageSelectionne(updated);
        setNombreNonLus(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Erreur marquage lu:', error);
      }
    }
  };

  const selectionnerMessage = (message: DemandeContactDTO) => {
    setMessageSelectionne(message);
    setAfficherFormReponse(false);
    setReponse('');
    if (dossierActif === 'recus') {
      marquerCommeLu(message);
    }
  };

  const archiverMessage = async (messageId: number) => {
    try {
      setLoadingAction(true);
      await contactService.archiverDemande(messageId);
      toast.succes('Message archivé');
      setMessagesRecus(prev => prev.filter(m => m.id !== messageId));
      setMessagesEnvoyes(prev => prev.filter(m => m.id !== messageId));
      if (messageSelectionne?.id === messageId) {
        setMessageSelectionne(null);
      }
    } catch (error: any) {
      toast.erreur(error?.message || 'Erreur lors de l\'archivage');
    } finally {
      setLoadingAction(false);
    }
  };

  const envoyerReponse = async () => {
    if (!messageSelectionne || !reponse.trim()) return;

    try {
      setLoadingAction(true);
      await contactService.envoyerDemandeContact(messageSelectionne.expediteurId, {
        objet: `RE: ${messageSelectionne.objet}`,
        message: reponse.trim(),
      });
      toast.succes('Réponse envoyée avec succès');
      setReponse('');
      setAfficherFormReponse(false);
      chargerMessages();
    } catch (error: any) {
      toast.erreur(error?.message || 'Erreur lors de l\'envoi de la réponse');
    } finally {
      setLoadingAction(false);
    }
  };

  // Définition des dossiers
  const dossiers: Dossier[] = [
    { id: 'recus', label: 'Boîte de réception', icon: Inbox, count: nombreNonLus },
    { id: 'envoyes', label: 'Messages envoyés', icon: Send, count: undefined },
    { id: 'archives', label: 'Archives', icon: Archive, count: undefined },
  ];

  // Messages filtrés selon le dossier
  const getMessagesAffiches = (): DemandeContactDTO[] => {
    switch (dossierActif) {
      case 'recus':
        return messagesRecus.filter(m => m.statut !== 'ARCHIVEE');
      case 'envoyes':
        return messagesEnvoyes.filter(m => m.statut !== 'ARCHIVEE');
      case 'archives':
        return [...messagesRecus, ...messagesEnvoyes].filter(m => m.statut === 'ARCHIVEE');
      default:
        return [];
    }
  };

  const messagesAffiches = getMessagesAffiches();

  const formaterDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffJours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffJours === 0) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffJours === 1) {
      return 'Hier';
    } else if (diffJours < 7) {
      return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    }
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const ouvrirDetailMobile = (message: DemandeContactDTO) => {
    selectionnerMessage(message);
    setVueMobile('detail');
  };

  const retourListeMobile = () => {
    setVueMobile('liste');
    setMessageSelectionne(null);
  };

  const changerDossier = (dossierId: DossierType) => {
    setDossierActif(dossierId);
    setMessageSelectionne(null);
    setVueMobile('liste');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-base-200">
      {/* Colonne 1: Dossiers */}
      <div className={`
        w-56 bg-base-100 border-r border-base-300 flex-shrink-0 flex flex-col
        ${vueMobile !== 'dossiers' ? 'hidden lg:flex' : 'flex'}
      `}>
        {/* Header dossiers */}
        <div className="p-4 border-b border-base-200">
          <div className="flex items-center gap-2">
            <Mail size={20} className="text-primary" />
            <h2 className="font-bold text-gray-900">Messagerie</h2>
          </div>
        </div>

        {/* Liste des dossiers */}
        <nav className="flex-1 p-2 space-y-1">
          {dossiers.map((dossier) => {
            const Icon = dossier.icon;
            const isActive = dossierActif === dossier.id;
            return (
              <button
                key={dossier.id}
                onClick={() => changerDossier(dossier.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all
                  ${isActive
                    ? 'bg-primary text-white'
                    : 'hover:bg-base-200 text-gray-700'
                  }
                `}
              >
                <Icon size={18} />
                <span className="flex-1 text-sm font-medium truncate">{dossier.label}</span>
                {dossier.count !== undefined && dossier.count > 0 && (
                  <span className={`
                    min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold flex items-center justify-center
                    ${isActive ? 'bg-white/20 text-white' : 'bg-warning text-warning-content'}
                  `}>
                    {dossier.count > 99 ? '99+' : dossier.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-base-200">
          <button
            onClick={chargerMessages}
            disabled={loading}
            className="btn btn-ghost btn-sm w-full gap-2"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Colonne 2: Liste des messages */}
      <div className={`
        w-80 lg:w-96 bg-base-100 border-r border-base-300 flex-shrink-0 flex flex-col
        ${vueMobile === 'detail' ? 'hidden md:flex' : 'flex'}
        ${vueMobile === 'dossiers' ? 'hidden lg:flex' : ''}
      `}>
        {/* Header liste */}
        <div className="p-3 border-b border-base-200 flex items-center gap-2">
          <button
            onClick={() => setVueMobile('dossiers')}
            className="btn btn-ghost btn-sm btn-circle lg:hidden"
          >
            <FolderOpen size={18} />
          </button>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              {dossiers.find(d => d.id === dossierActif)?.label}
            </h3>
            <p className="text-xs text-gray-500">
              {messagesAffiches.length} message{messagesAffiches.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Liste */}
        <div className="flex-1 overflow-y-auto">
          {messagesAffiches.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mb-4">
                <Inbox size={28} className="text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">Aucun message</p>
              <p className="text-xs text-gray-400 mt-1">
                {dossierActif === 'recus' && 'Les messages reçus apparaîtront ici'}
                {dossierActif === 'envoyes' && 'Les messages envoyés apparaîtront ici'}
                {dossierActif === 'archives' && 'Les messages archivés apparaîtront ici'}
              </p>
            </div>
          ) : (
            messagesAffiches.map((message) => {
              const isSelected = messageSelectionne?.id === message.id;
              const isNonLu = message.statut === 'EN_ATTENTE' && dossierActif === 'recus';
              const contact = dossierActif === 'recus' || dossierActif === 'archives'
                ? { id: message.expediteurId, nom: message.expediteurNom, prenom: message.expediteurPrenom, hasPhoto: message.expediteurHasPhoto }
                : { id: message.destinataireId, nom: message.destinataireNom, prenom: message.destinatairePrenom, hasPhoto: message.destinataireHasPhoto };

              return (
                <div
                  key={message.id}
                  onClick={() => window.innerWidth < 768 ? ouvrirDetailMobile(message) : selectionnerMessage(message)}
                  className={`
                    p-3 border-b border-base-200 cursor-pointer transition-all
                    ${isSelected ? 'bg-primary/10 border-l-4 border-l-primary' : 'hover:bg-base-200/50'}
                    ${isNonLu ? 'bg-warning/5' : ''}
                  `}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <AvatarUtilisateur
                      utilisateurId={contact.id}
                      nom={contact.nom}
                      prenom={contact.prenom}
                      hasPhoto={contact.hasPhoto}
                      size="md"
                    />

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm truncate ${isNonLu ? 'font-bold' : 'font-medium'}`}>
                          {contact.prenom} {contact.nom}
                        </span>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {formaterDate(message.dateCreation)}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${isNonLu ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                        {message.objet}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {message.message.substring(0, 50)}...
                      </p>
                    </div>

                    {/* Indicateurs */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {isNonLu && (
                        <span className="w-2.5 h-2.5 bg-warning rounded-full"></span>
                      )}
                      <ChevronRight size={16} className="text-gray-300 md:hidden" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Colonne 3: Détail du message */}
      <div className={`
        flex-1 bg-base-100 flex flex-col min-w-0
        ${vueMobile !== 'detail' ? 'hidden md:flex' : 'flex'}
      `}>
        {messageSelectionne ? (
          <>
            {/* Header du message */}
            <div className="border-b border-base-200 p-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={retourListeMobile}
                  className="btn btn-ghost btn-sm btn-circle md:hidden"
                >
                  <ArrowLeft size={18} />
                </button>

                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-lg truncate">{messageSelectionne.objet}</h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`badge badge-sm ${STATUT_CONFIG[messageSelectionne.statut as StatutDemande].color}`}>
                      {STATUT_CONFIG[messageSelectionne.statut as StatutDemande].label}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(messageSelectionne.dateCreation).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {dossierActif === 'recus' && !messageSelectionne.estNotificationSysteme && (
                    <button
                      onClick={() => setAfficherFormReponse(!afficherFormReponse)}
                      className="btn btn-ghost btn-sm gap-1"
                      title="Répondre"
                    >
                      <Reply size={16} />
                      <span className="hidden sm:inline">Répondre</span>
                    </button>
                  )}
                  <button
                    onClick={() => archiverMessage(messageSelectionne.id)}
                    className="btn btn-ghost btn-sm text-error"
                    disabled={loadingAction}
                    title="Archiver"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Corps du message */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6">
              {/* Notification système - indicateur */}
              {messageSelectionne.estNotificationSysteme && (
                <div className="flex items-center gap-2 mb-4 p-3 bg-info/10 rounded-lg border border-info/20">
                  <Bell size={16} className="text-info flex-shrink-0" />
                  <span className="text-sm text-info">Notification système</span>
                </div>
              )}

              {/* Info expéditeur/destinataire */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-base-200/50 rounded-xl">
                {messageSelectionne.estNotificationSysteme ? (
                  <>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Bell size={24} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">Système</p>
                      <p className="text-sm text-gray-500">Notification automatique</p>
                    </div>
                  </>
                ) : (
                  <>
                    <AvatarUtilisateur
                      utilisateurId={dossierActif === 'recus' ? messageSelectionne.expediteurId : messageSelectionne.destinataireId}
                      nom={dossierActif === 'recus' ? messageSelectionne.expediteurNom : messageSelectionne.destinataireNom}
                      prenom={dossierActif === 'recus' ? messageSelectionne.expediteurPrenom : messageSelectionne.destinatairePrenom}
                      hasPhoto={dossierActif === 'recus' ? messageSelectionne.expediteurHasPhoto : messageSelectionne.destinataireHasPhoto}
                      size="lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">
                        {dossierActif === 'recus'
                          ? `${messageSelectionne.expediteurPrenom} ${messageSelectionne.expediteurNom}`
                          : `${messageSelectionne.destinatairePrenom} ${messageSelectionne.destinataireNom}`
                        }
                      </p>
                      <p className="text-sm text-gray-500">
                        {dossierActif === 'recus' ? 'Expéditeur' : 'Destinataire'}
                      </p>
                    </div>
                    {dossierActif === 'recus' && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MailOpen size={14} />
                        <span>À moi</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Contenu du message */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-base-200">
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {messageSelectionne.message}
                </p>
              </div>

              {/* Lien vers l'élément référencé (pour les notifications système) */}
              {messageSelectionne.lienReference && (
                <div className="mt-4">
                  <button
                    onClick={() => navigate(messageSelectionne.lienReference!)}
                    className="btn btn-primary btn-sm gap-2"
                  >
                    <ExternalLink size={16} />
                    {messageSelectionne.typeReference === 'PROJET' && 'Voir le projet'}
                    {messageSelectionne.typeReference === 'TACHE' && 'Voir la tâche'}
                    {messageSelectionne.typeReference === 'LIVRABLE' && 'Voir le livrable'}
                    {messageSelectionne.typeReference === 'CANDIDATURE' && 'Voir la candidature'}
                    {!messageSelectionne.typeReference && 'Voir les détails'}
                  </button>
                </div>
              )}

              {/* Email de réponse si présent */}
              {messageSelectionne.emailReponse && (
                <div className="mt-4 p-3 bg-info/10 rounded-lg">
                  <p className="text-xs text-info flex items-center gap-2">
                    <Mail size={14} />
                    Email de réponse souhaité : <strong>{messageSelectionne.emailReponse}</strong>
                  </p>
                </div>
              )}
            </div>

            {/* Zone de réponse - uniquement pour les messages reçus non-système */}
            {dossierActif === 'recus' && afficherFormReponse && !messageSelectionne.estNotificationSysteme && (
              <div className="border-t border-base-200 p-4 bg-base-50 flex-shrink-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Reply size={16} />
                      Répondre à {messageSelectionne.expediteurPrenom}
                    </span>
                    <button
                      onClick={() => { setAfficherFormReponse(false); setReponse(''); }}
                      className="btn btn-ghost btn-xs btn-circle"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <textarea
                    value={reponse}
                    onChange={(e) => setReponse(e.target.value)}
                    placeholder="Écrivez votre réponse..."
                    className="textarea textarea-bordered w-full text-sm resize-none"
                    rows={4}
                    maxLength={5000}
                    autoFocus
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{reponse.length}/5000</span>
                    <button
                      onClick={envoyerReponse}
                      disabled={!reponse.trim() || loadingAction}
                      className="btn btn-primary btn-sm gap-2"
                    >
                      {loadingAction ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        <Send size={14} />
                      )}
                      Envoyer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* État vide - aucun message sélectionné */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-base-50">
            <div className="w-24 h-24 bg-base-200 rounded-full flex items-center justify-center mb-6">
              <MessageCircle size={40} className="text-gray-400" />
            </div>
            <p className="text-xl font-medium text-gray-600 mb-2">Sélectionnez un message</p>
            <p className="text-sm text-gray-400 max-w-xs">
              Cliquez sur un message dans la liste pour afficher son contenu ici
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
