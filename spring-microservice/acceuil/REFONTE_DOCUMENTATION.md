# Documentation de la Refonte du Service Acceuil

## Vue d'ensemble

Cette refonte simplifie l'architecture du service acceuil en éliminant la complexité liée aux workers asynchrones et au système de cache.

## Changements Principaux

### 1. Processus BPMN Simplifié

**Avant:**
- Sous-processus complexe avec:
  - Service Task: `analyse-profil-visiteur` (AnalyseProfilVisiteurWorker)
  - User Task: `Navigation intelligent et decouverte`
  - Boundary Events pour `scroll-next` et `dwell-event`
  - Service Task: `chargement-contexte` (ChargementContexteWorker)
  - Service Task: `moteur-engagement` (MoteurEngagementWorker)

**Après:**
- Processus linéaire simple:
  - Start Event: `arrivée visiteur`
  - User Task: `Acceuillir visiteur`
  - End Event: `fin acceuil`

### 2. Migration du Code

#### AnalyseProfilVisiteurWorker → FeedController.analyserProfil()

**Code migré (lignes 164-200 du FeedController):**
- ✅ Analyse de la source (referrer → search-google, social-facebook, etc.)
- ✅ Détection du device (mobile, tablet, desktop)
- ✅ Détection du navigateur (chrome, firefox, safari, edge)
- ✅ Détection de l'OS (android, ios, windows, macos, linux)
- ✅ Analyse de localisation (lan vs internet)
- ✅ Construction des objets analyseTechnologique, analyseComportementale, analyseContextuelle
- ✅ Gestion des paramètres optionnels (resolution, vitesseConnexion, langue)

**Méthodes utilitaires intégrées:**
- `analyseSource(String referrer)` - ligne 232
- `analyseLocalisation(String ip)` - ligne 235
- `detectDevice(String userAgent)` - ligne 241
- `detectNavigateur(String userAgent)` - ligne 249
- `detectOS(String userAgent)` - ligne 259

#### ChargementContexteWorker → FeedController.scrollNext()

**Code migré (lignes 113-132 du FeedController):**
- ✅ Génération directe des experts via `ExpertGenerator.loadExperts()`
- ✅ Gestion du curseur (afterCursor)
- ✅ Gestion de la taille de lot (batchSize)
- ✅ Calcul du nextCursor
- ✅ Horodatage contexteDerniereMAJ
- ⚠️ **Suppression du cache** - Plus de `ContexteCache.put()` / `getWithRetry()`

**Amélioration:**
- Réponse instantanée sans attente de workers
- Plus de risque de timeout
- Architecture synchrone plus simple

#### MoteurEngagementWorker → FeedController.calculerEngagement()

**Code migré (lignes 206-230 du FeedController):**
- ✅ Calcul du score d'engagement (0.0 - 1.0)
- ✅ Logique DWELL_START: score base = 0.6
- ✅ Logique DWELL_STOP: score progressif 0.6 + bonus jusqu'à 0.4 (max 30s)
- ✅ Formule: `0.6 + (min(dureeDwellMs, 30000) / 30000.0) * 0.4`
- ✅ Arrondi du score à 2 décimales
- ✅ Horodatage engagementDerniereMAJ

### 3. Composants Obsolètes

Les fichiers suivants ne sont plus utilisés et peuvent être supprimés:

1. **AnalyseProfilVisiteurWorker.java** (193 lignes)
   - Remplacé par: `FeedController.analyserProfil()` et méthodes utilitaires

2. **ChargementContexteWorker.java** (91 lignes)
   - Remplacé par: `FeedController.scrollNext()` avec génération directe

3. **MoteurEngagementWorker.java** (78 lignes)
   - Remplacé par: `FeedController.calculerEngagement()`

4. **ContexteCache.java** (141 lignes)
   - Supprimé: Plus besoin de cache avec architecture synchrone

### 4. API REST - Compatibilité Frontend

#### POST /api/start

**Avant:**
```json
Request: {"visiteurId"?, "userAgent"?, "referrer"?, "ipAddress"?}
Response: {"visiteurId", "instanceKey"}
```

**Après:**
```json
Request: {"visiteurId"?, "userAgent"?, "referrer"?, "ipAddress"?, "resolution"?, "vitesseConnexion"?, "langue"?}
Response: {
  "visiteurId": "...",
  "instanceKey": 123456,
  "profilAnalyse": {
    "source": "search-google",
    "device": "mobile",
    "analyseTechnologique": {...},
    "analyseComportementale": {...},
    "analyseContextuelle": {...}
  }
}
```

