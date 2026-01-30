package com.intermediation.expertise.repository;

import com.intermediation.expertise.model.ExigenceProjet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExigenceProjetRepository extends JpaRepository<ExigenceProjet, Long> {

    List<ExigenceProjet> findByProjetIdOrderByOrdreAsc(Long projetId);

    @Query("SELECT MAX(e.ordre) FROM ExigenceProjet e WHERE e.projet.id = :projetId")
    Integer findMaxOrdreByProjetId(@Param("projetId") Long projetId);

    long countByProjetId(Long projetId);

    boolean existsByIdAndProjet_ProprietaireId(Long id, String proprietaireId);
}
