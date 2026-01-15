#!/bin/bash

# Script d'arrêt des services Spring Boot

echo "========================================="
echo "Arrêt des services Spring Boot"
echo "========================================="

# Fonction pour arrêter un service sur un port
stop_service() {
    local port=$1
    local service_name=$2
    
    echo "🛑 Arrêt de $service_name (port $port)..."
    
    # Trouver le PID du processus sur le port
    pid=$(lsof -ti:$port)
    
    if [ -z "$pid" ]; then
        echo "   ℹ️  Aucun service en cours d'exécution sur le port $port"
    else
        kill -15 $pid 2>/dev/null
        sleep 2
        
        # Vérifier si le processus est toujours en cours
        if lsof -ti:$port > /dev/null 2>&1; then
            echo "   ⚠️  Arrêt forcé..."
            kill -9 $pid 2>/dev/null
        fi
        
        echo "   ✓ $service_name arrêté"
    fi
}

# Arrêter les services dans l'ordre inverse
stop_service 8090 "Gateway"
stop_service 8086 "Service Expertise"
stop_service 8083 "Service Acceuil"
stop_service 8085 "Service Paiement"
stop_service 8081 "Service Enrollment"
stop_service 8084 "Service Auth"
stop_service 8761 "Eureka Registry"
stop_service 8888 "Config Server"

echo ""
echo "✓ Tous les services sont arrêtés!"
echo ""
