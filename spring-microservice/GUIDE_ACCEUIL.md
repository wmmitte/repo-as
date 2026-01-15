# Guide de démarrage rapide - Service Acceuil

## Vue d'ensemble

Ce guide explique comment utiliser le microservice **Acceuil** avec l'interface web hébergée sur le **Gateway**.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  BROWSER                                │
│          http://localhost:8090                          │
│          Interface Web (React)                          │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ HTTP POST /api/acceuil/api/*
                        ▼
┌─────────────────────────────────────────────────────────┐
│               GATEWAY (port 8090)                       │
│          Spring Cloud Gateway                           │
│          - Route les requêtes                           │
│          - Héberge l'interface web                      │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ Load Balance via Eureka
                        ▼
┌─────────────────────────────────────────────────────────┐
│            SERVICE ACCEUIL (port 8083)                  │
│          Microservice d'intermédiation                  │
│          - FeedController (API REST)                    │
│          - Workers Zeebe                                │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ Zeebe Client
                        ▼
┌─────────────────────────────────────────────────────────┐
│            CAMUNDA 8 / ZEEBE (port 26500)               │
│          - Processus BPMN                               │
│          - Job Workers                                  │
└─────────────────────────────────────────────────────────┘
```

## Prérequis

### Services requis
1. **Camunda 8 / Zeebe Gateway** sur `http://localhost:26500`
2. **Eureka Server** sur `http://localhost:8761`
3. **Config Server** sur `http://localhost:8888`
4. **PostgreSQL** (optionnel, pour Enrollment)

### Vérification de Camunda/Zeebe
```bash
# Vérifier que Zeebe est accessible
curl http://localhost:26500/ready
```

## Démarrage des services

### 1. Démarrer le Config Server
```bash
cd spring-microservice/config-server
mvn spring-boot:run
```
Attendre que le service soit prêt (logs: "Started ConfigServerApplication")

### 2. Démarrer le Registry (Eureka)
```bash
cd spring-microservice/registry
mvn spring-boot:run
```
Vérifier sur : `http://localhost:8761`

### 3. Démarrer le service Acceuil
```bash
cd spring-microservice/acceuil
mvn spring-boot:run
```

**Points de vérification** :
- ✅ Le BPMN est déployé : chercher dans les logs `Déploiement BPMN effectué`
- ✅ Le service s'enregistre dans Eureka : vérifier sur `http://localhost:8761`
- ✅ Les workers Zeebe sont actifs : chercher dans les logs les messages `[analyse-profil-visiteur]`, `[chargement-contexte]`, `[moteur-engagement]`

### 4. Démarrer le Gateway
```bash
cd spring-microservice/gateway
mvn spring-boot:run
```

**Points de vérification** :
- ✅ Le Gateway démarre sur le port 8090
- ✅ Les routes sont configurées pour `/api/acceuil/**`

## Utilisation de l'interface Web

### Accéder à l'interface
1. Ouvrir un navigateur
2. Aller sur : **`http://localhost:8090/`**

### Fonctionnalités de l'interface

#### Démarrage automatique
L'interface démarre **automatiquement** une session au chargement de la page :
- Crée un visiteur avec un ID unique (ex: `v-1729274940123`)
- Démarre une instance du processus BPMN Camunda
- Charge le premier lot de contenu (5 items)

#### Gestion manuelle
Si vous voulez utiliser un visiteur spécifique :
1. Entrer l'ID du visiteur dans le champ `visiteurId`
2. Cliquer sur le bouton **Démarrer**

#### Fonctionnalités du feed
- **Scroll infini** : Le contenu se charge automatiquement en scrollant vers le bas
- **Dwell tracking** : Le temps passé sur chaque item est tracé automatiquement
- **Types de contenu** : Vidéos et articles alternés
- **Session persistence** : La session est sauvegardée dans localStorage (expire après 24h)

### Flux de données

```
1. Browser charge index.html depuis Gateway
   ↓
2. React app appelle POST /api/acceuil/api/start
   ↓
3. Gateway route vers Service Acceuil (via Eureka)
   ↓
4. Service Acceuil démarre processus BPMN dans Zeebe
   ↓
5. Worker "analyse-profil-visiteur" s'exécute
   ↓
6. React app appelle POST /api/acceuil/api/scroll-next
   ↓
7. Worker "chargement-contexte" charge le contenu
   ↓
8. Contenu affiché dans le browser
   ↓
9. User scroll → appel POST /api/acceuil/api/dwell
   ↓
10. Worker "moteur-engagement" calcule le score
```

## API disponibles

Toutes les APIs sont accessibles via le Gateway :

### 1. Démarrer une session
```bash
curl -X POST http://localhost:8090/api/acceuil/api/start \
  -H "Content-Type: application/json" \
  -d '{
    "visiteurId": "v-test-123",
    "userAgent": "Mozilla/5.0...",
    "referrer": "https://google.com",
    "ipAddress": "192.168.1.100"
  }'
```

**Réponse** :
```json
{
  "visiteurId": "v-test-123",
  "instanceKey": 2251799813685249
}
```

### 2. Charger du contenu
```bash
curl -X POST http://localhost:8090/api/acceuil/api/scroll-next \
  -H "Content-Type: application/json" \
  -d '{
    "visiteurId": "v-test-123",
    "afterCursor": "0",
    "batchSize": 5
  }'
```

**Réponse** :
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
  "contexteDerniereMAJ": "2025-10-18T18:00:00Z"
}
```

### 3. Enregistrer un événement d'engagement
```bash
# Début de lecture
curl -X POST http://localhost:8090/api/acceuil/api/dwell \
  -H "Content-Type: application/json" \
  -d '{
    "visiteurId": "v-test-123",
    "itemId": "itm-1",
    "eventType": "DWELL_START"
  }'

# Fin de lecture
curl -X POST http://localhost:8090/api/acceuil/api/dwell \
  -H "Content-Type: application/json" \
  -d '{
    "visiteurId": "v-test-123",
    "itemId": "itm-1",
    "eventType": "DWELL_STOP",
    "dureeDwellMs": 14000
  }'
```

## Vérification du bon fonctionnement

### 1. Vérifier Eureka
Aller sur `http://localhost:8761/` et vérifier que les services sont enregistrés :
- ✅ GATEWAY
- ✅ ACCEUIL

### 2. Vérifier les logs du service Acceuil
Chercher dans les logs :
```
[api/start] instance=2251799813685249 visiteurId=v-...
[chargement-contexte] visiteurId=v-... contexte mis à jour
[moteur-engagement] visiteurId=v-... score mis à jour
```

### 3. Tester l'interface
1. Ouvrir `http://localhost:8090/`
2. Vérifier que des items apparaissent automatiquement
3. Scroller vers le bas → nouveaux items chargés
4. Ouvrir la console du navigateur (F12) → pas d'erreur

### 4. Vérifier le processus BPMN
Dans Camunda Operate (si disponible) ou dans les logs Zeebe :
- Processus `Process_intermediation` déployé
- Instances actives avec le visiteurId

## Dépannage

### Problème : Interface ne charge pas
**Solution** :
1. Vérifier que le Gateway est démarré : `http://localhost:8090/`
2. Vérifier que le fichier existe : `gateway/src/main/resources/static/index.html`
3. Vider le cache du navigateur (Ctrl+Shift+R)

### Problème : API retourne 404
**Solution** :
1. Vérifier que le service Acceuil est enregistré dans Eureka
2. Vérifier la route dans `config-repo/gateway.yml`
3. Redémarrer le Gateway après modification de la configuration

### Problème : Erreur "Cannot connect to Zeebe"
**Solution** :
1. Vérifier que Zeebe tourne sur le port 26500
2. Vérifier la configuration dans `config-repo/acceuil.yml`
3. Tester : `curl http://localhost:26500/ready`

### Problème : Contenu ne se charge pas
**Solution** :
1. Ouvrir la console navigateur (F12) → voir les erreurs
2. Vérifier que les workers Zeebe sont actifs dans les logs
3. Vérifier que le processus BPMN est déployé

## Résumé des ports

| Service | Port | URL |
|---------|------|-----|
| Gateway | 8090 | http://localhost:8090 |
| Acceuil | 8083 | http://localhost:8083/api/acceuil/api/* |
| Eureka | 8761 | http://localhost:8761 |
| Config Server | 8888 | http://localhost:8888 |
| Zeebe | 26500 | http://localhost:26500 |

## Ordre de démarrage recommandé

1. **Zeebe** (si pas déjà lancé)
2. **Config Server**
3. **Eureka Registry**
4. **Service Acceuil**
5. **Gateway**

## Pour aller plus loin

### Tester avec le profil scenario
```bash
cd spring-microservice/acceuil
mvn spring-boot:run -Dspring-boot.run.profiles=scenario
```

Ce mode exécute automatiquement un scénario de test complet :
- Démarre une instance avec `visiteurId=v-123`
- Charge du contenu
- Simule des événements de dwell

### Personnaliser le processus BPMN
Le fichier BPMN se trouve dans :
`acceuil/src/main/resources/processus/intermediation.bpmn`

Utiliser Camunda Modeler pour l'éditer.

## Support

Pour plus d'informations, consulter :
- **Service Acceuil** : `acceuil/README.md`
- **Gateway** : `gateway/README.md`
- **Documentation Camunda 8** : https://docs.camunda.io/
