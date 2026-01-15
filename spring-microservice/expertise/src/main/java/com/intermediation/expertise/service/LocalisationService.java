package com.intermediation.expertise.service;

import com.intermediation.expertise.dto.PaysDTO;
import com.intermediation.expertise.dto.VilleAvecPaysDTO;
import com.intermediation.expertise.dto.VilleDTO;
import com.intermediation.expertise.model.Pays;
import com.intermediation.expertise.model.Ville;
import com.intermediation.expertise.repository.PaysRepository;
import com.intermediation.expertise.repository.VilleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service pour la gestion des localisations (pays et villes)
 */
@Service
@RequiredArgsConstructor
public class LocalisationService {
    
    private final PaysRepository paysRepository;
    private final VilleRepository villeRepository;
    
    // ==================== PAYS ====================
    
    /**
     * Récupère tous les pays avec le nombre de villes
     */
    @Transactional(readOnly = true)
    public List<PaysDTO> getAllPays() {
        return paysRepository.findAllByOrderByIndicePopulariteDescNomAsc()
            .stream()
            .map(this::convertPaysToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Récupère un pays par ID
     */
    @Transactional(readOnly = true)
    public PaysDTO getPaysById(Long id) {
        Pays pays = paysRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Pays non trouvé"));
        return convertPaysToDTO(pays);
    }
    
    /**
     * Recherche des pays
     */
    @Transactional(readOnly = true)
    public List<PaysDTO> rechercherPays(String terme) {
        if (terme == null || terme.trim().isEmpty()) {
            return getAllPays();
        }
        return paysRepository.rechercherParNom(terme)
            .stream()
            .map(this::convertPaysToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Crée un nouveau pays
     */
    @Transactional
    public PaysDTO createPays(PaysDTO dto) {
        if (paysRepository.existsByNomIgnoreCase(dto.getNom())) {
            throw new IllegalArgumentException("Un pays avec ce nom existe déjà");
        }
        
        Pays pays = new Pays();
        pays.setNom(dto.getNom());
        pays.setCodeIso(dto.getCodeIso());
        pays.setEstActif(dto.getEstActif() != null ? dto.getEstActif() : true);
        pays.setIndicePopularite(0);
        
        Pays saved = paysRepository.save(pays);
        return convertPaysToDTO(saved);
    }
    
    /**
     * Met à jour un pays
     */
    @Transactional
    public PaysDTO updatePays(Long id, PaysDTO dto) {
        Pays pays = paysRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Pays non trouvé"));
        
        pays.setNom(dto.getNom());
        pays.setCodeIso(dto.getCodeIso());
        pays.setEstActif(dto.getEstActif());
        
        Pays updated = paysRepository.save(pays);
        return convertPaysToDTO(updated);
    }
    
    /**
     * Supprime un pays (et toutes ses villes en cascade)
     */
    @Transactional
    public void deletePays(Long id) {
        if (!paysRepository.existsById(id)) {
            throw new IllegalArgumentException("Pays non trouvé");
        }
        paysRepository.deleteById(id);
    }
    
    // ==================== VILLES ====================
    
    /**
     * Récupère toutes les villes
     */
    @Transactional(readOnly = true)
    public List<VilleDTO> getAllVilles() {
        return villeRepository.findTopByOrderByIndicePopulariteDesc()
            .stream()
            .map(this::convertVilleToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Récupère une ville par ID
     */
    @Transactional(readOnly = true)
    public VilleDTO getVilleById(Long id) {
        Ville ville = villeRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Ville non trouvée"));
        return convertVilleToDTO(ville);
    }
    
    /**
     * Récupère les villes d'un pays
     */
    @Transactional(readOnly = true)
    public List<VilleDTO> getVillesByPaysId(Long paysId) {
        return villeRepository.findByPaysId(paysId)
            .stream()
            .map(this::convertVilleToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Recherche combinée ville + pays (pour l'autocomplete)
     */
    @Transactional(readOnly = true)
    public List<VilleAvecPaysDTO> rechercherLocalisations(String terme) {
        if (terme == null || terme.trim().isEmpty()) {
            return villeRepository.findTopByOrderByIndicePopulariteDesc()
                .stream()
                .limit(10)
                .map(this::convertVilleToVilleAvecPaysDTO)
                .collect(Collectors.toList());
        }
        
        return villeRepository.rechercherVilleOuPays(terme)
            .stream()
            .map(this::convertVilleToVilleAvecPaysDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Récupère les villes les plus populaires
     */
    @Transactional(readOnly = true)
    public List<VilleAvecPaysDTO> getVillesPopulaires(int limit) {
        return villeRepository.findTopByOrderByIndicePopulariteDesc()
            .stream()
            .limit(limit)
            .map(this::convertVilleToVilleAvecPaysDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Crée une nouvelle ville
     */
    @Transactional
    public VilleDTO createVille(VilleDTO dto) {
        if (villeRepository.existsByNomIgnoreCaseAndPaysId(dto.getNom(), dto.getPaysId())) {
            throw new IllegalArgumentException("Cette ville existe déjà dans ce pays");
        }
        
        Pays pays = paysRepository.findById(dto.getPaysId())
            .orElseThrow(() -> new IllegalArgumentException("Pays non trouvé"));
        
        Ville ville = new Ville();
        ville.setNom(dto.getNom());
        ville.setPays(pays);
        ville.setCodePostal(dto.getCodePostal());
        ville.setEstActif(dto.getEstActif() != null ? dto.getEstActif() : true);
        ville.setIndicePopularite(0);
        
        Ville saved = villeRepository.save(ville);
        return convertVilleToDTO(saved);
    }
    
    /**
     * Met à jour une ville
     */
    @Transactional
    public VilleDTO updateVille(Long id, VilleDTO dto) {
        Ville ville = villeRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Ville non trouvée"));
        
        if (dto.getPaysId() != null && !dto.getPaysId().equals(ville.getPays().getId())) {
            Pays pays = paysRepository.findById(dto.getPaysId())
                .orElseThrow(() -> new IllegalArgumentException("Pays non trouvé"));
            ville.setPays(pays);
        }
        
        ville.setNom(dto.getNom());
        ville.setCodePostal(dto.getCodePostal());
        ville.setEstActif(dto.getEstActif());
        
        Ville updated = villeRepository.save(ville);
        return convertVilleToDTO(updated);
    }
    
    /**
     * Supprime une ville
     */
    @Transactional
    public void deleteVille(Long id) {
        if (!villeRepository.existsById(id)) {
            throw new IllegalArgumentException("Ville non trouvée");
        }
        villeRepository.deleteById(id);
    }
    
    /**
     * Incrémente la popularité d'une ville
     */
    @Transactional
    public void incrementerPopularite(Long id) {
        Ville ville = villeRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Ville non trouvée"));
        ville.setIndicePopularite(ville.getIndicePopularite() + 1);
        villeRepository.save(ville);
    }
    
    /**
     * Décrémente la popularité d'une ville
     */
    @Transactional
    public void decrementerPopularite(Long id) {
        Ville ville = villeRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Ville non trouvée"));
        if (ville.getIndicePopularite() > 0) {
            ville.setIndicePopularite(ville.getIndicePopularite() - 1);
            villeRepository.save(ville);
        }
    }
    
    /**
     * Récupère les statistiques
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getStatistiques() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPays", paysRepository.count());
        stats.put("totalVilles", villeRepository.count());
        stats.put("paysActifs", paysRepository.findByEstActifTrueOrderByNomAsc().size());
        stats.put("villesActives", villeRepository.findByEstActifTrueOrderByNomAsc().size());
        
        List<Ville> topVilles = villeRepository.findTopByOrderByIndicePopulariteDesc();
        if (!topVilles.isEmpty()) {
            stats.put("maxPopularite", topVilles.get(0).getIndicePopularite());
        } else {
            stats.put("maxPopularite", 0);
        }
        
        return stats;
    }
    
    // ==================== CONVERSIONS ====================
    
    private PaysDTO convertPaysToDTO(Pays pays) {
        PaysDTO dto = new PaysDTO();
        dto.setId(pays.getId());
        dto.setNom(pays.getNom());
        dto.setCodeIso(pays.getCodeIso());
        dto.setEstActif(pays.getEstActif());
        dto.setIndicePopularite(pays.getIndicePopularite());
        dto.setNombreVilles(villeRepository.countByPaysId(pays.getId()).intValue());
        return dto;
    }
    
    private VilleDTO convertVilleToDTO(Ville ville) {
        VilleDTO dto = new VilleDTO();
        dto.setId(ville.getId());
        dto.setNom(ville.getNom());
        dto.setPaysId(ville.getPays().getId());
        dto.setPaysNom(ville.getPays().getNom());
        dto.setCodePostal(ville.getCodePostal());
        dto.setEstActif(ville.getEstActif());
        dto.setIndicePopularite(ville.getIndicePopularite());
        return dto;
    }
    
    private VilleAvecPaysDTO convertVilleToVilleAvecPaysDTO(Ville ville) {
        VilleAvecPaysDTO dto = new VilleAvecPaysDTO();
        dto.setVilleId(ville.getId());
        dto.setNomVille(ville.getNom());
        dto.setPaysId(ville.getPays().getId());
        dto.setNomPays(ville.getPays().getNom());
        dto.setNomComplet(ville.getNom() + ", " + ville.getPays().getNom());
        dto.setIndicePopularite(ville.getIndicePopularite());
        return dto;
    }
}
