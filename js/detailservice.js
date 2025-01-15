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
        document.getElementById("servicedetails-title").textContent = `${service.title}`;
        document.getElementById("servicedetails-description").innerHTML = `${service.description}`;
        document.getElementById("servicedetails-price").innerHTML = `Prezzo: ${service.price}€`;
        document.getElementById("servicedetails-image").src = `data:image/jpeg;base64,${service.image}`;
    } catch (error) {
        console.error("Errore nel Caricamento dei dettagli:", error);
    }
});
