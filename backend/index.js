const express = require("express");
const cors = require("cors");
const pool = require("./db");
const { FormulaireSchema } = require("./schemas/formulaire.schema");
const { submitFormulaire } = require("./services/formulaire.service");

const app = express();

app.use(cors({
  origin: "http://localhost:4200",
  credentials: true
}));
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; connect-src 'self' http://localhost:3000"
  );
  next();
});

app.get("/", (req, res) => {
  res.send("Bienvenue sur mon serveur Node.js 🚀");
});

app.get("/api/testdb", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS server_time");
    res.json({ success: true, serverTime: result.rows[0].server_time });
  } catch (err) {
    console.error("Erreur test DB:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT id, nom, prenom, fonction, unite_fonctionnelle
        FROM users
        ORDER BY id ASC
      `
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur récupération users:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/personne_ressource", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nom, prenom, entites_fonctionnelles, role
      FROM personne_ressource
      WHERE formulaire_id IS NULL
      ORDER BY nom ASC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.post("/api/formulaire", async (req, res) => {
  const parsed = FormulaireSchema.safeParse(req.body);

  if (!parsed.success) {
    console.log("💥 ZOD ISSUES:", parsed.error.issues);
    return res.status(400).json({
      error: "Données invalides",
      details: parsed.error.issues
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const formulaire = await submitFormulaire(client, parsed.data);

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Formulaire enregistré avec succès",
      formulaireId: formulaire.id
    });
  } catch (err) {
    await client.query("ROLLBACK");

    const statusCode = err.statusCode || 500;
    console.error("Erreur insertion formulaire:", err);

    res.status(statusCode).json({
      error: statusCode === 500 ? `Erreur serveur : ${err.message}` : err.message
    });
  } finally {
    client.release();
  }
});

app.use((req, res, next) => {
  console.warn(`404 - Route non trouvée: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: "Route non trouvée",
    method: req.method,
    url: req.originalUrl
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Erreur serveur interne" });
});

const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
