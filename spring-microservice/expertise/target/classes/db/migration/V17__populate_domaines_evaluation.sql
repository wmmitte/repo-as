-- Migration V17: Population des données de référence pour les domaines, critères et méthodes d'évaluation

-- ============================================================================
-- 1. INSERTION: domaines_competence (4 domaines)
-- ============================================================================

INSERT INTO domaines_competence (code, libelle, description, ordre_affichage) VALUES
('SAVOIR', 'Savoir (connaissances)', 'Connaissances théoriques, normatives, réglementaires, conceptuelles', 1),
('SAVOIR_FAIRE', 'Savoir-faire (aptitudes techniques)', 'Capacité à appliquer un savoir dans une situation donnée', 2),
('SAVOIR_ETRE', 'Savoir-être (comportements professionnels)', 'Attitudes, postures, valeurs observables dans un contexte professionnel', 3),
('SAVOIR_AGIR', 'Savoir-agir (compétence intégrée)', 'Capacité à mobiliser savoir, savoir-faire et savoir-être pour résoudre une situation complexe', 4);

-- ============================================================================
-- 2. INSERTION: criteres_evaluation (25 critères)
-- ============================================================================

-- Critères pour SAVOIR (5 critères)
INSERT INTO criteres_evaluation (domaine_id, code, libelle, description, ordre_affichage)
SELECT id, 'EXACTITUDE', 'Exactitude', 'Les informations sont correctes et conformes aux standards', 1
FROM domaines_competence WHERE code = 'SAVOIR';

INSERT INTO criteres_evaluation (domaine_id, code, libelle, description, ordre_affichage)
SELECT id, 'EXHAUSTIVITE', 'Exhaustivité', 'Le périmètre attendu est bien couvert', 2
FROM domaines_competence WHERE code = 'SAVOIR';

INSERT INTO criteres_evaluation (domaine_id, code, libelle, description, ordre_affichage)
SELECT id, 'COMPREHENSION', 'Compréhension', 'Capacité à expliquer avec ses propres mots', 3
FROM domaines_competence WHERE code = 'SAVOIR';

INSERT INTO criteres_evaluation (domaine_id, code, libelle, description, ordre_affichage)
SELECT id, 'STRUCTURATION', 'Structuration', 'Organisation logique des connaissances', 4
FROM domaines_competence WHERE code = 'SAVOIR';

INSERT INTO criteres_evaluation (domaine_id, code, libelle, description, ordre_affichage)
SELECT id, 'ACTUALISATION', 'Actualisation', 'Prise en compte des normes ou évolutions récentes', 5
FROM domaines_competence WHERE code = 'SAVOIR';

-- Critères pour SAVOIR_FAIRE (5 critères)
INSERT INTO criteres_evaluation (domaine_id, code, libelle, description, ordre_affichage)
SELECT id, 'MAITRISE_TECHNIQUE', 'Maîtrise technique', 'Justesse des gestes, méthodes, outils', 1
FROM domaines_competence WHERE code = 'SAVOIR_FAIRE';

INSERT INTO criteres_evaluation (domaine_id, code, libelle, description, ordre_affichage)
SELECT id, 'CONFORMITE', 'Conformité', 'Respect des procédures et standards', 2
FROM domaines_competence WHERE code = 'SAVOIR_FAIRE';

INSERT INTO criteres_evaluation (domaine_id, code, libelle, description, ordre_affichage)
SELECT id, 'EFFICACITE', 'Efficacité', 'Résultat obtenu conforme aux attentes', 3
FROM domaines_competence WHERE code = 'SAVOIR_FAIRE';

INSERT INTO criteres_evaluation (domaine_id, code, libelle, description, ordre_affichage)
SELECT id, 'AUTONOMIE', 'Autonomie', 'Capacité à réaliser sans assistance', 4
FROM domaines_competence WHERE code = 'SAVOIR_FAIRE';

INSERT INTO criteres_evaluation (domaine_id, code, libelle, description, ordre_affichage)
SELECT id, 'REPRODUCTIBILITE', 'Reproductibilité', 'Résultat stable sur plusieurs essais', 5
FROM domaines_competence WHERE code = 'SAVOIR_FAIRE';

-- Critères pour SAVOIR_ETRE (5 critères)
INSERT INTO criteres_evaluation (domaine_id, code, libelle, description, ordre_affichage)
SELECT id, 'POSTURE_PRO', 'Posture professionnelle', 'Attitude adaptée au contexte', 1
FROM domaines_competence WHERE code = 'SAVOIR_ETRE';

