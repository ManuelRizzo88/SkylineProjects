const modal = document.getElementById("descriptionModal");
const OpenModalBTN = document.getElementById("OpenModalBTN")
OpenModalBTN.addEventListener("click",openModal)
const CloseModalBTN = document.getElementById("CloseModalBTN")
CloseModalBTN.addEventListener("click",closeModal)
const orderBTN = document.getElementById("conferma-ordine")
orderBTN.addEventListener("click", handleOrder);
let service = null

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const serviceId = params.get("id"); // Ottieni l'ID del servizio dall'URL

    // Recupera la data corrente
    

    try {
        // Effettua una richiesta al backend per ottenere i dettagli del servizio
        const response = await fetch(`/services/${serviceId}`);
        if (!response.ok) {
            throw new Error("Errore nel recupero dei dettagli del servizio.");
        }

        service = await response.json(); // Salva i dettagli del servizio nella variabile globale

        // Popola la pagina con i dettagli del servizio
        document.getElementById("servicedetails-title").textContent = service.titolo;
        document.getElementById("servicedetails-description").textContent = service.descrizione;
        document.getElementById("servicedetails-price").textContent = `Prezzo: ${service.prezzo}€`;
        document.getElementById("servicedetails-image").src = `data:image/jpeg;base64,${service.image}`;

        console.table(service)
    } catch (error) {
        console.error("Errore:", error);
        alert("Errore durante il caricamento dei dettagli del servizio.");
    }
});

// Funzione per gestire l'ordine
    async function handleOrder() {
        
        

        if (!service) {
            alert("Servizio non disponibile. Ricarica la pagina.");
            return;
        }

        // Ottieni la descrizione dall'input
        const description = document.getElementById("orderDescription").value;

        if (!description.trim()) {
            alert("La descrizione non può essere vuota.");
            return;
        }

        // Ottieni i dati dell'utente dal localStorage
        const user = JSON.parse(localStorage.getItem("user"));
        console.table(user);

        if (!user || !user.idcliente) {
            alert("Utente non autenticato.");
            return;
        }

        if(user.idvenditore === service.idvenditore)
        {
            alert("Non Puoi Ordinare Da Te Stesso")
            window.location.href = "services.html"
            return;
        }

        // Recupera la data corrente e formatta come YYYY-MM-DD
        const currentDate = new Date().toISOString().split("T")[0];

        // Crea i dati dell'ordine
        const orderData = {
            descrizione: description,
            stato: "In attesa",
            scadenza: currentDate, // Data in formato YYYY-MM-DD
            idVenditore: service.idvenditore,
            idCliente: user.idcliente,
            prezzo: service.prezzo,
            fattura: null,
        };
        console.table(orderData);
        try {
            // Effettua la richiesta POST per creare l'ordine
            const response = await fetch('/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            const result = await response.json();

            if (response.ok) {
                alert("Ordine creato con successo!");
                modal.style.display = "none"
            } else {
                console.error("Errore:", result.error);
                alert("Errore durante la creazione dell'ordine: " + result.error);
            }
        } catch (error) {
            console.error("Errore:", error);
            alert("Errore durante la creazione dell'ordine.");
        }
    }

function openModal() {
    modal.style.display = "block";
}

function closeModal() {
    modal.style.display = "none";
}
