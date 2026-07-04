/* =========================================================
   FIXTURE RADIAL - 32 equipos
   Versión actualizada:
   - modo Fixture: solo resultados oficiales cargados / API opcional
   - modo Predicción: permite elegir todo y guarda en localStorage
   - panel lateral: muestra solo partidos pendientes o en vivo de hoy
   - si un partido ya terminó, desaparece del panel y avanza en el fixture
========================================================= */

const STORAGE_KEY = "radial-fixture-v32-gold";
const PREDICTION_STORAGE_KEY = "radial-fixture-user-prediction-v2";

/*
  Endpoint del backend local incluido en este proyecto.
  El servidor consulta una API externa si está configurada en .env
  o usa datos mock si no hay API key.
*/
const LIVE_DATA_URL = "/api/matches";
const AUTO_REFRESH_MS = 30_000;
const LIVE_WINDOW_MINUTES = 140;

const MODE = {
  FIXTURE: "fixture",
  PREDICTION: "prediction"
};

const VIEWBOX = 1000;
const CENTER = 500;

const ROUND_CONFIG = {
  round32: { count: 32, radius: 462, className: "round32", nodeHalf: 18 },
  round16: { count: 16, radius: 352, className: "round16", nodeHalf: 14 },
  quarter: { count: 8, radius: 268, className: "quarter", nodeHalf: 11 },
  semi: { count: 4, radius: 198, className: "semi", nodeHalf: 9 },
  final: { count: 2, radius: 140, className: "final", nodeHalf: 8 }
};

const CHAMPION_RADIUS = 49;

/*
  MATCHES
  - status: "scheduled", "live" o "finished"
  - kickoffISO: horario real del partido en Argentina (-03:00)
  - winnerId: se completa cuando el partido terminó
  - Los partidos terminados no aparecen en el panel derecho.
*/
const MATCHES = [
  {
    id: "rsa-can",
    label: "Sudáfrica vs Canadá",
    dateISO: "2026-06-28",
    kickoffISO: "2026-06-28T15:00:00-03:00",
    time: "15:00",
    status: "finished",
    scoreA: "0",
    scoreB: "1",
    minute: null,
    teamA: { id: "rsa", name: "Sudáfrica", iso: "za", color: "#58d68d" },
    teamB: { id: "can", name: "Canadá", iso: "ca", color: "#ff6b6b" },
    winnerId: "can"
  },
  {
    id: "ned-mar",
    label: "Países Bajos vs Marruecos",
    dateISO: "2026-06-29",
    kickoffISO: "2026-06-29T21:00:00-03:00",
    time: "21:00",
    status: "finished",
    scoreA: "1 (2)",
    scoreB: "1 (3)",
    minute: null,
    teamA: { id: "ned", name: "Países Bajos", iso: "nl", color: "#ff9f43" },
    teamB: { id: "mar", name: "Marruecos", iso: "ma", color: "#ff5d5d" },
    winnerId: "mar"
  },
  {
    id: "ger-par",
    label: "Alemania vs Paraguay",
    dateISO: "2026-06-29",
    kickoffISO: "2026-06-29T16:30:00-03:00",
    time: "16:30",
    status: "finished",
    scoreA: "1 (3)",
    scoreB: "1 (4)",
    minute: null,
    teamA: { id: "ger", name: "Alemania", iso: "de", color: "#f6c744" },
    teamB: { id: "par", name: "Paraguay", iso: "py", color: "#ff7a7a" },
    winnerId: "par"
  },
  {
    id: "fra-swe",
    label: "Francia vs Suecia",
    dateISO: "2026-06-30",
    kickoffISO: "2026-06-30T18:00:00-03:00",
    time: "18:00",
    status: "finished",
    scoreA: "3",
    scoreB: "0",
    minute: null,
    teamA: { id: "fra", name: "Francia", iso: "fr", color: "#5b8cff" },
    teamB: { id: "swe", name: "Suecia", iso: "se", color: "#6dbdff" },
    winnerId: "fra"
  },
  {
    id: "bel-sen",
    label: "Bélgica vs Senegal",
    dateISO: "2026-07-01",
    kickoffISO: "2026-07-01T17:00:00-03:00",
    time: "17:00",
    status: "scheduled",
    scoreA: "",
    scoreB: "",
    minute: null,
    teamA: { id: "bel", name: "Bélgica", iso: "be", color: "#ffd166" },
    teamB: { id: "sen", name: "Senegal", iso: "sn", color: "#4fd98c" },
    winnerId: null
  },
  {
    id: "usa-bih",
    label: "Estados Unidos vs Bosnia y Herzegovina",
    dateISO: "2026-07-01",
    kickoffISO: "2026-07-01T21:00:00-03:00",
    time: "21:00",
    status: "scheduled",
    scoreA: "",
    scoreB: "",
    minute: null,
    teamA: { id: "usa", name: "Estados Unidos", iso: "us", color: "#7ea7ff" },
    teamB: { id: "bih", name: "Bosnia y Herzegovina", iso: "ba", color: "#78c4ff" },
    winnerId: null
  },
  {
    id: "esp-aut",
    label: "España vs Austria",
    dateISO: "2026-07-02",
    kickoffISO: "2026-07-02T16:00:00-03:00",
    time: "16:00",
    status: "scheduled",
    scoreA: "",
    scoreB: "",
    minute: null,
    teamA: { id: "esp", name: "España", iso: "es", color: "#ffb11c" },
    teamB: { id: "aut", name: "Austria", iso: "at", color: "#ff6b6b" },
    winnerId: null
  },
  {
    id: "por-cro",
    label: "Portugal vs Croacia",
    dateISO: "2026-07-02",
    kickoffISO: "2026-07-02T20:00:00-03:00",
    time: "20:00",
    status: "scheduled",
    scoreA: "",
    scoreB: "",
    minute: null,
    teamA: { id: "por", name: "Portugal", iso: "pt", color: "#32d978" },
    teamB: { id: "cro", name: "Croacia", iso: "hr", color: "#ff7b7b" },
    winnerId: null
  },
  {
    id: "bra-jpn",
    label: "Brasil vs Japón",
    dateISO: "2026-06-29",
    kickoffISO: "2026-06-29T14:00:00-03:00",
    time: "14:00",
    status: "finished",
    scoreA: "2",
    scoreB: "1",
    minute: null,
    teamA: { id: "bra", name: "Brasil", iso: "br", color: "#ffd84e" },
    teamB: { id: "jpn", name: "Japón", iso: "jp", color: "#ff7b7b" },
    winnerId: "bra"
  },
  {
    id: "civ-nor",
    label: "Costa de Marfil vs Noruega",
    dateISO: "2026-06-30",
    kickoffISO: "2026-06-30T14:00:00-03:00",
    time: "14:00",
    status: "finished",
    scoreA: "1",
    scoreB: "2",
    minute: null,
    teamA: { id: "civ", name: "Costa de Marfil", iso: "ci", color: "#ffad5a" },
    teamB: { id: "nor", name: "Noruega", iso: "no", color: "#ff6b6b" },
    winnerId: "nor"
  },
  {
    id: "mex-ecu",
    label: "México vs Ecuador",
    dateISO: "2026-06-30",
    kickoffISO: "2026-06-30T23:00:00-03:00",
    time: "23:00",
    status: "scheduled",
    scoreA: "",
    scoreB: "",
    minute: null,
    teamA: { id: "mex", name: "México", iso: "mx", color: "#32d978" },
    teamB: { id: "ecu", name: "Ecuador", iso: "ec", color: "#ffd166" },
    winnerId: null,
    manualKickoffLock: true
  },
  {
    id: "eng-cod",
    label: "Inglaterra vs RD Congo",
    dateISO: "2026-07-01",
    kickoffISO: "2026-07-01T13:00:00-03:00",
    time: "13:00",
    status: "scheduled",
    scoreA: "",
    scoreB: "",
    minute: null,
    teamA: { id: "eng", name: "Inglaterra", iso: "gb-eng", color: "#f4f4f4" },
    teamB: { id: "cod", name: "RD Congo", iso: "cd", color: "#78b5ff" },
    winnerId: null
  },
  {
    id: "sui-alg",
    label: "Suiza vs Argelia",
    dateISO: "2026-07-03",
    kickoffISO: "2026-07-03T00:00:00-03:00",
    time: "00:00",
    status: "scheduled",
    scoreA: "",
    scoreB: "",
    minute: null,
    teamA: { id: "sui", name: "Suiza", iso: "ch", color: "#ff6b6b" },
    teamB: { id: "alg", name: "Argelia", iso: "dz", color: "#57d88c" },
    winnerId: null
  },
  {
    id: "col-gha",
    label: "Colombia vs Ghana",
    dateISO: "2026-07-03",
    kickoffISO: "2026-07-03T22:30:00-03:00",
    time: "22:30",
    status: "scheduled",
    scoreA: "",
    scoreB: "",
    minute: null,
    teamA: { id: "col", name: "Colombia", iso: "co", color: "#ffd84e" },
    teamB: { id: "gha", name: "Ghana", iso: "gh", color: "#ff7a59" },
    winnerId: null
  },
  {
    id: "aus-egy",
    label: "Australia vs Egipto",
    dateISO: "2026-07-03",
    kickoffISO: "2026-07-03T15:00:00-03:00",
    time: "15:00",
    status: "scheduled",
    scoreA: "",
    scoreB: "",
    minute: null,
    teamA: { id: "aus", name: "Australia", iso: "au", color: "#6dbdff" },
    teamB: { id: "egy", name: "Egipto", iso: "eg", color: "#ff7b7b" },
    winnerId: null
  },
  {
    id: "arg-cpv",
    label: "Argentina vs Cabo Verde",
    dateISO: "2026-07-03",
    kickoffISO: "2026-07-03T19:00:00-03:00",
    time: "19:00",
    status: "scheduled",
    scoreA: "",
    scoreB: "",
    minute: null,
    teamA: { id: "arg", name: "Argentina", iso: "ar", color: "#7bc7ff" },
    teamB: { id: "cpv", name: "Cabo Verde", iso: "cv", color: "#57a8ff" },
    winnerId: null
  }
];

