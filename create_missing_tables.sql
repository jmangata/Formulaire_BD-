-- Script pour créer seulement les tables manquantes
-- Exécuter après vérification des tables existantes

-- Créer personne_ressource si elle n'existe pas
CREATE TABLE IF NOT EXISTS personne_ressource (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255),
    prenom VARCHAR(255),
    entites_fonctionnelles VARCHAR(255),
    role VARCHAR(255)
);

-- Insérer des données de test
INSERT INTO personne_ressource (nom, prenom, entites_fonctionnelles, role) VALUES
('Dupont', 'Jean', 'IT', 'Développeur'),
('Martin', 'Marie', 'RH', 'Responsable'),
('Garcia', 'Pierre', 'Finance', 'Comptable'),
('Leroy', 'Sophie', 'Marketing', 'Chargée com')
ON CONFLICT DO NOTHING;

-- Vérifier que les données sont insérées
SELECT COUNT(*) as nb_personnes FROM personne_ressource;