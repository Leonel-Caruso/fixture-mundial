/*
  Catálogo local de partidos.
  Incluye 16avos, octavos, cuartos, semifinales y final.
  Las rondas posteriores usan candidatos por rama para poder emparejar la API aunque el cruce todavía no esté cerrado.
*/

const TEAM_ALIASES = {
  rsa: { id: "rsa", name: "Sudáfrica", aliases: ["south africa", "sudafrica", "sudáfrica", "rsa", "za"] },
  can: { id: "can", name: "Canadá", aliases: ["canada", "canadá", "can", "ca"] },
  ned: { id: "ned", name: "Países Bajos", aliases: ["netherlands", "países bajos", "paises bajos", "holanda", "ned", "nl"] },
  mar: { id: "mar", name: "Marruecos", aliases: ["morocco", "marruecos", "mar", "ma"] },
  ger: { id: "ger", name: "Alemania", aliases: ["germany", "alemania", "ger", "de"] },
  par: { id: "par", name: "Paraguay", aliases: ["paraguay", "par", "py"] },
  fra: { id: "fra", name: "Francia", aliases: ["france", "francia", "fra", "fr"] },
  swe: { id: "swe", name: "Suecia", aliases: ["sweden", "suecia", "swe", "se"] },
  bel: { id: "bel", name: "Bélgica", aliases: ["belgium", "belgica", "bélgica", "bel", "be"] },
  sen: { id: "sen", name: "Senegal", aliases: ["senegal", "sen", "sn"] },
  usa: { id: "usa", name: "Estados Unidos", aliases: ["united states", "usa", "estados unidos", "us", "united states of america"] },
  bih: { id: "bih", name: "Bosnia y Herzegovina", aliases: ["bosnia and herzegovina", "bosnia", "bosnia y herzegovina", "bih", "ba"] },
  esp: { id: "esp", name: "España", aliases: ["spain", "españa", "espana", "esp", "es"] },
  aut: { id: "aut", name: "Austria", aliases: ["austria", "aut", "at"] },
  por: { id: "por", name: "Portugal", aliases: ["portugal", "por", "pt"] },
  cro: { id: "cro", name: "Croacia", aliases: ["croatia", "croacia", "cro", "hr"] },
  bra: { id: "bra", name: "Brasil", aliases: ["brazil", "brasil", "bra", "br"] },
  jpn: { id: "jpn", name: "Japón", aliases: ["japan", "japon", "japón", "jpn", "jp"] },
  civ: { id: "civ", name: "Costa de Marfil", aliases: ["ivory coast", "côte d'ivoire", "cote d'ivoire", "costa de marfil", "civ", "ci"] },
  nor: { id: "nor", name: "Noruega", aliases: ["norway", "noruega", "nor", "no"] },
  mex: { id: "mex", name: "México", aliases: ["mexico", "méxico", "mex", "mx"] },
  ecu: { id: "ecu", name: "Ecuador", aliases: ["ecuador", "ecu", "ec"] },
  eng: { id: "eng", name: "Inglaterra", aliases: ["england", "inglaterra", "eng", "gb-eng", "gb"] },
  cod: { id: "cod", name: "RD Congo", aliases: ["dr congo", "rd congo", "congo dr", "democratic republic of congo", "congo", "cod", "cd"] },
  sui: { id: "sui", name: "Suiza", aliases: ["switzerland", "suiza", "sui", "ch"] },
  alg: { id: "alg", name: "Argelia", aliases: ["algeria", "argelia", "alg", "dz"] },
  col: { id: "col", name: "Colombia", aliases: ["colombia", "col", "co"] },
  gha: { id: "gha", name: "Ghana", aliases: ["ghana", "gha", "gh"] },
  aus: { id: "aus", name: "Australia", aliases: ["australia", "aus", "au"] },
  egy: { id: "egy", name: "Egipto", aliases: ["egypt", "egipto", "egy", "eg"] },
  arg: { id: "arg", name: "Argentina", aliases: ["argentina", "arg", "ar"] },
  cpv: { id: "cpv", name: "Cabo Verde", aliases: ["cape verde", "cabo verde", "cpv", "cv"] },
};

function team(id) {
  return TEAM_ALIASES[id];
}

