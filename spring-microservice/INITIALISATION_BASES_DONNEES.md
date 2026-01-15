# 🗄️ Initialisation des Bases de Données

Ce document explique comment les bases de données sont initialisées au démarrage de l'application PITM.

## 📋 Processus d'initialisation

### 1️⃣ Au démarrage de l'application

Lorsque vous exécutez `./start-services.sh`, voici ce qui se passe :

```bash
./start-services.sh
  ↓
  Appelle ./init-databases.sh
  ↓
  1. Vérifie que PostgreSQL est en cours d'exécution
  2. Crée les bases de données (si elles n'existent pas)
     - auth_db
     - acceuil_db  
     - expertise_db
  3. Exécute tous les scripts SQL de /postgres-init/ dans l'ordre
  ↓
  Démarre les services Spring Boot
  ↓
  Hibernate crée/met à jour les tables automatiquement
```

### 2️⃣ Scripts SQL exécutés

Les scripts dans `/postgres-init/` sont exécutés **dans l'ordre alphabétique** :

| Ordre | Script | Action |
|-------|--------|--------|
| 1 | `00-init-keycloak-db.sql` | Crée la base Keycloak |
| 2 | `01-init-auth-db.sql` | Crée la base Auth |
| 3 | `02-init-acceuil-db.sql` | Crée la base Accueil |
| 4 | `03-init-expertise-db.sql` | Crée la base Expertise |
| 5 | `05-update-utilisateurs-profil-pro.sql` | Migration : Ajoute champs professionnels |
| 6 | `06-migration-expertise-remove-columns.sql` | Migration : Supprime colonnes obsolètes |

### 3️⃣ Création des tables par Hibernate

Après l'exécution des scripts SQL, chaque service Spring Boot démarre et **Hibernate crée automatiquement les tables** grâce à `ddl-auto: update` :

#### Service Auth (`auth_db`)
```sql
CREATE TABLE utilisateurs (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    nom VARCHAR(255),
    prenom VARCHAR(255),
    type_personne VARCHAR(50),
    photo_url VARCHAR(500),
    domaine_expertise VARCHAR(255),
    experience VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE flyway_schema_history (
    -- Géré par Flyway
);
```

#### Service Accueil (`acceuil_db`)
**Aucune table** - Service sans état qui agrège les données des autres services.

#### Service Expertise (`expertise_db`)
```sql
CREATE TABLE expertises (
    id BIGSERIAL PRIMARY KEY,
    utilisateur_id VARCHAR(255) UNIQUE NOT NULL,
    titre VARCHAR(255),
    description TEXT,
    localisation VARCHAR(255),
    ville VARCHAR(255),
    pays VARCHAR(255),
    est_publie BOOLEAN DEFAULT FALSE,
    est_disponible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE competences (
    id BIGSERIAL PRIMARY KEY,
    utilisateur_id VARCHAR(255) NOT NULL,
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    niveau_maitrise INTEGER,
    annees_experience INTEGER,
    thm DECIMAL(10,2),
    nombre_projets INTEGER,
    certifications TEXT,
    est_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE flyway_schema_history (
    -- Géré par Flyway
);
```

## 🔄 Idempotence

Tous les scripts sont **idempotents**, c'est-à-dire qu'ils peuvent être exécutés plusieurs fois sans erreur :

```sql
-- Exemple d'idempotence
SELECT 'CREATE DATABASE auth_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'auth_db')\gexec
```

Si la base existe déjà, elle n'est pas recréée.

## 🛠️ Scripts utilitaires

### Initialisation manuelle
```bash
cd /Users/abdramane/WindsurfProjects/projects/spring-microservice
./init-databases.sh
```

### Vérification de l'état
```bash
./verify-databases.sh
```

