-- Script de création des tables pour l'application formulaire
-- À exécuter dans la base de données PostgreSQL

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    fonction VARCHAR(255),
    unite_fonctionnelle VARCHAR(255)
);

-- Table des personnes ressources
CREATE TABLE IF NOT EXISTS personne_ressource (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255),
    prenom VARCHAR(255),
    entites_fonctionnelles VARCHAR(255),
    role VARCHAR(255),
    formulaire_id INTEGER REFERENCES formulaire(id) ON DELETE CASCADE
);

-- Table des formulaires
CREATE TABLE IF NOT EXISTS formulaire (
    id SERIAL PRIMARY KEY,
    userid INTEGER NOT NULL REFERENCES users(id),
    description_besoin TEXT NOT NULL,
    date_realisation DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des fonctionnalités
CREATE TABLE IF NOT EXISTS fonctionnalites (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL
);

-- Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS profile_utilisateur (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL
);

-- Table de liaison fonctionnalités-profils-formulaires
CREATE TABLE IF NOT EXISTS foncprofil_ (
    id SERIAL PRIMARY KEY,
    fonctionnalites_id INTEGER NOT NULL REFERENCES fonctionnalites(id) ON DELETE CASCADE,
    profile_utilisateur_id INTEGER NOT NULL REFERENCES profile_utilisateur(id) ON DELETE CASCADE,
    formulaire_id INTEGER NOT NULL REFERENCES formulaire(id) ON DELETE CASCADE
);

-- Insertion de données de test pour les utilisateurs
INSERT INTO users (nom, prenom, fonction, unite_fonctionnelle) VALUES
('Dupont', 'Jean', 'Développeur', 'IT'),
('Martin', 'Marie', 'Chef de projet', 'Direction'),
('Dubois', 'Pierre', 'Analyste', 'Métier'),
('Garcia', 'Sophie', 'Designer', 'UX/UI')
ON CONFLICT DO NOTHING;

-- Insertion de données de test pour les personnes ressources
INSERT INTO personne_ressource (nom, prenom, entites_fonctionnelles, role) VALUES
('Leroy', 'Paul', 'Ressources Humaines', 'Responsable RH'),
('Moreau', 'Claire', 'Finance', 'Comptable'),
('Petit', 'Luc', 'IT', 'Administrateur système'),
('Roux', 'Emma', 'Marketing', 'Chargée de communication')
ON CONFLICT DO NOTHING;