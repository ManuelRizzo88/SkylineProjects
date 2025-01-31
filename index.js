const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const path = require("path");
const crypto = require("crypto");
const { error } = require("console");
const multer = require("multer");
const postgres = require('postgres');


require("dotenv").config();

const app = express();
const port = 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const connectionString = process.env.DATABASE_URL2
const sql = postgres(connectionString)


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
    const result = await sql`SELECT idservizio,titolo, descrizione, prezzo, encode(image, 'base64') AS image, idvenditore FROM servizio`;

    const services = result.map(row => ({
      idservice: row.idservizio,
      title: row.titolo,
      description: row.descrizione,
      price: row.prezzo,
      image: row.image ? `data:image/png;base64,${row.image}` : null, // Controlla che image non sia null
      sellerId: row.idvenditore
    }));

    res.status(200).json(services);
  } catch (error) {
    console.error("Errore durante il recupero dei servizi:", error);
    res.status(500).send("Errore del server.");
  }
});

app.get("/services/:id", async (req, res) => {
  const idS = req.params.id;
  console.log(idS);
  try {
    const services = await sql`
      SELECT idservizio, titolo, descrizione, prezzo, 
            encode(image, 'base64') AS image, idvenditore 
      FROM servizio 
      WHERE idservizio = ${idS}`;

    if (services.length === 0) {
      return res.status(404).json({ error: "Servizio non trovato" });
    }

    const service = services[0];
    res.json(service);
  } catch (error) {
    console.error("Errore durante il recupero dei servizi:", error);
    res.status(500).send("Errore del server.");
  }
});


