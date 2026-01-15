# 🧪 Guide de Test - Validité des Badges

## ⚠️ Conditions Importantes

Le modal avec les radio buttons **n'apparaît QUE si** :
1. ✅ Vous êtes sur la page d'évaluation d'une demande (`/traitant/evaluer/:id`)
2. ✅ L'évaluation a déjà été soumise (notes, recommandation, etc.)
3. ✅ Le statut de la demande est `EN_COURS_TRAITEMENT`
4. ✅ Vous cliquez sur le bouton vert "✅ Approuver définitivement"

## 📋 Étapes de Test Complètes

### 1. Préparation
```bash
# Vérifier que tous les services sont UP
curl http://localhost:8090/actuator/health
```

### 2. Connexion en tant que Traitant
- Allez sur http://localhost:8090
- Connectez-vous avec un compte traitant
- Email : `traitant@example.com` (ou votre compte traitant)

### 3. Accéder à la File de Traitement
- Menu : "Traitement" ou URL directe : http://localhost:8090/traitant/file
- Vous devriez voir la liste des demandes

### 4. S'assigner une Demande (si nécessaire)
- Trouvez une demande avec statut "EN_ATTENTE"
- Cliquez sur "S'assigner" ou "Traiter"
- La demande passe à "EN_COURS_TRAITEMENT"

### 5. Évaluer la Demande
- Cliquez sur "Évaluer" pour accéder à `/traitant/evaluer/:id`
- **Remplissez l'évaluation complète** :
  - Note Expérience (1-10)
  - Note Formation (1-10)
  - Note Projets (1-10)
  - Note Compétence Technique (1-10)
  - **Recommandation : Sélectionnez "✅ Approuver"** (important !)
  - Commentaire (optionnel)
  - Temps d'évaluation (en minutes)
- Cliquez sur "Soumettre l'évaluation"
- ✅ L'évaluation est enregistrée

### 6. Approbation Définitive
Après la soumission de l'évaluation, **descendez en bas de la page**.

Vous devriez voir une section "**Décision finale**" avec 3 boutons :
- 🟢 **Approuver définitivement** (bouton vert)
- 🔴 **Rejeter** (bouton rouge)  
- 🟠 **Demander complément** (bouton orange)

**Cliquez sur le bouton vert "✅ Approuver définitivement"**

### 7. Modal avec Radio Buttons
Un modal devrait s'ouvrir avec :

```
✅ Approuver la demande

Un badge sera automatiquement attribué à l'expert. 
Définissez la validité du badge ci-dessous.

Type de validité
○ ✓ Validité permanente
  Le badge n'expirera jamais

○ ⏰ Validité limitée
  Le badge expirera à une date définie

[Si vous sélectionnez "Validité limitée"]
Date d'expiration *
[Champ date picker]

Commentaire (optionnel)
[Zone de texte]

[Annuler] [Approuver définitivement]
```

## 🔍 Vérifications

### Si le Modal N'Apparaît Pas

1. **Ouvrez la Console JavaScript** (F12)
   - Vérifiez s'il y a des erreurs en rouge
   - Partagez les erreurs si présentes

2. **Vérifiez l'URL**
   - Devrait être : `http://localhost:8090/traitant/evaluer/[ID]`
   - Pas sur `/traitant/file`

3. **Vérifiez que l'évaluation est soumise**
   - La section "Décision finale" doit être visible
   - Les 3 boutons (vert, rouge, orange) doivent être présents

4. **Videz le cache** (encore une fois)
   - Cmd + Shift + R (Mac)
   - Ctrl + Shift + R (Windows/Linux)
   - OU mode navigation privée

5. **Vérifiez le fichier JS servi**
   ```bash
   curl -s http://localhost:8090/assets/index-CXlV2cOx.js | grep "Type de validité"
   ```
   - Devrait afficher : "Type de validité"

## 🐛 Débogage Avancé

### Vérifier que le bon bundle est chargé
Dans la console du navigateur (F12), onglet "Network" :
- Rechargez la page
- Cherchez `index-CXlV2cOx.js`
- Vérifiez la taille : ~559 KB
- Status : 200 OK

### Vérifier le state React
Dans la console du navigateur :
```javascript
// Après avoir cliqué sur "Approuver définitivement"
// Le modal devrait s'afficher
```

## ✅ Test de la Fonctionnalité

Une fois le modal visible :

### Test 1 : Validité Permanente (par défaut)
1. Radio "Validité permanente" est coché
2. Pas de champ date visible
3. Ajoutez un commentaire (optionnel)
4. Cliquez "Approuver définitivement"
5. ✅ Badge créé avec `validite_permanente = true`

### Test 2 : Validité Limitée
1. Sélectionnez radio "Validité limitée"
2. Un champ date apparaît
3. Sélectionnez une date future (ex: dans 1 an)
4. Ajoutez un commentaire (optionnel)
5. Cliquez "Approuver définitivement"
6. ✅ Badge créé avec `validite_permanente = false` et `date_expiration` définie

### Vérification en Base de Données
```sql
-- Vérifier le badge créé
SELECT 
    id, 
    competence_id, 
    utilisateur_id, 
    niveau_certification,
    validite_permanente,
    date_expiration,
    date_obtention
FROM badges_competence 
WHERE est_actif = true
ORDER BY date_obtention DESC 
LIMIT 5;
```

## 📞 Problème Persistant ?

Si après toutes ces étapes vous ne voyez toujours pas le modal :
1. Partagez une capture d'écran de la page `/traitant/evaluer/:id`
2. Partagez les erreurs de la console JavaScript (F12)
3. Vérifiez que vous êtes bien sur la page d'évaluation (pas la file)
