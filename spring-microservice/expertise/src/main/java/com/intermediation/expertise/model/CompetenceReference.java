package com.intermediation.expertise.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Entité représentant une compétence de référence dans le référentiel normalisé.
 * Basée sur les standards internationaux (OCDE, UE, OIT).
 * 
 * Structure normative : [Verbe d'action] + [Objet/Contexte] + [Conditions/Modalités] + [Niveau de performance]
 */
@Entity
@Table(name = "competences_reference")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompetenceReference {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * Code unique de la compétence (ex: "TECH-JAVA-ADV", "MANAG-EQUIPE-001")
     */
    @Column(unique = true, length = 50)
    private String code;
    
    /**
     * Libellé court de la compétence
     */
    @Column(nullable = false)
    private String libelle;
    
    /**
     * Description détaillée de la compétence
     */
    @Column(columnDefinition = "TEXT")
    private String description;
    
    /**
     * Domaine de compétence (classification pédagogique: SAVOIR, SAVOIR_FAIRE, etc.)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "domaine_competence_id")
    private DomaineCompetence domaineCompetence;

    /**
     * Domaine métier (classification thématique: Technique, Management, etc.)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "domaine_metier_id")
    private DomaineMetier domaineMetier;

    /**
     * Sous-domaine métier (classification fine: Java, Python, etc.)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sous_domaine_metier_id")
    private SousDomaineMetier sousDomaineMetier;

    /**
     * Type de compétence selon la classification (ENUM - conservé pour compatibilité)
     * @deprecated Utiliser domaineCompetence à la place
     */
    @Deprecated
    @Enumerated(EnumType.STRING)
    @Column(name = "type_competence")
    private TypeCompetence typeCompetence;

    /**
     * Domaine principal en texte libre (conservé pour compatibilité)
     * @deprecated Utiliser domaineMetier à la place
     */
    @Deprecated
    @Column(length = 100)
    private String domaine;

    /**
     * Sous-domaine en texte libre (conservé pour compatibilité)
     * @deprecated Utiliser sousDomaineMetier à la place
     */
    @Deprecated
    @Column(name = "sous_domaine", length = 100)
    private String sousDomaine;

    /**
     * Verbe d'action observable et mesurable
     */
    @Column(name = "verbe_action", length = 100)
    private String verbeAction;
    
    /**
     * Objet de l'action
     */
    @Column(length = 255)
    private String objet;
    
    /**
     * Contexte d'exercice de la compétence
     */
    @Column(columnDefinition = "TEXT")
    private String contexte;
    
    /**
     * Ressources mobilisées (JSON: savoirs, savoir-faire, savoir-être)
     */
    @Column(columnDefinition = "TEXT")
    private String ressourcesMobilisees;
    
    /**
     * Critères de performance attendus
     */
    @Column(name = "criteres_performance", columnDefinition = "TEXT")
    private String criteresPerformance;
    
    /**
     * Référentiel d'origine (RNCP, ROME, Entreprise, etc.)
     */
    @Column(length = 100)
    private String referentiel;
    
    /**
     * Organisme émetteur du référentiel
     */
    @Column(length = 255)
    private String organisme;
    
    /**
     * Statut de la compétence dans le référentiel
     */
    @Enumerated(EnumType.STRING)
    private StatutCompetence statut;
    
    /**
     * Niveau hiérarchique (pour arborescence)
     */
    @Column(name = "niveau_hierarchie")
    private Integer niveauHierarchie;
    
    /**
     * ID de la compétence parente (pour compétences composites)
     */
    @Column(name = "competence_parent_id")
    private Long competenceParentId;
    
    /**
     * Ordre d'affichage
     */
    @Column(name = "ordre_affichage")
    private Integer ordreAffichage;
    
    /**
     * Mots-clés pour la recherche
     */
    @Column(name = "mots_cles", columnDefinition = "TEXT")
    private String motsCles;
    
    /**
     * Indice de popularité (nombre d'utilisations)
     */
    @Column(name = "indice_popularite")
    private Integer indicePopularite = 0;
    
    /**
     * Date de création
     */
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    /**
     * Date de dernière mise à jour
     */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    /**
     * Date de prochaine révision
     */
    @Column(name = "prochaine_revision")
    private LocalDateTime prochaineRevision;
    
    /**
     * Version de la compétence
     */
    private Integer version = 1;
    
    /**
     * Compétence active ou obsolète
     */
    @Column(name = "est_active")
    private Boolean estActive = true;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    /**
     * Type de compétence selon la classification
     */
    public enum TypeCompetence {
        SAVOIR("Savoir - Connaissances théoriques"),
        SAVOIR_FAIRE("Savoir-faire - Habiletés techniques"),
        SAVOIR_ETRE("Savoir-être - Comportements et attitudes"),
        SAVOIR_AGIR("Savoir-agir - Compétence complexe intégrée");
        
        private final String description;
        
        TypeCompetence(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }

    /**
     * Statut de la compétence dans le référentiel
     */
    public enum StatutCompetence {
        PROPOSITION("En proposition"),
        VALIDE("Validée"),
        EN_REVISION("En révision"),
        OBSOLETE("Obsolète");
        
        private final String description;
        
        StatutCompetence(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
}
