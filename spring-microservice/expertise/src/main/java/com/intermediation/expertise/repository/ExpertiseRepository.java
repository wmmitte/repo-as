package com.intermediation.expertise.repository;

import com.intermediation.expertise.model.Expertise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExpertiseRepository extends JpaRepository<Expertise, Long> {
    
    Optional<Expertise> findByUtilisateurId(String utilisateurId);
    
    boolean existsByUtilisateurId(String utilisateurId);
    
    List<Expertise> findByPublieeTrue();
}
