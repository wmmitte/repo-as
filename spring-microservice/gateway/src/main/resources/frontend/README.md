# Frontend - Plateforme d'Intermédiation Experts

Application React TypeScript avec Tailwind CSS et DaisyUI pour la visualisation et l'interaction avec les profils d'experts.

## 🚀 Stack Technique

- **React 18** + **TypeScript**
- **Vite** - Build tool ultra-rapide
- **TailwindCSS** + **DaisyUI** - Styling moderne
- **React Router v6** - Navigation
- **npm** - Package manager

## 📦 Installation

```bash
# Depuis le dossier frontend/
npm install
```

## 🛠️ Développement

```bash
# Mode développement avec hot-reload
npm run dev
# Serveur disponible sur http://localhost:3000
```

Le proxy Vite redirige automatiquement les appels `/api/*` vers `http://localhost:8080`.

## 🏗️ Build Production

```bash
# Build manuel
npm run build
# Résultat dans dist/
```

**OU** via Maven (automatique) :
```bash
# Depuis le dossier gateway/
mvn clean package
# Le frontend sera compilé automatiquement et copié dans src/main/resources/static/
```

## 📂 Structure du Projet

```
src/
├── main.tsx                 # Point d'entrée
├── App.tsx                  # Composant racine
├── router/                  # Configuration React Router
├── pages/                   # Pages (Home, ExpertDetail, NotFound)
├── components/
│   ├── layout/             # Header, Layout
│   ├── expert/             # Composants métier expert
│   ├── feed/               # Feed des experts
│   └── ui/                 # Composants réutilisables
├── hooks/                   # Custom hooks
├── services/               # API calls
├── types/                  # TypeScript types
├── utils/                  # Utilitaires
└── styles/                 # Styles globaux
```

## 🎨 Composants Principaux

### Pages
- **HomePage** - Feed principal avec scroll infini
- **ExpertDetailPage** - Détail d'un expert (à implémenter)
- **NotFoundPage** - Page 404

### Composants Expert
- **ExpertCard** - Carte complète d'expert
- **ExpertHeader** - Photo + nom + badge
- **ExpertRating** - Notation avec étoiles
- **ExpertSkills** - Liste des compétences
- **ExpertStats** - Statistiques (expérience, projets, TJM)
- **ExpertFooter** - Localisation + disponibilité

### Hooks Personnalisés
- **useSession** - Gestion session visiteur
- **useExpertFeed** - Chargement experts + pagination
- **useDwellTracking** - Tracking temps de visionnage
- **useInfiniteScroll** - Scroll infini

## 🔌 API Endpoints

- `POST /api/acceuil/api/start` - Démarrer session
- `POST /api/acceuil/api/scroll-next` - Charger experts
- `POST /api/acceuil/api/dwell` - Tracker visionnage

## 🎯 Features

✅ Feed d'experts avec scroll infini
✅ Auto-chargement au scroll
✅ Tracking du temps de visionnage (dwell)
✅ Session persistante (localStorage)
✅ Design moderne avec Tailwind + DaisyUI
✅ TypeScript pour la sécurité des types
✅ Routing avec React Router

## 📝 Configuration Maven

Le `pom.xml` du gateway est configuré pour :
1. Installer Node.js et npm automatiquement
2. Exécuter `npm install`
3. Exécuter `npm run build`
4. Copier le résultat dans `src/main/resources/static/`

Tout se fait automatiquement avec `mvn clean package` ! 🎉

## 🔧 Scripts npm

```json
{
  "dev": "vite",                    // Dev server
  "build": "tsc && vite build",     // Build production
  "preview": "vite preview"          // Preview du build
}
```

## 🌐 Déploiement

Le build final est automatiquement copié dans `src/main/resources/static/` du gateway Spring Boot, qui servira les fichiers statiques.

L'application est accessible à la racine du gateway : `http://localhost:8080/`
