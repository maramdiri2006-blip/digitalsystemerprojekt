// Fælles hjælpefunktioner

function saetTekst(id, tekst) {
  const felt = document.getElementById(id);

  if (felt) {
    felt.textContent = tekst;
  }
}

function formaterDato(dato) {
  return new Date(dato).toLocaleString("da-DK");
}

function hentValgtPatientId() {
  const patientId = Number(
    sessionStorage.getItem("valgtPatientId")
  );

  if (patientId === 1 || patientId === 2) {
    return patientId;
  }

  return null;
}

async function hentJson(url) {
  const svar = await fetch(url);

  if (!svar.ok) {
    throw new Error("Oplysningerne kunne ikke hentes");
  }

  return svar.json();
}

function visHistorik(tabelId, beskedId, maalinger, tomBesked) {
  const tabel = document.getElementById(tabelId);
  const besked = document.getElementById(beskedId);

  if (!tabel || !besked) {
    return;
  }

  tabel.replaceChildren();

  for (const maaling of maalinger) {
    const raekke = tabel.insertRow();

    const vaerdier = [
      formaterDato(maaling.dato),
      maaling.systolisk,
      maaling.diastolisk,
      maaling.puls,
      maaling.symptomer || "Ingen symptomer",
      maaling.tilstand || "Ikke angivet",
      maaling.note || "Ingen note"
    ];

    for (const vaerdi of vaerdier) {
      raekke.insertCell().textContent = vaerdi;
    }
  }

  besked.textContent = maalinger.length === 0 ? tomBesked : "";
}

function rydMaaling(prefix) {
  const felter = [
    "Systolisk",
    "Diastolisk",
    "Puls",
    "Symptomer",
    "Tilstand",
    "Note"
  ];

  for (const felt of felter) {
    saetTekst(prefix + felt, "");
  }
}

function visMaaling(prefix, maaling) {
  saetTekst(prefix + "Dato", formaterDato(maaling.dato));
  saetTekst(prefix + "Systolisk", maaling.systolisk);
  saetTekst(prefix + "Diastolisk", maaling.diastolisk);
  saetTekst(prefix + "Puls", maaling.puls);
  saetTekst(
    prefix + "Symptomer",
    maaling.symptomer || "Ingen symptomer"
  );
  saetTekst(
    prefix + "Tilstand",
    maaling.tilstand || "Ikke angivet"
  );
  saetTekst(prefix + "Note", maaling.note || "Ingen note");
}


// Benin - Login-side
// Demologin til testpatienter, ikke egentlig adgangskontrol.

let valgtRolle = "";

const patientKnap = document.getElementById("patientKnap");
const personaleKnap = document.getElementById("personaleKnap");
const loginForm = document.getElementById("loginForm");

if (patientKnap && personaleKnap && loginForm) {
  // Et besøg på login-siden nulstiller patientvalget.
  sessionStorage.removeItem("valgtPatientId");

  patientKnap.addEventListener("click", function () {
    valgtRolle = "patient";
    patientKnap.classList.add("valgt");
    personaleKnap.classList.remove("valgt");
  });

  personaleKnap.addEventListener("click", function () {
    valgtRolle = "personale";
    personaleKnap.classList.add("valgt");
    patientKnap.classList.remove("valgt");
  });

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const brugernavn = document
      .getElementById("brugernavn")
      .value.trim()
      .toLowerCase();

    const password = document.getElementById("password").value;

    if (valgtRolle === "") {
      alert("Vælg Patient eller Sundhedspersonale");
      return;
    }

    if (valgtRolle === "patient" && password === "1234") {
      const testPatienter = {
        erik: 1,
        testpatient2: 2
      };

      const patientId = testPatienter[brugernavn];

      if (patientId === 1 || patientId === 2) {
        sessionStorage.setItem(
          "valgtPatientId",
          String(patientId)
        );

        window.location.href =
          "2-registrering-af-hjemmemaaling.html";
        return;
      }
    }

    if (
      valgtRolle === "personale" &&
      brugernavn === "personale" &&
      password === "1234"
    ) {
      sessionStorage.removeItem("valgtPatientId");

      window.location.href =
        "4-sundhedspersonalets-patientoversigt.html";
      return;
    }

    alert("Forkert brugernavn eller adgangskode");
  });
}


// Sena - Registrering af hjemmemåling

const maalingForm = document.getElementById("maalingForm");

