// Funzione per ottenere i dati di vendita mensili dal server
async function fetchVenditeMensili(venditoreId) {
    try {
        const response = await fetch(`http://localhost:3000/vendite-mensili/${venditoreId}`); // Cambia con il tuo endpoint
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
    const serviceImage = document.getElementById('serviceImage').value;
    const serviceTitle = document.getElementById('serviceTitle').value;
    const serviceDescription = document.getElementById('serviceDescription').value;
    const servicePrice = document.getElementById('servicePrice').value;

    // Recupero idVenditore dal localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    const idVenditore = user.idvenditore;
    if (!idVenditore) {
        alert("ID venditore non trovato. Assicurati di aver effettuato l'accesso.");
        return;
    }

    // Creazione del payload
    const serviceData = {
        image: serviceImage,
        title: serviceTitle,
        description: serviceDescription,
        price: parseFloat(servicePrice),
        sellerId: idVenditore
    };

    try {
        // Invio dei dati al backend
        const response = await fetch('/addService', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(serviceData)
        });

        if (response.ok) {
            alert('Servizio aggiunto con successo!');
            document.getElementById('serviceForm').reset();
            const modal = bootstrap.Modal.getInstance(document.getElementById('addServiceModal'));
            modal.hide();
        } else {
            alert('Errore durante l\'aggiunta del servizio. Riprova.');
        }
    } catch (error) {
        console.error('Errore:', error);
        alert('Si è verificato un errore durante la connessione al server.');
    }
});

