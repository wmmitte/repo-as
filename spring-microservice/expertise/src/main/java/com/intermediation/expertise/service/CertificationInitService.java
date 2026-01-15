package com.intermediation.expertise.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.intermediation.expertise.model.Certification;
import com.intermediation.expertise.repository.CertificationRepository;
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
 * Service d'initialisation des certifications
 * Charge les données initiales depuis un fichier JSON au démarrage
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Order(3) // S'exécute après pays et villes
public class CertificationInitService implements CommandLineRunner {

    private final CertificationRepository certificationRepository;
    private final ObjectMapper objectMapper;

    @Override
    public void run(String... args) throws Exception {
        log.info("📜 Initialisation des certifications...");

        try {
            ClassPathResource resource = new ClassPathResource("data/certifications-init.json");

            if (!resource.exists()) {
                log.warn("⚠️  Fichier d'initialisation non trouvé: data/certifications-init.json");
                return;
            }

            try (InputStream inputStream = resource.getInputStream()) {
                List<Map<String, String>> certificationsData = objectMapper.readValue(
                    inputStream,
                    new TypeReference<List<Map<String, String>>>() {}
                );

                log.info("📋 {} certifications trouvées dans le fichier d'initialisation", certificationsData.size());

                int importees = 0;

                for (Map<String, String> data : certificationsData) {
                    String intitule = data.get("intitule");
                    String description = data.get("description");
                    String organismeDelivrant = data.get("organismeDelivrant");
                    String urlVerification = data.get("urlVerification");

                    // Vérifier si la certification existe déjà
                    if (!certificationRepository.existsByIntitule(intitule)) {
                        Certification certification = new Certification(intitule);
                        certification.setDescription(description);
                        certification.setOrganismeDelivrant(organismeDelivrant);
                        certification.setUrlVerification(urlVerification);
                        certification.setEstActive(true);
                        certification.setIndicePopularite(0);
                        certificationRepository.save(certification);
                        importees++;
                    }
                }

                log.info("✅ {} certifications importées avec succès", importees);
            }

        } catch (Exception e) {
            log.error("❌ Erreur lors de l'initialisation des certifications", e);
        }

        log.info("🎯 Initialisation des certifications terminée");
    }
}
