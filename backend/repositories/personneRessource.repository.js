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
      data.entites_fonctionnelles ?? null,
      data.role ?? null,
      data.formulaire_id
    ]
  );

  return result.rows[0];
}

module.exports = {
  findReferenceById,
  insertForFormulaire
};
