package com.intermediation.expertise.controller;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.camunda.zeebe.client.ZeebeClient;
import io.camunda.zeebe.client.api.response.ProcessInstanceEvent;

/**
 * Contrôleur REST pour la gestion des instances de processus BPMN.
 *
 * Ce contrôleur permet de démarrer des instances du processus d'intermédiation
 * de manière découplée du visiteur. Les instances sont créées sans variables
 * spécifiques au visiteur et seront associées aux utilisateurs identifiés ultérieurement.
 */
@RestController
@RequestMapping("/api/process")
public class ProcessController {
  private static final Logger log = LoggerFactory.getLogger(ProcessController.class);

  private final ZeebeClient zeebe;

  public ProcessController(ZeebeClient zeebe) {
    this.zeebe = zeebe;
  }

  /**
   * Démarre une nouvelle instance du processus BPMN d'intermédiation.
   *
   * Cette version simplifiée ne prend pas de variables spécifiques au visiteur.
   * Le processus est démarré de manière générique et pourra être associé
   * ultérieurement à un utilisateur identifié.
   *
   * @param body JSON d'entrée (optionnel, peut contenir des variables personnalisées)
   * @return JSON contenant l'instanceKey du processus créé
   */
  @PostMapping(path = "/start", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
  public Map<String, Object> startProcess(@RequestBody(required = false) Map<String, Object> body) {
    log.info("[api/process/start] Démarrage d'une nouvelle instance du processus d'intermédiation");

    try {
      // Variables minimales pour le processus
      Map<String, Object> variables = new HashMap<>();

      // Si des variables sont fournies dans le body, les ajouter
      if (body != null && !body.isEmpty()) {
        variables.putAll(body);
      }

      // Création de l'instance BPMN
      ProcessInstanceEvent instance = zeebe.newCreateInstanceCommand()
          .bpmnProcessId("Process_intermediation")
          .latestVersion()
          .variables(variables)
          .send()
          .join();

      long instanceKey = instance.getProcessInstanceKey();
      log.info("[api/process/start] Instance créée avec succès. instanceKey={}", instanceKey);

      // Réponse
      Map<String, Object> response = new HashMap<>();
      response.put("success", true);
      response.put("instanceKey", instanceKey);
      response.put("bpmnProcessId", instance.getBpmnProcessId());
      response.put("version", instance.getVersion());

      return response;

    } catch (Exception e) {
      log.error("[api/process/start] Erreur lors de la création de l'instance", e);
      Map<String, Object> error = new HashMap<>();
      error.put("success", false);
      error.put("error", "Erreur lors de la création de l'instance: " + e.getMessage());
      return error;
    }
  }
}
