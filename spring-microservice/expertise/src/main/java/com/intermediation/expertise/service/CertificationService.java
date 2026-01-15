package com.intermediation.expertise.service;

import com.intermediation.expertise.dto.CertificationDTO;
import com.intermediation.expertise.model.Certification;
import com.intermediation.expertise.repository.CertificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CertificationService {
    
    private final CertificationRepository repository;
    
    /**
     * Récupère toutes les certifications actives
     */
    public List<CertificationDTO> getAllCertifications() {
        return repository.findByEstActiveTrueOrderByIntituleAsc().stream()
            .map(CertificationDTO::fromEntity)
            .collect(Collectors.toList());
    }
    
    /**
     * Récupère une certification par ID
     */
    public CertificationDTO getCertificationById(Long id) {
        return repository.findById(id)
            .map(CertificationDTO::fromEntity)
            .orElse(null);
    }
    
    /**
     * Recherche des certifications par intitulé
     */
    public List<CertificationDTO> rechercherCertifications(String terme) {
        if (terme == null || terme.trim().isEmpty()) {
            return getAllCertifications();
        }
        return repository.rechercherParIntitule(terme).stream()
            .map(CertificationDTO::fromEntity)
            .collect(Collectors.toList());
    }
    
    /**
     * Récupère les certifications les plus populaires
     */
    public List<CertificationDTO> getCertificationsPopulaires(int limit) {
        return repository.findTopByOrderByIndicePopulariteDesc().stream()
            .limit(limit)
            .map(CertificationDTO::fromEntity)
            .collect(Collectors.toList());
    }
    
    /**
     * Crée une nouvelle certification
     */
    @Transactional
    public CertificationDTO createCertification(CertificationDTO dto) {
        // Vérifier si l'intitulé existe déjà
        if (repository.findByIntitule(dto.getIntitule()).isPresent()) {
            throw new IllegalArgumentException("Une certification avec cet intitulé existe déjà");
        }
        
        Certification certification = new Certification(dto.getIntitule());
        certification.setDescription(dto.getDescription());
        certification.setOrganismeDelivrant(dto.getOrganismeDelivrant());
        certification.setUrlVerification(dto.getUrlVerification());
        certification.setEstActive(true);
        certification.setIndicePopularite(0);
        
        Certification saved = repository.save(certification);
        return CertificationDTO.fromEntity(saved);
    }
    
    /**
     * Met à jour une certification existante
     */
    @Transactional
    public CertificationDTO updateCertification(Long id, CertificationDTO dto) {
        Certification existing = repository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Certification non trouvée"));
        
        // Vérifier si le nouvel intitulé n'est pas déjà utilisé par une autre certification
        if (!existing.getIntitule().equals(dto.getIntitule())) {
            repository.findByIntitule(dto.getIntitule()).ifPresent(c -> {
                if (!c.getId().equals(id)) {
                    throw new IllegalArgumentException("Une certification avec cet intitulé existe déjà");
                }
            });
        }
        
        existing.setIntitule(dto.getIntitule());
        existing.setDescription(dto.getDescription());
        existing.setOrganismeDelivrant(dto.getOrganismeDelivrant());
        existing.setUrlVerification(dto.getUrlVerification());
        
        Certification saved = repository.save(existing);
        return CertificationDTO.fromEntity(saved);
    }
    
    /**
     * Supprime physiquement une certification
     */
    @Transactional
    public void deleteCertification(Long id) {
        Certification certification = repository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Certification non trouvée"));
        
        repository.delete(certification);
    }
    
    /**
     * Incrémente l'indice de popularité
     */
    @Transactional
    public void incrementerPopularite(Long id) {
        Certification certification = repository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Certification non trouvée"));
        
        certification.setIndicePopularite(certification.getIndicePopularite() + 1);
        repository.save(certification);
    }
    
    /**
     * Décrémente l'indice de popularité
     */
    @Transactional
    public void decrementerPopularite(Long id) {
        Certification certification = repository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Certification non trouvée"));
        
        if (certification.getIndicePopularite() > 0) {
            certification.setIndicePopularite(certification.getIndicePopularite() - 1);
            repository.save(certification);
        }
    }
    
    /**
     * Récupère les statistiques
     */
    public java.util.Map<String, Object> getStatistiques() {
        List<Certification> all = repository.findAll();
        long actives = all.stream().filter(Certification::getEstActive).count();
        int maxPopularite = all.stream()
            .mapToInt(Certification::getIndicePopularite)
            .max()
            .orElse(0);
        
        return java.util.Map.of(
            "total", all.size(),
            "actives", actives,
            "maxPopularite", maxPopularite
        );
    }
}