/*
  Partidos de eliminación directa posteriores a 16avos.
  IMPORTANTE:
  - No se mezclan con MATCHES porque MATCHES arma la primera ronda del gráfico.
  - teamAFrom/teamBFrom apuntan a los nodos ya clasificados del fixture.
  - Cuando el backend/API devuelve un ganador para estos IDs, avanza automáticamente.
*/
const KNOCKOUT_MATCHES = [
  knockoutMatch("r16-1", "round16", 0, "Octavos 1", "2026-07-04T13:00:00-03:00", "round16", 0, "Ganador Sudáfrica/Canadá", "round16", 1, "Ganador Países Bajos/Marruecos"),
  knockoutMatch("r16-2", "round16", 1, "Octavos 2", "2026-07-04T17:00:00-03:00", "round16", 2, "Ganador Alemania/Paraguay", "round16", 3, "Ganador Francia/Suecia"),
  knockoutMatch("r16-3", "round16", 2, "Octavos 3", "2026-07-05T13:00:00-03:00", "round16", 4, "Ganador Bélgica/Senegal", "round16", 5, "Ganador Estados Unidos/Bosnia"),
  knockoutMatch("r16-4", "round16", 3, "Octavos 4", "2026-07-05T17:00:00-03:00", "round16", 6, "Ganador España/Austria", "round16", 7, "Ganador Portugal/Croacia"),
  knockoutMatch("r16-5", "round16", 4, "Octavos 5", "2026-07-06T13:00:00-03:00", "round16", 8, "Ganador Brasil/Japón", "round16", 9, "Ganador Costa de Marfil/Noruega"),
  knockoutMatch("r16-6", "round16", 5, "Octavos 6", "2026-07-06T17:00:00-03:00", "round16", 10, "Ganador México/Ecuador", "round16", 11, "Ganador Inglaterra/RD Congo"),
  knockoutMatch("r16-7", "round16", 6, "Octavos 7", "2026-07-07T13:00:00-03:00", "round16", 12, "Ganador Suiza/Argelia", "round16", 13, "Ganador Colombia/Ghana"),
  knockoutMatch("r16-8", "round16", 7, "Octavos 8", "2026-07-07T17:00:00-03:00", "round16", 14, "Ganador Australia/Egipto", "round16", 15, "Ganador Argentina/Cabo Verde"),

  knockoutMatch("qf-1", "quarter", 0, "Cuartos 1", "2026-07-09T17:00:00-03:00", "quarter", 0, "Ganador Octavos 1", "quarter", 1, "Ganador Octavos 2"),
  knockoutMatch("qf-2", "quarter", 1, "Cuartos 2", "2026-07-09T21:00:00-03:00", "quarter", 2, "Ganador Octavos 3", "quarter", 3, "Ganador Octavos 4"),
  knockoutMatch("qf-3", "quarter", 2, "Cuartos 3", "2026-07-10T17:00:00-03:00", "quarter", 4, "Ganador Octavos 5", "quarter", 5, "Ganador Octavos 6"),
  knockoutMatch("qf-4", "quarter", 3, "Cuartos 4", "2026-07-10T21:00:00-03:00", "quarter", 6, "Ganador Octavos 7", "quarter", 7, "Ganador Octavos 8"),

  knockoutMatch("sf-1", "semi", 0, "Semifinal 1", "2026-07-14T21:00:00-03:00", "semi", 0, "Ganador Cuartos 1", "semi", 1, "Ganador Cuartos 2"),
  knockoutMatch("sf-2", "semi", 1, "Semifinal 2", "2026-07-15T21:00:00-03:00", "semi", 2, "Ganador Cuartos 3", "semi", 3, "Ganador Cuartos 4"),

  knockoutMatch("final", "final", 0, "Final", "2026-07-19T16:00:00-03:00", "final", 0, "Ganador Semifinal 1", "final", 1, "Ganador Semifinal 2")
];

function knockoutMatch(id, round, matchIndex, label, kickoffISO, teamARound, teamAIndex, teamALabel, teamBRound, teamBIndex, teamBLabel) {
  const kickoff = new Date(kickoffISO);
  return {
    id,
    round,
    matchIndex,
    label,
    dateISO: toLocalISODate(kickoff),
    kickoffISO,
    time: toLocalTime(kickoff),
    status: "scheduled",
    scoreA: "",
    scoreB: "",
    minute: null,
    winnerId: null,
    teamAFrom: { round: teamARound, index: teamAIndex, label: teamALabel },
    teamBFrom: { round: teamBRound, index: teamBIndex, label: teamBLabel }
  };
}

const NEXT_ROUND = {
  round32: "round16",
  round16: "quarter",
  quarter: "semi",
  semi: "final",
  final: "champion"
};

/*
  Resultados oficiales de rondas superiores.
  Cuando se jueguen octavos, cuartos, semis o final, cargás los ganadores acá.
  Ejemplo round16: ["can", "fra", null, null, ...]
*/
const OFFICIAL_RESULTS = {
  round16: Array(16).fill(null),
  quarter: Array(8).fill(null),
  semi: Array(4).fill(null),
  final: Array(2).fill(null)
};

const OFFICIAL_RESULT_ROUNDS = ["round16", "quarter", "semi", "final"];

