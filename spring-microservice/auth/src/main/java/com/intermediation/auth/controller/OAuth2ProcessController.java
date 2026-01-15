package com.intermediation.auth.controller;

import com.intermediation.auth.dto.OAuth2UserInfoDTO;
import com.intermediation.auth.model.Utilisateur;
import com.intermediation.auth.service.AuthService;
import io.camunda.zeebe.client.ZeebeClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller pour traiter les authentifications OAuth2 provenant du Gateway
 */
@RestController
@RequestMapping("/api/auth/oauth2")
public class OAuth2ProcessController {

    private final AuthService authService;
    private final ZeebeClient zeebeClient;

    public OAuth2ProcessController(AuthService authService, ZeebeClient zeebeClient) {
        this.authService = authService;
        this.zeebeClient = zeebeClient;
    }

    /**
     * Endpoint appelé par le Gateway après une authentification OAuth2 réussie
     * Crée ou met à jour l'utilisateur dans la base de données
     * Complète également la tâche BPMN "S'authentifier" si instanceKey est fourni
     */
    @PostMapping("/process")
    public ResponseEntity<?> processOAuth2Login(@RequestBody Map<String, Object> requestBody) {
        String email = (String) requestBody.get("email");
        String instanceKey = (String) requestBody.get("instanceKey");
        String visiteurId = (String) requestBody.get("visiteurId");
        
        System.out.println("🔄 [AUTH API] Traitement authentification OAuth2 pour: " + email);
        if (instanceKey != null) {
            System.out.println("🔍 [AUTH API] instanceKey BPMN: " + instanceKey);
        }
        if (visiteurId != null) {
            System.out.println("🔍 [AUTH API] visiteurId BPMN: " + visiteurId);
        }

        try {
            // Convertir la Map en DTO
            OAuth2UserInfoDTO userInfo = new OAuth2UserInfoDTO();
            userInfo.setEmail(email);
            userInfo.setSubject((String) requestBody.get("subject"));
            userInfo.setGivenName((String) requestBody.get("givenName"));
            userInfo.setFamilyName((String) requestBody.get("familyName"));
            userInfo.setFullName((String) requestBody.get("fullName"));
            userInfo.setPicture((String) requestBody.get("picture"));
            userInfo.setIssuer((String) requestBody.get("issuer"));
            userInfo.setIdentityProvider((String) requestBody.get("identityProvider"));

            // Traiter l'utilisateur OAuth2 (créer ou mettre à jour)
            Utilisateur utilisateur = authService.traiterAuthOAuth2(userInfo);

            System.out.println("✅ [AUTH API] Utilisateur traité: " + utilisateur.getEmail());
            System.out.println("🔍 [AUTH API] Profil complet: " + utilisateur.getProfilComplet());

            // Si visiteurId est fourni, envoyer le message BPMN d'authentification réussie
            if (visiteurId != null && !visiteurId.isBlank()) {
                envoyerMessageAuthentificationReussie(visiteurId, utilisateur.getId(), utilisateur.getEmail());
            }

            // Retourner les infos de l'utilisateur
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("userId", utilisateur.getId());
            response.put("email", utilisateur.getEmail());
            response.put("profilComplet", utilisateur.getProfilComplet() != null && utilisateur.getProfilComplet());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ [AUTH API ERROR] Erreur lors du traitement OAuth2: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Erreur lors du traitement de l'authentification"));
        }
    }

    /**
     * Envoie un message d'authentification réussie au processus BPMN
     * Le message déclenchera l'événement intermédiaire "Attendre authentification"
     * Corrélation par visiteurId
     */
    private void envoyerMessageAuthentificationReussie(String visiteurId, String utilisateurId, String email) {
        try {
            System.out.println("📤 [AUTH API] Envoi message 'msg_authentification_reussie' via Zeebe...");
            System.out.println("   Corrélation: visiteurId=" + visiteurId);
            
            // Préparer les variables à envoyer avec le message
            Map<String, Object> variables = new HashMap<>();
            variables.put("authentifie", true);
            variables.put("utilisateurId", utilisateurId);
            variables.put("email", email);
            
            // Envoyer le message corrélé par visiteurId
            zeebeClient.newPublishMessageCommand()
                .messageName("msg_authentification_reussie")
                .correlationKey(visiteurId)
                .variables(variables)
                .send()
                .join();
            
            System.out.println("✅ [AUTH API] Message BPMN 'msg_authentification_reussie' envoyé avec succès");
            System.out.println("   - visiteurId (correlation): " + visiteurId);
            System.out.println("   - authentifie: true");
            System.out.println("   - utilisateurId: " + utilisateurId);
            System.out.println("   - email: " + email);
            
        } catch (Exception e) {
            System.err.println("❌ [AUTH API] Erreur lors de l'envoi du message BPMN: " + e.getMessage());
            e.printStackTrace();
            // Ne pas échouer l'authentification si l'envoi du message BPMN échoue
        }
    }
}