INSERT INTO criteres_evaluation (domaine_id, code, libelle, description, ordre_affichage)
SELECT id, 'RESPECT_REGLES', 'Respect des règles', 'Éthique, déontologie, discipline', 2
FROM domaines_competence WHERE code = 'SAVOIR_ETRE';

INSERT INTO criteres_evaluation (domaine_id, code, libelle, description, ordre_affichage)
SELECT id, 'COMMUNICATION', 'Communication', 'Qualité des interactions', 3
FROM domaines_competence WHERE code = 'SAVOIR_ETRE';

INSERT INTO criteres_evaluation (domaine_id, code, libelle, description, ordre_affichage)
SELECT id, 'COOPERATION', 'Coopération', 'Travail en équipe', 4
FROM domaines_competence WHERE code = 'SAVOIR_ETRE';

INSERT INTO criteres_evaluation (domaine_id, code, libelle, description, ordre_affichage)
SELECT id, 'FIABILITE', 'Fiabilité', 'Assiduité, ponctualité, engagement', 5
FROM domaines_competence WHERE code = 'SAVOIR_ETRE';

-- Critères pour SAVOIR_AGIR (5 critères)
INSERT INTO criteres_evaluation (domaine_id, code, libelle, description, ordre_affichage)
SELECT id, 'PERTINENCE', 'Pertinence', 'Choix adaptés à la situation', 1
FROM domaines_competence WHERE code = 'SAVOIR_AGIR';

INSERT INTO criteres_evaluation (domaine_id, code, libelle, description, ordre_affichage)
SELECT id, 'MOBILISATION_RESSOURCES', 'Mobilisation des ressources', 'Utilisation combinée des connaissances, outils et comportements', 2
FROM domaines_competence WHERE code = 'SAVOIR_AGIR';

INSERT INTO criteres_evaluation (domaine_id, code, libelle, description, ordre_affichage)
SELECT id, 'PRISE_DECISION', 'Prise de décision', 'Capacité à trancher de manière justifiée', 3
FROM domaines_competence WHERE code = 'SAVOIR_AGIR';

INSERT INTO criteres_evaluation (domaine_id, code, libelle, description, ordre_affichage)
SELECT id, 'ADAPTABILITE', 'Adaptabilité', 'Réaction face à l''imprévu', 4
FROM domaines_competence WHERE code = 'SAVOIR_AGIR';

INSERT INTO criteres_evaluation (domaine_id, code, libelle, description, ordre_affichage)
SELECT id, 'RESPONSABILITE', 'Responsabilité', 'Assumer les conséquences des décisions', 5
FROM domaines_competence WHERE code = 'SAVOIR_AGIR';

-- ============================================================================
-- 3. INSERTION: methodes_evaluation (14 méthodes)
-- ============================================================================

-- Méthodes pour SAVOIR (3 méthodes)
INSERT INTO methodes_evaluation (domaine_id, code, libelle, description, type_methode, ordre_affichage)
SELECT id, 'QCM_TESTS', 'QCM, tests écrits', 'Questionnaires à choix multiples et tests écrits normés', 'THEORIQUE', 1
FROM domaines_competence WHERE code = 'SAVOIR';

INSERT INTO methodes_evaluation (domaine_id, code, libelle, description, type_methode, ordre_affichage)
SELECT id, 'QUESTIONS_OUVERTES', 'Questions ouvertes', 'Questions nécessitant des réponses développées', 'THEORIQUE', 2
FROM domaines_competence WHERE code = 'SAVOIR';

INSERT INTO methodes_evaluation (domaine_id, code, libelle, description, type_methode, ordre_affichage)
SELECT id, 'ETUDES_TEXTES', 'Études de textes, normes, procédures', 'Analyse de documents normatifs et réglementaires', 'THEORIQUE', 3
FROM domaines_competence WHERE code = 'SAVOIR';

-- Méthodes pour SAVOIR_FAIRE (4 méthodes)
INSERT INTO methodes_evaluation (domaine_id, code, libelle, description, type_methode, ordre_affichage)
SELECT id, 'MISE_SITUATION', 'Mise en situation', 'Simulation de situation professionnelle', 'PRATIQUE', 1
FROM domaines_competence WHERE code = 'SAVOIR_FAIRE';

INSERT INTO methodes_evaluation (domaine_id, code, libelle, description, type_methode, ordre_affichage)
SELECT id, 'TRAVAUX_PRATIQUES', 'Travaux pratiques', 'Exercices pratiques dirigés', 'PRATIQUE', 2
FROM domaines_competence WHERE code = 'SAVOIR_FAIRE';

