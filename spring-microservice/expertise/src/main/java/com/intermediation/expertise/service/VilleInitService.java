package com.intermediation.expertise.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.intermediation.expertise.model.Pays;
import com.intermediation.expertise.model.Ville;
import com.intermediation.expertise.repository.PaysRepository;
import com.intermediation.expertise.repository.VilleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service d'initialisation des villes
 * Charge les données initiales depuis un fichier JSON au démarrage
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Order(2) // S'exécute après les pays
public class VilleInitService implements CommandLineRunner {

    private final VilleRepository villeRepository;
    private final PaysRepository paysRepository;
    private final ObjectMapper objectMapper;

    @Override
    public void run(String... args) throws Exception {
        log.info("🏙️  Initialisation des villes...");

        try {
            ClassPathResource resource = new ClassPathResource("data/villes-init.json");

            if (!resource.exists()) {
                log.warn("⚠️  Fichier d'initialisation non trouvé: data/villes-init.json");
                return;
            }

            try (InputStream inputStream = resource.getInputStream()) {
                List<Map<String, String>> villesData = objectMapper.readValue(
                    inputStream,
                    new TypeReference<List<Map<String, String>>>() {}
                );

                log.info("📋 {} villes trouvées dans le fichier d'initialisation", villesData.size());

                int importees = 0;
                int erreurs = 0;

                for (Map<String, String> data : villesData) {
                    String nom = data.get("nom");
                    String paysCode = data.get("paysCode");

                    // Trouver le pays
                    Optional<Pays> paysOpt = paysRepository.findByCodeIso(paysCode);
                    if (paysOpt.isEmpty()) {
                        log.warn("⚠️  Pays non trouvé pour le code: {} (ville: {})", paysCode, nom);
                        erreurs++;
                        continue;
                    }

                    Pays pays = paysOpt.get();

                    // Vérifier si la ville existe déjà
                    if (!villeRepository.existsByNomAndPays(nom, pays)) {
                        Ville ville = new Ville();
                        ville.setNom(nom);
                        ville.setPays(pays);
                        ville.setEstActif(true);
                        ville.setIndicePopularite(0);
                        villeRepository.save(ville);
                        importees++;
                    }
                }

                log.info("✅ {} villes importées avec succès ({} erreurs)", importees, erreurs);
            }

        } catch (Exception e) {
            log.error("❌ Erreur lors de l'initialisation des villes", e);
        }

        log.info("🎯 Initialisation des villes terminée");
    }
}
