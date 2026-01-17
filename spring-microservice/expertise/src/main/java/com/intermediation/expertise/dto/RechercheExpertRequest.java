package com.intermediation.expertise.dto;

import java.math.BigDecimal;

/**
 * DTO pour les critères de recherche avancée d'experts.
 * Tous les champs sont optionnels (filtres cumulatifs).
 */
public class RechercheExpertRequest {

    // === RECHERCHE TEXTE ===
    /** Terme de recherche libre (titre, description, compétences, certifications) */
    private String terme;

    // === FILTRES LOCALISATION ===
    /** ID du pays pour filtrer */
    private Long paysId;
    /** ID de la ville pour filtrer */
    private Long villeId;

    // === FILTRES DISPONIBILITÉ ===
    /** Filtrer par disponibilité (true = disponibles uniquement) */
    private Boolean disponible;

    // === FILTRES EXPÉRIENCE ===
    /** Années d'expérience minimum (sur au moins une compétence) */
    private Integer anneesExperienceMin;
    /** Années d'expérience maximum */
    private Integer anneesExperienceMax;
    /** Niveau de maîtrise minimum (1-5) */
    private Integer niveauMaitriseMin;
    /** Nombre de projets minimum */
    private Integer nombreProjetsMin;

    // === FILTRES TARIF ===
    /** Tarif horaire moyen minimum (FCFA) */
    private Integer thmMin;
    /** Tarif horaire moyen maximum (FCFA) */
    private Integer thmMax;

    // === FILTRES CERTIFICATIONS ===
    /** Niveau de badge minimum requis (BRONZE, ARGENT, OR, PLATINE) */
    private String niveauBadgeMin;
    /** Nombre minimum de badges actifs */
    private Integer nombreBadgesMin;
    /** Uniquement les experts avec au moins un badge */
    private Boolean certifieUniquement;

    // === FILTRES SCORE ===
    /** Score global minimum (0-100) */
    private BigDecimal scoreMin;

    // === FILTRES POPULARITÉ ===
    /** Nombre minimum de followers */
    private Integer nombreFollowersMin;

    // === TRI ===
    /** Champ de tri: SCORE, EXPERIENCE, THM_ASC, THM_DESC, POPULARITE, RECENT */
    private String tri;

    // === PAGINATION ===
    /** Numéro de page (0-indexed) */
    private Integer page;
    /** Nombre de résultats par page */
    private Integer taille;

    // Constructeur par défaut
    public RechercheExpertRequest() {
        this.page = 0;
        this.taille = 20;
        this.tri = "SCORE";
    }

    // Getters et Setters
    public String getTerme() {
        return terme;
    }

    public void setTerme(String terme) {
        this.terme = terme;
    }

    public Long getPaysId() {
        return paysId;
    }

    public void setPaysId(Long paysId) {
        this.paysId = paysId;
    }

    public Long getVilleId() {
        return villeId;
    }

    public void setVilleId(Long villeId) {
        this.villeId = villeId;
    }

    public Boolean getDisponible() {
        return disponible;
    }

    public void setDisponible(Boolean disponible) {
        this.disponible = disponible;
    }

    public Integer getAnneesExperienceMin() {
        return anneesExperienceMin;
    }

    public void setAnneesExperienceMin(Integer anneesExperienceMin) {
        this.anneesExperienceMin = anneesExperienceMin;
    }

    public Integer getAnneesExperienceMax() {
        return anneesExperienceMax;
    }

    public void setAnneesExperienceMax(Integer anneesExperienceMax) {
        this.anneesExperienceMax = anneesExperienceMax;
    }

    public Integer getNiveauMaitriseMin() {
        return niveauMaitriseMin;
    }

    public void setNiveauMaitriseMin(Integer niveauMaitriseMin) {
        this.niveauMaitriseMin = niveauMaitriseMin;
    }

    public Integer getNombreProjetsMin() {
        return nombreProjetsMin;
    }

    public void setNombreProjetsMin(Integer nombreProjetsMin) {
        this.nombreProjetsMin = nombreProjetsMin;
    }

    public Integer getThmMin() {
        return thmMin;
    }

    public void setThmMin(Integer thmMin) {
        this.thmMin = thmMin;
    }

    public Integer getThmMax() {
        return thmMax;
    }

    public void setThmMax(Integer thmMax) {
        this.thmMax = thmMax;
    }

    public String getNiveauBadgeMin() {
        return niveauBadgeMin;
    }

    public void setNiveauBadgeMin(String niveauBadgeMin) {
        this.niveauBadgeMin = niveauBadgeMin;
    }

    public Integer getNombreBadgesMin() {
        return nombreBadgesMin;
    }

    public void setNombreBadgesMin(Integer nombreBadgesMin) {
        this.nombreBadgesMin = nombreBadgesMin;
    }

    public Boolean getCertifieUniquement() {
        return certifieUniquement;
    }

    public void setCertifieUniquement(Boolean certifieUniquement) {
        this.certifieUniquement = certifieUniquement;
    }

    public BigDecimal getScoreMin() {
        return scoreMin;
    }

    public void setScoreMin(BigDecimal scoreMin) {
        this.scoreMin = scoreMin;
    }

    public Integer getNombreFollowersMin() {
        return nombreFollowersMin;
    }

    public void setNombreFollowersMin(Integer nombreFollowersMin) {
        this.nombreFollowersMin = nombreFollowersMin;
    }

    public String getTri() {
        return tri;
    }

    public void setTri(String tri) {
        this.tri = tri;
    }

    public Integer getPage() {
        return page;
    }

    public void setPage(Integer page) {
        this.page = page;
    }

    public Integer getTaille() {
        return taille;
    }

    public void setTaille(Integer taille) {
        this.taille = taille;
    }
}
