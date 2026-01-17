package com.intermediation.expertise.service;

import com.intermediation.expertise.dto.RechercheExpertRequest;
import com.intermediation.expertise.dto.RechercheExpertResponse;
import com.intermediation.expertise.dto.RechercheExpertResponse.*;
import com.intermediation.expertise.model.BadgeCompetence.NiveauCertification;
import com.intermediation.expertise.repository.CompetenceRepository;
import com.intermediation.expertise.repository.BadgeCompetenceRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service de recherche avancée d'experts.
 * Utilise Full-Text Search PostgreSQL pour une recherche performante.
 */
@Service
public class RechercheExpertService {

    private static final Logger log = LoggerFactory.getLogger(RechercheExpertService.class);

    @PersistenceContext
    private EntityManager entityManager;

    private final CompetenceRepository competenceRepository;
    private final BadgeCompetenceRepository badgeCompetenceRepository;

    public RechercheExpertService(CompetenceRepository competenceRepository,
                                   BadgeCompetenceRepository badgeCompetenceRepository) {
        this.competenceRepository = competenceRepository;
        this.badgeCompetenceRepository = badgeCompetenceRepository;
    }

    /**
     * Recherche avancée d'experts avec tous les critères
     */
    @Transactional(readOnly = true)
    public RechercheExpertResponse rechercherExperts(RechercheExpertRequest request) {
        log.info("Recherche avancée - terme: '{}', page: {}, taille: {}",
                request.getTerme(), request.getPage(), request.getTaille());

        // Construire la requête dynamique
        StringBuilder sql = new StringBuilder();
        Map<String, Object> params = new HashMap<>();

        // Requête principale avec jointures
        // Note: pas de DISTINCT car GROUP BY garantit déjà l'unicité des résultats
        sql.append("""
            SELECT
                e.utilisateur_id,
                e.titre,
                e.description,
                e.photo_url,
                e.score_global,
                e.disponible,
                v.nom as ville_nom,
                p.nom as pays_nom,
                p.id as pays_id,
                v.id as ville_id,
                COALESCE(comp_stats.nombre_competences, 0) as nombre_competences,
                COALESCE(comp_stats.niveau_max, 0) as niveau_maitrise_max,
                COALESCE(comp_stats.experience_max, 0) as annees_experience_max,
                COALESCE(comp_stats.thm_min, 0) as thm_min,
                COALESCE(comp_stats.thm_max, 0) as thm_max,
                COALESCE(comp_stats.projets_total, 0) as nombre_projets,
                COALESCE(badge_stats.nombre_badges, 0) as nombre_badges,
                badge_stats.niveau_badge_max,
                COALESCE(reseau_stats.nombre_followers, 0) as nombre_followers
            """);

        // Score de recherche textuelle si terme présent
        if (request.getTerme() != null && !request.getTerme().trim().isEmpty()) {
            sql.append("""
                ,
                COALESCE(ts_rank(e.recherche_texte, plainto_tsquery('french', :terme)), 0) * 0.6 +
                COALESCE(MAX(ts_rank(c.recherche_texte, plainto_tsquery('french', :terme))), 0) * 0.4
                as score_recherche
                """);
            params.put("terme", request.getTerme().trim());
        } else {
            sql.append(", 0 as score_recherche\n");
        }

        // FROM et jointures
        sql.append("""
            FROM expertises e
            LEFT JOIN villes v ON e.ville_id = v.id
            LEFT JOIN pays p ON v.pays_id = p.id
            LEFT JOIN competences c ON c.utilisateur_id = e.utilisateur_id
            LEFT JOIN (
                SELECT
                    utilisateur_id,
                    COUNT(*) as nombre_competences,
                    MAX(niveau_maitrise) as niveau_max,
                    MAX(annees_experience) as experience_max,
                    MIN(thm) FILTER (WHERE thm > 0) as thm_min,
                    MAX(thm) as thm_max,
                    SUM(COALESCE(nombre_projets, 0)) as projets_total
                FROM competences
                GROUP BY utilisateur_id
            ) comp_stats ON e.utilisateur_id = comp_stats.utilisateur_id
            LEFT JOIN (
                SELECT
                    utilisateur_id,
                    COUNT(*) as nombre_badges,
                    MAX(niveau_certification) as niveau_badge_max
                FROM badges_competence
                WHERE est_actif = true
                GROUP BY utilisateur_id
            ) badge_stats ON e.utilisateur_id = badge_stats.utilisateur_id
            LEFT JOIN (
                SELECT expert_id, COUNT(*) as nombre_followers
                FROM reseau_expertises
                GROUP BY expert_id
            ) reseau_stats ON e.utilisateur_id = reseau_stats.expert_id
            """);

        // WHERE - filtres
        sql.append("WHERE e.publiee = true\n");

        // Filtre recherche textuelle
        if (request.getTerme() != null && !request.getTerme().trim().isEmpty()) {
            sql.append("""
                AND (
                    e.recherche_texte @@ plainto_tsquery('french', :terme)
                    OR c.recherche_texte @@ plainto_tsquery('french', :terme)
                    OR e.titre ILIKE :termeLike
                    OR c.nom ILIKE :termeLike
                )
                """);
            params.put("termeLike", "%" + request.getTerme().trim() + "%");
        }

        // Filtre localisation
        if (request.getVilleId() != null) {
            sql.append("AND v.id = :villeId\n");
            params.put("villeId", request.getVilleId());
        } else if (request.getPaysId() != null) {
            sql.append("AND p.id = :paysId\n");
            params.put("paysId", request.getPaysId());
        }

        // Filtre disponibilité
        if (request.getDisponible() != null) {
            sql.append("AND e.disponible = :disponible\n");
            params.put("disponible", request.getDisponible());
        }

        // Filtre score minimum
        if (request.getScoreMin() != null) {
            sql.append("AND e.score_global >= :scoreMin\n");
            params.put("scoreMin", request.getScoreMin());
        }

        // GROUP BY
        sql.append("""
            GROUP BY e.id, e.utilisateur_id, e.titre, e.description, e.photo_url,
                     e.score_global, e.disponible, v.nom, p.nom, p.id, v.id,
                     comp_stats.nombre_competences, comp_stats.niveau_max,
                     comp_stats.experience_max, comp_stats.thm_min, comp_stats.thm_max,
                     comp_stats.projets_total, badge_stats.nombre_badges,
                     badge_stats.niveau_badge_max, reseau_stats.nombre_followers
            """);

        // Filtres HAVING (après agrégation)
        List<String> havingClauses = new ArrayList<>();

        if (request.getAnneesExperienceMin() != null) {
            havingClauses.add("COALESCE(comp_stats.experience_max, 0) >= :experienceMin");
            params.put("experienceMin", request.getAnneesExperienceMin());
        }

        if (request.getNiveauMaitriseMin() != null) {
            havingClauses.add("COALESCE(comp_stats.niveau_max, 0) >= :niveauMin");
            params.put("niveauMin", request.getNiveauMaitriseMin());
        }

        if (request.getNombreProjetsMin() != null) {
            havingClauses.add("COALESCE(comp_stats.projets_total, 0) >= :projetsMin");
            params.put("projetsMin", request.getNombreProjetsMin());
        }

        if (request.getThmMin() != null) {
            havingClauses.add("COALESCE(comp_stats.thm_max, 0) >= :thmMin");
            params.put("thmMin", request.getThmMin());
        }

        if (request.getThmMax() != null) {
            havingClauses.add("(COALESCE(comp_stats.thm_min, 0) <= :thmMax OR comp_stats.thm_min IS NULL)");
            params.put("thmMax", request.getThmMax());
        }

        if (request.getNombreBadgesMin() != null) {
            havingClauses.add("COALESCE(badge_stats.nombre_badges, 0) >= :badgesMin");
            params.put("badgesMin", request.getNombreBadgesMin());
        }

        if (Boolean.TRUE.equals(request.getCertifieUniquement())) {
            havingClauses.add("COALESCE(badge_stats.nombre_badges, 0) > 0");
        }

        if (request.getNiveauBadgeMin() != null) {
            int niveauOrdinal = getNiveauOrdinal(request.getNiveauBadgeMin());
            havingClauses.add("badge_stats.niveau_badge_max IS NOT NULL");
            // Note: PostgreSQL compare les enums par ordre de déclaration
        }

        if (request.getNombreFollowersMin() != null) {
            havingClauses.add("COALESCE(reseau_stats.nombre_followers, 0) >= :followersMin");
            params.put("followersMin", request.getNombreFollowersMin());
        }

        if (!havingClauses.isEmpty()) {
            sql.append("HAVING ").append(String.join(" AND ", havingClauses)).append("\n");
        }

        // ORDER BY
        String tri = request.getTri() != null ? request.getTri().toUpperCase() : "SCORE";
        switch (tri) {
            case "EXPERIENCE":
                sql.append("ORDER BY COALESCE(comp_stats.experience_max, 0) DESC, e.score_global DESC\n");
                break;
            case "THM_ASC":
                sql.append("ORDER BY COALESCE(comp_stats.thm_min, 999999) ASC, e.score_global DESC\n");
                break;
            case "THM_DESC":
                sql.append("ORDER BY COALESCE(comp_stats.thm_max, 0) DESC, e.score_global DESC\n");
                break;
            case "POPULARITE":
                sql.append("ORDER BY COALESCE(reseau_stats.nombre_followers, 0) DESC, e.score_global DESC\n");
                break;
            case "RECENT":
                sql.append("ORDER BY e.date_creation DESC, e.score_global DESC\n");
                break;
            case "PERTINENCE":
                if (request.getTerme() != null && !request.getTerme().trim().isEmpty()) {
                    sql.append("ORDER BY score_recherche DESC, e.score_global DESC\n");
                } else {
                    sql.append("ORDER BY e.score_global DESC\n");
                }
                break;
            default: // SCORE
                sql.append("ORDER BY e.score_global DESC\n");
        }

        // Pagination
        int page = request.getPage() != null ? request.getPage() : 0;
        int taille = request.getTaille() != null ? Math.min(request.getTaille(), 100) : 20;
        sql.append("LIMIT :limit OFFSET :offset\n");
        params.put("limit", taille);
        params.put("offset", page * taille);

        // Exécuter la requête principale
        Query query = entityManager.createNativeQuery(sql.toString());
        params.forEach(query::setParameter);

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();

        // Convertir les résultats
        List<ExpertResultat> resultats = rows.stream()
                .map(this::mapToExpertResultat)
                .collect(Collectors.toList());

        // Charger les compétences principales pour chaque expert
        for (ExpertResultat resultat : resultats) {
            resultat.setCompetencesPrincipales(
                    chargerCompetencesPrincipales(resultat.getUtilisateurId())
            );
        }

        // Compter le total
        long totalResultats = compterTotalResultats(request, params);

        // Construire la réponse
        RechercheExpertResponse response = new RechercheExpertResponse();
        response.setResultats(resultats);
        response.setTotalResultats(totalResultats);
        response.setPage(page);
        response.setTaille(taille);
        response.setTotalPages((int) Math.ceil((double) totalResultats / taille));

        // Charger les facettes
        response.setFacettesPays(chargerFacettesPays());
        response.setFacettesVilles(chargerFacettesVilles(request.getPaysId()));
        response.setFacettesBadges(chargerFacettesBadges());
        response.setStatistiques(chargerStatistiques());

        log.info("Recherche terminée - {} résultats trouvés", totalResultats);
        return response;
    }

