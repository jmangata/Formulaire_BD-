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

function createHttpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

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

async function submitFormulaire(client, payload) {
  const formulaire = await insertFormulaire(client, payload);

  for (const personne of payload.personnes_ressource) {
    const resolvedPersonne = await resolvePersonneRessource(client, personne);

    await insertForFormulaire(client, {
      ...resolvedPersonne,
      formulaire_id: formulaire.id
    });
  }

  for (const fonctionnalite of payload.fonctionnalites) {
    const fonctionnaliteRow = await insertFonctionnalite(client, fonctionnalite.nom);

    for (const profil of fonctionnalite.profils) {
      const profilRow = await insertProfil(client, profil.nom);

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
