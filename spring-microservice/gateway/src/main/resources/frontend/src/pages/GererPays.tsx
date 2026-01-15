import React from 'react';
import { MapPin } from 'lucide-react';

const GererPays: React.FC = () => {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <MapPin className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Pays</h1>
        </div>
        
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <p className="text-gray-600">
              Cette page permettra de gérer la liste des pays disponibles dans le système.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Fonctionnalités à venir : Ajouter, modifier, supprimer des pays de référence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GererPays;
