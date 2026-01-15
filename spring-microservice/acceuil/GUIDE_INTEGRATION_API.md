# Guide : Intégration d'une API externe pour récupérer les experts

## Objectif

Ce guide explique comment remplacer la génération simulée des experts (`ExpertGenerator`) par un appel API vers un microservice externe.

## Architecture actuelle vs future

### Actuel (simulation)
```
ChargementContexteWorker
    ↓
ExpertGenerator.loadExperts() → génère des données fictives
    ↓
Stocke dans ContexteCache + Variables BPMN
```

### Futur (API externe)
```
ChargementContexteWorker
    ↓
Appel HTTP/gRPC vers Microservice Experts
    ↓
Transformation des données (DTO → Expert)
    ↓
Stocke dans ContexteCache + Variables BPMN
```

## Étapes d'implémentation

### 1. Créer un client HTTP pour l'API Experts

```java
package com.intermediation.acceuil;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@Service
public class ExpertApiClient {
  private static final Logger log = LoggerFactory.getLogger(ExpertApiClient.class);
  
  private final RestTemplate restTemplate;
  private final String expertApiBaseUrl;
  
  public ExpertApiClient(RestTemplate restTemplate) {
    this.restTemplate = restTemplate;
    // À configurer dans application.properties
    this.expertApiBaseUrl = "http://expert-service:8081/api/experts";
  }
  
  /**
   * Récupère une liste d'experts depuis l'API externe.
   * 
   * @param afterCursor curseur de pagination
   * @param batchSize nombre d'experts à récupérer
   * @return liste d'experts
   * @throws RestClientException en cas d'erreur réseau
   */
  public List<Expert> fetchExperts(String afterCursor, int batchSize) {
    String url = String.format("%s?afterCursor=%s&batchSize=%d", 
                                expertApiBaseUrl, 
                                afterCursor != null ? afterCursor : "0",
                                batchSize);
    
    try {
      log.info("[ExpertApiClient] Appel API: {}", url);
      
      // Appel GET vers l'API externe
      ExpertApiResponse response = restTemplate.getForObject(url, ExpertApiResponse.class);
      
      if (response != null && response.getExperts() != null) {
        log.info("[ExpertApiClient] {} experts récupérés", response.getExperts().size());
        return response.getExperts();
      }
      
      log.warn("[ExpertApiClient] Réponse vide de l'API");
      return List.of();
      
    } catch (RestClientException e) {
      log.error("[ExpertApiClient] Erreur lors de l'appel API", e);
      throw e;
    }
  }
  
  /**
   * DTO pour la réponse de l'API externe.
   */
  public static class ExpertApiResponse {
    private List<Expert> experts;
    private String nextCursor;
    
    // Getters/Setters
    public List<Expert> getExperts() { return experts; }
    public void setExperts(List<Expert> experts) { this.experts = experts; }
    public String getNextCursor() { return nextCursor; }
    public void setNextCursor(String nextCursor) { this.nextCursor = nextCursor; }
  }
}
```

### 2. Configurer RestTemplate dans l'application

```java
package com.intermediation.acceuil;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Configuration
public class RestTemplateConfig {
  
  @Bean
  public RestTemplate restTemplate(RestTemplateBuilder builder) {
    return builder
        .setConnectTimeout(Duration.ofSeconds(5))
        .setReadTimeout(Duration.ofSeconds(5))
        .build();
  }
}
```

### 3. Ajouter les propriétés dans application.properties

```properties
# Configuration API Experts externe
expert.api.base-url=http://expert-service:8081/api/experts
expert.api.timeout-seconds=5
```

### 4. Modifier ChargementContexteWorker

