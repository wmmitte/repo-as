package com.intermediation.auth.repository;

import com.intermediation.auth.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, String> {

    Optional<Utilisateur> findByEmail(String email);

    Optional<Utilisateur> findByKeycloakId(String keycloakId);

    Optional<Utilisateur> findByGoogleId(String googleId);

    Optional<Utilisateur> findByFacebookId(String facebookId);

    Optional<Utilisateur> findByAppleId(String appleId);

    boolean existsByEmail(String email);

    Optional<Utilisateur> findByTokenVerificationEmail(String token);

    /**
     * Récupère tous les utilisateurs système
     * @param estUtilisateurSysteme true pour les utilisateurs système, false pour les utilisateurs normaux
     * @return liste des utilisateurs correspondants
     */
    List<Utilisateur> findAllByEstUtilisateurSysteme(Boolean estUtilisateurSysteme);
}
