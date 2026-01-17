package com.intermediation.expertise.controller;

import com.intermediation.expertise.dto.CompetenceDTO;
import com.intermediation.expertise.dto.ExpertiseCompletDTO;
import com.intermediation.expertise.dto.ExpertiseDTO;
import com.intermediation.expertise.dto.ExpertPublicDTO;
import com.intermediation.expertise.dto.RechercheExpertRequest;
import com.intermediation.expertise.dto.RechercheExpertResponse;
import com.intermediation.expertise.security.SecurityService;
import com.intermediation.expertise.service.ExpertiseService;
import com.intermediation.expertise.service.RechercheExpertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expertise")
@RequiredArgsConstructor
public class ExpertiseController {

    private final ExpertiseService expertiseService;
    private final SecurityService securityService;
    private final RechercheExpertService rechercheExpertService;

    /**
     * Récupère l'expertise complète d'un utilisateur (compétences + langues)
     * L'utilisateurId est récupéré depuis le header X-User-Id propagé par le Gateway
     * Réservé aux Experts pour voir LEUR propre expertise
     */
    @GetMapping
    public ResponseEntity<ExpertiseCompletDTO> getExpertiseComplete(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {

        if (userIdHeader == null || userIdHeader.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        String utilisateurId = userIdHeader;

        // Vérification du rôle expert
        if (!securityService.isExpert()) {
            return ResponseEntity.status(403).build();
        }

        // Vérification ownership
        if (!securityService.isOwner(utilisateurId)) {
            return ResponseEntity.status(403).build();
        }

        ExpertiseCompletDTO expertise = expertiseService.getExpertiseComplete(utilisateurId);
        return ResponseEntity.ok(expertise);
    }

    /**
     * Récupère toutes les compétences d'un utilisateur
     * Réservé aux Experts pour voir LEURS compétences
     */
    @GetMapping("/competences")
    public ResponseEntity<List<CompetenceDTO>> getCompetences(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {

        if (userIdHeader == null || userIdHeader.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        String utilisateurId = userIdHeader;

        // Vérification du rôle expert
        if (!securityService.isExpert()) {
            return ResponseEntity.status(403).build();
        }

        // Vérification ownership
        if (!securityService.isOwner(utilisateurId)) {
            return ResponseEntity.status(403).build();
        }

        List<CompetenceDTO> competences = expertiseService.getCompetences(utilisateurId);
        return ResponseEntity.ok(competences);
    }

    /**
     * Récupère les compétences favorites d'un utilisateur
     * Réservé aux Experts pour voir LEURS compétences favorites
     */
    @GetMapping("/competences/favorites")
    public ResponseEntity<List<CompetenceDTO>> getCompetencesFavorites(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {

        if (userIdHeader == null || userIdHeader.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        String utilisateurId = userIdHeader;

        // Vérification du rôle expert
        if (!securityService.isExpert()) {
            return ResponseEntity.status(403).build();
        }

        // Vérification ownership
        if (!securityService.isOwner(utilisateurId)) {
            return ResponseEntity.status(403).build();
        }

        List<CompetenceDTO> competences = expertiseService.getCompetencesFavorites(utilisateurId);
        return ResponseEntity.ok(competences);
    }

    /**
     * Ajoute une compétence
     * Réservé aux Experts pour ajouter à LEURS compétences
     */
    @PostMapping("/competences")
    public ResponseEntity<CompetenceDTO> ajouterCompetence(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestBody CompetenceDTO competenceDTO) {

        if (userIdHeader == null || userIdHeader.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        String utilisateurId = userIdHeader;

        // Vérification du rôle expert
        if (!securityService.isExpert()) {
            return ResponseEntity.status(403).build();
        }

        // Vérification ownership
        if (!securityService.isOwner(utilisateurId)) {
            return ResponseEntity.status(403).build();
        }

        CompetenceDTO created = expertiseService.ajouterCompetence(utilisateurId, competenceDTO);
        return ResponseEntity.ok(created);
    }

    /**
     * Met à jour une compétence
     * Réservé aux Experts pour modifier LEURS compétences
     */
    @PutMapping("/competences/{id}")
    public ResponseEntity<CompetenceDTO> updateCompetence(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @PathVariable Long id,
            @RequestBody CompetenceDTO competenceDTO) {

        if (userIdHeader == null || userIdHeader.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        String utilisateurId = userIdHeader;

        // Vérification du rôle expert
        if (!securityService.isExpert()) {
            return ResponseEntity.status(403).build();
        }

        // Vérification ownership
        if (!securityService.isOwner(utilisateurId)) {
            return ResponseEntity.status(403).build();
        }

        CompetenceDTO updated = expertiseService.updateCompetence(utilisateurId, id, competenceDTO);
        return ResponseEntity.ok(updated);
    }

    /**
     * Supprime une compétence
     * Réservé aux Experts pour supprimer LEURS compétences
     */
    @DeleteMapping("/competences/{id}")
    public ResponseEntity<Void> supprimerCompetence(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @PathVariable Long id) {

        if (userIdHeader == null || userIdHeader.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        String utilisateurId = userIdHeader;

        // Vérification du rôle expert
        if (!securityService.isExpert()) {
            return ResponseEntity.status(403).build();
        }

        // Vérification ownership
        if (!securityService.isOwner(utilisateurId)) {
            return ResponseEntity.status(403).build();
        }

        expertiseService.supprimerCompetence(utilisateurId, id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Récupère une compétence spécifique d'un utilisateur (pour les évaluateurs)
     */
    @GetMapping("/utilisateur/{utilisateurId}/competence/{competenceId}")
    public ResponseEntity<CompetenceDTO> getCompetenceUtilisateur(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @PathVariable String utilisateurId,
            @PathVariable Long competenceId) {
        
        if (userIdHeader == null || userIdHeader.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        CompetenceDTO competence = expertiseService.getCompetenceById(utilisateurId, competenceId);
        return ResponseEntity.ok(competence);
    }

    /**
     * Récupère l'expertise de l'utilisateur connecté (sans les compétences)
     * Réservé aux Experts pour voir LEUR expertise
     */
    @GetMapping("/mon-expertise")
    public ResponseEntity<ExpertiseDTO> getMonExpertise(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {

        if (userIdHeader == null || userIdHeader.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        String utilisateurId = userIdHeader;

        // Vérification du rôle expert
        if (!securityService.isExpert()) {
            return ResponseEntity.status(403).build();
        }

        // Vérification ownership
        if (!securityService.isOwner(utilisateurId)) {
            return ResponseEntity.status(403).build();
        }

        ExpertiseDTO expertise = expertiseService.getMonExpertise(utilisateurId);
        return ResponseEntity.ok(expertise);
    }

    /**
     * Crée ou met à jour l'expertise de l'utilisateur connecté
     * Réservé aux Experts pour créer/modifier LEUR expertise
     */
    @PostMapping("/mon-expertise")
    public ResponseEntity<ExpertiseDTO> createOrUpdateExpertise(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestBody ExpertiseDTO expertiseDTO) {

        if (userIdHeader == null || userIdHeader.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        String utilisateurId = userIdHeader;

        // Vérification du rôle expert
        if (!securityService.isExpert()) {
            return ResponseEntity.status(403).build();
        }

        // Vérification ownership
        if (!securityService.isOwner(utilisateurId)) {
            return ResponseEntity.status(403).build();
        }

        ExpertiseDTO saved = expertiseService.createOrUpdateExpertise(utilisateurId, expertiseDTO);
        return ResponseEntity.ok(saved);
    }

    /**
     * Publie l'expertise (la rend visible sur l'accueil)
     * Réservé aux Experts pour publier LEUR expertise
     */
    @PutMapping("/mon-expertise/publier")
    public ResponseEntity<ExpertiseDTO> publierExpertise(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {

        if (userIdHeader == null || userIdHeader.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        String utilisateurId = userIdHeader;

        // Vérification du rôle expert
        if (!securityService.isExpert()) {
            return ResponseEntity.status(403).build();
        }

        // Vérification ownership
        if (!securityService.isOwner(utilisateurId)) {
            return ResponseEntity.status(403).build();
        }

        ExpertiseDTO expertise = expertiseService.publierExpertise(utilisateurId);
        return ResponseEntity.ok(expertise);
    }

    /**
     * Dépublie l'expertise (la retire de l'accueil)
     * Réservé aux Experts pour dépublier LEUR expertise
     */
    @PutMapping("/mon-expertise/depublier")
    public ResponseEntity<ExpertiseDTO> depublierExpertise(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {

        if (userIdHeader == null || userIdHeader.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        String utilisateurId = userIdHeader;

        // Vérification du rôle expert
        if (!securityService.isExpert()) {
            return ResponseEntity.status(403).build();
        }

        // Vérification ownership
        if (!securityService.isOwner(utilisateurId)) {
            return ResponseEntity.status(403).build();
        }

        ExpertiseDTO expertise = expertiseService.depublierExpertise(utilisateurId);
        return ResponseEntity.ok(expertise);
    }

    /**
     * Récupère toutes les expertises publiées (endpoint public pour l'accueil)
     */
    @GetMapping("/public/expertises")
    public ResponseEntity<List<ExpertiseDTO>> getExpertisesPubliees() {
        List<ExpertiseDTO> expertises = expertiseService.getExpertisesPubliees();
        return ResponseEntity.ok(expertises);
    }

    /**
     * Récupère tous les experts publiés avec leurs compétences (endpoint public pour le feed)
     */
    @GetMapping("/public/experts")
    public ResponseEntity<List<ExpertPublicDTO>> getExpertsPublies() {
        List<ExpertPublicDTO> experts = expertiseService.getExpertsPublies();
        return ResponseEntity.ok(experts);
    }

    /**
     * Récupère toutes les expertises publiées (endpoint public)
     */
    @GetMapping("/publiques")
    public ResponseEntity<List<ExpertiseDTO>> getExpertisesPubliques() {
        List<ExpertiseDTO> expertises = expertiseService.getExpertisesPubliees();
        return ResponseEntity.ok(expertises);
    }

    /**
     * Recherche d'expertises avec critères multiples (endpoint public)
     */
    @GetMapping("/recherche")
    public ResponseEntity<List<ExpertiseDTO>> rechercherExpertises(
            @RequestParam(required = false) String terme,
            @RequestParam(required = false) Long villeId,
            @RequestParam(required = false) Long paysId,
            @RequestParam(required = false) Boolean disponible) {

        List<ExpertiseDTO> expertises = expertiseService.rechercherExpertises(terme, villeId, paysId, disponible);
        return ResponseEntity.ok(expertises);
    }

    /**
     * Recherche avancée d'experts avec Full-Text Search et filtres multiples (endpoint public)
     *
     * Fonctionnalités:
     * - Recherche textuelle (titre, description, compétences, certifications)
     * - Filtres: localisation, disponibilité, expérience, tarif, badges
     * - Tri: score, expérience, tarif, popularité
     * - Pagination
     * - Facettes pour affiner la recherche
     */
    @PostMapping("/public/recherche-avancee")
    public ResponseEntity<RechercheExpertResponse> rechercheAvancee(
            @RequestBody RechercheExpertRequest request) {

        RechercheExpertResponse response = rechercheExpertService.rechercherExperts(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Expertise service is running");
    }
}
