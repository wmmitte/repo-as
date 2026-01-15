package com.intermediation.expertise.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.intermediation.expertise.model.Pays;
import com.intermediation.expertise.repository.PaysRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

/**
 * Service d'initialisation des pays
 * Charge les données initiales depuis un fichier JSON au démarrage
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Order(1) // S'exécute en premier car les villes dépendent des pays
public class PaysInitService implements CommandLineRunner {

    private final PaysRepository paysRepository;
    private final ObjectMapper objectMapper;

    @Override
    public void run(String... args) throws Exception {
        log.info("🌍 Initialisation des pays...");

        try {
            ClassPathResource resource = new ClassPathResource("data/pays-init.json");

            if (!resource.exists()) {
                log.warn("⚠️  Fichier d'initialisation non trouvé: data/pays-init.json");
                return;
            }

            try (InputStream inputStream = resource.getInputStream()) {
                List<Map<String, String>> paysData = objectMapper.readValue(
                    inputStream,
                    new TypeReference<List<Map<String, String>>>() {}
                );

                log.info("📋 {} pays trouvés dans le fichier d'initialisation", paysData.size());

                int importes = 0;
                for (Map<String, String> data : paysData) {
                    String nom = data.get("nom");
                    String codeIso = data.get("codeIso");

                    // Vérifier si le pays existe déjà
                    if (!paysRepository.existsByCodeIso(codeIso)) {
                        Pays pays = new Pays();
                        pays.setNom(nom);
                        pays.setCodeIso(codeIso);
                        pays.setEstActif(true);
                        pays.setIndicePopularite(0);
                        paysRepository.save(pays);
                        importes++;
                    }
                }

                log.info("✅ {} pays importés avec succès", importes);
            }

        } catch (Exception e) {
            log.error("❌ Erreur lors de l'initialisation des pays", e);
        }

        log.info("🎯 Initialisation des pays terminée");
    }
}
