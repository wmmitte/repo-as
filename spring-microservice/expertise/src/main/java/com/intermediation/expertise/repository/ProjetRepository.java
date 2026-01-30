package com.intermediation.expertise.repository;

import com.intermediation.expertise.model.Projet;
import com.intermediation.expertise.model.Projet.StatutProjet;
import com.intermediation.expertise.model.Projet.Visibilite;
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
public interface ProjetRepository extends JpaRepository<Projet, Long> {

    // Projets d'un propriétaire
    List<Projet> findByProprietaireIdOrderByDateCreationDesc(UUID proprietaireId);

    Page<Projet> findByProprietaireId(UUID proprietaireId, Pageable pageable);

    // Projets publics et publiés
    Page<Projet> findByVisibiliteAndStatut(Visibilite visibilite, StatutProjet statut, Pageable pageable);

    @Query("SELECT p FROM Projet p WHERE p.visibilite = 'PUBLIC' AND p.statut = 'PUBLIE' ORDER BY p.dateCreation DESC")
    Page<Projet> findProjetsPublics(Pageable pageable);

    // Recherche de projets publics
    @Query("SELECT p FROM Projet p WHERE p.visibilite = 'PUBLIC' AND p.statut = 'PUBLIE' " +
           "AND (LOWER(p.nom) LIKE LOWER(CONCAT('%', :terme, '%')) " +
           "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :terme, '%')))")
    Page<Projet> rechercherProjetsPublics(@Param("terme") String terme, Pageable pageable);

    // Statistiques
    long countByProprietaireId(UUID proprietaireId);

    long countByProprietaireIdAndStatut(UUID proprietaireId, StatutProjet statut);

    @Query("SELECT COUNT(p) FROM Projet p WHERE p.visibilite = 'PUBLIC' AND p.statut = 'PUBLIE'")
    long countProjetsPublics();

    // Projets avec tâches disponibles (pour les experts)
    @Query("SELECT DISTINCT p FROM Projet p JOIN p.taches t " +
           "WHERE p.visibilite = 'PUBLIC' AND p.statut = 'PUBLIE' " +
           "AND t.expertAssigneId IS NULL AND t.statut = 'A_FAIRE'")
    Page<Projet> findProjetsAvecTachesDisponibles(Pageable pageable);

    // Vérifier si l'utilisateur est propriétaire
    boolean existsByIdAndProprietaireId(Long id, UUID proprietaireId);

    // Trouver avec les relations chargées
    @Query("SELECT p FROM Projet p " +
           "LEFT JOIN FETCH p.etapes " +
           "LEFT JOIN FETCH p.exigences " +
           "WHERE p.id = :id")
    Optional<Projet> findByIdAvecEtapesEtExigences(@Param("id") Long id);

    @Query("SELECT p FROM Projet p " +
           "LEFT JOIN FETCH p.taches t " +
           "LEFT JOIN FETCH t.livrables " +
           "WHERE p.id = :id")
    Optional<Projet> findByIdAvecTachesEtLivrables(@Param("id") Long id);

    // Projet complet avec étapes et tâches
    @Query("SELECT DISTINCT p FROM Projet p " +
           "LEFT JOIN FETCH p.etapes e " +
           "LEFT JOIN FETCH p.exigences " +
           "LEFT JOIN FETCH p.taches t " +
           "WHERE p.id = :id")
    Optional<Projet> findByIdAvecEtapesEtTaches(@Param("id") Long id);
}
