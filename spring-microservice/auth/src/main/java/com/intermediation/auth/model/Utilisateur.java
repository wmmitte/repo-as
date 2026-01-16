package com.intermediation.auth.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "utilisateurs")
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_personne", nullable = false)
    private TypePersonne typePersonne = TypePersonne.PHYSIQUE;

    private String nom;
    private String prenom; // Null pour les personnes morales
    private String photoUrl;

    // Photo stockée en BLOB (PostgreSQL BYTEA)
    @Column(name = "photo_data", columnDefinition = "BYTEA")
    private byte[] photoData;

    @Column(name = "photo_content_type", length = 100)
    private String photoContentType;

    // Informations personnelles obligatoires
    private String telephone;
    
    @Column(name = "date_naissance")
    private LocalDate dateNaissance;

    // Informations professionnelles (optionnelles)
    @Column(name = "domaine_expertise")
    private String domaineExpertise;

    @Column(length = 2000)
    private String biographie;
    
    // Domaines d'intérêt (liste JSON)
    @Column(length = 1000, columnDefinition = "TEXT")
    private String domainesInteret; // Stocké comme JSON array

    // Flag pour indiquer si le profil est complet
    @Column(name = "profil_complet", nullable = false)
    private Boolean profilComplet = false;

    // ID Keycloak (subject du token OIDC)
    @Column(name = "keycloak_id", unique = true)
    private String keycloakId;

    // IDs des providers OAuth (Google, Facebook, Apple)
    @Column(unique = true)
    private String googleId;

    @Column(unique = true)
    private String facebookId;

    @Column(unique = true)
    private String appleId;

    // Pour auth email/password (optionnel)
    private String motDePasseHash;

    // Vérification d'email
    @Column(name = "email_verifie", nullable = false)
    private Boolean emailVerifie = false;

    @Column(name = "token_verification_email")
    private String tokenVerificationEmail;

    @Column(name = "date_expiration_token")
    private LocalDateTime dateExpirationToken;

    @Column(nullable = false)
    private LocalDateTime dateCreation;

    private LocalDateTime derniereConnexion;

    @Column(nullable = false)
    private Boolean actif = true;

    // Flag pour identifier les utilisateurs système (créés automatiquement au démarrage)
    @Column(name = "est_utilisateur_systeme", nullable = false)
    private Boolean estUtilisateurSysteme = false;

    // Constructeurs
    public Utilisateur() {
        this.dateCreation = LocalDateTime.now();
    }

    // Getters et Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public byte[] getPhotoData() {
        return photoData;
    }

    public void setPhotoData(byte[] photoData) {
        this.photoData = photoData;
    }

    public String getPhotoContentType() {
        return photoContentType;
    }

    public void setPhotoContentType(String photoContentType) {
        this.photoContentType = photoContentType;
    }

    public String getKeycloakId() {
        return keycloakId;
    }

    public void setKeycloakId(String keycloakId) {
        this.keycloakId = keycloakId;
    }

    public String getGoogleId() {
        return googleId;
    }

    public void setGoogleId(String googleId) {
        this.googleId = googleId;
    }

    public String getFacebookId() {
        return facebookId;
    }

    public void setFacebookId(String facebookId) {
        this.facebookId = facebookId;
    }

    public String getAppleId() {
        return appleId;
    }

    public void setAppleId(String appleId) {
        this.appleId = appleId;
    }

    public String getMotDePasseHash() {
        return motDePasseHash;
    }

    public void setMotDePasseHash(String motDePasseHash) {
        this.motDePasseHash = motDePasseHash;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

    public LocalDateTime getDerniereConnexion() {
        return derniereConnexion;
    }

    public void setDerniereConnexion(LocalDateTime derniereConnexion) {
        this.derniereConnexion = derniereConnexion;
    }

    public Boolean getActif() {
        return actif;
    }

    public void setActif(Boolean actif) {
        this.actif = actif;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public LocalDate getDateNaissance() {
        return dateNaissance;
    }

    public void setDateNaissance(LocalDate dateNaissance) {
        this.dateNaissance = dateNaissance;
    }

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

    public String getDomainesInteret() {
        return domainesInteret;
    }

    public void setDomainesInteret(String domainesInteret) {
        this.domainesInteret = domainesInteret;
    }

    public Boolean getProfilComplet() {
        return profilComplet;
    }

    public void setProfilComplet(Boolean profilComplet) {
        this.profilComplet = profilComplet;
    }

    public TypePersonne getTypePersonne() {
        return typePersonne;
    }

    public void setTypePersonne(TypePersonne typePersonne) {
        this.typePersonne = typePersonne;
    }

    public Boolean getEmailVerifie() {
        return emailVerifie;
    }

    public void setEmailVerifie(Boolean emailVerifie) {
        this.emailVerifie = emailVerifie;
    }

    public String getTokenVerificationEmail() {
        return tokenVerificationEmail;
    }

    public void setTokenVerificationEmail(String tokenVerificationEmail) {
        this.tokenVerificationEmail = tokenVerificationEmail;
    }

    public LocalDateTime getDateExpirationToken() {
        return dateExpirationToken;
    }

    public void setDateExpirationToken(LocalDateTime dateExpirationToken) {
        this.dateExpirationToken = dateExpirationToken;
    }

    public Boolean getEstUtilisateurSysteme() {
        return estUtilisateurSysteme;
    }

    public void setEstUtilisateurSysteme(Boolean estUtilisateurSysteme) {
        this.estUtilisateurSysteme = estUtilisateurSysteme;
    }

    /**
     * Vérifie si toutes les informations personnelles obligatoires sont renseignées
     * - Personne physique : nom, prénom, téléphone et date de naissance obligatoires
     * - Personne morale : nom, téléphone et date de création obligatoires (pas de prénom)
     */
    public boolean hasCompleteMandatoryInfo() {
        boolean hasBaseInfo = nom != null && !nom.trim().isEmpty()
            && telephone != null && !telephone.trim().isEmpty()
            && dateNaissance != null;
        
        if (typePersonne == TypePersonne.MORALE) {
            // Personne morale : nom + téléphone + date de création
            return hasBaseInfo;
        } else {
            // Personne physique : nom + prénom + téléphone + date de naissance
            return hasBaseInfo 
                && prenom != null && !prenom.trim().isEmpty();
        }
    }
}
