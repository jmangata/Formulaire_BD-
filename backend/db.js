const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || process.env.POSTGRES_HOST || "localhost",
  user: process.env.DB_USER || process.env.POSTGRES_USER || "postgres",
  password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || "madinina972",
  database: process.env.DB_NAME || process.env.POSTGRES_DB || "annuaire_ctm_1",
  port: Number(process.env.DB_PORT || 5432)
});

module.exports = pool;