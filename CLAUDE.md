# Contexte du Projet - Plateforme d'Intermédiation d'Expertises

## Vue d'ensemble

Plateforme d'intermédiation pour connecter des experts avec des utilisateurs, basée sur une architecture microservices moderne.

## Pile Technologique

### Backend
- **Framework**: Spring Boot 3.5.3 avec Spring Cloud 2025.0.0
- **Java**: Version 17+
- **Orchestration**: Camunda Zeebe 8.5.7
- **Base de données**: PostgreSQL 17
- **Service Discovery**: Netflix Eureka
- **Configuration**: Spring Cloud Config Server
- **Authentification**: OAuth2 avec Keycloak 23.0
- **API Gateway**: Spring Cloud Gateway

### Frontend
- **Framework**: React 18.3.1
- **Langage**: TypeScript 5.5.3
- **Build**: Vite 5.4.0
- **Styling**: Tailwind CSS 3.4.1 + DaisyUI 4.12.10
- **Routing**: React Router DOM 6.26.0
- **Icons**: Lucide React 0.428.0

### Infrastructure
- **Conteneurisation**: Docker + Docker Compose
- **Recherche**: Elasticsearch 8.9.0
- **Build**: Maven 3.8+

## Architecture des Microservices

### Structure du Projet

```
repo-as/
├── spring-microservice/           # Monorepo principal (9 modules)
│   ├── lib-security/             # Bibliothèque OAuth2 partagée
│   ├── config-server/            # Configuration centralisée (port 8888)
│   ├── registry/                 # Eureka Registry (port 8761)
│   ├── gateway/                  # API Gateway + Frontend (port 8090)
│   ├── acceuil/                  # Feed personnalisé + Zeebe (port 8083)
│   ├── auth/                     # Authentification (port 8084)
│   ├── expertise/                # Gestion expertises (port 8086)
│   ├── enrollment/               # Inscription (port 8081)
│   └── payment/                  # Paiement (port 8082)
├── config-repo/                  # Configurations externalisées
├── postgres-init/                # Scripts SQL d'initialisation
└── docker-compose.yml            # Orchestration conteneurs
```

### Services et Ports

| Service | Port | Rôle |
|---------|------|------|
| gateway | 8090 | Point d'entrée unique + Frontend React |
| registry | 8761 | Service Discovery (Eureka) |
| config-server | 8888 | Configuration centralisée |
| auth | 8084 | Authentification OAuth2/Keycloak |
| acceuil | 8083 | Feed personnalisé avec orchestration Zeebe |
| expertise | 8086 | Gestion expertises et compétences |
| enrollment | 8081 | Service d'inscription |
| payment | 8082 | Service de paiement |
| keycloak | 8098 | Serveur d'authentification |
| postgresql | 5433 | Base de données |
| elasticsearch | 9200 | Recherche et logs |
| zeebe | 26500 | Moteur de workflow |

## Fonctionnalités Principales

### 1. Authentification Sociale (Service Auth)
- Login via Google, Facebook, Apple
- Intégration Keycloak
- Création automatique d'utilisateurs
- Liaison multi-providers
- Gestion OAuth2

### 2. Gestion des Expertises (Service Expertise)
- Profils d'expertise des utilisateurs
- Compétences avec niveaux de maîtrise
- Publication/dépublication d'expertises
- API publique pour affichage des experts
- Persistance JPA avec Flyway migrations

### 3. Feed Personnalisé (Service Acceuil)
- Analyse du profil visiteur (technique, comportementale, contextuelle)
- Processus BPMN (`intermediation.bpmn`) pour orchestration
- Chargement dynamique de contenu par lot
- Tracking du "dwell time" (engagement utilisateur)
- Workers Zeebe pour traitement asynchrone

### 4. API Gateway
- Routage vers tous les microservices
- Authentification OAuth2 centralisée
- Propagation des headers utilisateur
- Load balancing
- Frontend React embarqué

### 5. Architecture Résiliente
- Service Discovery automatique
- Configuration externalisée et dynamique
- Health checks
- Logging structuré

## Configuration

### Bases de Données (PostgreSQL 17)
- `keycloak_db` - Données Keycloak
- `auth_db` - Service d'authentification
- `acceuil_db` - Service d'accueil
- `expertise_db` - Service d'expertise

### Keycloak
- **Realm**: `realm_picp`
- **Client ID**: `pitm-auth-service`
- **Issuer URI**: `http://localhost:8098/realms/realm_picp`
- **Providers**: Google, Facebook, Apple

### Variables d'Environnement Importantes
- `KEYCLOAK_CLIENT_SECRET` - Secret du client Keycloak
- `DB_USERNAME` / `DB_PASSWORD` - Credentials PostgreSQL
- Config Server credentials: `root` / `s3cr3t`

## Fichiers de Configuration (config-repo/)

- `common.yml` - Configuration Eureka partagée
- `security-common.yml` - Sécurité partagée
- `db-common.yml` - Configuration BDD partagée
- `gateway.yml` - Routes et OAuth2 du gateway
- `auth.yml` - Configuration service auth
- `expertise.yml` - Configuration service expertise
- `acceuil.yml` - Configuration service accueil
- `enrollment.yml` - Configuration service inscription
- `payment.yml` - Configuration service paiement

## Frontend React

### Structure
```
gateway/src/main/resources/frontend/
├── src/
│   ├── components/      # Composants réutilisables
│   ├── pages/          # Pages (Auth, Home, Dashboard)
│   ├── services/       # Services API
│   ├── context/        # Contextes React
│   ├── hooks/          # Custom hooks
│   ├── types/          # Définitions TypeScript
│   ├── utils/          # Utilitaires
│   ├── router/         # Configuration routage
│   └── styles/         # Styles Tailwind/DaisyUI
```

### Technologies Frontend
- React 18 avec TypeScript
- Vite pour le build
- Tailwind CSS + DaisyUI pour le styling
- React Router pour la navigation
- Lucide React pour les icônes

## Orchestration Zeebe

### Processus BPMN
- **Fichier**: `intermediation.bpmn`
- **Workers**:
  - Analyse du profil visiteur
  - Chargement de contenu dynamique
  - Moteur d'engagement utilisateur

### Intégration
- Camunda Spring Zeebe Starter 8.5.21
- Communication asynchrone entre services
- Gestion de workflows métier complexes

## Dépendances Clés

### Partagées (tous les modules)
- Spring Boot Starter Web
- Spring Boot Starter Actuator
- Lombok 1.18.32
- Netflix Eureka Client
- Spring Cloud Config Client

### Sécurité
- Spring Security OAuth2 Resource Server
- Spring Security OAuth2 Client
- Spring Security OAuth2 JOSE (JWT)

### Persistance
- Spring Data JPA
- PostgreSQL Driver
- Flyway Core (migrations)
- Spring Boot Starter Validation

## Commandes Utiles

### Démarrage
```bash
# Démarrer l'infrastructure Docker
docker-compose up -d

# Build du projet Maven
cd spring-microservice
mvn clean install

# Démarrer un service spécifique
cd <service-name>
mvn spring-boot:run
```

### Frontend
```bash
cd spring-microservice/gateway/src/main/resources/frontend
npm install
npm run dev      # Mode développement
npm run build    # Build production
```

## Points d'Attention

