package com.intermediation.auth.controller;

import com.intermediation.auth.model.Utilisateur;
import com.intermediation.auth.repository.UtilisateurRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

/**
 * Controller pour la gestion des photos de profil
 */
@RestController
@RequestMapping("/api/profil")
public class PhotoController {

    private final UtilisateurRepository utilisateurRepository;

    // Taille maximale de l'image: 5 MB
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    // Types MIME acceptés
    private static final String[] ACCEPTED_CONTENT_TYPES = {
        "image/jpeg", "image/png", "image/gif", "image/webp"
    };

    public PhotoController(UtilisateurRepository utilisateurRepository) {
        this.utilisateurRepository = utilisateurRepository;
    }

    /**
     * Upload une photo de profil
     */
    @PostMapping("/photo")
    public ResponseEntity<?> uploadPhoto(
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @RequestParam("photo") MultipartFile file) {

        System.out.println("📸 [PHOTO] Upload de photo pour: " + userEmail);

        if (userEmail == null || userEmail.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Non authentifié"));
        }

        // Vérifier que le fichier n'est pas vide
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Aucun fichier fourni"));
        }

        // Vérifier la taille du fichier
        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.badRequest().body(Map.of("error", "Le fichier est trop volumineux (max 5 MB)"));
        }

        // Vérifier le type MIME
        String contentType = file.getContentType();
        boolean typeAccepte = false;
        for (String acceptedType : ACCEPTED_CONTENT_TYPES) {
            if (acceptedType.equals(contentType)) {
                typeAccepte = true;
                break;
            }
        }

        if (!typeAccepte) {
            return ResponseEntity.badRequest().body(Map.of("error", "Type de fichier non accepté. Utilisez JPEG, PNG, GIF ou WebP"));
        }

        // Récupérer l'utilisateur
        Optional<Utilisateur> utilisateurOpt = utilisateurRepository.findByEmail(userEmail);
        if (utilisateurOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Utilisateur non trouvé"));
        }

        try {
            Utilisateur utilisateur = utilisateurOpt.get();
            utilisateur.setPhotoData(file.getBytes());
            utilisateur.setPhotoContentType(contentType);
            // Effacer l'URL externe si une photo est uploadée
            utilisateur.setPhotoUrl(null);
            utilisateurRepository.save(utilisateur);

            System.out.println("✅ [PHOTO] Photo uploadée avec succès pour: " + userEmail);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Photo uploadée avec succès"
            ));
        } catch (IOException e) {
            System.err.println("❌ [PHOTO] Erreur lors de l'upload: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Erreur lors de l'enregistrement de la photo"));
        }
    }

    /**
     * Récupère la photo de profil de l'utilisateur connecté
     */
    @GetMapping("/photo")
    public ResponseEntity<?> getMyPhoto(@RequestHeader(value = "X-User-Email", required = false) String userEmail) {
        if (userEmail == null || userEmail.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Non authentifié"));
        }

        Optional<Utilisateur> utilisateurOpt = utilisateurRepository.findByEmail(userEmail);
        if (utilisateurOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return servirPhoto(utilisateurOpt.get());
    }

    /**
     * Récupère la photo de profil d'un utilisateur par son ID (endpoint public)
     * Cherche d'abord par keycloakId, puis par ID JPA si non trouvé
     */
    @GetMapping("/public/{utilisateurId}/photo")
    public ResponseEntity<?> getPhotoPublic(@PathVariable String utilisateurId) {
        // Chercher d'abord par keycloakId (ID propagé par le Gateway)
        Optional<Utilisateur> utilisateurOpt = utilisateurRepository.findByKeycloakId(utilisateurId);

        // Si non trouvé, chercher par ID JPA (rétrocompatibilité)
        if (utilisateurOpt.isEmpty()) {
            utilisateurOpt = utilisateurRepository.findById(utilisateurId);
        }

        if (utilisateurOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return servirPhoto(utilisateurOpt.get());
    }

    /**
     * Supprime la photo de profil de l'utilisateur connecté
     */
    @DeleteMapping("/photo")
    public ResponseEntity<?> deletePhoto(@RequestHeader(value = "X-User-Email", required = false) String userEmail) {
        System.out.println("🗑️ [PHOTO] Suppression de photo pour: " + userEmail);

        if (userEmail == null || userEmail.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Non authentifié"));
        }

        Optional<Utilisateur> utilisateurOpt = utilisateurRepository.findByEmail(userEmail);
        if (utilisateurOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Utilisateur non trouvé"));
        }

        Utilisateur utilisateur = utilisateurOpt.get();
        utilisateur.setPhotoData(null);
        utilisateur.setPhotoContentType(null);
        utilisateur.setPhotoUrl(null);
        utilisateurRepository.save(utilisateur);

        System.out.println("✅ [PHOTO] Photo supprimée avec succès pour: " + userEmail);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Photo supprimée avec succès"
        ));
    }

    /**
     * Méthode utilitaire pour servir une photo
     */
    private ResponseEntity<?> servirPhoto(Utilisateur utilisateur) {
        // Priorité à la photo uploadée
        if (utilisateur.getPhotoData() != null && utilisateur.getPhotoData().length > 0) {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(
                utilisateur.getPhotoContentType() != null ? utilisateur.getPhotoContentType() : "image/jpeg"
            ));
            headers.setContentLength(utilisateur.getPhotoData().length);
            // Cache de 1 heure
            headers.setCacheControl("public, max-age=3600");

            return new ResponseEntity<>(utilisateur.getPhotoData(), headers, HttpStatus.OK);
        }

        // Sinon rediriger vers l'URL externe si présente
        if (utilisateur.getPhotoUrl() != null && !utilisateur.getPhotoUrl().isEmpty()) {
            return ResponseEntity.status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, utilisateur.getPhotoUrl())
                .build();
        }

        // Pas de photo
        return ResponseEntity.notFound().build();
    }
}
