package com.intermediation.expertise.service;

import com.intermediation.expertise.dto.BadgeCompetenceDTO;
import com.intermediation.expertise.model.BadgeCompetence;
import com.intermediation.expertise.model.BadgeCompetence.NiveauCertification;
import com.intermediation.expertise.model.Competence;
import com.intermediation.expertise.model.CompetenceReference;
import com.intermediation.expertise.model.DemandeReconnaissanceCompetence;
import com.intermediation.expertise.repository.BadgeCompetenceRepository;
import com.intermediation.expertise.repository.CompetenceRepository;
import com.intermediation.expertise.repository.CompetenceReferenceRepository;
import com.intermediation.expertise.repository.DemandeReconnaissanceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service pour la gestion des badges de compétence
 */
@Service
public class BadgeService {

    private static final Logger logger = LoggerFactory.getLogger(BadgeService.class);

    @Autowired
    private BadgeCompetenceRepository badgeRepository;

    @Autowired
    private CompetenceRepository competenceRepository;

    @Autowired
    private CompetenceReferenceRepository competenceReferenceRepository;

    @Autowired
    private DemandeReconnaissanceRepository demandeRepository;

    // Auto-injection pour permettre les appels transactionnels depuis la même classe
    // @Lazy évite la dépendance circulaire
    @Autowired
    @org.springframework.context.annotation.Lazy
    private BadgeService self;

    /**
     * Désactive les badges actifs dans une transaction séparée (REQUIRES_NEW)
     * Cette méthode DOIT être dans une transaction séparée pour forcer le COMMIT
     * avant la création du nouveau badge
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void desactiverBadgesActifsDansNouvelleTransaction(Long competenceId, String utilisateurId) {
        logger.info("[TX NOUVELLE] Désactivation badges pour competenceId={}, utilisateurId={}", 
                   competenceId, utilisateurId);
        
        int badgesDesactives = badgeRepository.desactiverBadgesActifs(competenceId, utilisateurId);
        
        logger.info("[TX NOUVELLE] {} badge(s) désactivé(s) - transaction va se COMMIT", badgesDesactives);
    }

    /**
     * Attribuer un badge suite à une demande approuvée (validité permanente par défaut)
     * Gère également la progression : désactive l'ancien badge avant de créer le nouveau
     */
    @Transactional
    public BadgeCompetenceDTO attribuerBadge(DemandeReconnaissanceCompetence demande) {
        return attribuerBadge(demande, true, null);
    }

    /**
     * Attribuer un badge suite à une demande approuvée avec définition de la validité
     * Gère également la progression : désactive l'ancien badge avant de créer le nouveau
     * 
     * @param demande La demande de reconnaissance approuvée
     * @param validitePermanente True pour validité permanente, false pour validité limitée
     * @param dateExpiration Date d'expiration (obligatoire si validitePermanente = false)
     */
    @Transactional
    public BadgeCompetenceDTO attribuerBadge(DemandeReconnaissanceCompetence demande,
                                             Boolean validitePermanente,
                                             LocalDateTime dateExpiration) {
        logger.info("=== DÉBUT attribuerBadge pour competenceId={}, utilisateurId={} ===",
                   demande.getCompetenceId(), demande.getUtilisateurId());
        
        // Vérifier s'il existe déjà un badge actif
        boolean badgeActifExiste = badgeRepository.existsByCompetenceIdAndUtilisateurIdAndEstActif(
            demande.getCompetenceId(), 
            demande.getUtilisateurId(), 
            true
        );
        
        logger.info("Badge actif existe avant désactivation: {}", badgeActifExiste);
        
        // Désactiver les badges actifs dans une NOUVELLE transaction
        // REQUIRES_NEW force le COMMIT de la désactivation AVANT de continuer
        // IMPORTANT : Utiliser self (proxy Spring) au lieu de this pour que @Transactional fonctionne
        if (badgeActifExiste) {
            try {
                self.desactiverBadgesActifsDansNouvelleTransaction(
                    demande.getCompetenceId(), 
                    demande.getUtilisateurId()
                );
                logger.info("✓ Badges désactivés et transaction COMMIT-ée, prêt pour création nouveau badge");
                
                // Vérifier que la désactivation a bien fonctionné
                boolean badgeActifEncorePresent = badgeRepository.existsByCompetenceIdAndUtilisateurIdAndEstActif(
                    demande.getCompetenceId(), 
                    demande.getUtilisateurId(), 
                    true
                );
                
                if (badgeActifEncorePresent) {
                    logger.error("ERREUR: Badge actif toujours présent après désactivation!");
                    throw new RuntimeException("Impossible de désactiver le badge existant");
                }
                
                logger.info("✓ Vérification: aucun badge actif restant");
                
            } catch (Exception e) {
                logger.error("Erreur lors de la désactivation des badges: {}", e.getMessage(), e);
                throw new RuntimeException("Erreur lors de la désactivation du badge existant: " + e.getMessage());
            }
        } else {
            logger.info("Pas de badge actif existant, première certification pour cette compétence");
        }

        // Déterminer le niveau de certification basé sur le domaine de compétence
        NiveauCertification niveau = determinerNiveauCertification(demande.getCompetenceId());

        // Créer le nouveau badge
        BadgeCompetence badge = new BadgeCompetence(
            demande.getCompetenceId(),
            demande.getUtilisateurId(),
            niveau,
            demande.getId()
        );

        // Appliquer la validité
        if (validitePermanente != null && !validitePermanente && dateExpiration != null) {
            badge.definirExpiration(dateExpiration);
            logger.info("Badge avec validité limitée jusqu'au {}", dateExpiration);
        } else {
            logger.info("Badge avec validité permanente");
        }

        badge = badgeRepository.save(badge);

        logger.info("Badge {} (niveau {}) attribué à l'utilisateur {} pour la compétence {}", 
                    badge.getId(), niveau, badge.getUtilisateurId(), badge.getCompetenceId());

        BadgeCompetenceDTO dto = new BadgeCompetenceDTO(badge);
        
        // Enrichir avec le nom de la compétence
        competenceRepository.findById(badge.getCompetenceId())
                .ifPresent(c -> dto.setCompetenceNom(c.getNom()));

        return dto;
    }

