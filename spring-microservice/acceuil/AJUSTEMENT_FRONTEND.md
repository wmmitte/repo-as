# 🎨 Ajustement Frontend - Types TypeScript

## Date
26 Octobre 2025 - 17:56 UTC

## Résumé

Le frontend a été ajusté pour refléter les nouvelles données retournées par l'API après la refonte du service acceuil. **Tous les changements sont rétrocompatibles** car les nouveaux champs sont optionnels.

---

## Fichiers Modifiés

### 1. `/gateway/src/main/resources/frontend/src/types/expert.types.ts`
Ajout des nouveaux types TypeScript pour les données d'analyse et d'engagement.

### 2. `/gateway/src/main/resources/frontend/src/services/api.service.ts`
Mise à jour du type de retour de la méthode `dwell()`.

---

## Nouveaux Types Ajoutés

### 1. AnalyseTechnologique
```typescript
export interface AnalyseTechnologique {
  deviceType: string;      // Mobile/Desktop/Tablet
  navigateur: string;      // Chrome, Safari, Firefox, Edge
  resolution: string;      // Taille d'écran (ex: 375x812)
  vitesseConnexion: string; // 3G/4G/5G/WiFi
  OS: string;              // iOS, Android, Windows, MacOS, Linux
}
```

### 2. AnalyseComportementale
```typescript
export interface AnalyseComportementale {
  referrer: string;             // Source d'arrivée
  historiqueNavigation: string; // Pages précédentes
  tempsSession: string;         // Durée de session
  frequenceVisites: string;     // Nouveau vs Retour
  patternScroll: string;        // Comportement de lecture
}
```

### 3. AnalyseContextuelle
```typescript
export interface AnalyseContextuelle {
  localisation: string;      // Pays, Ville, Fuseau horaire
  langue: string;            // Langue du navigateur (ex: fr-FR)
  heureVisite: string;       // Moment de la journée (ISO-8601)
  contexteSaisonnier: string; // Vacances, événements, campagnes
}
```

### 4. ProfilAnalyse
```typescript
export interface ProfilAnalyse {
  source: string;  // search-google, social-facebook, direct, etc.
  device: string;  // mobile, tablet, desktop
  analyseTechnologique: AnalyseTechnologique;
  analyseComportementale: AnalyseComportementale;
  analyseContextuelle: AnalyseContextuelle;
}
```

### 5. EngagementData
```typescript
export interface EngagementData {
  visiteurId: string;
  itemId: string;
  eventType: string;
  scoreEngagement: number;       // Score entre 0.0 et 1.0
  dureeDwellMs?: number;
  engagementDerniereMAJ: string; // ISO-8601 timestamp
}
```

### 6. DwellResponse
```typescript
export interface DwellResponse {
  ok: boolean;
  engagement?: EngagementData; // Optionnel - données d'engagement détaillées
}
```

---

## Types Modifiés

### StartResponse (avant)
```typescript
export interface StartResponse {
  visiteurId: string;
  instanceKey: number;
}
```

### StartResponse (après)
```typescript
export interface StartResponse {
  visiteurId: string;
  instanceKey: number;
  profilAnalyse?: ProfilAnalyse; // ✨ Nouveau champ optionnel
}
```

---

## Service API Modifié

### Méthode `dwell()` - Type de Retour

#### Avant
```typescript
dwell: async (
  visiteurId: string,
  itemId: string,
  eventType: 'DWELL_START' | 'DWELL_STOP',
  dureeDwellMs?: number
): Promise<{ ok: boolean }> => {
  // ...
}
```

#### Après
```typescript
dwell: async (
  visiteurId: string,
  itemId: string,
  eventType: 'DWELL_START' | 'DWELL_STOP',
  dureeDwellMs?: number
): Promise<DwellResponse> => {  // ✨ Type enrichi
  // ...
}
```

---

## Compatibilité

### ✅ Rétrocompatible à 100%

Tous les nouveaux champs sont **optionnels** :
- `StartResponse.profilAnalyse?` - Optionnel
- `DwellResponse.engagement?` - Optionnel

Le code existant continue de fonctionner sans modification :

```typescript
// ✅ Code existant - Continue de fonctionner
const response = await apiService.start('visitor-123');
console.log(response.visiteurId);    // OK
console.log(response.instanceKey);   // OK

// ✨ Nouveau code - Peut utiliser les nouvelles données
if (response.profilAnalyse) {
  console.log('Device:', response.profilAnalyse.device);
  console.log('Navigateur:', response.profilAnalyse.analyseTechnologique.navigateur);
  console.log('Score engagement:', response.profilAnalyse.source);
}
```

---

## Utilisation des Nouvelles Données

### Exemple 1 : Afficher le Type de Device
```typescript
const response = await apiService.start();

if (response.profilAnalyse) {
  const { device, analyseTechnologique } = response.profilAnalyse;
  
  console.log(`Visiteur sur ${device}`);
  console.log(`Device: ${analyseTechnologique.deviceType}`);
  console.log(`Navigateur: ${analyseTechnologique.navigateur}`);
  console.log(`OS: ${analyseTechnologique.OS}`);
}
```

