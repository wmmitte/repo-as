package com.intermediation.expertise.repository;

import com.intermediation.expertise.model.LivrableTache;
import com.intermediation.expertise.model.LivrableTache.StatutLivrable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LivrableTacheRepository extends JpaRepository<LivrableTache, Long> {

    List<LivrableTache> findByTacheId(Long tacheId);

    List<LivrableTache> findByTacheIdAndStatut(Long tacheId, StatutLivrable statut);

    // Livrables en attente de validation pour un projet
    @Query("SELECT l FROM LivrableTache l " +
           "WHERE l.tache.projet.id = :projetId AND l.statut = 'SOUMIS'")
    List<LivrableTache> findLivrablesEnAttenteValidation(@Param("projetId") Long projetId);

    // Livrable avec critères
    @Query("SELECT l FROM LivrableTache l " +
           "LEFT JOIN FETCH l.criteres " +
           "WHERE l.id = :id")
    Optional<LivrableTache> findByIdAvecCriteres(@Param("id") Long id);

    // Statistiques
    long countByTacheId(Long tacheId);

    long countByTacheIdAndStatut(Long tacheId, StatutLivrable statut);

    @Query("SELECT COUNT(l) FROM LivrableTache l WHERE l.tache.projet.id = :projetId AND l.statut = :statut")
    long countByProjetIdAndStatut(@Param("projetId") Long projetId, @Param("statut") StatutLivrable statut);

    // Vérifications
    boolean existsByIdAndTache_Projet_ProprietaireId(Long id, String proprietaireId);

    boolean existsByIdAndTache_ExpertAssigneId(Long id, String expertId);
}
