package com.intermediation.expertise.repository;

import com.intermediation.expertise.model.DemandeReconnaissanceCompetence;
import com.intermediation.expertise.model.DemandeReconnaissanceCompetence.StatutDemande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DemandeReconnaissanceRepository extends JpaRepository<DemandeReconnaissanceCompetence, Long> {

    // Recherches par utilisateur (Expert)
    List<DemandeReconnaissanceCompetence> findByUtilisateurIdOrderByDateCreationDesc(String utilisateurId);
    
    List<DemandeReconnaissanceCompetence> findByUtilisateurIdAndStatutOrderByDateCreationDesc(
        String utilisateurId, StatutDemande statut);
    
    Optional<DemandeReconnaissanceCompetence> findByIdAndUtilisateurId(Long id, String utilisateurId);
    
    // Recherches par compétence
    List<DemandeReconnaissanceCompetence> findByCompetenceIdOrderByDateCreationDesc(Long competenceId);
    
    Optional<DemandeReconnaissanceCompetence> findByUtilisateurIdAndCompetenceIdAndStatut(
        String utilisateurId, Long competenceId, StatutDemande statut);
    
    // Recherches pour les traitants
    List<DemandeReconnaissanceCompetence> findByStatutOrderByPrioriteDescDateCreationAsc(StatutDemande statut);
    
    List<DemandeReconnaissanceCompetence> findByTraitantIdOrderByDateDerniereModificationDesc(String traitantId);
    
    List<DemandeReconnaissanceCompetence> findByTraitantIdAndStatutOrderByDateDerniereModificationDesc(
        String traitantId, StatutDemande statut);
    
    List<DemandeReconnaissanceCompetence> findByTraitantIdAndStatutIn(
        String traitantId, List<StatutDemande> statuts);
    
    // Recherches par statut
    List<DemandeReconnaissanceCompetence> findByStatutInOrderByDateCreationDesc(List<StatutDemande> statuts);
    
    // Compter les demandes
    long countByStatut(StatutDemande statut);
    
    long countByTraitantIdAndStatut(String traitantId, StatutDemande statut);

    long countByTraitantIdAndStatutIn(String traitantId, List<StatutDemande> statuts);

    long countByUtilisateurIdAndStatut(String utilisateurId, StatutDemande statut);
    
    // Recherches avancées avec requêtes personnalisées
    @Query("SELECT d FROM DemandeReconnaissanceCompetence d " +
           "WHERE d.statut IN :statuts " +
           "AND (d.traitantId IS NULL OR d.traitantId = :traitantId) " +
           "ORDER BY d.priorite DESC, d.dateCreation ASC")
    List<DemandeReconnaissanceCompetence> findDemandesDisponiblesPourTraitant(
        @Param("statuts") List<StatutDemande> statuts,
        @Param("traitantId") String traitantId);
    
    @Query("SELECT d FROM DemandeReconnaissanceCompetence d " +
           "WHERE d.dateCreation BETWEEN :dateDebut AND :dateFin " +
           "ORDER BY d.dateCreation DESC")
    List<DemandeReconnaissanceCompetence> findByDateCreationBetween(
        @Param("dateDebut") LocalDateTime dateDebut,
        @Param("dateFin") LocalDateTime dateFin);
    
    // Statistiques
    @Query("SELECT d.statut, COUNT(d) FROM DemandeReconnaissanceCompetence d " +
           "GROUP BY d.statut")
    List<Object[]> countByStatutGrouped();
    
    @Query("SELECT d.traitantId, COUNT(d) FROM DemandeReconnaissanceCompetence d " +
           "WHERE d.traitantId IS NOT NULL " +
           "GROUP BY d.traitantId")
    List<Object[]> countByTraitantGrouped();
}
