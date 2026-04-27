// ─── Imports ────────────────────────────────────────────────
const express = require("express");
const cors = require("cors");
const pool = require("./db");                                          // Pool de connexions PostgreSQL
const { submitFormulaire } = require("./services/formulaire.service"); // Logique métier
const { validateFormulaire } = require("./middlewares/validate");       // Middleware de validation Zod

const app = express();

// ─── Middlewares globaux ─────────────────────────────────────

// Autorise les requêtes cross-origin depuis le frontend Angular (dev)
app.use(cors({
  origin: "http://localhost:4200",
  credentials: true
}));

// Parse automatiquement le body JSON des requêtes entrantes
app.use(express.json());

// Ajoute un en-tête Content-Security-Policy sur toutes les réponses
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; connect-src 'self' http://localhost:3000"
  );
  next();
});

// ─── Routes ─────────────────────────────────────────────────

// Route de bienvenue (vérification que le serveur tourne)
app.get("/", (req, res) => {
  res.send("Bienvenue sur mon serveur Node.js 🚀");
});

// GET /api/testdb — vérifie la connexion à la base de données PostgreSQL
app.get("/api/testdb", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS server_time");
    res.json({ success: true, serverTime: result.rows[0].server_time });
  } catch (err) {
    console.error("Erreur test DB:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users — liste tous les utilisateurs (pour le select du formulaire)
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

// GET /api/personne_ressource — liste les personnes ressources de référence
// (formulaire_id IS NULL = personnes non liées à un formulaire existant)
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

// POST /api/formulaire — reçoit et enregistre un formulaire complet
// Étapes : validation Zod (middleware) → transaction SQL → insertions en cascade
app.post("/api/formulaire", validateFormulaire, async (req, res) => {
  // req.body est déjà validé et typé par le middleware validateFormulaire

  // Obtention d'un client dédié pour la transaction
  const client = await pool.connect();

  try {
    await client.query("BEGIN"); // Début de transaction

    // Délègue toutes les insertions au service métier
    const formulaire = await submitFormulaire(client, req.body);

    await client.query("COMMIT"); // Valide la transaction si tout s'est bien passé

    res.status(201).json({
      success: true,
      message: "Formulaire enregistré avec succès",
      formulaireId: formulaire.id
    });
  } catch (err) {
    await client.query("ROLLBACK"); // Annule tout en cas d'erreur

    const statusCode = err.statusCode || 500;
    console.error("Erreur insertion formulaire:", err);

    res.status(statusCode).json({
      error: statusCode === 500 ? `Erreur serveur : ${err.message}` : err.message
    });
  } finally {
    client.release(); // Restitue le client au pool dans tous les cas
  }
});

// ─── Middlewares d'erreur ────────────────────────────────────

// 404 — route non reconnue
app.use((req, res, next) => {
  console.warn(`404 - Route non trouvée: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: "Route non trouvée",
    method: req.method,
    url: req.originalUrl
  });
});

// 500 — erreur Express non gérée (fallback global)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Erreur serveur interne" });
});

// ─── Démarrage du serveur ────────────────────────────────────
const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
