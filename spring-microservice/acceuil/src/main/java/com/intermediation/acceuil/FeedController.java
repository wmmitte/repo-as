package com.intermediation.acceuil;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.intermediation.acceuil.client.ExpertiseClient;
import com.intermediation.acceuil.model.Expert;

/**
 * Contrôleur REST exposant les API métier pour le service d'accueil.
 *
 * Rôles principaux:
 * - Charger les lots d'experts pour le feed (scroll-next)
 * - Enregistrer les événements d'engagement utilisateur (dwell events)
 *
 * Note: La gestion du processus BPMN a été déplacée vers le service expertise.
 * Ce contrôleur ne contient plus que les APIs métier purement fonctionnelles.
 */
@RestController
@RequestMapping("/api")
public class FeedController {
  private static final Logger log = LoggerFactory.getLogger(FeedController.class);

  private final ExpertiseClient expertiseClient;

  /**
   * Injection des dépendances.
   *
   * @param expertiseClient client pour récupérer les experts depuis le service expertise
   */
  public FeedController(ExpertiseClient expertiseClient) {
    this.expertiseClient = expertiseClient;
  }

  /**
   * Génère un nouveau lot d'experts pour le défilement (scroll).
   * Récupère les experts publiés depuis le service expertise.
   *
   * @param body JSON d'entrée: {"visiteurId", "afterCursor"?, "batchSize"?}
   * @return JSON: {"pileContenu":[], "nextCursor":"...", "contexteDerniereMAJ":"..."}
   */
  @PostMapping(path = "/scroll-next", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
  public Map<String, Object> scrollNext(@RequestBody Map<String, Object> body) {
    String visiteurId = asString(body.get("visiteurId"));
    String afterCursor = asString(body.get("afterCursor"));
    Integer batchSize = toInt(body.get("batchSize"), 5);

    // Récupérer tous les experts publiés depuis le service expertise
    List<Expert> allExperts = expertiseClient.getExpertsPublies();

    // Pagination manuelle
    int start = toInt(afterCursor, 0);
    int end = Math.min(start + batchSize, allExperts.size());
    List<Expert> pileContenu = allExperts.subList(start, end);

    Map<String, Object> resp = new HashMap<>();
    resp.put("pileContenu", pileContenu);
    resp.put("nextCursor", String.valueOf(end));
    resp.put("contexteDerniereMAJ", OffsetDateTime.now().toString());

    log.info("[api/scroll-next] visiteurId={} cursor={}->{} experts={}/{}",
             visiteurId, afterCursor, end, pileContenu.size(), allExperts.size());

    return resp;
  }

  /**
   * Enregistre un événement d'engagement (dwell event).
   * Signale un changement de focus sur un item (début/fin).
   *
   * @param body JSON d'entrée: {"visiteurId", "itemId", "eventType" = DWELL_START|DWELL_STOP, "dureeDwellMs"?}
   * @return JSON: {"ok": true, "engagement": {...}}
   */
  @PostMapping(path = "/dwell", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
  public Map<String, Object> dwell(@RequestBody Map<String, Object> body) {
    String visiteurId = asString(body.get("visiteurId"));
    String itemId = asString(body.get("itemId"));
    String eventType = asString(body.get("eventType"));
    Long dureeDwellMs = toLong(body.get("dureeDwellMs"), null);

    // Traitement direct de l'engagement
    Map<String, Object> engagement = calculerEngagement(visiteurId, itemId, eventType, dureeDwellMs);

    log.info("[api/dwell] visiteurId={} itemId={} eventType={} score={}",
             visiteurId, itemId, eventType, engagement.get("scoreEngagement"));

    Map<String, Object> resp = new HashMap<>();
    resp.put("ok", true);
    resp.put("engagement", engagement);
    return resp;
  }

  /**
   * Calcule le score d'engagement pour un événement dwell.
   */
  private Map<String, Object> calculerEngagement(String visiteurId, String itemId, String eventType, Long dureeDwellMs) {
    Map<String, Object> engagement = new HashMap<>();
    engagement.put("visiteurId", visiteurId);
    engagement.put("itemId", itemId);
    engagement.put("eventType", eventType);
    engagement.put("engagementDerniereMAJ", OffsetDateTime.now().toString());

    // Calcul du score d'engagement (0.0 - 1.0)
    double base = 0.5;
    if ("DWELL_START".equalsIgnoreCase(eventType)) {
      base = 0.6;
    } else if ("DWELL_STOP".equalsIgnoreCase(eventType)) {
      // Score progressif basé sur la durée : 0.6 base + bonus jusqu'à 0.4 pour 30s
      base = 0.6 + ((dureeDwellMs != null ? Math.min(dureeDwellMs, 30000) : 0) / 30000.0) * 0.4; // max 1.0
    }
    double scoreEngagement = Math.round(base * 100.0) / 100.0;

    engagement.put("scoreEngagement", scoreEngagement);
    if (dureeDwellMs != null) {
      engagement.put("dureeDwellMs", dureeDwellMs);
    }

    return engagement;
  }

  /**
   * Convertit une valeur en chaîne en gérant la nullité.
   */
  private static String asString(Object v) {
    return v == null ? null : String.valueOf(v);
  }

  /**
   * Convertit une valeur en entier, ou renvoie une valeur par défaut en cas d'erreur.
   */
  private static Integer toInt(Object v, int def) {
    try {
      return v == null ? def : Integer.valueOf(String.valueOf(v));
    } catch (Exception e) {
      return def;
    }
  }

  /**
   * Convertit une valeur en long, ou renvoie une valeur par défaut en cas d'erreur.
   */
  private static Long toLong(Object v, Long def) {
    try {
      return v == null ? def : Long.valueOf(String.valueOf(v));
    } catch (Exception e) {
      return def;
    }
  }
}
