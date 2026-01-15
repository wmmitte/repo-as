package com.intermediation.auth.dto;

import com.intermediation.auth.model.Utilisateur;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO complet du profil utilisateur
 * Combine les informations personnelles et professionnelles
 */
public class ProfilCompletDTO {
    
    private static final ObjectMapper objectMapper = new ObjectMapper();
    
    private String id;
    private ProfilPersonnelDTO informationsPersonnelles;
    private ProfilProfessionnelDTO informationsProfessionnelles;
    private boolean profilComplet;
    private boolean hasOAuthProvider;  // true si l'utilisateur utilise Google/Facebook/Apple
    private boolean hasPhoto;  // true si l'utilisateur a une photo uploadée

    // Constructeurs
    public ProfilCompletDTO() {}

    public ProfilCompletDTO(Utilisateur utilisateur) {
        this.id = utilisateur.getId();
        this.profilComplet = utilisateur.getProfilComplet() != null && utilisateur.getProfilComplet();
        
        // Déterminer si l'utilisateur a un provider OAuth
        this.hasOAuthProvider = utilisateur.getGoogleId() != null
            || utilisateur.getFacebookId() != null
            || utilisateur.getAppleId() != null;

        // Déterminer si l'utilisateur a une photo (uploadée ou URL externe)
        this.hasPhoto = (utilisateur.getPhotoData() != null && utilisateur.getPhotoData().length > 0)
            || (utilisateur.getPhotoUrl() != null && !utilisateur.getPhotoUrl().isEmpty());

        // Informations personnelles
        ProfilPersonnelDTO perso = new ProfilPersonnelDTO();
        perso.setTypePersonne(utilisateur.getTypePersonne());
        perso.setNom(utilisateur.getNom());
        perso.setPrenom(utilisateur.getPrenom());
        perso.setEmail(utilisateur.getEmail());
        perso.setTelephone(utilisateur.getTelephone());
        perso.setDateNaissance(utilisateur.getDateNaissance());
        perso.setPhotoUrl(utilisateur.getPhotoUrl());
        this.informationsPersonnelles = perso;

        // Informations professionnelles
        ProfilProfessionnelDTO pro = new ProfilProfessionnelDTO();
        pro.setDomaineExpertise(utilisateur.getDomaineExpertise());
        pro.setBiographie(utilisateur.getBiographie());

        // Parser les listes JSON
        pro.setDomainesInteret(parseJsonArray(utilisateur.getDomainesInteret()));
        
        this.informationsProfessionnelles = pro;
    }

    // Getters et Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public ProfilPersonnelDTO getInformationsPersonnelles() {
        return informationsPersonnelles;
    }

    public void setInformationsPersonnelles(ProfilPersonnelDTO informationsPersonnelles) {
        this.informationsPersonnelles = informationsPersonnelles;
    }

    public ProfilProfessionnelDTO getInformationsProfessionnelles() {
        return informationsProfessionnelles;
    }

    public void setInformationsProfessionnelles(ProfilProfessionnelDTO informationsProfessionnelles) {
        this.informationsProfessionnelles = informationsProfessionnelles;
    }

    public boolean isProfilComplet() {
        return profilComplet;
    }

    public void setProfilComplet(boolean profilComplet) {
        this.profilComplet = profilComplet;
    }

    public boolean isHasOAuthProvider() {
        return hasOAuthProvider;
    }

    public void setHasOAuthProvider(boolean hasOAuthProvider) {
        this.hasOAuthProvider = hasOAuthProvider;
    }

    public boolean isHasPhoto() {
        return hasPhoto;
    }

    public void setHasPhoto(boolean hasPhoto) {
        this.hasPhoto = hasPhoto;
    }

    /**
     * Parse une chaîne JSON en liste de strings
     * Retourne une liste vide si la chaîne est null ou invalide
     */
    private List<String> parseJsonArray(String jsonString) {
        if (jsonString == null || jsonString.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        try {
            return objectMapper.readValue(jsonString, new TypeReference<List<String>>(){});
        } catch (Exception e) {
            System.err.println("⚠️ Erreur lors du parsing JSON: " + e.getMessage());
            return new ArrayList<>();
        }
    }
}
