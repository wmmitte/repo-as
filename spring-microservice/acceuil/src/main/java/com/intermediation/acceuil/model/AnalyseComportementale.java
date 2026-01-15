package com.intermediation.acceuil.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyseComportementale {
  private String referrer;             // Source d'arrivée
  private String historiqueNavigation; // Pages précédentes (ex: JSON/CSV)
  private String tempsSession;         // Durée de session (ex: PT5M)
  private String frequenceVisites;     // Nouveau vs Retour
  private String patternScroll;        // Comportement de lecture
}
