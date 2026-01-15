package com.intermediation.auth.controller;

import com.intermediation.auth.dto.UtilisateurDTO;
import com.intermediation.auth.service.UtilisateurService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur pour gérer les utilisateurs
 */
@RestController
@RequestMapping("/api/utilisateurs")
public class UtilisateurController {

    private static final Logger logger = LoggerFactory.getLogger(UtilisateurController.class);

    @Autowired
    private UtilisateurService utilisateurService;

    /**
     * Récupérer les utilisateurs ayant un rôle spécifique
     * 
     * @param role Le nom du rôle (ex: RH, MANAGER, EXPERT)
     * @return Liste des utilisateurs ayant ce rôle
     */
    @GetMapping("/role/{role}")
    public ResponseEntity<List<UtilisateurDTO>> getUtilisateursByRole(@PathVariable String role) {
        logger.info("📞 Requête reçue pour récupérer les utilisateurs avec le rôle: {}", role);
        
        try {
            List<UtilisateurDTO> utilisateurs = utilisateurService.getUtilisateursByRole(role);
            
            logger.info("✅ Retour de {} utilisateurs avec le rôle '{}'", utilisateurs.size(), role);
            return ResponseEntity.ok(utilisateurs);
            
        } catch (Exception e) {
            logger.error("❌ Erreur lors de la récupération des utilisateurs par rôle: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Récupérer un utilisateur par son ID
     *
     * @param userId L'ID de l'utilisateur dans Keycloak
     * @return Les informations de l'utilisateur
     */
    @GetMapping("/{userId}")
    public ResponseEntity<UtilisateurDTO> getUtilisateurById(@PathVariable String userId) {
        logger.info("📞 Requête reçue pour récupérer l'utilisateur avec ID: {}", userId);

        try {
            UtilisateurDTO utilisateur = utilisateurService.getUtilisateurById(userId);

            if (utilisateur != null) {
                logger.info("✅ Utilisateur trouvé: {}", utilisateur.getEmail());
                return ResponseEntity.ok(utilisateur);
            } else {
                logger.warn("⚠️ Utilisateur non trouvé avec ID: {}", userId);
                return ResponseEntity.notFound().build();
            }

        } catch (Exception e) {
            logger.error("❌ Erreur lors de la récupération de l'utilisateur: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Récupérer tous les utilisateurs (pour debug/admin)
     */
    @GetMapping
    public ResponseEntity<String> getAllUtilisateurs() {
        return ResponseEntity.ok("Endpoint pour récupérer tous les utilisateurs - À implémenter si nécessaire");
    }
}
