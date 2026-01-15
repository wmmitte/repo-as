# Acceuil Microservice

## Description
Le microservice **Acceuil** est un service d'intermédiation basé sur Camunda 8/Zeebe qui gère l'analyse de profil des visiteurs et la personnalisation de contenu via des processus BPMN.

## Fonctionnalités principales

### 1. Analyse de profil visiteur
- **Analyse technologique** : Détection du device, navigateur, OS, résolution, vitesse de connexion
- **Analyse comportementale** : Historique de navigation, temps de session, fréquence des visites, pattern de scroll
- **Analyse contextuelle** : Localisation, langue, heure de visite, contexte saisonnier

### 2. Gestion de contenu dynamique
- **Chargement de contexte** : Chargement par lot (batch) de contenus personnalisés
- **Feed Controller** : API REST pour piloter le processus BPMN

### 3. Moteur d'engagement
- **Tracking du dwell time** : Suivi du temps de focus sur les items
- **Calcul de score d'engagement** : Score basé sur les interactions utilisateur

## Architecture

### Composants
- **FeedController** : Contrôleur REST exposant les endpoints `/api/start`, `/api/scroll-next`, `/api/dwell`
- **Workers Zeebe** :
  - `AnalyseProfilVisiteurWorker` : Analyse le profil du visiteur
  - `ChargementContexteWorker` : Charge les lots de contenu
  - `MoteurEngagementWorker` : Calcule les scores d'engagement
- **DeploymentConfig** : Déploie automatiquement le processus BPMN au démarrage
- **ScenarioRunner** : Exécute un scénario de test (profil `scenario`)

### Modèles de données
- `AnalyseTechnologique` : Informations techniques du visiteur
- `AnalyseComportementale` : Comportements de navigation
- `AnalyseContextuelle` : Contexte de visite

## Configuration

### Prérequis
- **Camunda 8 / Zeebe** : Gateway Zeebe doit être accessible sur `http://localhost:26500`
- **Eureka Server** : Service registry sur `http://localhost:8761`
- **Config Server** : Configuration centralisée sur `http://localhost:8888`

### Configuration du microservice
Le service utilise Spring Cloud Config. La configuration se trouve dans `config-repo/acceuil.yml`:
```yaml
server:
  port: 8083
  servlet:
    context-path: /api/acceuil

camunda:
  client:
    mode: simple
    zeebe:
      base-url: http://localhost:26500
```

### Propriétés d'application
- **Port** : `8083`
- **Context path** : `/api/acceuil`
- **Service name** : `Acceuil`

## API REST

**Note importante** : L'interface utilisateur est hébergée sur le **Gateway** (port 8090). 
Les APIs ci-dessous sont accessibles via le Gateway sur `http://localhost:8090/api/acceuil/api/*`

### POST /api/acceuil/api/start (via Gateway)
Démarre une nouvelle instance du processus BPMN d'intermédiation.

**Endpoint direct service** : `http://localhost:8083/api/acceuil/api/start`  
**Endpoint via Gateway** : `http://localhost:8090/api/acceuil/api/start` ✅ **Recommandé**

**Request body:**
```json
{
  "visiteurId": "v-123",
  "userAgent": "Mozilla/5.0...",
  "referrer": "https://google.com",
  "ipAddress": "203.0.113.42"
}
```

**Response:**
```json
{
  "visiteurId": "v-123",
  "instanceKey": 2251799813685249
}
```

### POST /api/acceuil/api/scroll-next (via Gateway)
Publie un message de chargement de contenu (préchargement).

**Endpoint direct service** : `http://localhost:8083/api/acceuil/api/scroll-next`  
**Endpoint via Gateway** : `http://localhost:8090/api/acceuil/api/scroll-next` ✅ **Recommandé**

**Request body:**
```json
{
  "visiteurId": "v-123",
  "afterCursor": "0",
  "batchSize": 5
}
```

