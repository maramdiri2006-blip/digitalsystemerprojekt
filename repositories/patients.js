const db = require("./db");

async function hentPatienter() {
  const resultat = await db.query(
    "SELECT id, cpr, navn FROM patients ORDER BY id"
  );
  return resultat.rows;
}

module.exports = { hentPatienter };