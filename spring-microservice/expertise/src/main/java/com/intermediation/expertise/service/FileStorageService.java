package com.intermediation.expertise.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Service pour la gestion du stockage des fichiers (pièces justificatives)
 */
@Service
public class FileStorageService {

    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);

    @Value("${file.upload.directory:uploads/competences}")
    private String uploadDirectory;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    private static final String[] ALLOWED_EXTENSIONS = {
        "pdf", "doc", "docx", "jpg", "jpeg", "png", "gif"
    };

    /**
     * Stocker un fichier
     * 
     * @param file Fichier à stocker
     * @param utilisateurId ID de l'utilisateur
     * @param demandeId ID de la demande
     * @return Chemin relatif du fichier stocké
     * @throws IOException Si erreur de stockage
     */
    public String storeFile(MultipartFile file, String utilisateurId, Long demandeId) throws IOException {
        // Validation
        if (file.isEmpty()) {
            throw new IOException("Le fichier est vide");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IOException("Le fichier est trop volumineux (max 10 MB)");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            throw new IOException("Nom de fichier invalide");
        }

        // Vérifier l'extension
        String extension = getFileExtension(originalFilename);
        if (!isAllowedExtension(extension)) {
            throw new IOException("Type de fichier non autorisé. Extensions autorisées : " + String.join(", ", ALLOWED_EXTENSIONS));
        }

        // Créer le répertoire si nécessaire
        Path uploadPath = Paths.get(uploadDirectory, utilisateurId, demandeId.toString());
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Générer un nom de fichier unique
        String uniqueFilename = UUID.randomUUID().toString() + "." + extension;
        Path targetPath = uploadPath.resolve(uniqueFilename);

        // Copier le fichier
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        // Retourner le chemin relatif complet (utilisateurId/demandeId/filename)
        // pour correspondre au format attendu par le endpoint /download/{utilisateurId}/{demandeId}/{filename}
        String relativePath = utilisateurId + "/" + demandeId + "/" + uniqueFilename;
        logger.info("Fichier stocké : {}", relativePath);

        return relativePath;
    }

    /**
     * Supprimer un fichier
     * 
     * @param filePath Chemin relatif du fichier
     * @throws IOException Si erreur de suppression
     */
    public void deleteFile(String filePath) throws IOException {
        if (filePath == null || filePath.isEmpty()) {
            return;
        }

        Path path = Paths.get(uploadDirectory, filePath);
        if (Files.exists(path)) {
            Files.delete(path);
            logger.info("Fichier supprimé : {}", filePath);
        }
    }

    /**
     * Récupérer le chemin complet d'un fichier
     * 
     * @param filePath Chemin relatif du fichier
     * @return Chemin complet
     */
    public Path getFilePath(String filePath) {
        return Paths.get(uploadDirectory, filePath);
    }

    /**
     * Vérifier si un fichier existe
     * 
     * @param filePath Chemin relatif du fichier
     * @return true si le fichier existe
     */
    public boolean fileExists(String filePath) {
        if (filePath == null || filePath.isEmpty()) {
            return false;
        }
        return Files.exists(Paths.get(uploadDirectory, filePath));
    }

    /**
     * Obtenir l'extension d'un fichier
     */
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }

    /**
     * Vérifier si l'extension est autorisée
     */
    private boolean isAllowedExtension(String extension) {
        for (String allowed : ALLOWED_EXTENSIONS) {
            if (allowed.equalsIgnoreCase(extension)) {
                return true;
            }
        }
        return false;
    }
}
