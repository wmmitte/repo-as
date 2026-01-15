package com.intermediation.expertise.service;

import com.intermediation.expertise.dto.CompetenceDTO;
import com.intermediation.expertise.dto.ExpertiseCompletDTO;
import com.intermediation.expertise.dto.ExpertiseDTO;
import com.intermediation.expertise.dto.ExpertPublicDTO;
import com.intermediation.expertise.dto.ExpertPublicDTO.CompetencePublicDTO;
import com.intermediation.expertise.model.Competence;
import com.intermediation.expertise.model.Expertise;
import com.intermediation.expertise.repository.CompetenceRepository;
import com.intermediation.expertise.repository.ExpertiseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import com.intermediation.expertise.repository.VilleRepository;
import com.intermediation.expertise.repository.PaysRepository;
import com.intermediation.expertise.model.Ville;
import com.intermediation.expertise.model.Pays;

@Service
public class ExpertiseService {

    private final CompetenceRepository competenceRepository;
    private final ExpertiseRepository expertiseRepository;
    private final VilleRepository villeRepository;
    private final PaysRepository paysRepository;

    public ExpertiseService(CompetenceRepository competenceRepository, ExpertiseRepository expertiseRepository, VilleRepository villeRepository, PaysRepository paysRepository) {
        this.competenceRepository = competenceRepository;
        this.expertiseRepository = expertiseRepository;
        this.villeRepository = villeRepository;
        this.paysRepository = paysRepository;
    }

    /**
     * Récupère l'expertise complète d'un utilisateur (profil + compétences)
     */
    @Transactional(readOnly = true)
    public ExpertiseCompletDTO getExpertiseComplete(String utilisateurId) {
        // Récupérer ou créer l'expertise
        ExpertiseDTO expertise = getOrCreateExpertise(utilisateurId);
        
        // Récupérer les compétences
        List<CompetenceDTO> competences = competenceRepository.findByUtilisateurId(utilisateurId)
                .stream()
                .map(CompetenceDTO::new)
                .collect(Collectors.toList());

        return new ExpertiseCompletDTO(expertise, competences);
    }

    /**
     * Récupère l'expertise d'un utilisateur ou en crée une vide
     */
    @Transactional
    public ExpertiseDTO getOrCreateExpertise(String utilisateurId) {
        return expertiseRepository.findByUtilisateurId(utilisateurId)
                .map(ExpertiseDTO::new)
                .orElseGet(() -> {
                    Expertise newExpertise = new Expertise(utilisateurId);
                    Expertise saved = expertiseRepository.save(newExpertise);
                    return new ExpertiseDTO(saved);
                });
    }

    /**
     * Récupère uniquement l'expertise (sans les compétences)
     */
    @Transactional(readOnly = true)
    public ExpertiseDTO getMonExpertise(String utilisateurId) {
        return expertiseRepository.findByUtilisateurId(utilisateurId)
                .map(ExpertiseDTO::new)
                .orElseGet(() -> new ExpertiseDTO(new Expertise(utilisateurId)));
    }

