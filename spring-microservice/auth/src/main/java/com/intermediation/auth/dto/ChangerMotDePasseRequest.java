package com.intermediation.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO pour la demande de changement de mot de passe
 */
@Data
public class ChangerMotDePasseRequest {

    @NotBlank(message = "Le mot de passe actuel est requis")
    private String motDePasseActuel;

    @NotBlank(message = "Le nouveau mot de passe est requis")
    @Size(min = 8, message = "Le nouveau mot de passe doit contenir au moins 8 caractères")
    private String nouveauMotDePasse;

    @NotBlank(message = "La confirmation du mot de passe est requise")
    private String confirmationMotDePasse;
}
