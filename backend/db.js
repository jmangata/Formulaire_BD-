// ─── Connexion PostgreSQL ───────────────────────────────────────────
// Crée et exporte un pool de connexions réutilisables vers la base de données.
// Les paramètres sont lus depuis les variables d'environnement (Docker / .env)
// avec des valeurs par défaut pour le développement local.
const { Pool } = require("pg");

const pool = new Pool({
  host:     process.env.DB_HOST     || process.env.POSTGRES_HOST     || "localhost",
  user:     process.env.DB_USER     || process.env.POSTGRES_USER     || "postgres",
  password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || "madinina972",
  database: process.env.DB_NAME     || process.env.POSTGRES_DB      || "annuaire_ctm_1",
  port:     Number(process.env.DB_PORT || 5432)
});

// Export du pool unique — partagé par tous les modules qui l'importent
module.exports = pool;