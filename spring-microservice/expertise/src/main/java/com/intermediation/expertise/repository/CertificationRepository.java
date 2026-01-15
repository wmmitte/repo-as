package com.intermediation.expertise.repository;

import com.intermediation.expertise.model.Certification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CertificationRepository extends JpaRepository<Certification, Long> {
    
    /**
     * Recherche une certification par son intitulé
     */
    Optional<Certification> findByIntitule(String intitule);
    
    /**
     * Recherche des certifications par intitulé (contient, insensible à la casse)
     */
    @Query("SELECT c FROM Certification c WHERE LOWER(c.intitule) LIKE LOWER(CONCAT('%', :terme, '%')) AND c.estActive = true ORDER BY c.indicePopularite DESC, c.intitule ASC")
    List<Certification> rechercherParIntitule(@Param("terme") String terme);
    
    /**
     * Récupère les certifications les plus populaires
     */
    @Query("SELECT c FROM Certification c WHERE c.estActive = true ORDER BY c.indicePopularite DESC, c.intitule ASC")
    List<Certification> findTopByOrderByIndicePopulariteDesc();
    
    /**
     * Récupère toutes les certifications actives
     */
    List<Certification> findByEstActiveTrueOrderByIntituleAsc();

    /**
     * Vérifie si une certification existe par intitulé
     */
    boolean existsByIntitule(String intitule);
}
