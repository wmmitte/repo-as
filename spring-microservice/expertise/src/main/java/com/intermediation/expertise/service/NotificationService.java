package com.intermediation.expertise.service;

import com.intermediation.expertise.model.DemandeContact;
import com.intermediation.expertise.model.DemandeContact.TypeReference;
import com.intermediation.expertise.model.LivrableTache;
import com.intermediation.expertise.model.Projet;
import com.intermediation.expertise.model.TacheProjet;
import com.intermediation.expertise.repository.DemandeContactRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Service pour envoyer des notifications système aux utilisateurs.
 * Ces notifications apparaissent dans la boîte de messages.
 */
@Service
@Transactional
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private static final String SYSTEM_USER_ID = "00000000-0000-0000-0000-000000000000";

    private final DemandeContactRepository demandeContactRepository;

    public NotificationService(DemandeContactRepository demandeContactRepository) {
        this.demandeContactRepository = demandeContactRepository;
    }

    /**
     * Notifier un expert qu'il a été assigné à des tâches.
     */
    public void notifierAssignationTaches(UUID expertId, Projet projet, List<TacheProjet> taches) {
        log.info("Notification d'assignation de {} tâche(s) à l'expert {}", taches.size(), expertId);

        String nomsTaches = taches.stream()
                .map(TacheProjet::getNom)
                .reduce((a, b) -> a + ", " + b)
                .orElse("");

        String objet = String.format("Nouvelles tâches assignées - %s", projet.getNom());

        String message = String.format(
            "Bonjour,\n\n" +
            "Vous avez été assigné à %d nouvelle(s) tâche(s) sur le projet \"%s\" :\n\n" +
            "• %s\n\n" +
            "Vous pouvez consulter les détails et commencer à travailler sur ces tâches dès maintenant.\n\n" +
            "Bonne continuation !",
            taches.size(),
            projet.getNom(),
            nomsTaches.replace(", ", "\n• ")
        );

        String lien = String.format("/projets/%d", projet.getId());

        envoyerNotification(expertId.toString(), objet, message, TypeReference.PROJET, projet.getId(), lien);
    }

    /**
     * Notifier le propriétaire qu'un livrable a été soumis.
     */
    public void notifierSoumissionLivrable(UUID proprietaireId, LivrableTache livrable, String expertNom) {
        TacheProjet tache = livrable.getTache();
        Projet projet = tache.getProjet();

        log.info("Notification de soumission du livrable {} au propriétaire {}", livrable.getId(), proprietaireId);

        String objet = String.format("Livrable soumis - %s", livrable.getNom());

        String message = String.format(
            "Bonjour,\n\n" +
            "L'expert %s a soumis le livrable \"%s\" pour la tâche \"%s\" du projet \"%s\".\n\n" +
            "Veuillez examiner ce livrable et valider ou demander des modifications si nécessaire.\n\n" +
            "Cordialement",
            expertNom != null ? expertNom : "Un expert",
            livrable.getNom(),
            tache.getNom(),
            projet.getNom()
        );

        String lien = String.format("/projets/%d/taches/%d", projet.getId(), tache.getId());

        envoyerNotification(proprietaireId.toString(), objet, message, TypeReference.LIVRABLE, livrable.getId(), lien);
    }

    /**
     * Notifier l'expert qu'un livrable a été validé.
     */
    public void notifierValidationLivrable(UUID expertId, LivrableTache livrable) {
        TacheProjet tache = livrable.getTache();
        Projet projet = tache.getProjet();

        log.info("Notification de validation du livrable {} à l'expert {}", livrable.getId(), expertId);

        String objet = String.format("Livrable validé - %s", livrable.getNom());

        String message = String.format(
            "Bonjour,\n\n" +
            "Bonne nouvelle ! Votre livrable \"%s\" pour la tâche \"%s\" a été validé.\n\n" +
            "%s\n\n" +
            "Félicitations pour ce travail accompli !",
            livrable.getNom(),
            tache.getNom(),
            livrable.getCommentaireValidation() != null ?
                "Commentaire du client : " + livrable.getCommentaireValidation() :
                ""
        );

        String lien = String.format("/projets/%d/taches/%d", projet.getId(), tache.getId());

        envoyerNotification(expertId.toString(), objet, message, TypeReference.LIVRABLE, livrable.getId(), lien);
    }

    /**
     * Notifier l'expert qu'un livrable a été refusé.
     */
    public void notifierRejetLivrable(UUID expertId, LivrableTache livrable) {
        TacheProjet tache = livrable.getTache();
        Projet projet = tache.getProjet();

        log.info("Notification de rejet du livrable {} à l'expert {}", livrable.getId(), expertId);

        String objet = String.format("Livrable à réviser - %s", livrable.getNom());

        String message = String.format(
            "Bonjour,\n\n" +
            "Votre livrable \"%s\" pour la tâche \"%s\" nécessite des modifications.\n\n" +
            "%s\n\n" +
            "Veuillez prendre en compte les retours et soumettre une nouvelle version.\n\n" +
            "Cordialement",
            livrable.getNom(),
            tache.getNom(),
            livrable.getCommentaireValidation() != null ?
                "Commentaire du client : " + livrable.getCommentaireValidation() :
                "Aucun commentaire fourni."
        );

        String lien = String.format("/projets/%d/taches/%d", projet.getId(), tache.getId());

        envoyerNotification(expertId.toString(), objet, message, TypeReference.LIVRABLE, livrable.getId(), lien);
    }

    /**
     * Notifier l'expert qu'il a été retiré d'une tâche.
     */
    public void notifierRetraitTache(UUID expertId, TacheProjet tache, String motif) {
        Projet projet = tache.getProjet();

        log.info("Notification de retrait de tâche {} à l'expert {}", tache.getId(), expertId);

        String objet = String.format("Retrait de tâche - %s", tache.getNom());

        String message = String.format(
            "Bonjour,\n\n" +
            "Vous avez été retiré de la tâche \"%s\" du projet \"%s\".\n\n" +
            "%s\n\n" +
            "La tâche est maintenant disponible pour d'autres experts.\n\n" +
            "Cordialement",
            tache.getNom(),
            projet.getNom(),
            motif != null && !motif.trim().isEmpty() ?
                "Motif : " + motif :
                "Aucun motif spécifié."
        );

        String lien = String.format("/projets/%d", projet.getId());

        envoyerNotification(expertId.toString(), objet, message, TypeReference.TACHE, tache.getId(), lien);
    }

    /**
     * Notifier l'expert que sa candidature a été acceptée.
     */
    public void notifierCandidatureAcceptee(UUID expertId, Projet projet, int nombreTaches) {
        log.info("Notification de candidature acceptée à l'expert {} pour le projet {}", expertId, projet.getId());

        String objet = String.format("Candidature acceptée - %s", projet.getNom());

        String message = String.format(
            "Bonjour,\n\n" +
            "Félicitations ! Votre candidature pour le projet \"%s\" a été acceptée.\n\n" +
            "%s\n\n" +
            "Vous pouvez dès maintenant consulter vos tâches et commencer à travailler.\n\n" +
            "Bonne continuation !",
            projet.getNom(),
            nombreTaches > 0 ?
                String.format("Vous avez été assigné à %d tâche(s).", nombreTaches) :
                "Aucune tâche n'a encore été assignée."
        );

        String lien = String.format("/projets/%d", projet.getId());

        envoyerNotification(expertId.toString(), objet, message, TypeReference.PROJET, projet.getId(), lien);
    }

    /**
     * Méthode interne pour envoyer une notification système.
     */
    private void envoyerNotification(String destinataireId, String objet, String message,
                                      TypeReference typeReference, Long referenceId, String lienReference) {
        DemandeContact notification = new DemandeContact();
        notification.setExpediteurId(SYSTEM_USER_ID);
        notification.setDestinataireId(destinataireId);
        notification.setObjet(objet);
        notification.setMessage(message);
        notification.setTypeReference(typeReference);
        notification.setReferenceId(referenceId);
        notification.setLienReference(lienReference);
        notification.setEstNotificationSysteme(true);
        notification.setStatut(DemandeContact.StatutDemande.EN_ATTENTE);

        demandeContactRepository.save(notification);
        log.info("Notification envoyée à {} : {}", destinataireId, objet);
    }
}