    /**
     * Convertit une ligne de résultat en ExpertResultat
     */
    private ExpertResultat mapToExpertResultat(Object[] row) {
        ExpertResultat r = new ExpertResultat();
        r.setUtilisateurId((String) row[0]);
        r.setTitre((String) row[1]);
        r.setDescription((String) row[2]);
        r.setPhotoUrl((String) row[3]);
        r.setScoreGlobal(row[4] != null ? new BigDecimal(row[4].toString()) : BigDecimal.ZERO);
        r.setDisponible((Boolean) row[5]);
        r.setVilleNom((String) row[6]);
        r.setPaysNom((String) row[7]);
        // row[8] = pays_id, row[9] = ville_id (non utilisés ici)
        r.setNombreCompetences(((Number) row[10]).intValue());
        r.setNiveauMaitriseMax(((Number) row[11]).intValue());
        r.setAnneesExperienceMax(((Number) row[12]).intValue());
        r.setThmMin(row[13] != null ? ((Number) row[13]).intValue() : null);
        r.setThmMax(row[14] != null ? ((Number) row[14]).intValue() : null);
        r.setNombreProjets(((Number) row[15]).intValue());
        r.setNombreBadges(((Number) row[16]).intValue());
        r.setNiveauBadgeMax(row[17] != null ? row[17].toString() : null);
        r.setNombreFollowers(((Number) row[18]).intValue());
        r.setScoreRecherche(row[19] != null ? ((Number) row[19]).doubleValue() : 0.0);
        return r;
    }