1. **Ordre de démarrage recommandé**:
   - Docker Compose (Keycloak, PostgreSQL, Elasticsearch, Zeebe)
   - Config Server
   - Eureka Registry
   - Services métier (auth, expertise, acceuil, etc.)
   - Gateway (dernier)

2. **Sécurité**:
   - Tous les services utilisent OAuth2 Resource Server
   - lib-security partagée pour configuration commune
   - Propagation du contexte de sécurité via Gateway

3. **Base de données**:
   - Scripts d'initialisation dans `postgres-init/`
   - Migrations Flyway pour versioning du schéma
   - Connexions configurées via config-repo

4. **Frontend**:
   - Intégré dans le module gateway
   - Build Maven avec frontend-maven-plugin
   - Proxy Vite vers backend en développement

## Version du Projet
- **Version actuelle**: 0.0.1-SNAPSHOT
- **Branch principale**: main
- **Derniers commits**:
  - b929e35 - V1.0.2 - verification email et photos profils
  - 8a035fa - gitignore add exemple
  - e29f56c - premier commit

---

# RÈGLES DE DÉVELOPPEMENT OBLIGATOIRES

## 1. Nommage (Français obligatoire)

**TOUJOURS utiliser le français pour :**
- ✅ Noms des fonctions/méthodes
- ✅ Noms des variables
- ✅ Noms des colonnes dans les tables SQL
- ✅ Noms des champs dans les entités JPA
- ✅ Noms des DTOs et leurs propriétés
- ✅ Commentaires dans le code

**Exemples :**
```java
// ✅ CORRECT
public DemandeReconnaissanceDTO creerDemandeReconnaissance(UUID utilisateurId) {
    String commentaireExpert = request.getCommentaireExpert();
    LocalDateTime dateCreation = LocalDateTime.now();
    // ...
}

// ❌ INCORRECT
public DemandeReconnaissanceDTO createRecognitionRequest(UUID userId) {
    String expertComment = request.getExpertComment();
    LocalDateTime createdAt = LocalDateTime.now();
    // ...
}
```

```typescript
// ✅ CORRECT (Frontend)
const creerDemande = async (competenceId: number, commentaire: string) => {
  const demande = await reconnaissanceService.creerDemande({
    competenceId,
    commentaireExpert: commentaire
  });
};

// ❌ INCORRECT
const createRequest = async (skillId: number, comment: string) => {
  const request = await recognitionService.createRequest({
    skillId,
    expertComment: comment
  });
};
```

```sql
-- ✅ CORRECT
CREATE TABLE demandes_reconnaissance_competence (
    id BIGSERIAL PRIMARY KEY,
    utilisateur_id UUID NOT NULL,
    competence_id BIGINT NOT NULL,
    commentaire_expert TEXT,
    date_creation TIMESTAMP NOT NULL
);

-- ❌ INCORRECT
CREATE TABLE recognition_requests (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    skill_id BIGINT NOT NULL,
    expert_comment TEXT,
    created_at TIMESTAMP NOT NULL
);
```

## 2. Interfaces et UI (Mobile-First obligatoire)

**TOUJOURS développer avec approche mobile-first :**
- ✅ Utiliser **DaisyUI** pour tous les composants CSS
- ✅ Design responsive par défaut (mobile → tablet → desktop)
- ✅ Tester sur petits écrans (320px minimum)
- ✅ Utiliser les classes Tailwind responsive (`sm:`, `md:`, `lg:`, `xl:`)
- ✅ Navigation adaptée mobile (sidebar collapsible, burger menu)

**Exemples DaisyUI :**
```tsx
// ✅ CORRECT - Formulaire mobile-first avec DaisyUI
<form className="space-y-4 w-full max-w-md mx-auto p-4">
  {/* Input DaisyUI responsive */}
  <div className="form-control w-full">
    <label className="label">
      <span className="label-text">Nom de la compétence</span>
    </label>
    <input
      type="text"
      placeholder="Ex: Développement React"
      className="input input-bordered w-full"
      value={nom}
      onChange={(e) => setNom(e.target.value)}
    />
  </div>

  {/* Select DaisyUI */}
  <div className="form-control w-full">
    <label className="label">
      <span className="label-text">Niveau de maîtrise</span>
    </label>
    <select className="select select-bordered w-full">
      <option value="1">Débutant</option>
      <option value="2">Intermédiaire</option>
      <option value="3">Avancé</option>
      <option value="4">Expert</option>
      <option value="5">Maître</option>
    </select>
  </div>

  {/* Bouton responsive */}
  <button className="btn btn-primary w-full sm:w-auto">
    Enregistrer
  </button>
</form>

// ❌ INCORRECT - Pas DaisyUI, pas responsive
<form style={{ width: '600px', margin: '0 auto' }}>
  <div>
    <label>Skill Name</label>
    <input type="text" style={{ width: '100%' }} />
  </div>
  <button style={{ padding: '10px 20px' }}>Save</button>
</form>
```

**Composants DaisyUI à utiliser prioritairement :**
- `btn`, `btn-primary`, `btn-secondary`, `btn-ghost`
- `input`, `input-bordered`, `textarea`
- `select`, `select-bordered`
- `checkbox`, `radio`, `toggle`, `range`
- `card`, `card-body`, `card-title`, `card-actions`
- `modal`, `modal-box`, `modal-action`
- `alert`, `alert-success`, `alert-error`, `alert-warning`
- `badge`, `badge-primary`, `badge-secondary`
- `table`, `table-zebra`, `table-compact`
- `drawer`, `navbar`, `menu`, `breadcrumbs`
- `loading`, `loading-spinner`, `loading-dots`

**Layout responsive :**
```tsx
// ✅ CORRECT - Grid responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
  {/* Cards s'adaptent automatiquement */}
  {badges.map(badge => (
    <div key={badge.id} className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-sm md:text-base">{badge.nom}</h2>
        <div className="card-actions justify-end">
          <button className="btn btn-sm btn-primary">Voir</button>
        </div>
      </div>
    </div>
  ))}
</div>

// ❌ INCORRECT - Layout fixe
<div style={{ display: 'flex', gap: '20px' }}>
  {badges.map(badge => (
    <div key={badge.id} style={{ width: '300px' }}>
      {/* ... */}
    </div>
  ))}
</div>
```

## 3. Qualité du Code

**TOUJOURS vérifier :**
- ✅ **Compilation sans erreurs** : Tester `mvn clean install` (backend) et `npm run build` (frontend)
- ✅ **Types TypeScript stricts** : Pas de `any`, définir interfaces complètes
- ✅ **Validation côté serveur** : Ne jamais faire confiance au frontend
- ✅ **Gestion des erreurs** : Try-catch appropriés, messages d'erreur en français
- ✅ **Logs en français** : `log.info("Création de la demande pour l'utilisateur {}", utilisateurId)`

## 4. Conventions de Nommage Spécifiques

**Backend (Java) :**
- Classes : PascalCase (ex: `DemandeReconnaissanceCompetence`)
- Méthodes : camelCase français (ex: `creerDemandeReconnaissance`, `obtenirMesDemandes`)
- Variables : camelCase français (ex: `utilisateurId`, `commentaireExpert`)
- Constantes : UPPER_SNAKE_CASE français (ex: `NOMBRE_MAX_TENTATIVES`)

**Frontend (TypeScript) :**
- Composants : PascalCase (ex: `ModalDemandeReconnaissance`, `ListeBadges`)
- Fonctions : camelCase français (ex: `creerDemande`, `obtenirBadges`)
- Variables : camelCase français (ex: `utilisateur`, `listeDemandes`)
- Constantes : UPPER_SNAKE_CASE français (ex: `STATUTS_DEMANDE`)

