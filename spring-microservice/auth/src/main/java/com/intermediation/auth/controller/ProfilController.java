package com.intermediation.auth.controller;

import com.intermediation.auth.dto.ChangerMotDePasseRequest;
import com.intermediation.auth.dto.ProfilCompletDTO;
import com.intermediation.auth.dto.UpdateProfilRequest;
import com.intermediation.auth.dto.UtilisateurPublicDTO;
import com.intermediation.auth.model.Utilisateur;
import com.intermediation.auth.repository.UtilisateurRepository;
import com.intermediation.auth.service.AuthService;
import com.intermediation.auth.service.ProfilService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Controller pour la gestion du profil utilisateur
 */
@RestController
@RequestMapping("/api/profil")
public class ProfilController {

    private final ProfilService profilService;
    private final AuthService authService;
    private final UtilisateurRepository utilisateurRepository;

    public ProfilController(ProfilService profilService, AuthService authService, UtilisateurRepository utilisateurRepository) {
        this.profilService = profilService;
        this.authService = authService;
        this.utilisateurRepository = utilisateurRepository;
    }

    /**
     * Récupérer le profil complet de l'utilisateur connecté
     * L'email vient du header X-User-Email propagé par le Gateway (OAuth2 et email/password)
     */
    @GetMapping
    public ResponseEntity<?> getProfil(
            @RequestHeader(value = "X-User-Email", required = false) String userEmail) {
        
        System.out.println(" [DEBUG] getProfil appelé - X-User-Email header: " + userEmail);
        
        if (userEmail == null || userEmail.isEmpty()) {
            System.err.println(" [ERROR] Aucun email trouvé - utilisateur non authentifié");
            return ResponseEntity.status(401).body(Map.of("error", "Non authentifié"));
        }
        
        String email = userEmail;

        System.out.println(" [DEBUG] Chargement du profil pour: " + email);
        return profilService.getProfilByEmail(email)
            .map(profil -> ResponseEntity.ok((Object) profil))
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Met à jour le profil de l'utilisateur connecté
     * L'email vient du header X-User-Email propagé par le Gateway (OAuth2 et email/password)
     */
    @PutMapping
    public ResponseEntity<?> updateProfil(
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @Valid @RequestBody UpdateProfilRequest request) {
        
        System.out.println("📥 [PROFIL] Requête de mise à jour reçue pour: " + userEmail);
        System.out.println("📝 [PROFIL] Données reçues - Nom: " + request.getNom() + ", Prénom: " + request.getPrenom() + ", Tél: " + request.getTelephone());
        
        if (userEmail == null || userEmail.isEmpty()) {
            System.err.println("❌ [PROFIL] Email utilisateur manquant");
            return ResponseEntity.status(401).body(Map.of("error", "Non authentifié"));
        }
        
        String email = userEmail;

        try {
            ProfilCompletDTO profil = profilService.updateProfil(email, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Profil mis à jour avec succès");
            response.put("profil", profil);
            
            System.out.println("✅ [PROFIL] Réponse préparée avec succès");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ [ERROR] Erreur lors de la mise à jour du profil: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Erreur lors de la mise à jour du profil: " + e.getMessage()));
        }
    }

    /**
     * Vérifie si le profil de l'utilisateur connecté est complet
     */
    @GetMapping("/complet")
    public ResponseEntity<?> isProfilComplet(@RequestHeader(value = "X-User-Email", required = false) String userEmail) {
        if (userEmail == null || userEmail.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Non authentifié"));
        }

        boolean isComplet = profilService.isProfilComplet(userEmail);
        
        return ResponseEntity.ok(Map.of("profilComplet", isComplet));
    }
    
    /**
     * Endpoint public pour récupérer les informations basiques d'un utilisateur par son ID
     * Utilisé par les autres services pour afficher le nom/prénom
     */
    @GetMapping("/public/{utilisateurId}")
    public ResponseEntity<UtilisateurPublicDTO> getUtilisateurPublic(@PathVariable String utilisateurId) {
        Optional<Utilisateur> utilisateurOpt = utilisateurRepository.findById(utilisateurId);

        if (utilisateurOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Utilisateur utilisateur = utilisateurOpt.get();
        UtilisateurPublicDTO dto = new UtilisateurPublicDTO();
        dto.setId(utilisateur.getId());
        dto.setNom(utilisateur.getNom());
        dto.setPrenom(utilisateur.getPrenom());
        dto.setPhotoUrl(utilisateur.getPhotoUrl());
        dto.setTypePersonne(utilisateur.getTypePersonne());

         // Vérifier si l'utilisateur a une photo (uploadée ou URL externe)
          boolean hasPhoto = (utilisateur.getPhotoData() != null && utilisateur.getPhotoData().length > 0)
                  || (utilisateur.getPhotoUrl() != null && !utilisateur.getPhotoUrl().isEmpty());
          dto.setHasPhoto(hasPhoto);

        return ResponseEntity.ok(dto);
    }

    /**
     * Changer le mot de passe de l'utilisateur connecté
     * Uniquement disponible pour les utilisateurs qui se sont inscrits avec email/mot de passe
     */
    @PutMapping("/mot-de-passe")
    public ResponseEntity<?> changerMotDePasse(
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @Valid @RequestBody ChangerMotDePasseRequest request) {

        System.out.println("🔐 [PROFIL] Demande de changement de mot de passe pour: " + userEmail);

        if (userEmail == null || userEmail.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Non authentifié"));
        }

        // Vérifier que les mots de passe correspondent
        if (!request.getNouveauMotDePasse().equals(request.getConfirmationMotDePasse())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Les mots de passe ne correspondent pas"));
        }

        // Récupérer l'utilisateur par email pour obtenir son ID
        Optional<Utilisateur> utilisateurOpt = utilisateurRepository.findByEmail(userEmail);
        if (utilisateurOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Utilisateur non trouvé"));
        }

        try {
            authService.changerMotDePasse(
                utilisateurOpt.get().getId(),
                request.getMotDePasseActuel(),
                request.getNouveauMotDePasse()
            );

            System.out.println("✅ [PROFIL] Mot de passe changé avec succès pour: " + userEmail);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Mot de passe modifié avec succès"
            ));
        } catch (Exception e) {
            System.err.println("❌ [PROFIL] Erreur changement mot de passe: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