    /**
     * Crée ou met à jour l'expertise d'un utilisateur
     */
    @Transactional
    public ExpertiseDTO createOrUpdateExpertise(String utilisateurId, ExpertiseDTO expertiseDTO) {
        Expertise expertise = expertiseRepository.findByUtilisateurId(utilisateurId)
                .orElse(new Expertise(utilisateurId));

        // Mise à jour des champs
        expertise.setTitre(expertiseDTO.getTitre());
        expertise.setDescription(expertiseDTO.getDescription());
        expertise.setPhotoUrl(expertiseDTO.getPhotoUrl());
        
        // Gérer la localisation (ville)
        Ville ancienneVille = expertise.getVille();
        if (expertiseDTO.getVilleId() != null) {
            Ville nouvelleVille = villeRepository.findById(expertiseDTO.getVilleId())
                .orElseThrow(() -> new IllegalArgumentException("Ville non trouvée"));
            
            // Si la ville a changé, mettre à jour les indices de popularité
            if (ancienneVille == null || !ancienneVille.getId().equals(nouvelleVille.getId())) {
                // Décrémenter l'ancienne ville et son pays si elle existe
                if (ancienneVille != null) {
                    if (ancienneVille.getIndicePopularite() > 0) {
                        ancienneVille.setIndicePopularite(ancienneVille.getIndicePopularite() - 1);
                        villeRepository.save(ancienneVille);
                    }
                    Pays ancienPays = ancienneVille.getPays();
                    if (ancienPays != null && ancienPays.getIndicePopularite() > 0) {
                        ancienPays.setIndicePopularite(ancienPays.getIndicePopularite() - 1);
                        paysRepository.save(ancienPays);
                    }
                }
                
                // Incrémenter la nouvelle ville et son pays
                nouvelleVille.setIndicePopularite(nouvelleVille.getIndicePopularite() + 1);
                villeRepository.save(nouvelleVille);
                
                Pays nouveauPays = nouvelleVille.getPays();
                if (nouveauPays != null) {
                    nouveauPays.setIndicePopularite(nouveauPays.getIndicePopularite() + 1);
                    paysRepository.save(nouveauPays);
                }
            }
            
            expertise.setVille(nouvelleVille);
        } else {
            // Si on supprime la localisation, décrémenter l'ancienne ville et son pays
            if (ancienneVille != null) {
                if (ancienneVille.getIndicePopularite() > 0) {
                    ancienneVille.setIndicePopularite(ancienneVille.getIndicePopularite() - 1);
                    villeRepository.save(ancienneVille);
                }
                Pays ancienPays = ancienneVille.getPays();
                if (ancienPays != null && ancienPays.getIndicePopularite() > 0) {
                    ancienPays.setIndicePopularite(ancienPays.getIndicePopularite() - 1);
                    paysRepository.save(ancienPays);
                }
            }
            expertise.setVille(null);
        }
        
        expertise.setDisponible(expertiseDTO.getDisponible());
        
        // Validation avant de permettre la publication
        if (expertiseDTO.getPubliee() != null && expertiseDTO.getPubliee()) {
            validateExpertiseAvantPublication(expertise, utilisateurId);
        }
        
        expertise.setPubliee(expertiseDTO.getPubliee()); // Mettre à jour l'état de publication

        Expertise saved = expertiseRepository.save(expertise);
        return new ExpertiseDTO(saved);
    }

    /**
     * Valide qu'une expertise peut être publiée
     */
    private void validateExpertiseAvantPublication(Expertise expertise, String utilisateurId) {
        List<String> erreurs = new ArrayList<>();
        
        // Vérifier les champs obligatoires
        if (expertise.getTitre() == null || expertise.getTitre().trim().isEmpty()) {
            erreurs.add("Le titre professionnel est obligatoire");
        }
        
        if (expertise.getDescription() == null || expertise.getDescription().trim().isEmpty()) {
            erreurs.add("La description est obligatoire");
        }
        
        if (expertise.getVille() == null) {
            erreurs.add("La localisation est obligatoire");
        }
        
        // Vérifier qu'au moins une compétence existe
        long nombreCompetences = competenceRepository.countByUtilisateurId(utilisateurId);
        if (nombreCompetences == 0) {
            erreurs.add("Au moins une compétence doit être ajoutée");
        }
        
        if (!erreurs.isEmpty()) {
            throw new IllegalStateException(
                "Impossible de publier l'expertise. Veuillez compléter les informations suivantes : " 
                + String.join(", ", erreurs)
            );
        }
    }

    /**
     * Publie l'expertise (la rend visible sur l'accueil)
     */
    @Transactional
    public ExpertiseDTO publierExpertise(String utilisateurId) {
        Expertise expertise = expertiseRepository.findByUtilisateurId(utilisateurId)
                .orElseThrow(() -> new RuntimeException("Expertise non trouvée"));

        expertise.setPubliee(true);
        Expertise saved = expertiseRepository.save(expertise);
        return new ExpertiseDTO(saved);
    }

    /**
     * Dépublie l'expertise (la retire de l'accueil)
     */
    @Transactional
    public ExpertiseDTO depublierExpertise(String utilisateurId) {
        Expertise expertise = expertiseRepository.findByUtilisateurId(utilisateurId)
                .orElseThrow(() -> new RuntimeException("Expertise non trouvée"));

        expertise.setPubliee(false);
        Expertise saved = expertiseRepository.save(expertise);
        return new ExpertiseDTO(saved);
    }

