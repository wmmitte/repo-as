package com.intermediation.gateway;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.RouterFunctions;
import org.springframework.web.reactive.function.server.ServerResponse;
import reactor.core.publisher.Mono;

import static org.springframework.web.reactive.function.server.RequestPredicates.GET;

/**
 * Configuration WebFlux pour gérer le routing SPA (Single Page Application)
 * Redirige toutes les routes non-API vers index.html pour que React Router puisse les gérer
 */
@Configuration
public class SpaRoutingController {

    /**
     * Configure les routes pour servir le frontend React
     * Toutes les routes non-API servent index.html pour permettre à React Router de fonctionner
     */
    @Bean
    public RouterFunction<ServerResponse> spaRouter() {
        return RouterFunctions
            .route(GET("/mon-compte"), request -> serveIndexHtml())
            .andRoute(GET("/explorer"), request -> serveIndexHtml())
            .andRoute(GET("/rechercher"), request -> serveIndexHtml())
            .andRoute(GET("/reseau"), request -> serveIndexHtml())
            .andRoute(GET("/profil"), request -> serveIndexHtml())
            .andRoute(GET("/profil/**"), request -> serveIndexHtml())
            .andRoute(GET("/expertise"), request -> serveIndexHtml())
            .andRoute(GET("/expertise/**"), request -> serveIndexHtml())
            .andRoute(GET("/expertise-profil/**"), request -> serveIndexHtml())
            .andRoute(GET("/competences"), request -> serveIndexHtml())
            .andRoute(GET("/competences/**"), request -> serveIndexHtml())
            .andRoute(GET("/projets"), request -> serveIndexHtml())
            .andRoute(GET("/projets/**"), request -> serveIndexHtml())
            .andRoute(GET("/plus"), request -> serveIndexHtml())
            .andRoute(GET("/expert/**"), request -> serveIndexHtml())
            // Routes pour le système de reconnaissance de compétences
            .andRoute(GET("/reconnaissance/**"), request -> serveIndexHtml())
            .andRoute(GET("/demandes-reconnaissance"), request -> serveIndexHtml())
            .andRoute(GET("/demandes-reconnaissance/**"), request -> serveIndexHtml())
            .andRoute(GET("/traitant/**"), request -> serveIndexHtml())
            // Routes pour la vérification d'email
            .andRoute(GET("/verifier-email"), request -> serveIndexHtml())
            .andRoute(GET("/confirmation-inscription"), request -> serveIndexHtml());
    }

    /**
     * Sert le fichier index.html pour les routes SPA
     */
    private Mono<ServerResponse> serveIndexHtml() {
        return ServerResponse.ok()
            .contentType(MediaType.TEXT_HTML)
            .bodyValue(new ClassPathResource("static/index.html"));
    }
}
