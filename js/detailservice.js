const OpenModalBTN = document.getElementById("OpenModalBTN")
OpenModalBTN.addEventListener("click",openModal)
const CloseModalBTN = document.getElementById("CloseModalBTN")
OpenModalBTN.addEventListener("click",closeModal)

document.addEventListener("DOMContentLoaded", async () => {
    const content = document.getElementById("details-content");

    // Ottieni i parametri dalla query string dell'URL
    const params = new URLSearchParams(window.location.search); // Correzione qui
    const serviceId = params.get("id"); // Ottieni l'ID del servizio

    try {
        // Effettua una richiesta al backend per ottenere i dettagli del servizio
        const response = await fetch(`/services/${serviceId}`);
        if (!response.ok) {
            throw new Error("Errore nel recupero dei dettagli del servizio.");
        }
        const service = await response.json();


        console.log(service)

        // Popola la pagina con i dettagli del servizio
        document.getElementById("servicedetails-title").textContent = `${service.titolo}`;
        document.getElementById("servicedetails-description").textContent = `${service.descrizione}`;
        document.getElementById("servicedetails-price").textContent = `Prezzo: ${service.prezzo}€`;
        document.getElementById("servicedetails-image").src = `data:image/jpeg;base64,${service.image}`;
    } catch (error) {
        console.error("Errore nel Caricamento dei dettagli:", error);
    }
});

function openModal() {
    const modal = document.getElementById("descriptionModal");
    modal.style.display = "block";
}

function closeModal() {
    const modal = document.getElementById("descriptionModal");
    modal.style.display = "none";
}

const orderBTN = document.getElementById("conferma-ordine")
orderBTN.addEventListener("click", orderNow)

const params = new URLSearchParams(window.location.search); // Correzione qui
const serviceId = params.get("id");

const response = await fetch(`/services/${serviceId}`);
        if (!response.ok) {
            throw new Error("Errore nel recupero dei dettagli del servizio.");
        }
        const service = await response.json();

async function orderNow() {
    const user = localStorage.getItem("user")
    JSON.parse(user)
    let Data = Data.getDate()
    
    const orderData = {
        descrizione: "", // Puoi personalizzare
        stato: "In attesa",
        scadenza: Data, // Imposta la data di scadenza desiderata
        idVenditore: service.idvenditore, // Cambia con l'ID del venditore
        idCliente: user.idCliente, // Cambia con l'ID del cliente
        prezzo: service.prezzo, // Cambia con il prezzo del servizio
        fattura: null
    };

    try {
        const response = await fetch('/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });

        const result = await response.json();

        if (response.ok) {
            alert("Ordine creato con successo! ID Ordine: " + result.ordine.idordine);
        } else {
            console.error("Errore:", result.error);
            alert("Errore durante la creazione dell'ordine: " + result.error);
        }
    } catch (error) {
        console.error("Errore:", error);
        alert("Errore durante la creazione dell'ordine.");
    }
}
