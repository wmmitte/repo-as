package com.intermediation.expertise.repository;

import com.intermediation.expertise.model.BadgeCompetence;
import com.intermediation.expertise.model.BadgeCompetence.NiveauCertification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BadgeCompetenceRepository extends JpaRepository<BadgeCompetence, Long> {

    // Recherches par utilisateur
    List<BadgeCompetence> findByUtilisateurIdOrderByOrdreAffichageAscDateObtentionDesc(String utilisateurId);
    
    List<BadgeCompetence> findByUtilisateurIdAndEstActifOrderByOrdreAffichageAscDateObtentionDesc(
        String utilisateurId, Boolean estActif);
    
    List<BadgeCompetence> findByUtilisateurIdAndEstPublicAndEstActifOrderByOrdreAffichageAscDateObtentionDesc(
        String utilisateurId, Boolean estPublic, Boolean estActif);
    
    // Recherches par compétence
    List<BadgeCompetence> findByCompetenceIdAndEstActifOrderByDateObtentionDesc(Long competenceId, Boolean estActif);
    
    Optional<BadgeCompetence> findByCompetenceIdAndUtilisateurIdAndEstActif(
        Long competenceId, String utilisateurId, Boolean estActif);

    // Recherches par niveau
    List<BadgeCompetence> findByNiveauCertificationAndEstActifOrderByDateObtentionDesc(
        NiveauCertification niveau, Boolean estActif);
    
    List<BadgeCompetence> findByUtilisateurIdAndNiveauCertificationAndEstActifOrderByDateObtentionDesc(
        String utilisateurId, NiveauCertification niveau, Boolean estActif);
    
    // Recherches par demande de reconnaissance
    Optional<BadgeCompetence> findByDemandeReconnaissanceId(Long demandeReconnaissanceId);
    
    // Vérifications d'existence
    boolean existsByCompetenceIdAndUtilisateurIdAndEstActif(
        Long competenceId, String utilisateurId, Boolean estActif);
    
    // Compter les badges
    long countByUtilisateurIdAndEstActif(String utilisateurId, Boolean estActif);
    
    long countByUtilisateurIdAndNiveauCertificationAndEstActif(
        String utilisateurId, NiveauCertification niveau, Boolean estActif);
    
    // Badges expirés
    @Query("SELECT b FROM BadgeCompetence b " +
           "WHERE b.estActif = true " +
           "AND b.validitePermanente = false " +
           "AND b.dateExpiration < :maintenant")
    List<BadgeCompetence> findBadgesExpires(@Param("maintenant") LocalDateTime maintenant);
    
    // Statistiques
    @Query("SELECT b.niveauCertification, COUNT(b) FROM BadgeCompetence b " +
           "WHERE b.utilisateurId = :utilisateurId AND b.estActif = true " +
           "GROUP BY b.niveauCertification")
    List<Object[]> countByNiveauForUser(@Param("utilisateurId") String utilisateurId);
    
    @Query("SELECT b.niveauCertification, COUNT(b) FROM BadgeCompetence b " +
           "WHERE b.estActif = true " +
           "GROUP BY b.niveauCertification")
    List<Object[]> countByNiveauGlobal();
    
    // Badges récents
    @Query("SELECT b FROM BadgeCompetence b " +
           "WHERE b.utilisateurId = :utilisateurId " +
           "AND b.estActif = true " +
           "ORDER BY b.dateObtention DESC")
    List<BadgeCompetence> findRecentBadges(@Param("utilisateurId") String utilisateurId);
    
    // Désactiver les badges actifs pour une compétence (pour la progression)
    // Utilisation de SQL natif pour garantir l'exécution immédiate
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "UPDATE badges_competence SET est_actif = false " +
           "WHERE competence_id = :competenceId " +
           "AND utilisateur_id = :utilisateurId " +
           "AND est_actif = true", 
           nativeQuery = true)
    int desactiverBadgesActifs(
        @Param("competenceId") Long competenceId,
        @Param("utilisateurId") String utilisateurId);
}
