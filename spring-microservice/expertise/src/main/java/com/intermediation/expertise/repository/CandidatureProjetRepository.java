package com.intermediation.expertise.repository;

import com.intermediation.expertise.model.CandidatureProjet;
import com.intermediation.expertise.model.CandidatureProjet.StatutCandidature;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CandidatureProjetRepository extends JpaRepository<CandidatureProjet, Long> {

    // Candidatures d'un expert
    List<CandidatureProjet> findByExpertIdOrderByDateCreationDesc(UUID expertId);

    Page<CandidatureProjet> findByExpertId(UUID expertId, Pageable pageable);

    List<CandidatureProjet> findByExpertIdAndStatut(UUID expertId, StatutCandidature statut);

    // Candidatures sur un projet
    List<CandidatureProjet> findByProjetIdOrderByDateCreationDesc(Long projetId);

    List<CandidatureProjet> findByProjetIdAndStatut(Long projetId, StatutCandidature statut);

    // Candidatures sur une tâche
    List<CandidatureProjet> findByTacheIdOrderByDateCreationDesc(Long tacheId);

    List<CandidatureProjet> findByTacheIdAndStatut(Long tacheId, StatutCandidature statut);

    // Vérifier si expert a déjà candidaté
    boolean existsByProjetIdAndExpertIdAndStatutNotIn(Long projetId, UUID expertId,
                                                       List<StatutCandidature> statutsExclus);

    boolean existsByTacheIdAndExpertIdAndStatutNotIn(Long tacheId, UUID expertId,
                                                      List<StatutCandidature> statutsExclus);

    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END " +
           "FROM CandidatureProjet c " +
           "WHERE c.projet.id = :projetId AND c.expertId = :expertId " +
           "AND c.tache IS NULL AND c.statut NOT IN ('REFUSEE', 'RETIREE')")
    boolean existsCandidatureActiveProjet(@Param("projetId") Long projetId,
                                           @Param("expertId") UUID expertId);

    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END " +
           "FROM CandidatureProjet c " +
           "WHERE c.tache.id = :tacheId AND c.expertId = :expertId " +
           "AND c.statut NOT IN ('REFUSEE', 'RETIREE')")
    boolean existsCandidatureActiveTache(@Param("tacheId") Long tacheId,
                                          @Param("expertId") UUID expertId);

    // Candidatures en attente pour un propriétaire de projet
    @Query("SELECT c FROM CandidatureProjet c " +
           "WHERE c.projet.proprietaireId = :proprietaireId AND c.statut = 'EN_ATTENTE' " +
           "ORDER BY c.dateCreation DESC")
    List<CandidatureProjet> findCandidaturesEnAttenteParProprietaire(
            @Param("proprietaireId") UUID proprietaireId);

    // Statistiques
    long countByProjetIdAndStatut(Long projetId, StatutCandidature statut);

    long countByExpertIdAndStatut(UUID expertId, StatutCandidature statut);

    // Trouver candidature spécifique
    Optional<CandidatureProjet> findByProjetIdAndTacheIdAndExpertId(Long projetId, Long tacheId, UUID expertId);

    Optional<CandidatureProjet> findByProjetIdAndExpertIdAndTacheIsNull(Long projetId, UUID expertId);
}
