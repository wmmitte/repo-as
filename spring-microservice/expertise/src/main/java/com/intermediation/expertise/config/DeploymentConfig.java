package com.intermediation.expertise.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;

import io.camunda.zeebe.client.ZeebeClient;

/**
 * Configuration pour déployer automatiquement les processus BPMN
 * au démarrage du service expertise.
 *
 * Activé uniquement avec le profil "deploy-intermediation"
 */
@Configuration
@Profile("deploy-intermediation")
public class DeploymentConfig {
  private static final Logger log = LoggerFactory.getLogger(DeploymentConfig.class);

  @Bean
  public CommandLineRunner deployBpmnAtStartup(ZeebeClient zeebeClient) {
    return args -> {
      // Déployer le processus d'intermédiation
      ClassPathResource intermediationBpmn = new ClassPathResource("processus/intermediation.bpmn");
      if (intermediationBpmn.exists()) {
        var intermediationResponse = zeebeClient
            .newDeployResourceCommand()
            .addResourceStream(intermediationBpmn.getInputStream(), "processus/intermediation.bpmn")
            .send()
            .join();
        log.info("✓ Processus BPMN 'intermediation' déployé. DeploymentKey={}", intermediationResponse.getKey());
      } else {
        log.warn("⚠ Ressource BPMN introuvable: classpath:processus/intermediation.bpmn");
      }

      // Déployer le processus de reconnaissance de compétence
      ClassPathResource reconnaissanceBpmn = new ClassPathResource("processus/reconnaissance-competence.bpmn");
      if (reconnaissanceBpmn.exists()) {
        var reconnaissanceResponse = zeebeClient
            .newDeployResourceCommand()
            .addResourceStream(reconnaissanceBpmn.getInputStream(), "processus/reconnaissance-competence.bpmn")
            .send()
            .join();
        log.info("✓ Processus BPMN 'reconnaissance-competence' déployé. DeploymentKey={}", reconnaissanceResponse.getKey());
      } else {
        log.warn("⚠ Ressource BPMN introuvable: classpath:processus/reconnaissance-competence.bpmn");
      }

      log.info("═══════════════════════════════════════════════════════");
      log.info("  Déploiement des processus BPMN terminé");
      log.info("═══════════════════════════════════════════════════════");
    };
  }
}
