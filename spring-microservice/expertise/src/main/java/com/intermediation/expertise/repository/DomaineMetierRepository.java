package com.intermediation.expertise.repository;

import com.intermediation.expertise.model.DomaineMetier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository pour l'entité DomaineMetier
 */
@Repository
public interface DomaineMetierRepository extends JpaRepository<DomaineMetier, Long> {

    /**
     * Recherche des domaines par libellé (insensible à la casse)
     */
    @Query("SELECT d FROM DomaineMetier d WHERE LOWER(d.libelle) LIKE LOWER(CONCAT('%', :terme, '%')) OR LOWER(d.code) LIKE LOWER(CONCAT('%', :terme, '%')) ORDER BY d.popularite DESC, d.libelle ASC")
    List<DomaineMetier> rechercherParLibelleOuCode(@Param("terme") String terme);

    /**
     * Récupère tous les domaines actifs (tri par popularité décroissante)
     */
    List<DomaineMetier> findByEstActifTrueOrderByPopulariteDesc();

    /**
     * Récupère tous les domaines actifs (tri par popularité décroissante et libellé)
     */
    List<DomaineMetier> findByEstActifTrueOrderByPopulariteDescLibelleAsc();

    /**
     * Récupère tous les domaines triés par popularité décroissante
     */
    List<DomaineMetier> findAllByOrderByPopulariteDescLibelleAsc();

    /**
     * Vérifie si un domaine existe par code
     */
    boolean existsByCodeIgnoreCase(String code);

    /**
     * Trouve un domaine par code
     */
    Optional<DomaineMetier> findByCodeIgnoreCase(String code);
}
