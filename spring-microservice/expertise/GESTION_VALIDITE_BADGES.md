# Gestion de la Validité des Badges de Compétence

## Date : 3 décembre 2025

## Résumé

Ajout de la fonctionnalité permettant au traitant de choisir le type de validité (permanente ou limitée) et de définir la date d'expiration lors de l'approbation d'une demande de reconnaissance de compétence.

## Modifications Backend

### 1. Nouveau DTO : ApprobationRequest

**Fichier** : `/expertise/src/main/java/com/intermediation/expertise/dto/ApprobationRequest.java`

```java
public class ApprobationRequest {
    private String commentaire;
    private Boolean validitePermanente = true; // Par défaut permanente
    private LocalDateTime dateExpiration; // Obligatoire si validité limitée
}
```

**Validation métier** :
- `validitePermanente` obligatoire
- `dateExpiration` obligatoire si `validitePermanente = false`
- `dateExpiration` doit être dans le futur

### 2. Service BadgeService

**Fichier** : `/expertise/src/main/java/com/intermediation/expertise/service/BadgeService.java`

**Modifications** :
- Ajout de `attribuerBadge(demande, validitePermanente, dateExpiration)`
- Application de la validité au badge via `badge.definirExpiration(dateExpiration)`
- Logs détaillés du type de validité appliquée

**Comportement** :
- Si `validitePermanente = true` : le badge n'expire jamais
- Si `validitePermanente = false` : le badge expire à la `dateExpiration` définie

### 3. Service TraitementDemandeService

**Fichier** : `/expertise/src/main/java/com/intermediation/expertise/service/TraitementDemandeService.java`

**Modifications** :
- Ajout de `approuverDemande(demandeId, traitantId, commentaire, validitePermanente, dateExpiration)`
- Transmission des paramètres de validité au `BadgeService`

### 4. Controller TraitementDemandeController

**Fichier** : `/expertise/src/main/java/com/intermediation/expertise/controller/TraitementDemandeController.java`

**Modifications** :
- Endpoint `PUT /{demandeId}/approuver` accepte maintenant `ApprobationRequest`
- Validation automatique des paramètres via `request.valider()`
- Rétrocompatibilité : si `request = null`, validité permanente par défaut

## Modifications Frontend

### 1. Type TypeScript

**Fichier** : `/gateway/src/main/resources/frontend/src/types/reconnaissance.types.ts`

```typescript
export interface ApprobationRequest {
  commentaire?: string;
  validitePermanente: boolean;
  dateExpiration?: string; // ISO 8601 format
}
```

### 2. Service traitementService

**Fichier** : `/gateway/src/main/resources/frontend/src/services/traitementService.ts`

**Modifications** :
- `approuverDemande(demandeId, request: ApprobationRequest)`
- Envoi JSON avec `Content-Type: application/json`

### 3. Composant EvaluationDemande

**Fichier** : `/gateway/src/main/resources/frontend/src/pages/EvaluationDemande.tsx`

**Nouveaux états** :
- `validitePermanente` : boolean (true par défaut)
- `dateExpiration` : string (date au format YYYY-MM-DD)

**Nouveau modal d'approbation** :
- Choix du type de validité (radio buttons)
- Champ date d'expiration (conditionnel, si validité limitée)
- Validation : date d'expiration obligatoire si validité limitée
- Date minimum : aujourd'hui

## Flux d'Utilisation

### 1. Traitant évalue la demande
- Remplir les notes
- Choisir une recommandation
- Cliquer sur "Approuver définitivement"

### 2. Modal d'approbation
Le traitant choisit :

**Option A : Validité permanente** (par défaut)
- Badge valide indéfiniment
- Pas de date d'expiration

**Option B : Validité limitée**
- Sélectionner une date d'expiration future
- Le badge sera automatiquement désactivé à cette date

### 3. Badge créé
- Badge attribué avec les paramètres de validité définis
- Affichage dans le profil de l'expert

## Cas d'Usage

### Badges permanents
- Certifications techniques de base (ex: Bronze en Java)
- Compétences métier fondamentales
- Reconnaissance d'expérience professionnelle

### Badges à durée limitée
- Certifications nécessitant renouvellement (ex: certifications cloud qui expirent)
- Compétences liées à des versions spécifiques de technologies
- Reconnaissance temporaire en attente de validation complète

## API

### Endpoint d'approbation

```http
PUT /api/traitement-demandes/{demandeId}/approuver
Content-Type: application/json

{
  "commentaire": "Excellent niveau de compétence démontré",
  "validitePermanente": false,
  "dateExpiration": "2026-12-31T23:59:59"
}
```

**Réponses** :
- `200 OK` : Demande approuvée, badge attribué
- `400 BAD REQUEST` : Validation échouée (date manquante, date passée, etc.)
- `401 UNAUTHORIZED` : Utilisateur non authentifié
- `404 NOT FOUND` : Demande non trouvée

## Base de Données

**Pas de modification de structure** - Les champs existants sont utilisés :
- `validite_permanente` : BOOLEAN DEFAULT TRUE
- `date_expiration` : TIMESTAMP

## Rétrocompatibilité

✅ **Totalement rétrocompatible**
- Les anciens badges conservent leur validité permanente
- Si aucun paramètre n'est fourni, validité permanente par défaut
- Les badges existants ne sont pas affectés

## Tests Manuels

1. **Test validité permanente** :
   - Approuver une demande avec validité permanente
   - Vérifier badge : `validite_permanente = true`, `date_expiration = null`

2. **Test validité limitée** :
   - Approuver une demande avec date d'expiration (ex: dans 1 an)
   - Vérifier badge : `validite_permanente = false`, `date_expiration` définie

3. **Test validation** :
   - Essayer validité limitée sans date → Erreur
   - Essayer date passée → Erreur
   - Vérifier que la date minimum est aujourd'hui

## Évolutions Futures Possibles

1. **Job automatique de désactivation**
   - Créer un scheduler qui désactive les badges expirés
   - Notifier les experts X jours avant expiration

2. **Renouvellement de badge**
   - Permettre à l'expert de demander le renouvellement
   - Workflow de revalidation simplifié

3. **Durées prédéfinies**
   - Proposer des durées standards (1 an, 2 ans, 3 ans)
   - Calcul automatique de la date d'expiration

4. **Notifications**
   - Email à l'expert quand badge proche de l'expiration
   - Rappel automatique au traitant

## Statut

✅ **Fonctionnalité complète et opérationnelle**
- Backend : Implémenté et testé
- Frontend : Interface intuitive et validée
- Documentation : À jour
