package com.intermediation.expertise.dto;

import com.intermediation.expertise.model.CompetenceReference;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO pour les compétences de référence
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompetenceReferenceDTO {
    private Long id;
    private String code;
    private String libelle;
    private String description;
    private String typeCompetence;
    private String domaine;
    private String sousDomaine;

    // IDs des référentiels pour le mapping frontend
    private Long domaineCompetenceId;
    private Long domaineMetierId;
    private Long sousDomaineMetierId;

    private String verbeAction;
    private String objet;
    private String contexte;
    private String ressourcesMobilisees;
    private String criteresPerformance;
    private String referentiel;
    private String organisme;
    private String statut;
    private Integer niveauHierarchie;
    private Long competenceParentId;
    private Integer ordreAffichage;
    private String motsCles;
    private Integer indicePopularite;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime prochaineRevision;
    private Integer version;
    private Boolean estActive;
    
    // Pour l'arborescence
    private List<CompetenceReferenceDTO> sousCompetences;
    
    /**
     * Convertit une entité en DTO
     */
    public static CompetenceReferenceDTO fromEntity(CompetenceReference entity) {
        if (entity == null) return null;
        
        CompetenceReferenceDTO dto = new CompetenceReferenceDTO();
        dto.setId(entity.getId());
        dto.setCode(entity.getCode());
        dto.setLibelle(entity.getLibelle());
        dto.setDescription(entity.getDescription());
        dto.setTypeCompetence(entity.getTypeCompetence() != null ? entity.getTypeCompetence().name() : null);
        dto.setDomaine(entity.getDomaine());
        dto.setSousDomaine(entity.getSousDomaine());

        // Mapper les IDs des référentiels
        dto.setDomaineCompetenceId(entity.getDomaineCompetence() != null ? entity.getDomaineCompetence().getId() : null);
        dto.setDomaineMetierId(entity.getDomaineMetier() != null ? entity.getDomaineMetier().getId() : null);
        dto.setSousDomaineMetierId(entity.getSousDomaineMetier() != null ? entity.getSousDomaineMetier().getId() : null);

        dto.setVerbeAction(entity.getVerbeAction());
        dto.setObjet(entity.getObjet());
        dto.setContexte(entity.getContexte());
        dto.setRessourcesMobilisees(entity.getRessourcesMobilisees());
        dto.setCriteresPerformance(entity.getCriteresPerformance());
        dto.setReferentiel(entity.getReferentiel());
        dto.setOrganisme(entity.getOrganisme());
        dto.setStatut(entity.getStatut() != null ? entity.getStatut().name() : null);
        dto.setNiveauHierarchie(entity.getNiveauHierarchie());
        dto.setCompetenceParentId(entity.getCompetenceParentId());
        dto.setOrdreAffichage(entity.getOrdreAffichage());
        dto.setMotsCles(entity.getMotsCles());
        dto.setIndicePopularite(entity.getIndicePopularite());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setProchaineRevision(entity.getProchaineRevision());
        dto.setVersion(entity.getVersion());
        dto.setEstActive(entity.getEstActive());
        
        return dto;
    }
    
    /**
     * Convertit un DTO en entité
     */
    public CompetenceReference toEntity() {
        CompetenceReference entity = new CompetenceReference();
        entity.setId(this.id);
        entity.setCode(this.code);
        entity.setLibelle(this.libelle);
        entity.setDescription(this.description);
        entity.setTypeCompetence(this.typeCompetence != null ? CompetenceReference.TypeCompetence.valueOf(this.typeCompetence) : null);
        entity.setDomaine(this.domaine);
        entity.setSousDomaine(this.sousDomaine);
        entity.setVerbeAction(this.verbeAction);
        entity.setObjet(this.objet);
        entity.setContexte(this.contexte);
        entity.setRessourcesMobilisees(this.ressourcesMobilisees);
        entity.setCriteresPerformance(this.criteresPerformance);
        entity.setReferentiel(this.referentiel);
        entity.setOrganisme(this.organisme);
        entity.setStatut(this.statut != null ? CompetenceReference.StatutCompetence.valueOf(this.statut) : null);
        entity.setNiveauHierarchie(this.niveauHierarchie);
        entity.setCompetenceParentId(this.competenceParentId);
        entity.setOrdreAffichage(this.ordreAffichage);
        entity.setMotsCles(this.motsCles);
        entity.setIndicePopularite(this.indicePopularite);
        entity.setProchaineRevision(this.prochaineRevision);
        entity.setVersion(this.version);
        entity.setEstActive(this.estActive);
        
        return entity;
    }
}
