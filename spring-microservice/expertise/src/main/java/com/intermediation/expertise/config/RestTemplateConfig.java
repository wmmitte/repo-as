package com.intermediation.expertise.config;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Configuration du RestTemplate avec support du load balancing via Eureka
 */
@Configuration
public class RestTemplateConfig {

    /**
     * Bean RestTemplate avec @LoadBalanced pour la découverte de services via Eureka
     * Permet d'appeler les autres microservices en utilisant leur nom (ex: http://auth/...)
     */
    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
