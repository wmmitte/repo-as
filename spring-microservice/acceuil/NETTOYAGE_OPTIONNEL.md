# Nettoyage des Fichiers Obsolètes (Optionnel)

## ⚠️ Important

Les fichiers suivants sont **obsolètes** après la refonte mais **peuvent être conservés temporairement** pour:
1. Permettre aux anciennes instances de processus BPMN de se terminer
2. Servir de référence/documentation
3. Permettre un rollback en cas de problème

## Fichiers Obsolètes

### 1. Workers BPMN (ne sont plus appelés)

- `src/main/java/com/intermediation/acceuil/AnalyseProfilVisiteurWorker.java`
- `src/main/java/com/intermediation/acceuil/ChargementContexteWorker.java`
- `src/main/java/com/intermediation/acceuil/MoteurEngagementWorker.java`

**Raison:** Toute la logique a été intégrée dans `FeedController`

### 2. Système de Cache (n'est plus utilisé)

- `src/main/java/com/intermediation/acceuil/ContexteCache.java`

**Raison:** Architecture synchrone, plus besoin de coordination asynchrone

## Stratégie de Nettoyage Recommandée

### Option A: Suppression Immédiate (Risque Minimal)

Si vous êtes certain qu'aucune instance de processus de l'ancien BPMN n'est en cours:

```bash
cd /Users/abdramane/WindsurfProjects/projects/spring-microservice/acceuil

# Supprimer les workers obsolètes
rm src/main/java/com/intermediation/acceuil/AnalyseProfilVisiteurWorker.java
rm src/main/java/com/intermediation/acceuil/ChargementContexteWorker.java
rm src/main/java/com/intermediation/acceuil/MoteurEngagementWorker.java

# Supprimer le cache
rm src/main/java/com/intermediation/acceuil/ContexteCache.java

# Recompiler
mvn clean compile
```

### Option B: Désactivation Temporaire (Recommandé)

Désactiver les workers sans supprimer les fichiers:

1. **Commenter l'annotation `@Component`** dans chaque worker:

```java
// @Component  // OBSOLETE - Désactivé après refonte
public class AnalyseProfilVisiteurWorker {
  // ...
}
```

2. **Commenter l'annotation `@Service`** dans ContexteCache:

```java
// @Service  // OBSOLETE - Désactivé après refonte
public class ContexteCache {
  // ...
}
```

3. Recompiler et vérifier:

```bash
mvn clean compile
```

**Avantages:**
- Les fichiers restent disponibles pour référence
- Rollback facile si nécessaire
- Documentation du code migré

### Option C: Déplacement vers Archive (Prudent)

Créer un dossier d'archives:

```bash
cd /Users/abdramane/WindsurfProjects/projects/spring-microservice/acceuil/src/main/java/com/intermediation/acceuil

# Créer dossier archive
mkdir -p obsolete_workers

# Déplacer les fichiers
mv AnalyseProfilVisiteurWorker.java obsolete_workers/
mv ChargementContexteWorker.java obsolete_workers/
mv MoteurEngagementWorker.java obsolete_workers/
mv ContexteCache.java obsolete_workers/

# Recompiler
cd /Users/abdramane/WindsurfProjects/projects/spring-microservice/acceuil
mvn clean compile
```

## Vérification après Nettoyage

### 1. Compilation

```bash
mvn clean compile
# Devrait réussir sans erreurs
```

### 2. Tests

```bash
mvn test
# Vérifier que tous les tests passent
```

### 3. Démarrage de l'application

```bash
mvn spring-boot:run
```

Vérifier les logs au démarrage - ne devrait **PAS** contenir:
```
Started AnalyseProfilVisiteurWorker
Started ChargementContexteWorker
Started MoteurEngagementWorker
```

Devrait contenir:
```
Started FeedController
```

### 4. Test des endpoints

```bash
# Test start
curl -X POST http://localhost:8080/api/start \
  -H "Content-Type: application/json" \
  -d '{
    "visiteurId": "test-123",
    "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
    "referrer": "https://google.com",
    "ipAddress": "203.0.113.42"
  }'

# Test scroll-next
curl -X POST http://localhost:8080/api/scroll-next \
  -H "Content-Type: application/json" \
  -d '{
    "visiteurId": "test-123",
    "afterCursor": "0",
    "batchSize": 5
  }'

# Test dwell
curl -X POST http://localhost:8080/api/dwell \
  -H "Content-Type: application/json" \
  -d '{
    "visiteurId": "test-123",
    "itemId": "exp-1",
    "eventType": "DWELL_STOP",
    "dureeDwellMs": 5000
  }'
```

## Checklist de Nettoyage

Avant de supprimer définitivement les fichiers:

- [ ] ✅ Compilation réussie
- [ ] ✅ Tests passent
- [ ] ✅ Application démarre sans erreur
- [ ] ✅ Endpoint /api/start fonctionne
- [ ] ✅ Endpoint /api/scroll-next fonctionne
- [ ] ✅ Endpoint /api/dwell fonctionne
- [ ] ✅ Logs corrects (pas d'erreurs de workers manquants)
- [ ] ✅ Frontend fonctionne normalement
- [ ] ⏱️ Attendre 24-48h en production sans incident

## Rollback (Si Nécessaire)

Si vous devez revenir en arrière:

1. **Restaurer les fichiers** (depuis Git, archive ou backup)

2. **Restaurer l'ancien BPMN** (garder une copie du fichier avant refonte)

3. **Recompiler:**
```bash
mvn clean compile
```

4. **Redémarrer l'application**

## Recommandation Finale

**Je recommande l'Option B (Désactivation Temporaire)** pour:
- Garder les fichiers comme documentation
- Faciliter le rollback si nécessaire
- Permettre la comparaison du code lors de futures évolutions

**Supprimer définitivement après 1-2 semaines de fonctionnement stable en production.**

## Questions / Support

Si vous rencontrez des problèmes après le nettoyage:

1. Vérifier les logs d'application
2. Vérifier que le nouveau BPMN est bien déployé sur Zeebe
3. Consulter les fichiers de documentation de la refonte:
   - `REFONTE_DOCUMENTATION.md`
   - `MIGRATION_CODE.md`
