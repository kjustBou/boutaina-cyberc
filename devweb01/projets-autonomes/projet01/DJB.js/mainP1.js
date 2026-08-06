
fetch("productions.json")  peut dire gérer le flot d'information?


//ou api 

fetch("https://api.exemple.com/classes")

/*chargerMenu()

chargerFooter()

charger disciplines() */
const disciplines = [];
const coaches = [];

const coachContainer = document.querySelector("#coaches-list");

if (coachContainer) {
    afficherCoachs();

}