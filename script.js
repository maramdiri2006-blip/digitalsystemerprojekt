// Benin - Login-side

let valgtRolle = "";

const patientKnap = document.getElementById("patientKnap");
const personaleKnap = document.getElementById("personaleKnap");
const loginForm = document.getElementById("loginForm");

if (patientKnap && personaleKnap && loginForm) {

    patientKnap.addEventListener("click", function() {
        valgtRolle = "patient";

        patientKnap.classList.add("valgt");
        personaleKnap.classList.remove("valgt");
    });

    personaleKnap.addEventListener("click", function() {
        valgtRolle = "personale";

        personaleKnap.classList.add("valgt");
        patientKnap.classList.remove("valgt");
    });

    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const brugernavn = document.getElementById("brugernavn").value;
        const password = document.getElementById("password").value;

        if (valgtRolle === "") {
            alert("Vælg Patient eller Sundhedspersonale");
            return;
        }

       if (valgtRolle === "patient" && brugernavn === "erik" && password === "1234") {
            window.location.href = "2-registrering-af-hjemmemaaling.html";
            return;
        }

        if (valgtRolle === "personale" && brugernavn === "personale" && password === "1234") {
            window.location.href = "4-sundhedspersonalets-patientoversigt.html";
            return;
        }

        alert("Forkert brugernavn eller adgangskode");
    });
}
// Sena - registrering af hjemmemåling

const maalingForm = document.getElementById("maalingForm");

if (maalingForm) {

maalingForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const dato = document.getElementById("dato").value;
    const systolisk = document.getElementById("systolisk").value;
    const diastolisk = document.getElementById("diastolisk").value;
    const puls = document.getElementById("puls").value;
    const symptomer = document.getElementById("symptomer").value;
    const tilstand = document.getElementById("tilstand").value;
    const note = document.getElementById("note").value;

    const maaling = {
    dato: dato,
    systolisk: systolisk,
    diastolisk: diastolisk,
    puls: puls,
    symptomer: symptomer,
    tilstand: tilstand,
    note: note

};

localStorage.setItem("senesteMaaling", JSON.stringify(maaling));

alert("Målingen er gemt");

window.location.href = "3-patientens-maaleoversigt.html";

});


}


// Maram - patientens måleoversigt

const visSystolisk = document.getElementById("visSystolisk");
const visDiastolisk = document.getElementById("visDiastolisk");
const visPuls = document.getElementById("visPuls");
const visDato = document.getElementById("visDato");
const visSymptomer = document.getElementById("visSymptomer");
const visTilstand = document.getElementById("visTilstand");
const visNote = document.getElementById("visNote");
const gemtMaaling = localStorage.getItem("senesteMaaling");

if (visSystolisk && gemtMaaling) {
    const maaling = JSON.parse(gemtMaaling);
    visSystolisk.textContent = maaling.systolisk;
    visDiastolisk.textContent = maaling.diastolisk;
    visPuls.textContent = maaling.puls;
    visDato.textContent = new Date(maaling.dato).toLocaleString("da-DK");
    visSymptomer.textContent = maaling.symptomer;
    visTilstand.textContent = maaling.tilstand;
    visNote.textContent = maaling.note;
}


// Patientdetaljer - sundhedspersonale

const personaleDato = document.getElementById("personaleDato");
const personaleSystolisk = document.getElementById("personaleSystolisk");
const personaleDiastolisk = document.getElementById("personaleDiastolisk");
const personalePuls = document.getElementById("personalePuls");
const personaleSymptomer = document.getElementById("personaleSymptomer");
const personaleTilstand = document.getElementById("personaleTilstand");
const personaleNote = document.getElementById("personaleNote");

const personaleMaaling = localStorage.getItem("senesteMaaling");

if (personaleDato && personaleMaaling) {
    const maaling = JSON.parse(personaleMaaling);

    personaleDato.textContent = new Date(maaling.dato).toLocaleString("da-DK");
    personaleSystolisk.textContent = maaling.systolisk;
    personaleDiastolisk.textContent = maaling.diastolisk;
    personalePuls.textContent = maaling.puls;
    personaleSymptomer.textContent = maaling.symptomer;
    personaleTilstand.textContent = maaling.tilstand;
    personaleNote.textContent = maaling.note;
}