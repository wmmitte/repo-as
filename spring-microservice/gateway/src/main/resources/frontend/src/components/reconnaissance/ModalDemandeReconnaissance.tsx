import { useState, useEffect } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import { reconnaissanceService } from '@/services/reconnaissanceService';
import { TypePiece } from '@/types/reconnaissance.types';
import Toast from '@/components/ui/Toast';

interface ModalDemandeReconnaissanceProps {
  isOpen: boolean;
  onClose: () => void;
  competenceId: number;
  competenceNom: string;
  onSuccess?: () => void;
}

interface FichierUpload {
  file: File;
  typePiece: TypePiece;
  description: string;
}

const TYPE_PIECE_LABELS: Record<TypePiece, string> = {
  [TypePiece.CERTIFICAT]: 'Certificat',
  [TypePiece.DIPLOME]: 'Diplôme',
  [TypePiece.PROJET]: 'Projet',
  [TypePiece.RECOMMANDATION]: 'Recommandation',
  [TypePiece.EXPERIENCE]: 'Expérience',
  [TypePiece.PUBLICATION]: 'Publication',
  [TypePiece.AUTRE]: 'Autre',
};

export default function ModalDemandeReconnaissance({
  isOpen,
  onClose,
  competenceId,
  competenceNom,
  onSuccess,
}: ModalDemandeReconnaissanceProps) {
  const [etape, setEtape] = useState<'justification' | 'paiement'>('justification');
  const [commentaire, setCommentaire] = useState('');
  const [fichiers, setFichiers] = useState<FichierUpload[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // État pour le toast de succès
  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    isOpen: false,
    message: '',
    type: 'success'
  });

  // Ajout fichier
  const [typePieceSelectionne, setTypePieceSelectionne] = useState<TypePiece>(TypePiece.CERTIFICAT);
  const [descriptionPiece, setDescriptionPiece] = useState('');

  // Fonction de réinitialisation du formulaire
  const resetForm = () => {
    setEtape('justification');
    setCommentaire('');
    setFichiers([]);
    setError(null);
  };

  // Réinitialiser le formulaire quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Réinitialiser l'erreur quand la compétence change
  useEffect(() => {
    setError(null);
  }, [competenceId]);

  const handleFichierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setFichiers([...fichiers, {
        file: files[0],
        typePiece: typePieceSelectionne,
        description: descriptionPiece || files[0].name,
      }]);
      setDescriptionPiece('');
      e.target.value = '';
    }
  };

  const retirerFichier = (index: number) => {
    setFichiers(fichiers.filter((_, i) => i !== index));
  };

  const handleSoumettre = async () => {
    if (!commentaire.trim()) {
      setError('Veuillez fournir une justification');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Créer la demande
      const demande = await reconnaissanceService.soumettreDemande({
        competenceId,
        commentaire,
      });

      // 2. Upload des pièces justificatives
      for (const fichier of fichiers) {
        await reconnaissanceService.ajouterPieceJustificative(
          demande.id,
          fichier.file,
          fichier.typePiece,
          fichier.description
        );
      }

      // Success!
      if (onSuccess) onSuccess();
      
      // Afficher le toast de succès
      setToast({
        isOpen: true,
        message: '🎉 Demande de reconnaissance soumise avec succès !',
        type: 'success'
      });
      
      // Fermer le modal après un petit délai pour que l'utilisateur voie le toast
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la soumission');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">🎓 Demande de reconnaissance</h2>
            <p className="text-gray-600 text-sm">{competenceNom}</p>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center gap-2">
            <div className={`flex-1 h-2 rounded ${etape === 'justification' ? 'bg-blue-500' : 'bg-green-500'}`} />
            <div className={`flex-1 h-2 rounded ${etape === 'paiement' ? 'bg-blue-500' : 'bg-gray-300'}`} />
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className={etape === 'justification' ? 'font-semibold text-blue-600' : 'text-gray-600'}>
              1. Justification
            </span>
            <span className={etape === 'paiement' ? 'font-semibold text-blue-600' : 'text-gray-600'}>
              2. Paiement
            </span>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {etape === 'justification' && (
            <>
              {/* Justification */}
              <div>
                <label className="block font-semibold mb-2">Justification *</label>
                <textarea
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  rows={6}
                  className="w-full border rounded-lg p-3"
                  placeholder="Expliquez pourquoi vous méritez cette certification&#10;&#10;Exemples :&#10;- Années d'expérience&#10;- Projets réalisés&#10;- Formations suivies&#10;- Certifications obtenues..."
                  disabled={loading}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {commentaire.length}/1000 caractères
                </p>
              </div>

              {/* Pièces justificatives */}
              <div>
                <label className="block font-semibold mb-3">Pièces justificatives</label>
                <p className="text-sm text-gray-600 mb-4">
                  Ajoutez des documents pour appuyer votre demande (certificats, projets, recommandations...)
                </p>

                <div className="space-y-4">
                  {/* Formulaire d'ajout */}
                  <div className="border-2 border-dashed rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Type de document</label>
                        <select
                          value={typePieceSelectionne}
                          onChange={(e) => setTypePieceSelectionne(e.target.value as TypePiece)}
                          className="w-full border rounded px-3 py-2"
                        >
                          {Object.entries(TYPE_PIECE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <input
                          type="text"
                          value={descriptionPiece}
                          onChange={(e) => setDescriptionPiece(e.target.value)}
                          placeholder="Ex: Certificat Oracle Java"
                          className="w-full border rounded px-3 py-2"
                        />
                      </div>
                    </div>

                    <label className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 border-2 border-blue-300 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                      <Upload size={20} className="text-blue-600" />
                      <span className="text-blue-600 font-medium">Choisir un fichier</span>
                      <input
                        type="file"
                        onChange={handleFichierChange}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                      />
                    </label>
                    <p className="text-xs text-gray-500 text-center">
                      PDF, DOC, DOCX, images (max 10 MB)
                    </p>
                  </div>

                  {/* Liste des fichiers */}
                  {fichiers.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-medium">{fichiers.length} fichier(s) ajouté(s)</p>
                      {fichiers.map((fichier, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{fichier.file.name}</p>
                            <p className="text-sm text-gray-600">
                              {TYPE_PIECE_LABELS[fichier.typePiece]} - {fichier.description}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(fichier.file.size / 1024).toFixed(0)} Ko
                            </p>
                          </div>
                          <button
                            onClick={() => retirerFichier(index)}
                            className="p-2 text-red-500 hover:bg-red-100 rounded"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {etape === 'paiement' && (
            <>
              {/* Étape paiement - À implémenter */}
              <div className="text-center py-12">
                <p className="text-gray-500">
                  Module de paiement à venir...
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-between">
          {etape === 'justification' ? (
            <>
              <button
                onClick={handleClose}
                disabled={loading}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => setEtape('paiement')}
                disabled={!commentaire.trim() || loading}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                Continuer →
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEtape('justification')}
                disabled={loading}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50"
              >
                ← Retour
              </button>
              <button
                onClick={handleSoumettre}
                disabled={loading}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? 'Envoi...' : '✓ Soumettre la demande'}
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Toast de notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
        duration={4000}
      />
    </div>
  );
}