/*
  GROUPS
  Tabla editable de fase de grupos.
  Para cambiar los datos reales, modificá solo PJ/PG/PE/PP/GF/GC/PTS de cada equipo.
*/
const GROUP_TEAM_INFO = {
  mex: { id: "mex", name: "México", iso: "mx", color: "#32d978" },
  rsa: { id: "rsa", name: "Sudáfrica", iso: "za", color: "#58d68d" },
  kor: { id: "kor", name: "Corea del Sur", iso: "kr", color: "#8bd3ff" },
  cze: { id: "cze", name: "Chequia", iso: "cz", color: "#d94b4b" },

  sui: { id: "sui", name: "Suiza", iso: "ch", color: "#ff6b6b" },
  can: { id: "can", name: "Canadá", iso: "ca", color: "#ff6b6b" },
  bih: { id: "bih", name: "Bosnia y Herzegovina", iso: "ba", color: "#78c4ff" },
  qat: { id: "qat", name: "Catar", iso: "qa", color: "#8a1538" },

  bra: { id: "bra", name: "Brasil", iso: "br", color: "#ffd84e" },
  mar: { id: "mar", name: "Marruecos", iso: "ma", color: "#ff5d5d" },
  sco: { id: "sco", name: "Escocia", iso: "gb-sct", color: "#6dbdff" },
  hai: { id: "hai", name: "Haití", iso: "ht", color: "#5b8cff" },

  usa: { id: "usa", name: "Estados Unidos", iso: "us", color: "#7ea7ff" },
  aus: { id: "aus", name: "Australia", iso: "au", color: "#6dbdff" },
  par: { id: "par", name: "Paraguay", iso: "py", color: "#ff7a7a" },
  tur: { id: "tur", name: "Turquía", iso: "tr", color: "#ff5d5d" },

  ger: { id: "ger", name: "Alemania", iso: "de", color: "#f6c744" },
  civ: { id: "civ", name: "Costa de Marfil", iso: "ci", color: "#ffad5a" },
  ecu: { id: "ecu", name: "Ecuador", iso: "ec", color: "#ffd166" },
  cuw: { id: "cuw", name: "Curazao", iso: "cw", color: "#46b3ff" },

  ned: { id: "ned", name: "Países Bajos", iso: "nl", color: "#ff9f43" },
  jpn: { id: "jpn", name: "Japón", iso: "jp", color: "#ff7b7b" },
  swe: { id: "swe", name: "Suecia", iso: "se", color: "#6dbdff" },
  tun: { id: "tun", name: "Túnez", iso: "tn", color: "#ff6b6b" },

  bel: { id: "bel", name: "Bélgica", iso: "be", color: "#ffd166" },
  egy: { id: "egy", name: "Egipto", iso: "eg", color: "#ff7b7b" },
  irn: { id: "irn", name: "Irán", iso: "ir", color: "#57d88c" },
  nzl: { id: "nzl", name: "Nueva Zelanda", iso: "nz", color: "#6dbdff" },

  esp: { id: "esp", name: "España", iso: "es", color: "#ffb11c" },
  cpv: { id: "cpv", name: "Cabo Verde", iso: "cv", color: "#57a8ff" },
  uru: { id: "uru", name: "Uruguay", iso: "uy", color: "#7bc7ff" },
  ksa: { id: "ksa", name: "Arabia Saudita", iso: "sa", color: "#4fd98c" },

  fra: { id: "fra", name: "Francia", iso: "fr", color: "#5b8cff" },
  nor: { id: "nor", name: "Noruega", iso: "no", color: "#ff6b6b" },
  sen: { id: "sen", name: "Senegal", iso: "sn", color: "#4fd98c" },
  irq: { id: "irq", name: "Irak", iso: "iq", color: "#e05252" },

  arg: { id: "arg", name: "Argentina", iso: "ar", color: "#7bc7ff" },
  aut: { id: "aut", name: "Austria", iso: "at", color: "#ff6b6b" },
  alg: { id: "alg", name: "Argelia", iso: "dz", color: "#57d88c" },
  jor: { id: "jor", name: "Jordania", iso: "jo", color: "#b88a55" },

  col: { id: "col", name: "Colombia", iso: "co", color: "#ffd84e" },
  por: { id: "por", name: "Portugal", iso: "pt", color: "#32d978" },
  cod: { id: "cod", name: "RD Congo", iso: "cd", color: "#78b5ff" },
  uzb: { id: "uzb", name: "Uzbekistán", iso: "uz", color: "#67d6ff" },

  eng: { id: "eng", name: "Inglaterra", iso: "gb-eng", color: "#f4f4f4" },
  cro: { id: "cro", name: "Croacia", iso: "hr", color: "#ff7b7b" },
  gha: { id: "gha", name: "Ghana", iso: "gh", color: "#ff7a59" },
  pan: { id: "pan", name: "Panamá", iso: "pa", color: "#6dbdff" }
};

const GROUPS = [
  {
    name: "Grupo A",
    teams: [
      groupTeam("mex", 3, 3, 0, 0, 6, 0, 9, true),
      groupTeam("rsa", 3, 1, 1, 1, 2, 3, 4, true),
      groupTeam("kor", 3, 1, 0, 2, 2, 3, 3),
      groupTeam("cze", 3, 0, 1, 2, 2, 6, 1)
    ]
  },
  {
    name: "Grupo B",
    teams: [
      groupTeam("sui", 3, 2, 1, 0, 7, 3, 7, true),
      groupTeam("can", 3, 1, 1, 1, 8, 3, 4, true),
      groupTeam("bih", 3, 1, 1, 1, 5, 6, 4, true),
      groupTeam("qat", 3, 0, 1, 2, 2, 10, 1)
    ]
  },
  {
    name: "Grupo C",
    teams: [
      groupTeam("bra", 3, 2, 1, 0, 7, 1, 7, true),
      groupTeam("mar", 3, 2, 1, 0, 6, 3, 7, true),
      groupTeam("sco", 3, 1, 0, 2, 1, 4, 3),
      groupTeam("hai", 3, 0, 0, 3, 2, 8, 0)
    ]
  },
  {
    name: "Grupo D",
    teams: [
      groupTeam("usa", 3, 2, 0, 1, 8, 4, 6, true),
      groupTeam("aus", 3, 1, 1, 1, 2, 2, 4, true),
      groupTeam("par", 3, 1, 1, 1, 2, 4, 4, true),
      groupTeam("tur", 3, 1, 0, 2, 3, 5, 3)
    ]
  },
  {
    name: "Grupo E",
    teams: [
      groupTeam("ger", 3, 2, 0, 1, 10, 4, 6, true),
      groupTeam("civ", 3, 2, 0, 1, 4, 2, 6, true),
      groupTeam("ecu", 3, 1, 1, 1, 2, 2, 4, true),
      groupTeam("cuw", 3, 0, 1, 2, 1, 9, 1)
    ]
  },
  {
    name: "Grupo F",
    teams: [
      groupTeam("ned", 3, 2, 1, 0, 10, 4, 7, true),
      groupTeam("jpn", 3, 1, 2, 0, 7, 3, 5, true),
      groupTeam("swe", 3, 1, 1, 1, 7, 7, 4, true),
      groupTeam("tun", 3, 0, 0, 3, 2, 12, 0)
    ]
  },
  {
    name: "Grupo G",
    teams: [
      groupTeam("bel", 3, 1, 2, 0, 6, 2, 5, true),
      groupTeam("egy", 3, 1, 2, 0, 5, 3, 5, true),
      groupTeam("irn", 3, 0, 3, 0, 3, 3, 3),
      groupTeam("nzl", 3, 0, 1, 2, 4, 10, 1)
    ]
  },
  {
    name: "Grupo H",
    teams: [
      groupTeam("esp", 3, 2, 1, 0, 5, 0, 7, true),
      groupTeam("cpv", 3, 0, 3, 0, 2, 2, 3, true),
      groupTeam("uru", 3, 0, 2, 1, 3, 4, 2),
      groupTeam("ksa", 3, 0, 2, 1, 1, 5, 2)
    ]
  },
  {
    name: "Grupo I",
    teams: [
      groupTeam("fra", 3, 3, 0, 0, 10, 2, 9, true),
      groupTeam("nor", 3, 2, 0, 1, 8, 7, 6, true),
      groupTeam("sen", 3, 1, 0, 2, 8, 6, 3, true),
      groupTeam("irq", 3, 0, 0, 3, 1, 12, 0)
    ]
  },
  {
    name: "Grupo J",
    teams: [
      groupTeam("arg", 3, 3, 0, 0, 8, 1, 9, true),
      groupTeam("aut", 3, 1, 1, 1, 6, 6, 4, true),
      groupTeam("alg", 3, 1, 1, 1, 5, 7, 4, true),
      groupTeam("jor", 3, 0, 0, 3, 3, 8, 0)
    ]
  },
  {
    name: "Grupo K",
    teams: [
      groupTeam("col", 3, 2, 1, 0, 4, 1, 7, true),
      groupTeam("por", 3, 1, 2, 0, 6, 1, 5, true),
      groupTeam("cod", 3, 1, 1, 1, 4, 3, 4, true),
      groupTeam("uzb", 3, 0, 0, 3, 2, 11, 0)
    ]
  },
  {
    name: "Grupo L",
    teams: [
      groupTeam("eng", 3, 2, 1, 0, 6, 2, 7, true),
      groupTeam("cro", 3, 2, 0, 1, 5, 5, 6, true),
      groupTeam("gha", 3, 1, 1, 1, 2, 2, 4, true),
      groupTeam("pan", 3, 0, 0, 3, 0, 4, 0)
    ]
  }
];

