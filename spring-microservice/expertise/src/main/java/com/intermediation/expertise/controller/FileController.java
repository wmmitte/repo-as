package com.intermediation.expertise.controller;

import com.intermediation.expertise.service.FileStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;

/**
 * Controller pour la gestion des fichiers (téléchargement)
 */
@RestController
@RequestMapping("/api/files")
public class FileController {

    private static final Logger logger = LoggerFactory.getLogger(FileController.class);

    @Autowired
    private FileStorageService fileStorageService;

    /**
     * Télécharger un fichier
     */
    @GetMapping("/download/{utilisateurId}/{demandeId}/{filename:.+}")
    public ResponseEntity<?> downloadFile(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String utilisateurId,
            @PathVariable String demandeId,
            @PathVariable String filename) {
        
        // Vérifier que l'utilisateur a accès au fichier
        // Pour l'instant, on vérifie simplement que c'est son fichier
        // TODO: Ajouter une vérification plus robuste avec les traitants
        
        try {
            String filePath = utilisateurId + "/" + demandeId + "/" + filename;
            Path file = fileStorageService.getFilePath(filePath);
            
            if (!fileStorageService.fileExists(filePath)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Fichier non trouvé");
            }

            Resource resource = new UrlResource(file.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Fichier non trouvé ou non lisible");
            }

            // Déterminer le type de contenu
            String contentType = "application/octet-stream";
            try {
                contentType = java.nio.file.Files.probeContentType(file);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }
            } catch (IOException e) {
                logger.warn("Impossible de déterminer le type de contenu du fichier", e);
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (MalformedURLException e) {
            logger.error("Erreur lors du téléchargement du fichier", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors du téléchargement");
        }
    }

    /**
     * Prévisualiser un fichier (inline dans le navigateur)
     */
    @GetMapping("/view/{utilisateurId}/{demandeId}/{filename:.+}")
    public ResponseEntity<?> viewFile(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String utilisateurId,
            @PathVariable String demandeId,
            @PathVariable String filename) {

        try {
            String filePath = utilisateurId + "/" + demandeId + "/" + filename;
            Path file = fileStorageService.getFilePath(filePath);

            if (!fileStorageService.fileExists(filePath)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Fichier non trouvé");
            }

            Resource resource = new UrlResource(file.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Fichier non trouvé ou non lisible");
            }

            // Déterminer le type de contenu
            String contentType = "application/octet-stream";
            try {
                contentType = java.nio.file.Files.probeContentType(file);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }
            } catch (IOException e) {
                logger.warn("Impossible de déterminer le type de contenu du fichier", e);
            }

            // Utiliser "inline" pour afficher dans le navigateur au lieu de télécharger
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (MalformedURLException e) {
            logger.error("Erreur lors de la prévisualisation du fichier", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors de la prévisualisation");
        }
    }

    /**
     * Vérifier si un fichier existe
     */
    @GetMapping("/exists/{utilisateurId}/{demandeId}/{filename:.+}")
    public ResponseEntity<?> checkFileExists(
            @PathVariable String utilisateurId,
            @PathVariable String demandeId,
            @PathVariable String filename) {

        try {
            String filePath = utilisateurId + "/" + demandeId + "/" + filename;
            boolean exists = fileStorageService.fileExists(filePath);
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            logger.error("Erreur lors de la vérification d'existence du fichier", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(false);
        }
    }

    // ==================== Endpoints pour les livrables ====================

    /**
     * Télécharger un fichier de livrable
     */
    @GetMapping("/livrables/download/{tacheId}/{livrableId}/{filename:.+}")
    public ResponseEntity<?> downloadLivrableFile(
            @PathVariable Long tacheId,
            @PathVariable Long livrableId,
            @PathVariable String filename) {

        try {
            String filePath = "livrables/" + tacheId + "/" + livrableId + "/" + filename;
            Path file = fileStorageService.getFilePath(filePath);

            if (!fileStorageService.fileExists(filePath)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Fichier non trouvé");
            }

            Resource resource = new UrlResource(file.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Fichier non trouvé ou non lisible");
            }

            // Déterminer le type de contenu
            String contentType = "application/octet-stream";
            try {
                contentType = java.nio.file.Files.probeContentType(file);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }
            } catch (IOException e) {
                logger.warn("Impossible de déterminer le type de contenu du fichier", e);
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (MalformedURLException e) {
            logger.error("Erreur lors du téléchargement du fichier de livrable", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors du téléchargement");
        }
    }

    /**
     * Prévisualiser un fichier de livrable (inline dans le navigateur)
     */
    @GetMapping("/livrables/view/{tacheId}/{livrableId}/{filename:.+}")
    public ResponseEntity<?> viewLivrableFile(
            @PathVariable Long tacheId,
            @PathVariable Long livrableId,
            @PathVariable String filename) {

        try {
            String filePath = "livrables/" + tacheId + "/" + livrableId + "/" + filename;
            Path file = fileStorageService.getFilePath(filePath);

            if (!fileStorageService.fileExists(filePath)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Fichier non trouvé");
            }

            Resource resource = new UrlResource(file.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Fichier non trouvé ou non lisible");
            }

            // Déterminer le type de contenu
            String contentType = "application/octet-stream";
            try {
                contentType = java.nio.file.Files.probeContentType(file);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }
            } catch (IOException e) {
                logger.warn("Impossible de déterminer le type de contenu du fichier", e);
            }

            // Utiliser "inline" pour afficher dans le navigateur au lieu de télécharger
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (MalformedURLException e) {
            logger.error("Erreur lors de la prévisualisation du fichier de livrable", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors de la prévisualisation");
        }
    }
}
