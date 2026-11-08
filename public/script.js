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
    tegnMaaleGrafer("vis", maalinger);
    
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
        tegnMaaleGrafer("personale", maalinger);

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

// Sundhedspersonalets patientoversigt

const patientTabel = document.getElementById("patientTabel");
const patientSearch = document.getElementById("patientSearch");
const patientRaekker = [];

function filtrerPatienter() {
  const soegning = patientSearch
    ? patientSearch.value.trim().toLowerCase()
    : "";

  let antalSynlige = 0;

  for (const patient of patientRaekker) {
    const matcher = patient.soegetekst.includes(soegning);
    patient.raekke.hidden = !matcher;

    if (matcher) {
      antalSynlige++;
    }
  }

  const tomRaekke = document.getElementById("ingenPatienter");

  if (tomRaekke) {
    tomRaekke.hidden = antalSynlige > 0;
  }
}

async function hentPatienter() {
  patientTabel.replaceChildren();
  patientRaekker.length = 0;

  try {
    const patienter = await hentJson("/api/patients");
    const opgaver = [];

    for (const patient of patienter) {
      const raekke = patientTabel.insertRow();

      raekke.insertCell().textContent = patient.navn;
      raekke.insertCell().textContent = patient.cpr;

      const senesteCelle = raekke.insertCell();
      const statusCelle = raekke.insertCell();
      const handling = raekke.insertCell();

      senesteCelle.textContent = "Henter…";
      statusCelle.textContent = "Henter…";

      const link = document.createElement("a");
      link.textContent = "Se patient";
      link.href =
        `5-patientdetaljer.html?patientId=${patient.id}`;

      handling.appendChild(link);

      patientRaekker.push({
        raekke,
        soegetekst:
          `${patient.navn} ${patient.cpr}`.toLowerCase()
      });

      opgaver.push(
        visPatientensSeneste(
          patient.id,
          senesteCelle,
          statusCelle
        )
      );
    }

    const tomRaekke = patientTabel.insertRow();
    tomRaekke.id = "ingenPatienter";

    const tomCelle = tomRaekke.insertCell();
    tomCelle.colSpan = 5;
    tomCelle.textContent = "Ingen patienter matcher søgningen.";

    filtrerPatienter();

    await Promise.all(opgaver);
  } catch (fejl) {
    patientTabel.replaceChildren();
    patientRaekker.length = 0;

    const celle = patientTabel.insertRow().insertCell();
    celle.colSpan = 5;
    celle.textContent =
      "Patientlisten kunne ikke hentes. Genindlæs siden.";

    console.error(fejl);
  }
}

async function visPatientensSeneste(
  patientId,
  senesteCelle,
  statusCelle
) {
  try {
    const maalinger = await hentJson(
      `/api/patients/${patientId}/maalinger`
    );

    const seneste = maalinger[0];

    if (!seneste) {
      senesteCelle.textContent = "Ingen målinger";
      statusCelle.textContent = "Ingen måling registreret";
      return;
    }

    senesteCelle.textContent = formaterDato(seneste.dato);
    statusCelle.textContent = "Måling registreret";
  } catch (fejl) {
    senesteCelle.textContent = "Kunne ikke hentes";
    statusCelle.textContent = "Hentning fejlede";
    console.error(fejl);
  }
}

if (patientTabel) {
  if (patientSearch) {
    patientSearch.addEventListener("input", filtrerPatienter);
  }

  hentPatienter();
}
// Grafer baseret på patientens gemte målinger

function tegnMaaleGrafer(prefix, maalinger) {
  tegnGraf(
    prefix + "BlodtrykGraf",
    maalinger,
    [
      { felt: "systolisk", navn: "Systolisk", stiplet: false },
      { felt: "diastolisk", navn: "Diastolisk", stiplet: true }
    ],
    "mmHg"
  );

  tegnGraf(
    prefix + "PulsGraf",
    maalinger,
    [
      { felt: "puls", navn: "Puls", stiplet: false }
    ],
    "slag/min"
  );
}

