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


        const disciplinesContainer = document.querySelector(".disciplines");
        console.log( disciplinesContainer);
        
        function afficherData(disciplines, coaches) {

            disciplines.forEach((discipline, index) => {
        
                const disciplineCard = document.createElement("div");
                disciplineCard.classList.add("discipline-card");
                disciplineCard.classList.add(`discipline-card-${index + 1}`);
                disciplinesContainer.appendChild(disciplineCard);
                
        
                const disciplineImage = document.createElement("img");
                disciplineImage.classList.add("discipline-image");
                disciplineImage.classList.add(`discipline-image-${index + 1}`);
                disciplineImage.src = discipline.img;
                disciplineCard.appendChild(disciplineImage);

                const disciplineTextBox = document.createElement("div");
                disciplineCard.appendChild(disciplineTextBox);


                const disciplineName = document.createElement("h2");
                disciplineName.classList.add("discipline-name");
                disciplineName.classList.add(`discipline-name-${index + 1}`);
                disciplineName.innerHTML = discipline.name;

                disciplineTextBox.appendChild(disciplineName);
                
            });
        }
        
        afficherData(disciplinesData, coachesData);
        
    } catch (error) {

        console.error("Erreur :", error);
        alert("Erreur : " + error.message);

    }
    
}
