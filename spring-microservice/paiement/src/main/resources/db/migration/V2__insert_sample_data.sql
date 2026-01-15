-- Insertion de données de test pour le développement
-- Ces données peuvent être supprimées en production

-- Paiements en attente
INSERT INTO tc_paiement (id, utilisateur_id, montant, devise, statut, type, reference, description, date_creation)
VALUES
    (gen_random_uuid(), gen_random_uuid(), 150.00, 'EUR', 'EN_ATTENTE', 'CARTE_BANCAIRE', 'PAY-TEST001', 'Paiement de test 1', CURRENT_TIMESTAMP),
    (gen_random_uuid(), gen_random_uuid(), 250.50, 'EUR', 'EN_ATTENTE', 'VIREMENT', 'PAY-TEST002', 'Paiement de test 2', CURRENT_TIMESTAMP),
    (gen_random_uuid(), gen_random_uuid(), 50.00, 'XOF', 'EN_ATTENTE', 'MOBILE_MONEY', 'PAY-TEST003', 'Paiement de test 3', CURRENT_TIMESTAMP);

-- Paiements validés
INSERT INTO tc_paiement (id, utilisateur_id, montant, devise, statut, type, reference, description, date_creation, date_validation)
VALUES
    (gen_random_uuid(), gen_random_uuid(), 300.00, 'EUR', 'VALIDE', 'CARTE_BANCAIRE', 'PAY-TEST004', 'Paiement validé 1', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
    (gen_random_uuid(), gen_random_uuid(), 500.00, 'EUR', 'VALIDE', 'PAYPAL', 'PAY-TEST005', 'Paiement validé 2', CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '4 days');

-- Paiement rejeté
INSERT INTO tc_paiement (id, utilisateur_id, montant, devise, statut, type, reference, description, date_creation, date_validation)
VALUES
    (gen_random_uuid(), gen_random_uuid(), 100.00, 'EUR', 'REJETE', 'CARTE_BANCAIRE', 'PAY-TEST006', 'Paiement rejeté pour fonds insuffisants', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days');
