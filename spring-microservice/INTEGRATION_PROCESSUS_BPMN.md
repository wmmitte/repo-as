# Intégration Processus BPMN - Authentification OAuth2 (Version Simplifiée)

## 📋 Vue d'ensemble

Ce document explique l'intégration simplifiée entre le processus BPMN d'intermédiation et l'authentification OAuth2 via les réseaux sociaux (Google, Facebook, Apple).

## 🔄 Flux Simplifié

### Flux Unique (Inscription ET Connexion)

```
1. Frontend : Visiteur arrive sur la page
2. Frontend : Appel /api/acceuil/api/start → Crée instance BPMN avec visiteurId
3. Frontend : Stocke visiteurId dans sessionStorage
4. Frontend : Visiteur clique "Se connecter avec Google"
5. Frontend → Service Acceuil : Appel /api/acceuil/api/authentifier avec visiteurId
6. Service Acceuil : Envoie msg_connexion au processus BPMN
7. Processus BPMN : Tâche "S'authentifier" activée ✅
8. Frontend : Redirection OAuth2 → Google
9. Google : Authentification réussie
10. Gateway : Callback OAuth2
11. Gateway → Service Auth : Appel /api/auth/oauth2/process
12. Service Auth : Crée ou met à jour l'utilisateur en BD
13. Gateway : Redirection vers /mon-compte (profil incomplet) ou / (profil complet)
```

**Note importante** : Le message BPMN est envoyé **AVANT** la redirection OAuth2, ce qui garantit que le processus est dans le bon état avant même que l'authentification ne commence.

## 🔧 Modifications Implémentées

### 1. Service Acceuil (`FeedController.java`)

#### Nouveau endpoint : `/api/inscription`
- **Rôle** : Reçoit une notification du service Auth après une première connexion OAuth2
- **Action** : Envoie le message BPMN `msg_inscription` corrélé avec `visiteurId`
- **Effet** : Déclenche les tâches "S'inscrire" puis "S'authentifier" dans le processus

#### Nouveau endpoint : `/api/connexion`
- **Rôle** : Reçoit une notification du service Auth après une connexion OAuth2 d'un utilisateur existant
- **Action** : Envoie le message BPMN `msg_connexion` corrélé avec `visiteurId`
- **Effet** : Déclenche directement la tâche "S'authentifier" (pas d'inscription)

### 2. Service Auth (`OAuth2ProcessController.java`)

#### Modification de `/api/auth/oauth2/process`
- **Ajout** : Paramètre `visiteurId` dans la query string
- **Logique** : Détermine si c'est une inscription ou connexion en comparant `dateCreation` et `derniereConnexion`
- **Action** : Appelle le service Acceuil pour notifier le processus BPMN

#### Nouvelle méthode : `notifierAcceuil()`
- **Rôle** : Appelle le service Acceuil via Eureka
- **Endpoint appelé** : `/api/acceuil/api/inscription` ou `/api/acceuil/api/connexion`
- **Données envoyées** : `visiteurId`, `utilisateurId`, `email`

### 3. Gateway (`GatewayAuthenticationSuccessHandler.java`)

#### Modification du handler OAuth2
- **Ajout** : Lecture du cookie `visiteurId`
- **Action** : Envoie le `visiteurId` au service Auth en paramètre de query string
- **Méthode** : `extractVisiteurIdFromCookie()`

## 📝 Utilisation Frontend

### 1. Stocker le visiteurId dans un cookie

Lors du démarrage du processus BPMN, le frontend doit stocker le `visiteurId` dans un cookie :

```javascript
// Après l'appel à /api/acceuil/api/start
fetch('/api/acceuil/api/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userAgent: navigator.userAgent,
    referrer: document.referrer,
    // ... autres données
  })
})
.then(res => res.json())
.then(data => {
  const visiteurId = data.visiteurId;
  
  // Stocker dans un cookie (expire dans 1 jour)
  document.cookie = `visiteurId=${visiteurId}; path=/; max-age=86400; SameSite=Lax`;
  
  console.log('✅ visiteurId stocké:', visiteurId);
});
```

### 2. Le cookie est automatiquement envoyé lors du callback OAuth2

Le browser envoie automatiquement le cookie lors de la redirection depuis Google vers le Gateway.

## 🧪 Tests

### Test manuel du flux complet

1. **Démarrer les services** :
   ```bash
   # Terminal 1: Eureka
   cd eureka && mvn spring-boot:run
   
   # Terminal 2: Config Server
   cd config-server && mvn spring-boot:run
   
   # Terminal 3: Service Acceuil
   cd acceuil && mvn spring-boot:run
   
   # Terminal 4: Service Auth
   cd auth && mvn spring-boot:run
   
   # Terminal 5: Gateway
   cd gateway && mvn spring-boot:run
   ```

2. **Ouvrir** : http://localhost:8090

3. **Tester** :
   - Cliquer sur "Se connecter avec Google"
   - S'authentifier avec Google
   - Vérifier les logs dans les services Auth et Acceuil
   - Vérifier que le processus BPMN a bien reçu le message

### Logs attendus

#### Service Auth
```
🔄 [AUTH API] Traitement authentification OAuth2 pour: user@gmail.com
🔍 [AUTH API] visiteurId reçu: v-1730572800000
✅ [AUTH API] Utilisateur traité: user@gmail.com
🔍 [AUTH API] Nouvel utilisateur: true
🔄 [AUTH API] Appel au service Acceuil: http://localhost:8083/api/acceuil/api/inscription
✅ [AUTH API] Notification Acceuil réussie: {success=true, action=inscription}
```

#### Service Acceuil
```
🔄 [api/inscription] Envoi msg_inscription pour visiteurId=v-1730572800000 utilisateurId=1 email=user@gmail.com
✅ [api/inscription] Message msg_inscription envoyé avec succès pour visiteurId=v-1730572800000
```

## 🎯 Points Importants

1. **Cookie visiteurId** : Doit être défini par le frontend avant la redirection OAuth2
2. **Corrélation BPMN** : Les messages sont corrélés avec le `visiteurId`
3. **Gestion d'erreur** : L'authentification réussit même si la notification au processus BPMN échoue
4. **Découverte de service** : Le service Auth utilise Eureka pour trouver le service Acceuil

## 📚 Références

- **Processus BPMN** : `acceuil/src/main/resources/processus/intermediation.bpmn`
- **Messages BPMN** :
  - `msg_inscription` : Déclenche inscription + authentification
  - `msg_connexion` : Déclenche authentification seulement
