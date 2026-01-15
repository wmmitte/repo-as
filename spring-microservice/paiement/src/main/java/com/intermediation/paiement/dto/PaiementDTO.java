package com.intermediation.paiement.dto;

import com.intermediation.paiement.entity.Paiement;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PaiementDTO {

    private UUID id;
    private UUID utilisateurId;
    private BigDecimal montant;
    private String devise;
    private Paiement.StatutPaiement statut;
    private Paiement.TypePaiement type;
    private String reference;
    private String description;
    private LocalDateTime dateCreation;
    private LocalDateTime dateValidation;
}
