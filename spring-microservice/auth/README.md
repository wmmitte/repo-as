# 🔐 Microservice Auth - Authentification et Inscription

## 📋 Vue d'ensemble

Service dédié à la gestion de l'authentification et de l'inscription des utilisateurs via **OAuth2 Social Login** (Google, Facebook, Apple) en utilisant **Keycloak**.

## 🎯 Fonctionnalités

- ✅ **Authentification sociale** (Google, Facebook, Apple) via Keycloak
- ✅ **Inscription automatique** lors de la première connexion
- ✅ **Gestion unifiée** : même flux pour inscription et connexion
- ✅ **Base de données utilisateurs** avec PostgreSQL
- ✅ **Liaison multi-providers** : un utilisateur peut se connecter avec plusieurs providers
- ✅ **JWT tokens** pour l'authentification API

## 🏗️ Architecture

```
Frontend (Gateway)
    ↓
    └─→ /oauth2/authorization/keycloak
          ↓
Keycloak (Port 8098)
    ↓
    ├─→ Google OAuth
    ├─→ Facebook OAuth
    └─→ Apple OAuth
          ↓
Service Auth (Port 8084)
    ↓
    ├─→ Callback OAuth2
    ├─→ Inscription/Connexion automatique
    └─→ Stockage dans PostgreSQL
```

## 🚀 Démarrage

### Prérequis

1. **Keycloak** en cours d'exécution sur le port 8098
2. **PostgreSQL** avec une base de données `pitm_auth`
3. **Registry (Eureka)** sur le port 8761
4. **Config Server** sur le port 8888

### Configuration de la base de données

```sql
-- Créer la base de données
CREATE DATABASE pitm_auth;

-- L'utilisateur postgres doit avoir accès
GRANT ALL PRIVILEGES ON DATABASE pitm_auth TO postgres;
```

### Démarrer le service

```bash
cd /Users/abdramane/WindsurfProjects/projects/spring-microservice/auth
mvn spring-boot:run
```

Le service démarre sur le port **8084**.

## 📡 Endpoints

### Publics

- `GET /api/health` - Vérification de l'état du service
- `GET /actuator/health` - Actuator health check

### OAuth2 (gérés par Spring Security)

- `GET /oauth2/authorization/keycloak` - Démarre le flux OAuth2
- `GET /login/oauth2/code/keycloak` - Callback OAuth2 (automatique)

### Authentifiés

- `GET /api/me` - Informations de l'utilisateur connecté
- `POST /api/logout` - Déconnexion

## 🗄️ Modèle de données

### Table `utilisateurs`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `email` | VARCHAR(255) | Email (unique) |
| `nom` | VARCHAR(100) | Nom de famille |
| `prenom` | VARCHAR(100) | Prénom |
| `photo_url` | TEXT | URL de la photo de profil |
| `google_id` | VARCHAR(255) | ID Google (unique) |
| `facebook_id` | VARCHAR(255) | ID Facebook (unique) |
| `apple_id` | VARCHAR(255) | ID Apple (unique) |
| `mot_de_passe_hash` | TEXT | Hash du mot de passe (optionnel) |
| `date_creation` | TIMESTAMP | Date de création du compte |
| `derniere_connexion` | TIMESTAMP | Dernière connexion |
| `actif` | BOOLEAN | Compte actif ou non |

## 🔄 Flux d'authentification

### 1. Première connexion (Inscription)

```
1. Utilisateur clique "Continuer avec Google" sur le frontend
2. Redirection vers /oauth2/authorization/keycloak
3. Keycloak redirige vers Google
4. Utilisateur s'authentifie sur Google
5. Google redirige vers Keycloak avec le code
6. Keycloak échange le code contre un token et redirige vers le service Auth
7. Service Auth :
   - Vérifie si l'email existe → NON
   - Crée un nouvel utilisateur
   - Stocke google_id, nom, prénom, photo
8. Retourne les informations utilisateur
```

### 2. Connexions suivantes

```
1-6. Même flux jusqu'au service Auth
7. Service Auth :
   - Vérifie si l'email existe → OUI
   - Met à jour derniere_connexion
   - Met à jour la photo si changée
8. Retourne les informations utilisateur
```

### 3. Connexion avec un provider différent (même email)

```
1-6. Même flux jusqu'au service Auth
7. Service Auth :
   - Trouve l'utilisateur par email
   - Lie le nouveau provider (ex: ajoute facebook_id)
   - L'utilisateur peut maintenant se connecter avec Google OU Facebook
8. Retourne les informations utilisateur
```

## 🔗 Intégration avec le Gateway

Le Gateway doit router les requêtes vers le service Auth :

```yaml
# gateway application.yml
spring:
  cloud:
    gateway:
      routes:
        - id: auth-service
          uri: lb://AUTH
          predicates:
            - Path=/api/auth/**,/oauth2/**,/login/**
```

## 🧪 Tests

```bash
# Vérifier que le service est en cours d'exécution
curl http://localhost:8084/api/health

# Tester l'endpoint me (nécessite authentification)
curl http://localhost:8084/api/me
```

## 📝 Configuration Keycloak requise

1. **Créer le Realm** : `pitm`
2. **Créer le Client** : `pitm-auth-service`
3. **Configurer les Identity Providers** :
   - Google
   - Facebook
   - Apple (optionnel)

## 🔧 Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `KEYCLOAK_CLIENT_SECRET` | Secret du client Keycloak | `secret` |
| `DB_USERNAME` | Utilisateur PostgreSQL | `postgres` |
| `DB_PASSWORD` | Mot de passe PostgreSQL | `postgres` |

## 📚 Dépendances principales

- Spring Boot Web
- Spring Security OAuth2 Client
- Spring Security OAuth2 Resource Server
- Spring Data JPA
- PostgreSQL Driver
- Spring Cloud Netflix Eureka Client
- Spring Cloud Config Client

## 🎯 Prochaines étapes

- [ ] Implémenter le refresh token
- [ ] Ajouter la gestion des rôles et permissions
- [ ] Créer un endpoint pour compléter le profil utilisateur
- [ ] Implémenter l'authentification par email/mot de passe (optionnel)
- [ ] Ajouter des métriques et monitoring
