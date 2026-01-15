# Guide Flyway - Microservice Paiement

## Qu'est-ce que Flyway?

Flyway est un outil de gestion de migrations de base de données qui permet de versionner et d'appliquer automatiquement les changements de schéma au démarrage de l'application.

## Configuration dans le projet

### Configuration centralisée (db-common.yml)
```yaml
spring:
  flyway:
    enabled: true                    # Active Flyway
    baseline-on-migrate: true        # Permet de migrer une BDD existante
    baseline-version: 0              # Version de base
    locations: classpath:db/migration # Emplacement des scripts
    schemas: public                   # Schéma PostgreSQL
```

### Configuration JPA
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate  # Hibernate valide seulement, Flyway gère le schéma
```

## Structure des migrations

### Emplacement
```
paiement/src/main/resources/db/migration/
├── V1__create_paiement_table.sql
├── V2__insert_sample_data.sql
└── V3__future_migration.sql (exemple)
```

### Convention de nommage
- **Format:** `V{version}__{description}.sql`
- **Version:** Numéro séquentiel (V1, V2, V3, etc.)
- **Séparateur:** Deux underscores `__`
- **Description:** Description en snake_case

**Exemples:**
- ✅ `V1__create_paiement_table.sql`
- ✅ `V2__insert_sample_data.sql`
- ✅ `V3__add_column_commission.sql`
- ❌ `V1_create_table.sql` (un seul underscore)
- ❌ `create_table.sql` (pas de version)

## Migrations existantes

### V1__create_paiement_table.sql
**Objectif:** Création de la table principale des paiements

**Contenu:**
- Table `tc_paiement` avec tous les champs
- Contraintes de validation (CHECK)
- Index pour optimiser les requêtes
- Commentaires sur la table et les colonnes

**Éléments créés:**
- Table principale
- 4 index (utilisateur_id, statut, date_creation, reference)
- 3 contraintes (statut, type, montant)

### V2__insert_sample_data.sql
**Objectif:** Insertion de données de test pour le développement

**Contenu:**
- 3 paiements en attente
- 2 paiements validés
- 1 paiement rejeté

**Note:** Ces données peuvent être supprimées en production

## Fonctionnement au démarrage

### 1. Connexion à la base de données
```
Spring Boot démarre → Se connecte à paiement_db
```

### 2. Vérification de Flyway
```
Flyway vérifie la table flyway_schema_history
├── Table existe? → Compare les versions
└── Table n'existe pas? → Crée la table et applique toutes les migrations
```

### 3. Application des migrations
```
Pour chaque migration non appliquée:
├── Exécute le script SQL
├── Enregistre dans flyway_schema_history
└── Continue avec la migration suivante
```

### 4. Logs typiques
```
Flyway Community Edition by Redgate
Database: jdbc:postgresql://localhost:5432/paiement_db
Successfully validated 2 migrations
Current version of schema "public": << Empty Schema >>
Migrating schema "public" to version "1 - create paiement table"
Migrating schema "public" to version "2 - insert sample data"
Successfully applied 2 migrations to schema "public"
```

## Table de suivi Flyway

Flyway crée automatiquement la table `flyway_schema_history`:

```sql
SELECT * FROM flyway_schema_history;
```

**Colonnes:**
- `installed_rank`: Ordre d'exécution
- `version`: Version de la migration (1, 2, 3, etc.)
- `description`: Description de la migration
- `type`: Type (SQL, Java, etc.)
- `script`: Nom du fichier
- `checksum`: Hash pour détecter les modifications
- `installed_by`: Utilisateur qui a exécuté
- `installed_on`: Date d'exécution
- `execution_time`: Temps d'exécution en ms
- `success`: Statut (true/false)

## Ajouter une nouvelle migration

### Exemple: Ajouter une colonne commission

1. **Créer le fichier:** `V3__add_column_commission.sql`

```sql
-- Ajout de la colonne commission
ALTER TABLE tc_paiement
ADD COLUMN commission DECIMAL(10, 2) DEFAULT 0.00;

-- Ajouter une contrainte
ALTER TABLE tc_paiement
ADD CONSTRAINT chk_commission CHECK (commission >= 0);

-- Créer un index
CREATE INDEX idx_paiement_commission ON tc_paiement(commission);

-- Commentaire
COMMENT ON COLUMN tc_paiement.commission IS 'Commission prélevée sur le paiement';
```

2. **Redémarrer le service**
```bash
mvn spring-boot:run
```

3. **Vérifier les logs**
```
Migrating schema "public" to version "3 - add column commission"
Successfully applied 1 migration to schema "public"
```

## Bonnes pratiques

### ✅ À faire
- Toujours tester les migrations sur une BDD de dev d'abord
- Utiliser des transactions (Flyway le fait automatiquement pour PostgreSQL)
- Ajouter des commentaires explicatifs
- Versionner séquentiellement (V1, V2, V3...)
- Utiliser `IF NOT EXISTS` quand pertinent
- Créer des index pour les colonnes fréquemment utilisées

### ❌ À ne pas faire
- Ne JAMAIS modifier une migration déjà appliquée en production
- Ne pas supprimer une migration déjà appliquée
- Ne pas utiliser DDL et DML dans la même migration si possible
- Ne pas oublier les contraintes de validation
- Ne pas créer de tables sans commentaires

## Rollback

Flyway Community Edition ne supporte pas le rollback automatique. Pour annuler une migration:

1. **Créer une nouvelle migration** qui annule les changements
```sql
-- V4__rollback_commission.sql
ALTER TABLE tc_paiement DROP COLUMN commission;
```

2. **Ou utiliser Flyway Pro** avec les scripts `undo`

## Environnements

### Développement
- Utiliser V2 pour les données de test
- Supprimer les données de test en production

### Production
- Appliquer uniquement les migrations structurelles (V1, V3, etc.)
- Exclure V2 ou créer un profil Spring spécifique

**Exemple pour exclure V2:**
```yaml
spring:
  flyway:
    locations: classpath:db/migration
    ignore-migration-patterns: "*:ignored"  # Renommer V2 en V2__ignored_...
```

## Troubleshooting

### Migration échoue
```bash
# Marquer la migration comme réussie manuellement (ATTENTION!)
UPDATE flyway_schema_history
SET success = true
WHERE version = '2';

# Ou réparer avec Flyway CLI
flyway repair
```

### Réinitialiser complètement
```bash
# Supprimer la table de suivi (DÉVELOPPEMENT UNIQUEMENT!)
DROP TABLE flyway_schema_history;

# Redémarrer le service pour réappliquer toutes les migrations
mvn spring-boot:run
```

## Commandes utiles

### Vérifier l'état des migrations
```sql
-- Voir toutes les migrations appliquées
SELECT version, description, installed_on, success
FROM flyway_schema_history
ORDER BY installed_rank;

-- Voir la dernière migration
SELECT version, description
FROM flyway_schema_history
ORDER BY installed_rank DESC
LIMIT 1;
```

### Vérifier la structure de la table
```sql
-- Description de la table paiement
\d tc_paiement

-- Lister les index
\di

-- Voir les contraintes
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'tc_paiement'::regclass;
```

## Ressources

- [Documentation officielle Flyway](https://flywaydb.org/documentation/)
- [Spring Boot + Flyway](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.data-initialization.migration-tool.flyway)
- [PostgreSQL + Flyway](https://flywaydb.org/documentation/database/postgresql)
