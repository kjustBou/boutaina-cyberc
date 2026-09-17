const header = document.querySelector("header");
const heroWrapper = document.querySelector(".hero-wrapper");

if (header && heroWrapper) {
    header.classList.add("transparent");

    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.remove("transparent");
        } else { 
            header.classList.add("transparent");
        }
    });
}

const menuButton = document.querySelector(".menu-button");
const menu = document.querySelector(".menu");

if (menu)
  menuButton.addEventListener("click", () => {
    menu.classList.toggle("open");
});

getApiInfo();

async function getApiInfo() {

    try {

        // on fetch mma.json
        const responseTeams = await fetch("./mma.json");

        if (!responseTeams.ok) {
            throw new Error(`Erreur HTTP Teams ! Statut : ${responseTeams.status}`);
        }

        const data = await responseTeams.json();
        const disciplinesData = data.mma.disciplines;
        const coachesData = data.mma.coaches;

        console.log(disciplinesData);
        console.log(coachesData);


        const disciplinesContainer = document.querySelector(".disciplines-container");
        console.log( disciplinesContainer);

        const coachesContainer = document.querySelector(".coaches-container");
        console.log(coachesContainer);
    
        /*const disciplinesIntro = document.createElement("div");
        disciplinesIntro.classList.add("discipline-intro");

        disciplinesContainer.appendChild(disciplinesIntro);

        const disciplinesAction = document.createElement("h1");
        disciplinesAction.classList.add("disciplines-action");
        disciplinesAction.textContent = "Discover our disciplines";

        disciplinesIntro.appendChild(disciplinesAction);
        
        const discipSpan = document.createElement("span");
        discipSpan.classList.add("discipline-span");
        discipSpan.textContent = "Click on each card to learn more";

        disciplinesIntro.appendChild(discipSpan);

        const coachIntro = document.createElement("h1");
        coachIntro.classList.add("coach-intro");
        coachIntro.textContent = "Come meet our team of instructors";
        coachesContainer.appendChild(coachIntro);*/

        function afficherData(disciplines, coaches) {

            disciplines.forEach((discipline, index) => {
                //CARTE
                const disciplineCard = document.createElement("div");
                disciplineCard.classList.add("discipline-card");
                disciplineCard.classList.add(`discipline-card-${index + 1}`);
            

                disciplinesContainer.appendChild(disciplineCard);
                
                //Conteneur qui va tourner
                const cardInner = document.createElement("div");
                cardInner.classList.add("card-inner");

                disciplineCard.appendChild(cardInner);

                //Face avant
                const cardFront = document.createElement("div");
                cardFront.classList.add("card-front");

                cardInner.appendChild(cardFront);

                const disciplineImage = document.createElement("img");
                disciplineImage.classList.add("discipline-image");
                disciplineImage.classList.add(`discipline-image-${index + 1}`);
                disciplineImage.src = discipline.img;

                cardFront.appendChild(disciplineImage);

                //Face arrière
                const cardBack = document.createElement("div");
                cardBack.classList.add("card-back");

                cardInner.appendChild(cardBack);

                const disciplineTextBox = document.createElement("div");
                disciplineTextBox.classList.add("discipline-textBox");

                cardBack.appendChild(disciplineTextBox);


                const disciplineName = document.createElement("h2");
                disciplineName.classList.add("discipline-name");
                disciplineName.classList.add(`discipline-name-${index + 1}`);
                disciplineName.textContent = discipline.name;

                disciplineTextBox.appendChild(disciplineName);

                const disciplineTagline = document.createElement("h3");
                disciplineTagline.classList.add("discipline-tagline");
                disciplineTagline.classList.add(`discipline-tagline-${index + 1}`);
                disciplineTagline.textContent = discipline.tagline;

                disciplineTextBox.appendChild(disciplineTagline);

                const disciplineDesc = document.createElement("p");
                disciplineDesc.classList.add("discipline-desc");
                disciplineDesc.classList.add(`discipline-desc-${index + 1}`);
                disciplineDesc.textContent = discipline.description;

                disciplineTextBox.appendChild(disciplineDesc);

                disciplineCard.addEventListener("click",() => {
                    disciplineCard.classList.toggle("flipped");
                });

                
            });

        
                
            coaches.forEach((coach, index) => {

                const coachCard = document.createElement("div");
                coachCard.classList.add("coach-card");
                coachCard.classList.add(`coach-card-${index + 1}`);

                coachesContainer.appendChild(coachCard);

                const coachImage = document.createElement("img");
                coachImage.classList.add("coach-image");
                coachImage.classList.add(`coach-image-${index +1}`);
                coachImage.src = coach.img; 

                coachCard.appendChild(coachImage);

                const coachTextCard = document.createElement("div");
                coachTextCard.classList.add("coach-text-card");
                coachTextCard.classList.add(`coach-text-card-${index + 1}`);

                coachCard.appendChild(coachTextCard);

                const coachName = document. createElement("h3");
                coachName.classList.add("coach-name");
                coachName.classList.add(`coach-name-${index +1}`);
                coachName.textContent = coach.name;

                coachTextCard.appendChild(coachName);

                const coachExperience = document.createElement("span");
                coachExperience.textContent = `${coach.experience} years of experience`;

                coachTextCard.appendChild(coachExperience);

                const coachSession = document.createElement("span");
                coachSession.classList.add("coach-session") ;
                coachSession.textContent = `${coach.session} sessions`;
                
                coachTextCard.appendChild(coachSession);

                const coachDiscipline = document.createElement("span");
                coachDiscipline.classList.add("coach-discipline");
                coachDiscipline.textContent = `Specialized in: ${coach.discipline}`;

                coachTextCard.appendChild(coachDiscipline);

            });

        }
    
        if (disciplinesContainer && coachesContainer) {
            afficherData(disciplinesData, coachesData);
    }
   
    } catch (error) {

        console.error("Erreur :", error);
        alert("Erreur : " + error.message);

    }
}

//JOIN US PAGE

const form = document.querySelector("#join-form");
const formResponse = document.querySelector("#form-response");

if (form) {
    form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);

    const name = data.get("name").trim();
    const email = data.get("email").trim();
    const discipline = data.get("discipline");
      
      if (name.length < 2 || name.length > 100){
        formResponse.textContent = `Please enter a valid name. (min 2 characters)`;
        formResponse.style.color = "red";
        return;
      }

      if (!email.includes("@")) {
        formResponse.textContent = `Please enter a valid email. (@)`;
        formResponse.style.color ="red";
        return;
      }

      if (!discipline) {
        formResponse.textContent = "Please choose a discipline.";
        formResponse.style.color = "red";
        return;
      }
      
      formResponse.textContent = `Thanks ${name}! We'll contact you soon about ${discipline}.`;
      formResponse.style.color = "black";
      form.reset();
    });
}
