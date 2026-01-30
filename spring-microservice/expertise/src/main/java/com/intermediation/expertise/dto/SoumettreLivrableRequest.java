package com.intermediation.expertise.dto;

/**
 * Request pour soumettre un livrable.
 */
public class SoumettreLivrableRequest {

    private String fichierUrl;
    private String fichierNom;
    private Long fichierTaille;
    private String fichierType;
    private String commentaire;

    // Constructeurs
    public SoumettreLivrableRequest() {}

    // Getters et Setters
    public String getFichierUrl() {
        return fichierUrl;
    }

    public void setFichierUrl(String fichierUrl) {
        this.fichierUrl = fichierUrl;
    }

    public String getFichierNom() {
        return fichierNom;
    }

    public void setFichierNom(String fichierNom) {
        this.fichierNom = fichierNom;
    }

    public Long getFichierTaille() {
        return fichierTaille;
    }

    public void setFichierTaille(Long fichierTaille) {
        this.fichierTaille = fichierTaille;
    }

    public String getFichierType() {
        return fichierType;
    }

    public void setFichierType(String fichierType) {
        this.fichierType = fichierType;
    }

    public String getCommentaire() {
        return commentaire;
    }

    public void setCommentaire(String commentaire) {
        this.commentaire = commentaire;
    }
}
