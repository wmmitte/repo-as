#!/bin/bash

# Script pour supprimer l'ancienne auth_db et renommer pitm_auth en auth_db
# Ce script doit être exécuté une seule fois

echo "========================================="
echo "Nettoyage et Migration de la BD Auth"
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

# Lister les bases de données existantes
echo "📋 Bases de données actuelles:"
docker exec postgres17 psql -U postgres -c "SELECT datname FROM pg_database WHERE datname IN ('auth_db', 'pitm_auth');"
echo ""

# Vérifier si pitm_auth existe
if docker exec postgres17 psql -U postgres -lqt | cut -d \| -f 1 | grep -qw "pitm_auth"; then
    echo -e "${GREEN}✓ pitm_auth trouvée (base utilisée actuellement)${NC}"
    
    # Vérifier si auth_db existe
    if docker exec postgres17 psql -U postgres -lqt | cut -d \| -f 1 | grep -qw "auth_db"; then
        echo -e "${YELLOW}⚠️  auth_db trouvée (base non utilisée à supprimer)${NC}"
        echo ""
        echo "⚠️  ATTENTION: Cette opération va:"
        echo "   1. Supprimer la base auth_db (non utilisée)"
        echo "   2. Renommer pitm_auth en auth_db (conservation des données)"
        echo ""
        read -p "Continuer? (oui/non): " confirm
        
        if [ "$confirm" != "oui" ]; then
            echo "Migration annulée"
            exit 0
        fi
        
        echo ""
        echo "🗑️  Étape 1/2: Suppression de auth_db (non utilisée)..."
        
        # Terminer les connexions actives à auth_db
        docker exec postgres17 psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'auth_db';" > /dev/null 2>&1
        
        # Supprimer auth_db
        if docker exec postgres17 psql -U postgres -c "DROP DATABASE auth_db;" > /dev/null 2>&1; then
            echo -e "${GREEN}✓ auth_db supprimée${NC}"
        else
            echo -e "${RED}✗ Erreur lors de la suppression de auth_db${NC}"
            exit 1
        fi
    fi
    
    echo ""
    echo "🔄 Étape 2/2: Renommage de pitm_auth en auth_db..."
    
    # Terminer les connexions actives à pitm_auth
    docker exec postgres17 psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'pitm_auth';" > /dev/null 2>&1
    
    # Renommer pitm_auth en auth_db
    if docker exec postgres17 psql -U postgres -c "ALTER DATABASE pitm_auth RENAME TO auth_db;" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ pitm_auth renommée en auth_db${NC}"
    else
        echo -e "${RED}✗ Erreur lors du renommage${NC}"
        echo "Assurez-vous qu'aucun service n'est connecté à pitm_auth"
        exit 1
    fi
else
    echo -e "${RED}✗ pitm_auth n'existe pas${NC}"
    echo "Impossible de continuer la migration"
    exit 1
fi

echo ""
echo "📋 Bases de données après migration:"
docker exec postgres17 psql -U postgres -c "SELECT datname FROM pg_database WHERE datname IN ('auth_db', 'pitm_auth');"
echo ""

echo "========================================="
echo -e "${GREEN}✓ Migration terminée avec succès !${NC}"
echo "========================================="
echo ""
echo "Résumé:"
echo "  ✓ Ancienne auth_db (vide) supprimée"
echo "  ✓ pitm_auth renommée en auth_db"
echo "  ✓ Toutes les données conservées"
echo ""
echo "Prochaines étapes:"
echo "  1. Redémarrer les services: ./stop-services.sh && ./start-services.sh"
echo "  2. Vérifier que le service Auth fonctionne correctement"
echo ""
