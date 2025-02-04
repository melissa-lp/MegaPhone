// main.js
window.addEventListener("scroll", function () {
    const header = document.querySelector("header");
    header.classList.toggle("abajo", window.scrollY > 0);
});

let question = document.querySelectorAll('.question');
let btnDropdown = document.querySelectorAll('.question .more');
let answer = document.querySelectorAll('.answer');
let parrafo = document.querySelectorAll('.answer p');

for (let i = 0; i < btnDropdown.length; i++) {
    let altoParrafo = parrafo[i].clientHeight;
    let switchc = 0;

    btnDropdown[i].addEventListener('click', () => {
        if (switchc == 0) {
            answer[i].style.height = `${altoParrafo}px`;
            question[i].style.marginBottom = '10';
            btnDropdown[i].innerHTML = '<i>-</i>';
            switchc++;
        } else if (switchc == 1) {
            answer[i].style.height = `0`;
            question[i].style.marginBottom = '0';
            btnDropdown[i].innerHTML = '<i>+</i>';
            switchc--;
        }
    });
}

// Función para cargar un archivo HTML dentro de un elemento específico
function loadComponent(file, elementId) {
    fetch(file)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al cargar ${file}: ${response.statusText}`);
            }
            return response.text();
        })
        .then(data => {
            document.getElementById(elementId).innerHTML = data;

            // Actualizar el navbar después de cargarlo
            if (elementId === 'header') {
                updateNavbar();
            }
        })
        .catch(error => {
            console.error(error);
        });
}

// Cargar el encabezado
loadComponent('../views/navbar.html', 'header');

// Cargar el pie de página
loadComponent('../views/footer.html', 'footer');
