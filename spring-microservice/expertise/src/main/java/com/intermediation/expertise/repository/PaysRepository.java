package com.intermediation.expertise.repository;

import com.intermediation.expertise.model.Pays;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository pour l'entité Pays
 */
@Repository
public interface PaysRepository extends JpaRepository<Pays, Long> {
    
    /**
     * Recherche des pays par nom (insensible à la casse)
     */
    @Query("SELECT p FROM Pays p WHERE LOWER(p.nom) LIKE LOWER(CONCAT('%', :terme, '%')) ORDER BY p.indicePopularite DESC, p.nom ASC")
    List<Pays> rechercherParNom(@Param("terme") String terme);
    
    /**
     * Récupère tous les pays actifs
     */
    List<Pays> findByEstActifTrueOrderByNomAsc();
    
    /**
     * Récupère tous les pays triés par popularité
     */
    List<Pays> findAllByOrderByIndicePopulariteDescNomAsc();
    
    /**
     * Vérifie si un pays existe par nom
     */
    boolean existsByNomIgnoreCase(String nom);
    
    /**
     * Trouve un pays par code ISO
     */
    Optional<Pays> findByCodeIso(String codeIso);

    /**
     * Vérifie si un pays existe par code ISO
     */
    boolean existsByCodeIso(String codeIso);
}
