require("dotenv").config();
const { hentPatienter } = require("./repositories/patients");
const { gemMaaling, hentMaalinger } = require("./repositories/maalinger");
const express = require("express");

const app = express();
app.use(express.static(require("path").join(__dirname, "public")));


app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

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



if (require.main === module) {
  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`Serveren kører på http://localhost:${port}`);
  });
}

module.exports = app;