package com.intermediation.paiement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tc_paiement")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Paiement implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID utilisateurId;

    @Column(nullable = false)
    private BigDecimal montant;

    @Column(nullable = false)
    private String devise;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutPaiement statut;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypePaiement type;

    private String reference;

    private String description;

    @Column(nullable = false)
    private LocalDateTime dateCreation;

    private LocalDateTime dateValidation;

    public enum StatutPaiement {
        EN_ATTENTE,
        VALIDE,
        REJETE,
        REMBOURSE
    }

    public enum TypePaiement {
        CARTE_BANCAIRE,
        VIREMENT,
        MOBILE_MONEY,
        PAYPAL
    }
}