**Base de données (SQL) :**
- Tables : snake_case pluriel français (ex: `demandes_reconnaissance_competence`, `badges_competence`)
- Colonnes : snake_case français (ex: `utilisateur_id`, `commentaire_expert`, `date_creation`)
- Index : `idx_` + description (ex: `idx_demande_statut`, `idx_badge_utilisateur`)
- Contraintes : `fk_` ou `uk_` + description (ex: `fk_demande_competence`, `uk_badge_actif`)

## 5. Processus de Développement

**Workflow obligatoire :**
1. ✅ Comprendre la fonctionnalité demandée
2. ✅ Identifier les fichiers à modifier (backend + frontend si nécessaire)
3. ✅ Modifier le code en respectant les règles ci-dessus
4. ✅ **OBLIGATOIRE - Tester la compilation :**
   - Backend : `mvn clean install` ou `mvn compile`
   - Frontend : `npm run build` ou `npm run type-check`
5. ✅ **Corriger TOUTES les erreurs de compilation** (ne JAMAIS passer à l'étape suivante si erreurs)
6. ✅ Vérifier que les endpoints fonctionnent (si backend)
7. ✅ Vérifier que l'UI est responsive (si frontend)
8. ✅ Créer migrations Flyway si schéma DB modifié
9. ✅ **Recompiler une dernière fois** pour confirmer que tout fonctionne
10. ✅ **SEULEMENT APRÈS** déclarer que c'est terminé

**⚠️ RÈGLE CRITIQUE - Vérification Compilation Frontend :**
```bash
# Après CHAQUE modification frontend, TOUJOURS exécuter :
cd spring-microservice/gateway/src/main/resources/frontend
npm run build
# OU pour vérification rapide des types :
npm run type-check

# Si ERREURS → Les corriger IMMÉDIATEMENT
# Si SUCCÈS → Alors seulement dire "C'est terminé"
```

**Processus de correction des erreurs TypeScript :**
1. Lire attentivement les messages d'erreur
2. Identifier les fichiers et lignes concernés
3. Corriger les erreurs (types manquants, imports, props, etc.)
4. Recompiler jusqu'à obtenir `0 errors`
5. **Ne JAMAIS dire "c'est fini" tant qu'il reste des erreurs**

**Ne JAMAIS :**
- ❌ Laisser des erreurs de compilation
- ❌ Dire "c'est terminé" sans avoir vérifié la compilation
- ❌ Ignorer les erreurs TypeScript
- ❌ Utiliser l'anglais pour le nommage (sauf classes framework)
- ❌ Créer des UI non-responsives
- ❌ Ignorer DaisyUI et créer du CSS custom
- ❌ Modifier le schéma DB sans migration Flyway

---

# ANALYSE APPROFONDIE DU PROJET

## 1. DÉTAILS DES MICROSERVICES

### 1.1 SERVICE AUTH (Port 8084)

#### Entités Principales

**Utilisateur** (`utilisateurs` table)
```java
- id: UUID (PK)
- email: String (unique, not null)
- typePersonne: PHYSIQUE | MORALE
- nom, prenom: String
- telephone: String
- dateNaissance: LocalDate
- domaineExpertise: String
- biographie: TEXT
- domainesInteret: JSON
- photoUrl: String
- photoData: BYTEA (stockage blob)
- photoContentType: String
// OAuth providers
- googleId: String (unique)
- facebookId: String (unique)
- appleId: String (unique)
// Auth classique
- motDePasseHash: String
// Email verification
- emailVerifie: Boolean (default false)
- tokenVerificationEmail: String
- dateExpirationToken: LocalDateTime
// Audit
- dateCreation: LocalDateTime
- derniereConnexion: LocalDateTime
- actif: Boolean (default true)
```

#### Controllers et Endpoints

**AuthController** (`/api`)
- `POST /auth/register` - Inscription email/password
- `POST /auth/login` - Connexion email/password
- `GET /auth/verifier-email?token={token}` - Vérification email
- `POST /auth/renvoyer-verification` - Renvoi email de vérification
- `GET /oauth2/success` - Callback OAuth2 (Google, Facebook, Apple)
- `GET /me` - Informations utilisateur connecté
- `GET /me/roles` - Rôles de l'utilisateur
- `GET /keycloak-id-by-email?email={email}` - ID Keycloak par email

**ProfilController** (`/api/profil`)
- `GET /` - Récupérer profil utilisateur
- `PUT /` - Mettre à jour profil
- `PUT /completer` - Compléter profil (infos professionnelles)

**PhotoController** (`/api/photos`)
- `POST /upload` - Upload photo de profil
- `GET /{utilisateurId}` - Télécharger photo

**UtilisateurController** (`/api/utilisateurs`)
- `GET /{id}` - Récupérer utilisateur par ID
- `GET /email/{email}` - Récupérer utilisateur par email

#### Services Clés

**AuthService**
- `traiterAuthOAuth2(email, nom, prenom, provider)` - Traitement auth OAuth2
- `inscrireAvecMotDePasse(request)` - Inscription classique
- `connecterAvecMotDePasse(request)` - Connexion classique
- `verifierEmail(token)` - Vérification email

**KeycloakService**
- `creerUtilisateur(email, nom, prenom, motDePasse)` - Création dans Keycloak
- `obtenirIdKeycloak(email)` - Récupération ID Keycloak
- `attribuerRoles(userId, roles)` - Attribution de rôles
- `verifierMotDePasse(email, motDePasse)` - Vérification credentials

**EmailService**
- `envoyerEmailVerification(email, token)` - Email de vérification
- `envoyerEmailConfirmation(email)` - Confirmation inscription
- Templates Thymeleaf pour emails HTML

**ProfilService**
- `mettreAJourProfil(utilisateurId, request)` - MAJ profil
- `completerProfil(utilisateurId, request)` - Complétion profil pro

#### Migrations Flyway (6 versions)

- **V1**: `initial_schema.sql` - Schéma initial utilisateurs
- **V2**: `add_photo_blob.sql` - Ajout photoData BYTEA
- **V3**: `add_email_verification.sql` - Ajout vérification email
- **V4**: `Remove_Experience_Column.sql` - Nettoyage colonnes obsolètes
- **V5**: `Cleanup_Obsolete_Columns.sql` - Nettoyage supplémentaire
- **V6**: `Cleanup_Additional_Columns.sql` - Nettoyage final

---

### 1.2 SERVICE EXPERTISE (Port 8086)

#### Entités Principales (26 tables)

**1. Expertise** (`expertises` table)
```java
- id: Long (PK)
- utilisateurId: UUID (unique, not null)
- titre: String
- description: TEXT
- photoUrl: String
- villeId: Long (FK vers Ville)
- ville, departement, region, pays: String (dénormalisés)
- localisationComplete: String
- disponible: Boolean (default true)
- publiee: Boolean (default false)
- dateCreation, dateModification: LocalDateTime
```

**2. Competence** (`competences` table)
```java
- id: Long (PK)
- utilisateurId: UUID (not null)
- nom: String (not null)
- description: TEXT
- niveauMaitrise: Integer (1-5)
- anneesExperience: Integer
- thm: BigDecimal (Tarif Horaire Moyen en FCFA)
- nombreProjets: Integer
- certifications: TEXT
- estFavorite: Boolean (default false)
- dateCreation, dateModification: LocalDateTime
```

**3. CompetenceReference** (`competences_reference` table)
```java
- id: Long (PK)
- code: String (unique, not null)
- libelle: String (not null)
- description: TEXT
- domaineCompetenceId: Long (FK)
- domaineMetierId: Long (FK)
- sousDomaineMetierId: Long (FK)
- verbeAction, objet, contexte: String
- ressourcesMobilisees: TEXT/JSON
- criteresPerformance: TEXT/JSON
- referentiel: String (ex: "RNCP", "DigComp")
- organisme: String (ex: "France Compétences")
- statut: PROPOSITION|VALIDE|EN_REVISION|OBSOLETE
- niveauHierarchie: Integer
- competenceParentId: Long (auto-référence)
- indicePopularite: Integer (default 0)
- version: String
- dateCreation, dateModification: LocalDateTime
- estActive: Boolean (default true)
```

**4. DemandeReconnaissanceCompetence** (`demandes_reconnaissance_competence` table)
```java
- id: Long (PK)
- utilisateurId: UUID (expert demandeur)
- competenceId: Long (FK vers Competence)
- statut: EN_ATTENTE|ASSIGNEE_RH|EN_COURS_EVALUATION|
          EN_ATTENTE_VALIDATION|COMPLEMENT_REQUIS|
          APPROUVEE|REJETEE|ANNULEE
// Workflow 3 acteurs
- managerId: UUID (manager qui assigne)
- traitantId: UUID (RH évaluateur)
// Commentaires séparés par rôle
- commentaireExpert: TEXT
- commentaireManagerAssignation: TEXT
- commentaireRhEvaluation: TEXT
- commentaireTraitant: TEXT (validation finale)
// Dates workflow
- dateCreation: LocalDateTime
- dateAssignation: LocalDateTime (quand RH assigné)
- dateEvaluation: LocalDateTime (quand RH évalue)
- dateTraitement: LocalDateTime (validation finale)
// Zeebe
- processInstanceKey: Long (clé instance Zeebe)
- priorite: Integer (default 0)
```

**5. EvaluationCompetence** (`evaluations_competence` table)
```java
- id: Long (PK)
- demandeId: Long (FK vers DemandeReconnaissanceCompetence)
- traitantId: UUID (RH évaluateur)
- noteGlobale: Integer (0-100)
- criteres: JSON (détails des critères évalués)
- recommandation: APPROUVER|REJETER|DEMANDER_COMPLEMENT|EN_COURS
- commentaire: TEXT
- dateEvaluation: LocalDateTime
- tempsEvaluationMinutes: Integer
```

**6. BadgeCompetence** (`badges_competence` table)
```java
- id: Long (PK)
- competenceId: Long (FK vers Competence)
- utilisateurId: UUID (not null)
- demandeReconnaissanceId: Long (FK)
- niveauCertification: BRONZE(1)|ARGENT(2)|OR(3)|PLATINE(4)
- validitePermanente: Boolean (default true)
- dateExpiration: LocalDate (nullable)
- estActif: Boolean (default true)
- dateRevocation: LocalDateTime
- motifRevocation: TEXT
- estPublic: Boolean (default true)
- ordreAffichage: Integer
- dateObtention: LocalDateTime
- dateModification: LocalDateTime
// Constraint unique partiel pour historique
UNIQUE INDEX idx_badge_unique_actif
  ON (competence_id, utilisateur_id) WHERE est_actif = true
```

**7. Taxonomie**

**DomaineCompetence** (`domaines_competence` table)
```java
- id: Long (PK)
- code: String (unique, not null)
- libelle: String (not null)
- description: TEXT
- ordreAffichage: Integer
- estActif: Boolean (default true)
```

**DomaineMetier** (`domaines_metier` table)
```java
- id: Long (PK)
- code: String (unique, not null)
- libelle: String (not null)
- description: TEXT
- ordreAffichage: Integer
- estActif: Boolean (default true)
```

**SousDomaineMetier** (`sous_domaines_metier` table)
```java
- id: Long (PK)
- code: String (unique, not null)
- libelle: String (not null)
- description: TEXT
- domaineMetierId: Long (FK vers DomaineMetier)
- ordreAffichage: Integer
- estActif: Boolean (default true)
```

**8. Évaluation (Référentiels)**

**CritereEvaluation** (`criteres_evaluation` table)
```java
- id: Long (PK)
- code: String (unique, not null)
- libelle: String (not null)
- description: TEXT
- domaineId: Long (FK vers DomaineCompetence, nullable)
- poids: Integer (1-10, importance relative)
- estActif: Boolean (default true)
```

**MethodeEvaluation** (`methodes_evaluation` table)
```java
- id: Long (PK)
- code: String (unique, not null)
- libelle: String (not null)
- description: TEXT
- dureeEstimeeMinutes: Integer
- estActive: Boolean (default true)
```

**CritereMethodeJunction** (`criteres_methodes` table - Many-to-Many)
```java
- critereId: Long (FK vers CritereEvaluation)
- methodeId: Long (FK vers MethodeEvaluation)
PRIMARY KEY (critere_id, methode_id)
```

**9. Localisation**

**Pays** (`pays` table)
```java
- id: Long (PK)
- code: String (unique, ex: "CI", "FR")
- nom: String (not null)
- nomComplet: String
```

**Ville** (`villes` table)
```java
- id: Long (PK)
- nom: String (not null)
- departement: String
- region: String
- paysId: Long (FK vers Pays)
- codePostal: String
```

**10. Réseau**

**ReseauExpertise** (`reseau_expertise` table)
```java
- id: Long (PK)
- utilisateurId: UUID (follower)
- expertSuiviId: UUID (followee)
- dateSuivi: LocalDateTime
UNIQUE (utilisateur_id, expert_suivi_id)
```

#### Controllers (12 au total)

**ExpertiseController** (`/api/expertise`)
- `POST /mon-expertise` - Créer/mettre à jour expertise
- `GET /mon-expertise` - Récupérer mon expertise
- `PUT /mon-expertise/publier` - Publier expertise
- `PUT /mon-expertise/depublier` - Dépublier expertise
- `POST /competences` - Créer compétence
- `PUT /competences/{id}` - MAJ compétence
- `DELETE /competences/{id}` - Supprimer compétence
- `GET /competences` - Lister mes compétences
- `GET /utilisateur/{userId}/public` - Voir profil expert public
- `GET /public/experts` - Liste experts publiés (feed)

**CompetenceReferenceController** (`/api/competences-reference`)
- `GET /` - Lister référentiel (filtres: domaine, statut, recherche)
- `GET /{id}` - Détails compétence référence
- `POST /` - Créer compétence référence (ADMIN)
- `PUT /{id}` - MAJ compétence référence (ADMIN)
- `DELETE /{id}` - Supprimer (soft delete)
- `GET /hierarchie/{parentId}` - Arborescence compétences

**BadgeController** (`/api/badges`)
- `GET /mes-badges` - Lister mes badges
- `GET /utilisateur/{userId}` - Badges d'un utilisateur (si public)
- `PUT /{id}/visibilite` - Changer visibilité (public/privé)
- `PUT /{id}/ordre` - Réordonner badges
- `POST /{id}/revoquer` - Révoquer badge (ADMIN)

**DemandeReconnaissanceController** (`/api/demandes-reconnaissance`)
- `POST /` - Créer demande reconnaissance (EXPERT)
- `GET /mes-demandes` - Lister mes demandes (EXPERT)
- `GET /` - Lister toutes demandes (MANAGER, RH)
- `GET /{id}` - Détails demande
- `PUT /{id}/annuler` - Annuler demande (EXPERT)

**TraitementDemandeController** (`/api/traitement-demandes`)
- `POST /assigner` - Assigner RH à demande (MANAGER)
- `POST /{id}/evaluer` - Évaluer compétence (RH)
- `POST /{id}/approuver` - Approuver demande (MANAGER)
- `POST /{id}/rejeter` - Rejeter demande (MANAGER)
- `POST /{id}/demander-complement` - Demander infos (MANAGER)
- `GET /{id}/evaluation` - Récupérer évaluation

**ReseauExpertiseController** (`/api/reseau`)
- `POST /suivre/{expertId}` - Suivre un expert
- `DELETE /ne-plus-suivre/{expertId}` - Ne plus suivre
- `GET /mes-abonnements` - Experts que je suis
- `GET /mes-abonnes` - Experts qui me suivent
- `GET /statistiques` - Stats réseau (nb followers/following)

**ReferentielController** (`/api/referentiels`)
- Gestion des domaines, critères et méthodes d'évaluation
- Endpoints pour CRUD référentiels

**DomaineMetierController** (`/api/domaines-metier`)
- CRUD domaines métier et sous-domaines

**LocalisationController** (`/api/localisations`)
- `GET /pays` - Liste des pays
- `GET /villes` - Liste des villes (filtres: pays, recherche)
- CRUD pays et villes (ADMIN)

**CertificationController** (`/api/certifications`)
- Gestion des certifications utilisateurs

**ProcessController** (`/api/processus`)
- `GET /instances` - Instances de processus Zeebe
- `POST /demarrer/{processId}` - Démarrer processus BPMN

#### Services Clés

**ExpertiseService**
- `creerOuMettreAJourExpertise(utilisateurId, dto)`
- `publierExpertise(utilisateurId)`
- `depublierExpertise(utilisateurId)`
- `ajouterCompetence(utilisateurId, dto)`
- `obtenirExpertsPublies(pagination)`

**CompetenceReferenceService**
- `listerCompetences(filtres, pagination)`
- `creerCompetenceReference(dto)` (ADMIN)
- `mettreAJourCompetence(id, dto)` (ADMIN)
- `obtenirHierarchie(parentId)`

**BadgeService**
- `attribuerBadge(utilisateurId, competenceId, demandeId, niveau)`
- `revoquerBadge(badgeId, motif)` (ADMIN)
- `obtenirBadgesUtilisateur(utilisateurId, inclurePrives)`
- `changerVisibilite(badgeId, estPublic)`

**ReconnaissanceCompetenceService**
- `creerDemandeReconnaissance(utilisateurId, dto)`
- `annulerDemande(demandeId, utilisateurId)`
- `obtenirMesDemandes(utilisateurId)`
- `obtenirToutesDemandes(filtres)`

**TraitementDemandeService**
- `assignerRh(demandeId, rhId, managerId, commentaire)`
  → Démarre processus Zeebe
  → Change statut → ASSIGNEE_RH
- `evaluerDemande(demandeId, rhId, evaluation)`
  → Crée EvaluationCompetence
  → Change statut → EN_ATTENTE_VALIDATION
- `approuverDemande(demandeId, managerId, commentaire)`
  → Change statut → APPROUVEE
  → Appelle BadgeService.attribuerBadge()
  → Badge créé (niveau basé sur noteGlobale)
- `rejeterDemande(demandeId, managerId, motif)`
  → Change statut → REJETEE
- `demanderComplement(demandeId, managerId, commentaire)`
  → Change statut → COMPLEMENT_REQUIS

**ReseauExpertiseService**
- `suivreExpert(utilisateurId, expertId)`
- `nePlusSuivreExpert(utilisateurId, expertId)`
- `obtenirAbonnements(utilisateurId)`
- `obtenirStatistiques(utilisateurId)`

**UtilisateurRhService**
- Appel REST vers service AUTH
- `obtenirUtilisateursParRole(role)` - Liste RH, managers
- `obtenirUtilisateurParId(id)` - Détails utilisateur

#### Migrations Flyway (26 versions!)

- **V1-V5**: Schéma initial expertises + compétences
- **V6-V9**: Référentiel compétences + reconnaissance
- **V10-V12**: Badges + niveaux certification
- **V13**: `add_manager_rh_workflow_fields.sql` - Ajout workflow 3-acteurs
- **V14**: `migrate_manager_ids_to_keycloak.sql` - Migration IDs Keycloak
- **V15**: `add_separate_comment_fields.sql` - Commentaires séparés
- **V16**: `create_domaines_evaluation_tables.sql` - Taxonomie évaluation
- **V17**: `populate_domaines_evaluation.sql` - Données de référence
- **V18**: `remove_niveau_taxonomie_column.sql` - Cleanup
- **V19**: `remove_old_evaluations_and_fixed_criteria.sql` - Cleanup
- **V20**: `add_process_instance_key_to_demandes.sql` - Intégration Zeebe
- **V21**: `remove_niveau_vise_column.sql` - Cleanup
- **V22**: `rename_ordre_affichage_to_popularite.sql` - Refactoring
- **V23**: `remove_ordre_affichage_from_criteres_evaluation.sql` - Cleanup
- **V24**: `remove_ordre_affichage_and_est_recommande_from_methodes_evaluation.sql`
- **V25**: `remove_domaine_id_from_methodes_evaluation.sql` - Découplage
- **V26**: `create_criteres_methodes_junction_table.sql` - Many-to-Many

#### Configuration Sécurité

**SecurityConfig.java**
- OAuth2 Resource Server avec Keycloak JWT
- Endpoints publics: `/api/expertise/public/**`, `/api/localisations/**`
- Endpoints ADMIN: création/MAJ référentiels
- Endpoints MANAGER/RH: workflow reconnaissance
- Endpoints EXPERT: mes compétences, mes demandes

**HeaderBasedAuthenticationFilter.java**
- Extrait headers `X-User-Id`, `X-User-Email`, `X-User-Roles`
- Crée SecurityContext Spring
- Validation ownership (utilisateur ne peut modifier que ses données)

---

### 1.3 SERVICE GATEWAY (Port 8090)

#### Configuration Routes (GatewayRoutesConfig.java)

```java
/oauth2/** → AUTH service (8084)
/api/auth/** → AUTH service (8084)
/api/profil/** → AUTH service (8084)
/api/photos/** → AUTH service (8084)
/api/utilisateurs/** → AUTH service (8084)

/api/acceuil/** → ACCEUIL service (8083)

/api/expertise/** → EXPERTISE service (8086)
/api/competences-reference/** → EXPERTISE service (8086)
/api/certifications/** → EXPERTISE service (8086)
/api/localisations/** → EXPERTISE service (8086)
/api/reseau/** → EXPERTISE service (8086)
/api/badges/** → EXPERTISE service (8086)
/api/reconnaissance-competences/** → EXPERTISE service (8086)
/api/demandes-reconnaissance/** → EXPERTISE service (8086)
/api/traitement-demandes/** → EXPERTISE service (8086)
/api/referentiels/** → EXPERTISE service (8086)
/api/domaines-metier/** → EXPERTISE service (8086)
/api/processus/** → EXPERTISE service (8086)

/api/paiement/** → PAIEMENT service (8082)
/api/enrollment/** → ENROLLMENT service (8081)
```

#### Filtres et Sécurité

**UserPropagationGatewayFilter.java**
- Intercepte toutes les requêtes authentifiées
- Extrait utilisateur du SecurityContext OAuth2
- Ajoute headers pour services backend:
  - `X-User-Id`: UUID de l'utilisateur
  - `X-User-Email`: Email de l'utilisateur
  - `X-User-Roles`: Rôles séparés par virgules (ex: "expert,manager")

**GatewaySecurityConfig.java**
- OAuth2 Login configuré (Google, Facebook, Apple via Keycloak)
- OAuth2 Resource Server (JWT)
- Endpoints publics: `/`, `/api/expertise/public/**`, `/assets/**`
- Tous les autres endpoints requièrent authentification

**GatewayAuthController.java**
- `POST /gateway/login` - Login programmatique
- `POST /gateway/logout` - Logout
- `GET /gateway/user` - Info utilisateur gateway

**UserInfoController.java**
- `GET /api/user-info` - Informations utilisateur depuis JWT

#### Frontend React Embarqué

**Build Maven** (frontend-maven-plugin)
```xml
<execution>
  <id>npm install</id>
  <goals><goal>npm</goal></goals>
  <configuration>
    <arguments>install</arguments>
  </configuration>
</execution>
<execution>
  <id>npm build</id>
  <goals><goal>npm</goal></goals>
  <configuration>
    <arguments>run build</arguments>
  </configuration>
</execution>
```

Fichiers statiques copiés dans `/src/main/resources/static/`

---

### 1.4 SERVICE ACCEUIL (Port 8083)

#### Controllers

**FeedController** (`/api/acceuil`)
- `POST /scroll-next` - Charge prochain lot d'experts
  - Body: `{ visiteurId, dernierId?, limit? }`
  - Retourne: `List<Expert>` + cursor
  - Pagination cursor-based (après dernierId)

- `POST /dwell` - Track engagement utilisateur
  - Body: `{ visiteurId, expertId, dwellTimeSeconds }`
  - Met à jour scoreEngagement

#### Models

**Expert** (DTO)
```java
- id: UUID
- nom, prenom: String
- email: String
- domaineExpertise: String
- niveauMaitrise: Integer (1-5)
- localisationComplete: String
- scoreEngagement: Double (calculé)
```

#### Clients

**ExpertiseClient** (RestTemplate vers EXPERTISE service)
- `GET /api/expertise/public/experts?page={}&size={}`
- Récupère experts publiés pour affichage feed

#### Intégration Zeebe

- Workers Zeebe pour orchestration BPMN
- Processus `intermediation.bpmn` (analyse profil visiteur)
- Message correlation par visiteurId

---

### 1.5 SERVICE PAIEMENT (Port 8082)

#### Entité

**Paiement** (`paiements` table)
```java
- id: Long (PK)
- utilisateurId: UUID (not null)
- montant: BigDecimal (not null)
- devise: String (default "FCFA")
- statut: INITIE|COMPLETE|ECHOUE|REMBOURSE
- typePaiement: DIRECT|FACTURATION|ABONNEMENT
- transactionId: String (externe)
- methodePaiement: String (CARTE|MOBILE_MONEY|VIREMENT)
- dateCreation: LocalDateTime
- dateTraitement: LocalDateTime
- description: TEXT
```

#### Controller

**PaiementController** (`/api/paiement`)
- `POST /` - Créer paiement
- `GET /mes-paiements` - Historique paiements
- `GET /{id}` - Détails paiement
- `PUT /{id}/statut` - MAJ statut (webhook)

---

### 1.6 LIB-SECURITY (Bibliothèque partagée)

#### KeycloakJwtRoleConverter.java

Convertit les claims JWT Keycloak en `GrantedAuthority` Spring Security

```java
Claims JWT Keycloak:
{
  "resource_access": {
    "pitm-auth-service": {
      "roles": ["expert", "manager", "rh"]
    }
  },
  "realm_access": {
    "roles": ["user"]
  }
}

→ Spring Security GrantedAuthority:
  - ROLE_expert
  - ROLE_manager
  - ROLE_rh
  - ROLE_user
```

Utilisé par tous les services (OAuth2 Resource Server)

---

## 2. FRONTEND REACT - STRUCTURE DÉTAILLÉE

### 2.1 Architecture des Dossiers

```
gateway/src/main/resources/frontend/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── public/
└── src/
    ├── main.tsx (entry point)
    ├── App.tsx (root component)
    ├── vite-env.d.ts
    ├── components/
    │   ├── auth/
    │   │   ├── ModalConnexion.tsx (modal login/signup)
    │   │   ├── RequireAuth.tsx (route guard)
    │   │   └── RequireRole.tsx (role guard)
    │   ├── expertise/
    │   │   └── EditerExpertise.tsx (form expertise)
    │   ├── forms/
    │   │   └── ProfilProfessionnel.tsx (form profil pro)
    │   ├── layout/
    │   │   ├── Layout.tsx (main layout)
    │   │   ├── Header.tsx (navigation)
    │   │   └── Sidebar.tsx (mobile sidebar)
    │   ├── reconnaissance/
    │   │   ├── ModalDemandeReconnaissance.tsx (soumettre demande)
    │   │   └── ModalSelectionRh.tsx (assigner RH)
    │   ├── badges/
    │   │   └── (composants badges)
    │   ├── profil/
    │   ├── admin/
    │   └── ui/
    │       └── ModalConfirmationManager.tsx
    ├── pages/ (40+ pages)
    │   ├── HomePage.tsx (feed experts)
    │   ├── ExpertisePage.tsx (gestion expertise - 44KB!)
    │   ├── GererCompetences.tsx (CRUD compétences)
    │   ├── DemandeReconnaissance.tsx (créer demande)
    │   ├── EvaluationDemande.tsx (évaluer demande RH - 40KB!)
    │   ├── MesBadges.tsx (affichage badges)
    │   ├── GererCriteresEvaluation.tsx (admin critères)
    │   ├── GererMethodesEvaluation.tsx (admin méthodes)
    │   ├── GererDomainesMetier.tsx (admin domaines)
    │   ├── ProfilPage.tsx
    │   ├── MonComptePage.tsx
    │   ├── ExploreurPage.tsx
    │   ├── RecherchePage.tsx
    │   └── ...
    ├── services/ (8 services API)
    │   ├── api.service.ts (axios instance)
    │   ├── authService.ts
    │   ├── expertiseService.ts
    │   ├── reconnaissanceService.ts
    │   ├── traitementService.ts
    │   ├── badgeService.ts
    │   ├── referentielService.ts
    │   └── utilisateur.service.ts
    ├── context/
    │   └── AuthContext.tsx (état global auth)
    ├── hooks/
    │   ├── useSession.ts
    │   ├── useUserRoles.ts
    │   ├── useHasRole.ts
    │   └── usePermissions.ts
    ├── types/ (7 fichiers TypeScript)
    │   ├── utilisateur.types.ts
    │   ├── expertise.types.ts
    │   ├── competence.types.ts
    │   ├── reconnaissance.types.ts
    │   ├── expert.types.ts
    │   ├── projet.types.ts
    │   └── referentiel.types.ts
    ├── router/
    │   └── index.tsx (33 routes)
    ├── utils/
    │   ├── session.utils.ts
    │   ├── badgeUtils.ts
    │   └── authErrorHandler.ts
    └── styles/
        └── tailwind.css
```

### 2.4 Context et État Global

**AuthContext.tsx**
```typescript
interface AuthContextType {
  user: Utilisateur | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  showAuthModal: boolean;
  redirectUrl: string | null;
  login: () => void;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  openAuthModal: (returnUrl?: string) => void;
  closeAuthModal: () => void;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Utilisateur | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  // Vérifier auth au montage
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authService.getCurrentUser();
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    navigate('/');
  };

  // ...

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      showAuthModal,
      redirectUrl,
      login: () => openAuthModal(),
      logout,
      refreshAuth: checkAuth,
      openAuthModal,
      closeAuthModal
    }}>
      {children}
      {showAuthModal && <ModalConnexion onClose={closeAuthModal} />}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### 2.5 Routes (33 routes)

**router/index.tsx**
```typescript
import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import RequireAuth from '../components/auth/RequireAuth';
import RequireRole from '../components/auth/RequireRole';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      // Public
      { index: true, element: <HomePage /> },
      { path: 'explorer', element: <ExploreurPage /> },
      { path: 'rechercher', element: <RecherchePage /> },
      { path: 'expertise-profil/:id', element: <ProfilExpertPage /> },
      { path: 'reseau', element: <ReseauPage /> },
      { path: 'profil', element: <ProfilPage /> },

      // Authentifié
      {
        path: 'mon-compte',
        element: <RequireAuth><MonComptePage /></RequireAuth>
      },
      {
        path: 'expertise',
        element: <RequireAuth><ExpertisePage /></RequireAuth>
      },
      {
        path: 'competences',
        element: <RequireAuth><GererCompetences /></RequireAuth>
      },
      {
        path: 'reconnaissance/badges',
        element: <RequireAuth><MesBadges /></RequireAuth>
      },

      // Manager / RH
      {
        path: 'demandes-reconnaissance',
        element: (
          <RequireRole roles={['manager', 'rh']}>
            <DemandeReconnaissance />
          </RequireRole>
        )
      },
      {
        path: 'demandes-reconnaissance/evaluer/:id',
        element: (
          <RequireRole roles={['manager', 'rh']}>
            <EvaluationDemande />
          </RequireRole>
        )
      },

      // Admin
      {
        path: 'competences/domaines-metier',
        element: (
          <RequireRole roles={['manager', 'rh', 'admin']}>
            <GererDomainesMetier />
          </RequireRole>
        )
      },
      {
        path: 'competences/criteres-evaluation',
        element: (
          <RequireRole roles={['manager', 'rh', 'admin']}>
            <GererCriteresEvaluation />
          </RequireRole>
        )
      },
      {
        path: 'competences/methodes-evaluation',
        element: (
          <RequireRole roles={['manager', 'rh', 'admin']}>
            <GererMethodesEvaluation />
          </RequireRole>
        )
      },

      // ... autres routes
    ]
  }
]);

