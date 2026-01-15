package com.intermediation.auth.config;

import com.intermediation.auth.model.TypePersonne;
import com.intermediation.auth.model.Utilisateur;
import com.intermediation.auth.repository.UtilisateurRepository;
import com.intermediation.auth.service.KeycloakService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * Initialisation des utilisateurs système au démarrage de l'application
 *
 * Ce runner s'exécute automatiquement après le démarrage et crée les utilisateurs
 * système nécessaires pour gérer la plateforme (root, manager système, RH système).
 *
 * Les utilisateurs sont créés :
 * 1. Dans la base de données auth_db
 * 2. Dans Keycloak avec leurs rôles et groupes
 *
 * Le processus est idempotent : si un utilisateur existe déjà, il n'est pas recréé.
 */
@Component
public class InitialisationUtilisateursSystemeRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(InitialisationUtilisateursSystemeRunner.class);

    private final UtilisateurRepository utilisateurRepository;
    private final KeycloakService keycloakService;

    public InitialisationUtilisateursSystemeRunner(
            UtilisateurRepository utilisateurRepository,
            KeycloakService keycloakService) {
        this.utilisateurRepository = utilisateurRepository;
        this.keycloakService = keycloakService;
    }

    @Override
    public void run(String... args) throws Exception {
        log.info("🔧 ========================================");
        log.info("🔧 Initialisation des utilisateurs système");
        log.info("🔧 ========================================");

        // Définition des utilisateurs système
        List<ConfigUtilisateurSysteme> utilisateursSysteme = Arrays.asList(
            // 1. Utilisateur root (super administrateur)
            new ConfigUtilisateurSysteme(
                "root@pitm.com",
                "pitm@2026!!",
                "PITM",
                "root",
                Arrays.asList("manager", "rh", "admin"),
                Arrays.asList("Manager", "Rh", "Administrateur")
            ),

            // 2. Manager système
            new ConfigUtilisateurSysteme(
                "msys@pitm.com",
                "pitm@2026!",
                "PITM",
                "Msys",
                Arrays.asList("manager"),
                Arrays.asList("Manager")
            ),

            // 3. RH système
            new ConfigUtilisateurSysteme(
                "rsys@pitm.com",
                "pitm@2026!",
                "PITM",
                "rsys",
                Arrays.asList("rh"),
                Arrays.asList("Rh")
            )
        );

        int creesBdd = 0;
        int creesKeycloak = 0;
        int existants = 0;
        int erreurs = 0;

        for (ConfigUtilisateurSysteme config : utilisateursSysteme) {
            try {
                log.info("📋 Traitement de l'utilisateur: {}", config.email);

                // Étape 1 : Vérifier et créer dans la BDD si nécessaire
                Utilisateur utilisateur = utilisateurRepository.findByEmail(config.email)
                    .orElse(null);

                if (utilisateur == null) {
                    // Créer dans la BDD
                    utilisateur = creerUtilisateurBdd(config);
                    log.info("✅ Utilisateur créé dans la BDD: {}", config.email);
                    creesBdd++;
                } else {
                    log.info("ℹ️  Utilisateur existe déjà dans la BDD: {}", config.email);

                    // S'assurer que le flag système est bien mis
                    if (!Boolean.TRUE.equals(utilisateur.getEstUtilisateurSysteme())) {
                        utilisateur.setEstUtilisateurSysteme(true);
                        utilisateurRepository.save(utilisateur);
                        log.info("🔄 Flag 'estUtilisateurSysteme' mis à jour pour: {}", config.email);
                    }
                }

                // Étape 2 : Vérifier et créer dans Keycloak si nécessaire
                String keycloakId = keycloakService.getUserIdByEmail(config.email);

                if (keycloakId == null) {
                    // Créer dans Keycloak
                    keycloakId = keycloakService.createUser(
                        config.email,
                        config.prenom,
                        config.nom,
                        config.motDePasse
                    );

                    if (keycloakId != null) {
                        log.info("✅ Utilisateur créé dans Keycloak: {} (ID: {})", config.email, keycloakId);
                        creesKeycloak++;

                        // Attribuer les rôles
                        boolean rolesAttribues = keycloakService.attribuerRoles(keycloakId, config.roles);
                        if (rolesAttribues) {
                            log.info("✅ Rôles attribués: {}", config.roles);
                        } else {
                            log.warn("⚠️  Échec de l'attribution des rôles pour: {}", config.email);
                        }

                        // Attribuer les groupes
                        boolean groupesAttribues = keycloakService.attribuerGroupes(keycloakId, config.groupes);
                        if (groupesAttribues) {
                            log.info("✅ Groupes attribués: {}", config.groupes);
                        } else {
                            log.warn("⚠️  Échec de l'attribution des groupes pour: {}", config.email);
                        }

                        // Marquer l'email comme vérifié dans Keycloak
                        keycloakService.mettreAJourEmailVerifie(config.email, true);

                        // Retirer le groupe "Expert" ajouté par défaut (utilisateurs système ne doivent pas être experts)
                        boolean expertRetire = keycloakService.retirerGroupe(keycloakId, "Expert");
                        if (expertRetire) {
                            log.info("✅ Groupe 'Expert' retiré (utilisateur système)");
                        } else {
                            log.warn("⚠️  Le groupe 'Expert' n'a pas pu être retiré");
                        }

                    } else {
                        log.error("❌ Échec de la création dans Keycloak pour: {}", config.email);
                        erreurs++;
                    }
                } else {
                    log.info("ℹ️  Utilisateur existe déjà dans Keycloak: {} (ID: {})", config.email, keycloakId);
                    existants++;

                    // Même pour les utilisateurs existants, s'assurer que le groupe "Expert" est retiré
                    boolean expertRetire = keycloakService.retirerGroupe(keycloakId, "Expert");
                    if (expertRetire) {
                        log.info("✅ Groupe 'Expert' retiré (utilisateur système existant)");
                    }
                }

                log.info("✅ Traitement terminé pour: {}", config.email);
                log.info("---");

            } catch (Exception e) {
                log.error("❌ Erreur lors du traitement de l'utilisateur {}: {}",
                    config.email, e.getMessage(), e);
                erreurs++;
            }
        }

        // Résumé
        log.info("🎉 ========================================");
        log.info("🎉 Initialisation terminée");
        log.info("🎉 ========================================");
        log.info("📊 Statistiques:");
        log.info("   - Créés dans BDD       : {}", creesBdd);
        log.info("   - Créés dans Keycloak  : {}", creesKeycloak);
        log.info("   - Déjà existants       : {}", existants);
        log.info("   - Erreurs              : {}", erreurs);
        log.info("🎉 ========================================");
    }

    /**
     * Créer un utilisateur système dans la base de données
     */
    private Utilisateur creerUtilisateurBdd(ConfigUtilisateurSysteme config) {
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setEmail(config.email);
        utilisateur.setNom(config.nom);
        utilisateur.setPrenom(config.prenom);
        utilisateur.setTypePersonne(TypePersonne.PHYSIQUE);

        // Utilisateur système : profil complet et email vérifié par défaut
        utilisateur.setEmailVerifie(true);
        utilisateur.setProfilComplet(true);
        utilisateur.setActif(true);
        utilisateur.setEstUtilisateurSysteme(true);

        // Pas de mot de passe hash local (authentification via Keycloak uniquement)
        utilisateur.setMotDePasseHash(null);

        // Dates
        utilisateur.setDateCreation(LocalDateTime.now());
        utilisateur.setDerniereConnexion(null);

        return utilisateurRepository.save(utilisateur);
    }

    /**
     * Configuration d'un utilisateur système
     */
    private static class ConfigUtilisateurSysteme {
        final String email;
        final String motDePasse;
        final String nom;
        final String prenom;
        final List<String> roles;
        final List<String> groupes;

        public ConfigUtilisateurSysteme(
                String email,
                String motDePasse,
                String nom,
                String prenom,
                List<String> roles,
                List<String> groupes) {
            this.email = email;
            this.motDePasse = motDePasse;
            this.nom = nom;
            this.prenom = prenom;
            this.roles = roles;
            this.groupes = groupes;
        }
    }
}
