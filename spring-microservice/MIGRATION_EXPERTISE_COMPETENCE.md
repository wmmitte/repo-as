# Migration des attributs Expertise vers Competence

## Date: 16 novembre 2025

## Résumé
Migration des attributs liés aux compétences individuelles de l'entité `Expertise` vers l'entité `Competence` pour une meilleure granularité des données.

## Attributs supprimés de l'entité Expertise

Les attributs suivants ont été supprimés de l'entité `Expertise` car ils sont maintenant gérés au niveau de chaque compétence:

1. **anneesExperience** (Integer) - Années d'expérience
2. **tjmMin** (Integer) - Taux Journalier Moyen minimum en FCFA
3. **tjmMax** (Integer) - Taux Journalier Moyen maximum en FCFA
4. **nombreProjets** (Integer) - Nombre de projets réalisés
5. **nombreCertifications** (Integer) - Nombre de certifications

Ces attributs existent maintenant dans l'entité `Competence` avec les noms suivants:
- `anneesExperience` → reste `anneesExperience` dans Competence
- `tjmMin/tjmMax` → `thm` (Taux Horaire Moyen) dans Competence
- `nombreProjets` → reste `nombreProjets` dans Competence
- `nombreCertifications` → `certifications` (String avec liste) dans Competence

## Fichiers modifiés

### Backend (Java)

1. **Entité Expertise**
   - Fichier: `/expertise/src/main/java/com/intermediation/expertise/model/Expertise.java`
   - Suppression des 5 attributs et leurs getters/setters

2. **DTO ExpertiseDTO**
   - Fichier: `/expertise/src/main/java/com/intermediation/expertise/dto/ExpertiseDTO.java`
   - Suppression des 5 attributs et leurs getters/setters
   - Mise à jour du constructeur

3. **Service ExpertiseService**
   - Fichier: `/expertise/src/main/java/com/intermediation/expertise/service/ExpertiseService.java`
   - Suppression des lignes de mapping dans `createOrUpdateExpertise()`

### Frontend (TypeScript/React)

4. **Types TypeScript**
   - Fichier: `/gateway/src/main/resources/frontend/src/types/expertise.types.ts`
   - Suppression des 5 attributs de l'interface `Expertise`
   - Mise à jour de `defaultExpertise`

5. **Formulaire d'édition**
   - Fichier: `/gateway/src/main/resources/frontend/src/components/expertise/EditerExpertise.tsx`
   - Suppression des champs de formulaire pour les 5 attributs
   - **Réorganisation**: Champ "Pays" placé AVANT "Ville"

### Base de données

6. **Script de migration SQL**
   - Fichier: `/postgres-init/04-migration-expertise-remove-columns.sql`
   - Commandes `ALTER TABLE` pour supprimer les 5 colonnes de la table `expertises`

## Ordre d'exécution de la migration

1. **Sauvegarder les données** (si nécessaire)
   ```sql
   -- Optionnel: sauvegarder les données existantes avant migration
   CREATE TABLE expertises_backup AS SELECT * FROM expertises;
   ```

2. **Exécuter le script de migration**
   ```bash
   psql -U postgres -d expertise_db -f postgres-init/04-migration-expertise-remove-columns.sql
   ```

3. **Redémarrer les services**
   - Service expertise
   - Gateway (frontend)

## Notes importantes

### Service Accueil (Feed)

Le service `acceuil` utilise un modèle `Expert` qui contient encore ces attributs pour l'affichage dans le feed. Ces valeurs sont actuellement générées par `ExpertGenerator` pour les données de test.

**À faire dans une version future:**
- Calculer ces valeurs agrégées à partir des compétences de l'utilisateur
- Mettre à jour `ExpertGenerator` pour calculer:
  - `experienceAnnees`: maximum des années d'expérience parmi toutes les compétences
  - `tjmMin/tjmMax`: min/max des THM parmi toutes les compétences
  - `nombreProjets`: somme des projets de toutes les compétences
  - `nombreCertifications`: nombre total de certifications

### Composants Frontend affectés

Les composants suivants utilisent le modèle `Expert` et continueront de fonctionner avec les données de test:
- `ExpertCard.tsx`
- `ExpertStats.tsx`
- `ExpertRating.tsx`
- `ExpertFooter.tsx`

## Validation

Après la migration, vérifier:

1. ✅ Le formulaire d'édition d'expertise n'affiche plus les champs supprimés
2. ✅ Le champ "Pays" apparaît avant "Ville"
3. ✅ Les compétences peuvent être ajoutées avec leurs propres valeurs (années d'expérience, THM, etc.)
4. ✅ Le modal de suppression de compétence utilise le nouveau design DaisyUI
5. ✅ La table `expertises` ne contient plus les colonnes supprimées
6. ✅ Le feed d'accueil continue de fonctionner avec les données de test

## Rollback

En cas de problème, pour revenir en arrière:

```sql
-- Restaurer les colonnes
ALTER TABLE expertises ADD COLUMN annees_experience INTEGER;
ALTER TABLE expertises ADD COLUMN tjm_min INTEGER;
ALTER TABLE expertises ADD COLUMN tjm_max INTEGER;
ALTER TABLE expertises ADD COLUMN nombre_projets INTEGER DEFAULT 0;
ALTER TABLE expertises ADD COLUMN nombre_certifications INTEGER DEFAULT 0;

-- Restaurer depuis la sauvegarde si nécessaire
-- UPDATE expertises SET ... FROM expertises_backup WHERE ...
```

Puis redéployer la version précédente du code.
