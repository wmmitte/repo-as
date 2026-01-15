package com.intermediation.acceuil;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

/**
 * Service qui maintient un registre des instances de processus actives.
 * Permet de faire le lien entre un visiteurId et son instance de processus BPMN.
 */
@Service
public class ProcessInstanceRegistry {
  
  private final Map<String, Long> visiteurToInstanceKey = new ConcurrentHashMap<>();
  
  /**
   * Enregistre une nouvelle instance de processus pour un visiteur.
   *
   * @param visiteurId identifiant du visiteur
   * @param instanceKey clé de l'instance du processus BPMN
   */
  public void register(String visiteurId, long instanceKey) {
    visiteurToInstanceKey.put(visiteurId, instanceKey);
  }
  
  /**
   * Récupère la clé d'instance de processus associée à un visiteur.
   *
   * @param visiteurId identifiant du visiteur
   * @return clé de l'instance ou null si non trouvée
   */
  public Long getInstanceKey(String visiteurId) {
    return visiteurToInstanceKey.get(visiteurId);
  }
  
  /**
   * Supprime l'enregistrement d'un visiteur (quand le processus se termine).
   *
   * @param visiteurId identifiant du visiteur
   */
  public void unregister(String visiteurId) {
    visiteurToInstanceKey.remove(visiteurId);
  }
  
  /**
   * Vérifie si un visiteur a une instance de processus active.
   *
   * @param visiteurId identifiant du visiteur
   * @return true si une instance existe
   */
  public boolean hasInstance(String visiteurId) {
    return visiteurToInstanceKey.containsKey(visiteurId);
  }
}
