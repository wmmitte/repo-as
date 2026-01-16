package com.intermediation.expertise.repository;

import com.intermediation.expertise.model.DemandeContact;
import com.intermediation.expertise.model.DemandeContact.StatutDemande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DemandeContactRepository extends JpaRepository<DemandeContact, Long> {

    /**
     * Trouver les demandes envoyées par un utilisateur
     */
    List<DemandeContact> findByExpediteurIdOrderByDateCreationDesc(String expediteurId);

    /**
     * Trouver les demandes reçues par un utilisateur
     */
    List<DemandeContact> findByDestinataireIdOrderByDateCreationDesc(String destinataireId);

    /**
     * Trouver les demandes reçues non lues
     */
    List<DemandeContact> findByDestinataireIdAndStatutOrderByDateCreationDesc(String destinataireId, StatutDemande statut);

    /**
     * Compter les demandes non lues pour un destinataire
     */
    long countByDestinataireIdAndStatut(String destinataireId, StatutDemande statut);

    /**
     * Trouver les demandes entre deux utilisateurs
     */
    List<DemandeContact> findByExpediteurIdAndDestinataireIdOrderByDateCreationDesc(String expediteurId, String destinataireId);
}
