require("dotenv").config();
const { hentPatienter } = require("./repositories/patients");
const { gemMaaling, hentMaalinger } = require("./repositories/maalinger");
const express = require("express");

const app = express();

const patients = [
  { cpr: "TEST001", navn: "Testpatient 1" },
  { cpr: "TEST002", navn: "Testpatient 2" },
];

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.use(express.json());

app.get("/api/patients", async (req, res) => {
  try {
    const patienter = await hentPatienter();
    res.json(patienter);
  } catch {
    res.status(500).json({ error: "Patientlisten kunne ikke hentes" });
  }
});

app.get("/api/patients/:cpr", (req, res) => {
  const patient = patients.find((patient) => patient.cpr === req.params.cpr);

  if (!patient) {
    return res.status(404).json({ error: "Patienten blev ikke fundet" });
  }

  res.json(patient);
});
app.post("/api/patients", (req, res) => {
  const { cpr, navn } = req.body ?? {};

  if (!cpr || !navn) {
    return res.status(400).json({ error: "Test-ID og navn skal udfyldes" });
  }

  const nyPatient = { cpr, navn };
  patients.push(nyPatient);

  res.status(201).json(nyPatient);
});


app.post("/api/maalinger", async (req, res) => {
  const maaling = req.body ?? {};
  const { patient_id, dato, systolisk, diastolisk, puls } = maaling;
  const heltal = [patient_id, systolisk, diastolisk, puls];

  if (
    !heltal.every((tal) => Number.isInteger(tal) && tal > 0) ||
    typeof dato !== "string" ||
    !dato.trim()
  ) {
    return res.status(400).json({
      error: "Udfyld patient-ID, dato, blodtryk og puls",
    });
  }

  try {
    const gemtMaaling = await gemMaaling(maaling);
    res.status(201).json(gemtMaaling);
  } catch (fejl) {
    if (fejl.code === "23503") {
      return res.status(400).json({ error: "Patienten findes ikke" });
    }

    if (["22007", "22008", "22003"].includes(fejl.code)) {
      return res.status(400).json({ error: "Dato eller talværdi er ugyldig" });
    }

    res.status(500).json({ error: "Målingen kunne ikke gemmes" });
  }
});
app.get("/api/patients/:patientId/maalinger", async (req, res) => {
  const patientId = Number(req.params.patientId);

  if (!Number.isInteger(patientId) || patientId < 1 || patientId > 2147483647) {
    return res.status(400).json({ error: "Patient-ID er ugyldigt" });
  }

  try {
    const maalinger = await hentMaalinger(patientId);
    res.json(maalinger);
  } catch {
    res.status(500).json({ error: "Målingerne kunne ikke hentes" });
  }
});
app.use((req, res) => {
  res.status(404).json({ error: "not found" });
});



app.listen(3000, () => {
  console.log("Serveren kører på http://localhost:3000");
});