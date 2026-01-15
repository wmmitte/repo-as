package com.intermediation.expertise.repository;

import com.intermediation.expertise.model.CritereEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CritereEvaluationRepository extends JpaRepository<CritereEvaluation, Long> {

    List<CritereEvaluation> findByEstActifTrue();

    List<CritereEvaluation> findByDomaineIdAndEstActifTrue(Long domaineId);

    List<CritereEvaluation> findAllByOrderByLibelleAsc();

    boolean existsByCodeAndDomaineId(String code, Long domaineId);
}
