package com.intermediation.expertise.repository;

import com.intermediation.expertise.model.PieceJustificative;
import com.intermediation.expertise.model.PieceJustificative.TypePiece;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PieceJustificativeRepository extends JpaRepository<PieceJustificative, Long> {

    // Recherches par demande
    List<PieceJustificative> findByDemandeIdOrderByDateAjoutAsc(Long demandeId);
    
    List<PieceJustificative> findByDemandeIdAndTypePieceOrderByDateAjoutAsc(Long demandeId, TypePiece typePiece);
    
    // Recherches par type
    List<PieceJustificative> findByTypePieceOrderByDateAjoutDesc(TypePiece typePiece);
    
    // Vérification
    List<PieceJustificative> findByDemandeIdAndEstVerifie(Long demandeId, Boolean estVerifie);
    
    long countByDemandeId(Long demandeId);
    
    long countByDemandeIdAndEstVerifie(Long demandeId, Boolean estVerifie);
    
    // Statistiques
    @Query("SELECT p.typePiece, COUNT(p) FROM PieceJustificative p " +
           "WHERE p.demandeId = :demandeId " +
           "GROUP BY p.typePiece")
    List<Object[]> countByTypePieceForDemande(@Param("demandeId") Long demandeId);
    
    @Query("SELECT SUM(p.tailleOctets) FROM PieceJustificative p " +
           "WHERE p.demandeId = :demandeId")
    Long getTailleTotaleByDemande(@Param("demandeId") Long demandeId);
}
