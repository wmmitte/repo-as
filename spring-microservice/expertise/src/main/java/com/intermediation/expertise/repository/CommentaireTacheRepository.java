package com.intermediation.expertise.repository;

import com.intermediation.expertise.model.CommentaireTache;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentaireTacheRepository extends JpaRepository<CommentaireTache, Long> {

    // Commentaires racines (sans parent) d'une tâche
    @Query("SELECT c FROM CommentaireTache c " +
           "WHERE c.tache.id = :tacheId AND c.parent IS NULL " +
           "ORDER BY c.dateCreation DESC")
    List<CommentaireTache> findCommentairesRacinesParTache(@Param("tacheId") Long tacheId);

    Page<CommentaireTache> findByTacheIdAndParentIsNullOrderByDateCreationDesc(
            Long tacheId, Pageable pageable);

    // Réponses à un commentaire
    List<CommentaireTache> findByParentIdOrderByDateCreationAsc(Long parentId);

    // Tous les commentaires d'une tâche
    List<CommentaireTache> findByTacheIdOrderByDateCreationDesc(Long tacheId);

    // Commentaires d'un auteur
    List<CommentaireTache> findByAuteurIdOrderByDateCreationDesc(UUID auteurId);

    // Statistiques
    long countByTacheId(Long tacheId);

    long countByAuteurId(UUID auteurId);

    // Vérification auteur
    boolean existsByIdAndAuteurId(Long id, UUID auteurId);
}
