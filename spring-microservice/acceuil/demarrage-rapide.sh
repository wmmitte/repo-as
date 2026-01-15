#!/bin/bash

# Script de démarrage rapide après refonte
# Usage: ./demarrage-rapide.sh

echo "==============================================================================="
echo "           DÉMARRAGE RAPIDE - SERVICE ACCEUIL (APRÈS REFONTE)"
echo "==============================================================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Fonction pour afficher une étape
step() {
    echo -e "${CYAN}▶ $1${NC}"
}

# Fonction pour afficher un succès
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Étape 1: Vérification de la structure
step "Étape 1/4 : Vérification de la structure du projet"
echo ""

if [ -f "src/main/java/com/intermediation/acceuil/FeedController.java" ]; then
    success "FeedController.java existe"
else
    echo "✗ FeedController.java manquant"
    exit 1
fi

if [ -f "src/main/resources/processus/intermediation.bpmn" ]; then
    success "intermediation.bpmn existe"
else
    echo "✗ intermediation.bpmn manquant"
    exit 1
fi

# Vérifier que les anciens fichiers ont bien été supprimés
if [ ! -f "src/main/java/com/intermediation/acceuil/ContexteCache.java" ]; then
    success "ContexteCache.java supprimé"
else
    echo "⚠ ContexteCache.java existe encore"
fi

if [ ! -f "src/main/java/com/intermediation/acceuil/AnalyseProfilVisiteurWorker.java" ]; then
    success "AnalyseProfilVisiteurWorker.java supprimé"
else
    echo "⚠ AnalyseProfilVisiteurWorker.java existe encore"
fi

echo ""

# Étape 2: Compilation
step "Étape 2/4 : Compilation du projet"
echo ""

mvn clean compile -DskipTests -q

if [ $? -eq 0 ]; then
    success "Compilation réussie"
else
    echo "✗ Erreur de compilation"
    exit 1
fi

echo ""

# Étape 3: Package
step "Étape 3/4 : Création du JAR"
echo ""

mvn package -DskipTests -q

if [ $? -eq 0 ]; then
    success "JAR créé avec succès"
    if [ -f "target/acceuil-0.0.1-SNAPSHOT.jar" ]; then
        JAR_SIZE=$(ls -lh target/acceuil-0.0.1-SNAPSHOT.jar | awk '{print $5}')
        echo "  Taille: $JAR_SIZE"
        echo "  Emplacement: target/acceuil-0.0.1-SNAPSHOT.jar"
    fi
else
    echo "✗ Erreur lors de la création du JAR"
    exit 1
fi

echo ""

# Étape 4: Affichage des informations
step "Étape 4/4 : Informations de démarrage"
echo ""

echo "📊 Statistiques du projet :"
echo "  • Fichiers Java : $(find src/main/java -name '*.java' | wc -l | tr -d ' ')"
echo "  • Lignes de code (FeedController) : $(wc -l < src/main/java/com/intermediation/acceuil/FeedController.java | tr -d ' ')"
echo "  • Lignes BPMN : $(wc -l < src/main/resources/processus/intermediation.bpmn | tr -d ' ')"
echo ""

echo "🚀 Pour démarrer l'application :"
echo "  mvn spring-boot:run"
echo ""

echo "🧪 Pour tester l'application (une fois démarrée) :"
echo "  ./test-refonte.sh"
echo ""

echo "📚 Documentation disponible :"
echo "  • INDEX_DOCUMENTATION.md - Index de la documentation"
echo "  • REFONTE_FINALE.md - Synthèse finale de la refonte"
echo "  • NETTOYAGE_EFFECTUE.md - Rapport du nettoyage"
echo ""

echo "==============================================================================="
success "DÉMARRAGE RAPIDE TERMINÉ - PROJET PRÊT"
echo "==============================================================================="
echo ""

echo -e "${YELLOW}Prochaines étapes :${NC}"
echo "  1. Démarrer l'application : mvn spring-boot:run"
echo "  2. Tester les endpoints : ./test-refonte.sh"
echo "  3. Consulter la documentation : cat INDEX_DOCUMENTATION.md"
echo ""