### Exemple 2 : Analyser l'Engagement
```typescript
const dwellResponse = await apiService.dwell(
  visiteurId,
  expertId,
  'DWELL_STOP',
  5000 // 5 secondes
);

if (dwellResponse.engagement) {
  const score = dwellResponse.engagement.scoreEngagement;
  
  if (score > 0.8) {
    console.log('🔥 Fort engagement détecté !');
  } else if (score > 0.5) {
    console.log('👍 Engagement moyen');
  } else {
    console.log('👎 Faible engagement');
  }
}
```

### Exemple 3 : Personnaliser l'Expérience
```typescript
const response = await apiService.start();

if (response.profilAnalyse) {
  const { source, device } = response.profilAnalyse;
  
  // Adapter l'UI selon la source
  if (source.includes('search')) {
    showSEOBanner();
  } else if (source.includes('social')) {
    showSocialShareButtons();
  }
  
  // Adapter selon le device
  if (device === 'mobile') {
    enableTouchOptimizations();
  }
}
```

---

## Impact sur le Code Existant

### ✅ Aucun Impact

Le code existant qui utilise `apiService` continue de fonctionner sans modification :

```typescript
// ✅ useDwellTracking.ts - Continue de fonctionner
await apiService.dwell(visiteurId, itemId, 'DWELL_START');
// Le hook n'utilise pas la réponse, donc pas de changement nécessaire

// ✅ Autres composants - Aucun changement requis
const response = await apiService.start();
setVisiteurId(response.visiteurId);
setInstanceKey(response.instanceKey);
```

---

## Recommandations

### 1. Utiliser les Nouvelles Données (Optionnel)

Les nouvelles données peuvent être utilisées pour :
- **Personnalisation** : Adapter l'UI selon device/navigateur
- **Analytics** : Suivre les sources de trafic
- **Engagement** : Mesurer l'intérêt des visiteurs
- **A/B Testing** : Tester différentes expériences selon le profil

### 2. Ajouter des Gardes de Type

```typescript
// Bonne pratique : Vérifier que les données existent
if (response.profilAnalyse?.analyseTechnologique) {
  const { deviceType, navigateur } = response.profilAnalyse.analyseTechnologique;
  // Utiliser les données en toute sécurité
}
```

### 3. Créer des Hooks Personnalisés

```typescript
// useProfilAnalyse.ts
export function useProfilAnalyse() {
  const [profil, setProfil] = useState<ProfilAnalyse | null>(null);
  
  useEffect(() => {
    const initProfil = async () => {
      const response = await apiService.start();
      if (response.profilAnalyse) {
        setProfil(response.profilAnalyse);
      }
    };
    initProfil();
  }, []);
  
  return profil;
}

// Utilisation dans un composant
function MyComponent() {
  const profil = useProfilAnalyse();
  
  if (profil?.device === 'mobile') {
    return <MobileOptimizedView />;
  }
  
  return <DesktopView />;
}
```

---

## Checklist de Validation

- [x] ✅ Types TypeScript ajoutés
- [x] ✅ Imports mis à jour
- [x] ✅ Type de retour `dwell()` mis à jour
- [x] ✅ Compatibilité rétroactive garantie
- [ ] ⏳ Tester en développement
- [ ] ⏳ Valider les données reçues
- [ ] ⏳ Documenter les nouvelles possibilités

---

## Notes Importantes

### Correspondance Backend ↔ Frontend

| Backend (Java) | Frontend (TypeScript) | Notes |
|----------------|----------------------|-------|
| `AnalyseTechnologique.deviceType` | `deviceType` | ✅ Correspond |
| `AnalyseTechnologique.navigateur` | `navigateur` | ✅ Correspond |
| `AnalyseTechnologique.OS` | `OS` | ✅ Correspond (majuscules) |
| `AnalyseComportementale.referrer` | `referrer` | ✅ Correspond |
| `AnalyseContextuelle.localisation` | `localisation` | ✅ Correspond |

### Pas de Breaking Changes

Les anciennes propriétés sont maintenant dans des sous-objets, mais comme `profilAnalyse` est optionnel, aucun code existant n'est cassé.

---

## Résumé

| Aspect | Status |
|--------|--------|
| **Types ajoutés** | ✅ 6 nouveaux types |
| **Service API mis à jour** | ✅ Type de retour `dwell()` |
| **Compatibilité** | ✅ 100% rétrocompatible |
| **Breaking changes** | ✅ Aucun |
| **Code existant impacté** | ✅ Aucun |

---

## Conclusion

Le frontend a été **ajusté avec succès** pour refléter les nouvelles données de l'API :
- ✅ Types TypeScript complets et bien documentés
- ✅ 100% rétrocompatible (tous les champs optionnels)
- ✅ Aucun changement requis dans le code existant
- ✅ Nouvelles possibilités de personnalisation disponibles

Le frontend peut maintenant **optionnellement** utiliser les données d'analyse de profil et d'engagement pour enrichir l'expérience utilisateur.

---

**Date de l'ajustement :** 26 Octobre 2025  
**Status :** ✅ TERMINÉ  
**Compatibilité :** ✅ 100% rétrocompatible
