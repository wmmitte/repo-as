package com.intermediation.expertise.repository;

import com.intermediation.expertise.model.Ville;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository pour l'entité Ville
 */
@Repository
public interface VilleRepository extends JpaRepository<Ville, Long> {
    
    /**
     * Recherche des villes par nom (insensible à la casse)
     */
    @Query("SELECT v FROM Ville v JOIN FETCH v.pays WHERE LOWER(v.nom) LIKE LOWER(CONCAT('%', :terme, '%')) ORDER BY v.indicePopularite DESC, v.nom ASC")
    List<Ville> rechercherParNom(@Param("terme") String terme);
    
    /**
     * Recherche combinée ville + pays
     */
    @Query("SELECT v FROM Ville v JOIN FETCH v.pays p WHERE " +
           "LOWER(v.nom) LIKE LOWER(CONCAT('%', :terme, '%')) OR " +
           "LOWER(p.nom) LIKE LOWER(CONCAT('%', :terme, '%')) " +
           "ORDER BY v.indicePopularite DESC, v.nom ASC")
    List<Ville> rechercherVilleOuPays(@Param("terme") String terme);
    
    /**
     * Récupère toutes les villes d'un pays
     */
    @Query("SELECT v FROM Ville v WHERE v.pays.id = :paysId ORDER BY v.nom ASC")
    List<Ville> findByPaysId(@Param("paysId") Long paysId);
    
    /**
     * Récupère toutes les villes actives
     */
    @Query("SELECT v FROM Ville v JOIN FETCH v.pays WHERE v.estActif = true ORDER BY v.nom ASC")
    List<Ville> findByEstActifTrueOrderByNomAsc();
    
    /**
     * Récupère les villes les plus populaires
     */
    @Query("SELECT v FROM Ville v JOIN FETCH v.pays ORDER BY v.indicePopularite DESC, v.nom ASC")
    List<Ville> findTopByOrderByIndicePopulariteDesc();
    
    /**
     * Compte le nombre de villes par pays
     */
    @Query("SELECT COUNT(v) FROM Ville v WHERE v.pays.id = :paysId")
    Long countByPaysId(@Param("paysId") Long paysId);
    
    /**
     * Vérifie si une ville existe pour un pays donné
     */
    boolean existsByNomIgnoreCaseAndPaysId(String nom, Long paysId);

    /**
     * Vérifie si une ville existe pour un pays donné (par entité)
     */
    boolean existsByNomAndPays(String nom, com.intermediation.expertise.model.Pays pays);
}