### Réinitialisation complète
```bash
# Arrêter les services
./stop-services.sh

# Supprimer les bases (ATTENTION: perte de données!)
docker exec postgres17 psql -U postgres -c "DROP DATABASE IF EXISTS auth_db;"
docker exec postgres17 psql -U postgres -c "DROP DATABASE IF EXISTS acceuil_db;"
docker exec postgres17 psql -U postgres -c "DROP DATABASE IF EXISTS expertise_db;"

# Réinitialiser
./init-databases.sh

# Redémarrer
./start-services.sh
```

## 📊 Configuration Hibernate

### Service Auth (`auth.yml`)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5433/auth_db
    username: postgres
    password: admin
  
  jpa:
    hibernate:
      ddl-auto: update  # Crée/met à jour les tables automatiquement
    show-sql: true
  
  flyway:
    enabled: true  # Gère les migrations
    baseline-on-migrate: true
```

### Service Accueil (`acceuil.yml`)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5433/acceuil_db
    username: postgres
    password: admin
  
  jpa:
    hibernate:
      ddl-auto: update  # Prêt pour futures tables
    show-sql: true
```

### Service Expertise (`expertise.yml`)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5433/expertise_db
    username: postgres
    password: admin
  
  jpa:
    hibernate:
      ddl-auto: update  # Crée/met à jour les tables automatiquement
    show-sql: true
  
  flyway:
    enabled: true  # Gère les migrations
    baseline-on-migrate: true
```

## ✅ Vérification du bon fonctionnement

### 1. Vérifier que PostgreSQL est démarré
```bash
docker ps | grep postgres17
```

### 2. Vérifier les bases de données
```bash
docker exec postgres17 psql -U postgres -c "\l" | grep -E "auth_db|acceuil_db|expertise_db"
```

### 3. Vérifier les tables
```bash
# Auth
docker exec postgres17 psql -U postgres -d auth_db -c "\dt"

# Accueil
docker exec postgres17 psql -U postgres -d acceuil_db -c "\dt"

# Expertise
docker exec postgres17 psql -U postgres -d expertise_db -c "\dt"
```

### 4. Vérifier les services
```bash
curl http://localhost:8084/actuator/health  # Auth
curl http://localhost:8083/actuator/health  # Accueil
curl http://localhost:8086/actuator/health  # Expertise
```

## 🔍 Dépannage

### Problème : "database does not exist"
**Solution** : Exécuter `./init-databases.sh`

### Problème : "table does not exist"
**Solution** : 
1. Vérifier que le service a bien démarré
2. Vérifier les logs : `tail -f logs/{service}.log`
3. Vérifier la configuration Hibernate (`ddl-auto: update`)

### Problème : Scripts SQL non exécutés
**Solution** : 
1. Vérifier que `/postgres-init/` contient les scripts
2. Exécuter manuellement : `./init-databases.sh`
3. Vérifier les permissions : `chmod +x init-databases.sh`

### Problème : Flyway migration failed
**Solution** :
1. Vérifier la table `flyway_schema_history`
2. Si nécessaire, réinitialiser Flyway :
```sql
DELETE FROM flyway_schema_history WHERE version = 'X';
```

## 📝 Notes importantes

1. **Premier démarrage** : Les scripts SQL + Hibernate créent tout automatiquement
2. **Démarrages suivants** : Seules les nouvelles migrations sont appliquées
3. **Données préservées** : `ddl-auto: update` ne supprime jamais de données
4. **Ordre d'exécution** : Scripts SQL → Hibernate → Flyway migrations
5. **Idempotence** : Tous les scripts peuvent être réexécutés sans risque

## 🎯 Résumé

✅ **Oui**, les scripts d'initialisation sont **toujours exécutés** au démarrage via `start-services.sh`

✅ Les bases de données sont **créées automatiquement** si elles n'existent pas

✅ Les tables sont **créées automatiquement** par Hibernate au premier démarrage

✅ Les migrations sont **appliquées automatiquement** par Flyway

✅ Le processus est **idempotent** et **sûr** pour les données existantes

L'application est **prête à fonctionner** dès le premier `./start-services.sh` ! 🚀
