const db = require("./db");

async function gemMaaling(maaling) {
  const resultat = await db.query(
    `INSERT INTO maalinger (
       patient_id, dato, systolisk, diastolisk, puls, symptomer, tilstand, note
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, patient_id`,
    [
      maaling.patient_id,
      maaling.dato,
      maaling.systolisk,
      maaling.diastolisk,
      maaling.puls,
      maaling.symptomer,
      maaling.tilstand,
      maaling.note,
    ]
  );

  return resultat.rows[0];
}

async function hentMaalinger(patientId) {
  const resultat = await db.query(
        `SELECT id, patient_id,
            to_char(dato, 'YYYY-MM-DD"T"HH24:MI:SS') AS dato,
            systolisk, diastolisk, puls, symptomer, tilstand, note
     FROM maalinger
     WHERE patient_id = $1
     ORDER BY dato DESC, id DESC`,
    [patientId]
  );

  return resultat.rows;
}

module.exports = { gemMaaling, hentMaalinger };