**Response:**
```json
{
  "pileContenu": [
    {
      "id": "itm-1",
      "type": "texte",
      "url": "https://cdn.example.com/texte/1.html",
      "titre": "Article #1",
      "thumbnail": "https://picsum.photos/seed/1/320/180"
    }
  ],
  "nextCursor": "5",
  "contexteDerniereMAJ": "2025-10-18T17:40:00Z"
}
```

### POST /api/acceuil/api/dwell (via Gateway)
Enregistre un événement de focus (début/fin) sur un item.

**Endpoint direct service** : `http://localhost:8083/api/acceuil/api/dwell`  
**Endpoint via Gateway** : `http://localhost:8090/api/acceuil/api/dwell` ✅ **Recommandé**

**Request body:**
```json
{
  "visiteurId": "v-123",
  "itemId": "itm-1",
  "eventType": "DWELL_START"
}
```

ou

```json
{
  "visiteurId": "v-123",
  "itemId": "itm-1",
  "eventType": "DWELL_STOP",
  "dureeDwellMs": 14000
}
```

**Response:**
```json
{
  "ok": true
}
```

## Processus BPMN

Le processus BPMN `Process_intermediation` se trouve dans `src/main/resources/processus/intermediation.bpmn`.

### Tâches de service
- **analyse-profil-visiteur** : Analyse initiale du profil
- **chargement-contexte** : Chargement de lot de contenu
- **moteur-engagement** : Mise à jour du score d'engagement

### Messages BPMN
- **scroll-next** : Déclenche le chargement de contenu
- **dwell-event** : Signale un événement d'engagement

## Démarrage

### Mode normal
```bash
cd spring-microservice/acceuil
mvn spring-boot:run
```

### Mode avec déploiement BPMN automatique
Le profil `deploy-intermediation` est activé par défaut et déploie automatiquement le processus BPMN au démarrage.

### Mode test avec scénario
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=scenario
```

## Interface utilisateur

L'interface web interactive du service Acceuil est **hébergée sur le Gateway** et accessible à l'URL :  
**`http://localhost:8090/`** (ou `http://localhost:8090/index.html`)

Cette interface permet de :
- Démarrer automatiquement une session avec un visiteur
- Visualiser le feed de contenu personnalisé
- Interagir avec les items (vidéos/articles)
- Suivre l'engagement en temps réel

**Technologie** : React 18 (standalone, sans build)

## Intégration dans l'architecture microservices

1. **Eureka Discovery** : Le service s'enregistre automatiquement auprès d'Eureka
2. **Config Server** : Récupère sa configuration depuis le Config Server
3. **Gateway** : Accessible via la Gateway API sur le chemin `/api/acceuil/**`
4. **Interface Web** : Hébergée sur le Gateway pour une architecture centralisée

## Dépendances Maven

- `spring-boot-starter-web` : Framework REST
- `spring-cloud-starter-netflix-eureka-client` : Service discovery
- `spring-cloud-starter-config` : Configuration centralisée
- `spring-zeebe-starter` : Intégration Camunda 8/Zeebe

## Tests

### Test unitaire
```bash
mvn test
```

### Test d'intégration avec scénario
Activer le profil `scenario` pour exécuter un scénario de test complet.

## Ressources

- **BPMN** : `src/main/resources/processus/intermediation.bpmn`
- **Configuration** : `src/main/resources/application.yml`
- **Interface Web** : Déplacée vers `gateway/src/main/resources/static/index.html`

## Notes de migration

Ce microservice a été migré depuis le projet standalone `acceuil` vers l'architecture microservices `spring-microservice`.

### Changements principaux
- **Package** : `intermediation.acceuil` → `com.intermediation.acceuil`
- **Configuration** : `application.properties` → `application.yml` + Config Server
- **Parent POM** : Utilise maintenant le parent `spring-microservice`
- **Service Discovery** : Intégration avec Eureka
- **Port** : 8080 → 8083
