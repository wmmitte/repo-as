package com.intermediation.expertise.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Gestionnaire global des exceptions pour retourner des messages d'erreur clairs
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Gère les erreurs de validation (@Valid)
     * Retourne un message clair avec tous les champs en erreur
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {

        // Collecter tous les messages d'erreur de validation
        Map<String, String> erreurs = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            erreurs.put(fieldName, errorMessage);
        });

        // Créer un message global lisible
        String messageGlobal = erreurs.values().stream()
            .collect(Collectors.joining(". "));

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Erreur de validation : " + messageGlobal);
        response.put("erreurs", erreurs);

        logger.warn("Erreur de validation : {}", messageGlobal);

        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(response);
    }

    /**
     * Gère les exceptions d'autorisation Spring Security
     * Retourne 403 FORBIDDEN au lieu de 400 BAD_REQUEST
     */
    @ExceptionHandler({AuthorizationDeniedException.class, AccessDeniedException.class})
    public ResponseEntity<Map<String, String>> handleAccessDeniedException(Exception ex) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Accès refusé : vous n'avez pas les permissions nécessaires");

        logger.warn("Accès refusé : {}", ex.getMessage());

        return ResponseEntity
            .status(HttpStatus.FORBIDDEN)
            .body(response);
    }

    /**
     * Gère les autres exceptions runtime (sauf les exceptions de sécurité)
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        // Ne pas capturer les exceptions de sécurité ici, elles sont gérées par handleAccessDeniedException
        if (ex instanceof AuthorizationDeniedException || ex instanceof AccessDeniedException) {
            return handleAccessDeniedException(ex);
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", ex.getMessage());

        logger.error("Erreur runtime : {}", ex.getMessage(), ex);

        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(response);
    }
}
