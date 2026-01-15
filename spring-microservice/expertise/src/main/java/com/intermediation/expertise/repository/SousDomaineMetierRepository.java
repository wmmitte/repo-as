package com.intermediation.expertise.repository;

import com.intermediation.expertise.model.SousDomaineMetier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository pour l'entité SousDomaineMetier
 */
@Repository
public interface SousDomaineMetierRepository extends JpaRepository<SousDomaineMetier, Long> {

    /**
     * Recherche des sous-domaines par libellé (insensible à la casse)
     */
    @Query("SELECT s FROM SousDomaineMetier s JOIN FETCH s.domaineMetier WHERE LOWER(s.libelle) LIKE LOWER(CONCAT('%', :terme, '%')) OR LOWER(s.code) LIKE LOWER(CONCAT('%', :terme, '%')) ORDER BY s.popularite DESC, s.libelle ASC")
    List<SousDomaineMetier> rechercherParLibelleOuCode(@Param("terme") String terme);

    /**
     * Recherche combinée sous-domaine + domaine
     */
    @Query("SELECT s FROM SousDomaineMetier s JOIN FETCH s.domaineMetier d WHERE " +
           "LOWER(s.libelle) LIKE LOWER(CONCAT('%', :terme, '%')) OR " +
           "LOWER(s.code) LIKE LOWER(CONCAT('%', :terme, '%')) OR " +
           "LOWER(d.libelle) LIKE LOWER(CONCAT('%', :terme, '%')) " +
           "ORDER BY s.popularite DESC, s.libelle ASC")
    List<SousDomaineMetier> rechercherSousDomaineOuDomaine(@Param("terme") String terme);

    /**
     * Récupère tous les sous-domaines d'un domaine
     */
    @Query("SELECT s FROM SousDomaineMetier s WHERE s.domaineMetier.id = :domaineId ORDER BY s.popularite DESC, s.libelle ASC")
    List<SousDomaineMetier> findByDomaineMetierId(@Param("domaineId") Long domaineId);

    /**
     * Récupère tous les sous-domaines actifs (tri simple par popularité)
     */
    @Query("SELECT s FROM SousDomaineMetier s JOIN FETCH s.domaineMetier WHERE s.estActif = true ORDER BY s.popularite DESC")
    List<SousDomaineMetier> findByEstActifTrueOrderByPopulariteDesc();

    /**
     * Récupère tous les sous-domaines actifs (tri par popularité et libellé)
     */
    @Query("SELECT s FROM SousDomaineMetier s JOIN FETCH s.domaineMetier WHERE s.estActif = true ORDER BY s.popularite DESC, s.libelle ASC")
    List<SousDomaineMetier> findByEstActifTrueOrderByPopulariteDescLibelleAsc();

    /**
     * Récupère les sous-domaines actifs d'un domaine
     */
    @Query("SELECT s FROM SousDomaineMetier s JOIN FETCH s.domaineMetier WHERE s.domaineMetier.id = :domaineMetierId AND s.estActif = true ORDER BY s.popularite DESC")
    List<SousDomaineMetier> findByDomaineMetierIdAndEstActifTrueOrderByPopulariteDesc(@Param("domaineMetierId") Long domaineMetierId);

    /**
     * Récupère tous les sous-domaines triés par popularité
     */
    @Query("SELECT s FROM SousDomaineMetier s JOIN FETCH s.domaineMetier ORDER BY s.popularite DESC, s.libelle ASC")
    List<SousDomaineMetier> findAllByOrderByPopulariteDescLibelleAsc();

    /**
     * Compte le nombre de sous-domaines par domaine
     */
    @Query("SELECT COUNT(s) FROM SousDomaineMetier s WHERE s.domaineMetier.id = :domaineId")
    Long countByDomaineMetierId(@Param("domaineId") Long domaineId);

    /**
     * Vérifie si un sous-domaine existe pour un domaine donné
     */
    boolean existsByCodeIgnoreCaseAndDomaineMetierId(String code, Long domaineMetierId);
}
