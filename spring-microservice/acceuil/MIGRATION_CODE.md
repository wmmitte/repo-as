# Correspondance du Code Migré

Ce document montre ligne par ligne comment le code des workers a été intégré dans FeedController.

## 1. AnalyseProfilVisiteurWorker → FeedController

### Méthode principale: handle() → analyserProfil()

| AnalyseProfilVisiteurWorker | FeedController | Description |
|----------------------------|----------------|-------------|
| Lignes 45-68 (récupération variables) | Lignes 66-71 (paramètres méthode) | Récupération données entrée |
| Lignes 58-59 (analyseSource) | Ligne 169 + 232-233 | Détection source référent |
| Ligne 59 (analyseLocalisation) | Ligne 194 + 235-239 | Analyse localisation IP |
| Ligne 60 (detectDevice) | Ligne 173 + 241-247 | Détection type appareil |
| Lignes 74-79 (analyseTechnologique) | Lignes 176-183 | Objet analyse technique |
| Lignes 81-86 (analyseComportementale) | Lignes 185-190 | Objet analyse comportement |
| Lignes 88-92 (analyseContextuelle) | Lignes 192-197 | Objet analyse contextuelle |

### Méthodes utilitaires

```java
// AnalyseProfilVisiteurWorker (lignes 114-125)
private String analyseSource(String referrer) {
  if (referrer == null || referrer.isBlank()) return "direct";
  String r = referrer.toLowerCase(Locale.ROOT);
  if (r.contains("google")) return "search-google";
  if (r.contains("bing")) return "search-bing";
  // ... etc
}
```

**→ Migré vers FeedController ligne 232-233 (identique)**

```java
// AnalyseProfilVisiteurWorker (lignes 130-139)
private String analyseLocalisation(String ip) {
  if (ip == null || ip.isBlank()) return "unknown";
  if (ip.startsWith("192.168.") || ip.startsWith("10.")) return "lan";
  return "internet";
}
```

**→ Migré vers FeedController lignes 235-239 (identique)**

```java
// AnalyseProfilVisiteurWorker (lignes 144-156)
private String detectDevice(String userAgent) {
  if (userAgent == null || userAgent.isBlank()) return "unknown";
  String ua = userAgent.toLowerCase(Locale.ROOT);
  if (ua.contains("mobile") || ua.contains("android") || ua.contains("iphone")) 
    return "mobile";
  if (ua.contains("tablet") || ua.contains("ipad")) return "tablet";
  return "desktop";
}
```

**→ Migré vers FeedController lignes 241-247 (identique)**

```java
// AnalyseProfilVisiteurWorker (lignes 161-169)
private String detectNavigateur(String userAgent) {
  if (userAgent == null || userAgent.isBlank()) return "unknown";
  String ua = userAgent.toLowerCase(Locale.ROOT);
  if (ua.contains("edg")) return "edge";
  if (ua.contains("chrome") && !ua.contains("edg")) return "chrome";
  // ... etc
}
```

**→ Migré vers FeedController lignes 249-257 (identique)**

```java
// AnalyseProfilVisiteurWorker (lignes 174-183)
private String detectOS(String userAgent) {
  if (userAgent == null || userAgent.isBlank()) return "unknown";
  String ua = userAgent.toLowerCase(Locale.ROOT);
  if (ua.contains("android")) return "android";
  if (ua.contains("iphone") || ua.contains("ipad") || ua.contains("ios")) 
    return "ios";
  // ... etc
}
```

**→ Migré vers FeedController lignes 259-268 (identique)**

## 2. ChargementContexteWorker → FeedController

### Méthode principale: handle() → scrollNext()

| ChargementContexteWorker | FeedController.scrollNext() | Description |
|-------------------------|----------------------------|-------------|
| Lignes 53-57 (récupération variables) | Lignes 115-117 | Paramètres visiteurId, afterCursor, batchSize |
| Ligne 65 (ExpertGenerator.loadExperts) | Ligne 120 | **Génération directe des experts** |
| Lignes 66-67 (parsing afterCursor) | Ligne 121 | Calcul position de départ |
| Ligne 69 (pileContenu) | Ligne 124 | Liste d'experts dans réponse |
| Ligne 70 (nextCursor) | Ligne 125 | Curseur suivant |
| Ligne 61 (contexteDerniereMAJ) | Ligne 126 | Horodatage |
| ~~Ligne 73 (contexteCache.put)~~ | **Supprimé** | ❌ Plus de mise en cache |

### Différence clé

**Avant (ChargementContexteWorker):**
```java
// Générer la pile puis la stocker dans le cache
List<Expert> pileContenu = ExpertGenerator.loadExperts(afterCursor, batchSize);
contexteCache.put(visiteurId, afterCursor, pileContenu, nextCursor);
// Le controller récupère ensuite depuis le cache avec getWithRetry()
```

