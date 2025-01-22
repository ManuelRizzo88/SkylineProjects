// Elementi DOM
const noTeamSection = document.getElementById("no-team");
const teamTableContainer = document.getElementById("team-section");
const teamTableBody = document.getElementById("team-members-table");
const createTeamBtn = document.getElementById("create-team-btn");
const deleteTeamBtn = document.getElementById("delete-team-btn");
const teamName = document.getElementById("team-name");
document.addEventListener("DOMContentLoaded", ()=>{
  if(!user)
  {
    alert("Nessun Utente Autenticato")
    window.location.href = "home.html"
  }
})
// Inizializzazione
document.addEventListener("DOMContentLoaded",fetchTeam)

// Funzione per ottenere i dati di vendita mensili dal server
async function fetchVenditeMensili(venditoreId) {
    try {
        const response = await fetch(`/vendite-mensili/${venditoreId}`); // Cambia con il tuo endpoint
        if (!response.ok) {
            throw new Error(`Errore durante il fetch: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Errore durante il fetch delle vendite mensili:", error);
        return null; // In caso di errore, ritorna null
    }
}

// Funzione per creare il grafico
async function creaGrafico() {
    let found = false;
    const user = JSON.parse(localStorage.getItem("user"));// Ottieni l'ID venditore dal localStorage
    if(user.idvenditore == null)
    {
        found = true;
    } 

    if (found) {
        console.error("ID venditore non trovato nel localStorage.");
        mostraMessaggioNessunDato("Accesso non autorizzato");
        return;
    }

    const datiVendite = await fetchVenditeMensili(user.idvenditore);

    // Controlla se i dati di vendita sono vuoti
    if (!datiVendite || datiVendite.length === 0) {
        mostraMessaggioNessunDato("Nessun dato disponibile per il grafico.");
        return;
    }

    // Estrarre i dati per il grafico
    const mesi = datiVendite.map(d => new Date(d.mese).toLocaleString('default', { month: 'long' }));
    const numeroOrdini = datiVendite.map(d => d.numero_ordini);
    const totaleVendite = datiVendite.map(d => d.totale_vendite);

    // Configurare il grafico con Chart.js
    const ctx = document.getElementById('venditeChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: mesi,
            datasets: [
                {
                    label: 'Numero di Ordini',
                    data: numeroOrdini,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Totale Vendite (€)',
                    data: totaleVendite,
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Mesi'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Valori'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

// Funzione per mostrare un messaggio di errore o mancanza di dati sul canvas
function mostraMessaggioNessunDato(messaggio) {
    const ctx = document.getElementById('venditeChart').getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Pulisce il canvas
    ctx.font = '16px Arial';
    ctx.fillStyle = 'gray';
    ctx.textAlign = 'center';
    ctx.fillText(messaggio, ctx.canvas.width / 2, ctx.canvas.height / 2);
}

// Creare il grafico all'avvio della pagina
document.addEventListener("DOMContentLoaded", () => {
    creaGrafico();
});

document.getElementById("submitService").addEventListener("click", async () => {
    const serviceImage = document.getElementById("serviceImage").files[0];
    const serviceTitle = document.getElementById("serviceTitle").value;
    const serviceDescription = document.getElementById("serviceDescription").value;
    const servicePrice = document.getElementById("servicePrice").value;

    const user = JSON.parse(localStorage.getItem("user"));
    // Log per debug
    console.log("File:", serviceImage);
    console.log("Titolo:", serviceTitle);
    console.log("Descrizione:", serviceDescription);
    console.log("Prezzo:", servicePrice);

    // Verifica se i dati sono validi
    if (!serviceImage || !serviceTitle || !serviceDescription || !servicePrice) {
    alert("Tutti i campi sono obbligatori!");
    return;
    }

    // Costruzione del FormData
    const formData = new FormData();
    formData.append("image", serviceImage);
    formData.append("title", serviceTitle);
    formData.append("description", serviceDescription);
    formData.append("price", servicePrice);
    formData.append("sellerId", user.idvenditore)

    // Debug: verifica il contenuto del FormData
    for (let [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
    }

    try {
    const response = await fetch("/addService", {
        method: "POST",
        body: formData, // Nessun 'Content-Type' manuale!
    });

    if (response.ok) {
        alert("Servizio aggiunto con successo!");
        document.getElementById("serviceForm").reset();
    } else {
        const errorText = await response.text();
        alert(`Errore durante l'aggiunta del servizio: ${errorText}`);
    }
    } catch (error) {
    console.error("Errore:", error);
    alert("Si è verificato un errore durante la connessione al server.");
    }
});


