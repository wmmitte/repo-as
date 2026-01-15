package com.intermediation.expertise.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entité représentant une certification du référentiel
 */
@Entity
@Table(name = "certifications")
public class Certification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 200)
    private String intitule;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "organisme_delivrant", length = 200)
    private String organismeDelivrant;

    @Column(name = "url_verification", length = 500)
    private String urlVerification;

    @Column(name = "est_active", nullable = false)
    private Boolean estActive = true;

    @Column(name = "indice_popularite", nullable = false)
    private Integer indicePopularite = 0;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    // Constructeurs
    public Certification() {
        this.dateCreation = LocalDateTime.now();
    }

    public Certification(String intitule) {
        this.intitule = intitule;
        this.dateCreation = LocalDateTime.now();
        this.estActive = true;
        this.indicePopularite = 0;
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getIntitule() {
        return intitule;
    }

    public void setIntitule(String intitule) {
        this.intitule = intitule;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getOrganismeDelivrant() {
        return organismeDelivrant;
    }

    public void setOrganismeDelivrant(String organismeDelivrant) {
        this.organismeDelivrant = organismeDelivrant;
    }

    public String getUrlVerification() {
        return urlVerification;
    }

    public void setUrlVerification(String urlVerification) {
        this.urlVerification = urlVerification;
    }

    public Boolean getEstActive() {
        return estActive;
    }

    public void setEstActive(Boolean estActive) {
        this.estActive = estActive;
    }

    public Integer getIndicePopularite() {
        return indicePopularite;
    }

    public void setIndicePopularite(Integer indicePopularite) {
        this.indicePopularite = indicePopularite;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

    public LocalDateTime getDateModification() {
        return dateModification;
    }

    public void setDateModification(LocalDateTime dateModification) {
        this.dateModification = dateModification;
    }

    @PreUpdate
    public void preUpdate() {
        this.dateModification = LocalDateTime.now();
    }
}
