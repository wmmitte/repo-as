#!/bin/bash

# Script d'initialisation des bases de données PostgreSQL
# Ce script crée toutes les bases de données nécessaires pour les microservices

echo "========================================="
echo "Initialisation des bases de données"
echo "========================================="
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour créer une base de données
create_database() {
    local db_name=$1
    echo -n "📦 Création de la base de données '$db_name'... "
    
    # Vérifier si la base existe déjà
    if docker exec postgres17 psql -U postgres -lqt | cut -d \| -f 1 | grep -qw "$db_name"; then
        echo -e "${YELLOW}existe déjà${NC}"
    else
        # Créer la base de données
        if docker exec postgres17 psql -U postgres -c "CREATE DATABASE $db_name;" > /dev/null 2>&1; then
            echo -e "${GREEN}✓ créée${NC}"
        else
            echo -e "${RED}✗ erreur${NC}"
            return 1
        fi
    fi
}

# Vérifier que PostgreSQL est en cours d'exécution
echo "🔍 Vérification de PostgreSQL..."
if ! docker ps | grep -q postgres17; then
    echo -e "${RED}✗ PostgreSQL n'est pas en cours d'exécution${NC}"
    echo "Démarrez PostgreSQL avec: docker start postgres17"
    exit 1
fi
echo -e "${GREEN}✓ PostgreSQL est en cours d'exécution${NC}"
echo ""

# Créer les bases de données pour chaque microservice
create_database "auth_db"
create_database "acceuil_db"
create_database "expertise_db"
create_database "paiement_db"

echo ""
echo "🔧 Exécution des scripts d'initialisation SQL..."
echo ""

# Chemin vers les scripts d'initialisation
SCRIPT_DIR="../postgres-init"

# Exécuter les scripts SQL d'initialisation dans l'ordre
if [ -d "$SCRIPT_DIR" ]; then
    for sql_file in $(ls -1 $SCRIPT_DIR/*.sql 2>/dev/null | sort); do
        filename=$(basename "$sql_file")
        echo -n "📄 Exécution de $filename... "
        
        # Exécuter le script SQL
        if docker exec -i postgres17 psql -U postgres < "$sql_file" > /dev/null 2>&1; then
            echo -e "${GREEN}✓${NC}"
        else
            # Ignorer les erreurs (scripts idempotents)
            echo -e "${YELLOW}⚠ (déjà appliqué)${NC}"
        fi
    done
else
    echo -e "${YELLOW}⚠ Dossier postgres-init non trouvé${NC}"
fi

echo ""
echo "========================================="
echo -e "${GREEN}✓ Initialisation terminée !${NC}"
echo "========================================="
echo ""
echo "Bases de données créées :"
echo "  • auth_db       (Service Auth)"
echo "  • acceuil_db    (Service Acceuil)"
echo "  • expertise_db  (Service Expertise)"
echo "  • expertise_db  (Service Paiement)"
echo ""
echo "Scripts SQL exécutés depuis: $SCRIPT_DIR"
echo ""
