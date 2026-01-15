import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Lock, Briefcase, Save, AlertCircle, CheckCircle, Phone, Mail, Calendar, Eye, EyeOff, Camera, Trash2, Upload, Building2
} from 'lucide-react';
import { profilService, type ProfilComplet, type UpdateProfilData } from '@/services/profilService';
import ProfilProfessionnel from '@/components/forms/ProfilProfessionnel';

export default function MonComptePage() {
  const navigate = useNavigate();
  const [ongletActif, setOngletActif] = useState<'personnel' | 'motdepasse' | 'professionnel'>('personnel');
  const [profil, setProfil] = useState<ProfilComplet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', texte: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // États pour le formulaire
  const [formData, setFormData] = useState<UpdateProfilData>({
    typePersonne: 'PHYSIQUE',
    nom: '',
    prenom: '',
    telephone: '',
    dateNaissance: undefined,
    // Professionnels
    domaineExpertise: '',
    experience: '',
    biographie: '',
  });
  
  // États pour les listes
  const [domainesInteret, setDomainesInteret] = useState<string[]>([]);

  // États pour le changement de mot de passe
  const [motDePasseActuel, setMotDePasseActuel] = useState('');
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState('');
  const [afficherMotDePasseActuel, setAfficherMotDePasseActuel] = useState(false);
  const [afficherNouveauMotDePasse, setAfficherNouveauMotDePasse] = useState(false);
  const [afficherConfirmation, setAfficherConfirmation] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [erreurMotDePasse, setErreurMotDePasse] = useState<string | null>(null);

  // États pour la photo de profil
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoTimestamp, setPhotoTimestamp] = useState(Date.now());

  // Charger le profil au montage
  useEffect(() => {
    chargerProfil();
  }, []);

  const chargerProfil = async () => {
    try {
      setIsLoading(true);
      const data = await profilService.getProfil();
      setProfil(data);

      // Remplir le formulaire avec les données existantes
      const perso = data.informationsPersonnelles;
      const pro = data.informationsProfessionnelles;
      
      setFormData({
        typePersonne: perso.typePersonne || 'PHYSIQUE',
        nom: perso.nom || '',
        prenom: perso.prenom || '',
        telephone: perso.telephone || '',
        dateNaissance: perso.dateNaissance,
        domaineExpertise: pro.domaineExpertise || '',
        experience: pro.experience || '',
        biographie: pro.biographie || '',
      });
      
      // Charger les listes
      console.log('📥 [FRONTEND] Domaines d\'intérêt reçus du backend:', pro.domainesInteret);
      setDomainesInteret(pro.domainesInteret || []);
      console.log('📥 [FRONTEND] State domainesInteret initialisé');
    } catch (error: any) {
      console.error('Erreur lors du chargement du profil:', error);
      
      // Si l'erreur est clairement liée à l'authentification (401), rediriger vers la page d'accueil
      if (error?.message?.includes('401')) {
        afficherMessage('error', 'Veuillez vous connecter pour accéder à votre profil');
        setTimeout(() => navigate('/'), 2000);
      } else {
        // Pour les autres erreurs (404, erreur fonctionnelle, etc.), rester sur la page
        afficherMessage('error', 'Erreur lors du chargement du profil');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const afficherMessage = (type: 'success' | 'error', texte: string) => {
    setMessage({ type, texte });
    setTimeout(() => setMessage(null), 5000);
  };

  const validerFormulaire = (): boolean => {
    const nouvellesErreurs: Record<string, string> = {};

    // Validation des champs obligatoires
    if (!formData.nom?.trim()) nouvellesErreurs.nom = 'Le nom est obligatoire';
    
    // Prénom obligatoire uniquement pour les personnes physiques
    if (formData.typePersonne === 'PHYSIQUE' && !formData.prenom?.trim()) {
      nouvellesErreurs.prenom = 'Le prénom est obligatoire pour une personne physique';
    }
    
    if (!formData.telephone?.trim()) {
      nouvellesErreurs.telephone = 'Le téléphone est obligatoire';
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.telephone.replace(/\s/g, ''))) {
      nouvellesErreurs.telephone = 'Format de téléphone invalide';
    }

    // Date de naissance obligatoire
    if (!formData.dateNaissance) {
      nouvellesErreurs.dateNaissance = formData.typePersonne === 'PHYSIQUE' 
        ? 'La date de naissance est obligatoire'
        : 'La date de création est obligatoire';
    }

    setErrors(nouvellesErreurs);
    return Object.keys(nouvellesErreurs).length === 0;
  };

  const sauvegarderProfil = async () => {
    if (!validerFormulaire()) {
      afficherMessage('error', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSaving(true);
    try {
      // Préparer les données à envoyer
      const dataToSend: any = {
        ...formData,
        domainesInteret: JSON.stringify(domainesInteret),
      };
      
      console.log('📤 [FRONTEND] Domaines d\'intérêt envoyés:', domainesInteret);
      console.log('📤 [FRONTEND] Domaines d\'intérêt JSON:', dataToSend.domainesInteret);
      
      // Pour les personnes morales, ne pas envoyer le prénom (ou l'envoyer vide)
      if (formData.typePersonne === 'MORALE') {
        dataToSend.prenom = '';
      }
      
      const response = await profilService.updateProfil(dataToSend);
      
      setProfil(response.profil);
      // Synchroniser les domaines d'intérêt avec les données retournées
      console.log('📥 [FRONTEND] Réponse du serveur - domaines d\'intérêt:', response.profil.informationsProfessionnelles?.domainesInteret);
      if (response.profil.informationsProfessionnelles) {
        setDomainesInteret(response.profil.informationsProfessionnelles.domainesInteret || []);
        console.log('✅ [FRONTEND] State domainesInteret synchronisé après sauvegarde');
      }
      afficherMessage('success', response.message);

      // Si le profil est maintenant complet, rediriger
      if (response.profil.profilComplet) {
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      afficherMessage('error', error.message || 'Erreur lors de la sauvegarde du profil');
    } finally {
      setIsSaving(false);
    }
  };

  // Fonctions pour gérer la photo de profil
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type
    const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!acceptedTypes.includes(file.type)) {
      afficherMessage('error', 'Type de fichier non accepté. Utilisez JPEG, PNG, GIF ou WebP');
      return;
    }

    // Vérifier la taille (5 MB max)
    if (file.size > 5 * 1024 * 1024) {
      afficherMessage('error', 'Le fichier est trop volumineux (max 5 MB)');
      return;
    }

    // Créer la prévisualisation
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setPhotoFile(file);
  };

  const annulerPhotoPreview = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadPhoto = async () => {
    if (!photoFile) return;

    setIsUploadingPhoto(true);
    try {
      await profilService.uploadPhoto(photoFile);
      afficherMessage('success', 'Photo mise à jour avec succès');
      setPhotoPreview(null);
      setPhotoFile(null);
      setPhotoTimestamp(Date.now());
      // Recharger le profil pour mettre à jour hasPhoto
      const data = await profilService.getProfil();
      setProfil(data);
    } catch (error: any) {
      afficherMessage('error', error.message || 'Erreur lors de l\'upload de la photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const supprimerPhoto = async () => {
    setIsUploadingPhoto(true);
    try {
      await profilService.supprimerPhoto();
      afficherMessage('success', 'Photo supprimée avec succès');
      setPhotoTimestamp(Date.now());
      // Recharger le profil pour mettre à jour hasPhoto
      const data = await profilService.getProfil();
      setProfil(data);
    } catch (error: any) {
      afficherMessage('error', error.message || 'Erreur lors de la suppression de la photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Fonction pour changer le mot de passe
  const changerMotDePasse = async () => {
    setErreurMotDePasse(null);

    // Validations
    if (!motDePasseActuel.trim()) {
      setErreurMotDePasse('Le mot de passe actuel est requis');
      return;
    }

    if (!nouveauMotDePasse.trim()) {
      setErreurMotDePasse('Le nouveau mot de passe est requis');
      return;
    }

    if (nouveauMotDePasse.length < 8) {
      setErreurMotDePasse('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (nouveauMotDePasse !== confirmationMotDePasse) {
      setErreurMotDePasse('Les mots de passe ne correspondent pas');
      return;
    }

    if (motDePasseActuel === nouveauMotDePasse) {
      setErreurMotDePasse('Le nouveau mot de passe doit être différent de l\'ancien');
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await profilService.changerMotDePasse(
        motDePasseActuel,
        nouveauMotDePasse,
        confirmationMotDePasse
      );

      afficherMessage('success', response.message || 'Mot de passe modifié avec succès');

      // Réinitialiser les champs
      setMotDePasseActuel('');
      setNouveauMotDePasse('');
      setConfirmationMotDePasse('');
    } catch (error: any) {
      console.error('Erreur lors du changement de mot de passe:', error);
      setErreurMotDePasse(error.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const onglets = profil?.hasOAuthProvider 
    ? [
        { id: 'personnel', label: 'Informations générales', icon: User },
        { id: 'professionnel', label: 'Informations professionnelles', icon: Briefcase }
      ]
    : [
        { id: 'personnel', label: 'Informations générales', icon: User },
        { id: 'motdepasse', label: 'Mot de passe', icon: Lock },
        { id: 'professionnel', label: 'Informations professionnelles', icon: Briefcase }
      ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Alerte profil incomplet */}
      {!profil?.profilComplet && (
        <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-amber-900">Profil incomplet</h3>
              <p className="text-amber-700 text-sm mt-1">
                Veuillez remplir tous les champs obligatoires (*) dans l'onglet "Informations générales" pour exploiter toutes les fonctionnalités de la plateforme.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Message de feedback */}
      {message && (
        <div className={`mb-6 px-4 py-3 rounded-lg flex items-center gap-3 ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle size={20} className="flex-shrink-0" />
          ) : (
            <AlertCircle size={20} className="flex-shrink-0" />
          )}
          <span>{message.texte}</span>
        </div>
      )}

      {/* Onglets */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {onglets.map((onglet) => {
            const Icon = onglet.icon;
            return (
              <button
                key={onglet.id}
                onClick={() => setOngletActif(onglet.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-all relative ${
                  ongletActif === onglet.id
                    ? 'text-primary bg-primary/5'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                <span className="hidden sm:inline">{onglet.label}</span>
                {ongletActif === onglet.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary"></div>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-8">
          {/* Onglet Informations Générales */}
          {ongletActif === 'personnel' && (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Colonne gauche : Formulaire */}
              <div className="flex-1 space-y-6">
                {/* Sélecteur de type de personne */}
                <div className="mb-6">
                  <label className="block text-gray-900 font-medium mb-3">Type de compte *</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, typePersonne: 'PHYSIQUE' }));
                        setErrors(prev => ({ ...prev, prenom: '' }));
                      }}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        formData.typePersonne === 'PHYSIQUE'
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <User className="mx-auto mb-2" size={24} />
                      <div className="font-medium text-gray-900">Personne physique</div>
                      <div className="text-sm text-gray-500 mt-1">Particulier</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, typePersonne: 'MORALE', prenom: '' }));
                        setErrors(prev => ({ ...prev, prenom: '' }));
                      }}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        formData.typePersonne === 'MORALE'
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Building2 className="mx-auto mb-2" size={24} />
                      <div className="font-medium text-gray-900">Personne morale</div>
                      <div className="text-sm text-gray-500 mt-1">Entreprise, association</div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Prénom : affiché uniquement pour les personnes physiques */}
                  {formData.typePersonne === 'PHYSIQUE' && (
                    <div>
                      <label className="block text-gray-900 font-medium mb-2 flex items-center gap-2">
                        <User size={16} />
                        Prénom *
                      </label>
                      <input
                        type="text"
                        value={formData.prenom}
                        onChange={(e) => setFormData(prev => ({ ...prev, prenom: e.target.value }))}
                        className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors.prenom ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Votre prénom"
                      />
                      {errors.prenom && <p className="text-red-500 text-sm mt-1">{errors.prenom}</p>}
                    </div>
                  )}

                  <div className={formData.typePersonne === 'MORALE' ? 'md:col-span-2' : ''}>
                    <label className="block text-gray-900 font-medium mb-2 flex items-center gap-2">
                      <User size={16} />
                      {formData.typePersonne === 'MORALE' ? "Nom de l'organisation *" : 'Nom *'}
                    </label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.nom ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={formData.typePersonne === 'MORALE' ? "Nom de votre organisation" : "Votre nom"}
                    />
                    {errors.nom && <p className="text-red-500 text-sm mt-1">{errors.nom}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-900 font-medium mb-2 flex items-center gap-2">
                    <Calendar size={16} />
                    {formData.typePersonne === 'PHYSIQUE' ? 'Date de naissance *' : 'Date de création *'}
                  </label>
                  <input
                    type="date"
                    value={formData.dateNaissance || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateNaissance: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.dateNaissance ? 'border-red-500' : 'border-gray-300'
                    }`}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {errors.dateNaissance && <p className="text-red-500 text-sm mt-1">{errors.dateNaissance}</p>}
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.typePersonne === 'PHYSIQUE'
                      ? 'Votre date de naissance'
                      : "Date de création de l'organisation"}
                  </p>
                </div>

                <div>
                  <label className="block text-gray-900 font-medium mb-2 flex items-center gap-2">
                    <Mail size={16} />
                    Email
                  </label>
                  <input
                    type="email"
                    value={profil?.informationsPersonnelles.email || ''}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                  <p className="text-sm text-gray-500 mt-1">L'email ne peut pas être modifié</p>
                </div>

                <div>
                  <label className="block text-gray-900 font-medium mb-2 flex items-center gap-2">
                    <Phone size={16} />
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => setFormData(prev => ({ ...prev, telephone: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.telephone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+228 XX XX XX XX"
                  />
                  {errors.telephone && <p className="text-red-500 text-sm mt-1">{errors.telephone}</p>}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={sauvegarderProfil}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg"
                  >
                    <Save size={20} />
                    {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </div>

              {/* Colonne droite : Photo de profil */}
              <div className="lg:w-72 flex-shrink-0">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-4 text-center">
                    {formData.typePersonne === 'PHYSIQUE' ? 'Photo de profil' : 'Logo'}
                  </h3>

                  {/* Zone de prévisualisation */}
                  <div className="relative mx-auto w-40 h-40 mb-4">
                    {/* Image */}
                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Prévisualisation"
                          className="w-full h-full object-cover"
                        />
                      ) : profil?.hasPhoto ? (
                        <img
                          src={`/api/profil/photo?t=${photoTimestamp}`}
                          alt="Photo de profil"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {formData.typePersonne === 'PHYSIQUE' ? (
                            <User className="w-16 h-16 text-gray-400" />
                          ) : (
                            <Building2 className="w-16 h-16 text-gray-400" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Badge indicateur */}
                    {!photoPreview && !profil?.hasPhoto && (
                      <div className="absolute -bottom-1 -right-1 bg-gray-400 rounded-full p-2">
                        <Camera className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Input fichier caché */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />

                  {/* Actions */}
                  <div className="space-y-2">
                    {photoPreview ? (
                      <>
                        {/* Mode prévisualisation */}
                        <button
                          onClick={uploadPhoto}
                          disabled={isUploadingPhoto}
                          className="btn btn-primary btn-sm w-full gap-2"
                        >
                          {isUploadingPhoto ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            <CheckCircle size={16} />
                          )}
                          Valider
                        </button>
                        <button
                          onClick={annulerPhotoPreview}
                          disabled={isUploadingPhoto}
                          className="btn btn-ghost btn-sm w-full gap-2"
                        >
                          Annuler
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Mode normal */}
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingPhoto}
                          className="btn btn-primary btn-sm w-full gap-2"
                        >
                          <Upload size={16} />
                          {profil?.hasPhoto ? 'Modifier' : 'Ajouter'}
                        </button>
                        {profil?.hasPhoto && (
                          <button
                            onClick={supprimerPhoto}
                            disabled={isUploadingPhoto}
                            className="btn btn-ghost btn-sm w-full gap-2 text-error hover:bg-error/10"
                          >
                            {isUploadingPhoto ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              <Trash2 size={16} />
                            )}
                            Supprimer
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {/* Infos */}
                  <p className="text-xs text-gray-500 text-center mt-4">
                    JPEG, PNG, GIF ou WebP<br />
                    Max 5 MB
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Mot de passe (visible uniquement si pas OAuth) */}
          {ongletActif === 'motdepasse' && !profil?.hasOAuthProvider && (
            <div className="space-y-6 max-w-md mx-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock size={32} className="text-primary" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Modifier le mot de passe</h2>
                <p className="text-gray-500 text-sm mt-2">
                  Assurez-vous d'utiliser un mot de passe fort avec au moins 8 caractères
                </p>
              </div>

              {/* Message d'erreur */}
              {erreurMotDePasse && (
                <div className="alert alert-error">
                  <AlertCircle size={20} />
                  <span>{erreurMotDePasse}</span>
                </div>
              )}

              {/* Mot de passe actuel */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Mot de passe actuel *</span>
                </label>
                <div className="relative">
                  <input
                    type={afficherMotDePasseActuel ? 'text' : 'password'}
                    value={motDePasseActuel}
                    onChange={(e) => setMotDePasseActuel(e.target.value)}
                    className="input input-bordered w-full pr-12"
                    placeholder="Entrez votre mot de passe actuel"
                  />
                  <button
                    type="button"
                    onClick={() => setAfficherMotDePasseActuel(!afficherMotDePasseActuel)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {afficherMotDePasseActuel ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Nouveau mot de passe */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Nouveau mot de passe *</span>
                </label>
                <div className="relative">
                  <input
                    type={afficherNouveauMotDePasse ? 'text' : 'password'}
                    value={nouveauMotDePasse}
                    onChange={(e) => setNouveauMotDePasse(e.target.value)}
                    className="input input-bordered w-full pr-12"
                    placeholder="Entrez votre nouveau mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setAfficherNouveauMotDePasse(!afficherNouveauMotDePasse)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {afficherNouveauMotDePasse ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <label className="label">
                  <span className="label-text-alt text-gray-500">Minimum 8 caractères</span>
                </label>
              </div>

              {/* Confirmation du nouveau mot de passe */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Confirmer le nouveau mot de passe *</span>
                </label>
                <div className="relative">
                  <input
                    type={afficherConfirmation ? 'text' : 'password'}
                    value={confirmationMotDePasse}
                    onChange={(e) => setConfirmationMotDePasse(e.target.value)}
                    className="input input-bordered w-full pr-12"
                    placeholder="Confirmez votre nouveau mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setAfficherConfirmation(!afficherConfirmation)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {afficherConfirmation ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {nouveauMotDePasse && confirmationMotDePasse && nouveauMotDePasse !== confirmationMotDePasse && (
                  <label className="label">
                    <span className="label-text-alt text-error">Les mots de passe ne correspondent pas</span>
                  </label>
                )}
                {nouveauMotDePasse && confirmationMotDePasse && nouveauMotDePasse === confirmationMotDePasse && (
                  <label className="label">
                    <span className="label-text-alt text-success flex items-center gap-1">
                      <CheckCircle size={14} /> Les mots de passe correspondent
                    </span>
                  </label>
                )}
              </div>

              {/* Bouton de soumission */}
              <div className="pt-4">
                <button
                  onClick={changerMotDePasse}
                  disabled={isChangingPassword || !motDePasseActuel || !nouveauMotDePasse || !confirmationMotDePasse}
                  className="btn btn-primary w-full gap-2"
                >
                  {isChangingPassword ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Modification en cours...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Modifier le mot de passe
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Onglet Informations Professionnelles */}
          {ongletActif === 'professionnel' && (
            <ProfilProfessionnel
              formData={formData}
              setFormData={setFormData}
              domainesInteret={domainesInteret}
              setDomainesInteret={setDomainesInteret}
              onSave={sauvegarderProfil}
              isSaving={isSaving}
            />
          )}
        </div>
      </div>
    </div>
  );
}