**Après (FeedController):**
```java
// Génération directe, retour immédiat au client
List<Expert> pileContenu = ExpertGenerator.loadExperts(afterCursor, batchSize);
resp.put("pileContenu", pileContenu);
return resp; // Réponse synchrone instantanée
```

## 3. MoteurEngagementWorker → FeedController

### Méthode principale: handle() → calculerEngagement()

| MoteurEngagementWorker | FeedController.calculerEngagement() | Description |
|-----------------------|-------------------------------------|-------------|
| Lignes 43-47 (récupération variables) | Ligne 206 (paramètres) | visiteurId, itemId, eventType, dureeDwellMs |
| Lignes 52-57 (calcul score) | Lignes 215-221 | **Logique de scoring identique** |
| Ligne 58 (arrondi) | Ligne 222 | Arrondi à 2 décimales |
| Ligne 51 (engagementDerniereMAJ) | Ligne 211 | Horodatage |
| Lignes 59-61 (echo variables) | Lignes 208-210, 225-227 | Variables dans réponse |

### Code comparé

**MoteurEngagementWorker (lignes 52-58):**
```java
double base = 0.5;
if ("DWELL_START".equalsIgnoreCase(eventType)) {
  base = 0.6;
} else if ("DWELL_STOP".equalsIgnoreCase(eventType)) {
  base = 0.6 + ((dwellMs != null ? Math.min(dwellMs, 30000) : 0) / 30000.0) * 0.4;
}
updates.put("scoreEngagement", Math.round(base * 100.0) / 100.0);
```

**FeedController.calculerEngagement() (lignes 215-222):**
```java
double base = 0.5;
if ("DWELL_START".equalsIgnoreCase(eventType)) {
  base = 0.6;
} else if ("DWELL_STOP".equalsIgnoreCase(eventType)) {
  base = 0.6 + ((dureeDwellMs != null ? Math.min(dureeDwellMs, 30000) : 0) / 30000.0) * 0.4;
}
double scoreEngagement = Math.round(base * 100.0) / 100.0;
```

**✅ Code identique - Aucune perte de logique**

## 4. ContexteCache - Supprimé

Le système de cache n'est plus nécessaire car l'architecture est maintenant synchrone.

### Avant (Architecture asynchrone)

```
Frontend → /api/scroll-next 
          → Publish Message BPMN
          → ChargementContexteWorker génère données
          → Stocke dans ContexteCache
          → FeedController récupère depuis cache (avec retry/timeout)
          → Retour au frontend
```

**Problèmes:**
- ⏱️ Latence (attente worker + cache)
- ❌ Risque de timeout si worker est lent
- 🐛 Complexité de débogage (3 composants)

### Après (Architecture synchrone)

```
Frontend → /api/scroll-next
          → FeedController génère données directement
          → Retour immédiat au frontend
```

**Avantages:**
- ⚡ Réponse instantanée
- ✅ Pas de timeout possible
- 🔧 Débogage simple (1 composant)

## Résumé de la Migration

| Composant | Lignes | Statut | Nouveau Code |
|-----------|--------|--------|--------------|
| **AnalyseProfilVisiteurWorker** | 193 | ✅ Migré | FeedController.analyserProfil() + 6 méthodes utilitaires |
| **ChargementContexteWorker** | 91 | ✅ Migré | FeedController.scrollNext() |
| **MoteurEngagementWorker** | 78 | ✅ Migré | FeedController.calculerEngagement() |
| **ContexteCache** | 141 | ❌ Supprimé | Architecture synchrone |
| **Total** | **503 lignes** | **100% préservé** | **FeedController enrichi (280 lignes)** |

## Vérification de Non-Régression

### Fonctionnalités préservées

1. ✅ **Analyse du profil visiteur**
   - Détection device/navigateur/OS
   - Analyse source/localisation
   - Tous les objets (analyseTechnologique, analyseComportementale, analyseContextuelle)

2. ✅ **Chargement de contexte**
   - Génération d'experts paginée
   - Gestion curseur afterCursor/nextCursor
   - Taille de lot configurable

3. ✅ **Moteur d'engagement**
   - Calcul score DWELL_START/DWELL_STOP
   - Formule identique (0.6 + progression sur 30s)
   - Horodatage des événements

### API REST - Compatibilité

| Endpoint | Changement | Impact Frontend |
|----------|-----------|-----------------|
| POST /api/start | + champ `profilAnalyse` dans réponse | ✅ Optionnel - Pas bloquant |
| POST /api/scroll-next | Aucun changement structure | ✅ Compatible à 100% |
| POST /api/dwell | + champ `engagement` dans réponse | ✅ Optionnel - Pas bloquant |

**Conclusion:** Le frontend continue de fonctionner sans modification. Les nouveaux champs peuvent être utilisés pour enrichir l'expérience utilisateur.
