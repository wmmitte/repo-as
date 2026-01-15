package com.intermediation.expertise.repository;

import com.intermediation.expertise.model.Competence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompetenceRepository extends JpaRepository<Competence, Long> {
    
    List<Competence> findByUtilisateurId(String utilisateurId);
    
    List<Competence> findByUtilisateurIdAndEstFavorite(String utilisateurId, Boolean estFavorite);
    
    Optional<Competence> findByUtilisateurIdAndNom(String utilisateurId, String nom);
    
    long countByUtilisateurId(String utilisateurId);
}