function groupTeam(teamId, played, wins, draws, losses, goalsFor, goalsAgainst, points, qualified = false) {
  return {
    teamId,
    played,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    goalDifference: goalsFor - goalsAgainst,
    points,
    qualified
  };
}

let state = null;
let currentMode = MODE.FIXTURE;
let positions = {};
let nodes = {
  round32: [],
  round16: [],
  quarter: [],
  semi: [],
  final: [],
  champion: null
};
let connections = [];
let refreshTimer = null;

const fixtureEl = document.getElementById("fixture");

const TEAM_BY_ID = {};
rebuildTeamIndex();

document.addEventListener("DOMContentLoaded", init);

/* =========================================================
   INIT
========================================================= */

async function init() {
  currentMode = MODE.FIXTURE;

  await refreshMatchDataFromExternalSource();
  state = createOfficialState();

  calculatePositions();
  buildFixture();
  render();
  renderTodayMatches();
  renderGroups();
  setupActionButtons();
  setModeClasses();
  startAutoRefresh();

  window.resetFixture = resetFixture;
}

function startAutoRefresh() {
  if (refreshTimer) clearInterval(refreshTimer);

  refreshTimer = setInterval(async () => {
    await refreshMatchDataFromExternalSource();

    if (currentMode === MODE.FIXTURE) {
      state = createOfficialState();
      render();
    }

    if (currentMode === MODE.PREDICTION) {
      mergeOfficialResultsIntoPrediction(state);
      saveState();
      render();
    }

    renderTodayMatches();
  }, AUTO_REFRESH_MS);
}

/* =========================================================
   LIVE DATA OPCIONAL
========================================================= */

async function refreshMatchDataFromExternalSource() {
  if (!LIVE_DATA_URL) return;

  try {
    const response = await fetch(LIVE_DATA_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const updates = await response.json();
    if (!Array.isArray(updates)) return;

    updates.forEach((update) => {
      const match = findMatchById(update.id);
      if (!match) return;

      const nextKickoffISO = match.manualKickoffLock
        ? match.kickoffISO
        : update.kickoffISO ?? match.kickoffISO;

      Object.assign(match, {
        status: update.status ?? match.status,
        scoreA: update.scoreA ?? match.scoreA,
        scoreB: update.scoreB ?? match.scoreB,
        minute: update.minute ?? match.minute,
        winnerId: update.winnerId ?? match.winnerId,
        kickoffISO: nextKickoffISO
      });

      if (update.kickoffISO && !match.manualKickoffLock) {
        syncMatchDateAndTime(match);
      }
    });
  } catch (error) {
    console.warn("No se pudo actualizar desde LIVE_DATA_URL:", error);
  }
}


function findMatchById(matchId) {
  return MATCHES.find((item) => item.id === matchId)
    || KNOCKOUT_MATCHES.find((item) => item.id === matchId);
}

function syncMatchDateAndTime(match) {
  const kickoff = new Date(match.kickoffISO);
  if (Number.isNaN(kickoff.getTime())) return;

  const year = kickoff.getFullYear();
  const month = String(kickoff.getMonth() + 1).padStart(2, "0");
  const day = String(kickoff.getDate()).padStart(2, "0");
  const hours = String(kickoff.getHours()).padStart(2, "0");
  const minutes = String(kickoff.getMinutes()).padStart(2, "0");

  match.dateISO = `${year}-${month}-${day}`;
  match.time = `${hours}:${minutes}`;
}

/* =========================================================
   STATE
========================================================= */

function rebuildTeamIndex() {
  Object.keys(TEAM_BY_ID).forEach((key) => delete TEAM_BY_ID[key]);

  Object.values(GROUP_TEAM_INFO).forEach((team) => {
    TEAM_BY_ID[team.id] = team;
  });

  MATCHES.forEach((match) => {
    TEAM_BY_ID[match.teamA.id] = match.teamA;
    TEAM_BY_ID[match.teamB.id] = match.teamB;
  });
}

function createInitialState() {
  const round32Teams = MATCHES.flatMap((match) => [match.teamA, match.teamB]);

  return {
    round32: round32Teams,
    round16: Array(16).fill(null),
    quarter: Array(8).fill(null),
    semi: Array(4).fill(null),
    final: Array(2).fill(null),
    champion: null
  };
}

function createOfficialState() {
  const officialState = createInitialState();
  applyOfficialWinners(officialState);
  return officialState;
}

function createPredictionState() {
  const predictionState = createOfficialState();
  return predictionState;
}

function applyOfficialWinners(targetState) {
  applyOfficialRound(targetState, "round32", MATCHES.map((match) => match.winnerId));

  OFFICIAL_RESULT_ROUNDS.forEach((roundKey) => {
    applyOfficialRound(targetState, roundKey, getOfficialWinnersForRound(roundKey));
  });
}

function getOfficialWinnersForRound(roundKey) {
  const base = Array.isArray(OFFICIAL_RESULTS[roundKey])
    ? [...OFFICIAL_RESULTS[roundKey]]
    : [];

  KNOCKOUT_MATCHES
    .filter((match) => match.round === roundKey)
    .forEach((match) => {
      if (match.winnerId) base[match.matchIndex] = match.winnerId;
    });

  return base;
}

function applyOfficialRound(targetState, fromRound, winners) {
  const nextRound = NEXT_ROUND[fromRound];
  if (!nextRound || !Array.isArray(winners)) return;

  winners.forEach((winnerId, matchIndex) => {
    if (!winnerId) return;

    const sourcePairStart = matchIndex * 2;
    const sourcePairEnd = sourcePairStart + 1;
    const teamA = targetState[fromRound][sourcePairStart];
    const teamB = targetState[fromRound][sourcePairEnd];
    const winner = [teamA, teamB].find((team) => team && team.id === winnerId);

    if (!winner) return;

    if (nextRound === "champion") {
      targetState.champion = winner;
    } else {
      targetState[nextRound][matchIndex] = winner;
    }
  });
}

function mergeOfficialResultsIntoPrediction(predictionState) {
  if (!predictionState) return;

  MATCHES.forEach((match, matchIndex) => {
    if (!match.winnerId) return;

    const winner = TEAM_BY_ID[match.winnerId];
    if (!winner) return;

    const currentWinner = predictionState.round16[matchIndex];

    if (!currentWinner || currentWinner.id !== winner.id) {
      predictionState.round16[matchIndex] = winner;
      clearCascadeFromState(predictionState, "round16", matchIndex);
    }
  });

  OFFICIAL_RESULT_ROUNDS.forEach((fromRound) => {
    const winners = getOfficialWinnersForRound(fromRound);

    winners.forEach((winnerId, matchIndex) => {
      if (!winnerId) return;

      const nextRound = NEXT_ROUND[fromRound];
      if (!nextRound) return;

      const sourcePairStart = matchIndex * 2;
      const sourcePairEnd = sourcePairStart + 1;
      const teamA = predictionState[fromRound][sourcePairStart];
      const teamB = predictionState[fromRound][sourcePairEnd];
      const winner = [teamA, teamB].find((team) => team && team.id === winnerId);
      if (!winner) return;

      if (nextRound === "champion") {
        if (!predictionState.champion || predictionState.champion.id !== winner.id) {
          predictionState.champion = winner;
        }
      } else {
        const currentWinner = predictionState[nextRound][matchIndex];
        if (!currentWinner || currentWinner.id !== winner.id) {
          predictionState[nextRound][matchIndex] = winner;
          clearCascadeFromState(predictionState, nextRound, matchIndex);
        }
      }
    });
  });
}

function saveState() {
  if (currentMode !== MODE.PREDICTION) return;
  localStorage.setItem(PREDICTION_STORAGE_KEY, JSON.stringify(state));
}

function resetFixture() {
  if (currentMode !== MODE.PREDICTION) return;

  localStorage.removeItem(PREDICTION_STORAGE_KEY);
  state = createPredictionState();

  render();
  renderTodayMatches();
  updateActionButtons();
}

function loadPredictionState() {
  const raw = localStorage.getItem(PREDICTION_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);

    if (
      parsed &&
      Array.isArray(parsed.round32) &&
      Array.isArray(parsed.round16) &&
      Array.isArray(parsed.quarter) &&
      Array.isArray(parsed.semi) &&
      Array.isArray(parsed.final)
    ) {
      return parsed;
    }
  } catch (error) {
    console.warn("No se pudo recuperar la predicción:", error);
  }

  return null;
}

