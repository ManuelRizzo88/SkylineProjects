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