export default router;
```

### 2.6 Hooks Personnalisés

**useUserRoles.ts**
```typescript
export const useUserRoles = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      authService.getUserRoles()
        .then(response => setRoles(response.data))
        .catch(() => setRoles([]));
    }
  }, [user]);

  return roles;
};
```

**useHasRole.ts**
```typescript
export const useHasRole = (requiredRole: string | string[]) => {
  const roles = useUserRoles();

  const hasRole = useMemo(() => {
    if (Array.isArray(requiredRole)) {
      return requiredRole.some(role => roles.includes(role));
    }
    return roles.includes(requiredRole);
  }, [roles, requiredRole]);

  return hasRole;
};
```

**usePermissions.ts**
```typescript
export const usePermissions = () => {
  const roles = useUserRoles();

  return {
    canManageDemandes: roles.includes('manager') || roles.includes('rh'),
    canEvaluate: roles.includes('rh'),
    canValidate: roles.includes('manager'),
    canManageReferentiels: roles.includes('admin') || roles.includes('manager'),
    isExpert: roles.includes('expert'),
    isAdmin: roles.includes('admin')
  };
};
```

---

## 3. WORKFLOW DE RECONNAISSANCE - DÉTAILLÉ

### 3.1 Diagramme de Flux

```
┌─────────────────────────────────────────────────────────────┐
│                    EXPERT (Utilisateur)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 1. Soumet demande
                              ▼
                   ┌────────────────────┐
                   │    EN_ATTENTE      │
                   └────────────────────┘
                              │
                              │ 2. Manager assigne RH
                              │    + Démarre Zeebe
                              ▼
                   ┌────────────────────┐
                   │   ASSIGNEE_RH      │
                   └────────────────────┘
                              │
                              │ 3. RH commence évaluation
                              ▼
           ┌────────────────────────────────────┐
           │     EN_COURS_EVALUATION            │
           └────────────────────────────────────┘
                              │
                              │ 4. RH soumet évaluation
                              │    (noteGlobale + recommandation)
                              ▼
           ┌────────────────────────────────────┐
           │    EN_ATTENTE_VALIDATION           │
           └────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          │ 5a. APPROUVER     │ 5b. REJETER      │ 5c. COMPLEMENT
          ▼                   ▼                   ▼
    ┌──────────┐        ┌──────────┐      ┌─────────────────┐
    │APPROUVEE │        │ REJETEE  │      │COMPLEMENT_REQUIS│
    └──────────┘        └──────────┘      └─────────────────┘
          │                                        │
          │ 6. Création Badge                     │ Expert resoummet
          │    (niveau basé sur note)              │
          ▼                                        ▼
    ┌──────────────┐                    ┌────────────────┐
    │BadgeCompetence│                    │  ASSIGNEE_RH   │
    │  - BRONZE     │                    │  (retour RH)   │
    │  - ARGENT     │                    └────────────────┘
    │  - OR         │
    │  - PLATINE    │
    └──────────────┘