    /**
     * Charge les 3 compétences principales d'un expert
     */
    private List<CompetenceResume> chargerCompetencesPrincipales(String utilisateurId) {
        String sql = """
            SELECT c.nom, c.niveau_maitrise, c.annees_experience, c.thm,
                   b.niveau_certification
            FROM competences c
            LEFT JOIN badges_competence b ON b.competence_id = c.id AND b.est_actif = true
            WHERE c.utilisateur_id = :utilisateurId
            ORDER BY COALESCE(b.niveau_certification, 'AUCUN') DESC,
                     c.niveau_maitrise DESC NULLS LAST,
                     c.annees_experience DESC NULLS LAST
            LIMIT 3
            """;

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("utilisateurId", utilisateurId);

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();

        return rows.stream().map(row -> {
            CompetenceResume cr = new CompetenceResume();
            cr.setNom((String) row[0]);
            cr.setNiveauMaitrise(row[1] != null ? ((Number) row[1]).intValue() : null);
            cr.setAnneesExperience(row[2] != null ? ((Number) row[2]).intValue() : null);
            cr.setThm(row[3] != null ? ((Number) row[3]).intValue() : null);
            cr.setNiveauBadge(row[4] != null ? row[4].toString() : null);
            cr.setEstCertifiee(row[4] != null);
            return cr;
        }).collect(Collectors.toList());
    }