function tegnGraf(holderId, maalinger, serier, enhed) {
  const holder = document.getElementById(holderId);

  if (!holder) {
    return;
  }

  holder.replaceChildren();

  if (maalinger.length === 0) {
    holder.textContent = "Ingen målinger at vise.";
    return;
  }

  const data = [...maalinger].sort(
    (a, b) => new Date(a.dato) - new Date(b.dato)
  );

  const tider = data.map(
    (maaling) => new Date(maaling.dato).getTime()
  );

  const vaerdier = data.flatMap(
    (maaling) => serier.map(
      (serie) => Number(maaling[serie.felt])
    )
  );

  if (
    !tider.every(Number.isFinite) ||
    !vaerdier.every(Number.isFinite)
  ) {
    holder.textContent = "Grafen kunne ikke tegnes.";
    return;
  }

  const periode = document.createElement("p");
  periode.textContent =
    `Periode: ${formaterDato(data[0].dato)} – ` +
    formaterDato(data[data.length - 1].dato);

  holder.appendChild(periode);

  const svgNS = "http://www.w3.org/2000/svg";

  function element(tag, attributter, tekst) {
    const node = document.createElementNS(svgNS, tag);

    for (const [navn, vaerdi] of Object.entries(attributter)) {
      node.setAttribute(navn, String(vaerdi));
    }

    if (tekst !== undefined) {
      node.textContent = tekst;
    }

    return node;
  }

  const svg = element("svg", {
    viewBox: "0 0 760 330",
    role: "img",
    "aria-label":
      `${serier.map((serie) => serie.navn).join(" og ")} ` +
      `i ${enhed}. ${data.length} målinger. ` +
      "De præcise værdier findes i måletabellen."
  });

  svg.style.width = "100%";
  svg.style.display = "block";

  const venstre = 70;
  const hoejre = 720;
  const top = 35;
  const bund = 245;

  const laveste = Math.min(...vaerdier);
  const hoejeste = Math.max(...vaerdier);
  const margen = Math.max(5, (hoejeste - laveste) * 0.15);

  const minimum = Math.max(
    0,
    Math.floor((laveste - margen) / 5) * 5
  );

  const maksimum = Math.ceil(
    (hoejeste + margen) / 5
  ) * 5;

  const start = tider[0];
  const slut = tider[tider.length - 1];

  function x(tid) {
    if (start === slut) {
      return (venstre + hoejre) / 2;
    }

    return venstre +
      ((tid - start) / (slut - start)) * (hoejre - venstre);
  }

  function y(vaerdi) {
    return bund -
      ((vaerdi - minimum) / (maksimum - minimum)) *
      (bund - top);
  }

  svg.appendChild(
    element("text", {
      x: venstre,
      y: 20,
      fill: "#243746",
      "font-size": 15
    }, enhed)
  );

  for (let trin = 0; trin <= 4; trin++) {
    const vaerdi = minimum + (maksimum - minimum) * trin / 4;
    const position = y(vaerdi);

    svg.appendChild(
      element("line", {
        x1: venstre,
        x2: hoejre,
        y1: position,
        y2: position,
        stroke: "#d2e2ec"
      })
    );

    svg.appendChild(
      element("text", {
        x: venstre - 12,
        y: position + 5,
        "text-anchor": "end",
        fill: "#243746",
        "font-size": 14
      }, Number(vaerdi.toFixed(1)))
    );
  }

  const akseTider = start === slut
    ? [start]
    : [start, start + (slut - start) / 2, slut];

  for (const tid of akseTider) {
    const dato = new Date(tid);

    svg.appendChild(
      element("text", {
        x: x(tid),
        y: bund + 28,
        "text-anchor": "middle",
        fill: "#243746",
        "font-size": 13
      }, dato.toLocaleDateString("da-DK"))
    );

    svg.appendChild(
      element("text", {
        x: x(tid),
        y: bund + 48,
        "text-anchor": "middle",
        fill: "#243746",
        "font-size": 13
      }, dato.toLocaleTimeString("da-DK", {
        hour: "2-digit",
        minute: "2-digit"
      }))
    );
  }

  svg.appendChild(
    element("text", {
      x: (venstre + hoejre) / 2,
      y: 325,
      "text-anchor": "middle",
      fill: "#243746",
      "font-size": 14
    }, "Dato og tidspunkt")
  );

  for (const serie of serier) {
    const farve = serie.stiplet ? "#526777" : "#175678";

    const punkter = data.map(
      (maaling, indeks) =>
        `${x(tider[indeks])},${y(Number(maaling[serie.felt]))}`
    ).join(" ");

    const linje = element("polyline", {
      points: punkter,
      fill: "none",
      stroke: farve,
      "stroke-width": 3
    });

    if (serie.stiplet) {
      linje.setAttribute("stroke-dasharray", "8 6");
    }

    svg.appendChild(linje);

    data.forEach((maaling, indeks) => {
      const punkt = element("circle", {
        cx: x(tider[indeks]),
        cy: y(Number(maaling[serie.felt])),
        r: 4,
        fill: serie.stiplet ? "white" : farve,
        stroke: farve,
        "stroke-width": 2
      });

      punkt.appendChild(
        element("title", {},
          `${serie.navn}: ${maaling[serie.felt]} ${enhed}, ` +
          formaterDato(maaling.dato)
        )
      );

      svg.appendChild(punkt);
    });
  }

  holder.appendChild(svg);
}