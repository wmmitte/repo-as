package com.intermediation.expertise.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour la création d'une demande de contact
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreerDemandeContactRequest {

    @NotBlank(message = "L'objet est obligatoire")
    @Size(max = 255, message = "L'objet ne peut pas dépasser 255 caractères")
    private String objet;

    @NotBlank(message = "Le message est obligatoire")
    @Size(max = 5000, message = "Le message ne peut pas dépasser 5000 caractères")
    private String message;

    @Size(max = 255, message = "L'email ne peut pas dépasser 255 caractères")
    private String emailReponse;
}
