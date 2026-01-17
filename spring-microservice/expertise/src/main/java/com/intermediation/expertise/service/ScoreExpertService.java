package com.intermediation.expertise.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.intermediation.expertise.model.BadgeCompetence;
import com.intermediation.expertise.model.BadgeCompetence.NiveauCertification;
import com.intermediation.expertise.model.Competence;
import com.intermediation.expertise.model.Expertise;
import com.intermediation.expertise.repository.BadgeCompetenceRepository;
import com.intermediation.expertise.repository.CompetenceRepository;
import com.intermediation.expertise.repository.ExpertiseRepository;
import com.intermediation.expertise.repository.ReseauExpertiseRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service de calcul du score de classement des experts.
 *
 * Le score global (0-100) est composé de:
 * - Score Certification (40%): basé sur les badges obtenus et certifiés
 * - Score Expérience (25%): basé sur les compétences déclarées
 * - Score Profil (15%): basé sur la complétude du profil
 * - Score Popularité (10%): basé sur le nombre de followers
 * - Score Activité (10%): basé sur la fraîcheur du profil
 */
@Service
public class ScoreExpertService {

    private static final Logger log = LoggerFactory.getLogger(ScoreExpertService.class);

    // Pondérations des différents scores (total = 100%)
    private static final double POIDS_CERTIFICATION = 0.40;
    private static final double POIDS_EXPERIENCE = 0.25;
    private static final double POIDS_PROFIL = 0.15;
    private static final double POIDS_POPULARITE = 0.10;
    private static final double POIDS_ACTIVITE = 0.10;

    // Points par niveau de badge
    private static final int POINTS_BRONZE = 10;
    private static final int POINTS_ARGENT = 25;
    private static final int POINTS_OR = 50;
    private static final int POINTS_PLATINE = 100;

    // Plafonds pour normalisation
    private static final int PLAFOND_POINTS_BADGES = 300; // ~3 badges OR ou 6 badges ARGENT
    private static final int PLAFOND_ANNEES_EXPERIENCE = 50; // Total toutes compétences
    private static final int PLAFOND_PROJETS = 100; // Total tous projets
    private static final int PLAFOND_FOLLOWERS = 50; // Nombre max de followers pour score max

    private final ExpertiseRepository expertiseRepository;
    private final CompetenceRepository competenceRepository;
    private final BadgeCompetenceRepository badgeCompetenceRepository;
    private final ReseauExpertiseRepository reseauExpertiseRepository;
    private final ObjectMapper objectMapper;

