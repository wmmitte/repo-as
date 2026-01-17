package com.intermediation.expertise.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * DTO pour la réponse de recherche avancée d'experts.
 * Contient les résultats paginés et les facettes pour affiner la recherche.
 */
public class RechercheExpertResponse {

    // === RÉSULTATS ===
    /** Liste des experts trouvés */
    private List<ExpertResultat> resultats;

    // === PAGINATION ===
    /** Nombre total de résultats */
    private long totalResultats;
    /** Page actuelle (0-indexed) */
    private int page;
    /** Nombre de résultats par page */
    private int taille;
    /** Nombre total de pages */
    private int totalPages;

    // === FACETTES (pour filtres dynamiques) ===
    /** Nombre d'experts par pays */
    private List<FacetteItem> facettesPays;
    /** Nombre d'experts par ville */
    private List<FacetteItem> facettesVilles;
    /** Nombre d'experts par niveau de badge */
    private List<FacetteItem> facettesBadges;
    /** Statistiques globales */
    private StatistiquesRecherche statistiques;

    // Constructeur par défaut
    public RechercheExpertResponse() {}

    // === CLASSES INTERNES ===

    /**
     * Un expert dans les résultats de recherche
     */
    public static class ExpertResultat {
        private String utilisateurId;
        private String titre;
        private String description;
        private String photoUrl;
        private String villeNom;
        private String paysNom;
        private Boolean disponible;
        private BigDecimal scoreGlobal;

        // Statistiques de l'expert
        private int nombreCompetences;
        private int niveauMaitriseMax;
        private int anneesExperienceMax;
        private Integer thmMin;
        private Integer thmMax;
        private int nombreProjets;
        private int nombreBadges;
        private String niveauBadgeMax;
        private int nombreFollowers;

        // Compétences principales (top 3)
        private List<CompetenceResume> competencesPrincipales;

        // Score de pertinence pour cette recherche (0-100)
        private Double scoreRecherche;

        // Getters et Setters
        public String getUtilisateurId() { return utilisateurId; }
        public void setUtilisateurId(String utilisateurId) { this.utilisateurId = utilisateurId; }

        public String getTitre() { return titre; }
        public void setTitre(String titre) { this.titre = titre; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getPhotoUrl() { return photoUrl; }
        public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

        public String getVilleNom() { return villeNom; }
        public void setVilleNom(String villeNom) { this.villeNom = villeNom; }

        public String getPaysNom() { return paysNom; }
        public void setPaysNom(String paysNom) { this.paysNom = paysNom; }

        public Boolean getDisponible() { return disponible; }
        public void setDisponible(Boolean disponible) { this.disponible = disponible; }

        public BigDecimal getScoreGlobal() { return scoreGlobal; }
        public void setScoreGlobal(BigDecimal scoreGlobal) { this.scoreGlobal = scoreGlobal; }

        public int getNombreCompetences() { return nombreCompetences; }
        public void setNombreCompetences(int nombreCompetences) { this.nombreCompetences = nombreCompetences; }

        public int getNiveauMaitriseMax() { return niveauMaitriseMax; }
        public void setNiveauMaitriseMax(int niveauMaitriseMax) { this.niveauMaitriseMax = niveauMaitriseMax; }

        public int getAnneesExperienceMax() { return anneesExperienceMax; }
        public void setAnneesExperienceMax(int anneesExperienceMax) { this.anneesExperienceMax = anneesExperienceMax; }

        public Integer getThmMin() { return thmMin; }
        public void setThmMin(Integer thmMin) { this.thmMin = thmMin; }

        public Integer getThmMax() { return thmMax; }
        public void setThmMax(Integer thmMax) { this.thmMax = thmMax; }

        public int getNombreProjets() { return nombreProjets; }
        public void setNombreProjets(int nombreProjets) { this.nombreProjets = nombreProjets; }

        public int getNombreBadges() { return nombreBadges; }
        public void setNombreBadges(int nombreBadges) { this.nombreBadges = nombreBadges; }

        public String getNiveauBadgeMax() { return niveauBadgeMax; }
        public void setNiveauBadgeMax(String niveauBadgeMax) { this.niveauBadgeMax = niveauBadgeMax; }

        public int getNombreFollowers() { return nombreFollowers; }
        public void setNombreFollowers(int nombreFollowers) { this.nombreFollowers = nombreFollowers; }

        public List<CompetenceResume> getCompetencesPrincipales() { return competencesPrincipales; }
        public void setCompetencesPrincipales(List<CompetenceResume> competencesPrincipales) { this.competencesPrincipales = competencesPrincipales; }

        public Double getScoreRecherche() { return scoreRecherche; }
        public void setScoreRecherche(Double scoreRecherche) { this.scoreRecherche = scoreRecherche; }
    }