/* =========================================================
   ACTION BUTTONS
========================================================= */

function setupActionButtons() {
  const predictionButton = document.getElementById("predictionButton");
  const fixtureButton = document.getElementById("fixtureButton");
  const groupsButton = document.getElementById("groupsButton");
  const resetButton = document.getElementById("resetButton");

  setupMobileNavigation();

  if (predictionButton) predictionButton.addEventListener("click", () => {
    activatePredictionMode();
    closeMobileNavigation();
  });

  if (fixtureButton) fixtureButton.addEventListener("click", () => {
    activateFixtureMode();
    closeMobileNavigation();
  });

  if (groupsButton) groupsButton.addEventListener("click", () => {
    activateGroupsView();
    closeMobileNavigation();
  });

  if (resetButton) resetButton.addEventListener("click", () => {
    resetFixture();
    closeMobileNavigation();
  });

  updateActionButtons();
}

function setupMobileNavigation() {
  const nav = document.querySelector(".fixture-actions");
  const navToggle = document.getElementById("navToggle");
  if (!nav || !navToggle) return;

  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
  });
}

function closeMobileNavigation() {
  const nav = document.querySelector(".fixture-actions");
  const navToggle = document.getElementById("navToggle");
  if (!nav || !navToggle) return;

  nav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Abrir menú");
}

function activatePredictionMode() {
  hideGroupsView();
  currentMode = MODE.PREDICTION;

  const savedPrediction = loadPredictionState();

  if (savedPrediction) {
    state = savedPrediction;
    mergeOfficialResultsIntoPrediction(state);
  } else {
    state = createPredictionState();
  }

  saveState();
  setModeClasses();
  render();
  renderTodayMatches();
  updateActionButtons();
}

function activateFixtureMode() {
  hideGroupsView();
  currentMode = MODE.FIXTURE;
  state = createOfficialState();

  setModeClasses();
  render();
  renderTodayMatches();
  updateActionButtons();
}

function setModeClasses() {
  document.body.classList.toggle("prediction-mode", currentMode === MODE.PREDICTION);
  document.body.classList.toggle("fixture-mode", currentMode === MODE.FIXTURE);
}

function updateActionButtons() {
  const predictionButton = document.getElementById("predictionButton");
  const fixtureButton = document.getElementById("fixtureButton");
  const groupsButton = document.getElementById("groupsButton");
  const groupsActive = isGroupsViewActive();

  if (predictionButton) {
    predictionButton.classList.toggle("is-active", !groupsActive && currentMode === MODE.PREDICTION);
  }

  if (fixtureButton) {
    fixtureButton.classList.toggle("is-active", !groupsActive && currentMode === MODE.FIXTURE);
  }

  if (groupsButton) {
    groupsButton.classList.toggle("is-active", groupsActive);
  }
}

function activateGroupsView() {
  const groupsPanel = document.getElementById("groupsPanel");
  if (!groupsPanel) return;

  renderGroups();
  document.body.classList.add("groups-view");
  groupsPanel.hidden = false;
  updateActionButtons();
}

function hideGroupsView() {
  const groupsPanel = document.getElementById("groupsPanel");
  document.body.classList.remove("groups-view");

  if (groupsPanel) {
    groupsPanel.hidden = true;
  }
}

function isGroupsViewActive() {
  return document.body.classList.contains("groups-view");
}

/* =========================================================
   PANEL DE GRUPOS
========================================================= */

function renderGroups() {
  const container = document.getElementById("groupsGrid");
  if (!container) return;

  container.innerHTML = GROUPS.map(groupCardMarkup).join("");
}

function groupCardMarkup(group) {
  const sortedTeams = [...group.teams].sort(sortGroupRows);

  return `
    <article class="group-card">
      <div class="group-card__title">
        <h3>${group.name}</h3>
        <span>Tabla final</span>
      </div>

      <div class="group-table-wrap">
        <table class="group-table" aria-label="${group.name}">
          <thead>
            <tr>
              <th>#</th>
              <th class="group-team-cell">Equipo</th>
              <th>PTS</th>
              <th>PJ</th>
              <th>PG</th>
              <th>PE</th>
              <th>PP</th>
              <th>GF</th>
              <th>GC</th>
              <th>DG</th>
            </tr>
          </thead>
          <tbody>
            ${sortedTeams.map((row, index) => groupRowMarkup(row, index + 1)).join("")}
          </tbody>
        </table>
      </div>
    </article>
  `;
}

function groupRowMarkup(row, rank) {
  const team = TEAM_BY_ID[row.teamId];
  if (!team) return "";

  const qualifiedClass = row.qualified || rank <= 2 ? "is-qualified" : "";
  const goalDifference = Number.isFinite(row.goalDifference)
    ? row.goalDifference
    : row.goalsFor - row.goalsAgainst;

  return `
    <tr class="${qualifiedClass}">
      <td class="group-rank">${rank}</td>
      <td class="group-team-cell">
        <div class="group-team">
          <span class="group-flag">
            <img src="${flagUrl(team.iso)}" alt="${team.name}" />
          </span>
          <span class="group-team-name">${team.name}</span>
        </div>
      </td>
      <td class="group-points">${row.points}</td>
      <td>${row.played}</td>
      <td>${row.wins}</td>
      <td>${row.draws}</td>
      <td>${row.losses}</td>
      <td>${row.goalsFor}</td>
      <td>${row.goalsAgainst}</td>
      <td>${formatGoalDifference(goalDifference)}</td>
    </tr>
  `;
}

function sortGroupRows(a, b) {
  const teamA = TEAM_BY_ID[a.teamId];
  const teamB = TEAM_BY_ID[b.teamId];
  const gdA = Number.isFinite(a.goalDifference) ? a.goalDifference : a.goalsFor - a.goalsAgainst;
  const gdB = Number.isFinite(b.goalDifference) ? b.goalDifference : b.goalsFor - b.goalsAgainst;

  if (b.points !== a.points) return b.points - a.points;
  if (gdB !== gdA) return gdB - gdA;
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  return String(teamA?.name || "").localeCompare(String(teamB?.name || ""), "es");
}

function formatGoalDifference(value) {
  if (value > 0) return `+${value}`;
  return String(value);
}

/* =========================================================
   PANEL DE PARTIDOS DE HOY
========================================================= */


function getPanelMatches() {
  const officialState = createOfficialState();
  const knockoutMatches = KNOCKOUT_MATCHES
    .map((match) => resolveKnockoutMatch(match, officialState));

  return [...MATCHES, ...knockoutMatches];
}

function resolveKnockoutMatch(match, sourceState) {
  const teamA = sourceState[match.teamAFrom.round]?.[match.teamAFrom.index] || makePlaceholderTeam(match.teamAFrom.label);
  const teamB = sourceState[match.teamBFrom.round]?.[match.teamBFrom.index] || makePlaceholderTeam(match.teamBFrom.label);

  return {
    ...match,
    teamA,
    teamB,
    label: !teamA.placeholder && !teamB.placeholder ? `${teamA.name} vs ${teamB.name}` : match.label
  };
}

