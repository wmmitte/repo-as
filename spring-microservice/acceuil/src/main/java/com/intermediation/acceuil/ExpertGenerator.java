package com.intermediation.acceuil;

import java.util.ArrayList;
import java.util.List;

import com.intermediation.acceuil.model.Expert;

/**
 * Utilitaire pour générer des données d'experts simulées.
 * Cette classe centralise la logique de génération pour être utilisée
 * à la fois par le worker BPMN et le controller REST.
 */
public class ExpertGenerator {
  
  /**
   * Charge un lot d'experts avec des données fictives réalistes.
   * À terme, cette méthode devra faire un appel API pour obtenir les vraies données.
   *
   * @param afterCursor position de départ (index sous forme de chaîne)
   * @param batchSize nombre d'experts à retourner
   * @return liste d'experts simulés
   */
  public static List<Expert> loadExperts(String afterCursor, int batchSize) {
    int start = 0;
    try { start = afterCursor != null ? Integer.parseInt(afterCursor) : 0; } catch (Exception ignored) {}
    
    // Données de référence pour la génération d'experts réalistes
    String[] noms = {"Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Durand", "Leroy", "Moreau", "Simon", "Laurent", "Lefebvre", "Michel", "Garcia", "David", "Bertrand", "Roux", "Vincent", "Fournier"};
    String[] prenoms = {"Sophie", "Pierre", "Marie", "Lucas", "Emma", "Antoine", "Léa", "Thomas", "Chloé", "Nicolas", "Julie", "Alexandre", "Camille", "Maxime", "Sarah", "Julien", "Laura", "Kevin", "Manon", "Romain"};
    String[] titres = {
      "Développeuse Full Stack Senior",
      "Architecte Solution Cloud",
      "Data Scientist Expert",
      "Lead Developer Java/Spring",
      "Expert DevOps & Infrastructure",
      "Consultant Cybersécurité",
      "Tech Lead React/Node.js",
      "Ingénieur ML/IA Senior",
      "Architecte Microservices",
      "Expert Python & Data Engineering"
    };
    String[][] competencesParProfil = {
      {"React", "Node.js", "TypeScript", "PostgreSQL", "MongoDB"},
      {"AWS", "Azure", "Kubernetes", "Terraform", "Docker"},
      {"Python", "TensorFlow", "Spark", "SQL", "R"},
      {"Java", "Spring Boot", "Microservices", "Kafka", "PostgreSQL"},
      {"Kubernetes", "Jenkins", "GitLab CI", "Ansible", "Prometheus"},
      {"Pentest", "SIEM", "ISO 27001", "Firewall", "Cryptographie"},
      {"React", "Vue.js", "Node.js", "Express", "GraphQL"},
      {"PyTorch", "Scikit-learn", "Computer Vision", "NLP", "MLOps"},
      {"Java", "Spring Cloud", "RabbitMQ", "Redis", "Elasticsearch"},
      {"Python", "Airflow", "Databricks", "Snowflake", "dbt"}
    };
    String[] villes = {"Paris, France", "Lyon, France", "Toulouse, France", "Marseille, France", "Bordeaux, France", "Nantes, France", "Lille, France", "Rennes, France", "Strasbourg, France", "Montpellier, France"};
    String[] descriptions = {
      "Passionnée par le développement web moderne et les architectures scalables. Spécialisée dans React, Node.js et les micro-services.",
      "Expert en transformation cloud et architectures distribuées. Accompagne les entreprises dans leur migration vers le cloud.",
      "Spécialiste en intelligence artificielle et machine learning. Expertise en analyse prédictive et deep learning.",
      "Lead technique avec 10+ ans d'expérience sur l'écosystème Java/Spring. Expert en conception d'architectures robustes.",
      "Ingénieur DevOps passionné par l'automatisation et l'optimisation des pipelines CI/CD. Expert Kubernetes et cloud native.",
      "Consultant en cybersécurité avec certifications CISSP et CEH. Spécialiste en pentest et sécurisation d'infrastructures.",
      "Développeur full-stack passionné par les technologies modernes. Expertise en React, Vue.js et architectures serverless.",
      "Expert en IA et machine learning. Spécialisé en computer vision, NLP et déploiement de modèles en production.",
      "Architecte logiciel avec forte expertise microservices. Conception de systèmes distribués hautement disponibles.",
      "Data engineer passionné par la construction de pipelines de données scalables et l'optimisation des performances."
    };

    List<Expert> pile = new ArrayList<>();
    for (int i = 0; i < batchSize; i++) {
      int idNum = start + i + 1;
      int profilIndex = (idNum - 1) % titres.length;
      
      Expert expert = new Expert();
      expert.setId("exp-" + idNum);
      expert.setNom(noms[idNum % noms.length]);
      expert.setPrenom(prenoms[idNum % prenoms.length]);
      expert.setTitre(titres[profilIndex]);
      expert.setPhotoUrl("https://i.pravatar.cc/200?img=" + (idNum % 70));
      expert.setRating(4.0 + (idNum % 10) * 0.1);
      expert.setNombreProjets(20 + (idNum % 80));
      expert.setDescription(descriptions[profilIndex]);
      
      // Compétences avec 2 favorites
      List<Expert.Competence> competences = new ArrayList<>();
      String[] competencesExpert = competencesParProfil[profilIndex];
      for (int j = 0; j < competencesExpert.length; j++) {
        competences.add(new Expert.Competence(competencesExpert[j], j < 2));
      }
      expert.setCompetences(competences);
      
      expert.setExperienceAnnees(3 + (idNum % 12));
      int tjmBase = 400 + (idNum % 5) * 100;
      expert.setTjmMin(tjmBase);
      expert.setTjmMax(tjmBase + 200);
      expert.setLocalisation(villes[idNum % villes.length]);
      expert.setDisponible(idNum % 3 != 0);
      
      pile.add(expert);
    }
    return pile;
  }
}
