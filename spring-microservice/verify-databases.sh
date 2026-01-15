#!/bin/bash

# Script de vérification de l'état des bases de données
# Ce script vérifie que toutes les bases de données sont créées et accessibles

echo "========================================="
echo "Vérification des bases de données"
echo "========================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Fonction pour vérifier une base de données
check_database() {
    local db_name=$1
    local service_name=$2
    
    echo -n "📦 $service_name ($db_name)... "
    
    if docker exec postgres17 psql -U postgres -lqt | cut -d \| -f 1 | grep -qw "$db_name"; then
        echo -e "${GREEN}✓ Existe${NC}"
        
        # Vérifier les tables
        table_count=$(docker exec postgres17 psql -U postgres -d "$db_name" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
        
        if [ -n "$table_count" ] && [ "$table_count" -gt 0 ]; then
            echo -e "   ${BLUE}→ $table_count table(s) trouvée(s)${NC}"
        else
            echo -e "   ${YELLOW}→ Aucune table (sera créée par Hibernate)${NC}"
        fi
        return 0
    else
        echo -e "${RED}✗ N'existe pas${NC}"
        return 1
    fi
}

# Vérifier toutes les bases de données
echo "📋 Bases de données des services:"
echo ""

check_database "keycloak_db" "Keycloak"
check_database "auth_db" "Service Auth"
check_database "acceuil_db" "Service Accueil"
check_database "expertise_db" "Service Expertise"

echo ""
echo "========================================="
echo "📊 Détails des bases de données"
echo "========================================="
echo ""

# Afficher les détails de auth_db
echo -e "${BLUE}🔐 auth_db (Service Auth):${NC}"
docker exec postgres17 psql -U postgres -d auth_db -c "\dt" 2>/dev/null || echo "  Aucune table encore"
echo ""

# Afficher les détails de acceuil_db
echo -e "${BLUE}🏠 acceuil_db (Service Accueil):${NC}"
docker exec postgres17 psql -U postgres -d acceuil_db -c "\dt" 2>/dev/null || echo "  Aucune table encore"
echo ""

# Afficher les détails de expertise_db
echo -e "${BLUE}💼 expertise_db (Service Expertise):${NC}"
docker exec postgres17 psql -U postgres -d expertise_db -c "\dt" 2>/dev/null || echo "  Aucune table encore"
echo ""

echo "========================================="
echo -e "${GREEN}✓ Vérification terminée${NC}"
echo "========================================="
echo ""
echo "Note: Les tables sont créées automatiquement par Hibernate"
echo "      au premier démarrage de chaque service (ddl-auto: update)"
echo ""