function makePlaceholderTeam(label) {
  return {
    id: `placeholder-${slugify(label)}`,
    name: label || "Por definir",
    iso: "",
    color: "#d6b66b",
    placeholder: true
  };
}

function slugify(value) {
  return String(value || "por-definir")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function toLocalISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toLocalTime(date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function getTodayISO() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function renderTodayMatches() {
  const container = document.getElementById("todayMatches");
  if (!container) return;

  const now = new Date();
  const todayISO = getTodayISO();

  const todayMatches = getPanelMatches()
    .map((match) => ({ match, computed: getComputedMatchStatus(match, now) }))
    .filter(({ match, computed }) => {
      if (computed.hidden) return false;

      const isTodayScheduled = match.dateISO === todayISO;
      const isLiveAcrossMidnight = computed.kind === "live";

      return isTodayScheduled || isLiveAcrossMidnight;
    })
    .sort((a, b) => {
      if (a.computed.kind === "live" && b.computed.kind !== "live") return -1;
      if (a.computed.kind !== "live" && b.computed.kind === "live") return 1;
      return a.computed.sortMinutes - b.computed.sortMinutes;
    });

  if (!todayMatches.length) {
    container.innerHTML = `
      <p class="empty-today">
        No quedan partidos pendientes para hoy.
      </p>
    `;
    return;
  }

  container.innerHTML = todayMatches
    .map(({ match, computed }) => {
      return `
        <article class="match-card ${computed.cardClass}">
          <div class="match-card__time ${computed.timeClass}">
            ${computed.statusMarkup}
          </div>

          ${matchTeamMarkup(match.teamA, computed.scoreA)}
          <div class="match-vs">VS</div>
          ${matchTeamMarkup(match.teamB, computed.scoreB)}
        </article>
      `;
    })
    .join("");
}

function getComputedMatchStatus(match, now = new Date()) {
  const kickoff = new Date(match.kickoffISO);
  const elapsedMinutes = Math.floor((now.getTime() - kickoff.getTime()) / 60_000);
  const kickoffMinutes = getMatchMinutes(match.time);

  if (elapsedMinutes < 0) {
    return {
      hidden: false,
      kind: "scheduled",
      cardClass: "is-scheduled",
      timeClass: "",
      statusMarkup: `${match.time} hs`,
      sortMinutes: kickoffMinutes,
      scoreA: "",
      scoreB: ""
    };
  }

  if (match.status === "finished" || match.winnerId) {
    return {
      hidden: true,
      kind: "finished",
      cardClass: "is-finished",
      timeClass: "",
      statusMarkup: "Final",
      sortMinutes: Number.MAX_SAFE_INTEGER,
      scoreA: match.scoreA,
      scoreB: match.scoreB
    };
  }

  const isInsideLiveWindow = elapsedMinutes <= LIVE_WINDOW_MINUTES;
  const isExplicitLive = match.status === "live";
  const shouldShowLiveByTime = isInsideLiveWindow && match.status === "scheduled";

  /*
    Fallback visual:
    Si la API todavía no confirmó el estado live, pero el horario de inicio ya pasó,
    el partido se muestra como EN VIVO con marcador 0-0 hasta que llegue el dato real.
    Si la API luego informa goles, minuto o finalizado, esos datos pisan este fallback.
  */
  if (isExplicitLive || shouldShowLiveByTime) {
    /*
      No inventamos el minuto con la hora de inicio porque, si el partido
      se atrasó o el proveedor no informa elapsed time, puede quedar mal.
      Solo mostramos minuto cuando la API lo envía explícitamente.
    */
    const hasReliableMinute = match.minute !== null && match.minute !== undefined && match.minute !== "";
    const minuteMarkup = hasReliableMinute ? `<strong>${formatLiveMinute(match.minute)}</strong>` : "";

    return {
      hidden: false,
      kind: "live",
      cardClass: "is-live",
      timeClass: "is-live-status",
      statusMarkup: `
        <span class="live-dot"></span>
        <span>EN VIVO</span>
        ${minuteMarkup}
      `,
      sortMinutes: kickoffMinutes,
      scoreA: getLiveScore(match.scoreA),
      scoreB: getLiveScore(match.scoreB)
    };
  }

  if (elapsedMinutes > LIVE_WINDOW_MINUTES) {
    return {
      hidden: true,
      kind: "expired",
      cardClass: "",
      timeClass: "",
      statusMarkup: "",
      sortMinutes: Number.MAX_SAFE_INTEGER,
      scoreA: match.scoreA,
      scoreB: match.scoreB
    };
  }

  return {
    hidden: false,
    kind: "scheduled",
    cardClass: "is-scheduled",
    timeClass: "",
    statusMarkup: `${match.time} hs`,
    sortMinutes: kickoffMinutes,
    scoreA: "",
    scoreB: ""
  };
}

function getMatchMinutes(time) {
  if (!time || !time.includes(":")) return Number.MAX_SAFE_INTEGER;

  const [hours, minutes] = time.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return Number.MAX_SAFE_INTEGER;
  return hours * 60 + minutes;
}

function formatLiveMinute(rawMinute) {
  const minute = Number(rawMinute);

  if (!Number.isFinite(minute) || minute < 0) return "0'";
  if (minute <= 45) return `${minute}'`;
  if (minute <= 60) return "ET";
  if (minute <= 105) return `${minute - 15}'`;
  if (minute <= 120) return "ET";
  return "90+'";
}

function hasVisibleScore(score) {
  return score !== null && score !== undefined && String(score).trim() !== "";
}

function getLiveScore(score) {
  return hasVisibleScore(score) ? String(score) : "0";
}

function matchTeamMarkup(team, score) {
  const visibleScore = hasVisibleScore(score) ? String(score) : "";
  const isPlaceholder = !team || team.placeholder;
  const teamName = team?.name || "Por definir";
  const flagMarkup = isPlaceholder
    ? `<span class="match-flag match-flag--placeholder">?</span>`
    : `<span class="match-flag"><img src="${flagUrl(team.iso)}" alt="${team.name}" /></span>`;

  return `
    <div class="match-row ${isPlaceholder ? "is-placeholder" : ""}">
      <div class="match-team">
        ${flagMarkup}
        <span class="match-name">${teamName}</span>
      </div>
      <span class="match-score">${visibleScore}</span>
    </div>
  `;
}

/* =========================================================
   GEOMETRY
========================================================= */

function calculatePositions() {
  positions = {
    round32: [],
    round16: [],
    quarter: [],
    semi: [],
    final: [],
    champion: { x: CENTER, y: CENTER }
  };

  const step = 360 / 32;
  const startAngle = -90;

  for (let i = 0; i < 32; i++) {
    const angle = startAngle + i * step;
    positions.round32.push(polarToCartesian(ROUND_CONFIG.round32.radius, angle, CENTER, CENTER));
  }

  for (let i = 0; i < 16; i++) {
    const angle = startAngle + (i * 2 + 0.5) * step;
    positions.round16.push(polarToCartesian(ROUND_CONFIG.round16.radius, angle, CENTER, CENTER));
  }

  for (let i = 0; i < 8; i++) {
    const angle = startAngle + (i * 4 + 1.5) * step;
    positions.quarter.push(polarToCartesian(ROUND_CONFIG.quarter.radius, angle, CENTER, CENTER));
  }

  for (let i = 0; i < 4; i++) {
    const angle = startAngle + (i * 8 + 3.5) * step;
    positions.semi.push(polarToCartesian(ROUND_CONFIG.semi.radius, angle, CENTER, CENTER));
  }

  for (let i = 0; i < 2; i++) {
    const angle = startAngle + (i * 16 + 7.5) * step;
    positions.final.push(polarToCartesian(ROUND_CONFIG.final.radius, angle, CENTER, CENTER));
  }
}

function polarToCartesian(radius, angleDeg, cx, cy) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
    angle: angleDeg
  };
}

