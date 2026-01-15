package com.intermediation.expertise.repository;

import com.intermediation.expertise.model.MethodeEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MethodeEvaluationRepository extends JpaRepository<MethodeEvaluation, Long> {

    List<MethodeEvaluation> findByEstActifTrue();

    List<MethodeEvaluation> findAllByOrderByLibelleAsc();

    boolean existsByCode(String code);
}
