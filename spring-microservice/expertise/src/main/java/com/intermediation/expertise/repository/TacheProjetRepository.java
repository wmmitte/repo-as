package com.intermediation.expertise.repository;

import com.intermediation.expertise.model.TacheProjet;
import com.intermediation.expertise.model.TacheProjet.StatutTache;
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
public interface TacheProjetRepository extends JpaRepository<TacheProjet, Long> {

    // Tâches d'un projet
    List<TacheProjet> findByProjetIdOrderByOrdreAsc(Long projetId);

    // Tâches indépendantes (sans étape)
    List<TacheProjet> findByProjetIdAndEtapeIsNullOrderByOrdreAsc(Long projetId);

    // Tâches d'une étape
    List<TacheProjet> findByEtapeIdOrderByOrdreAsc(Long etapeId);

    // Tâches assignées à un expert
    List<TacheProjet> findByExpertAssigneIdOrderByDateAssignationDesc(UUID expertId);

    Page<TacheProjet> findByExpertAssigneId(UUID expertId, Pageable pageable);

    // Tâches disponibles (publiques, non assignées)
    @Query("SELECT t FROM TacheProjet t " +
           "WHERE t.projet.visibilite = 'PUBLIC' AND t.projet.statut = 'PUBLIE' " +
           "AND t.expertAssigneId IS NULL AND t.statut = 'A_FAIRE' " +
           "AND (t.visibilite = 'PUBLIC' OR t.visibilite = 'HERITEE')")
    Page<TacheProjet> findTachesDisponibles(Pageable pageable);

    // Recherche de tâches disponibles avec compétences
    @Query("SELECT DISTINCT t FROM TacheProjet t " +
           "JOIN t.competencesRequises cr " +
           "WHERE t.projet.visibilite = 'PUBLIC' AND t.projet.statut = 'PUBLIE' " +
           "AND t.expertAssigneId IS NULL AND t.statut = 'A_FAIRE' " +
           "AND cr.competenceReference.id IN :competenceIds")
    Page<TacheProjet> findTachesDisponiblesParCompetences(
            @Param("competenceIds") List<Long> competenceIds, Pageable pageable);

    // Ordre max
    @Query("SELECT MAX(t.ordre) FROM TacheProjet t WHERE t.projet.id = :projetId AND t.etape IS NULL")
    Integer findMaxOrdreByProjetIdSansEtape(@Param("projetId") Long projetId);

    @Query("SELECT MAX(t.ordre) FROM TacheProjet t WHERE t.etape.id = :etapeId")
    Integer findMaxOrdreByEtapeId(@Param("etapeId") Long etapeId);

    // Tâche avec relations
    @Query("SELECT t FROM TacheProjet t " +
           "LEFT JOIN FETCH t.livrables l " +
           "LEFT JOIN FETCH l.criteres " +
           "LEFT JOIN FETCH t.competencesRequises cr " +
           "LEFT JOIN FETCH cr.competenceReference " +
           "WHERE t.id = :id")
    Optional<TacheProjet> findByIdAvecDetails(@Param("id") Long id);

    // Statistiques
    long countByProjetId(Long projetId);

    long countByProjetIdAndStatut(Long projetId, StatutTache statut);

    long countByExpertAssigneId(UUID expertId);

    @Query("SELECT AVG(t.progression) FROM TacheProjet t WHERE t.projet.id = :projetId")
    Double calculerProgressionMoyenne(@Param("projetId") Long projetId);

    // Vérifications
    boolean existsByIdAndProjet_ProprietaireId(Long id, UUID proprietaireId);

    boolean existsByIdAndExpertAssigneId(Long id, UUID expertId);
}