    /**
     * Compte le total de résultats (sans pagination)
     * Utilise une sous-requête pour appliquer tous les filtres y compris HAVING
     */
    private long compterTotalResultats(RechercheExpertRequest request, Map<String, Object> params) {
        StringBuilder countSql = new StringBuilder();
        Map<String, Object> countParams = new HashMap<>();

        // Sous-requête avec tous les filtres
        countSql.append("""
            SELECT COUNT(*) FROM (
                SELECT e.id
                FROM expertises e
                LEFT JOIN villes v ON e.ville_id = v.id
                LEFT JOIN pays p ON v.pays_id = p.id
                LEFT JOIN competences c ON c.utilisateur_id = e.utilisateur_id
                LEFT JOIN (
                    SELECT
                        utilisateur_id,
                        COUNT(*) as nombre_competences,
                        MAX(niveau_maitrise) as niveau_max,
                        MAX(annees_experience) as experience_max,
                        MIN(thm) FILTER (WHERE thm > 0) as thm_min,
                        MAX(thm) as thm_max,
                        SUM(COALESCE(nombre_projets, 0)) as projets_total
                    FROM competences
                    GROUP BY utilisateur_id
                ) comp_stats ON e.utilisateur_id = comp_stats.utilisateur_id
                LEFT JOIN (
                    SELECT
                        utilisateur_id,
                        COUNT(*) as nombre_badges,
                        MAX(niveau_certification) as niveau_badge_max
                    FROM badges_competence
                    WHERE est_actif = true
                    GROUP BY utilisateur_id
                ) badge_stats ON e.utilisateur_id = badge_stats.utilisateur_id
                LEFT JOIN (
                    SELECT expert_id, COUNT(*) as nombre_followers
                    FROM reseau_expertises
                    GROUP BY expert_id
                ) reseau_stats ON e.utilisateur_id = reseau_stats.expert_id
                WHERE e.publiee = true
            """);

        // Appliquer les filtres WHERE
        if (request.getTerme() != null && !request.getTerme().trim().isEmpty()) {
            countSql.append("""
                AND (
                    e.recherche_texte @@ plainto_tsquery('french', :terme)
                    OR c.recherche_texte @@ plainto_tsquery('french', :terme)
                    OR e.titre ILIKE :termeLike
                    OR c.nom ILIKE :termeLike
                )
                """);
            countParams.put("terme", request.getTerme().trim());
            countParams.put("termeLike", "%" + request.getTerme().trim() + "%");
        }

        if (request.getVilleId() != null) {
            countSql.append("AND v.id = :villeId\n");
            countParams.put("villeId", request.getVilleId());
        } else if (request.getPaysId() != null) {
            countSql.append("AND p.id = :paysId\n");
            countParams.put("paysId", request.getPaysId());
        }

        if (request.getDisponible() != null) {
            countSql.append("AND e.disponible = :disponible\n");
            countParams.put("disponible", request.getDisponible());
        }

        if (request.getScoreMin() != null) {
            countSql.append("AND e.score_global >= :scoreMin\n");
            countParams.put("scoreMin", request.getScoreMin());
        }

        // GROUP BY
        countSql.append("""
            GROUP BY e.id, comp_stats.nombre_competences, comp_stats.niveau_max,
                     comp_stats.experience_max, comp_stats.thm_min, comp_stats.thm_max,
                     comp_stats.projets_total, badge_stats.nombre_badges,
                     badge_stats.niveau_badge_max, reseau_stats.nombre_followers
            """);

        // Appliquer les filtres HAVING
        List<String> havingClauses = new ArrayList<>();

        if (request.getAnneesExperienceMin() != null) {
            havingClauses.add("COALESCE(comp_stats.experience_max, 0) >= :experienceMin");
            countParams.put("experienceMin", request.getAnneesExperienceMin());
        }

        if (request.getNiveauMaitriseMin() != null) {
            havingClauses.add("COALESCE(comp_stats.niveau_max, 0) >= :niveauMin");
            countParams.put("niveauMin", request.getNiveauMaitriseMin());
        }

        if (request.getNombreProjetsMin() != null) {
            havingClauses.add("COALESCE(comp_stats.projets_total, 0) >= :projetsMin");
            countParams.put("projetsMin", request.getNombreProjetsMin());
        }

        if (request.getThmMin() != null) {
            havingClauses.add("COALESCE(comp_stats.thm_max, 0) >= :thmMin");
            countParams.put("thmMin", request.getThmMin());
        }

        if (request.getThmMax() != null) {
            havingClauses.add("(COALESCE(comp_stats.thm_min, 0) <= :thmMax OR comp_stats.thm_min IS NULL)");
            countParams.put("thmMax", request.getThmMax());
        }

        if (request.getNombreBadgesMin() != null) {
            havingClauses.add("COALESCE(badge_stats.nombre_badges, 0) >= :badgesMin");
            countParams.put("badgesMin", request.getNombreBadgesMin());
        }

        if (Boolean.TRUE.equals(request.getCertifieUniquement())) {
            havingClauses.add("COALESCE(badge_stats.nombre_badges, 0) > 0");
        }

        if (request.getNombreFollowersMin() != null) {
            havingClauses.add("COALESCE(reseau_stats.nombre_followers, 0) >= :followersMin");
            countParams.put("followersMin", request.getNombreFollowersMin());
        }

        if (!havingClauses.isEmpty()) {
            countSql.append("HAVING ").append(String.join(" AND ", havingClauses)).append("\n");
        }

        // Fermer la sous-requête
        countSql.append(") AS subquery");

        Query countQuery = entityManager.createNativeQuery(countSql.toString());
        countParams.forEach(countQuery::setParameter);

        return ((Number) countQuery.getSingleResult()).longValue();
    }

