package com.intermediation.expertise.service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

/**
 * Service qui maintient un registre des instances de processus BPMN actives.
 *
 * Permet de faire le lien entre :
 * - Un identifiant utilisateur (userId) et son instance de processus BPMN
 * - Utile pour envoyer des messages corrélés au processus
 *
 * Note: Ce registre remplace l'ancien registre du service acceuil.
 * Les instances sont maintenant gérées dans le service expertise.
 */
@Service
public class ProcessInstanceRegistry {

  private final Map<String, Long> userIdToInstanceKey = new ConcurrentHashMap<>();

  /**
   * Enregistre une nouvelle instance de processus pour un utilisateur.
   *
   * @param userId identifiant de l'utilisateur (ou clé de corrélation)
   * @param instanceKey clé de l'instance du processus BPMN
   */
  public void register(String userId, long instanceKey) {
    userIdToInstanceKey.put(userId, instanceKey);
  }

  /**
   * Récupère la clé d'instance de processus associée à un utilisateur.
   *
   * @param userId identifiant de l'utilisateur
   * @return clé de l'instance ou null si non trouvée
   */
  public Long getInstanceKey(String userId) {
    return userIdToInstanceKey.get(userId);
  }

  /**
   * Supprime l'enregistrement d'un utilisateur (quand le processus se termine).
   *
   * @param userId identifiant de l'utilisateur
   */
  public void unregister(String userId) {
    userIdToInstanceKey.remove(userId);
  }

  /**
   * Vérifie si un utilisateur a une instance de processus active.
   *
   * @param userId identifiant de l'utilisateur
   * @return true si une instance existe
   */
  public boolean hasInstance(String userId) {
    return userIdToInstanceKey.containsKey(userId);
  }

  /**
   * Retourne le nombre total d'instances actives.
   *
   * @return nombre d'instances
   */
  public int getActiveInstanceCount() {
    return userIdToInstanceKey.size();
  }
}
