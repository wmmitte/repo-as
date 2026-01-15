package com.intermediation.expertise.service;

import com.intermediation.expertise.dto.ExpertPublicDTO;
import com.intermediation.expertise.model.ReseauExpertise;
import com.intermediation.expertise.repository.ReseauExpertiseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReseauExpertiseService {
    
    private final ReseauExpertiseRepository reseauRepository;
    private final ExpertiseService expertiseService;
    
    /**
     * Ajouter un expert au réseau
     */
    @Transactional
    public void ajouterAuReseau(String utilisateurId, String expertId) {
        // Vérifier si l'expert est déjà dans le réseau
        if (reseauRepository.existsByUtilisateurIdAndExpertId(utilisateurId, expertId)) {
            log.warn("L'expert {} est déjà dans le réseau de l'utilisateur {}", expertId, utilisateurId);
            return;
        }
        
        ReseauExpertise reseau = new ReseauExpertise();
        reseau.setUtilisateurId(utilisateurId);
        reseau.setExpertId(expertId);
        
        reseauRepository.save(reseau);
        log.info("L'expert {} a été ajouté au réseau de l'utilisateur {}", expertId, utilisateurId);
    }
    
    /**
     * Retirer un expert du réseau
     */
    @Transactional
    public void retirerDuReseau(String utilisateurId, String expertId) {
        reseauRepository.deleteByUtilisateurIdAndExpertId(utilisateurId, expertId);
        log.info("L'expert {} a été retiré du réseau de l'utilisateur {}", expertId, utilisateurId);
    }
    
    /**
     * Vérifier si un expert est dans le réseau
     */
    public boolean estDansReseau(String utilisateurId, String expertId) {
        return reseauRepository.existsByUtilisateurIdAndExpertId(utilisateurId, expertId);
    }
    
    /**
     * Récupérer tous les experts du réseau
     */
    public List<ExpertPublicDTO> getExpertsDuReseau(String utilisateurId) {
        List<ReseauExpertise> reseau = reseauRepository.findByUtilisateurId(utilisateurId);
        List<String> expertIds = reseau.stream()
                .map(ReseauExpertise::getExpertId)
                .collect(Collectors.toList());
        
        // Récupérer toutes les expertises publiques et filtrer
        return expertiseService.getExpertsPublies().stream()
                .filter(expert -> expertIds.contains(expert.getUtilisateurId()))
                .collect(Collectors.toList());
    }
    
    /**
     * Récupérer les IDs des experts du réseau
     */
    public List<String> getExpertIdsDuReseau(String utilisateurId) {
        return reseauRepository.findByUtilisateurId(utilisateurId).stream()
                .map(ReseauExpertise::getExpertId)
                .collect(Collectors.toList());
    }
}
