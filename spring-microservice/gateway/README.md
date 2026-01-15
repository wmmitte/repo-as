# Gateway Microservice

## Description
Le **Gateway** est le point d'entrée unique de l'architecture microservices. Il route les requêtes vers les différents microservices et héberge l'interface utilisateur de l'application Acceuil.

## Fonctionnalités principales

### 1. Routage des requêtes
Le Gateway route les requêtes HTTP vers les microservices appropriés en utilisant Spring Cloud Gateway.

### 2. Service Discovery
Intégration avec Eureka pour la découverte automatique des services.

### 3. Interface utilisateur
Héberge l'interface web interactive du service **Acceuil** (feed personnalisé avec Camunda/Zeebe).

## Configuration

### Prérequis
- **Eureka Server** : Service registry sur `http://localhost:8761`
- **Config Server** : Configuration centralisée sur `http://localhost:8888`
- **Services microservices** : Enrollment, Acceuil

### Configuration du Gateway
Le Gateway utilise Spring Cloud Config. La configuration se trouve dans `config-repo/gateway.yml`.

### Routes configurées

| Service | Pattern | URI | Port cible |
|---------|---------|-----|------------|
| Enrollment | `/api/enrollment/**` | `lb://enrollment` | 8081 |
| Acceuil | `/api/acceuil/**` | `lb://acceuil` | 8083 |

**Note** : `lb://` indique que le routage utilise le load balancer avec Eureka pour résoudre le service.

## Interface Web - Acceuil

### Accès
L'interface d'accueil est accessible à l'URL :  
**`http://localhost:8090/`** ou **`http://localhost:8090/index.html`**

### Description
Interface React interactive permettant de :
- Démarrer une session visiteur avec Camunda/Zeebe
- Visualiser un feed de contenu personnalisé (articles et vidéos)
- Interagir avec les contenus (dwell tracking)
- Charger automatiquement du contenu au scroll

### Architecture de l'interface

```
┌─────────────────────────────────────┐
│   Browser (http://localhost:8090)  │
│   Interface React - index.html      │
└──────────────┬──────────────────────┘
               │ HTTP POST
               │ /api/acceuil/api/*
               ▼
┌─────────────────────────────────────┐
│   Gateway (port 8090)               │
│   Spring Cloud Gateway              │
└──────────────┬──────────────────────┘
               │ Route to lb://acceuil
               ▼
┌─────────────────────────────────────┐
│   Service Acceuil (port 8083)       │
│   /api/acceuil/api/*                │
└──────────────┬──────────────────────┘
               │ Zeebe Client
               ▼
┌─────────────────────────────────────┐
│   Camunda 8 / Zeebe                 │
│   (http://localhost:26500)          │
└─────────────────────────────────────┘
```

### Endpoints utilisés par l'interface

L'interface web appelle les APIs suivantes via le Gateway :

- **POST** `/api/acceuil/api/start` - Démarre une instance de processus
- **POST** `/api/acceuil/api/scroll-next` - Charge un lot de contenu
- **POST** `/api/acceuil/api/dwell` - Enregistre un événement d'engagement

Toutes les requêtes sont routées automatiquement vers le service **Acceuil** via Eureka.

## Démarrage

### Prérequis
1. Démarrer **Eureka Server** sur le port 8761
2. Démarrer **Config Server** sur le port 8888
3. Démarrer les services microservices (Acceuil, Enrollment)

### Lancement du Gateway
```bash
cd spring-microservice/gateway
mvn spring-boot:run
```

Le Gateway sera accessible sur : `http://localhost:8090`

## Configuration détaillée

### Propriétés d'application
- **Port** : `8090`
- **Service name** : `Gateway`

### Fichier de configuration (gateway.yml)
```yaml
spring:
  cloud:
    gateway:
      server:
        webflux:
          routes:
            - id: enrollment
              uri: lb://enrollment
              predicates:
                - Path=/api/enrollment/**

            - id: acceuil
              uri: lb://acceuil
              predicates:
                - Path=/api/acceuil/**

server:
  port: 8090
```

## Dépendances Maven

- `spring-cloud-starter-gateway` : Spring Cloud Gateway
- `spring-cloud-starter-netflix-eureka-client` : Service discovery
- `spring-cloud-starter-config` : Configuration centralisée
- `spring-boot-starter-actuator` : Monitoring et métriques

## Tests

### Tester le routage
```bash
# Test route Enrollment
curl -X GET http://localhost:8090/api/enrollment/health

# Test route Acceuil
curl -X POST http://localhost:8090/api/acceuil/api/start \
  -H "Content-Type: application/json" \
  -d '{"visiteurId":"test-123"}'
```

### Tester l'interface Web
Ouvrir un navigateur et accéder à : `http://localhost:8090/`

## Architecture globale

```
                    ┌──────────────────┐
                    │   Browser        │
                    │  (port 8090)     │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │   Gateway        │
                    │  (port 8090)     │
                    └────────┬─────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
       ┌────────▼────────┐       ┌───────▼────────┐
       │   Enrollment    │       │   Acceuil      │
       │  (port 8081)    │       │  (port 8083)   │
       └─────────────────┘       └────────┬───────┘
                                          │
                                 ┌────────▼────────┐
                                 │ Camunda/Zeebe   │
                                 │  (port 26500)   │
                                 └─────────────────┘
```

## Ressources

- **Configuration** : `config-repo/gateway.yml`
- **Interface Acceuil** : `src/main/resources/static/index.html`
- **Application** : `src/main/resources/application.yml`

## Notes importantes

### Avantages de l'hébergement de l'interface sur le Gateway
1. **Point d'entrée unique** : Tous les appels passent par le Gateway
2. **Simplification** : Pas besoin de CORS ou de configuration supplémentaire
3. **Load Balancing** : Le Gateway peut distribuer la charge entre plusieurs instances
4. **Sécurité** : Centralisation des règles de sécurité
5. **Monitoring** : Traçabilité complète des requêtes

### Évolutions possibles
- Ajouter de l'authentification (OAuth2, JWT)
- Configurer des rate limits
- Ajouter des filtres personnalisés
- Implémenter un circuit breaker (Resilience4j)
