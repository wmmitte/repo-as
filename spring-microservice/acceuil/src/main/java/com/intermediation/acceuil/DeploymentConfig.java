package com.intermediation.acceuil;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;

import io.camunda.zeebe.client.ZeebeClient;

@Configuration
@Profile("deploy-intermediation")
public class DeploymentConfig {
  private static final Logger log = LoggerFactory.getLogger(DeploymentConfig.class);

  @Bean
  public CommandLineRunner deployBpmnAtStartup(ZeebeClient zeebeClient) {
    return args -> {
      ClassPathResource bpmn = new ClassPathResource("processus/intermediation.bpmn");
      if (!bpmn.exists()) {
        log.warn("Ressource BPMN introuvable: classpath:processus/intermediation.bpmn. Aucun déploiement effectué.");
        return;
      }
      var response = zeebeClient
          .newDeployResourceCommand()
          .addResourceStream(bpmn.getInputStream(), "processus/intermediation.bpmn")
          .send()
          .join();
      log.info("Déploiement BPMN effectué. DeploymentKey={}", response.getKey());
    };
  }
}