    /**
     * Récupérer les badges d'un utilisateur
     */
    public List<BadgeCompetenceDTO> getMesBadges(String utilisateurId, Boolean actifSeulement) {
        List<BadgeCompetence> badges = actifSeulement 
            ? badgeRepository.findByUtilisateurIdAndEstActifOrderByOrdreAffichageAscDateObtentionDesc(utilisateurId, true)
            : badgeRepository.findByUtilisateurIdOrderByOrdreAffichageAscDateObtentionDesc(utilisateurId);

        return badges.stream()
                .map(badge -> {
                    BadgeCompetenceDTO dto = new BadgeCompetenceDTO(badge);
                    // Enrichir avec le nom de la compétence
                    competenceRepository.findById(badge.getCompetenceId())
                            .ifPresent(c -> dto.setCompetenceNom(c.getNom()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * Récupérer les badges publics d'un utilisateur
     */
    public List<BadgeCompetenceDTO> getBadgesPublics(String utilisateurId) {
        List<BadgeCompetence> badges = badgeRepository
                .findByUtilisateurIdAndEstPublicAndEstActifOrderByOrdreAffichageAscDateObtentionDesc(
                    utilisateurId, true, true);

        return badges.stream()
                .map(badge -> {
                    BadgeCompetenceDTO dto = new BadgeCompetenceDTO(badge);
                    // Enrichir avec le nom de la compétence
                    competenceRepository.findById(badge.getCompetenceId())
                            .ifPresent(c -> dto.setCompetenceNom(c.getNom()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * Récupérer un badge spécifique
     */
    public BadgeCompetenceDTO getBadge(Long badgeId) {
        BadgeCompetence badge = badgeRepository.findById(badgeId)
                .orElseThrow(() -> new RuntimeException("Badge non trouvé"));

        BadgeCompetenceDTO dto = new BadgeCompetenceDTO(badge);
        
        // Enrichir avec le nom de la compétence
        competenceRepository.findById(badge.getCompetenceId())
                .ifPresent(c -> dto.setCompetenceNom(c.getNom()));

        return dto;
    }

    /**
     * Révoquer un badge (admin uniquement)
     */
    @Transactional
    public void revoquerBadge(Long badgeId, String motif, String revoquePar) {
        BadgeCompetence badge = badgeRepository.findById(badgeId)
                .orElseThrow(() -> new RuntimeException("Badge non trouvé"));

        if (!badge.getEstActif()) {
            throw new RuntimeException("Ce badge est déjà révoqué");
        }

        badge.revoquer(motif, revoquePar);
        badgeRepository.save(badge);

        logger.info("Badge {} révoqué par {} : {}", badgeId, revoquePar, motif);
    }

    /**
     * Modifier la visibilité publique d'un badge
     */
    @Transactional
    public BadgeCompetenceDTO toggleVisibilitePublique(String utilisateurId, Long badgeId) {
        BadgeCompetence badge = badgeRepository.findById(badgeId)
                .orElseThrow(() -> new RuntimeException("Badge non trouvé"));

        if (!badge.getUtilisateurId().equals(utilisateurId)) {
            throw new RuntimeException("Ce badge ne vous appartient pas");
        }

        if (badge.getEstPublic()) {
            badge.rendrePrive();
        } else {
            badge.rendrePublic();
        }

        badge = badgeRepository.save(badge);

        logger.info("Visibilité du badge {} modifiée pour l'utilisateur {}", badgeId, utilisateurId);

        return new BadgeCompetenceDTO(badge);
    }

    /**
     * Définir l'ordre d'affichage des badges
     */
    @Transactional
    public void definirOrdreAffichage(String utilisateurId, List<Long> badgeIds) {
        for (int i = 0; i < badgeIds.size(); i++) {
            final int ordre = i;
            Long badgeId = badgeIds.get(i);
            badgeRepository.findById(badgeId).ifPresent(badge -> {
                if (badge.getUtilisateurId().equals(utilisateurId)) {
                    badge.setOrdreAffichage(ordre);
                    badgeRepository.save(badge);
                }
            });
        }

        logger.info("Ordre d'affichage des badges défini pour l'utilisateur {}", utilisateurId);
    }

    /**
     * Vérifier et désactiver les badges expirés
     */
    @Transactional
    public void desactiverBadgesExpires() {
        LocalDateTime maintenant = LocalDateTime.now();
        List<BadgeCompetence> badgesExpires = badgeRepository.findBadgesExpires(maintenant);

        if (badgesExpires.isEmpty()) {
            logger.info("Aucun badge expiré trouvé");
            return;
        }

        logger.info("Nombre de badges expirés trouvés: {}", badgesExpires.size());

        int compteur = 0;
        for (BadgeCompetence badge : badgesExpires) {
            badge.setEstActif(false);
            badgeRepository.save(badge);
            compteur++;
            logger.info("Badge #{} désactivé - ID: {}, Compétence: {}, Utilisateur: {}, Date expiration: {}",
                       compteur,
                       badge.getId(),
                       badge.getCompetenceId(),
                       badge.getUtilisateurId(),
                       badge.getDateExpiration());
        }

        logger.info("Total de {} badge(s) désactivé(s) avec succès", compteur);
    }

    /**
     * Compter les badges d'un utilisateur par niveau
     */
    public long countBadgesParNiveau(String utilisateurId, NiveauCertification niveau) {
        return badgeRepository.countByUtilisateurIdAndNiveauCertificationAndEstActif(utilisateurId, niveau, true);
    }

    /**
     * Compter le total des badges actifs d'un utilisateur
     */
    public long countBadgesActifs(String utilisateurId) {
        return badgeRepository.countByUtilisateurIdAndEstActif(utilisateurId, true);
    }

    /**
     * Déterminer le niveau de certification basé sur le domaine de compétence
     * Correspondance :
     * - SAVOIR → BRONZE
     * - SAVOIR_FAIRE → ARGENT
     * - SAVOIR_ETRE → ARGENT
     * - SAVOIR_AGIR → PLATINE
     */
    private NiveauCertification determinerNiveauCertification(Long competenceId) {
        // Récupérer la compétence
        Competence competence = competenceRepository.findById(competenceId)
                .orElseThrow(() -> new RuntimeException("Compétence non trouvée: " + competenceId));

        // Récupérer la compétence de référence
        if (competence.getCompetenceReferenceId() == null) {
            logger.warn("Compétence {} sans référence, niveau par défaut: BRONZE", competenceId);
            return NiveauCertification.BRONZE;
        }

        CompetenceReference competenceReference = competenceReferenceRepository
                .findById(competence.getCompetenceReferenceId())
                .orElseThrow(() -> new RuntimeException("Compétence de référence non trouvée: " + competence.getCompetenceReferenceId()));

        // Récupérer le domaine de compétence
        if (competenceReference.getDomaineCompetence() == null) {
            logger.error("Compétence de référence {} sans domaine de compétence défini", competence.getCompetenceReferenceId());
            throw new RuntimeException("Le domaine de compétence n'est pas défini pour cette compétence de référence");
        }

        String codeDomaineCompetence = competenceReference.getDomaineCompetence().getCode();
        logger.info("Domaine de compétence: {}", codeDomaineCompetence);

        // Mapper le domaine de compétence au niveau de badge
        NiveauCertification niveau;
        switch (codeDomaineCompetence) {
            case "SAVOIR":
                niveau = NiveauCertification.BRONZE;
                logger.info("SAVOIR → Badge BRONZE");
                break;
            case "SAVOIR_FAIRE":
                niveau = NiveauCertification.ARGENT;
                logger.info("SAVOIR_FAIRE → Badge ARGENT");
                break;
            case "SAVOIR_ETRE":
                niveau = NiveauCertification.ARGENT;
                logger.info("SAVOIR_ETRE → Badge ARGENT");
                break;
            case "SAVOIR_AGIR":
                niveau = NiveauCertification.PLATINE;
                logger.info("SAVOIR_AGIR → Badge PLATINE");
                break;
            default:
                logger.warn("Domaine de compétence inconnu: {}, niveau par défaut: BRONZE", codeDomaineCompetence);
                niveau = NiveauCertification.BRONZE;
        }

        return niveau;
    }
}
