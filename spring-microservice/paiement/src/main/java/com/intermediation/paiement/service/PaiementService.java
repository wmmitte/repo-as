package com.intermediation.paiement.service;

import com.intermediation.paiement.dto.CreatePaiementRequest;
import com.intermediation.paiement.dto.PaiementDTO;
import com.intermediation.paiement.entity.Paiement;
import com.intermediation.paiement.repository.PaiementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PaiementService {

    private final PaiementRepository paiementRepository;

    public PaiementDTO creerPaiement(CreatePaiementRequest request) {
        log.info("Création d'un nouveau paiement pour l'utilisateur: {}", request.getUtilisateurId());

        Paiement paiement = Paiement.builder()
                .utilisateurId(request.getUtilisateurId())
                .montant(request.getMontant())
                .devise(request.getDevise() != null ? request.getDevise() : "EUR")
                .type(request.getType())
                .statut(Paiement.StatutPaiement.EN_ATTENTE)
                .description(request.getDescription())
                .reference(genererReference())
                .dateCreation(LocalDateTime.now())
                .build();

        paiement = paiementRepository.save(paiement);
        return toDTO(paiement);
    }

    public PaiementDTO validerPaiement(UUID paiementId) {
        log.info("Validation du paiement: {}", paiementId);

        Paiement paiement = paiementRepository.findById(paiementId)
                .orElseThrow(() -> new RuntimeException("Paiement non trouvé"));

        paiement.setStatut(Paiement.StatutPaiement.VALIDE);
        paiement.setDateValidation(LocalDateTime.now());

        paiement = paiementRepository.save(paiement);
        return toDTO(paiement);
    }

    public PaiementDTO rejeterPaiement(UUID paiementId) {
        log.info("Rejet du paiement: {}", paiementId);

        Paiement paiement = paiementRepository.findById(paiementId)
                .orElseThrow(() -> new RuntimeException("Paiement non trouvé"));

        paiement.setStatut(Paiement.StatutPaiement.REJETE);
        paiement.setDateValidation(LocalDateTime.now());

        paiement = paiementRepository.save(paiement);
        return toDTO(paiement);
    }

    public List<PaiementDTO> getPaiementsUtilisateur(UUID utilisateurId) {
        log.info("Récupération des paiements de l'utilisateur: {}", utilisateurId);
        return paiementRepository.findByUtilisateurId(utilisateurId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public PaiementDTO getPaiementById(UUID paiementId) {
        log.info("Récupération du paiement: {}", paiementId);
        Paiement paiement = paiementRepository.findById(paiementId)
                .orElseThrow(() -> new RuntimeException("Paiement non trouvé"));
        return toDTO(paiement);
    }

    public List<PaiementDTO> getAllPaiements() {
        log.info("Récupération de tous les paiements");
        return paiementRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    private String genererReference() {
        return "PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private PaiementDTO toDTO(Paiement paiement) {
        return PaiementDTO.builder()
                .id(paiement.getId())
                .utilisateurId(paiement.getUtilisateurId())
                .montant(paiement.getMontant())
                .devise(paiement.getDevise())
                .statut(paiement.getStatut())
                .type(paiement.getType())
                .reference(paiement.getReference())
                .description(paiement.getDescription())
                .dateCreation(paiement.getDateCreation())
                .dateValidation(paiement.getDateValidation())
                .build();
    }
}
