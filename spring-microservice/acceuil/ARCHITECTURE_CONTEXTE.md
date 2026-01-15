# Architecture du Chargement de Contexte

## Vue d'ensemble

Le système utilise Camunda/Zeebe pour orchestrer le chargement de contexte (liste d'experts) de manière asynchrone via des messages BPMN.

## Composants principaux

### 1. **ExpertGenerator** (nouveau)
- **Rôle** : Classe utilitaire qui centralise la logique de génération des experts
- **Méthode** : `loadExperts(afterCursor, batchSize)` → `List<Expert>`
- **Emplacement** : `com.intermediation.acceuil.ExpertGenerator`

### 2. **ChargementContexteWorker** (modifié)
- **Rôle** : Worker Zeebe qui traite les tâches de type `"chargement-contexte"`
- **Déclenchement** : Via message `"scroll-next"` capturé par un boundary event BPMN
- **Traitement** :
  - Reçoit `visiteurId`, `afterCursor`, `batchSize`
  - Génère une liste d'experts via `ExpertGenerator.loadExperts()`
  - Stocke le résultat dans les variables du processus BPMN :
    - `pileContenu` : `List<Expert>` (au lieu d'items génériques)
    - `nextCursor` : position après chargement
    - `contexteCharge` : `true`
    - `contexteDerniereMAJ` : timestamp ISO-8601

### 3. **FeedController** (modifié)
- **Endpoint** : `POST /api/scroll-next`
- **Actions** :
  1. Publie un message `"scroll-next"` vers le processus BPMN (asynchrone)
  2. Attend (avec polling) que le worker stocke les données dans `ContexteCache` (max 3s)
  3. Récupère `pileContenu` depuis le cache et le retourne au front
  4. En cas de timeout, génère les données en fallback via `ExpertGenerator`

### 4. **ContexteCache** (nouveau)
- **Rôle** : Cache en mémoire partagé entre le worker et le controller
- **Fonctionnement** :
  - Le worker stocke les données avec clé `visiteurId:afterCursor`
  - Le controller fait du polling avec retry (50ms entre chaque tentative)
  - Consommation unique : les données sont supprimées après lecture
  - Thread-safe via `ConcurrentHashMap`

### 5. **ProcessInstanceRegistry** (nouveau)
- **Rôle** : Registre des instances de processus actives
- **Mapping** : `visiteurId` → `instanceKey` du processus BPMN
- Utile pour d'éventuelles futures opérations sur le processus

## Flux actuel (avec ContexteCache)

```
Front appelle POST /api/scroll-next
    ↓
FeedController.scrollNext() {
    1) Publie message "scroll-next" → déclenche ChargementContexteWorker (asynchrone)
       ↓
    2) Attend que le worker traite (polling sur ContexteCache, max 3s)
       ↓
ChargementContexteWorker {
       Génère pileContenu (List<Expert>) via ExpertGenerator
       ↓
       Stocke dans :
         - Variables BPMN (pour le processus)
         - ContexteCache (pour FeedController)
}
       ↓
FeedController {
       Récupère pileContenu depuis ContexteCache
       ↓
       Retourne au front
}
```

## ✅ Avantages de l'architecture actuelle

### Génération unique
Les experts sont générés **une seule fois** dans le `ChargementContexteWorker`. Le `FeedController` récupère ces données via le `ContexteCache` partagé.

### Prêt pour appels API externes
Le `ChargementContexteWorker` étant le seul responsable de la génération/récupération des données, vous pouvez facilement :
- Remplacer `ExpertGenerator.loadExperts()` par un appel HTTP/gRPC vers un autre microservice
- Ajouter de la logique métier complexe (filtrage, scoring, etc.)
- Implémenter du retry, circuit breaker, etc.

### Mécanisme de fallback
Si le worker ne répond pas dans les 3 secondes (problème réseau, surcharge, etc.), le `FeedController` génère les données en fallback pour ne pas bloquer l'UX.

## 🎯 Évolutions futures recommandées

### Option 1 : Polling côté front
1. `FeedController.scrollNext()` publie seulement le message
2. Retourne un `requestId` au front
3. Le front fait du polling sur `GET /api/contexte/{requestId}` 
4. Ce endpoint interroge les variables du processus BPMN et retourne `pileContenu`

### Option 2 : WebSocket/Server-Sent Events
1. `FeedController.scrollNext()` publie le message et retourne immédiatement
2. Quand le worker termine, il push les données via WebSocket
3. Le front reçoit la notification et affiche les experts

### Option 3 : Architecture événementielle pure
1. Le front s'abonne à un topic Kafka/RabbitMQ
2. Le worker publie les experts sur ce topic après génération
3. Le front consomme les événements en temps réel

### Option 4 : Cache Redis
1. Le worker stocke `pileContenu` dans Redis avec une clé `visiteurId:cursor`
2. `FeedController.scrollNext()` vérifie d'abord Redis avant de générer
3. Évite la double génération si les données sont déjà en cache

## 📝 État actuel de l'implémentation

✅ **Fait** :
- Création de `ExpertGenerator` pour centraliser la logique de génération
- `ChargementContexteWorker` génère des objets `Expert` complets (au lieu d'items génériques)
- Création de `ContexteCache` pour le partage de données entre worker et controller
- `FeedController` récupère maintenant les données générées par le worker via le cache
- Mécanisme de retry/polling avec timeout de 3 secondes
- Fallback automatique en cas de timeout du worker
- Les données sont stockées dans les variables BPMN ET dans le cache
- Création de `ProcessInstanceRegistry` pour tracker les instances

✅ **Avantages obtenus** :
- **Une seule source de génération** : seul le worker génère les données (sauf fallback)
- **Prêt pour API externe** : il suffit de modifier `ChargementContexteWorker` pour appeler un autre service
- **Robustesse** : mécanisme de fallback si problème avec le worker
- **Performance** : pas de duplication de génération dans le cas nominal

⚠️ **Points d'attention** :
- Le cache est en mémoire (non persistant)
- Timeout fixe de 3 secondes (peut nécessiter ajustement selon la charge)
- Le fallback génère des données côté controller (duplication uniquement en cas d'erreur)

## 🔧 Utilisation

### Pour simuler un chargement de contexte
```bash
curl -X POST http://localhost:8080/api/scroll-next \
  -H "Content-Type: application/json" \
  -d '{
    "visiteurId": "v-123",
    "afterCursor": "0",
    "batchSize": 5
  }'
```

### Réponse
```json
{
  "pileContenu": [
    {
      "id": "exp-1",
      "nom": "Martin",
      "prenom": "Sophie",
      "titre": "Développeuse Full Stack Senior",
      "competences": [...],
      "rating": 4.0,
      ...
    }
  ],
  "nextCursor": "5",
  "contexteDerniereMAJ": "2025-10-26T13:45:00Z"
}
```
