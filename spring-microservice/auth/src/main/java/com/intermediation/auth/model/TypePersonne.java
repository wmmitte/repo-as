package com.intermediation.auth.model;

/**
 * Enumération pour distinguer les personnes physiques des personnes morales
 */
public enum TypePersonne {
    /**
     * Personne physique (particulier)
     * Nécessite : nom + prénom
     */
    PHYSIQUE,
    
    /**
     * Personne morale (entreprise, association, etc.)
     * Nécessite : nom uniquement (pas de prénom)
     */
    MORALE
}
