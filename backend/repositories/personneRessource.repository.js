// ─── Repository : personne ressource ─────────────────────────────────────────
// Regroupe les requêtes SQL liées aux personnes ressources :
// recherche de référence et insertion rattachée à un formulaire.

// Recherche une personne ressource de référence par ID
// (formulaire_id IS NULL = personne générique, non liée à un formulaire)
// Retourne null si introuvable
async function findReferenceById(client, id) {
  const result = await client.query(
    `
      SELECT id, nom, prenom, entites_fonctionnelles, role
      FROM personne_ressource
      WHERE id = $1
        AND formulaire_id IS NULL
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] || null;
}

// Insère une personne ressource rattachée à un formulaire spécifique
// (mode manual ou copie d'une personne existante résolue par le service)
async function insertForFormulaire(client, data) {
  const result = await client.query(
    `
      INSERT INTO personne_ressource
        (nom, prenom, entites_fonctionnelles, role, formulaire_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `,
    [
      data.nom,
      data.prenom,
      data.entites_fonctionnelles ?? null,  // champ optionnel
      data.role ?? null,                    // champ optionnel
      data.formulaire_id
    ]
  );

  return result.rows[0];
}

module.exports = {
  findReferenceById,
  insertForFormulaire
};
