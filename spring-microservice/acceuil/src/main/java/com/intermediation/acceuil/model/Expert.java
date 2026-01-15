package com.intermediation.acceuil.model;

import java.util.List;

/**
 * DTO représentant un Expert avec ses informations professionnelles.
 * 
 * NOTE IMPORTANTE (Migration 2025-11-16):
 * Les champs experienceAnnees, tjmMin, tjmMax et nombreProjets
 * sont des valeurs AGRÉGÉES qui doivent être calculées à partir des compétences de l'expert.
 * 
 * Dans l'entité Expertise, ces champs ont été supprimés car ils sont maintenant gérés
 * au niveau de chaque Competence. Pour construire ce DTO, il faut:
 * - experienceAnnees: MAX(competence.anneesExperience) parmi toutes les compétences
 * - tjmMin: MIN(competence.thm) parmi toutes les compétences
 * - tjmMax: MAX(competence.thm) parmi toutes les compétences
 * - nombreProjets: SUM(competence.nombreProjets) de toutes les compétences
 * 
 * Les certifications sont affichées au niveau de chaque compétence.
 * Le nom/prénom est récupéré depuis le service Auth.
 */
public class Expert {
    private String id;
    private String nom;
    private String prenom;
    private String titre;
    private String photoUrl;
    private Double rating;
    
    // Valeurs agrégées à calculer depuis les compétences (voir commentaire de classe)
    private Integer nombreProjets;
    private String description;
    private List<Competence> competences;
    private Integer experienceAnnees;
    private Integer tjmMin;
    private Integer tjmMax;
    private String localisation;
    private boolean disponible;

    /**
     * Classe interne représentant une compétence technique avec ses détails.
     */
    public static class Competence {
        private String nom;
        private boolean favorite;
        private Integer anneesExperience;
        private Integer thm; // Taux Horaire Moyen en FCFA
        private Integer nombreProjets;
        private String certifications;
        private Integer niveauMaitrise; // 1-5

        public Competence() {}

        public Competence(String nom, boolean favorite) {
            this.nom = nom;
            this.favorite = favorite;
        }

        public String getNom() {
            return nom;
        }

        public void setNom(String nom) {
            this.nom = nom;
        }

        public boolean isFavorite() {
            return favorite;
        }

        public void setFavorite(boolean favorite) {
            this.favorite = favorite;
        }

        public Integer getAnneesExperience() {
            return anneesExperience;
        }

        public void setAnneesExperience(Integer anneesExperience) {
            this.anneesExperience = anneesExperience;
        }

        public Integer getThm() {
            return thm;
        }

        public void setThm(Integer thm) {
            this.thm = thm;
        }

        public Integer getNombreProjets() {
            return nombreProjets;
        }

        public void setNombreProjets(Integer nombreProjets) {
            this.nombreProjets = nombreProjets;
        }

        public String getCertifications() {
            return certifications;
        }

        public void setCertifications(String certifications) {
            this.certifications = certifications;
        }

        public Integer getNiveauMaitrise() {
            return niveauMaitrise;
        }

        public void setNiveauMaitrise(Integer niveauMaitrise) {
            this.niveauMaitrise = niveauMaitrise;
        }
    }

    // Constructeurs
    public Expert() {}

    // Getters et Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getTitre() {
        return titre;
    }

    public void setTitre(String titre) {
        this.titre = titre;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Integer getNombreProjets() {
        return nombreProjets;
    }

    public void setNombreProjets(Integer nombreProjets) {
        this.nombreProjets = nombreProjets;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<Competence> getCompetences() {
        return competences;
    }

    public void setCompetences(List<Competence> competences) {
        this.competences = competences;
    }

    public Integer getExperienceAnnees() {
        return experienceAnnees;
    }

    public void setExperienceAnnees(Integer experienceAnnees) {
        this.experienceAnnees = experienceAnnees;
    }

    public Integer getTjmMin() {
        return tjmMin;
    }

    public void setTjmMin(Integer tjmMin) {
        this.tjmMin = tjmMin;
    }

    public Integer getTjmMax() {
        return tjmMax;
    }

    public void setTjmMax(Integer tjmMax) {
        this.tjmMax = tjmMax;
    }

    public String getLocalisation() {
        return localisation;
    }

    public void setLocalisation(String localisation) {
        this.localisation = localisation;
    }

    public boolean isDisponible() {
        return disponible;
    }

    public void setDisponible(boolean disponible) {
        this.disponible = disponible;
    }
}
