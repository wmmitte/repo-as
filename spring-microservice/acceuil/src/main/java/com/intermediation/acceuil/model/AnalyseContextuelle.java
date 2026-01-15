package com.intermediation.acceuil.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyseContextuelle {
  private String localisation;      // Pays, Ville, Fuseau horaire (estimations)
  private String langue;            // Langue du navigateur (ex: fr-FR)
  private String heureVisite;       // Moment de la journée (ISO-8601)
  private String contexteSaisonnier; // Vacances, événements, campagnes
}
