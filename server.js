const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const path = require("path");
require("dotenv").config();
const crypto = require("crypto");

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


function generateRandomId() {
  return crypto.randomBytes(8).toString("hex").substring(0, 8); // Usa "length" per limitare i caratteri
}

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

app.post("/signup", async (req, res) => {
  const { name, surname, email, password } = req.body;
  console.log("Dati Ricevuti");
  console.log(name,surname,email,password);
  if (!name || !surname || !email || !password) {
    return res.status(400).json({ error: "Tutti i campi sono obbligatori" });
  }

  try {
    
    // Controlla se l'utente esiste già
    const userCheck = await pool.query("SELECT * FROM utente WHERE email = $1", [email]);
    if (userCheck.rows.length > 0) {
      return res.status(409).json({ error: "Email già registrata" });
    }

    const idCliente = generateRandomId(8); // Lunghezza 8 caratteri
    const idVenditore = generateRandomId(8);
    // Hash della password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserisci il nuovo utente nel database
    
    await pool.query(
      "INSERT INTO utente (name, surname, email, passhash, idcliente, idvenditore) VALUES ($1, $2, $3, $4, $5, $6)",
      [name, surname, email, hashedPassword, idCliente, idVenditore]
    );

    res.status(201).json({ message: "Registrazione effettuata con successo" });
  } catch (error) {
    console.error("Errore durante la registrazione:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  
  if (!email || !password) {
    return res.status(400).json({ error: "Tutti i campi sono obbligatori" });
  }

  console.log(email,password);
  try {
    // Cerca l'utente nel database
    const userQuery = await pool.query("SELECT * FROM utente WHERE email = $1", [email]);
    const user = userQuery.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Credenziali non valide" });
    }

    // Verifica la password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Credenziali non valide" });
    }

    res.status(200).json({
      username: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("Errore durante il login:", error);
    res.status(500).json({ error: error.message });
  }
});

//uniqueID
const generateUniqueId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
const generateUniqueIdInDb = async () => {
  let uniqueId;
  let isUnique = false;

  while (!isUnique) {
    uniqueId = generateUniqueId();
    const result = await pool.query('SELECT COUNT(*) FROM utente WHERE id_cliente = $1', [uniqueId]);
    if (result.rows[0].count == 0) {
      isUnique = true;
    }
  }

  return uniqueId;
}

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
