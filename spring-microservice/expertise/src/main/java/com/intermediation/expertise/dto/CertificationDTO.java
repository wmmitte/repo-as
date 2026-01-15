package com.intermediation.expertise.dto;

import com.intermediation.expertise.model.Certification;

import java.time.LocalDateTime;

/**
 * DTO pour les certifications
 */
public class CertificationDTO {
    
    private Long id;
    private String intitule;
    private String description;
    private String organismeDelivrant;
    private String urlVerification;
    private Boolean estActive;
    private Integer indicePopularite;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;

    // Constructeurs
    public CertificationDTO() {}

    public CertificationDTO(Certification certification) {
        this.id = certification.getId();
        this.intitule = certification.getIntitule();
        this.description = certification.getDescription();
        this.organismeDelivrant = certification.getOrganismeDelivrant();
        this.urlVerification = certification.getUrlVerification();
        this.estActive = certification.getEstActive();
        this.indicePopularite = certification.getIndicePopularite();
        this.dateCreation = certification.getDateCreation();
        this.dateModification = certification.getDateModification();
    }

    public static CertificationDTO fromEntity(Certification certification) {
        return new CertificationDTO(certification);
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
}
