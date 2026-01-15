package com.intermediation.expertise.dto;

import com.intermediation.expertise.model.PieceJustificative;
import com.intermediation.expertise.model.PieceJustificative.TypePiece;

import java.time.LocalDateTime;

/**
 * DTO pour les pièces justificatives
 */
public class PieceJustificativeDTO {

    private Long id;
    private Long demandeId;
    private TypePiece typePiece;
    private String nom;
    private String nomOriginal;
    private String urlFichier;
    private Long tailleOctets;
    private String typeMime;
    private String description;
    private LocalDateTime dateAjout;
    private Boolean estVerifie;
    private LocalDateTime dateVerification;

    // Constructeurs
    public PieceJustificativeDTO() {}

    public PieceJustificativeDTO(PieceJustificative piece) {
        this.id = piece.getId();
        this.demandeId = piece.getDemandeId();
        this.typePiece = piece.getTypePiece();
        this.nom = piece.getNom();
        this.nomOriginal = piece.getNomOriginal();
        this.urlFichier = piece.getUrlFichier();
        this.tailleOctets = piece.getTailleOctets();
        this.typeMime = piece.getTypeMime();
        this.description = piece.getDescription();
        this.dateAjout = piece.getDateAjout();
        this.estVerifie = piece.getEstVerifie();
        this.dateVerification = piece.getDateVerification();
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
}