INSERT INTO methodes_evaluation (domaine_id, code, libelle, description, type_methode, ordre_affichage)
SELECT id, 'DEMONSTRATION', 'Démonstration', 'Démonstration des gestes techniques', 'PRATIQUE', 3
FROM domaines_competence WHERE code = 'SAVOIR_FAIRE';

INSERT INTO methodes_evaluation (domaine_id, code, libelle, description, type_methode, ordre_affichage)
SELECT id, 'ETUDE_CAS', 'Étude de cas', 'Résolution de cas pratiques', 'PRATIQUE', 4
FROM domaines_competence WHERE code = 'SAVOIR_FAIRE';

-- Méthodes pour SAVOIR_ETRE (4 méthodes)
INSERT INTO methodes_evaluation (domaine_id, code, libelle, description, type_methode, ordre_affichage)
SELECT id, 'OBSERVATION_TERRAIN', 'Observation terrain', 'Observation en situation réelle de travail', 'COMPORTEMENTAL', 1
FROM domaines_competence WHERE code = 'SAVOIR_ETRE';

INSERT INTO methodes_evaluation (domaine_id, code, libelle, description, type_methode, ordre_affichage)
SELECT id, 'ENTRETIEN_COMPORTEMENTAL', 'Entretien comportemental', 'Entretien structuré sur les comportements', 'COMPORTEMENTAL', 2
FROM domaines_competence WHERE code = 'SAVOIR_ETRE';

INSERT INTO methodes_evaluation (domaine_id, code, libelle, description, type_methode, ordre_affichage)
SELECT id, 'FEEDBACK_360', 'Feedback 360°', 'Évaluation par les pairs, supérieurs et collaborateurs', 'COMPORTEMENTAL', 3
FROM domaines_competence WHERE code = 'SAVOIR_ETRE';

INSERT INTO methodes_evaluation (domaine_id, code, libelle, description, type_methode, ordre_affichage)
SELECT id, 'GRILLES_OBSERVATION', 'Grilles d''observation', 'Grilles standardisées d''observation comportementale', 'COMPORTEMENTAL', 4
FROM domaines_competence WHERE code = 'SAVOIR_ETRE';

-- Méthodes pour SAVOIR_AGIR (4 méthodes)
INSERT INTO methodes_evaluation (domaine_id, code, libelle, description, type_methode, ordre_affichage)
SELECT id, 'ETUDE_CAS_COMPLEXE', 'Étude de cas complexe', 'Résolution de problèmes complexes multi-facettes', 'INTEGRE', 1
FROM domaines_competence WHERE code = 'SAVOIR_AGIR';

INSERT INTO methodes_evaluation (domaine_id, code, libelle, description, type_methode, ordre_affichage)
SELECT id, 'SITUATION_REELLE', 'Situation réelle ou simulée', 'Mise en situation professionnelle authentique', 'INTEGRE', 2
FROM domaines_competence WHERE code = 'SAVOIR_AGIR';

INSERT INTO methodes_evaluation (domaine_id, code, libelle, description, type_methode, ordre_affichage)
SELECT id, 'ASSESSMENT_CENTER', 'Assessment center', 'Centre d''évaluation avec multiples exercices', 'INTEGRE', 3
FROM domaines_competence WHERE code = 'SAVOIR_AGIR';

INSERT INTO methodes_evaluation (domaine_id, code, libelle, description, type_methode, ordre_affichage)
SELECT id, 'ANALYSE_PRATIQUES', 'Analyse de pratiques professionnelles', 'Réflexion structurée sur les pratiques', 'INTEGRE', 4
FROM domaines_competence WHERE code = 'SAVOIR_AGIR';

-- ============================================================================
-- 4. INSERTION: domaines_metier (6 domaines principaux)
-- ============================================================================

INSERT INTO domaines_metier (code, libelle, description, icone, couleur, ordre_affichage) VALUES
('TECHNIQUE', 'Technique', 'Compétences techniques et technologiques', 'code', '#3B82F6', 1),
('MANAGEMENT', 'Management', 'Gestion d''équipe et leadership', 'users', '#8B5CF6', 2),
('RELATIONNEL', 'Relationnel', 'Communication et relations interpersonnelles', 'message-circle', '#EC4899', 3),
('JURIDIQUE', 'Juridique', 'Droit et réglementation', 'scale', '#14B8A6', 4),
('FINANCE', 'Finance', 'Gestion financière et comptabilité', 'dollar-sign', '#10B981', 5),
('MARKETING', 'Marketing', 'Marketing et communication commerciale', 'trending-up', '#F59E0B', 6);

