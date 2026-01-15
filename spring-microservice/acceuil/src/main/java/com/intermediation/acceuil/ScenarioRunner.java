package com.intermediation.acceuil;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import io.camunda.zeebe.client.ZeebeClient;

@Configuration
@Profile("scenario")
public class ScenarioRunner {
  private static final Logger log = LoggerFactory.getLogger(ScenarioRunner.class);

  @Bean
  public CommandLineRunner scenario(ZeebeClient client) {
    return args -> {
      new Thread(() -> {
        try {
          String visiteurId = "v-123";
          // 1) Démarrer une instance du process
          Map<String, Object> vars = new HashMap<>();
          vars.put("visiteurId", visiteurId);
          vars.put("userAgent", "Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/605.1.15 Safari/605.1.15");
          vars.put("referrer", "https://www.google.com/search?q=intermediation");
          vars.put("ipAddress", "203.0.113.42");

          var instance = client
            .newCreateInstanceCommand()
            .bpmnProcessId("Process_intermediation")
            .latestVersion()
            .variables(vars)
            .send()
            .join();
          log.info("[scenario] Instance démarrée, key={}", instance.getProcessInstanceKey());

          // Petite pause le temps d'atteindre la user task
          Thread.sleep(1000);

          // 2) Publier un scroll-next (chargement-contexte)
          Map<String, Object> scrollVars = new HashMap<>();
          scrollVars.put("visiteurId", visiteurId);
          scrollVars.put("afterCursor", "0");
          scrollVars.put("batchSize", 5);

          client
            .newPublishMessageCommand()
            .messageName("scroll-next")
            .correlationKey(visiteurId)
            .timeToLive(Duration.ofMinutes(1))
            .variables(scrollVars)
            .send()
            .join();
          log.info("[scenario] Message 'scroll-next' publié");

          Thread.sleep(800);

          // 3) Démarrer dwell sur le premier item
          Map<String, Object> dwellStartVars = new HashMap<>();
          dwellStartVars.put("visiteurId", visiteurId);
          dwellStartVars.put("itemId", "itm-1");
          dwellStartVars.put("eventType", "DWELL_START");

          client
            .newPublishMessageCommand()
            .messageName("dwell-event")
            .correlationKey(visiteurId)
            .timeToLive(Duration.ofMinutes(1))
            .variables(dwellStartVars)
            .send()
            .join();
          log.info("[scenario] Message 'dwell-event' (start) publié");

          Thread.sleep(1500);

          // 4) Stop dwell et envoyer la durée
          Map<String, Object> dwellStopVars = new HashMap<>();
          dwellStopVars.put("visiteurId", visiteurId);
          dwellStopVars.put("itemId", "itm-1");
          dwellStopVars.put("eventType", "DWELL_STOP");
          dwellStopVars.put("dureeDwellMs", 14000);

          client
            .newPublishMessageCommand()
            .messageName("dwell-event")
            .correlationKey(visiteurId)
            .timeToLive(Duration.ofMinutes(1))
            .variables(dwellStopVars)
            .send()
            .join();
          log.info("[scenario] Message 'dwell-event' (stop) publié");
        } catch (Exception e) {
          log.warn("[scenario] Erreur scenario: {}", e.toString());
        }
      }, "scenario-thread").start();
    };
  }
}
