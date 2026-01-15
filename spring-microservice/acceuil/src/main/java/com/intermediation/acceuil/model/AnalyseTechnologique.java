package com.intermediation.acceuil.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyseTechnologique {
  private String deviceType;       // Mobile/Desktop/Tablet
  private String navigateur;       // Chrome, Safari, Firefox, Edge, ...
  private String resolution;       // Taille d'écran
  private String vitesseConnexion; // 3G/4G/5G/WiFi
  private String OS;               // iOS, Android, Windows, MacOS, ...
}
