package com.intermediation.expertise.dto;

import java.util.List;

/**
 * DTO pour exposer les données publiques d'un expert (pour le feed d'accueil)
 */
public class ExpertPublicDTO {
    
    private String utilisateurId;
    private String titre;
    private String description;
    private String photoUrl;
    private String localisation; // "Paris, France"
    private Boolean disponible;
    private String typePersonne; // PHYSIQUE ou MORALE
    private List<CompetencePublicDTO> competences;
    
    // Constructeurs
    public ExpertPublicDTO() {}
    
    // Getters et Setters
    public String getUtilisateurId() {
        return utilisateurId;
    }
    
    public void setUtilisateurId(String utilisateurId) {
        this.utilisateurId = utilisateurId;
    }
    
    public String getTitre() {
        return titre;
    }
    
    public void setTitre(String titre) {
        this.titre = titre;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getPhotoUrl() {
        return photoUrl;
    }
    
    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }
    
    public String getLocalisation() {
        return localisation;
    }
    
    public void setLocalisation(String localisation) {
        this.localisation = localisation;
    }
    
    public Boolean getDisponible() {
        return disponible;
    }
    
    public void setDisponible(Boolean disponible) {
        this.disponible = disponible;
    }
    
    public String getTypePersonne() {
        return typePersonne;
    }
    
    public void setTypePersonne(String typePersonne) {
        this.typePersonne = typePersonne;
    }
    
    public List<CompetencePublicDTO> getCompetences() {
        return competences;
    }
    
    public void setCompetences(List<CompetencePublicDTO> competences) {
        this.competences = competences;
    }
    
    /**
     * DTO pour les compétences publiques
     */
    public static class CompetencePublicDTO {
        private String nom;
        private String description;
        private Integer niveauMaitrise;
        private Integer anneesExperience;
        private Integer thm;
        private Integer nombreProjets;
        private String certifications;
        private Boolean estFavorite;
        
        public CompetencePublicDTO() {}
        
        // Getters et Setters
        public String getNom() {
            return nom;
        }
        
        public void setNom(String nom) {
            this.nom = nom;
        }
        
        public String getDescription() {
            return description;
        }
        
        public void setDescription(String description) {
            this.description = description;
        }
        
        public Integer getNiveauMaitrise() {
            return niveauMaitrise;
        }
        
        public void setNiveauMaitrise(Integer niveauMaitrise) {
            this.niveauMaitrise = niveauMaitrise;
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
        
        public Boolean getEstFavorite() {
            return estFavorite;
        }
        
        public void setEstFavorite(Boolean estFavorite) {
            this.estFavorite = estFavorite;
        }
    }
}
