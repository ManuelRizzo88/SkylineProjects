// Seleziona gli elementi
const themeSwitcher = document.getElementById("themeSwitcher");
const body = document.body;
const themeIcon = themeSwitcher.querySelector("i");

// Avvia con il tema scuro e l'icona del sole
body.classList.add("dark-theme");
themeIcon.classList.replace("fa-moon", "fa-sun");

// Aggiungi evento click per alternare i temi
themeSwitcher.addEventListener("click", () => {
  body.classList.toggle("dark-theme");

  // Cambia l'icona in base al tema
  if (body.classList.contains("dark-theme")) {
    themeIcon.classList.replace("fa-moon", "fa-sun");
  } else {
    themeIcon.classList.replace("fa-sun", "fa-moon");
  }
});

const dropdownButton = document.querySelector("#dropdownMenuLink");

// Aggiungi un evento di click per cambiare la classe dell'icona
dropdownButton.addEventListener("click", function () {
  const icon = dropdownButton.querySelector("i"); // Seleziona l'icona all'interno del bottone

  // Controlla se l'icona è quella di freccia giù e cambia la classe
  if (icon.classList.contains("fa-caret-down")) {
    icon.classList.remove("fa-caret-down"); // Rimuove la freccia giù
    icon.classList.add("fa-caret-up"); // Aggiunge la freccia su
  } else {
    icon.classList.remove("fa-caret-up"); // Rimuove la freccia su
    icon.classList.add("fa-caret-down"); // Aggiunge la freccia giù
  }
});

window.addEventListener("load", function () {
  const loadingScreen = document.getElementById("loadingScreen");
  // Aggiungi la classe per far sparire la schermata di caricamento
  loadingScreen.classList.add("fade-out");
});

document.addEventListener("DOMContentLoaded", async () => {
  const carouselContent = document.querySelector(".carousel-content");

  try {
    // Chiamata API per ottenere i servizi
    const response = await fetch("/services");
    const services = await response.json();

    // Aggiungi ogni servizio come card
    services.forEach((service) => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
          <img src="https://via.placeholder.com/200x120" alt="Img Servizio">
          <h3>${service.titolo}</h3>
          <p>${service.descrizione}</p>
          <p class="price">€${service.prezzo}</p>
        `;

      carouselContent.appendChild(card);
    });
  } catch (error) {
    console.error("Errore nel caricamento dei servizi:", error);
  }
});

// Funzioni per scorrere
document.querySelector(".prev").addEventListener("click", () => {
  document
    .querySelector(".carousel-content")
    .scrollBy({ left: -220, behavior: "smooth" });
});

document.querySelector(".next").addEventListener("click", () => {
  document
    .querySelector(".carousel-content")
    .scrollBy({ left: 220, behavior: "smooth" });
});
