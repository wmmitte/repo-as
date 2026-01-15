package com.intermediation.expertise.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entité représentant une pièce justificative attachée à une demande de reconnaissance
 */
@Entity
@Table(name = "pieces_justificatives")
public class PieceJustificative {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "demande_id", nullable = false)
    private Long demandeId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_piece", nullable = false, length = 30)
    private TypePiece typePiece;

    @Column(nullable = false)
    private String nom; // Nom du fichier

    @Column(name = "nom_original")
    private String nomOriginal; // Nom original du fichier uploadé

    @Column(name = "url_fichier", nullable = false)
    private String urlFichier; // Chemin de stockage du fichier

    @Column(name = "taille_octets")
    private Long tailleOctets;

    @Column(name = "type_mime", length = 100)
    private String typeMime; // image/png, application/pdf, etc.

    @Column(length = 1000)
    private String description; // Description optionnelle de la pièce

    @Column(name = "date_ajout", nullable = false)
    private LocalDateTime dateAjout;

    @Column(name = "est_verifie")
    private Boolean estVerifie = false; // Vérifié par le traitant

    @Column(name = "date_verification")
    private LocalDateTime dateVerification;

    // Constructeurs
    public PieceJustificative() {
        this.dateAjout = LocalDateTime.now();
    }

    public PieceJustificative(Long demandeId, TypePiece typePiece, String nom, String urlFichier) {
        this();
        this.demandeId = demandeId;
        this.typePiece = typePiece;
        this.nom = nom;
        this.urlFichier = urlFichier;
    }

    // Méthodes métier
    public void marquerVerifie() {
        this.estVerifie = true;
        this.dateVerification = LocalDateTime.now();
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getDemandeId() {
        return demandeId;
    }

    public void setDemandeId(Long demandeId) {
        this.demandeId = demandeId;
    }

    public TypePiece getTypePiece() {
        return typePiece;
    }

    public void setTypePiece(TypePiece typePiece) {
        this.typePiece = typePiece;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getNomOriginal() {
        return nomOriginal;
    }

    public void setNomOriginal(String nomOriginal) {
        this.nomOriginal = nomOriginal;
    }

    public String getUrlFichier() {
        return urlFichier;
    }

    public void setUrlFichier(String urlFichier) {
        this.urlFichier = urlFichier;
    }

    public Long getTailleOctets() {
        return tailleOctets;
    }

    public void setTailleOctets(Long tailleOctets) {
        this.tailleOctets = tailleOctets;
    }

    public String getTypeMime() {
        return typeMime;
    }

    public void setTypeMime(String typeMime) {
        this.typeMime = typeMime;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getDateAjout() {
        return dateAjout;
    }

    public void setDateAjout(LocalDateTime dateAjout) {
        this.dateAjout = dateAjout;
    }

    public Boolean getEstVerifie() {
        return estVerifie;
    }

    public void setEstVerifie(Boolean estVerifie) {
        this.estVerifie = estVerifie;
    }

    public LocalDateTime getDateVerification() {
        return dateVerification;
    }

    public void setDateVerification(LocalDateTime dateVerification) {
        this.dateVerification = dateVerification;
    }

    /**
     * Type de pièce justificative
     */
    public enum TypePiece {
        CERTIFICAT("Certificat professionnel"),
        DIPLOME("Diplôme ou attestation de formation"),
        PROJET("Projet réalisé ou portfolio"),
        RECOMMANDATION("Lettre de recommandation"),
        EXPERIENCE("Preuve d'expérience professionnelle"),
        PUBLICATION("Publication ou article"),
        AUTRE("Autre document");

        private final String description;

        TypePiece(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}
