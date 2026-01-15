package com.intermediation.auth.dto;

import java.util.List;

/**
 * DTO pour les informations professionnelles de l'utilisateur
 * Ces champs sont optionnels
 */
public class ProfilProfessionnelDTO {

    private String domaineExpertise;
    private String biographie;

    // Domaines d'intérêt
    private List<String> domainesInteret;

    // Constructeurs
    public ProfilProfessionnelDTO() {}

    // Getters et Setters
    public String getDomaineExpertise() {
        return domaineExpertise;
    }

    public void setDomaineExpertise(String domaineExpertise) {
        this.domaineExpertise = domaineExpertise;
    }

    public String getBiographie() {
        return biographie;
    }

    public void setBiographie(String biographie) {
        this.biographie = biographie;
    }

    public List<String> getDomainesInteret() {
        return domainesInteret;
    }

    public void setDomainesInteret(List<String> domainesInteret) {
        this.domainesInteret = domainesInteret;
    }
}
