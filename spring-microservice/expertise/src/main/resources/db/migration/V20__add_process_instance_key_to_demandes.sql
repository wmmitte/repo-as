-- Ajout de la colonne process_instance_key pour stocker la clé de l'instance BPMN Zeebe
ALTER TABLE demandes_reconnaissance_competence
    ADD COLUMN process_instance_key BIGINT;

-- Ajouter un index pour améliorer les performances de recherche
CREATE INDEX idx_demandes_process_instance_key
    ON demandes_reconnaissance_competence(process_instance_key);

-- Commentaire pour documentation
COMMENT ON COLUMN demandes_reconnaissance_competence.process_instance_key IS
    'Clé de l''instance du processus BPMN Zeebe associée à cette demande';