function slot(name, ids) {
  const candidates = ids.map(team).filter(Boolean);
  return {
    id: ids.join("_"),
    name,
    aliases: unique(candidates.flatMap((candidate) => candidate.aliases)),
    candidates
  };
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function match(id, kickoffISO, teamA, teamB) {
  return { id, kickoffISO, teamA, teamB };
}

const MATCH_MAP = [
  match("rsa-can", "2026-06-28T15:00:00-03:00", team("rsa"), team("can")),
  match("ned-mar", "2026-06-29T21:00:00-03:00", team("ned"), team("mar")),
  match("ger-par", "2026-06-29T16:30:00-03:00", team("ger"), team("par")),
  match("fra-swe", "2026-06-30T18:00:00-03:00", team("fra"), team("swe")),
  match("bel-sen", "2026-07-01T17:00:00-03:00", team("bel"), team("sen")),
  match("usa-bih", "2026-07-01T21:00:00-03:00", team("usa"), team("bih")),
  match("esp-aut", "2026-07-02T16:00:00-03:00", team("esp"), team("aut")),
  match("por-cro", "2026-07-02T20:00:00-03:00", team("por"), team("cro")),
  match("bra-jpn", "2026-06-29T14:00:00-03:00", team("bra"), team("jpn")),
  match("civ-nor", "2026-06-30T14:00:00-03:00", team("civ"), team("nor")),
  match("mex-ecu", "2026-06-30T23:00:00-03:00", team("mex"), team("ecu")),
  match("eng-cod", "2026-07-01T13:00:00-03:00", team("eng"), team("cod")),
  match("sui-alg", "2026-07-03T00:00:00-03:00", team("sui"), team("alg")),
  match("col-gha", "2026-07-03T22:30:00-03:00", team("col"), team("gha")),
  match("aus-egy", "2026-07-03T15:00:00-03:00", team("aus"), team("egy")),
  match("arg-cpv", "2026-07-03T19:00:00-03:00", team("arg"), team("cpv")),
  match("r16-1", "2026-07-04T13:00:00-03:00", slot("Sudáfrica / Canadá", ["rsa", "can"]), slot("Países Bajos / Marruecos", ["ned", "mar"])),
  match("r16-2", "2026-07-04T17:00:00-03:00", slot("Alemania / Paraguay", ["ger", "par"]), slot("Francia / Suecia", ["fra", "swe"])),
  match("r16-3", "2026-07-05T13:00:00-03:00", slot("Bélgica / Senegal", ["bel", "sen"]), slot("Estados Unidos / Bosnia y Herzegovina", ["usa", "bih"])),
  match("r16-4", "2026-07-05T17:00:00-03:00", slot("España / Austria", ["esp", "aut"]), slot("Portugal / Croacia", ["por", "cro"])),
  match("r16-5", "2026-07-06T13:00:00-03:00", slot("Brasil / Japón", ["bra", "jpn"]), slot("Costa de Marfil / Noruega", ["civ", "nor"])),
  match("r16-6", "2026-07-06T17:00:00-03:00", slot("México / Ecuador", ["mex", "ecu"]), slot("Inglaterra / RD Congo", ["eng", "cod"])),
  match("r16-7", "2026-07-07T13:00:00-03:00", slot("Suiza / Argelia", ["sui", "alg"]), slot("Colombia / Ghana", ["col", "gha"])),
  match("r16-8", "2026-07-07T17:00:00-03:00", slot("Australia / Egipto", ["aus", "egy"]), slot("Argentina / Cabo Verde", ["arg", "cpv"])),
  match("qf-1", "2026-07-09T17:00:00-03:00", slot("Rama A", ["rsa", "can", "ned", "mar"]), slot("Rama B", ["ger", "par", "fra", "swe"])),
  match("qf-2", "2026-07-09T21:00:00-03:00", slot("Rama A", ["bel", "sen", "usa", "bih"]), slot("Rama B", ["esp", "aut", "por", "cro"])),
  match("qf-3", "2026-07-10T17:00:00-03:00", slot("Rama A", ["bra", "jpn", "civ", "nor"]), slot("Rama B", ["mex", "ecu", "eng", "cod"])),
  match("qf-4", "2026-07-10T21:00:00-03:00", slot("Rama A", ["sui", "alg", "col", "gha"]), slot("Rama B", ["aus", "egy", "arg", "cpv"])),
  match("sf-1", "2026-07-14T21:00:00-03:00", slot("Rama A", ["rsa", "can", "ned", "mar", "ger", "par", "fra", "swe"]), slot("Rama B", ["bel", "sen", "usa", "bih", "esp", "aut", "por", "cro"])),
  match("sf-2", "2026-07-15T21:00:00-03:00", slot("Rama A", ["bra", "jpn", "civ", "nor", "mex", "ecu", "eng", "cod"]), slot("Rama B", ["sui", "alg", "col", "gha", "aus", "egy", "arg", "cpv"])),
  match("final", "2026-07-19T16:00:00-03:00", slot("Rama A", ["rsa", "can", "ned", "mar", "ger", "par", "fra", "swe", "bel", "sen", "usa", "bih", "esp", "aut", "por", "cro"]), slot("Rama B", ["bra", "jpn", "civ", "nor", "mex", "ecu", "eng", "cod", "sui", "alg", "col", "gha", "aus", "egy", "arg", "cpv"]))
];

module.exports = { MATCH_MAP };
