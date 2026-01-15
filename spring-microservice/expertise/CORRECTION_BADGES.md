# Correction du Problème de Contrainte Unique sur les Badges

## Problème Identifié

Lors de la progression d'un badge (Bronze → Argent), l'erreur suivante se produisait :
```
ERROR: duplicate key value violates unique constraint "uq_utilisateur_competence_actif"
Key (competence_id, utilisateur_id)=(745, cd8602fd-af5a-48ae-b5cd-11a5fa3a1f53) already exists.
```

### Cause Racine

La contrainte unique `uq_utilisateur_competence_actif` était définie sur `(competence_id, utilisateur_id)` **sans condition**, empêchant ainsi d'avoir plusieurs badges (actifs ou inactifs) pour la même compétence. Cela bloquait la progression des certifications.

## Solution Appliquée

### 1. Migration Base de Données (V12)

Créé `/expertise/src/main/resources/db/migration/V12__fix_badge_unique_constraint.sql`

**Changements :**
- Suppression de l'ancienne contrainte unique globale
- Création d'un **index unique partiel** qui s'applique uniquement aux badges actifs :
  ```sql
  CREATE UNIQUE INDEX uq_utilisateur_competence_actif 
      ON badges_competence(competence_id, utilisateur_id) 
      WHERE est_actif = true;
  ```

**Avantages :**
- ✅ Permet l'historique des badges inactifs
- ✅ Garantit un seul badge actif par compétence
- ✅ Supporte la progression (Bronze → Argent → Or → Platine)

### 2. Amélioration du Code Java

Mis à jour `BadgeService.java` pour :
- Vérifier l'existence d'un badge actif AVANT la désactivation
- Utiliser une transaction séparée (REQUIRES_NEW) pour la désactivation
- Vérifier que la désactivation a réussi AVANT l'insertion du nouveau badge
- Ajouter des logs détaillés pour faciliter le débogage

## Statut Actuel de la Base de Données

```
Demande #2 : BRONZE  → APPROUVEE           (2025-12-02 22:32)
Demande #5 : ARGENT  → REJETEE             (2025-12-03 00:08) ← Échec dû à l'ancienne contrainte
Demande #6 : ARGENT  → EN_COURS_TRAITEMENT (2025-12-03 20:24) ← Prête à être approuvée

Badge actuel : BRONZE (est_actif = false)
```

## Prochaines Étapes

1. **Redémarrer le service expertise** pour charger le nouveau code
2. **Approuver la demande #6** (Argent) - devrait fonctionner sans erreur
3. **Vérifier les logs** pour s'assurer que la désactivation et la création se passent bien

## Commandes de Vérification

### Vérifier l'index unique partiel
```bash
PGPASSWORD=admin psql -h localhost -p 5433 -U postgres -d expertise_db \
  -c "SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'badges_competence' AND indexname = 'uq_utilisateur_competence_actif';"
```

### Vérifier les badges d'un utilisateur
```bash
PGPASSWORD=admin psql -h localhost -p 5433 -U postgres -d expertise_db \
  -c "SELECT id, competence_id, niveau_certification, est_actif, date_obtention FROM badges_competence WHERE utilisateur_id = 'cd8602fd-af5a-48ae-b5cd-11a5fa3a1f53' ORDER BY date_obtention DESC;"
```

### Vérifier les demandes
```bash
PGPASSWORD=admin psql -h localhost -p 5433 -U postgres -d expertise_db \
  -c "SELECT id, niveau_vise, statut, date_creation FROM demandes_reconnaissance_competence WHERE utilisateur_id = 'cd8602fd-af5a-48ae-b5cd-11a5fa3a1f53' ORDER BY date_creation DESC;"
```

## Résultat Attendu

Après approbation de la demande #6, vous devriez avoir :
- Badge BRONZE (est_actif = false) - historique
- Badge ARGENT (est_actif = true) - actif
