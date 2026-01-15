import { useState, useEffect, useRef } from 'react';
import { Save } from 'lucide-react';

// Options pour les dropdowns

interface ProfilProfessionnelProps {
  formData: any;
  setFormData: (data: any) => void;
  domainesInteret: string[];
  setDomainesInteret: (domaines: string[]) => void;
  onSave: () => void;
  isSaving: boolean;
}

export default function ProfilProfessionnel({
  formData,
  setFormData,
  domainesInteret,
  setDomainesInteret,
  onSave,
  isSaving,
}: ProfilProfessionnelProps) {
  const [domainesExpertise, setDomainesExpertise] = useState<string[]>([]);
  const [loadingDomaines, setLoadingDomaines] = useState(true);
  const cleanupDone = useRef(false);

  // Charger la liste des domaines depuis l'API
  useEffect(() => {
    const chargerDomaines = async () => {
      try {
        setLoadingDomaines(true);
        const response = await fetch('/api/competences-reference/domaines');
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          // Les données de l'API sont valides
          setDomainesExpertise(data);
          // Mettre en cache UNIQUEMENT les données de l'API (remplace le cache existant)
          localStorage.setItem('domaines_cache', JSON.stringify(data));
          console.log('Domaines chargés depuis l\'API et mis en cache');
        } else {
          throw new Error('Données invalides reçues de l\'API');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des domaines depuis l\'API:', error);
        
        // Essayer de charger depuis le cache local (contient UNIQUEMENT des données API précédentes)
        const cached = localStorage.getItem('domaines_cache');
        if (cached) {
          try {
            const cachedData = JSON.parse(cached);
            if (Array.isArray(cachedData) && cachedData.length > 0) {
              setDomainesExpertise(cachedData);
              console.log('Domaines chargés depuis le cache local (données API précédentes)');
            } else {
              throw new Error('Cache invalide');
            }
          } catch (parseError) {
            console.error('Erreur lors du parsing du cache:', parseError);
            // Supprimer le cache corrompu
            localStorage.removeItem('domaines_cache');
            // Liste vide si pas de données valides
            setDomainesExpertise([]);
            console.warn('Cache corrompu supprimé - Liste vide en attente de données API');
          }
        } else {
          // Aucun cache disponible
          setDomainesExpertise([]);
          console.warn('Aucun cache disponible - Liste vide en attente de données API');
        }
      } finally {
        setLoadingDomaines(false);
      }
    };

    chargerDomaines();
  }, []);

  // Nettoyer les domaines d'intérêt pour supprimer les valeurs obsolètes
  useEffect(() => {
    if (!loadingDomaines && domainesExpertise.length > 0 && !cleanupDone.current) {
      // Filtrer pour ne garder que les domaines qui existent dans la liste actuelle
      const domainesValides = domainesInteret.filter(d => domainesExpertise.includes(d));
      
      if (domainesValides.length !== domainesInteret.length) {
        console.log('🧹 Nettoyage des domaines obsolètes:', {
          avant: domainesInteret,
          après: domainesValides,
          supprimés: domainesInteret.filter(d => !domainesExpertise.includes(d))
        });
        setDomainesInteret(domainesValides);
      }
      cleanupDone.current = true;
    }
  }, [loadingDomaines, domainesExpertise, domainesInteret, setDomainesInteret]);

  const toggleDomaineInteret = (domaine: string) => {
    if (domainesInteret.includes(domaine)) {
      setDomainesInteret(domainesInteret.filter(d => d !== domaine));
    } else {
      setDomainesInteret([...domainesInteret, domaine]);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Informations professionnelles
        <span className="text-sm text-gray-500 font-normal ml-2">(optionnel)</span>
      </h2>

      {/* Domaine d'expertise */}
      <div>
        <label className="block text-gray-900 font-medium mb-2">
          Domaine d'expertise
        </label>
        <select
          value={formData.domaineExpertise || ''}
          onChange={(e) => setFormData({ ...formData, domaineExpertise: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={loadingDomaines || domainesExpertise.length === 0}
        >
          <option value="">
            {loadingDomaines 
              ? 'Chargement des domaines...' 
              : domainesExpertise.length === 0
                ? 'Aucun domaine disponible'
                : 'Sélectionnez un domaine'}
          </option>
          {domainesExpertise.map((domaine) => (
            <option key={domaine} value={domaine}>
              {domaine}
            </option>
          ))}
        </select>
        {!loadingDomaines && domainesExpertise.length === 0 && (
          <p className="text-xs text-red-600 mt-1">
            ⚠️ Impossible de charger les domaines. Veuillez vérifier votre connexion ou réessayer plus tard.
          </p>
        )}
      </div>

      {/* Biographie / Description */}
      <div>
        <label className="block text-gray-900 font-medium mb-2">
          Biographie / Description
        </label>
        <textarea
          value={formData.biographie || ''}
          onChange={(e) => setFormData({ ...formData, biographie: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          placeholder="Décrivez votre parcours, vos spécialités et vos objectifs..."
          maxLength={2000}
        />
        <p className="text-sm text-gray-500 mt-1">
          {formData.biographie?.length || 0} / 2000 caractères
        </p>
      </div>

      {/* Domaines d'intérêt */}
      <div>
        <label className="block text-gray-900 font-medium mb-2">
          Domaines d'intérêt
        </label>
        <p className="text-sm text-gray-600 mb-3">
          Types de projets qui vous intéressent
        </p>
        {loadingDomaines ? (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Chargement des domaines...</p>
          </div>
        ) : domainesExpertise.length === 0 ? (
          <div className="text-center py-8 border border-red-200 rounded-lg bg-red-50">
            <p className="text-red-600 mb-2">⚠️ Aucun domaine disponible</p>
            <p className="text-sm text-gray-600">
              Veuillez vérifier votre connexion ou réessayer plus tard.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {domainesExpertise.map((domaine) => (
              <label
                key={domaine}
                className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={domainesInteret.includes(domaine)}
                  onChange={() => toggleDomaineInteret(domaine)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                />
                <span className="ml-3 text-gray-900">{domaine}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Bouton Enregistrer */}
      <div className="flex justify-end pt-4">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg"
        >
          <Save size={20} />
          {isSaving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}
