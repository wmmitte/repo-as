package com.intermediation.expertise.service;

import com.intermediation.expertise.dto.DomaineMetierDTO;
import com.intermediation.expertise.dto.SousDomaineAvecDomaineDTO;
import com.intermediation.expertise.model.DomaineMetier;
import com.intermediation.expertise.model.SousDomaineMetier;
import com.intermediation.expertise.repository.DomaineMetierRepository;
import com.intermediation.expertise.repository.SousDomaineMetierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service pour la gestion des domaines métier et sous-domaines
 */
@Service
@RequiredArgsConstructor
public class DomaineMetierService {

    private final DomaineMetierRepository domaineMetierRepository;
    private final SousDomaineMetierRepository sousDomaineMetierRepository;

    // ==================== DOMAINES MÉTIER ====================

    /**
     * Récupère tous les domaines métier avec le nombre de sous-domaines
     */
    @Transactional(readOnly = true)
    public List<DomaineMetierDTO> getAllDomaines() {
        return domaineMetierRepository.findAllByOrderByPopulariteDescLibelleAsc()
            .stream()
            .map(this::convertDomaineToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Récupère un domaine métier par ID
     */
    @Transactional(readOnly = true)
    public DomaineMetierDTO getDomaineById(Long id) {
        DomaineMetier domaine = domaineMetierRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Domaine métier non trouvé"));
        return convertDomaineToDTO(domaine);
    }

    /**
     * Recherche des domaines métier
     */
    @Transactional(readOnly = true)
    public List<DomaineMetierDTO> rechercherDomaines(String terme) {
        if (terme == null || terme.trim().isEmpty()) {
            return getAllDomaines();
        }
        return domaineMetierRepository.rechercherParLibelleOuCode(terme)
            .stream()
            .map(this::convertDomaineToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Crée un nouveau domaine métier
     */
    @Transactional
    public DomaineMetierDTO createDomaine(DomaineMetierDTO dto) {
        if (domaineMetierRepository.existsByCodeIgnoreCase(dto.getCode())) {
            throw new IllegalArgumentException("Un domaine métier avec ce code existe déjà");
        }

        DomaineMetier domaine = new DomaineMetier();
        domaine.setCode(dto.getCode());
        domaine.setLibelle(dto.getLibelle());
        domaine.setDescription(dto.getDescription());
        domaine.setIcone(dto.getIcone());
        domaine.setCouleur(dto.getCouleur());
        domaine.setPopularite(dto.getPopularite());
        domaine.setEstActif(dto.getEstActif() != null ? dto.getEstActif() : true);

        DomaineMetier saved = domaineMetierRepository.save(domaine);
        return convertDomaineToDTO(saved);
    }

    /**
     * Met à jour un domaine métier
     */
    @Transactional
    public DomaineMetierDTO updateDomaine(Long id, DomaineMetierDTO dto) {
        DomaineMetier domaine = domaineMetierRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Domaine métier non trouvé"));

        domaine.setCode(dto.getCode());
        domaine.setLibelle(dto.getLibelle());
        domaine.setDescription(dto.getDescription());
        domaine.setIcone(dto.getIcone());
        domaine.setCouleur(dto.getCouleur());
        domaine.setPopularite(dto.getPopularite());
        domaine.setEstActif(dto.getEstActif());

        DomaineMetier updated = domaineMetierRepository.save(domaine);
        return convertDomaineToDTO(updated);
    }

    /**
     * Supprime un domaine métier (et tous ses sous-domaines en cascade)
     */
    @Transactional
    public void deleteDomaine(Long id) {
        if (!domaineMetierRepository.existsById(id)) {
            throw new IllegalArgumentException("Domaine métier non trouvé");
        }
        domaineMetierRepository.deleteById(id);
    }

    // ==================== SOUS-DOMAINES MÉTIER ====================

    /**
     * Récupère tous les sous-domaines
     */
    @Transactional(readOnly = true)
    public List<SousDomaineAvecDomaineDTO> getAllSousDomaines() {
        return sousDomaineMetierRepository.findAllByOrderByPopulariteDescLibelleAsc()
            .stream()
            .map(this::convertSousDomaineToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Récupère un sous-domaine par ID
     */
    @Transactional(readOnly = true)
    public SousDomaineAvecDomaineDTO getSousDomaineById(Long id) {
        SousDomaineMetier sousDomaine = sousDomaineMetierRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Sous-domaine non trouvé"));
        return convertSousDomaineToDTO(sousDomaine);
    }

    /**
     * Récupère les sous-domaines d'un domaine
     */
    @Transactional(readOnly = true)
    public List<SousDomaineAvecDomaineDTO> getSousDomainesByDomaineId(Long domaineId) {
        return sousDomaineMetierRepository.findByDomaineMetierId(domaineId)
            .stream()
            .map(this::convertSousDomaineToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Recherche combinée sous-domaine + domaine
     */
    @Transactional(readOnly = true)
    public List<SousDomaineAvecDomaineDTO> rechercherSousDomaines(String terme) {
        if (terme == null || terme.trim().isEmpty()) {
            return getAllSousDomaines().stream().limit(20).collect(Collectors.toList());
        }

        return sousDomaineMetierRepository.rechercherSousDomaineOuDomaine(terme)
            .stream()
            .map(this::convertSousDomaineToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Crée un nouveau sous-domaine
     */
    @Transactional
    public SousDomaineAvecDomaineDTO createSousDomaine(Long domaineId, String code, String libelle, String description, Integer popularite) {
        if (sousDomaineMetierRepository.existsByCodeIgnoreCaseAndDomaineMetierId(code, domaineId)) {
            throw new IllegalArgumentException("Ce sous-domaine existe déjà dans ce domaine");
        }

        DomaineMetier domaine = domaineMetierRepository.findById(domaineId)
            .orElseThrow(() -> new IllegalArgumentException("Domaine métier non trouvé"));

        SousDomaineMetier sousDomaine = new SousDomaineMetier();
        sousDomaine.setDomaineMetier(domaine);
        sousDomaine.setCode(code);
        sousDomaine.setLibelle(libelle);
        sousDomaine.setDescription(description);
        sousDomaine.setPopularite(popularite);
        sousDomaine.setEstActif(true);

        SousDomaineMetier saved = sousDomaineMetierRepository.save(sousDomaine);
        return convertSousDomaineToDTO(saved);
    }

    /**
     * Met à jour un sous-domaine
     */
    @Transactional
    public SousDomaineAvecDomaineDTO updateSousDomaine(Long id, Long domaineId, String code, String libelle, String description, Integer popularite, Boolean estActif) {
        SousDomaineMetier sousDomaine = sousDomaineMetierRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Sous-domaine non trouvé"));

        if (domaineId != null && !domaineId.equals(sousDomaine.getDomaineMetier().getId())) {
            DomaineMetier domaine = domaineMetierRepository.findById(domaineId)
                .orElseThrow(() -> new IllegalArgumentException("Domaine métier non trouvé"));
            sousDomaine.setDomaineMetier(domaine);
        }

        sousDomaine.setCode(code);
        sousDomaine.setLibelle(libelle);
        sousDomaine.setDescription(description);
        sousDomaine.setPopularite(popularite);
        sousDomaine.setEstActif(estActif);

        SousDomaineMetier updated = sousDomaineMetierRepository.save(sousDomaine);
        return convertSousDomaineToDTO(updated);
    }

    /**
     * Supprime un sous-domaine
     */
    @Transactional
    public void deleteSousDomaine(Long id) {
        if (!sousDomaineMetierRepository.existsById(id)) {
            throw new IllegalArgumentException("Sous-domaine non trouvé");
        }
        sousDomaineMetierRepository.deleteById(id);
    }

    // ==================== MÉTHODES DE CONVERSION ====================

    private DomaineMetierDTO convertDomaineToDTO(DomaineMetier domaine) {
        Long nombreSousDomaines = sousDomaineMetierRepository.countByDomaineMetierId(domaine.getId());
        return new DomaineMetierDTO(
            domaine.getId(),
            domaine.getCode(),
            domaine.getLibelle(),
            domaine.getDescription(),
            domaine.getIcone(),
            domaine.getCouleur(),
            domaine.getPopularite(),
            domaine.getEstActif(),
            nombreSousDomaines.intValue()
        );
    }

    private SousDomaineAvecDomaineDTO convertSousDomaineToDTO(SousDomaineMetier sousDomaine) {
        String nomComplet = String.format("%s (%s)",
            sousDomaine.getLibelle(),
            sousDomaine.getDomaineMetier().getLibelle());

        return new SousDomaineAvecDomaineDTO(
            sousDomaine.getId(),
            sousDomaine.getCode(),
            sousDomaine.getLibelle(),
            sousDomaine.getDomaineMetier().getId(),
            sousDomaine.getDomaineMetier().getLibelle(),
            nomComplet,
            sousDomaine.getPopularite()
        );
    }
}
