#!/bin/bash

# Script de démarrage des services Spring Boot
# Ordre : Config Server -> Eureka -> Auth -> Enrollment -> Paiement -> Acceuil -> Expertise -> Gateway

echo "========================================="
echo "Démarrage des services Spring Boot"
echo "========================================="
echo ""

# Initialiser les bases de données
echo "🔧 Initialisation des bases de données..."
./init-databases.sh
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour attendre qu'un service soit prêt
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=60
    local attempt=0
    
    echo -e "${YELLOW}⏳ Attente du démarrage de $service_name...${NC}"
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✓ $service_name est prêt!${NC}"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 2
    done
    
    echo -e "${RED}✗ Timeout: $service_name n'a pas démarré à temps${NC}"
    return 1
}

# Fonction pour vérifier si un port est utilisé
check_port() {
    lsof -i :$1 > /dev/null 2>&1
    return $?
}

# 1. Config Server (port 8888)
echo ""
echo "1️⃣  Config Server (port 8888)"
if check_port 8888; then
    echo -e "${GREEN}✓ Config Server est déjà en cours d'exécution${NC}"
else
    echo "   Démarrage..."
    cd config-server
    mvn spring-boot:run > ../logs/config-server.log 2>&1 &
    CONFIG_PID=$!
    cd ..
    wait_for_service "http://localhost:8888/actuator/health" "Config Server"
    if [ $? -ne 0 ]; then
        echo -e "${RED}Échec du démarrage. Consultez logs/config-server.log${NC}"
        exit 1
    fi
fi

# 2. Eureka Registry (port 8761)
echo ""
echo "2️⃣  Eureka Registry (port 8761)"
if check_port 8761; then
    echo -e "${GREEN}✓ Eureka Registry est déjà en cours d'exécution${NC}"
else
    echo "   Démarrage..."
    cd registry
    mvn spring-boot:run > ../logs/eureka.log 2>&1 &
    EUREKA_PID=$!
    cd ..
    wait_for_service "http://localhost:8761" "Eureka Registry"
    if [ $? -ne 0 ]; then
        echo -e "${RED}Échec du démarrage. Consultez logs/eureka.log${NC}"
        exit 1
    fi
fi

# 3. Service Auth (port 8084)
echo ""
echo "3️⃣  Service Auth (port 8084)"
if check_port 8084; then
    echo -e "${GREEN}✓ Service Auth est déjà en cours d'exécution${NC}"
else
    echo "   Démarrage..."
    cd auth
    mvn spring-boot:run > ../logs/auth.log 2>&1 &
    AUTH_PID=$!
    cd ..
    wait_for_service "http://localhost:8084/actuator/health" "Service Auth"
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}⚠️  Service Auth peut prendre plus de temps. Continuons...${NC}"
        echo -e "${YELLOW}   Consultez logs/auth.log pour plus de détails${NC}"
    fi
fi

# 4. Service Enrollment (port 8081)
echo ""
echo "4️⃣  Service Enrollment (port 8081)"
if check_port 8081; then
    echo -e "${GREEN}✓ Service Enrollment est déjà en cours d'exécution${NC}"
else
    echo "   Démarrage..."
    cd enrollment
    mvn spring-boot:run > ../logs/enrollment.log 2>&1 &
    ENROLLMENT_PID=$!
    cd ..
    wait_for_service "http://localhost:8081/actuator/health" "Service Enrollment"
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}⚠️  Service Enrollment peut prendre plus de temps. Continuons...${NC}"
        echo -e "${YELLOW}   Consultez logs/enrollment.log pour plus de détails${NC}"
    fi
fi

# 5. Service Paiement (port 8085)
echo ""
echo "5️⃣  Service Paiement (port 8085)"
if check_port 8085; then
    echo -e "${GREEN}✓ Service Paiement est déjà en cours d'exécution${NC}"
else
    echo "   Démarrage..."
    cd paiement
    mvn spring-boot:run > ../logs/paiement.log 2>&1 &
    PAIEMENT_PID=$!
    cd ..
    wait_for_service "http://localhost:8085/actuator/health" "Service Paiement"
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}⚠️  Service Paiement peut prendre plus de temps. Continuons...${NC}"
        echo -e "${YELLOW}   Consultez logs/paiement.log pour plus de détails${NC}"
    fi
fi

# 6. Service Acceuil (port 8083)
echo ""
echo "6️⃣  Service Acceuil (port 8083)"
if check_port 8083; then
    echo -e "${GREEN}✓ Service Acceuil est déjà en cours d'exécution${NC}"
else
    echo "   Démarrage..."
    cd acceuil
    mvn spring-boot:run > ../logs/acceuil.log 2>&1 &
    ACCEUIL_PID=$!
    cd ..
    wait_for_service "http://localhost:8083/actuator/health" "Service Acceuil"
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}⚠️  Service Acceuil peut prendre plus de temps. Continuons...${NC}"
        echo -e "${YELLOW}   Consultez logs/acceuil.log pour plus de détails${NC}"
    fi
fi

# 7. Service Expertise (port 8086)
echo ""
echo "7️⃣  Service Expertise (port 8086)"
if check_port 8086; then
    echo -e "${GREEN}✓ Service Expertise est déjà en cours d'exécution${NC}"
else
    echo "   Démarrage..."
    cd expertise
    mvn spring-boot:run > ../logs/expertise.log 2>&1 &
    EXPERTISE_PID=$!
    cd ..
    wait_for_service "http://localhost:8086/api/expertise/health" "Service Expertise"
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}⚠️  Service Expertise peut prendre plus de temps. Continuons...${NC}"
        echo -e "${YELLOW}   Consultez logs/expertise.log pour plus de détails${NC}"
    fi
fi

# 8. Gateway (port 8090)
echo ""
echo "8️⃣  Gateway (port 8090)"
if check_port 8090; then
    echo -e "${GREEN}✓ Gateway est déjà en cours d'exécution${NC}"
else
    echo "   Démarrage..."
    cd gateway
    mvn spring-boot:run > ../logs/gateway.log 2>&1 &
    GATEWAY_PID=$!
    cd ..
    wait_for_service "http://localhost:8090/actuator/health" "Gateway"
    if [ $? -ne 0 ]; then
        echo -e "${RED}Échec du démarrage. Consultez logs/gateway.log${NC}"
        exit 1
    fi
fi

echo ""
echo "========================================="
echo -e "${GREEN}✓ Tous les services sont démarrés!${NC}"
echo "========================================="
echo ""
echo "Services disponibles:"
echo "  • Config Server:    http://localhost:8888"
echo "  • Eureka Registry:  http://localhost:8761"
echo "  • Service Auth:     http://localhost:8084"
echo "  • Service Enrollment: http://localhost:8081"
echo "  • Service Paiement: http://localhost:8085"
echo "  • Service Acceuil:  http://localhost:8083"
echo "  • Service Expertise: http://localhost:8086"
echo "  • Gateway (App):    http://localhost:8090"
echo ""
echo "Pour voir les logs en temps réel:"
echo "  tail -f logs/config-server.log"
echo "  tail -f logs/eureka.log"
echo "  tail -f logs/auth.log"
echo "  tail -f logs/enrollment.log"
echo "  tail -f logs/paiement.log"
echo "  tail -f logs/acceuil.log"
echo "  tail -f logs/expertise.log"
echo "  tail -f logs/gateway.log"
echo ""
echo "Pour arrêter tous les services: ./stop-services.sh"
echo ""