```


---

## 5. INFRASTRUCTURE ET DÉPLOIEMENT

### 5.1 Docker Compose Services

**Elasticsearch** (Port 9200)
- Stockage logs et données Zeebe
- Single node (dev)
- Healthcheck: `/_cluster/health`

**Zeebe** (Ports 26500, 9600)
- Moteur workflow BPMN
- Export vers Elasticsearch
- Healthcheck: TCP 9600

**Operate** (Port 8096)
- UI monitoring processus Zeebe
- Connexion: Zeebe + Elasticsearch

**Tasklist** (Port 8097)
- UI gestion tâches utilisateurs
- Connexion: Zeebe + Elasticsearch

**Keycloak** (Port 8098)
- Serveur OAuth2/OIDC
- Admin: admin/admin
- DB: PostgreSQL (keycloak_db)
- Import realm au démarrage

**PostgreSQL 17** (Port 5433)
- 4 bases de données:
  - `keycloak_db` (Keycloak)
  - `auth_db` (Service Auth)
  - `expertise_db` (Service Expertise)
  - `acceuil_db` (Service Acceuil - optionnel)
- Volume: `D:\Binaries\PITC-DOCKER_DATAS\postgres17.4\datas`
- Scripts init: `./postgres-init` (créent les BDD)

### 5.2 Ordre de Démarrage Recommandé

```bash
# 1. Démarrer infrastructure Docker
cd D:\Binaries\repo-as
docker-compose up -d