    /**
     * Récupère toutes les expertises publiées (pour l'accueil)
     */
    @Transactional(readOnly = true)
    public List<ExpertiseDTO> getExpertisesPubliees() {
        return expertiseRepository.findByPublieeTrue()
                .stream()
                .map(ExpertiseDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Récupère toutes les compétences d'un utilisateur
     */
    @Transactional(readOnly = true)
    public List<CompetenceDTO> getCompetences(String utilisateurId) {
        return competenceRepository.findByUtilisateurId(utilisateurId)
                .stream()
                .map(CompetenceDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Récupère les compétences favorites d'un utilisateur
     */
    @Transactional(readOnly = true)
    public List<CompetenceDTO> getCompetencesFavorites(String utilisateurId) {
        return competenceRepository.findByUtilisateurIdAndEstFavorite(utilisateurId, true)
                .stream()
                .map(CompetenceDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Récupère une compétence spécifique par son ID et l'utilisateurId
     * Utilisé par les évaluateurs pour voir les détails d'une compétence
     */
    @Transactional(readOnly = true)
    public CompetenceDTO getCompetenceById(String utilisateurId, Long competenceId) {
        Competence competence = competenceRepository.findById(competenceId)
                .orElseThrow(() -> new RuntimeException("Compétence non trouvée"));
        
        // Vérifier que la compétence appartient bien à l'utilisateur
        if (!competence.getUtilisateurId().equals(utilisateurId)) {
            throw new IllegalArgumentException("Cette compétence n'appartient pas à cet utilisateur");
        }
        
        return new CompetenceDTO(competence);
    }

    /**
     * Ajoute une compétence
     */
    @Transactional
    public CompetenceDTO ajouterCompetence(String utilisateurId, CompetenceDTO competenceDTO) {
        // Vérifier le nombre de compétences (limite à 6)
        long nombreCompetences = competenceRepository.countByUtilisateurId(utilisateurId);
        if (nombreCompetences >= 6) {
            throw new IllegalArgumentException("Vous ne pouvez pas ajouter plus de 6 compétences");
        }
        
        // Vérifier si la compétence existe déjà
        if (competenceRepository.findByUtilisateurIdAndNom(utilisateurId, competenceDTO.getNom()).isPresent()) {
            throw new IllegalArgumentException("Cette compétence existe déjà");
        }

        Competence competence = new Competence(utilisateurId, competenceDTO.getNom());
        competence.setDescription(competenceDTO.getDescription());
        competence.setNiveauMaitrise(competenceDTO.getNiveauMaitrise());
        competence.setAnneesExperience(competenceDTO.getAnneesExperience());
        competence.setThm(competenceDTO.getThm());
        competence.setNombreProjets(competenceDTO.getNombreProjets());
        competence.setCertifications(competenceDTO.getCertifications());
        competence.setEstFavorite(competenceDTO.getEstFavorite() != null ? competenceDTO.getEstFavorite() : false);
        competence.setCompetenceReferenceId(competenceDTO.getCompetenceReferenceId()); // Lier à la compétence de référence

        Competence saved = competenceRepository.save(competence);
        return new CompetenceDTO(saved);
    }

    /**
     * Met à jour une compétence
     */
    @Transactional
    public CompetenceDTO updateCompetence(String utilisateurId, Long competenceId, CompetenceDTO competenceDTO) {
        Competence competence = competenceRepository.findById(competenceId)
                .orElseThrow(() -> new RuntimeException("Compétence non trouvée"));

        if (!competence.getUtilisateurId().equals(utilisateurId)) {
            throw new IllegalArgumentException("Cette compétence n'appartient pas à cet utilisateur");
        }

        competence.setNom(competenceDTO.getNom());
        competence.setDescription(competenceDTO.getDescription());
        competence.setNiveauMaitrise(competenceDTO.getNiveauMaitrise());
        competence.setAnneesExperience(competenceDTO.getAnneesExperience());
        competence.setThm(competenceDTO.getThm());
        competence.setNombreProjets(competenceDTO.getNombreProjets());
        competence.setCertifications(competenceDTO.getCertifications());
        competence.setEstFavorite(competenceDTO.getEstFavorite());
        competence.setCompetenceReferenceId(competenceDTO.getCompetenceReferenceId()); // Mettre à jour la référence

        Competence updated = competenceRepository.save(competence);
        return new CompetenceDTO(updated);
    }

    /**
     * Supprime une compétence
     */
    @Transactional
    public void supprimerCompetence(String utilisateurId, Long competenceId) {
        Competence competence = competenceRepository.findById(competenceId)
                .orElseThrow(() -> new RuntimeException("Compétence non trouvée"));

        if (!competence.getUtilisateurId().equals(utilisateurId)) {
            throw new IllegalArgumentException("Cette compétence n'appartient pas à cet utilisateur");
        }

        competenceRepository.deleteById(competenceId);
    }

    /**
     * Récupère tous les experts publiés avec leurs compétences (pour le feed d'accueil)
     */
    @Transactional(readOnly = true)
    public List<ExpertPublicDTO> getExpertsPublies() {
        List<Expertise> expertisesPubliees = expertiseRepository.findByPublieeTrue();
        
        return expertisesPubliees.stream()
                .map(expertise -> {
                    ExpertPublicDTO dto = new ExpertPublicDTO();
                    dto.setUtilisateurId(expertise.getUtilisateurId());
                    dto.setTitre(expertise.getTitre());
                    dto.setDescription(expertise.getDescription());
                    dto.setPhotoUrl(expertise.getPhotoUrl());
                    dto.setLocalisation(expertise.getLocalisation());
                    dto.setDisponible(expertise.getDisponible());
                    
                    // Récupérer les compétences de l'expert
                    List<CompetencePublicDTO> competences = competenceRepository
                            .findByUtilisateurId(expertise.getUtilisateurId())
                            .stream()
                            .map(comp -> {
                                CompetencePublicDTO compDto = new CompetencePublicDTO();
                                compDto.setNom(comp.getNom());
                                compDto.setDescription(comp.getDescription());
                                compDto.setNiveauMaitrise(comp.getNiveauMaitrise());
                                compDto.setAnneesExperience(comp.getAnneesExperience());
                                compDto.setThm(comp.getThm());
                                compDto.setNombreProjets(comp.getNombreProjets());
                                compDto.setCertifications(comp.getCertifications());
                                compDto.setEstFavorite(comp.getEstFavorite());
                                return compDto;
                            })
                            .collect(Collectors.toList());
                    
                    dto.setCompetences(competences);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * Recherche d'expertises avec critères multiples
     * Retourne des ExpertiseDTO enrichis avec les compétences
     */
    @Transactional(readOnly = true)
    public List<ExpertiseDTO> rechercherExpertises(String terme, Long villeId, Long paysId, Boolean disponible) {
        List<Expertise> expertises = expertiseRepository.findByPublieeTrue();
        
        // Filtrer par terme de recherche (titre, description)
        if (terme != null && !terme.trim().isEmpty()) {
            String termeLower = terme.toLowerCase();
            expertises = expertises.stream()
                .filter(exp -> 
                    (exp.getTitre() != null && exp.getTitre().toLowerCase().contains(termeLower)) ||
                    (exp.getDescription() != null && exp.getDescription().toLowerCase().contains(termeLower))
                )
                .collect(Collectors.toList());
        }
        
        // Filtrer par ville
        if (villeId != null) {
            expertises = expertises.stream()
                .filter(exp -> exp.getVille() != null && exp.getVille().getId().equals(villeId))
                .collect(Collectors.toList());
        }
        
        // Filtrer par pays
        if (paysId != null) {
            expertises = expertises.stream()
                .filter(exp -> exp.getVille() != null && 
                             exp.getVille().getPays() != null && 
                             exp.getVille().getPays().getId().equals(paysId))
                .collect(Collectors.toList());
        }
        
        // Filtrer par disponibilité
        if (disponible != null) {
            expertises = expertises.stream()
                .filter(exp -> disponible.equals(exp.getDisponible()))
                .collect(Collectors.toList());
        }
        
        // Mapper vers DTO - la récupération des compétences et utilisateur sera faite côté frontend
        // via des appels séparés si nécessaire
        return expertises.stream()
                .map(ExpertiseDTO::new)
                .collect(Collectors.toList());
    }
}
