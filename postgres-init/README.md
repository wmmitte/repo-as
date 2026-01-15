# Scripts d'initialisation PostgreSQL

Ce dossier contient les scripts d'initialisation des bases de données pour tous les services de l'application PITM.

## 📋 Ordre d'exécution des scripts

Les scripts sont exécutés automatiquement par PostgreSQL dans l'ordre alphabétique au démarrage du conteneur.

### Scripts d'initialisation

| Script | Description | Base de données créée |
|--------|-------------|----------------------|
| `00-init-keycloak-db.sql` | Initialise la base Keycloak pour l'authentification OAuth2 | `keycloak_db` |
| `01-init-auth-db.sql` | Initialise la base du service Auth | `auth_db` |
| `02-init-acceuil-db.sql` | Initialise la base du service Accueil | `acceuil_db` |
| `03-init-expertise-db.sql` | Initialise la base du service Expertise | `expertise_db` |

### Scripts de migration

| Script | Description | Appliqué sur |
|--------|-------------|--------------|
| `05-update-utilisateurs-profil-pro.sql` | Ajoute les champs professionnels à la table utilisateurs | `auth_db` |
| `06-migration-expertise-remove-columns.sql` | Supprime les colonnes obsolètes de la table expertises | `expertise_db` |

## 🗄️ Structure des bases de données

### 1. `keycloak_db` (Keycloak)
**Service**: Keycloak (Authentification OAuth2)
**Port**: 8098
**Tables**: ~92 tables (gérées par Keycloak)

### 2. `auth_db` (Service Auth)
**Service**: Auth
**Port**: 8084
**Tables**:
- `utilisateurs` - Informations des utilisateurs (physiques et morales)
- `flyway_schema_history` - Historique des migrations Flyway

**Modèle de données**:
```sql
CREATE TABLE utilisateurs (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    nom VARCHAR(255),
    prenom VARCHAR(255),
    photo_url VARCHAR(500),
    type_personne VARCHAR(50), -- PHYSIQUE ou MORALE
    domaine_expertise VARCHAR(255),
    experience VARCHAR(255),
    -- autres champs...
);
```

### 3. `acceuil_db` (Service Accueil)
**Service**: Accueil
**Port**: 8083
**Tables** (créées automatiquement par Hibernate):
- `analyse_comportementale` - Analyse du comportement utilisateur
- `analyse_contextuelle` - Analyse contextuelle des besoins
- `analyse_technologique` - Analyse des technologies
- `expert` - Cache temporaire des experts

**Note**: Les tables sont créées automatiquement au premier démarrage du service (Hibernate `ddl-auto: update`)

### 4. `expertise_db` (Service Expertise)
**Service**: Expertise
**Port**: 8086
**Tables**:
- `expertises` - Profils d'expertise des utilisateurs
- `competences` - Compétences détaillées par utilisateur
- `flyway_schema_history` - Historique des migrations Flyway

**Modèle de données**:
```sql
CREATE TABLE expertises (
    id BIGSERIAL PRIMARY KEY,
    utilisateur_id VARCHAR(255) UNIQUE NOT NULL,
    titre VARCHAR(255),
    description TEXT,
    localisation VARCHAR(255),
    est_publie BOOLEAN DEFAULT FALSE,
    -- autres champs...
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
    -- autres champs...
);
```

## 🔧 Configuration Hibernate

Tous les services utilisent Hibernate avec `ddl-auto: update` :
- Les tables sont créées automatiquement si elles n'existent pas
- Les colonnes manquantes sont ajoutées automatiquement
- Les données existantes sont préservées

## 🚀 Utilisation

### Initialisation automatique

Les scripts sont exécutés automatiquement au démarrage de PostgreSQL :
```bash
docker start postgres17
```

### Initialisation manuelle

Pour réinitialiser les bases de données :
```bash
cd /Users/abdramane/WindsurfProjects/projects/spring-microservice
./init-databases.sh
```

### Vérification

Pour vérifier l'état des bases de données :
```bash
cd /Users/abdramane/WindsurfProjects/projects/spring-microservice
./verify-databases.sh
```

## 📊 Connexions aux bases de données

### Paramètres de connexion

| Base de données | Host | Port | User | Password |
|----------------|------|------|------|----------|
| `keycloak_db` | localhost | 5433 | postgres | admin |
| `auth_db` | localhost | 5433 | postgres | admin |
| `acceuil_db` | localhost | 5433 | postgres | admin |
| `expertise_db` | localhost | 5433 | postgres | admin |

### Connexion via psql

```bash
# Keycloak
docker exec -it postgres17 psql -U postgres -d keycloak_db

# Auth
docker exec -it postgres17 psql -U postgres -d auth_db

# Accueil
docker exec -it postgres17 psql -U postgres -d acceuil_db

# Expertise
docker exec -it postgres17 psql -U postgres -d expertise_db
```

## 🔄 Migrations

### Flyway

Les services Auth et Expertise utilisent Flyway pour gérer les migrations :
- Les migrations sont dans `src/main/resources/db/migration`
- Format: `V{version}__{description}.sql`
- Exemple: `V1__create_utilisateurs_table.sql`

### Hibernate

Le service Accueil utilise uniquement Hibernate :
- Pas de migrations Flyway
- Tables créées/mises à jour automatiquement
- Schéma géré par les annotations JPA

## ⚠️ Notes importantes

1. **Ordre des scripts**: Les scripts sont exécutés dans l'ordre alphabétique
2. **Idempotence**: Tous les scripts sont idempotents (peuvent être exécutés plusieurs fois)
3. **Données**: Les scripts de migration préservent les données existantes
4. **Nomenclature**: Toutes les bases suivent le pattern `{service}_db`

## 🛠️ Maintenance

### Ajouter une nouvelle base de données

1. Créer un script `0X-init-{service}-db.sql`
2. Utiliser le template :
```sql
-- Créer la base de données
SELECT 'CREATE DATABASE {service}_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '{service}_db')\gexec

-- Se connecter
\c {service}_db

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Base de données {service}_db créée ou déjà existante';
END $$;
```

### Ajouter une migration

1. Pour Flyway : Créer un fichier dans `src/main/resources/db/migration`
2. Pour Hibernate : Modifier les entités JPA

## 📝 Historique des modifications

- **2025-11-16**: Renommage `pitm_auth` → `auth_db` pour cohérence
- **2025-11-16**: Ajout de la configuration BD pour le service Accueil
- **2025-11-16**: Réorganisation des scripts d'initialisation