if (maalingForm) {
  if (!hentValgtPatientId()) {
    window.location.replace("index.html");
  } else {
    maalingForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const patientId = hentValgtPatientId();

      if (!patientId) {
        alert("Log ind som testpatient først");
        window.location.href = "index.html";
        return;
      }

      const maaling = {
        patient_id: patientId,
        dato: document.getElementById("dato").value,
        systolisk: Number(
          document.getElementById("systolisk").value
        ),
        diastolisk: Number(
          document.getElementById("diastolisk").value
        ),
        puls: Number(document.getElementById("puls").value),
        symptomer: document
          .getElementById("symptomer")
          .value.trim(),
        tilstand: document.getElementById("tilstand").value,
        note: document.getElementById("note").value.trim()
      };

      const gemKnap = maalingForm.querySelector(
        'button[type="submit"], input[type="submit"]'
      );

      if (gemKnap) {
        gemKnap.disabled = true;
      }

      try {
        const svar = await fetch("/api/maalinger", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(maaling)
        });

        const resultat = await svar.json();

        if (!svar.ok) {
          throw new Error(
            resultat.error || "Målingen kunne ikke gemmes"
          );
        }

        alert("Målingen er gemt i databasen");

        window.location.href =
          "3-patientens-maaleoversigt.html";
      } catch (fejl) {
        alert(fejl.message);
      } finally {
        if (gemKnap) {
          gemKnap.disabled = false;
        }
      }
    });
  }
}


// Maram - Patientens måleoversigt

async function visSenesteMaaling() {
  rydMaaling("vis");
  saetTekst("visDato", "Henter målinger…");

  const patientId = hentValgtPatientId();

  if (!patientId) {
    window.location.replace("index.html");
    return;
  }

  try {
    const maalinger = await hentJson(
      `/api/patients/${patientId}/maalinger`
    );

    visHistorik(
      "maalingHistorik",
      "historikBesked",
      maalinger.slice(1),
      "Ingen tidligere målinger"
    );

    const maaling = maalinger[0];

    if (!maaling) {
      saetTekst("visDato", "Ingen målinger endnu");
      return;
    }

    visMaaling("vis", maaling);
  } catch (fejl) {
    saetTekst("visDato", "Målingerne kunne ikke hentes");
    saetTekst(
      "historikBesked",
      "Historikken kunne ikke hentes. Prøv at genindlæse siden."
    );
    console.error(fejl);
  }
}

if (document.getElementById("visSystolisk")) {
  visSenesteMaaling();
}


// Patientdetaljer - Sundhedspersonale

async function visPatientdetaljer() {
  rydMaaling("personale");
  saetTekst("personaleDato", "Henter målinger…");
  saetTekst("personaleNavn", "Henter patient…");
  saetTekst("personaleCpr", "");
  saetTekst("personalePatientId", "");

  const parametre = new URLSearchParams(window.location.search);
  const patientId = Number(parametre.get("patientId"));

  try {
    if (!Number.isInteger(patientId) || patientId < 1) {
      throw new Error("Vælg en patient fra patientoversigten");
    }

    const patienter = await hentJson("/api/patients");
    const patient = patienter.find(
      (person) => person.id === patientId
    );

    if (!patient) {
      throw new Error("Patienten findes ikke");
    }

    saetTekst("personaleNavn", patient.navn);
    saetTekst("personaleCpr", patient.cpr);
    saetTekst("personalePatientId", patient.id);

    const maalinger = await hentJson(
      `/api/patients/${patientId}/maalinger`
    );

    visHistorik(
      "personaleHistorik",
      "personaleHistorikBesked",
      maalinger,
      "Ingen målinger registreret for denne patient"
    );

    const maaling = maalinger[0];

    if (!maaling) {
      saetTekst("personaleDato", "Ingen målinger endnu");
      return;
    }

    visMaaling("personale", maaling);
  } catch (fejl) {
    const navn = document.getElementById("personaleNavn");

    if (navn && navn.textContent === "Henter patient…") {
      navn.textContent = "Patienten kunne ikke vises";
    }

    saetTekst("personaleDato", fejl.message);
    saetTekst(
      "personaleHistorikBesked",
      "Historikken kunne ikke hentes."
    );

    console.error(fejl);
  }
}

if (document.getElementById("personaleDato")) {
  visPatientdetaljer();
}


// Sundhedspersonalets patientoversigt

const patientTabel = document.getElementById("patientTabel");

async function hentPatienter() {
  patientTabel.replaceChildren();

  try {
    const patienter = await hentJson("/api/patients");

    for (const patient of patienter) {
      const raekke = patientTabel.insertRow();

      raekke.insertCell().textContent = patient.navn;
      raekke.insertCell().textContent = patient.cpr;
      raekke.insertCell().textContent = "–";
      raekke.insertCell().textContent = "–";

      const handling = raekke.insertCell();
      const link = document.createElement("a");

      link.textContent = "Se patient";
      link.href =
        `5-patientdetaljer.html?patientId=${patient.id}`;

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