**Impact:** ⚠️ Champ supplémentaire `profilAnalyse` dans la réponse (non bloquant)

#### POST /api/scroll-next

**Avant:**
```json
Request: {"visiteurId", "afterCursor"?, "batchSize"?}
Response: {"pileContenu": [], "nextCursor": "...", "contexteDerniereMAJ": "..."}
```

**Après:**
```json
Request: {"visiteurId", "afterCursor"?, "batchSize"?}
Response: {"pileContenu": [], "nextCursor": "...", "contexteDerniereMAJ": "..."}
```

**Impact:** ✅ Aucun changement d'interface - Compatible à 100%

#### POST /api/dwell

**Avant:**
```json
Request: {"visiteurId", "itemId", "eventType", "dureeDwellMs"?}
Response: {"ok": true}
```

**Après:**
```json
Request: {"visiteurId", "itemId", "eventType", "dureeDwellMs"?}
Response: {
  "ok": true,
  "engagement": {
    "visiteurId": "...",
    "itemId": "...",
    "eventType": "DWELL_STOP",
    "scoreEngagement": 0.85,
    "dureeDwellMs": 15000,
    "engagementDerniereMAJ": "2025-10-26T15:16:00Z"
  }
}
```

**Impact:** ⚠️ Champ supplémentaire `engagement` dans la réponse (non bloquant)

### 5. Avantages de la Refonte

#### Performance
- ⚡ Réponse instantanée (pas d'attente de workers asynchrones)
- ⚡ Pas de polling du cache (suppression des `getWithRetry` avec timeout)
- ⚡ Moins de threads/ressources consommés

#### Simplicité
- 📉 Réduction de la complexité du BPMN (171 → 49 lignes XML)
- 📉 Moins de composants à maintenir (5 classes → 1 controller enrichi)
- 📉 Pas de coordination entre workers et REST

#### Fiabilité
- ✅ Pas de risque de timeout sur le cache
- ✅ Pas de désynchronisation workers/controller
- ✅ Gestion d'erreur simplifiée (pas de messages BPMN perdus)

#### Maintenabilité
- 🔧 Logique métier centralisée dans FeedController
- 🔧 Traçage simplifié (logs dans un seul composant)
- 🔧 Tests plus faciles (pas de mock de ZeebeClient pour workers)

### 6. Points d'Attention

1. **Processus BPMN existants:**
   - Les instances de processus en cours avec l'ancien BPMN continueront de fonctionner
   - Nouveaux démarrages utiliseront le nouveau BPMN simplifié
   - Les workers existants peuvent être conservés temporairement pour les anciennes instances

2. **Frontend:**
   - Les nouveaux champs `profilAnalyse` et `engagement` dans les réponses API sont optionnels
   - Le frontend peut ignorer ces champs s'il n'en a pas besoin
   - Aucun changement obligatoire côté frontend

3. **Logs:**
   - Tous les logs sont maintenant dans `FeedController`
   - Format: `[api/start]`, `[api/scroll-next]`, `[api/dwell]`

## Migration Recommandée

### Phase 1: Déploiement
1. ✅ Déployer le nouveau BPMN (intermediation.bpmn)
2. ✅ Déployer le FeedController modifié
3. ⏳ Garder les anciens workers actifs (pour instances existantes)

### Phase 2: Observation (1-2 jours)
1. Vérifier les logs du FeedController
2. Confirmer que les nouveaux processus fonctionnent correctement
3. Surveiller les performances

### Phase 3: Nettoyage (optionnel)
1. Attendre que toutes les anciennes instances BPMN se terminent
2. Supprimer les fichiers obsolètes:
   - AnalyseProfilVisiteurWorker.java
   - ChargementContexteWorker.java
   - MoteurEngagementWorker.java
   - ContexteCache.java
3. Nettoyer les imports inutilisés

## Résumé

✅ **Code source préservé:** Toute la logique métier des workers a été intégrée dans FeedController
✅ **API compatible:** Le frontend continue de fonctionner sans modification
✅ **Performance améliorée:** Architecture synchrone plus rapide et plus simple
✅ **Maintenabilité accrue:** Code centralisé et facile à déboguer

**Aucune perte de fonctionnalité - Architecture simplifiée et plus robuste**
