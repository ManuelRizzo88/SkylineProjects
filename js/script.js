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
        <div class="card-img" style="background-image: url('${service.imageurl}');"></div>
        <div class="card-info">
          <p class="text-title">${service.titolo}</p>
          <p class="text-body">${service.descrizione}</p>
        </div>
        <div class="card-footer">
          <span class="text-title">€${service.prezzo}</span>
          <div class="card-button">
            <svg class="svg-icon" viewBox="0 0 20 20">
              <path d="M17.72,5.011H8.026c-0.271,0-0.49,0.219-0.49,0.489c0,0.271,0.219,0.489,0.49,0.489h8.962l-1.979,4.773H6.763L4.935,5.343C4.926,5.316,4.897,5.309,4.884,5.286c-0.011-0.024,0-0.051-0.017-0.074C4.833,5.166,4.025,4.081,2.33,3.908C2.068,3.883,1.822,4.075,1.795,4.344C1.767,4.612,1.962,4.853,2.231,4.88c1.143,0.118,1.703,0.738,1.808,0.866l1.91,5.661c0.066,0.199,0.252,0.333,0.463,0.333h8.924c0.116,0,0.22-0.053,0.308-0.128c0.027-0.023,0.042-0.048,0.063-0.076c0.026-0.034,0.063-0.058,0.08-0.099l2.384-5.75c0.062-0.151,0.046-0.323-0.045-0.458C18.036,5.092,17.883,5.011,17.72,5.011z"></path>
              <path d="M8.251,12.386c-1.023,0-1.856,0.834-1.856,1.856s0.833,1.853,1.856,1.853c1.021,0,1.853-0.83,1.853-1.853S9.273,12.386,8.251,12.386z M8.251,15.116c-0.484,0-0.877-0.393-0.877-0.874c0-0.484,0.394-0.878,0.877-0.878c0.482,0,0.875,0.394,0.875,0.878C9.126,14.724,8.733,15.116,8.251,15.116z"></path>
              <path d="M13.972,12.386c-1.022,0-1.855,0.834-1.855,1.856s0.833,1.853,1.855,1.853s1.854-0.83,1.854-1.853S14.994,12.386,13.972,12.386z M13.972,15.116c-0.484,0-0.878-0.393-0.878-0.874c0-0.484,0.394-0.878,0.878-0.878c0.482,0,0.875,0.394,0.875,0.878C14.847,14.724,14.454,15.116,13.972,15.116z"></path>
            </svg>
          </div>
        </div>
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

/* Funzione per il pulsante Dashboard */
document.addEventListener("DOMContentLoaded", () => {
  const navbarDynamicContent = document.getElementById("navbarDynamicContent");

  // Simula lo stato di autenticazione (modifica questa logica secondo il tuo sistema di autenticazione)
  const isAuthenticated = localStorage.getItem("isLoggedIn") === "true";

  if (isAuthenticated) {
    // Crea il pulsante Dashboard
    const dashboardButton = document.createElement("button");
    dashboardButton.className = "btn btn-nav mx-1";
    dashboardButton.type = "button";
    dashboardButton.textContent = "Dashboard";
    dashboardButton.onclick = () => {
      window.location.href = "dashboard.html";
    };

    // Aggiungi il pulsante Dashboard alla navbar
    navbarDynamicContent.appendChild(dashboardButton);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const navbarDynamicContent = document.getElementById("navbarDynamicContent");
  const dropdownMenuLink = document.getElementById("dropdownMenuLink");
  const dropdownMenu = dropdownMenuLink.nextElementSibling;

  // Verifica se l'utente è autenticato
  const user = JSON.parse(localStorage.getItem("user"));

  if (user) {
    // Aggiorna il nome nel dropdown
    dropdownMenuLink.innerHTML = `${user.username} <i class="fa-solid fa-caret-down" style="margin-left: 5px;"></i>`;

    // Svuota il menu esistente
    dropdownMenu.innerHTML = "";

    // Aggiungi l'opzione "Opzioni"
    const optionsItem = document.createElement("li");
    const optionsLink = document.createElement("a");
    optionsLink.className = "dropdown-item";
    optionsLink.href = "options.html";
    optionsLink.textContent = "Opzioni";
    optionsItem.appendChild(optionsLink);
    dropdownMenu.appendChild(optionsItem);

    // Aggiungi l'opzione "Logout"
    const logoutItem = document.createElement("li");
    const logoutLink = document.createElement("a");
    logoutLink.className = "dropdown-item";
    logoutLink.href = "#";
    logoutLink.textContent = "Logout";
    logoutLink.onclick = () => {
      localStorage.removeItem("user");
      alert("Logout eseguito con successo");
      location.reload();
    };
    logoutItem.appendChild(logoutLink);
    dropdownMenu.appendChild(logoutItem);

    // Aggiungi il pulsante Dashboard
    const dashboardButton = document.createElement("button");
    dashboardButton.className = "btn btn-nav mx-1";
    dashboardButton.type = "button";
    dashboardButton.textContent = "Dashboard";
    dashboardButton.onclick = () => {
      window.location.href = "dashboard.html";
    };
    navbarDynamicContent.appendChild(dashboardButton);
  } else {
    // Gestione del login
    async function login(email, password) {
      try {
        const response = await fetch("http://localhost:3000/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const user = await response.json();
          localStorage.setItem("user", JSON.stringify(user));
          alert(`Benvenuto, ${user.username}!`);
          location.reload();
        } else {
          alert("Credenziali non valide");
        }
      } catch (error) {
        console.error("Errore durante il login:", error);
        alert("Errore del server");
      }
    }

    // Simula il login con un'email e una password (aggiungi un form per login reale)
    document.getElementById("loginButton").addEventListener("click", () => {
      const email = document.getElementById("emailInput").value;
      const password = document.getElementById("passwordInput").value;
      login(email, password);
    });
  }
});
