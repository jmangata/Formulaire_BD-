// ─── Imports repositories ─────────────────────────────────────────
const {
  insertFormulaire,
  insertFonctionnalite,
  insertProfil,
  linkFonctionnaliteProfil
} = require("../repositories/formulaire.repository");

const {
  findReferenceById,
  insertForFormulaire
} = require("../repositories/personneRessource.repository");

// ─── Utilitaire d'erreur HTTP ─────────────────────────────────────
// Crée une erreur standard enrichie d'un code HTTP
// pour permettre au gestionnaire d'erreur d'index.js de répondre correctement
function createHttpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

// ─── Résolution d'une personne ressource ──────────────────────────
// Selon le mode :
//   - "manual"   : retourne directement les champs saisis
//   - "existing" : recherche la personne en base par son ID (formulaire_id IS NULL)
//                  Lance une erreur 404 si introuvable
async function resolvePersonneRessource(client, personne) {
  if (personne.mode === "manual") {
    return {
      nom: personne.nom,
      prenom: personne.prenom,
      entites_fonctionnelles: personne.entites_fonctionnelles,
      role: personne.role
    };
  }

  const reference = await findReferenceById(client, personne.personne_existante_id);

  if (!reference) {
    throw createHttpError("Personne ressource existante introuvable", 404);
  }

  return reference;
}

// ─── Soumission complète du formulaire ───────────────────────────
// Orchestrateur principal des insertions en base (dans une même transaction) :
//   1. Insère le formulaire (en-tête)
//   2. Pour chaque personne ressource : résout et insère en base
//   3. Pour chaque fonctionnalité :
//      a. Insère la fonctionnalité
//      b. Pour chaque profil : insère le profil et crée la liaison
async function submitFormulaire(client, payload) {
  // Étape 1 : insertion du formulaire principal
  const formulaire = await insertFormulaire(client, payload);

  // Étape 2 : insertion des personnes ressources
  for (const personne of payload.personnes_ressource) {
    const resolvedPersonne = await resolvePersonneRessource(client, personne);

    await insertForFormulaire(client, {
      ...resolvedPersonne,
      formulaire_id: formulaire.id
    });
  }

  // Étape 3 : insertion des fonctionnalités et profils associés
  for (const fonctionnalite of payload.fonctionnalites) {
    const fonctionnaliteRow = await insertFonctionnalite(client, fonctionnalite.nom);

    for (const profil of fonctionnalite.profils) {
      const profilRow = await insertProfil(client, profil.nom);

      // Création de la liaison fonctionnalité ↔ profil ↔ formulaire
      await linkFonctionnaliteProfil(client, {
        fonctionnalites_id: fonctionnaliteRow.id,
        profile_utilisateur_id: profilRow.id,
        formulaire_id: formulaire.id
      });
    }
  }

  return formulaire;
}

module.exports = {
  submitFormulaire
};
