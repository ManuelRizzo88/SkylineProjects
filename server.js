const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");
require("dotenv").config();

const app = express();
const port = 3000;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Configura CORS
app.use(cors());

app.use(express.static(path.join(__dirname, "html")));
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/img", express.static(path.join(__dirname, "img")));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "home.html"));
});

// API per ottenere servizi
app.get("/services", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM servizio;");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Errore del server");
  }
});

// API per registrare un nuovo utente
app.post("/signup", async (req, res) => {
  const { name, surname, email, password } = req.body;

  if (!name || !surname || !email || !password) {
    return res.status(400).json({ error: "Tutti i campi sono obbligatori" });
  }

  try {
    // Controlla se l'utente esiste già
    const userCheck = await pool.query("SELECT * FROM utente WHERE email = $1;", [email]);

    if (userCheck.rows.length > 0) {
      return res.status(409).json({ error: "Email già registrata" });
    }

    // Inserisci il nuovo utente
    await pool.query(
      "INSERT INTO utente (name, surname, email, password) VALUES ($1, $2, $3, $4);",
      [name, surname, email, password]
    );

    res.status(201).json({ message: "Utente registrato con successo" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore del server" });
  }
});

app.get('/vendite-mensili/:venditoreId', async (req, res) => {
  const venditoreId = req.params.venditoreId;

  try {
    const query = `
      SELECT 
        DATE_TRUNC('month', ordine.concluso) AS mese,
        COUNT(ordine.idordine) AS numero_ordini,
        SUM(ordine.prezzo) AS totale_vendite
      FROM ordine
      WHERE ordine.idvenditore = $1
      GROUP BY mese
      ORDER BY mese;
    `;
    const { rows } = await pool.query(query, [venditoreId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Errore del server');
  }
});

// Avvia il server
app.listen(port, () => {
  console.log(`Server avviato su http://localhost:${port}`);
});