# Attendre services healthy (elasticsearch, zeebe, keycloak, postgres)
docker-compose ps

# 2. Build projet Maven (parent + tous modules)
cd spring-microservice
mvn clean install -DskipTests

# 3. Démarrer Config Server
cd config-server
mvn spring-boot:run
# Attendre logs "Started ConfigServerApplication"

# 4. Démarrer Eureka Registry
cd ../registry
mvn spring-boot:run
# Attendre logs "Started RegistryApplication"

# 5. Démarrer services métier (parallèle possible)
cd ../auth
mvn spring-boot:run &

cd ../expertise
mvn spring-boot:run &

cd ../acceuil
mvn spring-boot:run &

cd ../paiement
mvn spring-boot:run &

cd ../enrollment
mvn spring-boot:run &

# 6. Démarrer Gateway (dernier, embarque frontend)
cd ../gateway
mvn spring-boot:run
# Attendre logs "Started GatewayApplication"
```

**Vérifications**
- Eureka Dashboard: http://localhost:8761
- Keycloak Admin: http://localhost:8098 (admin/admin)
- Gateway: http://localhost:8090
- Operate: http://localhost:8096
- Tasklist: http://localhost:8097
- Elasticsearch: http://localhost:9200

### 5.3 Configuration Externalisée (config-repo/)

**Structure**
```
config-repo/
├── common.yml (tous services)
├── security-common.yml (OAuth2 partagé)
├── db-common.yml (DataSource partagé)
├── gateway.yml
├── auth.yml
├── expertise.yml
├── acceuil.yml
├── enrollment.yml
└── payment.yml
```

**Chargement** (bootstrap.yml dans chaque service)
```yaml
spring:
  application:
    name: auth # ou expertise, gateway, etc.
  cloud:
    config:
      uri: http://localhost:8888
      username: root
      password: s3cr3t
      fail-fast: true
