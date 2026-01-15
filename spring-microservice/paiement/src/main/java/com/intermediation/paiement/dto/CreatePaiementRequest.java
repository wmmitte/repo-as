package com.intermediation.paiement.dto;

import com.intermediation.paiement.entity.Paiement;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreatePaiementRequest {

    private UUID utilisateurId;
    private BigDecimal montant;
    private String devise;
    private Paiement.TypePaiement type;
    private String description;
}
