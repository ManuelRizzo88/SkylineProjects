// Seleziona gli elementi
const themeSwitcher = document.getElementById('themeSwitcher');
const body = document.body;
const themeIcon = themeSwitcher.querySelector('i');

// Avvia con il tema scuro e l'icona del sole
body.classList.add('dark-theme');
themeIcon.classList.replace('fa-moon', 'fa-sun');

// Aggiungi evento click per alternare i temi
themeSwitcher.addEventListener('click', () => {
    body.classList.toggle('dark-theme');

    // Cambia l'icona in base al tema
    if (body.classList.contains('dark-theme')) {
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    } else {
        themeIcon.classList.replace('fa-sun', 'fa-moon');
    }
});


const dropdownButton = document.querySelector('#dropdownMenuLink');

// Aggiungi un evento di click per cambiare la classe dell'icona
dropdownButton.addEventListener('click', function() {
    const icon = dropdownButton.querySelector('i');  // Seleziona l'icona all'interno del bottone
    
    // Controlla se l'icona è quella di freccia giù e cambia la classe
    if (icon.classList.contains('fa-caret-down')) {
        icon.classList.remove('fa-caret-down');  // Rimuove la freccia giù
        icon.classList.add('fa-caret-up');  // Aggiunge la freccia su
    } else {
        icon.classList.remove('fa-caret-up');  // Rimuove la freccia su
        icon.classList.add('fa-caret-down');  // Aggiunge la freccia giù
    }
});

window.addEventListener('load', function() {
    const loadingScreen = document.getElementById('loadingScreen');
    // Aggiungi la classe per far sparire la schermata di caricamento
    loadingScreen.classList.add('fade-out');
});