```java
@Component
public class ChargementContexteWorker {
  private static final Logger log = LoggerFactory.getLogger(ChargementContexteWorker.class);
  
  private final ContexteCache contexteCache;
  private final ExpertApiClient expertApiClient; // Nouvelle dépendance
  
  public ChargementContexteWorker(ContexteCache contexteCache, ExpertApiClient expertApiClient) {
    this.contexteCache = contexteCache;
    this.expertApiClient = expertApiClient;
  }

  @JobWorker(type = "chargement-contexte", autoComplete = false)
  public void handle(final JobClient client, final ActivatedJob job) {
    Map<String, Object> vars = job.getVariablesAsMap();
    String visiteurId = asString(vars.get("visiteurId"));
    String afterCursor = asString(vars.get("afterCursor"));
    Integer batchSize = /* extraction batchSize */;

    Map<String, Object> updates = new HashMap<>();
    updates.put("contexteDerniereMAJ", OffsetDateTime.now().toString());
    
    try {
      // Appel API externe au lieu de génération locale
      List<Expert> pileContenu = expertApiClient.fetchExperts(afterCursor, batchSize);
      
      updates.put("contexteCharge", true);
      updates.put("pileContenu", pileContenu);
      
      int start = 0;
      try { start = afterCursor != null ? Integer.parseInt(afterCursor) : 0; } catch (Exception ignored) {}
      updates.put("nextCursor", String.valueOf(start + batchSize));
      
      // Stocker dans le cache
      contexteCache.put(visiteurId, afterCursor, pileContenu, String.valueOf(start + batchSize));
      
      log.info("[chargement-contexte] visiteurId={} contexte chargé depuis API: {} experts", 
               visiteurId, pileContenu.size());
      
    } catch (Exception e) {
      log.error("[chargement-contexte] Erreur lors du chargement depuis l'API", e);
      
      // Fallback : utiliser ExpertGenerator en cas d'erreur
      List<Expert> pileContenu = ExpertGenerator.loadExperts(afterCursor, batchSize);
      updates.put("contexteCharge", true);
      updates.put("pileContenu", pileContenu);
      
      int start = 0;
      try { start = afterCursor != null ? Integer.parseInt(afterCursor) : 0; } catch (Exception ignored) {}
      updates.put("nextCursor", String.valueOf(start + batchSize));
      
      contexteCache.put(visiteurId, afterCursor, pileContenu, String.valueOf(start + batchSize));
      
      log.warn("[chargement-contexte] Fallback sur génération locale");
    }

    client
        .newCompleteCommand(job.getKey())
        .variables(updates)
        .send()
        .join();
  }
}
```

## Patterns recommandés

### 1. Circuit Breaker (Resilience4j)

```java
@CircuitBreaker(name = "expertApi", fallbackMethod = "fetchExpertsFallback")
public List<Expert> fetchExperts(String afterCursor, int batchSize) {
  // Appel API
}

public List<Expert> fetchExpertsFallback(String afterCursor, int batchSize, Exception e) {
  log.warn("Circuit breaker activé, utilisation des données simulées");
  return ExpertGenerator.loadExperts(afterCursor, batchSize);
}
```

### 2. Retry avec backoff

```java
@Retryable(
  value = {RestClientException.class},
  maxAttempts = 3,
  backoff = @Backoff(delay = 1000, multiplier = 2)
)
public List<Expert> fetchExperts(String afterCursor, int batchSize) {
  // Appel API
}
```

### 3. Cache local (Spring Cache)

```java
@Cacheable(value = "experts", key = "#afterCursor + ':' + #batchSize")
public List<Expert> fetchExperts(String afterCursor, int batchSize) {
  // Appel API
}
```

## Tests

### Test d'intégration avec WireMock

```java
@SpringBootTest
@AutoConfigureWireMock(port = 8081)
class ChargementContexteWorkerIntegrationTest {
  
  @Test
  void shouldFetchExpertsFromApi() {
    // Given
    stubFor(get(urlMatching("/api/experts.*"))
        .willReturn(aResponse()
            .withStatus(200)
            .withHeader("Content-Type", "application/json")
            .withBody("""
                {
                  "experts": [
                    {"id": "exp-1", "nom": "Martin", "prenom": "Sophie", ...}
                  ],
                  "nextCursor": "1"
                }
                """)));
    
    // When
    // Déclencher le worker
    
    // Then
    // Vérifier que les données sont correctes
  }
}
```

## Checklist de migration

- [ ] Créer `ExpertApiClient`
- [ ] Configurer `RestTemplate` avec timeouts
- [ ] Ajouter les propriétés de configuration (URL, timeouts)
- [ ] Modifier `ChargementContexteWorker` pour utiliser `ExpertApiClient`
- [ ] Implémenter le fallback sur `ExpertGenerator`
- [ ] Ajouter Circuit Breaker (optionnel mais recommandé)
- [ ] Ajouter métriques et monitoring (Micrometer)
- [ ] Créer des tests d'intégration avec WireMock
- [ ] Documenter le contrat API dans Swagger/OpenAPI
- [ ] Tester en environnement de dev/staging

## Points d'attention

1. **Gestion des erreurs** : Toujours avoir un fallback fonctionnel
2. **Timeouts** : Configurer des timeouts adaptés (5-10s max)
3. **Monitoring** : Logger les appels, succès, erreurs et temps de réponse
4. **Contrat API** : S'assurer que les DTOs sont bien mappés
5. **Sécurité** : Ajouter authentication si nécessaire (OAuth2, API Key)
