require('dotenv').config();
const { Pool } = require("pg");

// Configura i dettagli della connessione
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Necessario per Neon (SSL obbligatorio)
});

// Funzione per verificare la connessione
const testConnection = async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Connected to Neon! Current time:", res.rows[0].now);
  } catch (err) {
    console.error("Error connecting to Neon:", err);
  }
};

testConnection();

module.exports = pool;