function getRoundAngle(roundKey, index) {
  const step = 360 / 32;
  const startAngle = -90;

  if (roundKey === "round32") return startAngle + index * step;
  if (roundKey === "round16") return startAngle + (index * 2 + 0.5) * step;
  if (roundKey === "quarter") return startAngle + (index * 4 + 1.5) * step;
  if (roundKey === "semi") return startAngle + (index * 8 + 3.5) * step;
  if (roundKey === "final") return startAngle + (index * 16 + 7.5) * step;

  return 0;
}

function shortestSignedDelta(from, to) {
  return ((to - from + 540) % 360) - 180;
}

/* =========================================================
   BUILD
========================================================= */

function buildFixture() {
  fixtureEl.innerHTML = "";
  connections = [];
  nodes = {
    round32: [],
    round16: [],
    quarter: [],
    semi: [],
    final: [],
    champion: null
  };

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("fixture-svg");
  svg.setAttribute("viewBox", `0 0 ${VIEWBOX} ${VIEWBOX}`);

  const gDecor = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const gBase = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const gActive = document.createElementNS("http://www.w3.org/2000/svg", "g");

  svg.appendChild(gDecor);
  svg.appendChild(gBase);
  svg.appendChild(gActive);

  drawGuideRings(gDecor);

  const nodesLayer = document.createElement("div");
  nodesLayer.className = "nodes-layer";

  fixtureEl.appendChild(svg);
  fixtureEl.appendChild(nodesLayer);

  createRoundNodes("round32", nodesLayer);
  createRoundNodes("round16", nodesLayer);
  createRoundNodes("quarter", nodesLayer);
  createRoundNodes("semi", nodesLayer);
  createRoundNodes("final", nodesLayer);
  createChampionNode(nodesLayer);

  buildConnections(gBase, gActive);
}

function drawGuideRings(group) {
  const radii = [
    ROUND_CONFIG.round32.radius,
    ROUND_CONFIG.round16.radius,
    ROUND_CONFIG.quarter.radius,
    ROUND_CONFIG.semi.radius,
    ROUND_CONFIG.final.radius,
    76
  ];

  radii.forEach((radius, idx) => {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", CENTER);
    circle.setAttribute("cy", CENTER);
    circle.setAttribute("r", radius);
    circle.setAttribute("class", idx === radii.length - 1 ? "guide-ring inner" : "guide-ring");
    group.appendChild(circle);
  });
}

function createRoundNodes(roundKey, layer) {
  const config = ROUND_CONFIG[roundKey];

  for (let i = 0; i < config.count; i++) {
    const pos = positions[roundKey][i];
    const node = document.createElement("button");

    node.type = "button";
    node.className = `node ${config.className}`;
    node.style.left = `${(pos.x / VIEWBOX) * 100}%`;
    node.style.top = `${(pos.y / VIEWBOX) * 100}%`;
    node.dataset.round = roundKey;
    node.dataset.index = i;
    node.addEventListener("click", () => handleNodeClick(roundKey, i));

    layer.appendChild(node);
    nodes[roundKey].push(node);
  }
}

function createChampionNode(layer) {
  const champion = document.createElement("div");
  champion.className = "node champion empty";
  champion.style.left = "50%";
  champion.style.top = "50%";
  nodes.champion = champion;
  layer.appendChild(champion);
}

function buildConnections(gBase, gActive) {
  for (let i = 0; i < 32; i++) addConnection(gBase, gActive, "round32", i, "round16", Math.floor(i / 2));
  for (let i = 0; i < 16; i++) addConnection(gBase, gActive, "round16", i, "quarter", Math.floor(i / 2));
  for (let i = 0; i < 8; i++) addConnection(gBase, gActive, "quarter", i, "semi", Math.floor(i / 2));
  for (let i = 0; i < 4; i++) addConnection(gBase, gActive, "semi", i, "final", Math.floor(i / 2));
  for (let i = 0; i < 2; i++) addConnection(gBase, gActive, "final", i, "champion", 0);
}

function addConnection(gBase, gActive, fromRound, fromIndex, toRound, toIndex) {
  const d = buildPath(fromRound, fromIndex, toRound, toIndex);

  const basePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  basePath.setAttribute("d", d);
  basePath.setAttribute("class", "path-base");

  const activePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  activePath.setAttribute("d", d);
  activePath.setAttribute("class", "path-active");

  gBase.appendChild(basePath);
  gActive.appendChild(activePath);

  const length = activePath.getTotalLength();

  connections.push({
    key: `${fromRound}-${fromIndex}-${toRound}-${toIndex}`,
    fromRound,
    fromIndex,
    toRound,
    toIndex,
    basePath,
    activePath,
    length
  });
}

function buildPath(fromRound, fromIndex, toRound, toIndex) {
  const fromAngle = getRoundAngle(fromRound, fromIndex);
  const fromRadius = ROUND_CONFIG[fromRound].radius;
  const fromNodeHalf = ROUND_CONFIG[fromRound].nodeHalf;
  const startRadius = fromRadius - fromNodeHalf - 9;
  const startPoint = polarToCartesian(startRadius, fromAngle, CENTER, CENTER);

  if (toRound === "champion") {
    const pivotRadius = 88;
    const endRadius = CHAMPION_RADIUS + 16;
    const p1 = polarToCartesian(pivotRadius, fromAngle, CENTER, CENTER);
    const p2 = polarToCartesian(endRadius, fromAngle, CENTER, CENTER);

    return `
      M ${startPoint.x} ${startPoint.y}
      L ${p1.x} ${p1.y}
      L ${p2.x} ${p2.y}
    `;
  }

  const toAngle = getRoundAngle(toRound, toIndex);
  const toRadius = ROUND_CONFIG[toRound].radius;
  const toNodeHalf = ROUND_CONFIG[toRound].nodeHalf;
  const endRadius = toRadius + toNodeHalf + 11;
  const endPoint = polarToCartesian(endRadius, toAngle, CENTER, CENTER);
  const laneRadius = (startRadius + endRadius) / 2;
  const p1 = polarToCartesian(laneRadius, fromAngle, CENTER, CENTER);
  const p2 = polarToCartesian(laneRadius, toAngle, CENTER, CENTER);
  const delta = shortestSignedDelta(fromAngle, toAngle);
  const sweep = delta > 0 ? 1 : 0;

  return `
    M ${startPoint.x} ${startPoint.y}
    L ${p1.x} ${p1.y}
    A ${laneRadius} ${laneRadius} 0 0 ${sweep} ${p2.x} ${p2.y}
    L ${endPoint.x} ${endPoint.y}
  `;
}

/* =========================================================
   CLICK LOGIC
========================================================= */

function handleNodeClick(roundKey, index) {
  if (currentMode !== MODE.PREDICTION) return;

  if (roundKey === "final") {
    chooseChampion(index);
    return;
  }

  advanceWinner(roundKey, index);
}

function advanceWinner(fromRound, fromIndex) {
  const sourceArray = state[fromRound];
  const team = sourceArray[fromIndex];
  if (!team) return;

  const nextRound = NEXT_ROUND[fromRound];
  if (!nextRound || nextRound === "champion") return;

  const pairStart = Math.floor(fromIndex / 2) * 2;
  const pairEnd = pairStart + 1;
  if (!sourceArray[pairStart] || !sourceArray[pairEnd]) return;

  const targetIndex = Math.floor(fromIndex / 2);
  state[nextRound][targetIndex] = team;
  clearCascade(nextRound, targetIndex);

  saveState();
  render(`${fromRound}-${fromIndex}-${nextRound}-${targetIndex}`);
  triggerBlink(nodes[fromRound][fromIndex]);
}

function chooseChampion(finalIndex) {
  if (!state.final[finalIndex]) return;
  if (!state.final[0] || !state.final[1]) return;

  state.champion = state.final[finalIndex];
  saveState();
  render(`final-${finalIndex}-champion-0`);
  triggerBlink(nodes.final[finalIndex]);
}

function clearCascade(roundKey, index) {
  clearCascadeFromState(state, roundKey, index);
}

function clearCascadeFromState(targetState, roundKey, index) {
  const nextRound = NEXT_ROUND[roundKey];
  if (!nextRound) return;

  if (nextRound === "champion") {
    targetState.champion = null;
    return;
  }

  const nextIndex = Math.floor(index / 2);
  targetState[nextRound][nextIndex] = null;
  clearCascadeFromState(targetState, nextRound, nextIndex);
}