// Funzione per ottenere il team dal server
async function fetchTeam() {
  const team = JSON.parse(localStorage.getItem("teamId"));

  if (!team) {
    renderNoTeam(); // Se non c'è un team salvato
    return;
  }

  try {
    const response = await fetch(`/getTeamMembers/${team}`);
    const members = await response.json(); // Supponiamo che l'API restituisca un array di membri

    if (members.length > 0) {
      renderTeam(members); // Passiamo direttamente i membri alla funzione di rendering
    } else {
      renderNoTeam(); // Se il team esiste ma non ha membri
    }
  } catch (error) {
    console.error("Errore durante il fetch del team:", error);
  }
}


// Funzione per creare un team
async function createTeam() {
  const teamNamePrompt = prompt("Inserisci il nome del nuovo team:");

  const user = JSON.parse(localStorage.getItem("user"));
  if (!teamNamePrompt) return;

  try {
    const response = await fetch("/createTeam", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: teamNamePrompt, userId: user.idu }),
    });

    if (response.ok) {
      const team = await response.json()
      localStorage.setItem("team",JSON.stringify(team))
      renderTeam(teamNamePrompt);
    } else {
      alert("Errore durante la creazione del team.");
    }
  } catch (error) {
    console.error("Errore durante la creazione del team:", error);
  }
}

// Funzione per eliminare un team
async function deleteTeam() {
  if (!confirm("Sei sicuro di voler eliminare il team?")) return;

  try {
    const response = await fetch(apiUrl, { method: "DELETE" });
    if (response.ok) {
      renderNoTeam();
    } else {
      alert("Errore durante l'eliminazione del team.");
    }
  } catch (error) {
    console.error("Errore durante l'eliminazione del team:", error);
  }
}

function renderTeam(members) {
  noTeamSection.classList.add("d-none");
  teamTableContainer.classList.remove("d-none");

  // Ottieni il nome del team dal primo membro (presupponendo che ogni membro abbia un riferimento al team)
  const team = members[0].teamName; // Assumi che `teamName` sia una proprietà restituita dall'API
  teamName.textContent = team;

  // Popola la tabella con i membri del team
  teamTableBody.innerHTML = members
    .map(
      (member, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${member.name}</td>
      <td>${member.role}</td>
      <td>
            ${
              member.role.toLowerCase() === "owner"
                ? ""
                : `<button class="btn btn-danger btn-sm" onclick="removeMember(${member.id})">Rimuovi</button>`
            }
          </td>
    </tr>`
    )
    .join("");
}

async function removeMember(memberId) {
  if (!confirm("Sei sicuro di voler rimuovere questo membro?")) return;

  try {
    const response = await fetch(`/removeMember`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId }),
    });

    if (response.ok) {
      fetchTeam(); // Ricarica il team dopo la rimozione
    } else {
      alert("Errore durante la rimozione del membro.");
    }
  } catch (error) {
    console.error("Errore durante la rimozione del membro:", error);
  }
}

// Funzione per visualizzare la sezione senza team
function renderNoTeam() {
  noTeamSection.classList.remove("d-none");
  teamTableContainer.classList.add("d-none");
}

// Event listener
createTeamBtn.addEventListener("click", createTeam);
deleteTeamBtn.addEventListener("click", deleteTeam);






