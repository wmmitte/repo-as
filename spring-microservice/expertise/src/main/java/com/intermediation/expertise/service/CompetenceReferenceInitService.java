package com.intermediation.expertise.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.intermediation.expertise.dto.CompetenceReferenceDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.List;

/**
 * Service d'initialisation du référentiel de compétences
 * Charge les données initiales depuis un fichier JSON au démarrage
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CompetenceReferenceInitService implements CommandLineRunner {
    
    private final CompetenceReferenceService competenceReferenceService;
    private final ObjectMapper objectMapper;
    
    @Override
    public void run(String... args) throws Exception {
        log.info("🔧 Initialisation du référentiel de compétences...");
        
        try {
            // Charger le fichier JSON
            ClassPathResource resource = new ClassPathResource("data/competences-reference-init.json");
            
            if (!resource.exists()) {
                log.warn("⚠️  Fichier d'initialisation non trouvé: data/competences-reference-init.json");
                return;
            }
            
            // Lire et parser le JSON
            try (InputStream inputStream = resource.getInputStream()) {
                List<CompetenceReferenceDTO> competences = objectMapper.readValue(
                    inputStream,
                    new TypeReference<List<CompetenceReferenceDTO>>() {}
                );
                
                log.info("📋 {} compétences trouvées dans le fichier d'initialisation", competences.size());
                
                // Importer les compétences
                List<CompetenceReferenceDTO> imported = competenceReferenceService.importerCompetences(competences);
                
                log.info("✅ {} compétences importées avec succès", imported.size());
                
                // Afficher un résumé
                long nouvelles = imported.stream().filter(c -> c.getId() != null).count();
                log.info("   - Nouvelles: {}", nouvelles);
                log.info("   - Mises à jour: {}", imported.size() - nouvelles);
                
            }
            
        } catch (Exception e) {
            log.error("❌ Erreur lors de l'initialisation du référentiel de compétences", e);
            // Ne pas bloquer le démarrage de l'application
        }
        
        log.info("🎯 Initialisation du référentiel terminée");
    }
}