/* =========================================================
   RENDER
========================================================= */

function render(animatedLineKey = null) {
  renderRound("round32");
  renderRound("round16");
  renderRound("quarter");
  renderRound("semi");
  renderRound("final");
  renderChampion();
  renderConnections(animatedLineKey);

  if (animatedLineKey) animateTargetFromLine(animatedLineKey);
}

function renderRound(roundKey) {
  const roundNodes = nodes[roundKey];
  const roundData = state[roundKey];

  roundNodes.forEach((node, index) => {
    const team = roundData[index];
    const selected = isSelected(roundKey, index);
    const clickable = isClickable(roundKey, index);
    const loser = isLoser(roundKey, index);

    updateNode(node, { team, selected, clickable, loser });
  });
}

function renderChampion() {
  const node = nodes.champion;
  node.classList.remove("empty");
  node.innerHTML = "";
  node.style.borderColor = "";
  node.style.boxShadow = "";

  if (state.champion) {
    node.innerHTML = `
      <div class="champion-inner">
        <div class="champion-flag">
          <img src="${flagUrl(state.champion.iso)}" alt="${state.champion.name}" title="${state.champion.name}" />
        </div>
        <div class="champion-badge">
          ${trophySvgMarkup()}
        </div>
      </div>
    `;

    node.style.borderColor = hexToRgba(state.champion.color, 0.62);
    node.style.boxShadow = `
      0 0 0 12px ${hexToRgba(state.champion.color, 0.05)},
      0 0 26px ${hexToRgba(state.champion.color, 0.24)},
      0 16px 30px rgba(0,0,0,0.34)
    `;
  } else {
    node.classList.add("empty");
    node.innerHTML = `
      <div class="champion-empty">
        <div class="champion-badge">
          ${trophySvgMarkup()}
        </div>
      </div>
    `;
  }
}

function updateNode(node, { team, selected, clickable, loser }) {
  node.classList.remove("filled", "selected", "clickable", "loser", "empty");
  node.innerHTML = "";
  node.title = "";
  node.style.borderColor = "";
  node.style.boxShadow = "";

  if (team) {
    node.classList.add("filled");
    node.title = team.name;
    node.innerHTML = `<img src="${flagUrl(team.iso)}" alt="${team.name}" title="${team.name}" />`;
    node.style.borderColor = hexToRgba(team.color, 0.56);

    if (selected) {
      node.classList.add("selected");
      node.style.boxShadow = `
        0 0 0 3px ${hexToRgba(team.color, 0.10)},
        0 0 12px ${hexToRgba(team.color, 0.22)},
        0 10px 20px rgba(0,0,0,0.34)
      `;
    } else {
      node.style.boxShadow = `0 10px 20px rgba(0,0,0,0.34)`;
    }

    if (loser) node.classList.add("loser");
  } else {
    node.classList.add("empty");
  }

  if (clickable) node.classList.add("clickable");
}

function renderConnections(animatedLineKey = null) {
  connections.forEach((connection) => {
    const activeTeam = getActiveTeamForConnection(connection.fromRound, connection.fromIndex, connection.toRound);

    if (!activeTeam) {
      deactivateLine(connection);
      return;
    }

    const shouldAnimate = connection.key === animatedLineKey;
    activateLine(connection, activeTeam.color, shouldAnimate);
  });
}

/* =========================================================
   HELPERS DE ESTADO
========================================================= */

function isClickable(roundKey, index) {
  if (currentMode !== MODE.PREDICTION) return false;

  if (roundKey === "round32") return !!state.round32[index];
  if (roundKey === "round16") return !!state.round16[index];
  if (roundKey === "quarter") return !!state.quarter[index];
  if (roundKey === "semi") return !!state.semi[index];
  if (roundKey === "final") return !!state.final[index];

  return false;
}

function isSelected(roundKey, index) {
  if (roundKey === "final") return !!state.champion && state.final[index]?.id === state.champion.id;

  const nextRound = NEXT_ROUND[roundKey];
  if (!nextRound || nextRound === "champion") return false;

  const targetIndex = Math.floor(index / 2);
  const winner = state[nextRound][targetIndex];

  return !!winner && state[roundKey][index]?.id === winner.id;
}

function isLoser(roundKey, index) {
  if (!hasWinnerInPair(roundKey, index)) return false;
  return !isSelected(roundKey, index);
}

function hasWinnerInPair(roundKey, index) {
  if (roundKey === "final") return !!state.champion;

  const nextRound = NEXT_ROUND[roundKey];
  if (!nextRound || nextRound === "champion") return false;

  const targetIndex = Math.floor(index / 2);
  return !!state[nextRound][targetIndex];
}

function getActiveTeamForConnection(fromRound, fromIndex, toRound) {
  if (toRound === "champion") {
    if (state.champion && state[fromRound][fromIndex]?.id === state.champion.id) return state.champion;
    return null;
  }

  const targetIndex = Math.floor(fromIndex / 2);
  const winner = state[toRound][targetIndex];

  if (winner && state[fromRound][fromIndex]?.id === winner.id) return winner;
  return null;
}

/* =========================================================
   PATH ANIMATION
========================================================= */

function activateLine(connection, color, animate = false) {
  const path = connection.activePath;
  path.setAttribute("stroke", color);
  path.style.opacity = "1";
  path.style.strokeDasharray = `${connection.length}`;

  if (animate) {
    path.style.transition = "none";
    path.style.strokeDashoffset = `${connection.length}`;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        path.style.transition =
          "stroke-dashoffset 0.7s cubic-bezier(.22,1,.36,1), opacity 0.25s ease, stroke 0.25s ease";
        path.style.strokeDashoffset = "0";
      });
    });
  } else {
    path.style.transition = "none";
    path.style.strokeDashoffset = "0";
  }
}

function deactivateLine(connection) {
  const path = connection.activePath;
  path.style.transition = "none";
  path.style.opacity = "0";
  path.style.strokeDasharray = `${connection.length}`;
  path.style.strokeDashoffset = `${connection.length}`;
}

/* =========================================================
   MICROANIMACIONES
========================================================= */

function triggerPop(element) {
  if (!element) return;
  element.classList.remove("pop");
  void element.offsetWidth;
  element.classList.add("pop");
}

function triggerBlink(element) {
  if (!element) return;
  element.classList.remove("winner-blink");
  void element.offsetWidth;
  element.classList.add("winner-blink");
}

function animateTargetFromLine(lineKey) {
  const parts = lineKey.split("-");
  const toRound = parts[2];
  const toIndex = Number(parts[3]);

  setTimeout(() => {
    if (toRound === "champion") {
      triggerPop(nodes.champion);
      return;
    }

    if (nodes[toRound] && nodes[toRound][toIndex]) triggerPop(nodes[toRound][toIndex]);
  }, 260);
}

/* =========================================================
   HELPERS
========================================================= */

function flagUrl(iso) {
  return `https://flagcdn.com/w160/${iso}.png`;
}

function hexToRgba(hex, alpha) {
  const value = hex.replace("#", "");
  const normalized = value.length === 3 ? value.split("").map((char) => char + char).join("") : value;
  const bigint = parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function trophySvgMarkup() {
  return `
    <svg class="trophy-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path class="trophy-fill" d="M8 3h8v4a4 4 0 0 1-4 4 4 4 0 0 1-4-4V3Z"></path>
      <path class="trophy-stroke" d="M8 3h8v4a4 4 0 0 1-4 4 4 4 0 0 1-4-4V3Z"></path>
      <path class="trophy-stroke" d="M16 5h2a2 2 0 0 1 0 4h-2"></path>
      <path class="trophy-stroke" d="M8 5H6a2 2 0 0 0 0 4h2"></path>
      <path class="trophy-stroke" d="M12 11v4"></path>
      <path class="trophy-stroke" d="M9 19h6"></path>
      <path class="trophy-stroke" d="M10 15h4"></path>
      <path class="trophy-stroke" d="M9 19c0-2 1-3 3-3s3 1 3 3"></path>
    </svg>
  `;
}
