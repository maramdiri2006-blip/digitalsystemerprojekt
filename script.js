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

    if (valgtRolle === "patient") {
        window.location.href = "2-registrering-af-hjemmemaaling.html";
    }

    if (valgtRolle === "personale") {
        window.location.href = "4-sundhedspersonalets-patientoversigt.html";
    }
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

});


}
