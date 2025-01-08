const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const path = require("path");
const crypto = require("crypto");
const { error } = require("console");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;

require("dotenv").config();

const app = express();
const port = 3000;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME, // Sostituisci con il tuo Cloud Name
  api_key: process.env.API_KEY,       // Sostituisci con la tua API Key
  api_secret: process.env.API_SECRET  // Sostituisci con il tuo API Secret
});   

module.exports = cloudinary;
// Configura CORS
app.use(cors());

app.use(fileUpload({ useTempFiles: true }));

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
    // Recupero dei dati dal database
    const { rows } = await pool.query("SELECT * FROM servizio;");

    // Modifica i dati per convertire BYTEA (image) in Base64
    const services = rows.map(service => {
      return {
        ...service,
        image: service.image ? `data:image/png;base64,${service.image.toString("base64")}` : null
      };
    });

    // Invio della risposta JSON con le immagini convertite
    res.json(services);
  } catch (error) {
    console.error("Errore nel recupero dei servizi:", error);
    res.status(500).send("Errore del server");
  }
});


app.get("/topservices", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM servizio LIMIT 20;");
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
    const idVenditore = generateRandomId(10);
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

  console.log(req.body);
  
  if (!email || !password) {
    return res.status(400).json({ error: "Tutti i campi sono obbligatori" });
  }

  try {
    console.log(email);
    // Cerca l'utente nel database
    const userQuery = await pool.query("SELECT * FROM utente WHERE email = $1", [email]);
    const user = userQuery.rows[0];

    console.log(userQuery.rows[0]);


    if (!user) {
      return res.status(401).json({ error: "Credenziali non valide"+ error.message });
    }

    console.log(user.passhash);
    // Verifica la password
    const passwordMatch = await bcrypt.compare(password, user.passhash);
    if (passwordMatch) {
      return res.status(401).json({ error: "Credenziali non valide " + error.message });
    }

    res.status(200).json({
      idvenditore: user.idvenditore,
      username: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("Errore durante il login:", error);
    res.status(500).json({ error: error.message });
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
      WHERE ordine.idvenditore = $1 AND ordine.stato = 'Concluso'
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


app.get("/dashboard", async (req, res) => {
  const { idVenditore } = req.query;

  if (!idVenditore) {
    return res.status(400).json({ error: "ID venditore non fornito" });
  }

  try {
    // Esegui una query per ottenere i dati relativi all'idVenditore
    const venditoreData = await pool.query("SELECT * FROM servizi WHERE idvenditore = $1", [idVenditore]);

    res.status(200).json(venditoreData.rows);
  } catch (error) {
    console.error("Errore durante il caricamento della dashboard:", error);
    res.status(500).json({ error: "Errore del server" });
  }
});

app.post("/addService", async (req, res) => {
  try {
    const { titolo, descrizione, prezzo, imageurl } = req.body;

    // Validazione dei dati
    if (!titolo || !descrizione || !prezzo || !req.files || !req.files.image) {
      return res.status(400).send("Tutti i campi sono obbligatori, inclusa un'immagine.");
    }

    const file = req.files.image;

    // Caricamento su Cloudinary
    const uploadResult = await cloudinary.uploader.upload(imageurl, {
      folder: "services", // Facoltativo: specifica una cartella
    });

    // Salva il servizio nel database
    const query = `
      INSERT INTO servizio (titolo, descrizione, prezzo, imageurl)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [titolo, descrizione, prezzo, uploadResult.secure_url];

    const { rows } = await pool.query(query, values);

    res.status(201).json({
      message: "Servizio aggiunto con successo!",
      service: rows[0],
    });
  } catch (error) {
    console.error("Errore durante l'aggiunta del servizio:", error);
    res.status(500).send("Errore del server.");
  }
});

app.post("/addServiceNoImage", async (req, res) => {
  try {

    const payload = { title, description, price, sellerId } = req.body;

    console.log(payload)
    
    // Validazione dei dati
    // if (titolo || descrizione || prezzo || sellerId) {
    //   return res.status(400).send("Tutti i campi sono obbligatori");
    // }


    // Salva il servizio nel database
    const query = `
      INSERT INTO servizio (titolo, descrizione, prezzo, idvenditore, image)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [title, description, price, sellerId, null];

    console.log(values);

    const { rows } = await pool.query(query, values);

    res.status(201).json({
      message: "Servizio aggiunto con successo!",
      service: rows[0],
    });
  } catch (error) {
    console.error("Errore durante l'aggiunta del servizio:", error);
    res.status(500).send("Errore del server."+ error);
  }
});

// Avvia il server
app.listen(port, () => {
  console.log(`Server avviato su http://localhost:${port}`);
});

