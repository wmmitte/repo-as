package com.intermediation.expertise.repository;

import com.intermediation.expertise.model.EtapeProjet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EtapeProjetRepository extends JpaRepository<EtapeProjet, Long> {

    List<EtapeProjet> findByProjetIdOrderByOrdreAsc(Long projetId);

    @Query("SELECT MAX(e.ordre) FROM EtapeProjet e WHERE e.projet.id = :projetId")
    Integer findMaxOrdreByProjetId(@Param("projetId") Long projetId);

    @Query("SELECT e FROM EtapeProjet e " +
           "LEFT JOIN FETCH e.taches t " +
           "WHERE e.id = :id")
    Optional<EtapeProjet> findByIdAvecTaches(@Param("id") Long id);

    long countByProjetId(Long projetId);

    boolean existsByIdAndProjet_ProprietaireId(Long id, UUID proprietaireId);
}
