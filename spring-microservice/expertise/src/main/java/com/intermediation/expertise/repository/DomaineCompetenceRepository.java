package com.intermediation.expertise.repository;

import com.intermediation.expertise.model.DomaineCompetence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DomaineCompetenceRepository extends JpaRepository<DomaineCompetence, Long> {

    List<DomaineCompetence> findByEstActifTrueOrderByOrdreAffichage();

    Optional<DomaineCompetence> findByCode(String code);
}
