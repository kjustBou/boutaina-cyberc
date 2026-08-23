
/*--Sélecteurs DOM:
Tu récupères les éléments dont tu as besoin.

--Événements:
Tu dis : “Quand l’utilisateur clique, fais ça"
btn.addEventListener('click', () => {
  console.log('clicked');
});

Fonctions utilitaires:
Ce sont des fonctions qui ne touchent pas le DOM.
Elles servent à transformer des données, filtrer, trier, etc.
function formatName(name) {
  return name.toUpperCase();
}

-Fonctions d’affichage (render):Ce sont les fonctions qui créent ou modifient le HTML.
function renderProducts(products) {
  const container = document.querySelector('.products');
  container.innerHTML = '';

  products.forEach(product => {
    container.innerHTML += `<div class="product-card">${product.name}</div>`;
  });
}   ---JS injecter JSON dans HTML

Appels API: Tu récupères la data.
async function getProducts() {
  const res = await fetch('/api/products');
  const data = await res.json();
  renderProducts(data);   --JS fetch API
}

-Initialisation (init())
function init() {
  getProducts();
  setupEvents();
}

init();*/

"use strict";

//const { mainModule } = require("node:process");

console.log("Javascript chargé !");


//HEADER (Logo, et menu nav déroulant)  





  const menuButton = document.querySelector(".menu-button");
  const menu = document.querySelector(".menu");

  menuButton.addEventListener("click", () => {
    menu.classList.toggle("open");
});




/*function createHeader() {
  const header = document.querySelector("header")

  const logo = document.getElementById(".logo-DJB")

  
  header.appendChild(logo);
  header.appendChild(title);
  
  return header;

}

  document.body.appendChild(createHeader());
 

//HERO SECTION (h1, h2 et cta)

function createHero() {

  const main = document.querySelector("main");

  const hero = document.querySelector("hero");
  
  const title = document.createElement("h1");
  title.textContent = "DJB";

  const motto = document.createElement("h2");
  motto.textContent = "The place where you regonize your strengths";
  motto.classList.add("motto");

  const cta = document.createElement("a");
  cta.textContent = "COME TRAIN WITH US";
  cta.href = "joinUs.html";
  cta.classList.add("button-cta");

  main.appendChild(hero);
  hero.appendChild(title);
  hero.appendChild(motto);
  hero.appendChild(cta);
  
  return hero;
}
  
  document.body.appendChild(createHero());


function createAbout() {
  const about = document.createElement("section");
  about.classList.add("about");

  const title = document.createElement("h1");
  title.textContent = "Learn on the philosophy behind our studio";

  const philo = document.createElement("p");
  philo.textContent = "The story behind our gym is need for a space where minds and bodies reunite to learn, practice and create, martial arts is their various forms."
  
  about.appendChild(title);
  about.appendChild(philo);

  return about
}

  document.body.appendChild(createAbout());


//FOOTER 

  function createFooter() {

  const footer = document.querySelector("footer");
    
  const logo = createLogo();

  const address = document.querySelector(".address");
  address.innerHTML = "Bonjour";

  const addressTitle = document.createElement("h3");
  addressTitle.textContent = "Visit Us";

  const street = document.createElement("p");
  street.textContent = "3661 Thomas Drive, Montreal, Quebec (QC), H2L 1A1"
  
  const map = document.createElement("iframe");
  map.src = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7911.625930825244!2d-73.54622606519816!3d45.48627615247755!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4cc91a8c179af69b%3A0xc619bc40654dd5fe!2sEspace%20VERRE!5e0!3m2!1sfr!2sca!4v1786561237122!5m2!1sfr!2sca";
  map.classList.add("location");

  //footer.appendChild(address);

  return footer;
}*/





