package com.intermediation.expertise.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entité représentant une demande de contact entre utilisateurs
 */
@Entity
@Table(name = "demandes_contact")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DemandeContact {

    public enum StatutDemande {
        EN_ATTENTE,     // Demande envoyée, pas encore lue
        LUE,            // Demande lue par le destinataire
        REPONDUE,       // Le destinataire a répondu
        ARCHIVEE        // Demande archivée
    }

    public enum TypeReference {
        PROJET,
        TACHE,
        LIVRABLE,
        CANDIDATURE,
        AUTRE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "expediteur_id", nullable = false)
    private String expediteurId;

    @Column(name = "destinataire_id", nullable = false)
    private String destinataireId;

    @Column(name = "objet", nullable = false, length = 255)
    private String objet;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "email_reponse", length = 255)
    private String emailReponse;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private StatutDemande statut = StatutDemande.EN_ATTENTE;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_lecture")
    private LocalDateTime dateLecture;

    @Column(name = "date_reponse")
    private LocalDateTime dateReponse;

    // Référence vers un élément (projet, tâche, livrable, etc.)
    @Enumerated(EnumType.STRING)
    @Column(name = "type_reference", length = 50)
    private TypeReference typeReference;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "lien_reference", length = 500)
    private String lienReference;

    // Indique si c'est une notification système (non répondable)
    @Column(name = "est_notification_systeme")
    private Boolean estNotificationSysteme = false;

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
        if (statut == null) {
            statut = StatutDemande.EN_ATTENTE;
        }
    }

    // Méthodes utilitaires
    public void marquerCommeLue() {
        if (this.statut == StatutDemande.EN_ATTENTE) {
            this.statut = StatutDemande.LUE;
            this.dateLecture = LocalDateTime.now();
        }
    }

    public void marquerCommeRepondue() {
        this.statut = StatutDemande.REPONDUE;
        this.dateReponse = LocalDateTime.now();
    }

    public void archiver() {
        this.statut = StatutDemande.ARCHIVEE;
    }
}