```

**Config Server** (config-server/src/main/resources/application.yml)
```yaml
server:
  port: 8888

spring:
  cloud:
    config:
      server:
        git:
          uri: file://D:/Binaries/repo-as/config-repo
          # ou: https://github.com/user/config-repo (production)
          default-label: main
  security:
    user:
      name: root
      password: s3cr3t
```

---

## 6. POINTS D'ATTENTION ET BONNES PRATIQUES

### 6.1 Sécurité

✅ **Bonnes pratiques implémentées:**
- OAuth2 Resource Server sur tous services
- Validation ownership (utilisateur ne modifie que ses données)
- Headers X-User-* propagés depuis Gateway
- Rôles Keycloak (expert, manager, rh, admin)
- Emails vérifiés (inscription classique)
- Tokens JWT validés (issuer Keycloak)

⚠️ **À surveiller:**
- Validation exhaustive headers X-User-* (ne pas faire confiance aveuglément)
- Rate limiting sur endpoints publics (feed, profils experts)
- CORS configuration (production)
- HTTPS obligatoire (production)
- Secrets externalisés (Vault, K8s secrets)

### 6.2 Performance

⚠️ **Points d'attention:**
- **Pagination** : Feed acceuil utilise cursor-based (bon)
- **N+1 queries** : Vérifier fetch EAGER/LAZY sur entités JPA
- **Index DB** : Vérifier index sur:
  - `utilisateurs.email` (unique déjà indexé)
  - `competences.utilisateur_id`
  - `demandes_reconnaissance_competence.statut`
  - `demandes_reconnaissance_competence.traitant_id`
  - `badges_competence.utilisateur_id`
- **Cache** : Ajouter Redis pour:
  - Référentiels (domaines, critères, méthodes)
  - Profils experts publics
  - Tokens Keycloak (éviter appels répétés)

### 6.3 Frontend

⚠️ **Refactoring recommandés:**
- **ExpertisePage.tsx (44KB)** : Découper en sous-composants
  - ExpertiseForm
  - CompetencesList
  - CompetenceForm
  - ExpertiseHeader
- **EvaluationDemande.tsx (40KB)** : Découper en:
  - EvaluationForm
  - CriteresEvaluation
  - NotationComponent
- **État global** : Considérer Redux Toolkit ou Zustand si croissance
- **Optimistic updates** : Améliorer UX (badge toggle, etc.)

### 6.4 Base de Données

✅ **Bonnes pratiques:**
- Flyway migrations versionnées
- Contraintes unique partielles (badges historique)
- Soft delete (estActif = false)
- Audit fields (dateCreation, dateModification)

⚠️ **À surveiller:**
- **26 migrations expertise** : Documenter changelog
- **JSON fields** : Vérifier performance requêtes (criteres, ressources)
- **Backup strategy** : Planifier sauvegardes PostgreSQL
- **Archivage** : Demandes anciennes (APPROUVEE/REJETEE > 2 ans)

### 6.5 Monitoring et Observabilité

📊 **À implémenter:**
- **Logs structurés** : JSON logs (ELK stack)
- **Métriques** : Actuator + Prometheus + Grafana
  - Taux de succès auth
  - Temps traitement demandes
  - Nombre badges attribués/jour
- **Tracing distribué** : Sleuth + Zipkin
- **Alertes** :
  - Zeebe process instances stalled
  - Demandes EN_ATTENTE > 7 jours
  - Taux erreurs 500 > 1%

---

## 7. ROADMAP ET ÉVOLUTIONS FUTURES

### 7.1 Fonctionnalités à Implémenter (Suggestions)

**Système de Notation/Avis**
- Expert notés par clients
- Avis sur compétences validées
- Score réputation global

**Matching Automatique**
- Algorithme recommandation experts
- IA pour analyse besoins clients
- Scoring compatibilité expert-projet

**Messagerie Interne**
- Chat expert-client
- Notifications temps réel (WebSocket)
- Historique conversations

**Tableau de Bord Analytics**
- Statistiques personnelles (expert)
- KPIs (manager/RH)
- Rapports PDF

**Gestion Projets/Missions**
- Création missions
- Propositions experts
- Suivi mission (statut, livrables)
- Facturation intégrée (via service paiement)

**Système Abonnements/Formules**
- Freemium (limité)
- Premium (visibilité accrue)
- Enterprise (multi-utilisateurs)

**Mobile App**
- React Native ou Flutter
- Notifications push
- Upload photos/documents

---

## 8. RESSOURCES ET DOCUMENTATION

### 8.1 Documentation Technique

**Spring Boot / Spring Cloud**
- https://spring.io/projects/spring-boot
- https://spring.io/projects/spring-cloud

**Keycloak**
- https://www.keycloak.org/documentation
- Realm: `realm_picp`
- Client: `pitm-auth-service`

**Camunda Zeebe**
- https://docs.camunda.io/docs/components/zeebe/zeebe-overview/
- BPMN 2.0: https://www.omg.org/spec/BPMN/2.0/

**React + TypeScript**
- https://react.dev
- https://www.typescriptlang.org/docs/

**Tailwind CSS + DaisyUI**
- https://tailwindcss.com/docs
- https://daisyui.com/components/

### 8.2 Contacts et Support

**Équipe Projet** : (à compléter)
**Environnements** :
- Dev: http://localhost:8090
- Staging: (à définir)
- Production: (à définir)

**Repositories Git** :
- Backend: D:\Binaries\repo-as
- Config: D:\Binaries\repo-as\config-repo

---

FIN DE L'ANALYSE APPROFONDIE