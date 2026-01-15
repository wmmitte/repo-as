#!/bin/bash

# Script de test pour vérifier la refonte du service acceuil
# Usage: ./test-refonte.sh [base_url]

BASE_URL="${1:-http://localhost:8080}"
VISITEUR_ID="test-refonte-$(date +%s)"

echo "============================================="
echo "Test de la Refonte du Service Acceuil"
echo "============================================="
echo "Base URL: $BASE_URL"
echo "Visiteur ID: $VISITEUR_ID"
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour tester un endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local path=$3
    local data=$4
    
    echo -e "${YELLOW}Test: $name${NC}"
    echo "Request: $method $path"
    
    response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$path" \
        -H "Content-Type: application/json" \
        -d "$data")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✓ Status: $http_code (OK)${NC}"
        echo "Response:"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
        echo ""
        return 0
    else
        echo -e "${RED}✗ Status: $http_code (ERROR)${NC}"
        echo "Response:"
        echo "$body"
        echo ""
        return 1
    fi
}

# Test 1: Démarrage du processus
echo "============================================="
echo "1. Test POST /api/start"
echo "============================================="

START_DATA=$(cat <<EOF
{
  "visiteurId": "$VISITEUR_ID",
  "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
  "referrer": "https://www.google.com/search?q=experts+freelance",
  "ipAddress": "203.0.113.42",
  "resolution": "375x812",
  "vitesseConnexion": "4g",
  "langue": "fr-FR"
}
EOF
)

if test_endpoint "Démarrage processus" "POST" "/api/start" "$START_DATA"; then
    START_SUCCESS=true
else
    START_SUCCESS=false
fi

# Test 2: Scroll-next (premier chargement)
echo "============================================="
echo "2. Test POST /api/scroll-next (cursor=0)"
echo "============================================="

SCROLL_DATA_1=$(cat <<EOF
{
  "visiteurId": "$VISITEUR_ID",
  "afterCursor": "0",
  "batchSize": 5
}
EOF
)

if test_endpoint "Premier chargement d'experts" "POST" "/api/scroll-next" "$SCROLL_DATA_1"; then
    SCROLL_1_SUCCESS=true
else
    SCROLL_1_SUCCESS=false
fi

# Test 3: Scroll-next (deuxième chargement)
echo "============================================="
echo "3. Test POST /api/scroll-next (cursor=5)"
echo "============================================="

SCROLL_DATA_2=$(cat <<EOF
{
  "visiteurId": "$VISITEUR_ID",
  "afterCursor": "5",
  "batchSize": 3
}
EOF
)

if test_endpoint "Deuxième chargement d'experts" "POST" "/api/scroll-next" "$SCROLL_DATA_2"; then
    SCROLL_2_SUCCESS=true
else
    SCROLL_2_SUCCESS=false
fi

# Test 4: Dwell Start
echo "============================================="
echo "4. Test POST /api/dwell (DWELL_START)"
echo "============================================="

DWELL_START_DATA=$(cat <<EOF
{
  "visiteurId": "$VISITEUR_ID",
  "itemId": "exp-1",
  "eventType": "DWELL_START"
}
EOF
)

if test_endpoint "Événement DWELL_START" "POST" "/api/dwell" "$DWELL_START_DATA"; then
    DWELL_START_SUCCESS=true
else
    DWELL_START_SUCCESS=false
fi

# Test 5: Dwell Stop
echo "============================================="
echo "5. Test POST /api/dwell (DWELL_STOP)"
echo "============================================="

DWELL_STOP_DATA=$(cat <<EOF
{
  "visiteurId": "$VISITEUR_ID",
  "itemId": "exp-1",
  "eventType": "DWELL_STOP",
  "dureeDwellMs": 8500
}
EOF
)

if test_endpoint "Événement DWELL_STOP" "POST" "/api/dwell" "$DWELL_STOP_DATA"; then
    DWELL_STOP_SUCCESS=true
else
    DWELL_STOP_SUCCESS=false
fi

# Test 6: Scroll avec différents batchSize
echo "============================================="
echo "6. Test POST /api/scroll-next (batchSize=10)"
echo "============================================="

SCROLL_DATA_3=$(cat <<EOF
{
  "visiteurId": "$VISITEUR_ID",
  "afterCursor": "10",
  "batchSize": 10
}
EOF
)

if test_endpoint "Chargement avec batchSize=10" "POST" "/api/scroll-next" "$SCROLL_DATA_3"; then
    SCROLL_3_SUCCESS=true
else
    SCROLL_3_SUCCESS=false
fi

# Résumé des tests
echo "============================================="
echo "RÉSUMÉ DES TESTS"
echo "============================================="

print_result() {
    local name=$1
    local success=$2
    if [ "$success" = true ]; then
        echo -e "${GREEN}✓${NC} $name"
    else
        echo -e "${RED}✗${NC} $name"
    fi
}

print_result "POST /api/start" "$START_SUCCESS"
print_result "POST /api/scroll-next (cursor=0)" "$SCROLL_1_SUCCESS"
print_result "POST /api/scroll-next (cursor=5)" "$SCROLL_2_SUCCESS"
print_result "POST /api/dwell (DWELL_START)" "$DWELL_START_SUCCESS"
print_result "POST /api/dwell (DWELL_STOP)" "$DWELL_STOP_SUCCESS"
print_result "POST /api/scroll-next (batchSize=10)" "$SCROLL_3_SUCCESS"

echo ""

# Calcul du score
TOTAL=6
PASSED=0
[ "$START_SUCCESS" = true ] && ((PASSED++))
[ "$SCROLL_1_SUCCESS" = true ] && ((PASSED++))
[ "$SCROLL_2_SUCCESS" = true ] && ((PASSED++))
[ "$DWELL_START_SUCCESS" = true ] && ((PASSED++))
[ "$DWELL_STOP_SUCCESS" = true ] && ((PASSED++))
[ "$SCROLL_3_SUCCESS" = true ] && ((PASSED++))

echo "Tests réussis: $PASSED/$TOTAL"
echo ""

if [ $PASSED -eq $TOTAL ]; then
    echo -e "${GREEN}✓ Tous les tests sont passés avec succès !${NC}"
    echo -e "${GREEN}✓ La refonte fonctionne correctement.${NC}"
    exit 0
else
    echo -e "${RED}✗ Certains tests ont échoué.${NC}"
    echo -e "${YELLOW}Vérifiez que l'application est démarrée et que Zeebe est accessible.${NC}"
    exit 1
fi