    /**
     * Résumé d'une compétence pour l'affichage
     */
    public static class CompetenceResume {
        private String nom;
        private Integer niveauMaitrise;
        private Integer anneesExperience;
        private Integer thm;
        private boolean estCertifiee;
        private String niveauBadge;

        public String getNom() { return nom; }
        public void setNom(String nom) { this.nom = nom; }

        public Integer getNiveauMaitrise() { return niveauMaitrise; }
        public void setNiveauMaitrise(Integer niveauMaitrise) { this.niveauMaitrise = niveauMaitrise; }

        public Integer getAnneesExperience() { return anneesExperience; }
        public void setAnneesExperience(Integer anneesExperience) { this.anneesExperience = anneesExperience; }

        public Integer getThm() { return thm; }
        public void setThm(Integer thm) { this.thm = thm; }

        public boolean isEstCertifiee() { return estCertifiee; }
        public void setEstCertifiee(boolean estCertifiee) { this.estCertifiee = estCertifiee; }

        public String getNiveauBadge() { return niveauBadge; }
        public void setNiveauBadge(String niveauBadge) { this.niveauBadge = niveauBadge; }
    }

    /**
     * Item de facette (pour comptage par catégorie)
     */
    public static class FacetteItem {
        private String code;
        private String libelle;
        private long count;

        public FacetteItem() {}

        public FacetteItem(String code, String libelle, long count) {
            this.code = code;
            this.libelle = libelle;
            this.count = count;
        }

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }

        public String getLibelle() { return libelle; }
        public void setLibelle(String libelle) { this.libelle = libelle; }

        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }

    /**
     * Statistiques globales de la recherche
     */
    public static class StatistiquesRecherche {
        private int totalExpertsDisponibles;
        private int totalExpertsCertifies;
        private int thmMoyen;
        private int experienceMoyenne;
        private double scoreMoyen;

        public int getTotalExpertsDisponibles() { return totalExpertsDisponibles; }
        public void setTotalExpertsDisponibles(int totalExpertsDisponibles) { this.totalExpertsDisponibles = totalExpertsDisponibles; }

        public int getTotalExpertsCertifies() { return totalExpertsCertifies; }
        public void setTotalExpertsCertifies(int totalExpertsCertifies) { this.totalExpertsCertifies = totalExpertsCertifies; }

        public int getThmMoyen() { return thmMoyen; }
        public void setThmMoyen(int thmMoyen) { this.thmMoyen = thmMoyen; }

        public int getExperienceMoyenne() { return experienceMoyenne; }
        public void setExperienceMoyenne(int experienceMoyenne) { this.experienceMoyenne = experienceMoyenne; }

        public double getScoreMoyen() { return scoreMoyen; }
        public void setScoreMoyen(double scoreMoyen) { this.scoreMoyen = scoreMoyen; }
    }

    // === GETTERS ET SETTERS PRINCIPAUX ===

    public List<ExpertResultat> getResultats() { return resultats; }
    public void setResultats(List<ExpertResultat> resultats) { this.resultats = resultats; }

    public long getTotalResultats() { return totalResultats; }
    public void setTotalResultats(long totalResultats) { this.totalResultats = totalResultats; }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getTaille() { return taille; }
    public void setTaille(int taille) { this.taille = taille; }

    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }

    public List<FacetteItem> getFacettesPays() { return facettesPays; }
    public void setFacettesPays(List<FacetteItem> facettesPays) { this.facettesPays = facettesPays; }

    public List<FacetteItem> getFacettesVilles() { return facettesVilles; }
    public void setFacettesVilles(List<FacetteItem> facettesVilles) { this.facettesVilles = facettesVilles; }

    public List<FacetteItem> getFacettesBadges() { return facettesBadges; }
    public void setFacettesBadges(List<FacetteItem> facettesBadges) { this.facettesBadges = facettesBadges; }

    public StatistiquesRecherche getStatistiques() { return statistiques; }
    public void setStatistiques(StatistiquesRecherche statistiques) { this.statistiques = statistiques; }
}
