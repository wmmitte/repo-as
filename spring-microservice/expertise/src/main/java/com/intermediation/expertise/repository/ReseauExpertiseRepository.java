package com.intermediation.expertise.repository;

import com.intermediation.expertise.model.ReseauExpertise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReseauExpertiseRepository extends JpaRepository<ReseauExpertise, Long> {
    
    List<ReseauExpertise> findByUtilisateurId(String utilisateurId);
    
    Optional<ReseauExpertise> findByUtilisateurIdAndExpertId(String utilisateurId, String expertId);
    
    boolean existsByUtilisateurIdAndExpertId(String utilisateurId, String expertId);
    
    void deleteByUtilisateurIdAndExpertId(String utilisateurId, String expertId);
}
