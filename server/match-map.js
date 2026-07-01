/*
  Catálogo local de partidos.
  El frontend usa estos IDs locales: mex-ecu, fra-swe, etc.
  El backend intenta emparejar la respuesta de la API externa por nombres / códigos.
*/

const MATCH_MAP = [
  {
    id: "rsa-can",
    kickoffISO: "2026-06-28T15:00:00-03:00",
    teamA: { id: "rsa", name: "Sudáfrica", aliases: ["south africa", "sudafrica", "sudáfrica", "rsa", "za"] },
    teamB: { id: "can", name: "Canadá", aliases: ["canada", "canadá", "can"] }
  },
  {
    id: "ned-mar",
    kickoffISO: "2026-06-29T21:00:00-03:00",
    teamA: { id: "ned", name: "Países Bajos", aliases: ["netherlands", "países bajos", "paises bajos", "holanda", "ned", "nl"] },
    teamB: { id: "mar", name: "Marruecos", aliases: ["morocco", "marruecos", "mar", "ma"] }
  },
  {
    id: "ger-par",
    kickoffISO: "2026-06-29T16:30:00-03:00",
    teamA: { id: "ger", name: "Alemania", aliases: ["germany", "alemania", "ger", "de"] },
    teamB: { id: "par", name: "Paraguay", aliases: ["paraguay", "par", "py"] }
  },
  {
    id: "fra-swe",
    kickoffISO: "2026-06-30T18:00:00-03:00",
    teamA: { id: "fra", name: "Francia", aliases: ["france", "francia", "fra", "fr"] },
    teamB: { id: "swe", name: "Suecia", aliases: ["sweden", "suecia", "swe", "se"] }
  },
  {
    id: "bel-sen",
    kickoffISO: "2026-07-01T17:00:00-03:00",
    teamA: { id: "bel", name: "Bélgica", aliases: ["belgium", "belgica", "bélgica", "bel", "be"] },
    teamB: { id: "sen", name: "Senegal", aliases: ["senegal", "sen", "sn"] }
  },
  {
    id: "usa-bih",
    kickoffISO: "2026-07-01T21:00:00-03:00",
    teamA: { id: "usa", name: "Estados Unidos", aliases: ["united states", "usa", "estados unidos", "us", "united states of america"] },
    teamB: { id: "bih", name: "Bosnia y Herzegovina", aliases: ["bosnia and herzegovina", "bosnia", "bosnia y herzegovina", "bih", "ba"] }
  },
  {
    id: "esp-aut",
    kickoffISO: "2026-07-02T16:00:00-03:00",
    teamA: { id: "esp", name: "España", aliases: ["spain", "españa", "espana", "esp", "es"] },
    teamB: { id: "aut", name: "Austria", aliases: ["austria", "aut", "at"] }
  },
  {
    id: "por-cro",
    kickoffISO: "2026-07-02T20:00:00-03:00",
    teamA: { id: "por", name: "Portugal", aliases: ["portugal", "por", "pt"] },
    teamB: { id: "cro", name: "Croacia", aliases: ["croatia", "croacia", "cro", "hr"] }
  },
  {
    id: "bra-jpn",
    kickoffISO: "2026-06-29T14:00:00-03:00",
    teamA: { id: "bra", name: "Brasil", aliases: ["brazil", "brasil", "bra", "br"] },
    teamB: { id: "jpn", name: "Japón", aliases: ["japan", "japon", "japón", "jpn", "jp"] }
  },
  {
    id: "civ-nor",
    kickoffISO: "2026-06-30T14:00:00-03:00",
    teamA: { id: "civ", name: "Costa de Marfil", aliases: ["ivory coast", "côte d'ivoire", "cote d'ivoire", "costa de marfil", "civ", "ci"] },
    teamB: { id: "nor", name: "Noruega", aliases: ["norway", "noruega", "nor", "no"] }
  },
  {
    id: "mex-ecu",
    kickoffISO: "2026-06-30T23:00:00-03:00",
    teamA: { id: "mex", name: "México", aliases: ["mexico", "méxico", "mex", "mx"] },
    teamB: { id: "ecu", name: "Ecuador", aliases: ["ecuador", "ecu", "ec"] }
  },
  {
    id: "eng-cod",
    kickoffISO: "2026-07-01T13:00:00-03:00",
    teamA: { id: "eng", name: "Inglaterra", aliases: ["england", "inglaterra", "eng", "gb-eng", "gb"] },
    teamB: { id: "cod", name: "RD Congo", aliases: ["dr congo", "rd congo", "congo dr", "democratic republic of congo", "cod", "cd"] }
  },
  {
    id: "sui-alg",
    kickoffISO: "2026-07-03T00:00:00-03:00",
    teamA: { id: "sui", name: "Suiza", aliases: ["switzerland", "suiza", "sui", "ch"] },
    teamB: { id: "alg", name: "Argelia", aliases: ["algeria", "argelia", "alg", "dz"] }
  },
  {
    id: "col-gha",
    kickoffISO: "2026-07-03T22:30:00-03:00",
    teamA: { id: "col", name: "Colombia", aliases: ["colombia", "col", "co"] },
    teamB: { id: "gha", name: "Ghana", aliases: ["ghana", "gha", "gh"] }
  },
  {
    id: "aus-egy",
    kickoffISO: "2026-07-03T15:00:00-03:00",
    teamA: { id: "aus", name: "Australia", aliases: ["australia", "aus", "au"] },
    teamB: { id: "egy", name: "Egipto", aliases: ["egypt", "egipto", "egy", "eg"] }
  },
  {
    id: "arg-cpv",
    kickoffISO: "2026-07-03T19:00:00-03:00",
    teamA: { id: "arg", name: "Argentina", aliases: ["argentina", "arg", "ar"] },
    teamB: { id: "cpv", name: "Cabo Verde", aliases: ["cape verde", "cabo verde", "cpv", "cv"] }
  }
];

module.exports = { MATCH_MAP };
