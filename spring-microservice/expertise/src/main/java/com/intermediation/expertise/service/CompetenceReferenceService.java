package com.intermediation.expertise.service;

import com.intermediation.expertise.dto.CompetenceReferenceDTO;
import com.intermediation.expertise.model.CompetenceReference;
import com.intermediation.expertise.model.DomaineCompetence;
import com.intermediation.expertise.model.DomaineMetier;
import com.intermediation.expertise.model.SousDomaineMetier;
import com.intermediation.expertise.repository.CompetenceReferenceRepository;
import com.intermediation.expertise.repository.DomaineCompetenceRepository;
import com.intermediation.expertise.repository.DomaineMetierRepository;
import com.intermediation.expertise.repository.SousDomaineMetierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CompetenceReferenceService {

    private final CompetenceReferenceRepository repository;
    private final DomaineCompetenceRepository domaineCompetenceRepository;
    private final DomaineMetierRepository domaineMetierRepository;
    private final SousDomaineMetierRepository sousDomaineMetierRepository;
    
    /**
     * Récupère toutes les compétences (actives uniquement par défaut)
     */
    public List<CompetenceReferenceDTO> getAllCompetences(boolean includeInactive) {
        return repository.findAll().stream()
            .filter(c -> includeInactive || c.getEstActive())
            .map(CompetenceReferenceDTO::fromEntity)
            .collect(Collectors.toList());
    }
    
    /**
     * Récupère une compétence par ID
     */
    public CompetenceReferenceDTO getCompetenceById(Long id) {
        return repository.findById(id)
            .map(CompetenceReferenceDTO::fromEntity)
            .orElse(null);
    }
    
    /**
     * Récupère une compétence par code
     */
    public CompetenceReferenceDTO getCompetenceByCode(String code) {
        return repository.findByCode(code)
            .map(CompetenceReferenceDTO::fromEntity)
            .orElse(null);
    }
    
    /**
     * Recherche par terme (full-text)
     */
    public List<CompetenceReferenceDTO> rechercherParTerme(String terme) {
        return repository.rechercherParTerme(terme).stream()
            .map(CompetenceReferenceDTO::fromEntity)
            .collect(Collectors.toList());
    }
    
    /**
     * Recherche avancée multi-critères
     */
    public List<CompetenceReferenceDTO> rechercheAvancee(
        String domaine,
        String sousDomaine,
        String typeCompetence
    ) {
        CompetenceReference.TypeCompetence type = null;
        if (typeCompetence != null && !typeCompetence.isEmpty()) {
            try {
                type = CompetenceReference.TypeCompetence.valueOf(typeCompetence);
            } catch (IllegalArgumentException e) {
                // Ignorer si le type n'est pas valide
            }
        }
        
        return repository.rechercheAvancee(domaine, sousDomaine, type).stream()
            .map(CompetenceReferenceDTO::fromEntity)
            .collect(Collectors.toList());
    }
    
    /**
     * Récupère les compétences par domaine
     */
    public List<CompetenceReferenceDTO> getCompetencesByDomaine(String domaine) {
        return repository.findByDomaineAndEstActiveTrue(domaine).stream()
            .map(CompetenceReferenceDTO::fromEntity)
            .collect(Collectors.toList());
    }
    
    /**
     * Récupère les compétences racines (pour affichage en arbre)
     */
    public List<CompetenceReferenceDTO> getCompetencesRacines() {
        List<CompetenceReference> racines = repository.findByCompetenceParentIdIsNullAndEstActiveTrueOrderByOrdreAffichage();
        return racines.stream()
            .map(this::buildArborescence)
            .collect(Collectors.toList());
    }
    
    /**
     * Construit l'arborescence complète d'une compétence
     */
    private CompetenceReferenceDTO buildArborescence(CompetenceReference competence) {
        CompetenceReferenceDTO dto = CompetenceReferenceDTO.fromEntity(competence);
        
        // Récupérer les sous-compétences
        List<CompetenceReference> sousCompetences = repository.findByCompetenceParentIdAndEstActiveTrueOrderByOrdreAffichage(competence.getId());
        
        if (!sousCompetences.isEmpty()) {
            List<CompetenceReferenceDTO> sousCompetencesDTO = sousCompetences.stream()
                .map(this::buildArborescence) // Récursif
                .collect(Collectors.toList());
            dto.setSousCompetences(sousCompetencesDTO);
        }
        
        return dto;
    }
    
    /**
     * Récupère les compétences les plus populaires
     */
    public List<CompetenceReferenceDTO> getCompetencesPopulaires(int limit) {
        return repository.findTop20ByEstActiveTrueOrderByIndicePopulariteDesc().stream()
            .limit(limit)
            .map(CompetenceReferenceDTO::fromEntity)
            .collect(Collectors.toList());
    }
    
    /**
     * Récupère tous les domaines
     */
    public List<String> getAllDomaines() {
        return repository.findAllDomaines();
    }
    
    /**
     * Récupère les sous-domaines d'un domaine
     */
    public List<String> getSousDomainesByDomaine(String domaine) {
        return repository.findSousDomainesByDomaine(domaine);
    }
    
    /**
     * Récupère les statistiques par domaine
     */
    public Map<String, Long> getStatistiquesByDomaine() {
        List<Object[]> results = repository.countByDomaine();
        Map<String, Long> stats = new HashMap<>();
        
        for (Object[] result : results) {
            String domaine = (String) result[0];
            Long count = (Long) result[1];
            stats.put(domaine, count);
        }
        
        return stats;
    }
    
    /**
     * Crée une nouvelle compétence de référence
     */
    @Transactional
    public CompetenceReferenceDTO creerCompetence(CompetenceReferenceDTO dto) {
        // Générer un code si non fourni
        if (dto.getCode() == null || dto.getCode().isEmpty()) {
            dto.setCode(genererCode(dto));
        }
        
        // Vérifier l'unicité du code
        if (repository.findByCode(dto.getCode()).isPresent()) {
            throw new IllegalArgumentException("Une compétence avec ce code existe déjà");
        }
        
        CompetenceReference entity = dto.toEntity();

        // Charger et associer les entités de référence
        mapperReferentiels(dto, entity);

        entity.setEstActive(true);
        entity.setIndicePopularite(0);
        entity.setVersion(1);
        
        // Définir la prochaine révision (1 an par défaut)
        if (entity.getProchaineRevision() == null) {
            entity.setProchaineRevision(LocalDateTime.now().plusYears(1));
        }
        
        CompetenceReference saved = repository.save(entity);
        return CompetenceReferenceDTO.fromEntity(saved);
    }
    
    /**
     * Met à jour une compétence existante
     */
    @Transactional
    public CompetenceReferenceDTO updateCompetence(Long id, CompetenceReferenceDTO dto) {
        CompetenceReference existing = repository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Compétence non trouvée"));
        
        // Mettre à jour les champs
        existing.setLibelle(dto.getLibelle());
        existing.setDescription(dto.getDescription());
        existing.setDomaine(dto.getDomaine());
        existing.setSousDomaine(dto.getSousDomaine());
        existing.setVerbeAction(dto.getVerbeAction());
        existing.setObjet(dto.getObjet());
        existing.setContexte(dto.getContexte());
        existing.setRessourcesMobilisees(dto.getRessourcesMobilisees());
        existing.setCriteresPerformance(dto.getCriteresPerformance());
        existing.setMotsCles(dto.getMotsCles());

        // Charger et associer les entités de référence
        mapperReferentiels(dto, existing);

        if (dto.getTypeCompetence() != null) {
            existing.setTypeCompetence(CompetenceReference.TypeCompetence.valueOf(dto.getTypeCompetence()));
        }

        if (dto.getStatut() != null) {
            existing.setStatut(CompetenceReference.StatutCompetence.valueOf(dto.getStatut()));
        }
        
        // Incrémenter la version
        existing.setVersion(existing.getVersion() + 1);
        
        CompetenceReference saved = repository.save(existing);
        return CompetenceReferenceDTO.fromEntity(saved);
    }
    
    /**
     * Supprime (désactive) une compétence
     */
    @Transactional
    public void deleteCompetence(Long id) {
        CompetenceReference competence = repository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Compétence non trouvée"));
        
        competence.setEstActive(false);
        competence.setStatut(CompetenceReference.StatutCompetence.OBSOLETE);
        repository.save(competence);
    }
    
    /**
     * Incrémente l'indice de popularité d'une compétence
     */
    @Transactional
    public void incrementerPopularite(Long id) {
        CompetenceReference competence = repository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Compétence non trouvée"));
        
        competence.setIndicePopularite(competence.getIndicePopularite() + 1);
        repository.save(competence);
    }
    
    /**
     * Décrémente l'indice de popularité d'une compétence (ne descend pas en dessous de 0)
     */
    @Transactional
    public void decrementerPopularite(Long id) {
        CompetenceReference competence = repository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Compétence non trouvée"));
        
        // Ne pas descendre en dessous de 0
        if (competence.getIndicePopularite() > 0) {
            competence.setIndicePopularite(competence.getIndicePopularite() - 1);
            repository.save(competence);
        }
    }
    
    /**
     * Génère un code unique pour une compétence
     */
    private String genererCode(CompetenceReferenceDTO dto) {
        String prefix = "";
        
        // Préfixe basé sur le domaine
        if (dto.getDomaine() != null) {
            prefix = dto.getDomaine().substring(0, Math.min(4, dto.getDomaine().length())).toUpperCase();
        }
        
        // Suffixe basé sur le libellé
        String suffix = "";
        if (dto.getLibelle() != null) {
            String[] words = dto.getLibelle().split("\\s+");
            suffix = words[0].substring(0, Math.min(4, words[0].length())).toUpperCase();
        }
        
        // Numéro séquentiel
        long count = repository.count() + 1;
        
        return String.format("%s-%s-%03d", prefix, suffix, count);
    }
    
    /**
     * Importe des compétences en masse depuis une liste
     */
    @Transactional
    public List<CompetenceReferenceDTO> importerCompetences(List<CompetenceReferenceDTO> competences) {
        List<CompetenceReferenceDTO> imported = new ArrayList<>();
        
        for (CompetenceReferenceDTO dto : competences) {
            try {
                // Vérifier si la compétence existe déjà par code
                if (dto.getCode() != null && repository.findByCode(dto.getCode()).isPresent()) {
                    // Mettre à jour
                    CompetenceReference existing = repository.findByCode(dto.getCode()).get();
                    CompetenceReferenceDTO updated = updateCompetence(existing.getId(), dto);
                    imported.add(updated);
                } else {
                    // Créer
                    CompetenceReferenceDTO created = creerCompetence(dto);
                    imported.add(created);
                }
            } catch (Exception e) {
                // Logger l'erreur et continuer
                System.err.println("Erreur lors de l'import de la compétence: " + dto.getLibelle() + " - " + e.getMessage());
            }
        }
        
        return imported;
    }

    /**
     * Mappe les IDs du DTO vers les entités de référence
     */
    private void mapperReferentiels(CompetenceReferenceDTO dto, CompetenceReference entity) {
        // Charger et associer le domaine de compétence
        if (dto.getDomaineCompetenceId() != null) {
            domaineCompetenceRepository.findById(dto.getDomaineCompetenceId())
                .ifPresent(entity::setDomaineCompetence);
        }

        // Charger et associer le domaine métier
        if (dto.getDomaineMetierId() != null) {
            domaineMetierRepository.findById(dto.getDomaineMetierId())
                .ifPresent(entity::setDomaineMetier);
        }

        // Charger et associer le sous-domaine métier
        if (dto.getSousDomaineMetierId() != null) {
            sousDomaineMetierRepository.findById(dto.getSousDomaineMetierId())
                .ifPresent(entity::setSousDomaineMetier);
        }
    }
}
