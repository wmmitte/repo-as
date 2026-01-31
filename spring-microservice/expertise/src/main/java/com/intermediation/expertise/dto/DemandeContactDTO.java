package com.intermediation.expertise.dto;

import com.intermediation.expertise.model.DemandeContact;
import com.intermediation.expertise.model.DemandeContact.StatutDemande;
import com.intermediation.expertise.model.DemandeContact.TypeReference;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO pour les demandes de contact
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DemandeContactDTO {

    private Long id;
    private String expediteurId;
    private String destinataireId;
    private String objet;
    private String message;
    private String emailReponse;
    private StatutDemande statut;
    private LocalDateTime dateCreation;
    private LocalDateTime dateLecture;
    private LocalDateTime dateReponse;

    // Référence vers un élément
    private TypeReference typeReference;
    private Long referenceId;
    private String lienReference;
    private Boolean estNotificationSysteme;

    // Informations enrichies (optionnel, rempli par le service)
    private String expediteurNom;
    private String expediteurPrenom;
    private Boolean expediteurHasPhoto;
    private String destinataireNom;
    private String destinatairePrenom;
    private Boolean destinataireHasPhoto;

    public DemandeContactDTO(DemandeContact entity) {
        this.id = entity.getId();
        this.expediteurId = entity.getExpediteurId();
        this.destinataireId = entity.getDestinataireId();
        this.objet = entity.getObjet();
        this.message = entity.getMessage();
        this.emailReponse = entity.getEmailReponse();
        this.statut = entity.getStatut();
        this.dateCreation = entity.getDateCreation();
        this.dateLecture = entity.getDateLecture();
        this.dateReponse = entity.getDateReponse();
        this.typeReference = entity.getTypeReference();
        this.referenceId = entity.getReferenceId();
        this.lienReference = entity.getLienReference();
        this.estNotificationSysteme = entity.getEstNotificationSysteme();
    }

    public DemandeContact toEntity() {
        DemandeContact entity = new DemandeContact();
        entity.setId(this.id);
        entity.setExpediteurId(this.expediteurId);
        entity.setDestinataireId(this.destinataireId);
        entity.setObjet(this.objet);
        entity.setMessage(this.message);
        entity.setEmailReponse(this.emailReponse);
        entity.setStatut(this.statut != null ? this.statut : StatutDemande.EN_ATTENTE);
        entity.setTypeReference(this.typeReference);
        entity.setReferenceId(this.referenceId);
        entity.setLienReference(this.lienReference);
        entity.setEstNotificationSysteme(this.estNotificationSysteme);
        return entity;
    }
}
