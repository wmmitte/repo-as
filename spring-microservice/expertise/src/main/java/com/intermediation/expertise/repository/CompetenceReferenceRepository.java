package com.intermediation.expertise.repository;

import com.intermediation.expertise.model.CompetenceReference;
import com.intermediation.expertise.model.CompetenceReference.StatutCompetence;
import com.intermediation.expertise.model.CompetenceReference.TypeCompetence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompetenceReferenceRepository extends JpaRepository<CompetenceReference, Long> {
    
    /**
     * Recherche par code unique
     */
    Optional<CompetenceReference> findByCode(String code);
    
    /**
     * Recherche par domaine
     */
    List<CompetenceReference> findByDomaineAndEstActiveTrue(String domaine);
    
    /**
     * Recherche par type de compétence
     */
    List<CompetenceReference> findByTypeCompetenceAndEstActiveTrue(TypeCompetence typeCompetence);
    
    /**
     * Recherche par statut
     */
    List<CompetenceReference> findByStatutAndEstActiveTrue(StatutCompetence statut);
    
    /**
     * Recherche les compétences racines (sans parent)
     */
    List<CompetenceReference> findByCompetenceParentIdIsNullAndEstActiveTrueOrderByOrdreAffichage();
    
    /**
     * Recherche les sous-compétences d'une compétence parente
     */
    List<CompetenceReference> findByCompetenceParentIdAndEstActiveTrueOrderByOrdreAffichage(Long parentId);
    
    /**
     * Recherche full-text dans libellé, description et mots-clés
     */
    @Query("SELECT c FROM CompetenceReference c WHERE c.estActive = true AND " +
           "(LOWER(c.libelle) LIKE LOWER(CONCAT('%', :terme, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :terme, '%')) OR " +
           "LOWER(c.motsCles) LIKE LOWER(CONCAT('%', :terme, '%')))")
    List<CompetenceReference> rechercherParTerme(@Param("terme") String terme);
    
    /**
     * Recherche avancée multi-critères
     */
    @Query("SELECT c FROM CompetenceReference c WHERE c.estActive = true " +
           "AND (:domaine IS NULL OR c.domaine = :domaine) " +
           "AND (:sousDomaine IS NULL OR c.sousDomaine = :sousDomaine) " +
           "AND (:typeCompetence IS NULL OR c.typeCompetence = :typeCompetence) " +
           "ORDER BY c.indicePopularite DESC, c.libelle ASC")
    List<CompetenceReference> rechercheAvancee(
        @Param("domaine") String domaine,
        @Param("sousDomaine") String sousDomaine,
        @Param("typeCompetence") TypeCompetence typeCompetence
    );
    
    /**
     * Récupère les compétences les plus populaires
     */
    List<CompetenceReference> findTop20ByEstActiveTrueOrderByIndicePopulariteDesc();
    
    /**
     * Récupère tous les domaines distincts
     */
    @Query("SELECT DISTINCT c.domaine FROM CompetenceReference c WHERE c.estActive = true AND c.domaine IS NOT NULL ORDER BY c.domaine")
    List<String> findAllDomaines();
    
    /**
     * Récupère tous les sous-domaines d'un domaine
     */
    @Query("SELECT DISTINCT c.sousDomaine FROM CompetenceReference c WHERE c.estActive = true AND c.domaine = :domaine AND c.sousDomaine IS NOT NULL ORDER BY c.sousDomaine")
    List<String> findSousDomainesByDomaine(@Param("domaine") String domaine);
    
    /**
     * Compte le nombre de compétences par domaine
     */
    @Query("SELECT c.domaine, COUNT(c) FROM CompetenceReference c WHERE c.estActive = true GROUP BY c.domaine ORDER BY COUNT(c) DESC")
    List<Object[]> countByDomaine();
}
