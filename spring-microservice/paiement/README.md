# Microservice Paiement

## Description
Le microservice **Paiement** gère l'ensemble des transactions financières de la plateforme d'intermédiation. Il permet de créer, valider, rejeter et suivre les paiements effectués par les utilisateurs.

## Fonctionnalités

### 1. Gestion des paiements
- Création de nouveaux paiements
- Validation de paiements
- Rejet de paiements
- Consultation de l'historique des paiements
- Recherche par utilisateur

### 2. Types de paiement supportés
- Carte bancaire
- Virement bancaire
- Mobile Money
- PayPal

### 3. Statuts de paiement
- **EN_ATTENTE** : Paiement en cours de traitement
- **VALIDE** : Paiement validé et accepté
- **REJETE** : Paiement rejeté
- **REMBOURSE** : Paiement remboursé

## Architecture

### Structure du projet
```
paiement/
├── src/
│   ├── main/
│   │   ├── java/com/intermediation/paiement/
│   │   │   ├── config/           # Configuration (CORS, etc.)
│   │   │   ├── controller/       # Controllers REST
│   │   │   ├── dto/              # Data Transfer Objects
│   │   │   ├── entity/           # Entités JPA
│   │   │   ├── repository/       # Repositories JPA
│   │   │   ├── service/          # Services métier
│   │   │   └── PaiementApplication.java
│   │   └── resources/
│   │       ├── application.yml
│   │       └── db/migration/     # Scripts Flyway
│   └── test/
│       └── java/com/intermediation/paiement/
└── pom.xml
```

## Configuration

### Base de données
- **Type** : PostgreSQL
- **Nom** : `paiement_db`
- **Port** : 5432

### Migrations Flyway
Le service utilise Flyway pour gérer automatiquement le schéma de la base de données au démarrage.

**Migrations disponibles:**
- `V1__create_paiement_table.sql` : Création de la table tc_paiement avec index et contraintes
- `V2__insert_sample_data.sql` : Insertion de données de test (développement)

**Fonctionnement:**
1. Au démarrage du service, Flyway vérifie la version du schéma
2. Applique automatiquement les migrations manquantes
3. Les migrations sont versionnées et ne s'exécutent qu'une seule fois
4. Configuration dans `db-common.yml`:
   - `flyway.enabled: true`
   - `flyway.baseline-on-migrate: true`
   - `flyway.locations: classpath:db/migration`

### Serveur
- **Port** : 8085
- **Context path** : `/api/paiement`

### Sécurité
- OAuth2 Resource Server avec JWT
- Authentification via Keycloak
- Configuration centralisée via `security-common.yml`

## API REST

### Endpoints disponibles

#### Créer un paiement
```bash
POST /api/paiement/paiements
Content-Type: application/json
Authorization: Bearer <token>

{
  "utilisateurId": "uuid",
  "montant": 100.00,
  "devise": "EUR",
  "type": "CARTE_BANCAIRE",
  "description": "Paiement pour service X"
}
```

#### Valider un paiement
```bash
PUT /api/paiement/paiements/{id}/valider
Authorization: Bearer <token>
```

#### Rejeter un paiement
```bash
PUT /api/paiement/paiements/{id}/rejeter
Authorization: Bearer <token>
```

#### Consulter un paiement
```bash
GET /api/paiement/paiements/{id}
Authorization: Bearer <token>
```

#### Lister tous les paiements
```bash
GET /api/paiement/paiements
Authorization: Bearer <token>
```

#### Paiements d'un utilisateur
```bash
GET /api/paiement/paiements/utilisateur/{utilisateurId}
Authorization: Bearer <token>
```

## Modèle de données

### Entité Paiement
```java
- id: UUID (PK)
- utilisateurId: UUID (FK vers utilisateur)
- montant: BigDecimal
- devise: String
- statut: StatutPaiement (ENUM)
- type: TypePaiement (ENUM)
- reference: String (unique)
- description: String
- dateCreation: LocalDateTime
- dateValidation: LocalDateTime
```

## Démarrage

### Prérequis
1. PostgreSQL installé et démarré
2. Config Server sur le port 8888
3. Eureka Server sur le port 8761
4. Keycloak sur le port 8098

### Étapes de démarrage

#### 1. Créer la base de données PostgreSQL
```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE paiement_db;

# Quitter PostgreSQL
\q
```

**Ou utiliser le script d'initialisation:**
```bash
psql -U postgres -f ../postgres-init/04-init-paiement-db.sql
```

#### 2. Lancer le service

**Avec Maven:**
```bash
cd paiement
mvn spring-boot:run
```

**Avec le projet parent:**
```bash
cd spring-microservice
mvn spring-boot:run -pl paiement
```

#### 3. Vérifications au démarrage

Le service va automatiquement:
1. Se connecter au Config Server pour récupérer la configuration
2. Se connecter à la base de données `paiement_db`
3. **Exécuter les migrations Flyway** pour créer les tables et insérer les données de test
4. S'enregistrer auprès d'Eureka
5. Exposer les endpoints REST sur le port 8085

**Logs à surveiller:**
```
Flyway Community Edition ... by Redgate
Database: jdbc:postgresql://localhost:5432/paiement_db (PostgreSQL 14.x)
Successfully validated 2 migrations
Current version of schema "public": << Empty Schema >>
Migrating schema "public" to version "1 - create paiement table"
Migrating schema "public" to version "2 - insert sample data"
Successfully applied 2 migrations to schema "public"
```

#### 4. Vérifier que le service est démarré

```bash
# Vérifier l'enregistrement Eureka
curl http://localhost:8761/eureka/apps/PAIEMENT

# Vérifier le health endpoint
curl http://localhost:8085/api/paiement/actuator/health

# Via le Gateway
curl http://localhost:8090/api/paiement/actuator/health
```

## Dépendances

### Spring Boot
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-web`
- `spring-boot-starter-data-rest`

### Spring Cloud
- `spring-cloud-starter-netflix-eureka-client`
- `spring-cloud-starter-config`

### Sécurité
- `lib-security` (module interne)
- OAuth2 Resource Server

### Base de données
- PostgreSQL
- Flyway (migrations)

## Configuration centralisée

Le service utilise la configuration centralisée via Config Server:
- **common.yml** : Configuration Eureka et logging
- **db-common.yml** : Configuration PostgreSQL et Flyway
- **security-common.yml** : Configuration OAuth2/JWT
- **paiement.yml** : Configuration spécifique au service

## Tests

### Lancer les tests
```bash
mvn test
```

## Intégration avec le Gateway

Le service est accessible via le Gateway sur le port 8090:
```
http://localhost:8090/api/paiement/**
```

La route est configurée dans `config-repo/gateway.yml`:
```yaml
- id: paiement
  uri: lb://PAIEMENT
  predicates:
    - Path=/api/paiement/**
```

## Monitoring

Endpoints Actuator disponibles:
- Health: `/api/paiement/actuator/health`
- Info: `/api/paiement/actuator/info`

## Auteur
Service créé pour la plateforme d'intermédiation

## Notes importantes

1. **Sécurité** : Tous les endpoints sont protégés par OAuth2/JWT
2. **Validation** : Les montants doivent être strictement positifs
3. **Références** : Chaque paiement génère une référence unique (PAY-XXXXXXXX)
4. **Auditabilité** : Toutes les dates de création et validation sont enregistrées
5. **Performance** : Index créés sur utilisateur_id, statut, date_creation et reference
