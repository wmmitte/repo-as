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

@Repository
public interface CandidatureProjetRepository extends JpaRepository<CandidatureProjet, Long> {

    // Candidatures d'un expert
    List<CandidatureProjet> findByExpertIdOrderByDateCreationDesc(String expertId);

    Page<CandidatureProjet> findByExpertId(String expertId, Pageable pageable);

    List<CandidatureProjet> findByExpertIdAndStatut(String expertId, StatutCandidature statut);

    // Candidatures sur un projet
    List<CandidatureProjet> findByProjetIdOrderByDateCreationDesc(Long projetId);

    List<CandidatureProjet> findByProjetIdAndStatut(Long projetId, StatutCandidature statut);

    // Candidatures sur une tâche
    List<CandidatureProjet> findByTacheIdOrderByDateCreationDesc(Long tacheId);

    List<CandidatureProjet> findByTacheIdAndStatut(Long tacheId, StatutCandidature statut);

    // Vérifier si expert a déjà candidaté
    boolean existsByProjetIdAndExpertIdAndStatutNotIn(Long projetId, String expertId,
                                                       List<StatutCandidature> statutsExclus);

    boolean existsByTacheIdAndExpertIdAndStatutNotIn(Long tacheId, String expertId,
                                                      List<StatutCandidature> statutsExclus);

    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END " +
           "FROM CandidatureProjet c " +
           "WHERE c.projet.id = :projetId AND c.expertId = :expertId " +
           "AND c.tache IS NULL AND c.statut NOT IN ('REFUSEE', 'RETIREE')")
    boolean existsCandidatureActiveProjet(@Param("projetId") Long projetId,
                                           @Param("expertId") String expertId);

    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END " +
           "FROM CandidatureProjet c " +
           "WHERE c.tache.id = :tacheId AND c.expertId = :expertId " +
           "AND c.statut NOT IN ('REFUSEE', 'RETIREE')")
    boolean existsCandidatureActiveTache(@Param("tacheId") Long tacheId,
                                          @Param("expertId") String expertId);

    // Candidatures en attente pour un propriétaire de projet
    @Query("SELECT c FROM CandidatureProjet c " +
           "WHERE c.projet.proprietaireId = :proprietaireId AND c.statut = 'EN_ATTENTE' " +
           "ORDER BY c.dateCreation DESC")
    List<CandidatureProjet> findCandidaturesEnAttenteParProprietaire(
            @Param("proprietaireId") String proprietaireId);

    // Statistiques
    long countByProjetIdAndStatut(Long projetId, StatutCandidature statut);

    long countByExpertIdAndStatut(String expertId, StatutCandidature statut);

    // Trouver candidature spécifique
    Optional<CandidatureProjet> findByProjetIdAndTacheIdAndExpertId(Long projetId, Long tacheId, String expertId);

    Optional<CandidatureProjet> findByProjetIdAndExpertIdAndTacheIsNull(Long projetId, String expertId);
}
