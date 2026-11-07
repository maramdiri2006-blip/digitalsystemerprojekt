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

maalingForm.addEventListener("submit", async function(event) {
    event.preventDefault();
    const dato = document.getElementById("dato").value;
    const systolisk = document.getElementById("systolisk").value;
    const diastolisk = document.getElementById("diastolisk").value;
    const puls = document.getElementById("puls").value;
    const symptomer = document.getElementById("symptomer").value;
    const tilstand = document.getElementById("tilstand").value;
    const note = document.getElementById("note").value;

    const maaling = {
  patient_id: 1,
  dato: dato,
  systolisk: Number(systolisk),
  diastolisk: Number(diastolisk),
  puls: Number(puls),
  symptomer: symptomer,
  tilstand: tilstand,
  note: note
};


try {
  const svar = await fetch("http://localhost:3000/api/maalinger", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(maaling)
  });

  const resultat = await svar.json();

  if (!svar.ok) {
    throw new Error(resultat.error || "Målingen kunne ikke gemmes");
  }

  localStorage.setItem("senesteMaaling", JSON.stringify(maaling));

  alert("Målingen er gemt i databasen");
  window.location.href = "3-patientens-maaleoversigt.html";
} catch (fejl) {
  alert(fejl.message);
}

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
async function visSenesteMaaling() {
  try {
    const svar = await fetch(
      "http://localhost:3000/api/patients/1/maalinger"
    );

    if (!svar.ok) {
      throw new Error("Målingerne kunne ikke hentes");
    }

    const maalinger = await svar.json();
    const historik = document.getElementById("maalingHistorik");
const besked = document.getElementById("historikBesked");

if (historik && besked) {
  historik.replaceChildren();

  const tidligereMaalinger = maalinger.slice(1);

  for (const maaling of tidligereMaalinger) {
    const række = historik.insertRow();

    const værdier = [
      new Date(maaling.dato).toLocaleString("da-DK"),
      maaling.systolisk,
      maaling.diastolisk,
      maaling.puls,
      maaling.symptomer || "Ingen symptomer",
      maaling.tilstand || "Ikke angivet",
      maaling.note || "Ingen note"
    ];

    for (const værdi of værdier) {
      række.insertCell().textContent = værdi;
    }
  }

  besked.textContent = tidligereMaalinger.length === 0
    ? "Ingen tidligere målinger"
    : "";
}
    const maaling = maalinger[0];

    if (!maaling) {
      visDato.textContent = "Ingen målinger endnu";
      return;
    }

    visSystolisk.textContent = maaling.systolisk;
    visDiastolisk.textContent = maaling.diastolisk;
    visPuls.textContent = maaling.puls;
    visDato.textContent =
      new Date(maaling.dato).toLocaleString("da-DK");
    visSymptomer.textContent = maaling.symptomer || "Ingen symptomer";
    visTilstand.textContent = maaling.tilstand || "–";
    visNote.textContent = maaling.note || "Ingen note";
  } catch (fejl) {
    visDato.textContent = "Målingen kunne ikke hentes";
    console.error(fejl);
  }
}

if (visSystolisk) {
  visSenesteMaaling();
}


// Patientdetaljer - sundhedspersonale

const personaleDato = document.getElementById("personaleDato");
const personaleSystolisk = document.getElementById("personaleSystolisk");
const personaleDiastolisk = document.getElementById("personaleDiastolisk");
const personalePuls = document.getElementById("personalePuls");
const personaleSymptomer = document.getElementById("personaleSymptomer");
const personaleTilstand = document.getElementById("personaleTilstand");
const personaleNote = document.getElementById("personaleNote");

async function visPatientdetaljer() {
  const navn = document.getElementById("personaleNavn");
  const cpr = document.getElementById("personaleCpr");
  const idFelt = document.getElementById("personalePatientId");

  const felter = [
    personaleSystolisk,
    personaleDiastolisk,
    personalePuls,
    personaleSymptomer,
    personaleTilstand,
    personaleNote
  ];

  for (const felt of felter) {
    felt.textContent = "";
  }

  personaleDato.textContent = "Henter målinger…";

  const parametre = new URLSearchParams(window.location.search);
  const patientId = Number(parametre.get("patientId"));

  try {
    if (!Number.isInteger(patientId) || patientId < 1) {
      throw new Error("Vælg en patient fra patientoversigten");
    }

    const patientSvar = await fetch(
      "http://localhost:3000/api/patients"
    );

    if (!patientSvar.ok) {
      throw new Error("Patientoplysninger kunne ikke hentes");
    }

    const patienter = await patientSvar.json();
    const patient = patienter.find(p => p.id === patientId);

    if (!patient) {
      throw new Error("Patienten findes ikke");
    }

    navn.textContent = patient.navn;
    cpr.textContent = patient.cpr;
    idFelt.textContent = patient.id;

    const svar = await fetch(
      `http://localhost:3000/api/patients/${patientId}/maalinger`
    );

    if (!svar.ok) {
      throw new Error("Målingerne kunne ikke hentes");
    }

    const maalinger = await svar.json();
    const historik = document.getElementById("personaleHistorik");
const besked = document.getElementById("personaleHistorikBesked");

if (historik && besked) {
  historik.replaceChildren();

  for (const maaling of maalinger) {
    const række = historik.insertRow();

    const værdier = [
      new Date(maaling.dato).toLocaleString("da-DK"),
      maaling.systolisk,
      maaling.diastolisk,
      maaling.puls,
      maaling.symptomer || "Ingen symptomer",
      maaling.tilstand || "Ikke angivet",
      maaling.note || "Ingen note"
    ];

    for (const værdi of værdier) {
      række.insertCell().textContent = værdi;
    }
  }

  besked.textContent = maalinger.length === 0
    ? "Ingen målinger registreret for denne patient"
    : "";
}
    const maaling = maalinger[0];

    if (!maaling) {
      personaleDato.textContent = "Ingen målinger endnu";
      return;
    }

    personaleDato.textContent =
      new Date(maaling.dato).toLocaleString("da-DK");
    personaleSystolisk.textContent = maaling.systolisk;
    personaleDiastolisk.textContent = maaling.diastolisk;
    personalePuls.textContent = maaling.puls;
    personaleSymptomer.textContent =
      maaling.symptomer || "Ingen symptomer";
    personaleTilstand.textContent =
      maaling.tilstand || "Ikke angivet";
    personaleNote.textContent = maaling.note || "Ingen note";
  } catch (fejl) {
    if (navn.textContent === "Henter patient…") {
      navn.textContent = "Patienten kunne ikke vises";
    }

    personaleDato.textContent = fejl.message;
    console.error(fejl);
  }
}

if (personaleDato) {
  visPatientdetaljer();
}

const patientTabel = document.getElementById("patientTabel");

async function hentPatienter() {
    try {
        const svar = await fetch("http://localhost:3000/api/patients");

        if (!svar.ok) {
            throw new Error("Patientlisten kunne ikke hentes.");
        }

        const patienter = await svar.json();

        for (const patient of patienter) {
            const række = patientTabel.insertRow();
            række.insertCell().textContent = patient.navn;
            række.insertCell().textContent = patient.cpr;
            række.insertCell().textContent = "–";
            række.insertCell().textContent = "–";
           const handling = række.insertCell();
const link = document.createElement("a");

link.textContent = "Se patient";
link.href = `5-patientdetaljer.html?patientId=${patient.id}`;

handling.appendChild(link);
        }
    } catch (fejl) {
        const celle = patientTabel.insertRow().insertCell();
        celle.colSpan = 5;
        celle.textContent = "Patientlisten kunne ikke hentes.";
        console.error(fejl);
    }
}

if (patientTabel) {
    hentPatienter();
}