    public ScoreExpertService(
            ExpertiseRepository expertiseRepository,
            CompetenceRepository competenceRepository,
            BadgeCompetenceRepository badgeCompetenceRepository,
            ReseauExpertiseRepository reseauExpertiseRepository) {
        this.expertiseRepository = expertiseRepository;
        this.competenceRepository = competenceRepository;
        this.badgeCompetenceRepository = badgeCompetenceRepository;
        this.reseauExpertiseRepository = reseauExpertiseRepository;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Calcule et met à jour le score d'un expert spécifique
     */
    @Transactional
    public void calculerEtMettreAJourScore(String utilisateurId) {
        log.info("Calcul du score pour l'utilisateur: {}", utilisateurId);

        Expertise expertise = expertiseRepository.findByUtilisateurId(utilisateurId)
                .orElse(null);

        if (expertise == null) {
            log.warn("Expertise non trouvée pour l'utilisateur: {}", utilisateurId);
            return;
        }

        // Récupérer les données nécessaires
        List<Competence> competences = competenceRepository.findByUtilisateurId(utilisateurId);
        List<BadgeCompetence> badges = badgeCompetenceRepository
                .findByUtilisateurIdAndEstActifOrderByOrdreAffichageAscDateObtentionDesc(utilisateurId, true);
        long nombreFollowers = reseauExpertiseRepository.countByExpertId(utilisateurId);

        // Calculer les scores individuels
        double scoreCertification = calculerScoreCertification(badges);
        double scoreExperience = calculerScoreExperience(competences);
        double scoreProfil = calculerScoreProfil(expertise, competences);
        double scorePopularite = calculerScorePopularite(nombreFollowers);
        double scoreActivite = calculerScoreActivite(expertise);

        // Calculer le score global pondéré
        double scoreGlobal = (scoreCertification * POIDS_CERTIFICATION)
                + (scoreExperience * POIDS_EXPERIENCE)
                + (scoreProfil * POIDS_PROFIL)
                + (scorePopularite * POIDS_POPULARITE)
                + (scoreActivite * POIDS_ACTIVITE);

        // Arrondir à 2 décimales
        BigDecimal scoreGlobalBD = BigDecimal.valueOf(scoreGlobal)
                .setScale(2, RoundingMode.HALF_UP);

        // Construire le détail des scores
        Map<String, Object> details = new HashMap<>();
        details.put("certification", Map.of(
                "score", round(scoreCertification),
                "poids", POIDS_CERTIFICATION,
                "contribution", round(scoreCertification * POIDS_CERTIFICATION),
                "nombreBadges", badges.size()
        ));
        details.put("experience", Map.of(
                "score", round(scoreExperience),
                "poids", POIDS_EXPERIENCE,
                "contribution", round(scoreExperience * POIDS_EXPERIENCE),
                "nombreCompetences", competences.size()
        ));
        details.put("profil", Map.of(
                "score", round(scoreProfil),
                "poids", POIDS_PROFIL,
                "contribution", round(scoreProfil * POIDS_PROFIL)
        ));
        details.put("popularite", Map.of(
                "score", round(scorePopularite),
                "poids", POIDS_POPULARITE,
                "contribution", round(scorePopularite * POIDS_POPULARITE),
                "nombreFollowers", nombreFollowers
        ));
        details.put("activite", Map.of(
                "score", round(scoreActivite),
                "poids", POIDS_ACTIVITE,
                "contribution", round(scoreActivite * POIDS_ACTIVITE)
        ));
        details.put("scoreGlobal", scoreGlobalBD.doubleValue());
        details.put("dateCalcul", LocalDateTime.now().toString());

        // Sérialiser les détails en JSON
        String scoreDetailsJson;
        try {
            scoreDetailsJson = objectMapper.writeValueAsString(details);
        } catch (Exception e) {
            log.error("Erreur lors de la sérialisation des détails du score", e);
            scoreDetailsJson = "{}";
        }

        // Mettre à jour l'expertise
        expertise.setScoreGlobal(scoreGlobalBD);
        expertise.setScoreDetails(scoreDetailsJson);
        expertise.setDateCalculScore(LocalDateTime.now());

        expertiseRepository.save(expertise);

        log.info("Score calculé pour {}: {} (Cert:{}, Exp:{}, Profil:{}, Pop:{}, Act:{})",
                utilisateurId, scoreGlobalBD,
                round(scoreCertification), round(scoreExperience),
                round(scoreProfil), round(scorePopularite), round(scoreActivite));
    }

    /**
     * Recalcule les scores de tous les experts publiés
     */
    @Transactional
    public void recalculerTousLesScores() {
        log.info("Début du recalcul de tous les scores...");

        List<Expertise> expertises = expertiseRepository.findAll();
        int total = expertises.size();
        int traites = 0;

        for (Expertise expertise : expertises) {
            try {
                calculerEtMettreAJourScore(expertise.getUtilisateurId());
                traites++;
            } catch (Exception e) {
                log.error("Erreur lors du calcul du score pour {}: {}",
                        expertise.getUtilisateurId(), e.getMessage());
            }
        }

        log.info("Recalcul terminé: {}/{} scores mis à jour", traites, total);
    }

    /**
     * Recalcule le score de manière asynchrone (pour ne pas bloquer l'utilisateur)
     */
    @Async
    public void calculerScoreAsync(String utilisateurId) {
        calculerEtMettreAJourScore(utilisateurId);
    }

    // ======================== MÉTHODES DE CALCUL PRIVÉES ========================

    /**
     * Score de certification (0-100)
     * Basé sur les badges certifiés avec pondération par niveau
     */
    private double calculerScoreCertification(List<BadgeCompetence> badges) {
        if (badges.isEmpty()) {
            return 0;
        }

        int totalPoints = 0;
        for (BadgeCompetence badge : badges) {
            if (badge.estValide()) {
                totalPoints += getPointsPourNiveau(badge.getNiveauCertification());
            }
        }

        // Normaliser sur 100 avec un plafond
        return Math.min(100, (totalPoints * 100.0) / PLAFOND_POINTS_BADGES);
    }

    /**
     * Score d'expérience (0-100)
     * Basé sur les compétences déclarées: années, projets, niveau de maîtrise
     */
    private double calculerScoreExperience(List<Competence> competences) {
        if (competences.isEmpty()) {
            return 0;
        }

        int totalAnneesExperience = 0;
        int totalProjets = 0;
        double sommeNiveaux = 0;

        for (Competence comp : competences) {
            if (comp.getAnneesExperience() != null) {
                totalAnneesExperience += comp.getAnneesExperience();
            }
            if (comp.getNombreProjets() != null) {
                totalProjets += comp.getNombreProjets();
            }
            if (comp.getNiveauMaitrise() != null) {
                sommeNiveaux += comp.getNiveauMaitrise();
            }
        }

        double moyenneNiveau = sommeNiveaux / competences.size(); // 1-5

        // Calculer les sous-scores (chacun sur 100)
        double scoreAnnees = Math.min(100, (totalAnneesExperience * 100.0) / PLAFOND_ANNEES_EXPERIENCE);
        double scoreProjets = Math.min(100, (totalProjets * 100.0) / PLAFOND_PROJETS);
        double scoreNiveau = (moyenneNiveau / 5.0) * 100; // Niveau max = 5

        // Moyenne pondérée: niveau (40%), années (35%), projets (25%)
        return (scoreNiveau * 0.40) + (scoreAnnees * 0.35) + (scoreProjets * 0.25);
    }

    /**
     * Score de profil complet (0-100)
     * Basé sur la complétude des informations du profil
     */
    private double calculerScoreProfil(Expertise expertise, List<Competence> competences) {
        double score = 0;

        // Photo de profil: 20 points
        if (expertise.getPhotoUrl() != null && !expertise.getPhotoUrl().isEmpty()) {
            score += 20;
        }

        // Description complète (> 100 caractères): 25 points
        if (expertise.getDescription() != null && expertise.getDescription().length() > 100) {
            score += 25;
        } else if (expertise.getDescription() != null && !expertise.getDescription().isEmpty()) {
            score += 10; // Description courte
        }

        // Titre professionnel: 15 points
        if (expertise.getTitre() != null && !expertise.getTitre().isEmpty()) {
            score += 15;
        }

        // Localisation renseignée: 15 points
        if (expertise.getVille() != null) {
            score += 15;
        }

        // Disponibilité active: 5 points
        if (Boolean.TRUE.equals(expertise.getDisponible())) {
            score += 5;
        }

        // Nombre de compétences (max 6): jusqu'à 20 points
        int nbCompetences = Math.min(competences.size(), 6);
        score += (nbCompetences / 6.0) * 20;

        return Math.min(100, score);
    }

    /**
     * Score de popularité (0-100)
     * Basé sur le nombre de followers
     */
    private double calculerScorePopularite(long nombreFollowers) {
        if (nombreFollowers == 0) {
            return 0;
        }
        return Math.min(100, (nombreFollowers * 100.0) / PLAFOND_FOLLOWERS);
    }

    /**
     * Score d'activité (0-100)
     * Basé sur la fraîcheur du profil (dernière modification)
     */
    private double calculerScoreActivite(Expertise expertise) {
        LocalDateTime derniereModification = expertise.getDateModification();
        if (derniereModification == null) {
            derniereModification = expertise.getDateCreation();
        }

        if (derniereModification == null) {
            return 0;
        }

        long joursDepuisModification = ChronoUnit.DAYS.between(derniereModification, LocalDateTime.now());

        if (joursDepuisModification < 30) {
            return 100; // Très actif
        } else if (joursDepuisModification < 90) {
            return 70; // Actif
        } else if (joursDepuisModification < 180) {
            return 40; // Moyennement actif
        } else if (joursDepuisModification < 365) {
            return 20; // Peu actif
        } else {
            return 5; // Inactif mais existe
        }
    }

    // ======================== MÉTHODES UTILITAIRES ========================

    private int getPointsPourNiveau(NiveauCertification niveau) {
        return switch (niveau) {
            case BRONZE -> POINTS_BRONZE;
            case ARGENT -> POINTS_ARGENT;
            case OR -> POINTS_OR;
            case PLATINE -> POINTS_PLATINE;
        };
    }

    private double round(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