app.get("/topservices", async (req, res) => {
  try {
    const result = await sql`SELECT idservizio,titolo, descrizione, prezzo, encode(image, 'base64') AS image, idvenditore FROM servizio LIMIT 5`;

    const services = result.map(row => ({
      idservice: row.idservizio,
      title: row.titolo,
      description: row.descrizione,
      price: row.prezzo,
      image: row.image ? `data:image/png;base64,${row.image}` : null, // Controlla che image non sia null
      sellerId: row.idvenditore
    }));

    res.status(200).json(services);
  } catch (error) {
    console.error("Errore durante il recupero dei servizi:", error);
    res.status(500).send("Errore del server.");
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
    const userCheck = await sql`SELECT * FROM utente WHERE email = ${email}`
    console.log(userCheck)
    if (userCheck.length > 0) {
      return res.status(409).json({ error: "Email già registrata" });
    }

    const idCliente = generateRandomId(8); // Lunghezza 8 caratteri
    const idVenditore = generateRandomId(10);
    // Hash della password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserisci il nuovo utente nel database
    await sql`INSERT INTO utente (name, surname, email, passhash, idcliente, idvenditore) VALUES (${name}, ${surname}, ${email}, ${hashedPassword}, ${idCliente}, ${idVenditore})`

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

  try {
    const users = await sql`SELECT * FROM utente WHERE email = ${email}`;
    const user = users[0];

    if (!user) {
      return res.status(401).json({ error: "Email o password errati" });
    }

    const passwordMatch = await bcrypt.compare(password, user.passhash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Email o password errati" });
    }

    res.status(200).json({
      idu: user.idu,
      idvenditore: user.idvenditore,
      idcliente: user.idcliente,
      username: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("Errore durante il login:", error.message);
    res.status(500).json({ error: "Errore del server, riprova più tardi" });
  }
});

app.get("/getUserTeam/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await sql`
      SELECT t.idteam 
      FROM teamers t
      WHERE t.idutente = ${userId}`
    ;

    if (result.length > 0) {
      res.status(200).json({ teamId: result.rows[0].idteam });
    } else {
      res.status(404).json({ message: "Nessun team trovato per questo utente." });
    }
  } catch (error) {
    console.error("Errore durante il recupero del team:", error);
    res.status(500).send("Errore del server.");
  }
});

app.get('/vendite-mensili/:venditoreId', async (req, res) => {
  const venditoreId = req.params.venditoreId;

  try {
    const { rows } = await sql`
      SELECT 
        DATE_TRUNC('month', ordine.concluso) AS mese,
        COUNT(ordine.idordine) AS numero_ordini,
        SUM(ordine.prezzo) AS totale_vendite
      FROM ordine
      WHERE ordine.idvenditore = ${venditoreId} AND ordine.stato = 'Concluso'
      GROUP BY mese
      ORDER BY mese;
    `;
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
    
    const venditoreData = await sql`SELECT * FROM servizi WHERE idvenditore = ${idVenditore}`;
    res.status(200).json(venditoreData.rows);
  } catch (error) {
    console.error("Errore durante il caricamento della dashboard:", error);
    res.status(500).json({ error: "Errore del server" });
  }
});

app.post("/addService", upload.single("image"), async (req, res) => {
  try {
    const { title, description, price, sellerId } = req.body;

    // Controlla che tutti i campi siano presenti
    if (!title || !description || !price || !sellerId) {
      return res.status(400).send("Tutti i campi sono obbligatori.");
    }

    // Controlla che un'immagine sia stata caricata
    if (!req.file) {
      return res.status(400).send("L'immagine è obbligatoria.");
    }

    // Ottieni il buffer dell'immagine
    const imageBuffer = req.file.buffer;


    await sql`
      INSERT INTO servizio (titolo, descrizione, prezzo, image, idvenditore)
      VALUES (${title}, ${description}, ${parseFloat(price)}, ${imageBuffer}, ${sellerId})
    `;

    res.status(200).send("Servizio caricato con successo!");
  } catch (error) {
    console.error("Errore durante il caricamento del servizio:", error);
    res.status(500).send("Errore del server.");
  }
});

app.post("/addServiceNoImage", async (req, res) => {
  try {

    const { title, description, price, sellerId } = req.body;

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


    const { rows } = await sql`
      INSERT INTO servizio (titolo, descrizione, prezzo, idvenditore, image)
      VALUES (${title}, ${description}, ${parseFloat(price)}, ${sellerId}, null)
      RETURNING *;
    `;

    res.status(201).json({
      message: "Servizio aggiunto con successo!",
      service: rows[0],
    });
  } catch (error) {
    console.error("Errore durante l'aggiunta del servizio:", error);
    res.status(500).send("Errore del server."+ error);
  }
});
app.post('/orders', async (req, res) => {
  const {
      descrizione,
      stato,
      scadenza,
      idVenditore,
      idCliente,
      prezzo,
      fattura
  } = req.body;

  // Controllo che tutti i campi richiesti siano presenti
  if (!descrizione || !stato || !scadenza || !idVenditore || !idCliente || !prezzo) {
      return res.status(400).json({ error: "Tutti i campi obbligatori devono essere compilati." });
  }

  try {
      const query = `
          INSERT INTO Ordine (Descrizione, Stato, Scadenza, IdVenditore, IdCliente, Prezzo, Fattura)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *;
      `;

      const result = await sql`
          INSERT INTO Ordine (Descrizione, Stato, Scadenza, IdVenditore, IdCliente, Prezzo, Fattura)
          VALUES (${descrizione}, ${stato}, ${scadenza}, ${idVenditore}, ${idCliente}, ${prezzo}, null)
          RETURNING *;
      `;

      const newOrder = result.rows[0];

      res.status(201).json({
          message: "Ordine creato con successo.",
          ordine: newOrder
      });
  } catch (error) {
      console.error("Errore durante l'inserimento dell'ordine:", error);
      res.status(500).json({ error: "Errore interno del server." });
  }
});

// Creare un nuovo team
app.post("/createTeam", async (req, res) => {
  try {
    const { name, userId } = req.body;

    // Verifica campi obbligatori
    if (!name || !userId) {
      return res.status(400).send("Tutti i campi sono obbligatori.");
    }

    // Query per creare il team
    const teamResult = await sql`
      INSERT INTO Team (teamname)
      VALUES (${name})
      RETURNING IdTeam
    `;
    console.log(teamResult)
    const teamId = teamResult[0].idteam;

    const baseRole = "Owner"
    // Aggiungi l'utente come Owner del team nella tabella Teamers
    await sql`
      INSERT INTO Teamers (idteam, idutente, Role)
      VALUES (${teamId}, ${userId}, ${baseRole})
    `;
    
    res.status(201).json({
      teamid:teamId
    });
  } catch (error) {
    console.error("Errore durante la creazione del team:", error);
    res.status(500).send("Errore del server." + error);
  }
});

app.post("/inviteToTeam", async (req, res) => {
  try {
    const { teamId, userId, role } = req.body;

    // Verifica campi obbligatori
    if (!teamId || !userId || !role) {
      return res.status(400).send("Tutti i campi sono obbligatori.");
    }

    // Verifica che il team esista
    const teamExistsQuery = `SELECT * FROM Team WHERE IdTeam = $1`;
    const teamExistsResult = await pool.query(teamExistsQuery, [teamId]);
    if (teamExistsResult.rows.length === 0) {
      return res.status(404).send("Il team specificato non esiste.");
    }

    // Inserisci l'invito nella tabella Invitations
    const createInvitationQuery = `
      INSERT INTO Invitations (IdTeam, IdUtente, Role)
      VALUES ($1, $2, $3)
    `;
    await pool.query(createInvitationQuery, [teamId, userId, role]);

    res.status(200).send("Invito inviato con successo!");
  } catch (error) {
    console.error("Errore durante l'invio dell'invito:", error);
    res.status(500).send("Errore del server.");
  }
});

app.post("/respondToInvitation", async (req, res) => {
  try {
    const { invitationId, response } = req.body; // 'response' può essere 'accepted' o 'rejected'

    // Verifica campi obbligatori
    if (!invitationId || !response) {
      return res.status(400).send("Tutti i campi sono obbligatori.");
    }

    // Ottieni i dettagli dell'invito
    const getInvitationQuery = `SELECT * FROM Invitations WHERE Id = $1`;
    const invitationResult = await pool.query(getInvitationQuery, [invitationId]);
    if (invitationResult.length === 0) {
      return res.status(404).send("Invito non trovato.");
    }

    const { idteam, idutente, role } = invitationResult.rows[0];

    if (response === "accepted") {
      // Aggiungi l'utente alla tabella Teamers
      const addUserToTeamQuery = `
        INSERT INTO Teamers (IdTeam, IdUtente, Role)
        VALUES ($1, $2, $3)
      `;
      await pool.query(addUserToTeamQuery, [idteam, idutente, role]);
    }

    // Elimina l'invito
    const deleteInvitationQuery = `DELETE FROM Invitations WHERE Id = $1`;
    await pool.query(deleteInvitationQuery, [invitationId]);

    res.status(200).send(`Invito ${response} con successo.`);
  } catch (error) {
    console.error("Errore durante la risposta all'invito:", error);
    res.status(500).send("Errore del server.");
  }
});

app.get("/getTeamMembers/:teamId", async (req, res) => {
  try {
    const { teamId } = req.params;

    const membersResult = await sql`
      SELECT 
        u.IdU AS id, 
        u.name AS name, 
        tm.Role AS role, 
        t.teamname AS teamName
      FROM Teamers tm
      JOIN Utente u ON tm.IdUtente = u.IdU
      JOIN Team t ON tm.IdTeam = t.IdTeam
      WHERE tm.IdTeam = ${teamId}
    `;
    
    res.status(200).json(membersResult); // Restituisce un array di membri
    console.table(membersResult)
  } catch (error) {
    console.error("Errore nel recupero dei membri del team:", error);
    res.status(500).send("Errore del server.");
  }
});

app.get("/getNotifications/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).send("userId è obbligatorio.");
    }

    const query = `
      SELECT * 
      FROM Notifications
      WHERE IdUtente = $1 AND Status = 'unread'
    `;
    const result = await pool.query(query, [userId]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Errore durante il recupero delle notifiche:", error);
    res.status(500).send("Errore del server.");
  }
});

app.post("/removeMember", async (req, res) => {
  try {
    const { memberId } = req.body;

    await sql`
      DELETE FROM Teamers
      WHERE IdUtente = ${memberId}
    `;

    res.status(200).send("Membro rimosso con successo.");
  } catch (error) {
    console.error("Errore durante la rimozione del membro:", error);
    res.status(500).send("Errore del server.");
  }
});

app.delete("/deleteService/:serviceId", async (req, res) => {
  const { serviceId } = req.params;

  try {
    // Query per eliminare il servizio dal database
    const result = await sql`
      DELETE FROM servizio
      WHERE idservizio = ${serviceId}
    `;

    if (result.rowCount > 0) {
      res.status(200).json({ message: "Servizio rimosso con successo." });
    } else {
      res.status(404).json({ message: "Servizio non trovato." });
    }
  } catch (error) {
    console.error("Errore durante l'eliminazione del servizio:", error);
    res.status(500).send("Errore del server.");
  }
});

app.get("/getServices/:sellerId", async (req, res) => {
  const { sellerId } = req.params;

  try {
    // Query per ottenere i servizi dal database
    const result = await sql`
      SELECT idservizio, titolo, descrizione, prezzo
      FROM servizio
      WHERE idvenditore = ${sellerId}
    `;

    if (result.length > 0) {
      res.status(200).json(result.rows);
    }
  } catch (error) {
    console.error("Errore durante il recupero dei servizi:", error);
    res.status(500).send("Errore del server.");
  }
});

app.get("/getOrders/:sellerId", async (req, res) => {
  const { sellerId } = req.params;

  try {
    // Query per ottenere i servizi dal database
    const query = `
      SELECT *
      FROM ordine
      WHERE idvenditore = $1 AND stato != 'Concluso';
    `;
    const result = await sql`
      SELECT *
      FROM ordine
      WHERE idvenditore = ${sellerId} AND stato != 'Concluso';
    `;

    if (result.length > 0) {
      res.status(200).json(result.rows);
    }
  } catch (error) {
    console.error("Errore durante il recupero dei ordini:", error);
    res.status(500).send("Errore del server.");
  }
});

app.put("/updateOrderStatus/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body; // Stato passato dal client

  try {
    const query = `
      UPDATE ordine
      SET stato = $1, concluso = NOW()
      WHERE idordine = $2
      RETURNING *;
    `;
    const result = await sql`
      UPDATE ordine
      SET stato = ${status}, concluso = NOW()
      WHERE idordine = ${orderId}
      RETURNING *;
    `;

    if (result.rowCount > 0) {
      res.status(200).json({ message: "Stato aggiornato con successo.", order: result.rows[0] });
    } else {
      res.status(404).json({ message: "Ordine non trovato." });
    }
  } catch (error) {
    console.error("Errore durante l'aggiornamento dello stato dell'ordine:", error);
    res.status(500).send("Errore del server.");
  }
});

// Avvia il server
app.listen(port, () => {
  console.log(`Server avviato su http://localhost:${port}`);
});

