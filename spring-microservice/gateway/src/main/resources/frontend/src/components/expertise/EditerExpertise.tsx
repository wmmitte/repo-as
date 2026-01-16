import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, Plus, Star, Trash2, Edit2, Award, Clock } from 'lucide-react';
import { Expertise, defaultExpertise, Competence } from '../../types/expertise.types';
import { expertiseService } from '../../services/expertiseService';
import ModalDemandeReconnaissance from '@/components/reconnaissance/ModalDemandeReconnaissance';
import ModalDetailsCompetence from '@/components/competence/ModalDetailsCompetence';
import { reconnaissanceService } from '@/services/reconnaissanceService';
import { BadgeCompetenceDTO, DemandeReconnaissanceDTO, StatutDemande } from '@/types/reconnaissance.types';
import { useToast } from '@/contexts/ToastContext';

interface EditerExpertiseProps {
  onSave?: () => void;
  onDemandeSubmitted?: () => void;
}

const EditerExpertise: React.FC<EditerExpertiseProps> = ({ onSave, onDemandeSubmitted }) => {
  const toast = useToast();
  const [expertise, setExpertise] = useState<Expertise>(defaultExpertise);
  const [competences, setCompetences] = useState<Competence[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  
  // État pour l'ajout/édition de compétence
  const [editingCompetence, setEditingCompetence] = useState<Competence | null>(null);
  const [showCompetenceForm, setShowCompetenceForm] = useState(false);
  
  // État pour le modal de confirmation de suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [competenceToDelete, setCompetenceToDelete] = useState<{ id: number; nom: string } | null>(null);
  
  // État pour l'autocomplete du référentiel de compétences
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [competenceReferenceId, setCompetenceReferenceId] = useState<number | null>(null);
  const [isValidSelection, setIsValidSelection] = useState(false); // Indique si une compétence valide a été sélectionnée
  
  // État pour l'autocomplete des certifications
  const [certificationSuggestions, setCertificationSuggestions] = useState<any[]>([]);
  const [showCertificationSuggestions, setShowCertificationSuggestions] = useState(false);
  const [loadingCertificationSuggestions, setLoadingCertificationSuggestions] = useState(false);
  const [certificationInput, setCertificationInput] = useState('');
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);
  
  // État pour l'autocomplete des localisations
  const [localisationSuggestions, setLocalisationSuggestions] = useState<any[]>([]);
  const [showLocalisationSuggestions, setShowLocalisationSuggestions] = useState(false);
  const [loadingLocalisationSuggestions, setLoadingLocalisationSuggestions] = useState(false);
  const [localisationInput, setLocalisationInput] = useState('');
  
  // État pour la demande de reconnaissance
  const [modalReconnaissanceOuvert, setModalReconnaissanceOuvert] = useState(false);
  const [competenceSelectionnee, setCompetenceSelectionnee] = useState<Competence | null>(null);

  // État pour le modal de détails de compétence
  const [modalDetailsOuvert, setModalDetailsOuvert] = useState(false);
  const [competencePourDetails, setCompetencePourDetails] = useState<Competence | null>(null);
  const [badgesCertifies, setBadgesCertifies] = useState<BadgeCompetenceDTO[]>([]);
  const [demandesEnCours, setDemandesEnCours] = useState<DemandeReconnaissanceDTO[]>([]);
  const [toutesMesDemandes, setToutesMesDemandes] = useState<DemandeReconnaissanceDTO[]>([]); // Inclut REJETEE

  // Fonction pour ouvrir le modal de reconnaissance avec validation
  const ouvrirModalReconnaissance = (competence: Competence) => {
    if (!competence.competenceReferenceId) {
      toast.erreur('Cette compétence n\'est pas liée à une compétence de référence. Veuillez l\'éditer pour sélectionner une compétence du référentiel.');
      return;
    }
    setCompetenceSelectionnee(competence);
    setModalReconnaissanceOuvert(true);
  };

  useEffect(() => {
    chargerExpertise();
    chargerBadgesEtDemandes();
  }, []);
  
  // Charger la localisation initiale
  useEffect(() => {
    if (expertise.localisationComplete) {
      setLocalisationInput(expertise.localisationComplete);
    }
  }, [expertise.localisationComplete]);

  const chargerExpertise = async () => {
    try {
      setLoading(true);
      const data = await expertiseService.getMonExpertise();
      setExpertise(data);
      // Charger aussi les compétences
      await chargerCompetences();
    } catch (error) {
      console.error('Erreur lors du chargement de l\'expertise:', error);
      toast.erreur('Erreur lors du chargement de l\'expertise');
    } finally {
      setLoading(false);
    }
  };

  const chargerCompetences = async () => {
    try {
      const data = await expertiseService.getCompetences();
      setCompetences(data);
    } catch (error) {
      console.error('Erreur lors du chargement des compétences:', error);
    }
  };

  // Fonction de validation pour vérifier si l'expertise peut être publiée
  const peutPublier = (): { valide: boolean; raisons: string[] } => {
    const raisons: string[] = [];
    
    // Vérifier les champs obligatoires
    if (!expertise.titre || expertise.titre.trim() === '') {
      raisons.push('Le titre professionnel est obligatoire');
    }
    
    if (!expertise.description || expertise.description.trim() === '') {
      raisons.push('La description est obligatoire');
    }
    
    if (!expertise.villeId) {
      raisons.push('La localisation est obligatoire');
    }
    
    // Vérifier qu'au moins une compétence est ajoutée
    if (competences.length === 0) {
      raisons.push('Au moins une compétence doit être ajoutée');
    }
    
    return {
      valide: raisons.length === 0,
      raisons
    };
  };

  const handleChange = (field: keyof Expertise, value: any) => {
    setExpertise(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await expertiseService.saveExpertise(expertise);
      toast.succes('Expertise sauvegardée avec succès !');
      if (onSave) onSave();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.erreur('Erreur lors de la sauvegarde de l\'expertise');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (newPublishState: boolean) => {
    // Si on essaie de publier, vérifier la validation
    if (newPublishState) {
      const validation = peutPublier();
      if (!validation.valide) {
        toast.avertissement(`Impossible de publier. Complétez : ${validation.raisons.join(', ')}`);
        return;
      }
    }

    try {
      setPublishing(true);

      // Mettre à jour l'état local
      const updatedExpertise = { ...expertise, publiee: newPublishState };

      // Sauvegarder directement avec le nouvel état
      const saved = await expertiseService.saveExpertise(updatedExpertise);
      setExpertise(saved);

      // Message de confirmation
      if (newPublishState) {
        toast.succes('Expertise publiée ! Visible sur la page d\'accueil.');
      } else {
        toast.info('Expertise dépubliée. Non visible publiquement.');
      }

      if (onSave) onSave();
    } catch (error) {
      console.error('Erreur lors de la publication/dépublication:', error);
      toast.erreur('Erreur lors de la mise à jour du statut de publication');
      // Revenir à l'état précédent en cas d'erreur
      setExpertise({ ...expertise, publiee: !newPublishState });
    } finally {
      setPublishing(false);
    }
  };

  // Gestion des compétences
  const handleAddCompetence = () => {
    // Limiter à 6 compétences maximum
    if (competences.length >= 6) {
      toast.avertissement('Vous ne pouvez pas ajouter plus de 6 compétences');
      return;
    }
    
    setEditingCompetence({
      nom: '',
      description: '',
      niveauMaitrise: 3,
      anneesExperience: 0,
      thm: undefined,
      nombreProjets: 0,
      certifications: '',
      estFavorite: false,
    });
    setIsValidSelection(false);
    setCompetenceReferenceId(null);
    setSelectedCertifications([]);
    setCertificationInput('');
    setShowCompetenceForm(true);
  };

  // Rechercher dans le référentiel de compétences
  const rechercherCompetences = async (terme: string) => {
    if (!terme || terme.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setLoadingSuggestions(true);
      const response = await fetch(`/api/competences-reference/recherche?terme=${encodeURIComponent(terme)}`);
      const data = await response.json();
      
      // Filtrer les compétences déjà ajoutées par l'utilisateur
      const competencesExistantes = competences
        .filter(c => !editingCompetence?.id || c.id !== editingCompetence.id) // Exclure la compétence en cours d'édition
        .map(c => c.nom.toLowerCase());
      
      const suggestionsFiltrees = data.filter((suggestion: any) => 
        !competencesExistantes.includes(suggestion.libelle.toLowerCase())
      );
      
      setSuggestions(suggestionsFiltrees.slice(0, 10)); // Limiter à 10 suggestions
      setShowSuggestions(true);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Charger les compétences populaires
  const rechercherCompetencesPopulaires = async () => {
    try {
      setLoadingSuggestions(true);
      const response = await fetch('/api/competences-reference/populaires?limit=10');
      const data = await response.json();
      
      // Filtrer les compétences déjà ajoutées par l'utilisateur
      const competencesExistantes = competences
        .filter(c => !editingCompetence?.id || c.id !== editingCompetence.id) // Exclure la compétence en cours d'édition
        .map(c => c.nom.toLowerCase());
      
      const suggestionsFiltrees = data.filter((suggestion: any) => 
        !competencesExistantes.includes(suggestion.libelle.toLowerCase())
      );
      
      setSuggestions(suggestionsFiltrees);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Erreur lors du chargement des compétences populaires:', error);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Sélectionner une compétence du référentiel
  const selectionnerCompetenceReference = (competenceRef: any) => {
    if (editingCompetence) {
      setEditingCompetence({
        ...editingCompetence,
        nom: competenceRef.libelle,
        description: competenceRef.description || '',
      });
      // Stocker l'ID de la compétence de référence pour incrémenter la popularité plus tard
      setCompetenceReferenceId(competenceRef.id);
      setIsValidSelection(true); // Marquer comme sélection valide
    }
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleEditCompetence = (competence: Competence) => {
    setEditingCompetence(competence);
    setIsValidSelection(true); // Une compétence existante est toujours valide
    setCompetenceReferenceId(competence.competenceReferenceId || null);
    // Initialiser les certifications sélectionnées
    if (competence.certifications) {
      const certs = competence.certifications.split(',').map(c => c.trim()).filter(c => c);
      setSelectedCertifications(certs);
    } else {
      setSelectedCertifications([]);
    }
    setCertificationInput('');
    setShowCompetenceForm(true);
  };

  const handleSaveCompetence = async () => {
    if (!editingCompetence || !editingCompetence.nom.trim()) {
      toast.erreur('Veuillez sélectionner une compétence du référentiel');
      return;
    }

    // Vérifier qu'une compétence valide a été sélectionnée depuis l'autocomplete
    if (!isValidSelection && !editingCompetence.id) {
      toast.erreur('Vous devez sélectionner une compétence depuis la liste proposée');
      return;
    }

    try {
      if (editingCompetence.id) {
        // Mise à jour
        // Récupérer l'ancienne compétence pour comparer les IDs de référence et certifications
        const oldCompetence = competences.find(c => c.id === editingCompetence.id);
        const oldReferenceId = oldCompetence?.competenceReferenceId;
        const newReferenceId = competenceReferenceId;
        
        // Comparer les certifications (anciennes vs nouvelles)
        const oldCertifications = oldCompetence?.certifications 
          ? oldCompetence.certifications.split(',').map(c => c.trim()).filter(c => c)
          : [];
        const newCertifications = selectedCertifications;
        
        // Mettre à jour avec le nouvel ID de référence
        const competenceToUpdate = {
          ...editingCompetence,
          competenceReferenceId: newReferenceId || editingCompetence.competenceReferenceId
        };
        
        const updated = await expertiseService.updateCompetence(editingCompetence.id, competenceToUpdate);
        setCompetences(prev => prev.map(c => c.id === updated.id ? updated : c));
        toast.succes('Compétence mise à jour !');
        
        // Gérer la popularité si la compétence de référence a changé
        if (newReferenceId && oldReferenceId !== newReferenceId) {
          try {
            // Décrémenter l'ancienne compétence de référence
            if (oldReferenceId) {
              await fetch(`/api/competences-reference/${oldReferenceId}/retirer`, {
                method: 'POST'
              });
            }
            // Incrémenter la nouvelle compétence de référence
            await fetch(`/api/competences-reference/${newReferenceId}/utiliser`, {
              method: 'POST'
            });
          } catch (error) {
            console.error('Erreur lors de la mise à jour de la popularité:', error);
          }
        }
        
        // Gérer la popularité des certifications
        try {
          // Trouver les certifications retirées
          const removedCertifications = oldCertifications.filter(c => !newCertifications.includes(c));
          // Trouver les certifications ajoutées
          const addedCertifications = newCertifications.filter(c => !oldCertifications.includes(c));
          
          // Décrémenter les certifications retirées
          for (const certName of removedCertifications) {
            const response = await fetch(`/api/certifications/recherche?terme=${encodeURIComponent(certName)}`);
            const certs = await response.json();
            if (certs && certs.length > 0) {
              const cert = certs.find((c: any) => c.intitule === certName);
              if (cert) {
                await fetch(`/api/certifications/${cert.id}/retirer`, { method: 'POST' });
              }
            }
          }
          
          // Incrémenter les certifications ajoutées
          for (const certName of addedCertifications) {
            const response = await fetch(`/api/certifications/recherche?terme=${encodeURIComponent(certName)}`);
            const certs = await response.json();
            if (certs && certs.length > 0) {
              const cert = certs.find((c: any) => c.intitule === certName);
              if (cert) {
                await fetch(`/api/certifications/${cert.id}/utiliser`, { method: 'POST' });
              }
            }
          }
        } catch (error) {
          console.error('Erreur lors de la mise à jour de la popularité des certifications:', error);
        }
      } else {
        // Création
        const competenceToCreate = {
          ...editingCompetence,
          competenceReferenceId: competenceReferenceId || undefined
        };
        
        const created = await expertiseService.addCompetence(competenceToCreate);
        setCompetences(prev => [...prev, created]);
        toast.succes('Compétence ajoutée !');
        
        // Incrémenter la popularité de la compétence de référence si elle a été sélectionnée
        if (competenceReferenceId) {
          try {
            await fetch(`/api/competences-reference/${competenceReferenceId}/utiliser`, {
              method: 'POST'
            });
          } catch (error) {
            console.error('Erreur lors de l\'incrémentation de la popularité:', error);
            // Ne pas bloquer l'utilisateur si l'incrémentation échoue
          }
        }
        
        // Incrémenter la popularité des certifications ajoutées
        if (selectedCertifications.length > 0) {
          try {
            for (const certName of selectedCertifications) {
              const response = await fetch(`/api/certifications/recherche?terme=${encodeURIComponent(certName)}`);
              const certs = await response.json();
              if (certs && certs.length > 0) {
                const cert = certs.find((c: any) => c.intitule === certName);
                if (cert) {
                  await fetch(`/api/certifications/${cert.id}/utiliser`, { method: 'POST' });
                }
              }
            }
          } catch (error) {
            console.error('Erreur lors de l\'incrémentation de la popularité des certifications:', error);
          }
        }
      }
      setShowCompetenceForm(false);
      setEditingCompetence(null);
      setCompetenceReferenceId(null);
      setIsValidSelection(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la compétence:', error);
      toast.erreur('Erreur lors de la sauvegarde de la compétence');
    }
  };

  const handleDeleteCompetence = (id: number, nom: string) => {
    setCompetenceToDelete({ id, nom });
    setShowDeleteModal(true);
  };

  const confirmDeleteCompetence = async () => {
    if (!competenceToDelete) return;

    try {
      // Récupérer la compétence avant de la supprimer pour décrémenter la popularité
      const competence = competences.find(c => c.id === competenceToDelete.id);
      
      await expertiseService.deleteCompetence(competenceToDelete.id);
      setCompetences(prev => prev.filter(c => c.id !== competenceToDelete.id));
      toast.succes('Compétence supprimée !');
      
      // Décrémenter la popularité de la compétence de référence
      if (competence?.competenceReferenceId) {
        try {
          await fetch(`/api/competences-reference/${competence.competenceReferenceId}/retirer`, {
            method: 'POST'
          });
        } catch (error) {
          console.error('Erreur lors de la décrémentation de la popularité de la compétence:', error);
        }
      }
      
      // Décrémenter la popularité des certifications
      if (competence?.certifications) {
        const certifications = competence.certifications.split(',').map(c => c.trim()).filter(c => c);
        try {
          for (const certName of certifications) {
            const response = await fetch(`/api/certifications/recherche?terme=${encodeURIComponent(certName)}`);
            const certs = await response.json();
            if (certs && certs.length > 0) {
              const cert = certs.find((c: any) => c.intitule === certName);
              if (cert) {
                await fetch(`/api/certifications/${cert.id}/retirer`, { method: 'POST' });
              }
            }
          }
        } catch (error) {
          console.error('Erreur lors de la décrémentation de la popularité des certifications:', error);
        }
      }
      
      setShowDeleteModal(false);
      setCompetenceToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.erreur('Erreur lors de la suppression de la compétence');
      setShowDeleteModal(false);
      setCompetenceToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCompetenceToDelete(null);
  };

  const handleToggleFavorite = async (competence: Competence) => {
    try {
      const updated = await expertiseService.updateCompetence(competence.id!, {
        ...competence,
        estFavorite: !competence.estFavorite,
      });
      setCompetences(prev => prev.map(c => c.id === updated.id ? updated : c));
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const chargerBadgesEtDemandes = async () => {
    try {
      // Charger les badges certifiés
      const badges = await reconnaissanceService.getMesBadges(true);
      setBadgesCertifies(badges);

      // Charger toutes les demandes
      const demandes = await reconnaissanceService.getMesDemandes();
      // Stocker TOUTES les demandes (y compris REJETEE) pour pouvoir vérifier l'historique
      setToutesMesDemandes(demandes);

      // Filtrer les demandes "en cours" (tous les statuts sauf APPROUVEE, REJETEE, ANNULEE)
      const enCours = demandes.filter(d =>
        d.statut === StatutDemande.EN_ATTENTE ||
        d.statut === StatutDemande.ASSIGNEE_RH ||
        d.statut === StatutDemande.EN_COURS_EVALUATION ||
        d.statut === StatutDemande.EN_ATTENTE_VALIDATION ||
        d.statut === StatutDemande.EN_COURS_TRAITEMENT ||
        d.statut === StatutDemande.COMPLEMENT_REQUIS
      );
      setDemandesEnCours(enCours);
    } catch (err) {
      console.error('Erreur chargement badges/demandes:', err);
    }
  };

  const getBadgeActuel = (competenceNom: string): BadgeCompetenceDTO | undefined => {
    return badgesCertifies.find(b =>
      b.competenceNom.toLowerCase() === competenceNom.toLowerCase() && b.estValide
    );
  };

  const aDemandeEnCours = (competenceNom: string) => {
    return demandesEnCours.some(d =>
      d.competenceNom.toLowerCase() === competenceNom.toLowerCase() &&
      d.statut !== StatutDemande.REJETEE && d.statut !== StatutDemande.APPROUVEE
    );
  };

  const aDerniereDemandeRejetee = (competenceNom: string) => {
    // Trouver toutes les demandes pour cette compétence (y compris REJETEE)
    const demandesPourCompetence = toutesMesDemandes.filter(d =>
      d.competenceNom.toLowerCase() === competenceNom.toLowerCase()
    );

    if (demandesPourCompetence.length === 0) return false;

    // Trier par date de dernière modification (la plus récente d'abord)
    const derniereDemande = demandesPourCompetence.sort((a, b) =>
      new Date(b.dateDerniereModification || b.dateCreation).getTime() -
      new Date(a.dateDerniereModification || a.dateCreation).getTime()
    )[0];

    return derniereDemande.statut === StatutDemande.REJETEE;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Statut de publication - compact */}
      {expertise.publiee && (
        <div className="alert alert-info alert-sm py-2">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">Votre expertise est publiée et visible sur la page d'accueil</span>
        </div>
      )}

      {/* Formulaire - Layout compact en 2 colonnes */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Éditer votre expertise</h2>
            {/* Toggle disponibilité intégré dans le header */}
            <label className="flex items-center gap-2 cursor-pointer">
              <span className={`text-xs font-medium ${expertise.disponible ? 'text-success' : 'text-base-content/50'}`}>
                {expertise.disponible ? 'Disponible' : 'Indisponible'}
              </span>
              <input
                type="checkbox"
                className="toggle toggle-success toggle-sm"
                checked={expertise.disponible || false}
                onChange={(e) => handleChange('disponible', e.target.checked)}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Colonne gauche: Titre + Localisation */}
            <div className="space-y-3">
              {/* Titre professionnel */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-sm font-medium">Titre professionnel *</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Développeur Full Stack Senior"
                  className="input input-bordered input-sm w-full"
                  value={expertise.titre || ''}
                  onChange={(e) => handleChange('titre', e.target.value)}
                />
              </div>

              {/* Localisation avec autocomplétion */}
              <div className="form-control relative">
                <label className="label py-1">
                  <span className="label-text text-sm font-medium">Localisation *</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Abidjan, Côte d'Ivoire"
                  className="input input-bordered input-sm w-full"
                  value={localisationInput}
                  onChange={async (e) => {
                    const value = e.target.value;
                    setLocalisationInput(value);

                    if (value.length >= 2) {
                      setLoadingLocalisationSuggestions(true);
                      try {
                        const response = await fetch(`/api/localisations/recherche?terme=${encodeURIComponent(value)}`);
                        const data = await response.json();
                        setLocalisationSuggestions(data);
                        setShowLocalisationSuggestions(true);
                      } catch (error) {
                        console.error('Erreur lors de la recherche de localisations:', error);
                      } finally {
                        setLoadingLocalisationSuggestions(false);
                      }
                    } else {
                      setShowLocalisationSuggestions(false);
                    }
                  }}
                  onFocus={() => {
                    if (localisationInput.length >= 2 && localisationSuggestions.length > 0) {
                      setShowLocalisationSuggestions(true);
                    }
                  }}
                />

                {/* Suggestions de localisation */}
                {showLocalisationSuggestions && localisationSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-48 overflow-y-auto top-full">
                    {localisationSuggestions.map((loc) => (
                      <button
                        key={loc.villeId}
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-base-200 transition-colors border-b border-base-200 last:border-b-0 text-sm"
                        onClick={() => {
                          setLocalisationInput(loc.nomComplet);
                          handleChange('villeId', loc.villeId);
                          handleChange('localisationComplete', loc.nomComplet);
                          setShowLocalisationSuggestions(false);
                        }}
                      >
                        <div className="font-medium">{loc.nomComplet}</div>
                      </button>
                    ))}
                  </div>
                )}

                {loadingLocalisationSuggestions && (
                  <div className="absolute right-3 top-9">
                    <span className="loading loading-spinner loading-xs"></span>
                  </div>
                )}
              </div>
            </div>

            {/* Colonne droite: Description */}
            <div className="form-control h-full">
              <label className="label py-1">
                <span className="label-text text-sm font-medium">Description *</span>
                <span className="label-text-alt text-xs text-base-content/50">{(expertise.description || '').length}/500</span>
              </label>
              <textarea
                className="textarea textarea-bordered text-sm flex-1 min-h-[100px] md:h-full resize-none"
                placeholder="Décrivez votre expertise, vos domaines de compétence, ce qui vous distingue..."
                value={expertise.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                maxLength={500}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section Compétences - compact */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold">Mes Compétences</h2>
              <span className="badge badge-ghost badge-sm">{competences.length}/6</span>
            </div>
            <button
              className={`btn btn-xs gap-1 ${competences.length >= 6 ? 'btn-disabled' : 'btn-primary'}`}
              onClick={handleAddCompetence}
              disabled={competences.length >= 6}
            >
              <Plus className="w-3 h-3" />
              Ajouter
            </button>
          </div>

          {/* Liste des compétences - compact */}
          {competences.length === 0 ? (
            <div className="text-center py-6 text-base-content/50 text-sm">
              <p>Aucune compétence. Cliquez sur "Ajouter" pour commencer.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {competences.map((competence) => (
                <div
                  key={competence.id}
                  className="bg-base-200/50 border border-base-300 rounded-lg p-3 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3
                          className="font-semibold text-sm truncate cursor-pointer hover:text-primary transition-colors"
                          onClick={() => {
                            setCompetencePourDetails(competence);
                            setModalDetailsOuvert(true);
                          }}
                          title="Cliquez pour voir les détails"
                        >
                          {competence.nom}
                        </h3>
                        {competence.estFavorite && (
                          <Star className="w-3 h-3 fill-warning text-warning flex-shrink-0" />
                        )}
                      </div>
                      {competence.description && (
                        <p className="text-xs text-base-content/60 mt-0.5 line-clamp-1">
                          {competence.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {competence.niveauMaitrise && (
                          <div className="rating rating-xs">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <input
                                key={level}
                                type="radio"
                                className="mask mask-star-2 bg-warning"
                                checked={level === competence.niveauMaitrise}
                                readOnly
                              />
                            ))}
                          </div>
                        )}
                        {competence.anneesExperience !== undefined && competence.anneesExperience > 0 && (
                          <span className="badge badge-ghost badge-xs">
                            {competence.anneesExperience}an{competence.anneesExperience > 1 ? 's' : ''}
                          </span>
                        )}
                        {competence.thm && (
                          <span className="badge badge-primary badge-xs badge-outline">
                            {(competence.thm / 1000).toFixed(0)}k/h
                          </span>
                        )}
                          {competence.nombreProjets !== undefined && competence.nombreProjets > 0 && (
                            <span className="badge badge-ghost badge-xs">
                              {competence.nombreProjets}proj
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Actions compactes */}
                      <div className="flex flex-col items-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-0.5">
                          <button
                            className="btn btn-ghost btn-xs btn-circle"
                            onClick={() => handleToggleFavorite(competence)}
                            title={competence.estFavorite ? "Retirer des favoris" : "Favoris"}
                          >
                            <Star className={`w-3 h-3 ${competence.estFavorite ? 'fill-warning text-warning' : ''}`} />
                          </button>
                          <button
                            className="btn btn-ghost btn-xs btn-circle"
                            onClick={() => handleEditCompetence(competence)}
                            title="Modifier"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            className="btn btn-ghost btn-xs btn-circle text-error"
                            onClick={() => handleDeleteCompetence(competence.id!, competence.nom)}
                            title="Supprimer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        {/* Badge/Statut certification */}
                        {(() => {
                          const badge = getBadgeActuel(competence.nom);
                          const demandeEnCours = aDemandeEnCours(competence.nom);
                          const demandeRejetee = aDerniereDemandeRejetee(competence.nom);

                          if (demandeEnCours) {
                            return (
                              <span className="badge badge-warning badge-xs gap-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                En cours
                              </span>
                            );
                          }

                          if (badge) {
                            const badgeColors: Record<string, string> = {
                              'BRONZE': 'badge-warning',
                              'ARGENT': 'badge-info',
                              'OR': 'badge-accent',
                              'PLATINE': 'badge-secondary'
                            };
                            return (
                              <span className={`badge ${badgeColors[badge.niveauCertification] || 'badge-success'} badge-xs gap-0.5`}>
                                <CheckCircle className="w-2.5 h-2.5" />
                                {badge.niveauCertification}
                              </span>
                            );
                          }

                          // Demande rejetée - permettre de resoumettre
                          if (demandeRejetee) {
                            return (
                              <div className="flex flex-col items-end gap-0.5">
                                <span className="badge badge-error badge-xs gap-0.5 opacity-70">
                                  Rejetée
                                </span>
                                <button
                                  className="btn btn-outline btn-primary btn-xs h-5 min-h-0 gap-0.5 text-[10px]"
                                  onClick={() => ouvrirModalReconnaissance(competence)}
                                  title="Soumettre une nouvelle demande"
                                >
                                  <Award className="w-2.5 h-2.5" />
                                  Resoumettre
                                </button>
                              </div>
                            );
                          }

                          // Pas de demande - permettre de certifier
                          if (!demandeEnCours && !badge) {
                            return (
                              <button
                                className="btn btn-primary btn-xs h-5 min-h-0 gap-0.5 text-[10px]"
                                onClick={() => ouvrirModalReconnaissance(competence)}
                              >
                                <Award className="w-2.5 h-2.5" />
                                Certifier
                              </button>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          )}

          {/* Modal de confirmation de suppression */}
          {showDeleteModal && competenceToDelete && (
            <div className="modal modal-open">
              <div className="modal-box relative">
                {/* Icône d'avertissement */}
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-error/10 p-3">
                    <Trash2 className="w-12 h-12 text-error" />
                  </div>
                </div>
                
                {/* Titre */}
                <h3 className="font-bold text-xl text-center mb-2">
                  Confirmer la suppression
                </h3>
                
                {/* Message */}
                <div className="text-center mb-6">
                  <p className="text-base-content/70 mb-2">
                    Êtes-vous sûr de vouloir supprimer la compétence :
                  </p>
                  <p className="font-semibold text-lg text-primary">
                    {competenceToDelete.nom}
                  </p>
                  <p className="text-sm text-error mt-2">
                    Cette action est irréversible.
                  </p>
                </div>

                {/* Boutons d'action */}
                <div className="modal-action justify-center gap-3">
                  <button
                    className="btn btn-ghost"
                    onClick={cancelDelete}
                  >
                    Annuler
                  </button>
                  <button
                    className="btn btn-error gap-2"
                    onClick={confirmDeleteCompetence}
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                </div>
              </div>
              {/* Backdrop cliquable */}
              <div className="modal-backdrop" onClick={cancelDelete}></div>
            </div>
          )}

          {/* Formulaire d'ajout/édition de compétence */}
          {showCompetenceForm && editingCompetence && (
            <div className="modal modal-open">
              <div className="modal-box max-w-md p-4">
                <h3 className="font-bold text-base mb-3">
                  {editingCompetence.id ? 'Modifier la compétence' : 'Ajouter une compétence'}
                </h3>

                <div className="space-y-3">
                  {/* Compétence avec autocomplete */}
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-sm font-medium">Compétence *</span>
                      {isValidSelection && (
                        <span className="label-text-alt text-success flex items-center gap-1 text-xs">
                          <CheckCircle className="w-3 h-3" />
                          Validée
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Recherchez une compétence..."
                        className={`input input-bordered input-sm w-full ${isValidSelection ? 'input-success' : ''}`}
                        value={editingCompetence.nom}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEditingCompetence({ ...editingCompetence, nom: value });
                          rechercherCompetences(value);
                          // Si l'utilisateur modifie manuellement, réinitialiser la validation
                          setIsValidSelection(false);
                          setCompetenceReferenceId(null);
                          if (value === '') {
                            setEditingCompetence({ ...editingCompetence, nom: '', description: '' });
                          }
                        }}
                        onFocus={() => {
                          // Toujours afficher les suggestions au focus
                          if (editingCompetence.nom.length >= 2) {
                            rechercherCompetences(editingCompetence.nom);
                          } else {
                            // Charger les compétences populaires si le champ est vide
                            rechercherCompetencesPopulaires();
                          }
                        }}
                        onBlur={() => {
                          // Délai pour permettre le clic sur une suggestion
                          setTimeout(() => setShowSuggestions(false), 200);
                        }}
                      />
                      
                      {/* Dropdown des suggestions */}
                      {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {loadingSuggestions ? (
                            <div className="p-4 text-center">
                              <span className="loading loading-spinner loading-sm"></span>
                            </div>
                          ) : (
                            suggestions.map((suggestion) => (
                              <div
                                key={suggestion.id}
                                className="p-3 hover:bg-base-200 cursor-pointer border-b border-base-300 last:border-b-0"
                                onClick={() => selectionnerCompetenceReference(suggestion)}
                              >
                                <div className="font-medium text-sm">{suggestion.libelle}</div>
                                {suggestion.description && (
                                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                                    {suggestion.description}
                                  </div>
                                )}
                                <div className="flex gap-2 mt-1">
                                  {suggestion.domaine && (
                                    <span className="badge badge-primary badge-xs">{suggestion.domaine}</span>
                                  )}
                                  {suggestion.typeCompetence && (
                                    <span className="badge badge-secondary badge-xs">{suggestion.typeCompetence}</span>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                      
                      {/* Message si aucune suggestion */}
                      {showSuggestions && !loadingSuggestions && suggestions.length === 0 && editingCompetence.nom.length >= 2 && (
                        <div className="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg p-3">
                          <p className="text-sm text-gray-500">
                            Aucune compétence disponible. Les compétences déjà ajoutées ne sont pas affichées.
                          </p>
                        </div>
                      )}
                      
                      {/* Message si aucune suggestion au focus initial */}
                      {showSuggestions && !loadingSuggestions && suggestions.length === 0 && editingCompetence.nom.length < 2 && (
                        <div className="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg p-3">
                          <p className="text-sm text-gray-500">
                            Toutes les compétences populaires ont déjà été ajoutées. Tapez pour rechercher d'autres compétences.
                          </p>
                        </div>
                      )}
                    </div>
                    <label className="label">
                      <span className="label-text-alt text-gray-500">
                        {isValidSelection 
                          ? 'Compétence validée depuis le référentiel' 
                          : 'Vous devez sélectionner une compétence depuis la liste proposée'}
                      </span>
                    </label>
                  </div>

                  {/* Description */}
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-sm font-medium">Description</span>
                      {isValidSelection && (
                        <span className="label-text-alt text-info text-xs">Depuis référentiel</span>
                      )}
                    </label>
                    <textarea
                      className="textarea textarea-bordered textarea-sm h-16 text-sm disabled:bg-base-200 disabled:text-base-content/70"
                      placeholder="Décrivez votre expérience..."
                      value={editingCompetence.description || ''}
                      onChange={(e) => setEditingCompetence({ ...editingCompetence, description: e.target.value })}
                      disabled={isValidSelection}
                    />
                  </div>

                  {/* Niveau de maîtrise - compact */}
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-sm font-medium">Niveau de maîtrise</span>
                      <span className="label-text-alt text-xs text-base-content/60">
                        {editingCompetence.niveauMaitrise === 1 && 'Débutant'}
                        {editingCompetence.niveauMaitrise === 2 && 'Junior'}
                        {editingCompetence.niveauMaitrise === 3 && 'Intermédiaire'}
                        {editingCompetence.niveauMaitrise === 4 && 'Senior'}
                        {editingCompetence.niveauMaitrise === 5 && 'Expert'}
                      </span>
                    </label>
                    <div className="rating rating-sm">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <input
                          key={level}
                          type="radio"
                          name="rating"
                          className="mask mask-star-2 bg-warning"
                          checked={level === editingCompetence.niveauMaitrise}
                          onChange={() => setEditingCompetence({ ...editingCompetence, niveauMaitrise: level })}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Années d'expérience et Nombre de projets sur la même ligne */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-control">
                      <label className="label py-1">
                        <span className="label-text text-sm font-medium">Années d'exp.</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="input input-bordered input-sm w-full"
                        value={editingCompetence.anneesExperience || 0}
                        onChange={(e) => setEditingCompetence({ ...editingCompetence, anneesExperience: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="form-control">
                      <label className="label py-1">
                        <span className="label-text text-sm font-medium">Nbre projets</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="input input-bordered input-sm w-full"
                        value={editingCompetence.nombreProjets || 0}
                        onChange={(e) => setEditingCompetence({ ...editingCompetence, nombreProjets: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  {/* THM (Taux Horaire Moyen) */}
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-sm font-medium">Taux Horaire Moyen (FCFA/h)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Ex: 15000"
                      className="input input-bordered input-sm w-full"
                      value={editingCompetence.thm || ''}
                      onChange={(e) => setEditingCompetence({ ...editingCompetence, thm: parseInt(e.target.value) || undefined })}
                    />
                  </div>

                  {/* Certifications avec autocomplete */}
                  <div className="form-control relative">
                    <label className="label py-1">
                      <span className="label-text text-sm font-medium">Certifications</span>
                    </label>

                    {/* Tags des certifications sélectionnées */}
                    {selectedCertifications.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1.5">
                        {selectedCertifications.map((cert, index) => (
                          <div key={index} className="badge badge-primary badge-sm gap-1">
                            <span className="truncate max-w-[120px]">{cert}</span>
                            <button
                              type="button"
                              className="hover:text-error"
                              onClick={() => {
                                const newCerts = selectedCertifications.filter((_, i) => i !== index);
                                setSelectedCertifications(newCerts);
                                setEditingCompetence({
                                  ...editingCompetence,
                                  certifications: newCerts.join(', ')
                                });
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Champ de saisie avec autocomplete */}
                    <input
                      type="text"
                      className="input input-bordered input-sm w-full"
                      placeholder="Rechercher une certification..."
                      value={certificationInput}
                      onChange={async (e) => {
                        const value = e.target.value;
                        setCertificationInput(value);
                        
                        if (value.length >= 2) {
                          try {
                            setLoadingCertificationSuggestions(true);
                            const response = await fetch(`/api/certifications/recherche?terme=${encodeURIComponent(value)}`);
                            const data = await response.json();
                            setCertificationSuggestions(Array.isArray(data) ? data : []);
                            setShowCertificationSuggestions(true);
                          } catch (error) {
                            console.error('Erreur lors de la recherche de certifications:', error);
                            setCertificationSuggestions([]);
                          } finally {
                            setLoadingCertificationSuggestions(false);
                          }
                        } else {
                          setShowCertificationSuggestions(false);
                          setCertificationSuggestions([]);
                        }
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && certificationInput.trim()) {
                          e.preventDefault();
                          const newCerts = [...selectedCertifications, certificationInput.trim()];
                          setSelectedCertifications(newCerts);
                          setEditingCompetence({ 
                            ...editingCompetence, 
                            certifications: newCerts.join(', ') 
                          });
                          setCertificationInput('');
                          setShowCertificationSuggestions(false);
                        }
                      }}
                      onFocus={async () => {
                        if (certificationInput.length < 2) {
                          try {
                            setLoadingCertificationSuggestions(true);
                            const response = await fetch('/api/certifications/populaires?limit=10');
                            const data = await response.json();
                            setCertificationSuggestions(Array.isArray(data) ? data : []);
                            setShowCertificationSuggestions(true);
                          } catch (error) {
                            console.error('Erreur:', error);
                          } finally {
                            setLoadingCertificationSuggestions(false);
                          }
                        }
                      }}
                    />
                    
                    {/* Liste des suggestions */}
                    {showCertificationSuggestions && (
                      <div className="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-60 overflow-y-auto top-full">
                        {loadingCertificationSuggestions ? (
                          <div className="p-4 text-center">
                            <span className="loading loading-spinner loading-sm"></span>
                          </div>
                        ) : certificationSuggestions.length > 0 ? (
                          certificationSuggestions.map((cert: any) => (
                            <button
                              key={cert.id}
                              type="button"
                              className="w-full text-left px-4 py-2 hover:bg-base-200 transition-colors"
                              onClick={() => {
                                if (!selectedCertifications.includes(cert.intitule)) {
                                  const newCerts = [...selectedCertifications, cert.intitule];
                                  setSelectedCertifications(newCerts);
                                  setEditingCompetence({ 
                                    ...editingCompetence, 
                                    certifications: newCerts.join(', ') 
                                  });
                                }
                                setCertificationInput('');
                                setShowCertificationSuggestions(false);
                              }}
                            >
                              <div className="font-semibold">{cert.intitule}</div>
                              {cert.organismeDelivrant && (
                                <div className="text-xs text-gray-500">{cert.organismeDelivrant}</div>
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            Aucune certification trouvée. Appuyez sur Entrée pour ajouter "{certificationInput}"
                          </div>
                        )}
                      </div>
                    )}
                    
                  </div>

                  {/* Favorite - compact */}
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-2 py-1">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-warning checkbox-sm"
                        checked={editingCompetence.estFavorite || false}
                        onChange={(e) => setEditingCompetence({ ...editingCompetence, estFavorite: e.target.checked })}
                      />
                      <span className="label-text text-sm">Compétence favorite</span>
                    </label>
                  </div>
                </div>

                {/* Footer compact */}
                <div className="modal-action mt-4 pt-3 border-t border-base-200">
                  {!isValidSelection && (
                    <div className="flex-1 text-xs text-warning flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Sélectionnez une compétence du référentiel
                    </div>
                  )}
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setShowCompetenceForm(false);
                      setEditingCompetence(null);
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    className={`btn btn-primary btn-sm ${!isValidSelection ? 'btn-disabled' : ''}`}
                    onClick={handleSaveCompetence}
                    disabled={!isValidSelection}
                  >
                    {editingCompetence.id ? 'Modifier' : 'Ajouter'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions globaux - compact */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-4">
          {/* Message d'aide si la validation échoue - compact */}
          {!peutPublier().valide && !expertise.publiee && (
            <div className="alert alert-warning alert-sm py-2 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-xs">
                <span className="font-medium">Pour publier : </span>
                {peutPublier().raisons.join(' • ')}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            {/* Toggle de publication - compact */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="toggle toggle-success toggle-sm"
                checked={expertise.publiee || false}
                onChange={(e) => handleTogglePublish(e.target.checked)}
                disabled={publishing || saving}
              />
              <div>
                <span className={`text-sm font-medium ${expertise.publiee ? 'text-success' : 'text-base-content/70'}`}>
                  {expertise.publiee ? 'Publiée' : 'Non publiée'}
                </span>
                <span className="text-xs text-base-content/50 ml-2">
                  {expertise.publiee ? '(visible publiquement)' : '(brouillon)'}
                </span>
              </div>
            </label>

            {/* Bouton Enregistrer - compact */}
            <button
              className="btn btn-primary btn-sm gap-1.5"
              onClick={handleSave}
              disabled={saving || publishing}
            >
              {saving ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de demande de reconnaissance */}
      {competenceSelectionnee && competenceSelectionnee.competenceReferenceId && (
        <ModalDemandeReconnaissance
          isOpen={modalReconnaissanceOuvert}
          onClose={() => {
            setModalReconnaissanceOuvert(false);
            setCompetenceSelectionnee(null);
          }}
          competenceId={competenceSelectionnee.id!}
          competenceNom={competenceSelectionnee.nom}
          onSuccess={() => {
            // Recharger l'expertise et les demandes après succès
            chargerExpertise();
            chargerBadgesEtDemandes();
            // Notifier le parent pour rafraîchir les onglets
            if (onDemandeSubmitted) {
              onDemandeSubmitted();
            }
          }}
        />
      )}

      {/* Modal de détails de compétence */}
      <ModalDetailsCompetence
        isOpen={modalDetailsOuvert}
        onClose={() => {
          setModalDetailsOuvert(false);
          setCompetencePourDetails(null);
        }}
        competence={competencePourDetails}
        badge={competencePourDetails ? getBadgeActuel(competencePourDetails.nom) : null}
        montrerBoutonCertification={
          competencePourDetails !== null &&
          competencePourDetails.competenceReferenceId !== undefined &&
          !getBadgeActuel(competencePourDetails.nom) &&
          !aDemandeEnCours(competencePourDetails.nom)
        }
        onDemanderCertification={() => {
          if (competencePourDetails) {
            ouvrirModalReconnaissance(competencePourDetails);
          }
        }}
      />
    </div>
  );
};

export default EditerExpertise;
