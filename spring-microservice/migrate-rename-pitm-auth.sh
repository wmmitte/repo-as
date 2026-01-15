#!/bin/bash

# Script de migration pour renommer pitm_auth en auth_db
# Ce script doit être exécuté une seule fois

echo "========================================="
echo "Migration: Renommer pitm_auth en auth_db"
echo "========================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Vérifier que PostgreSQL est en cours d'exécution
echo "🔍 Vérification de PostgreSQL..."
if ! docker ps | grep -q postgres17; then
    echo -e "${RED}✗ PostgreSQL n'est pas en cours d'exécution${NC}"
    echo "Démarrez PostgreSQL avec: docker start postgres17"
    exit 1
fi
echo -e "${GREEN}✓ PostgreSQL est en cours d'exécution${NC}"
echo ""

# Vérifier si pitm_auth existe
echo "🔍 Vérification de l'existence de pitm_auth..."
if docker exec postgres17 psql -U postgres -lqt | cut -d \| -f 1 | grep -qw "pitm_auth"; then
    echo -e "${YELLOW}Base de données pitm_auth trouvée${NC}"
    
    # Vérifier si auth_db existe déjà
    if docker exec postgres17 psql -U postgres -lqt | cut -d \| -f 1 | grep -qw "auth_db"; then
        echo -e "${YELLOW}⚠️  auth_db existe déjà${NC}"
        echo "Options:"
        echo "  1. Supprimer auth_db et renommer pitm_auth"
        echo "  2. Annuler"
        read -p "Votre choix (1 ou 2): " choice
        
        if [ "$choice" = "1" ]; then
            echo "🗑️  Suppression de auth_db..."
            docker exec postgres17 psql -U postgres -c "DROP DATABASE auth_db;" > /dev/null 2>&1
            echo -e "${GREEN}✓ auth_db supprimée${NC}"
        else
            echo "Migration annulée"
            exit 0
        fi
    fi
    
    # Renommer pitm_auth en auth_db
    echo "🔄 Renommage de pitm_auth en auth_db..."
    if docker exec postgres17 psql -U postgres -c "ALTER DATABASE pitm_auth RENAME TO auth_db;" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Base de données renommée avec succès${NC}"
    else
        echo -e "${RED}✗ Erreur lors du renommage${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}pitm_auth n'existe pas${NC}"
    
    # Vérifier si auth_db existe
    if docker exec postgres17 psql -U postgres -lqt | cut -d \| -f 1 | grep -qw "auth_db"; then
        echo -e "${GREEN}✓ auth_db existe déjà${NC}"
    else
        echo "📦 Création de auth_db..."
        docker exec postgres17 psql -U postgres -c "CREATE DATABASE auth_db;" > /dev/null 2>&1
        echo -e "${GREEN}✓ auth_db créée${NC}"
    fi
fi

echo ""
echo "========================================="
echo -e "${GREEN}✓ Migration terminée !${NC}"
echo "========================================="
echo ""
echo "La base de données auth_db est maintenant prête."
echo "Vous pouvez redémarrer les services avec:"
echo "  ./stop-services.sh && ./start-services.sh"
echo ""
