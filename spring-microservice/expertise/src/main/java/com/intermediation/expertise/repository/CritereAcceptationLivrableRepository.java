package com.intermediation.expertise.repository;

import com.intermediation.expertise.model.CritereAcceptationLivrable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CritereAcceptationLivrableRepository extends JpaRepository<CritereAcceptationLivrable, Long> {

    List<CritereAcceptationLivrable> findByLivrableIdOrderByOrdreAsc(Long livrableId);

    @Query("SELECT MAX(c.ordre) FROM CritereAcceptationLivrable c WHERE c.livrable.id = :livrableId")
    Integer findMaxOrdreByLivrableId(@Param("livrableId") Long livrableId);

    @Query("SELECT c FROM CritereAcceptationLivrable c " +
           "JOIN FETCH c.livrable l " +
           "JOIN FETCH l.tache t " +
           "JOIN FETCH t.projet " +
           "WHERE c.id = :id")
    Optional<CritereAcceptationLivrable> findByIdAvecProjet(@Param("id") Long id);

    long countByLivrableId(Long livrableId);

    long countByLivrableIdAndEstValide(Long livrableId, Boolean estValide);
}