-- ============================================================================
-- 5. INSERTION: sous_domaines_metier (exemples)
-- ============================================================================

-- Sous-domaines pour TECHNIQUE
INSERT INTO sous_domaines_metier (domaine_metier_id, code, libelle, description, ordre_affichage)
SELECT id, 'JAVA', 'Java', 'Développement Java (Spring, Jakarta EE)', 1
FROM domaines_metier WHERE code = 'TECHNIQUE';

INSERT INTO sous_domaines_metier (domaine_metier_id, code, libelle, description, ordre_affichage)
SELECT id, 'PYTHON', 'Python', 'Développement Python (Django, Flask)', 2
FROM domaines_metier WHERE code = 'TECHNIQUE';

INSERT INTO sous_domaines_metier (domaine_metier_id, code, libelle, description, ordre_affichage)
SELECT id, 'JAVASCRIPT', 'JavaScript', 'Développement JavaScript (React, Vue, Node)', 3
FROM domaines_metier WHERE code = 'TECHNIQUE';

INSERT INTO sous_domaines_metier (domaine_metier_id, code, libelle, description, ordre_affichage)
SELECT id, 'CLOUD', 'Cloud', 'Cloud computing (AWS, Azure, GCP)', 4
FROM domaines_metier WHERE code = 'TECHNIQUE';

INSERT INTO sous_domaines_metier (domaine_metier_id, code, libelle, description, ordre_affichage)
SELECT id, 'DEVOPS', 'DevOps', 'DevOps et CI/CD', 5
FROM domaines_metier WHERE code = 'TECHNIQUE';

INSERT INTO sous_domaines_metier (domaine_metier_id, code, libelle, description, ordre_affichage)
SELECT id, 'DATABASE', 'Base de données', 'Bases de données relationnelles et NoSQL', 6
FROM domaines_metier WHERE code = 'TECHNIQUE';

-- Sous-domaines pour MANAGEMENT
INSERT INTO sous_domaines_metier (domaine_metier_id, code, libelle, description, ordre_affichage)
SELECT id, 'GESTION_EQUIPE', 'Gestion d''équipe', 'Management d''équipe opérationnelle', 1
FROM domaines_metier WHERE code = 'MANAGEMENT';

INSERT INTO sous_domaines_metier (domaine_metier_id, code, libelle, description, ordre_affichage)
SELECT id, 'GESTION_PROJET', 'Gestion de projet', 'Management de projet (Agile, traditionnel)', 2
FROM domaines_metier WHERE code = 'MANAGEMENT';

INSERT INTO sous_domaines_metier (domaine_metier_id, code, libelle, description, ordre_affichage)
SELECT id, 'LEADERSHIP', 'Leadership', 'Leadership et influence', 3
FROM domaines_metier WHERE code = 'MANAGEMENT';

INSERT INTO sous_domaines_metier (domaine_metier_id, code, libelle, description, ordre_affichage)
SELECT id, 'COACHING', 'Coaching', 'Coaching et développement des talents', 4
FROM domaines_metier WHERE code = 'MANAGEMENT';

-- Sous-domaines pour RELATIONNEL
INSERT INTO sous_domaines_metier (domaine_metier_id, code, libelle, description, ordre_affichage)
SELECT id, 'COMMUNICATION', 'Communication interpersonnelle', 'Communication efficace', 1
FROM domaines_metier WHERE code = 'RELATIONNEL';

INSERT INTO sous_domaines_metier (domaine_metier_id, code, libelle, description, ordre_affichage)
SELECT id, 'NEGOCIATION', 'Négociation', 'Techniques de négociation', 2
FROM domaines_metier WHERE code = 'RELATIONNEL';

INSERT INTO sous_domaines_metier (domaine_metier_id, code, libelle, description, ordre_affichage)
SELECT id, 'PRESENTATION', 'Présentation', 'Prise de parole en public', 3
FROM domaines_metier WHERE code = 'RELATIONNEL';

INSERT INTO sous_domaines_metier (domaine_metier_id, code, libelle, description, ordre_affichage)
SELECT id, 'GESTION_CONFLITS', 'Gestion de conflits', 'Résolution de conflits', 4
FROM domaines_metier WHERE code = 'RELATIONNEL';

-- ============================================================================
-- 6. MIGRATION DES DONNÉES EXISTANTES
-- ============================================================================

-- Migrer les type_competence vers domaine_competence_id
UPDATE competences_reference
SET domaine_competence_id = (
    SELECT id FROM domaines_competence
    WHERE code = type_competence::TEXT
)
WHERE type_competence IS NOT NULL;
