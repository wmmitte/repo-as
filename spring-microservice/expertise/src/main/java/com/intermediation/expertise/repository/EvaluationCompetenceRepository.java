package com.intermediation.expertise.repository;

import com.intermediation.expertise.model.EvaluationCompetence;
import com.intermediation.expertise.model.EvaluationCompetence.Recommandation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EvaluationCompetenceRepository extends JpaRepository<EvaluationCompetence, Long> {

    // Recherches par demande
    Optional<EvaluationCompetence> findByDemandeId(Long demandeId);
    
    List<EvaluationCompetence> findByDemandeIdOrderByDateEvaluationDesc(Long demandeId);
    
    // Recherches par traitant
    List<EvaluationCompetence> findByTraitantIdOrderByDateEvaluationDesc(String traitantId);
    
    List<EvaluationCompetence> findByTraitantIdAndRecommandationOrderByDateEvaluationDesc(
        String traitantId, Recommandation recommandation);
    
    // Recherches par recommandation
    List<EvaluationCompetence> findByRecommandationOrderByDateEvaluationDesc(Recommandation recommandation);
    
    // Compter les évaluations
    long countByTraitantId(String traitantId);
    
    long countByTraitantIdAndRecommandation(String traitantId, Recommandation recommandation);
    
    // Vérifications
    boolean existsByDemandeId(Long demandeId);
    
    // Statistiques de performance des traitants
    @Query("SELECT e.traitantId, AVG(e.noteGlobale), COUNT(e) FROM EvaluationCompetence e " +
           "GROUP BY e.traitantId")
    List<Object[]> getStatistiquesParTraitant();
    
    @Query("SELECT e.traitantId, e.recommandation, COUNT(e) FROM EvaluationCompetence e " +
           "GROUP BY e.traitantId, e.recommandation")
    List<Object[]> getRecommandationsParTraitant();
    
    @Query("SELECT AVG(e.noteGlobale) FROM EvaluationCompetence e " +
           "WHERE e.traitantId = :traitantId")
    Double getMoyenneNotesByTraitant(@Param("traitantId") String traitantId);
    
    @Query("SELECT AVG(e.tempsEvaluationMinutes) FROM EvaluationCompetence e " +
           "WHERE e.traitantId = :traitantId AND e.tempsEvaluationMinutes IS NOT NULL")
    Double getMoyenneTempsEvaluationByTraitant(@Param("traitantId") String traitantId);
    
    // Évaluations par période
    @Query("SELECT e FROM EvaluationCompetence e " +
           "WHERE e.dateEvaluation BETWEEN :dateDebut AND :dateFin " +
           "ORDER BY e.dateEvaluation DESC")
    List<EvaluationCompetence> findByDateEvaluationBetween(
        @Param("dateDebut") LocalDateTime dateDebut,
        @Param("dateFin") LocalDateTime dateFin);
    
    @Query("SELECT e.traitantId, COUNT(e) FROM EvaluationCompetence e " +
           "WHERE e.dateEvaluation BETWEEN :dateDebut AND :dateFin " +
           "GROUP BY e.traitantId")
    List<Object[]> countByTraitantBetweenDates(
        @Param("dateDebut") LocalDateTime dateDebut,
        @Param("dateFin") LocalDateTime dateFin);
}
