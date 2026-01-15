# 🚀 Plateforme d'Intermédiation - Microservices

Architecture microservices Spring Boot avec Spring Cloud, Eureka, et Gateway.

## 📋 Prérequis

- **Java 17+**
- **Maven 3.8+**
- **Docker** (pour PostgreSQL)
- **PostgreSQL 17** (via Docker)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Gateway (8090)                          │
│                    Point d'entrée unique                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┬──────────────┐
        │              │               │              │
   ┌────▼────┐   ┌────▼────┐    ┌────▼────┐   ┌────▼────┐
   │  Auth   │   │ Acceuil │    │Expertise│   │  ...    │
   │  8084   │   │  8083   │    │  8086   │   │         │
   └────┬────┘   └────┬────┘    └────┬────┘   └─────────┘
        │             │              │
        └─────────────┼──────────────┘
                      │
        ┌─────────────▼──────────────┐
        │   Eureka Registry (8761)    │
        │   Service Discovery         │
        └─────────────┬───────────────┘
                      │
        ┌─────────────▼──────────────┐
        │  Config Server (8888)       │
        │  Configuration centralisée  │
        └─────────────────────────────┘
```

## 🗄️ Bases de données

Chaque microservice a sa propre base de données PostgreSQL :

- **auth_db** - Service Auth (utilisateurs, authentification)
- **acceuil_db** - Service Acceuil (page d'accueil, expertises publiques)
- **expertise_db** - Service Expertise (profils d'expertise, compétences)

## 🚀 Démarrage rapide

### 1. Démarrer PostgreSQL

```bash
docker start postgres17
```

### 2. Démarrer tous les services

```bash
./start-services.sh
```

Ce script va :
1. ✅ Initialiser automatiquement les bases de données
2. ✅ Démarrer Config Server (8888)
3. ✅ Démarrer Eureka Registry (8761)
4. ✅ Démarrer Service Auth (8084)
5. ✅ Démarrer Service Acceuil (8083)
6. ✅ Démarrer Service Expertise (8086)
7. ✅ Démarrer Gateway (8090)

### 3. Accéder à l'application

- **Application** : http://localhost:8090
- **Eureka Dashboard** : http://localhost:8761
- **Config Server** : http://localhost:8888 (root/s3cr3t)

## 🛑 Arrêter les services

```bash
./stop-services.sh
```

## 📝 Logs

Les logs de chaque service sont disponibles dans le dossier `logs/` :

```bash
tail -f logs/config-server.log
tail -f logs/eureka.log
tail -f logs/auth.log
tail -f logs/acceuil.log
tail -f logs/expertise.log
tail -f logs/gateway.log
```

## 🔧 Initialisation manuelle des bases de données

Si besoin, vous pouvez initialiser les bases de données manuellement :

```bash
./init-databases.sh
```

## 📦 Services

### Config Server (8888)
Configuration centralisée pour tous les microservices.
- Repository Git : `config-repo/`
- Authentification : `root` / `s3cr3t`

### Eureka Registry (8761)
Service de découverte pour l'enregistrement et la localisation des microservices.

### Service Auth (8084)
Gestion des utilisateurs et authentification OAuth2 avec Keycloak.
- Base de données : `auth_db`
- Endpoints : `/api/auth/**`

### Service Acceuil (8083)
Page d'accueil et affichage des expertises publiques.
- Base de données : `acceuil_db`
- Endpoints : `/api/acceuil/**`

### Service Expertise (8086)
Gestion des profils d'expertise et compétences des utilisateurs.
- Base de données : `expertise_db`
- Endpoints : `/api/expertise/**`
- Endpoints publics : `/api/expertise/public/**`

### Gateway (8090)
Point d'entrée unique de l'application avec :
- Routage vers les microservices
- Authentification OAuth2
- Frontend React intégré
- Propagation des headers utilisateur

## 🔐 Sécurité

### Backend
- Spring Security avec OAuth2
- Vérification du header `X-User-Id` dans chaque endpoint protégé
- Endpoints publics : `/api/*/public/**`, `/actuator/health`

### Frontend
- Routes protégées avec `RequireAuth`
- Gestion de session avec contexte React
- Redirection automatique si non authentifié

## 🧪 Tests

### Tester un endpoint protégé
```bash
# Sans authentification (doit retourner 401)
curl http://localhost:8086/api/expertise/mon-expertise

# Via le Gateway authentifié (OK)
# Se connecter via le navigateur puis utiliser les cookies
```

### Tester un endpoint public
```bash
curl http://localhost:8086/api/expertise/public/expertises
```

## 📚 Documentation API

### Service Expertise

#### Endpoints protégés (nécessitent authentification)
- `GET /api/expertise` - Expertise complète de l'utilisateur
- `GET /api/expertise/mon-expertise` - Mon profil d'expertise
- `POST /api/expertise/mon-expertise` - Créer/Modifier mon expertise
- `PUT /api/expertise/mon-expertise/publier` - Publier mon expertise
- `PUT /api/expertise/mon-expertise/depublier` - Dépublier mon expertise
- `GET /api/expertise/competences` - Mes compétences
- `POST /api/expertise/competences` - Ajouter une compétence
- `PUT /api/expertise/competences/{id}` - Modifier une compétence
- `DELETE /api/expertise/competences/{id}` - Supprimer une compétence

#### Endpoints publics
- `GET /api/expertise/public/expertises` - Liste des expertises publiées
- `GET /api/expertise/health` - Health check

## 🛠️ Développement

### Démarrer un service individuellement

```bash
cd <service-name>
mvn spring-boot:run
```

### Recompiler le frontend

```bash
cd gateway/src/main/resources/frontend
npm run build
```

### Ajouter une nouvelle base de données

1. Modifier `init-databases.sh`
2. Ajouter la ligne : `create_database "nouvelle_db"`
3. Créer le fichier de configuration dans `config-repo/`

## 🐛 Dépannage

### Service ne démarre pas
1. Vérifier les logs : `tail -f logs/<service>.log`
2. Vérifier que PostgreSQL est démarré
3. Vérifier que les bases de données existent : `./init-databases.sh`
4. Vérifier que Config Server est accessible

### Base de données inexistante
```bash
./init-databases.sh
```

### Port déjà utilisé
```bash
./stop-services.sh
# Ou manuellement
lsof -ti:<port> | xargs kill -9
```

## 📄 Licence

Propriétaire - Tous droits réservés
