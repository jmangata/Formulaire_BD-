async function insertFormulaire(client, formulaire) {
  const result = await client.query(
    `
      INSERT INTO formulaire
        (userid, description_besoin, date_realisation)
      VALUES ($1, $2, $3)
      RETURNING id
    `,
    [
      formulaire.userid,
      formulaire.description_besoin,
      formulaire.date_realisation || null
    ]
  );

  return result.rows[0];
}

async function insertFonctionnalite(client, nom) {
  const result = await client.query(
    `
      INSERT INTO fonctionnalites (nom)
      VALUES ($1)
      RETURNING id
    `,
    [nom]
  );

  return result.rows[0];
}

async function insertProfil(client, nom) {
  const result = await client.query(
    `
      INSERT INTO profile_utilisateur (nom)
      VALUES ($1)
      RETURNING id
    `,
    [nom]
  );

  return result.rows[0];
}

async function linkFonctionnaliteProfil(client, payload) {
  await client.query(
    `
      INSERT INTO foncprofil_
        (fonctionnalites_id, profile_utilisateur_id, formulaire_id)
      VALUES ($1, $2, $3)
    `,
    [payload.fonctionnalites_id, payload.profile_utilisateur_id, payload.formulaire_id]
  );
}

module.exports = {
  insertFormulaire,
  insertFonctionnalite,
  insertProfil,
  linkFonctionnaliteProfil
};
