# 🚀 Guide de Démarrage - Frontend React TypeScript

## ✅ Ce qui a été créé

Une architecture React TypeScript complète et modulaire avec :

### 📦 Structure du Projet

```
gateway/src/main/resources/frontend/
├── package.json              ✅ Configuration npm + dépendances
├── tsconfig.json             ✅ Configuration TypeScript
├── vite.config.ts            ✅ Configuration Vite (build tool)
├── tailwind.config.js        ✅ Configuration Tailwind + DaisyUI
├── postcss.config.js         ✅ Configuration PostCSS
└── src/
    ├── main.tsx              ✅ Point d'entrée
    ├── App.tsx               ✅ Composant racine
    ├── types/                ✅ Types TypeScript (Expert, Competence, etc.)
    ├── services/             ✅ API service (appels backend)
    ├── hooks/                ✅ 4 hooks personnalisés
    ├── utils/                ✅ Utilitaires (session, rating)
    ├── components/           ✅ Composants organisés
    │   ├── ui/              ✅ Loader, Badge, Button, SkillPill
    │   ├── expert/          ✅ 6 composants Expert
    │   ├── feed/            ✅ ExpertFeed avec scroll infini
    │   └── layout/          ✅ Header, Layout
    ├── pages/               ✅ 3 pages (Home, ExpertDetail, NotFound)
    ├── router/              ✅ React Router v6 configuré
    └── styles/              ✅ Tailwind CSS + styles custom
```

### 🎯 Features Implémentées

✅ **Feed d'experts** avec scroll infini et préchargement automatique
✅ **Tracking dwell time** - suivi du temps passé sur chaque expert
✅ **Session persistante** - localStorage avec expiration (24h)
✅ **Design moderne** - Tailwind CSS + DaisyUI thème sombre
✅ **Type-safe** - TypeScript pour éviter les erreurs
✅ **Routing** - React Router pour navigation future
✅ **Build automatique** - Plugin Maven intégré

## 🚀 Démarrage Rapide

### Option 1 : Développement Frontend Uniquement

```bash
# 1. Aller dans le dossier frontend
cd gateway/src/main/resources/frontend

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement
npm run dev
```

Ouvrez http://localhost:3000 dans votre navigateur.

⚠️ **Important** : Le backend doit tourner sur `http://localhost:8080` pour que les appels API fonctionnent.

### Option 2 : Build Complet avec Maven

```bash
# Depuis le dossier gateway/
mvn clean package

# Le frontend sera :
# 1. Compilé automatiquement (npm install + npm run build)
# 2. Copié dans src/main/resources/static/
# 3. Servi par le gateway Spring Boot

# Puis démarrer le gateway
mvn spring-boot:run
```

Ouvrez http://localhost:8080 dans votre navigateur.

## 📝 Commandes Utiles

### Développement Frontend

```bash
cd gateway/src/main/resources/frontend

# Install dependencies
npm install

# Dev server avec hot-reload
npm run dev

# Build production
npm run build

# Preview du build
npm run preview
```

### Build Maven

```bash
cd gateway

# Build complet (frontend + backend)
mvn clean package

# Run le gateway
mvn spring-boot:run

# Skip frontend build (dev rapide)
mvn clean package -Dskip.npm
```

## 🎨 Personnalisation

### Modifier les couleurs (tailwind.config.js)

```javascript
theme: {
  extend: {
    colors: {
      dark: {
        bg: '#0f1115',      // Fond principal
        card: '#1a1d2e',    // Fond des cartes
        border: '#2a2f45',  // Bordures
      },
    },
  },
}
```

### Modifier le thème DaisyUI

```javascript
daisyui: {
  themes: [
    {
      dark: {
        primary: '#667eea',    // Violet
        secondary: '#764ba2',  // Violet foncé
        accent: '#f59e0b',     // Orange (favoris)
        success: '#22c55e',    // Vert
        error: '#ef4444',      // Rouge
      },
    },
  ],
}
```

## 🔧 Configuration Backend

Le gateway doit exposer les endpoints suivants :

```
POST /api/acceuil/api/start
POST /api/acceuil/api/scroll-next
POST /api/acceuil/api/dwell
```

Ces endpoints sont déjà configurés dans `FeedController.java` ✅

## 📱 Architecture des Composants

```
HomePage
  ├─ Header (bouton démarrer + visiteurId)
  └─ ExpertFeed (container avec scroll)
      └─ ExpertCard[] (liste des experts)
          ├─ ExpertHeader (photo + nom + badge)
          ├─ ExpertRating (étoiles + note)
          ├─ Description
          ├─ ExpertSkills (compétences)
          ├─ ExpertStats (3 cartes stats)
          └─ ExpertFooter (localisation + actions)
```

## 🔍 Hooks Personnalisés

- **useSession** - Gère le visiteurId et la session
- **useExpertFeed** - Charge les experts + pagination
- **useDwellTracking** - Track le temps de visionnage
- **useInfiniteScroll** - Détecte scroll et charge plus

## 🚨 Résolution de Problèmes

### Les dépendances ne s'installent pas

```bash
cd gateway/src/main/resources/frontend
rm -rf node_modules package-lock.json
npm install
```

### Erreurs TypeScript dans l'IDE

Les erreurs disparaîtront après `npm install`. C'est normal avant l'installation.

### Le proxy ne fonctionne pas en dev

Vérifiez que le backend tourne sur `http://localhost:8080`.

Modifiez `vite.config.ts` si besoin :

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:VOTRE_PORT',
      changeOrigin: true,
    },
  },
}
```

### Build Maven échoue

Assurez-vous d'avoir une connexion internet pour télécharger Node.js et npm.

## 📦 Dépendances Principales

- **react** + **react-dom** - Framework UI
- **react-router-dom** - Routing
- **typescript** - Type safety
- **vite** - Build tool ultra-rapide
- **tailwindcss** + **daisyui** - Styling moderne

## 🎯 Prochaines Étapes

1. ✅ **Tester le frontend** : `cd frontend && npm install && npm run dev`
2. ✅ **Tester le build Maven** : `cd gateway && mvn clean package`
3. ⚠️ **Implémenter ExpertDetailPage** (page détail d'un expert)
4. ⚠️ **Ajouter plus de routes** si besoin
5. ⚠️ **Personnaliser le design** selon vos besoins

## 📚 Documentation

- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Vite Docs](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [DaisyUI Components](https://daisyui.com/components/)
- [React Router](https://reactrouter.com)

---

**Tout est prêt ! 🎉** Lancez `npm install` dans le dossier `frontend/` pour commencer.
