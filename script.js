// Benin - Login-side

let valgtRolle = "";

const patientKnap = document.getElementById("patientKnap");
const personaleKnap = document.getElementById("personaleKnap");
const loginForm = document.getElementById("loginForm");

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

    if (valgtRolle === "patient") {
        window.location.href = "2-registrering-af-hjemmemaaling.html";
    }

    if (valgtRolle === "personale") {
        window.location.href = "4-sundhedspersonalets-patientoversigt.html";
    }
});
