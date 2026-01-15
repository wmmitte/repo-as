package com.intermediation.auth.service;

import com.intermediation.auth.dto.ProfilCompletDTO;
import com.intermediation.auth.dto.UpdateProfilRequest;
import com.intermediation.auth.model.TypePersonne;
import com.intermediation.auth.model.Utilisateur;
import com.intermediation.auth.repository.UtilisateurRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service pour gérer le profil utilisateur
 */
@Service
public class ProfilService {

    private final UtilisateurRepository utilisateurRepository;

    public ProfilService(UtilisateurRepository utilisateurRepository) {
        this.utilisateurRepository = utilisateurRepository;
    }

    /**
     * Récupère le profil complet d'un utilisateur par son email
     */
    public Optional<ProfilCompletDTO> getProfilByEmail(String email) {
        return utilisateurRepository.findByEmail(email)
            .map(ProfilCompletDTO::new);
    }

    /**
     * Met à jour le profil d'un utilisateur
     * @param email Email de l'utilisateur
     * @param request Données du profil à mettre à jour
     * @return Le profil mis à jour
     */
    @Transactional
    public ProfilCompletDTO updateProfil(String email, UpdateProfilRequest request) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Validation selon le type de personne
        TypePersonne typePersonne = request.getTypePersonne();
        if (typePersonne == null) {
            typePersonne = TypePersonne.PHYSIQUE; // Par défaut
        }
        
        if (typePersonne == TypePersonne.MORALE) {
            // Personne morale : nom obligatoire, prénom doit être null
            if (request.getNom() == null || request.getNom().trim().isEmpty()) {
                throw new IllegalArgumentException("Le nom est obligatoire pour une personne morale");
            }
            utilisateur.setTypePersonne(TypePersonne.MORALE);
            utilisateur.setNom(request.getNom());
            utilisateur.setPrenom(null); // Toujours null pour une personne morale
        } else {
            // Personne physique : nom ET prénom obligatoires
            if (request.getNom() == null || request.getNom().trim().isEmpty() 
                || request.getPrenom() == null || request.getPrenom().trim().isEmpty()) {
                throw new IllegalArgumentException("Le nom et le prénom sont obligatoires pour une personne physique");
            }
            utilisateur.setTypePersonne(TypePersonne.PHYSIQUE);
            utilisateur.setNom(request.getNom());
            utilisateur.setPrenom(request.getPrenom());
        }
        
        // Mise à jour du téléphone (obligatoire pour tous)
        // Nettoyer les espaces pour uniformiser le format
        String telephone = request.getTelephone();
        if (telephone != null) {
            telephone = telephone.replaceAll("\\s+", "");
        }
        utilisateur.setTelephone(telephone);
        utilisateur.setDateNaissance(request.getDateNaissance());

        // Mise à jour des informations professionnelles (optionnelles)
        utilisateur.setDomaineExpertise(request.getDomaineExpertise());
        utilisateur.setBiographie(request.getBiographie());
        
        // Mise à jour des domaines d'intérêt
        System.out.println("🔍 [PROFIL] Domaines d'intérêt reçus: " + request.getDomainesInteret());
        utilisateur.setDomainesInteret(request.getDomainesInteret());
        System.out.println("💾 [PROFIL] Domaines d'intérêt assignés à l'utilisateur: " + utilisateur.getDomainesInteret());

        // Vérifier si toutes les informations obligatoires sont renseignées
        boolean isComplete = utilisateur.hasCompleteMandatoryInfo();
        utilisateur.setProfilComplet(isComplete);

        System.out.println("📝 [PROFIL] Mise à jour du profil pour: " + email);
        System.out.println("✅ [PROFIL] Profil complet: " + isComplete);
        System.out.println("🔍 [PROFIL] AVANT SAUVEGARDE - Domaines d'intérêt: " + utilisateur.getDomainesInteret());

        // Sauvegarder
        Utilisateur saved = utilisateurRepository.save(utilisateur);
        System.out.println("✅ [PROFIL] Utilisateur sauvegardé - Domaines d'intérêt en BD: " + saved.getDomainesInteret());
        
        return new ProfilCompletDTO(saved);
    }

    /**
     * Vérifie si le profil d'un utilisateur est complet
     */
    public boolean isProfilComplet(String email) {
        return utilisateurRepository.findByEmail(email)
            .map(Utilisateur::getProfilComplet)
            .orElse(false);
    }
}
