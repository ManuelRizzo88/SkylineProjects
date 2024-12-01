async function fetchVenditeMensili(venditoreId) {
    const response = await fetch(`/vendite-mensili/${venditoreId}`); // Cambia con il tuo endpoint
    return response.json();
}

async function creaGrafico() {
    const venditoreId = 1; // Cambia con l'ID del venditore
    const datiVendite = await fetchVenditeMensili(venditoreId);

    // Controllo se i dati sono vuoti
    if (!datiVendite || datiVendite.length === 0) {
        mostraMessaggioNessunDato();
        return;
    }

    // Estrarre i dati
    const mesi = datiVendite.map(d => new Date(d.mese).toLocaleString('default', { month: 'long' }));
    const numeroOrdini = datiVendite.map(d => d.numero_ordini);
    const totaleVendite = datiVendite.map(d => d.totale_vendite);

    // Configurare il grafico
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

// Funzione per mostrare un messaggio quando non ci sono dati
function mostraMessaggioNessunDato() {
    const ctx = document.getElementById('venditeChart').getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Pulisce il canvas
    ctx.font = '16px Arial';
    ctx.fillStyle = 'gray';
    ctx.textAlign = 'center';
    ctx.fillText('Dati non trovati', ctx.canvas.width / 2, ctx.canvas.height / 2);
}

// Creare il grafico all'avvio della pagina
creaGrafico();