    /**
     * Charge les facettes par pays
     */
    private List<FacetteItem> chargerFacettesPays() {
        String sql = """
            SELECT p.id, p.nom, COUNT(DISTINCT e.id)
            FROM expertises e
            JOIN villes v ON e.ville_id = v.id
            JOIN pays p ON v.pays_id = p.id
            WHERE e.publiee = true
            GROUP BY p.id, p.nom
            ORDER BY COUNT(DISTINCT e.id) DESC
            LIMIT 10
            """;

        Query query = entityManager.createNativeQuery(sql);

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();

        return rows.stream()
                .map(row -> new FacetteItem(
                        row[0].toString(),
                        (String) row[1],
                        ((Number) row[2]).longValue()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Charge les facettes par ville (optionnellement filtré par pays)
     */
    private List<FacetteItem> chargerFacettesVilles(Long paysId) {
        StringBuilder sql = new StringBuilder();
        sql.append("""
            SELECT v.id, v.nom, COUNT(DISTINCT e.id)
            FROM expertises e
            JOIN villes v ON e.ville_id = v.id
            WHERE e.publiee = true
            """);

        if (paysId != null) {
            sql.append("AND v.pays_id = :paysId\n");
        }

        sql.append("""
            GROUP BY v.id, v.nom
            ORDER BY COUNT(DISTINCT e.id) DESC
            LIMIT 15
            """);

        Query query = entityManager.createNativeQuery(sql.toString());
        if (paysId != null) {
            query.setParameter("paysId", paysId);
        }

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();

        return rows.stream()
                .map(row -> new FacetteItem(
                        row[0].toString(),
                        (String) row[1],
                        ((Number) row[2]).longValue()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Charge les facettes par niveau de badge
     */
    private List<FacetteItem> chargerFacettesBadges() {
        String sql = """
            SELECT niveau_certification, COUNT(DISTINCT utilisateur_id)
            FROM badges_competence
            WHERE est_actif = true
            GROUP BY niveau_certification
            ORDER BY
                CASE niveau_certification
                    WHEN 'PLATINE' THEN 1
                    WHEN 'OR' THEN 2
                    WHEN 'ARGENT' THEN 3
                    WHEN 'BRONZE' THEN 4
                END
            """;

        Query query = entityManager.createNativeQuery(sql);

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();

        return rows.stream()
                .map(row -> new FacetteItem(
                        row[0].toString(),
                        getLibelleNiveauBadge(row[0].toString()),
                        ((Number) row[1]).longValue()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Charge les statistiques globales
     */
    private StatistiquesRecherche chargerStatistiques() {
        String sql = """
            SELECT
                COUNT(DISTINCT CASE WHEN e.disponible = true THEN e.id END) as disponibles,
                COUNT(DISTINCT CASE WHEN b.id IS NOT NULL THEN e.id END) as certifies,
                COALESCE(AVG(c.thm) FILTER (WHERE c.thm > 0), 0) as thm_moyen,
                COALESCE(AVG(c.annees_experience), 0) as experience_moyenne,
                COALESCE(AVG(e.score_global), 0) as score_moyen
            FROM expertises e
            LEFT JOIN competences c ON c.utilisateur_id = e.utilisateur_id
            LEFT JOIN badges_competence b ON b.utilisateur_id = e.utilisateur_id AND b.est_actif = true
            WHERE e.publiee = true
            """;

        Query query = entityManager.createNativeQuery(sql);
        Object[] row = (Object[]) query.getSingleResult();

        StatistiquesRecherche stats = new StatistiquesRecherche();
        stats.setTotalExpertsDisponibles(((Number) row[0]).intValue());
        stats.setTotalExpertsCertifies(((Number) row[1]).intValue());
        stats.setThmMoyen(((Number) row[2]).intValue());
        stats.setExperienceMoyenne(((Number) row[3]).intValue());
        stats.setScoreMoyen(((Number) row[4]).doubleValue());
        return stats;
    }

    /**
     * Convertit un niveau de badge en ordinal pour comparaison
     */
    private int getNiveauOrdinal(String niveau) {
        return switch (niveau.toUpperCase()) {
            case "PLATINE" -> 4;
            case "OR" -> 3;
            case "ARGENT" -> 2;
            case "BRONZE" -> 1;
            default -> 0;
        };
    }

    /**
     * Retourne le libellé français d'un niveau de badge
     */
    private String getLibelleNiveauBadge(String niveau) {
        return switch (niveau.toUpperCase()) {
            case "PLATINE" -> "Platine";
            case "OR" -> "Or";
            case "ARGENT" -> "Argent";
            case "BRONZE" -> "Bronze";
            default -> niveau;
        };
    }
}
