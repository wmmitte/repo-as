package com.intermediation.paiement.controller;

import com.intermediation.paiement.dto.CreatePaiementRequest;
import com.intermediation.paiement.dto.PaiementDTO;
import com.intermediation.paiement.service.PaiementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/paiements")
@RequiredArgsConstructor
public class PaiementController {

    private final PaiementService paiementService;

    @PostMapping
    public ResponseEntity<PaiementDTO> creerPaiement(@RequestBody CreatePaiementRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(paiementService.creerPaiement(request));
    }

    @PutMapping("/{id}/valider")
    public ResponseEntity<PaiementDTO> validerPaiement(@PathVariable UUID id) {
        return ResponseEntity.ok(paiementService.validerPaiement(id));
    }

    @PutMapping("/{id}/rejeter")
    public ResponseEntity<PaiementDTO> rejeterPaiement(@PathVariable UUID id) {
        return ResponseEntity.ok(paiementService.rejeterPaiement(id));
    }

    @GetMapping
    public ResponseEntity<List<PaiementDTO>> getAllPaiements() {
        return ResponseEntity.ok(paiementService.getAllPaiements());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaiementDTO> getPaiementById(@PathVariable UUID id) {
        return ResponseEntity.ok(paiementService.getPaiementById(id));
    }

    @GetMapping("/utilisateur/{utilisateurId}")
    public ResponseEntity<List<PaiementDTO>> getPaiementsUtilisateur(@PathVariable UUID utilisateurId) {
        return ResponseEntity.ok(paiementService.getPaiementsUtilisateur(utilisateurId));
    }
}
