/* =========================================================
   FIXTURE RADIAL - Mundial 1930-2026
   - Selector de mundiales en el título
   - Fase de grupos calculada desde datos de partidos
   - Fixture circular dinámico para eliminación directa
   - Mantiene estética dorada / radial del proyecto original
========================================================= */

const STORAGE_PREFIX = "radial-fixture-worldcup-prediction";
const WORLD_CUP_YEARS = [2026, 2022, 2018, 2014, 2010, 2006, 2002, 1998, 1994, 1990, 1986, 1982, 1978, 1974, 1970, 1966, 1962, 1958, 1954, 1950, 1938, 1934, 1930];
const DEFAULT_YEAR = 2026;
const VIEWBOX = 1000;
const CENTER = 500;
const CHAMPION_RADIUS = 49;
const LIVE_WINDOW_MINUTES = 140;

const MODE = {
  FIXTURE: "fixture",
  PREDICTION: "prediction"
};

const TEAM_NAME_ES = {
  "Algeria": "Argelia",
  "Angola": "Angola",
  "Argentina": "Argentina",
  "Australia": "Australia",
  "Austria": "Austria",
  "Belgium": "Bélgica",
  "Bolivia": "Bolivia",
  "Bosnia and Herzegovina": "Bosnia y Herzegovina",
  "Brazil": "Brasil",
  "Bulgaria": "Bulgaria",
  "Cameroon": "Camerún",
  "Canada": "Canadá",
  "Chile": "Chile",
  "China PR": "China",
  "Colombia": "Colombia",
  "Costa Rica": "Costa Rica",
  "Croatia": "Croacia",
  "Cuba": "Cuba",
  "Czech Republic": "República Checa",
  "Czechoslovakia": "Checoslovaquia",
  "Denmark": "Dinamarca",
  "DR Congo": "RD Congo",
  "Dutch East Indies": "Indias Orientales Neerlandesas",
  "East Germany": "Alemania Oriental",
  "Ecuador": "Ecuador",
  "Egypt": "Egipto",
  "El Salvador": "El Salvador",
  "England": "Inglaterra",
  "France": "Francia",
  "Germany": "Alemania",
  "Ghana": "Ghana",
  "Greece": "Grecia",
  "Haiti": "Haití",
  "Honduras": "Honduras",
  "Hungary": "Hungría",
  "Iceland": "Islandia",
  "Iran": "Irán",
  "Iraq": "Irak",
  "Israel": "Israel",
  "Italy": "Italia",
  "Ivory Coast": "Costa de Marfil",
  "Jamaica": "Jamaica",
  "Japan": "Japón",
  "Kuwait": "Kuwait",
  "Mexico": "México",
  "Morocco": "Marruecos",
  "Netherlands": "Países Bajos",
  "New Zealand": "Nueva Zelanda",
  "Nigeria": "Nigeria",
  "North Korea": "Corea del Norte",
  "Northern Ireland": "Irlanda del Norte",
  "Norway": "Noruega",
  "Panama": "Panamá",
  "Paraguay": "Paraguay",
  "Peru": "Perú",
  "Poland": "Polonia",
  "Portugal": "Portugal",
  "Qatar": "Catar",
  "Republic of Ireland": "Irlanda",
  "Romania": "Rumania",
  "Russia": "Rusia",
  "Saudi Arabia": "Arabia Saudita",
  "Scotland": "Escocia",
  "Senegal": "Senegal",
  "Serbia": "Serbia",
  "Serbia and Montenegro": "Serbia y Montenegro",
  "Slovakia": "Eslovaquia",
  "Slovenia": "Eslovenia",
  "South Africa": "Sudáfrica",
  "South Korea": "Corea del Sur",
  "Soviet Union": "Unión Soviética",
  "Spain": "España",
  "Sweden": "Suecia",
  "Switzerland": "Suiza",
  "Togo": "Togo",
  "Trinidad and Tobago": "Trinidad y Tobago",
  "Tunisia": "Túnez",
  "Turkey": "Turquía",
  "Ukraine": "Ucrania",
  "United Arab Emirates": "Emiratos Árabes Unidos",
  "United States": "Estados Unidos",
  "Uruguay": "Uruguay",
  "Wales": "Gales",
  "West Germany": "Alemania Federal",
  "Yugoslavia": "Yugoslavia",
  "Zaire": "Zaire"
};

const TEAM_FLAG_CODE = {
  "Algeria": "dz",
  "Angola": "ao",
  "Argentina": "ar",
  "Australia": "au",
  "Austria": "at",
  "Belgium": "be",
  "Bolivia": "bo",
  "Bosnia and Herzegovina": "ba",
  "Brazil": "br",
  "Bulgaria": "bg",
  "Cameroon": "cm",
  "Canada": "ca",
  "Chile": "cl",
  "China PR": "cn",
  "Colombia": "co",
  "Costa Rica": "cr",
  "Croatia": "hr",
  "Cuba": "cu",
  "Czech Republic": "cz",
  "Czechoslovakia": "cz",
  "Denmark": "dk",
  "DR Congo": "cd",
  "Dutch East Indies": "id",
  "East Germany": "de",
  "Ecuador": "ec",
  "Egypt": "eg",
  "El Salvador": "sv",
  "England": "gb-eng",
  "France": "fr",
  "Germany": "de",
  "Ghana": "gh",
  "Greece": "gr",
  "Haiti": "ht",
  "Honduras": "hn",
  "Hungary": "hu",
  "Iceland": "is",
  "Iran": "ir",
  "Iraq": "iq",
  "Israel": "il",
  "Italy": "it",
  "Ivory Coast": "ci",
  "Jamaica": "jm",
  "Japan": "jp",
  "Kuwait": "kw",
  "Mexico": "mx",
  "Morocco": "ma",
  "Netherlands": "nl",
  "New Zealand": "nz",
  "Nigeria": "ng",
  "North Korea": "kp",
  "Northern Ireland": "gb-nir",
  "Norway": "no",
  "Panama": "pa",
  "Paraguay": "py",
  "Peru": "pe",
  "Poland": "pl",
  "Portugal": "pt",
  "Qatar": "qa",
  "Republic of Ireland": "ie",
  "Romania": "ro",
  "Russia": "ru",
  "Saudi Arabia": "sa",
  "Scotland": "gb-sct",
  "Senegal": "sn",
  "Serbia": "rs",
  "Serbia and Montenegro": "rs",
  "Slovakia": "sk",
  "Slovenia": "si",
  "South Africa": "za",
  "South Korea": "kr",
  "Soviet Union": "ru",
  "Spain": "es",
  "Sweden": "se",
  "Switzerland": "ch",
  "Togo": "tg",
  "Trinidad and Tobago": "tt",
  "Tunisia": "tn",
  "Turkey": "tr",
  "Ukraine": "ua",
  "United Arab Emirates": "ae",
  "United States": "us",
  "Uruguay": "uy",
  "Wales": "gb-wls",
  "West Germany": "de",
  "Yugoslavia": "rs",
  "Zaire": "cd"
};

const TEAM_COLORS = [
  "#ff6b6b", "#ffd166", "#78b5ff", "#4fd98c", "#ff9f43", "#7bc7ff", "#57d88c", "#f4f4f4",
  "#5b8cff", "#ff7b7b", "#32d978", "#d6b66b", "#6dbdff", "#ffad5a", "#8bd3ff", "#b88a55"
];

const fixtureEl = document.getElementById("fixture");
let currentMode = MODE.FIXTURE;
let selectedYear = DEFAULT_YEAR;
let activeTournament = null;
let state = null;
let positions = [];
let refreshTimer = null;

const tournamentCache = new Map();
const teamCache = new Map();

/* =========================================================
   INIT
========================================================= */

document.addEventListener("DOMContentLoaded", init);

async function init() {
  setupTournamentSelector();
  setupActionButtons();
  setModeClasses();
  await loadTournament(DEFAULT_YEAR);
  window.resetFixture = resetFixture;
}

async function loadTournament(year) {
  selectedYear = Number(year);
  setLoading(true);
  closeTournamentMenu();

  try {
    const tournament = await getTournament(selectedYear);
    activeTournament = tournament;
    currentMode = MODE.FIXTURE;
    state = createOfficialState(tournament);
    updateTournamentTitle();
    renderGroups();
    renderSidePanel();
    render();
    setModeClasses();
    updateActionButtons();
  } catch (error) {
    console.error(error);
    renderLoadError(selectedYear, error);
  } finally {
    setLoading(false);
  }
}

async function getTournament(year) {
  if (tournamentCache.has(year)) return tournamentCache.get(year);

  const response = await fetch(`/api/worldcup/${year}`, { cache: "no-store" });
  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || `No se pudo cargar el Mundial ${year}.`);
  }

  const payload = await response.json();
  const tournament = normalizeTournamentPayload(payload, year);
  tournamentCache.set(year, tournament);
  return tournament;
}

function renderLoadError(year, error) {
  activeTournament = null;
  state = null;

  if (fixtureEl) {
    fixtureEl.innerHTML = `
      <div class="fixture-message">
        <strong>No se pudo cargar el Mundial ${year}</strong>
        <span>${escapeHtml(error.message || "Revisá la conexión a internet y volvé a intentar.")}</span>
      </div>
    `;
  }

  const todayMatches = document.getElementById("todayMatches");
  if (todayMatches) {
    todayMatches.innerHTML = `<p class="empty-today">No hay datos disponibles para mostrar.</p>`;
  }

  const groupsGrid = document.getElementById("groupsGrid");
  if (groupsGrid) groupsGrid.innerHTML = "";
}

function setLoading(isLoading) {
  document.body.classList.toggle("is-loading-tournament", isLoading);
}

/* =========================================================
   SELECTOR DE MUNDIALES
========================================================= */

function setupTournamentSelector() {
  const title = document.querySelector(".tournament-title");
  if (!title) return;

  title.innerHTML = `
    <button id="tournamentButton" class="tournament-title__button" type="button" aria-haspopup="listbox" aria-expanded="false">
      <span class="tournament-title__text">Mundial ${DEFAULT_YEAR}</span>
      <span class="tournament-title__arrow" aria-hidden="true">▾</span>
    </button>
    <div id="tournamentMenu" class="tournament-menu" role="listbox" hidden></div>
  `;

  const button = document.getElementById("tournamentButton");
  const menu = document.getElementById("tournamentMenu");
  if (!button || !menu) return;

  menu.innerHTML = WORLD_CUP_YEARS.map((year) => `
    <button class="tournament-menu__item" type="button" role="option" data-year="${year}">
      Mundial ${year}
    </button>
  `).join("");

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = menu.hidden;
    menu.hidden = !isOpen;
    button.setAttribute("aria-expanded", String(isOpen));
  });

  menu.addEventListener("click", async (event) => {
    const item = event.target.closest("[data-year]");
    if (!item) return;
    await loadTournament(item.dataset.year);
  });

  document.addEventListener("click", closeTournamentMenu);
  updateTournamentMenuActive();
}

function closeTournamentMenu() {
  const button = document.getElementById("tournamentButton");
  const menu = document.getElementById("tournamentMenu");
  if (!button || !menu) return;

  menu.hidden = true;
  button.setAttribute("aria-expanded", "false");
}

function updateTournamentTitle() {
  const titleText = document.querySelector(".tournament-title__text");
  if (titleText) titleText.textContent = `Mundial ${selectedYear}`;
  updateTournamentMenuActive();
}

function updateTournamentMenuActive() {
  document.querySelectorAll(".tournament-menu__item").forEach((item) => {
    item.classList.toggle("is-active", Number(item.dataset.year) === selectedYear);
  });
}

/* =========================================================
   DATOS / NORMALIZACIÓN
========================================================= */

function normalizeTournamentPayload(payload, year) {
  const matches = Array.isArray(payload.matches)
    ? payload.matches.map((match, index) => normalizeMatch(match, year, index)).filter(Boolean)
    : [];

  const groups = buildGroups(matches);
  const bracket = buildBracket(matches);
  const finalMatch = findFinalMatch(matches);
  const champion = bracket.champion || getMatchWinner(finalMatch) || null;

  return {
    year,
    name: payload.name || `World Cup ${year}`,
    matches,
    groups,
    bracket,
    champion,
    finalMatch,
    source: payload.source || "openfootball"
  };
}

function normalizeMatch(raw, year, index) {
  const teamAName = raw.team1 || raw.teamA || raw.home_team || raw.homeTeam;
  const teamBName = raw.team2 || raw.teamB || raw.away_team || raw.awayTeam;
  if (!teamAName || !teamBName) return null;

  const teamA = getTeam(teamAName);
  const teamB = getTeam(teamBName);
  const displayScore = formatScore(raw.score);
  const winner = determineWinner(raw.score, teamA, teamB);
  const round = raw.round || raw.stage || "Partido";
  const group = raw.group || detectGroupFromRound(round);

  return {
    id: `${year}-${index}`,
    raw,
    index,
    year,
    round,
    stage: normalizeStage(round),
    dateISO: raw.date || "",
    time: normalizeTime(raw.time || ""),
    kickoffISO: makeKickoffISO(raw.date, raw.time),
    group,
    ground: raw.ground || raw.venue || "",
    teamA,
    teamB,
    scoreA: displayScore.a,
    scoreB: displayScore.b,
    status: displayScore.hasScore ? "finished" : "scheduled",
    winnerId: winner?.id || null,
    isThirdPlace: isThirdPlaceMatch(round)
  };
}

function getTeam(name) {
  const rawName = String(name || "").trim();
  const key = normalizeText(rawName);
  if (teamCache.has(key)) return teamCache.get(key);

  const displayName = TEAM_NAME_ES[rawName] || rawName;
  const iso = TEAM_FLAG_CODE[rawName] || "";
  const team = {
    id: slugify(rawName),
    sourceName: rawName,
    name: displayName,
    iso,
    color: TEAM_COLORS[Math.abs(hashCode(rawName)) % TEAM_COLORS.length]
  };

  teamCache.set(key, team);
  return team;
}

function formatScore(score) {
  if (!score || typeof score !== "object") {
    return { a: "", b: "", hasScore: false };
  }

  const base = Array.isArray(score.et) ? score.et : Array.isArray(score.ft) ? score.ft : null;
  const penalties = Array.isArray(score.p) ? score.p : null;

  if (!base) return { a: "", b: "", hasScore: false };

  const a = penalties ? `${base[0]} (${penalties[0]})` : String(base[0]);
  const b = penalties ? `${base[1]} (${penalties[1]})` : String(base[1]);
  return { a, b, hasScore: true };
}

function determineWinner(score, teamA, teamB) {
  if (!score || typeof score !== "object") return null;

  const priority = [score.p, score.et, score.ft];
  for (const pair of priority) {
    if (!Array.isArray(pair) || pair.length < 2) continue;
    const a = Number(pair[0]);
    const b = Number(pair[1]);
    if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
    if (a > b) return teamA;
    if (b > a) return teamB;
  }

  return null;
}

function getMatchWinner(match) {
  if (!match || !match.winnerId) return null;
  return [match.teamA, match.teamB].find((team) => team.id === match.winnerId) || null;
}

function normalizeStage(round) {
  const text = normalizeText(round);

  if (text.includes("round of 32") || text.includes("round 32") || text.includes("dieciseis")) return "round32";
  if (text.includes("round of 16") || text.includes("round 16") || text.includes("first round") || text.includes("eighth")) return "round16";
  if (text.includes("quarter")) return "quarter";
  if (text.includes("semi")) return "semi";
  if (text === "final" || text.includes("final")) return isThirdPlaceMatch(round) ? "third" : "final";
  if (text.includes("matchday") || text.includes("group")) return "group";

  return "other";
}

function detectGroupFromRound(round) {
  const match = String(round || "").match(/Group\s+([A-Za-z0-9]+)/i);
  return match ? `Group ${match[1]}` : "";
}

function isGroupStageMatch(match) {
  if (match.group) return true;
  const stage = normalizeStage(match.round);
  return stage === "group";
}

function isThirdPlaceMatch(round) {
  const text = normalizeText(round);
  return text.includes("third") || text.includes("3rd") || text.includes("place") || text.includes("bronze");
}

function stageSortValue(stage) {
  return {
    round32: 0,
    round16: 1,
    quarter: 2,
    semi: 3,
    final: 4
  }[stage] ?? 99;
}

function buildGroups(matches) {
  const groupsByName = new Map();

  matches.filter(isGroupStageMatch).forEach((match) => {
    const groupName = translateGroupName(match.group || match.round || "Grupo");
    if (!groupsByName.has(groupName)) groupsByName.set(groupName, new Map());
    const rows = groupsByName.get(groupName);

    ensureGroupRow(rows, match.teamA);
    ensureGroupRow(rows, match.teamB);

    if (match.status !== "finished") return;

    const goals = parseBaseScore(match.raw.score);
    if (!goals) return;

    updateGroupRows(rows, match.teamA.id, match.teamB.id, goals[0], goals[1]);
  });

  return Array.from(groupsByName.entries()).map(([name, rows]) => ({
    name,
    teams: Array.from(rows.values()).sort(sortGroupRows)
  })).sort((a, b) => groupSortValue(a.name) - groupSortValue(b.name));
}

function ensureGroupRow(rows, team) {
  if (rows.has(team.id)) return;

  rows.set(team.id, {
    teamId: team.id,
    team,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0
  });
}

function updateGroupRows(rows, teamAId, teamBId, goalsA, goalsB) {
  const a = rows.get(teamAId);
  const b = rows.get(teamBId);
  if (!a || !b) return;

  a.played += 1;
  b.played += 1;
  a.goalsFor += goalsA;
  a.goalsAgainst += goalsB;
  b.goalsFor += goalsB;
  b.goalsAgainst += goalsA;

  if (goalsA > goalsB) {
    a.wins += 1;
    b.losses += 1;
    a.points += 3;
  } else if (goalsB > goalsA) {
    b.wins += 1;
    a.losses += 1;
    b.points += 3;
  } else {
    a.draws += 1;
    b.draws += 1;
    a.points += 1;
    b.points += 1;
  }

  a.goalDifference = a.goalsFor - a.goalsAgainst;
  b.goalDifference = b.goalsFor - b.goalsAgainst;
}

function parseBaseScore(score) {
  if (!score || !Array.isArray(score.ft)) return null;
  const a = Number(score.ft[0]);
  const b = Number(score.ft[1]);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return [a, b];
}

function sortGroupRows(a, b) {
  if (b.points !== a.points) return b.points - a.points;
  if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  return a.team.name.localeCompare(b.team.name, "es");
}

function groupSortValue(name) {
  const match = String(name).match(/([A-Z]|\d+)$/i);
  if (!match) return 999;
  const token = match[1].toUpperCase();
  if (/^\d+$/.test(token)) return Number(token);
  return token.charCodeAt(0) - 64;
}

function translateGroupName(name) {
  return String(name || "Grupo")
    .replace(/^Group\s+/i, "Grupo ")
    .replace(/^Final Group$/i, "Grupo final");
}

function buildBracket(matches) {
  const knockoutMatches = matches
    .filter((match) => !isGroupStageMatch(match) && !match.isThirdPlace)
    .filter((match) => ["round32", "round16", "quarter", "semi", "final"].includes(match.stage))
    .sort((a, b) => stageSortValue(a.stage) - stageSortValue(b.stage) || compareDateTime(a, b));

  if (!knockoutMatches.length) {
    return buildFallbackFinalPhase(matches);
  }

  const stages = [];
  knockoutMatches.forEach((match) => {
    let bucket = stages.find((item) => item.stage === match.stage);
    if (!bucket) {
      bucket = { stage: match.stage, label: getStageLabel(match.stage), matches: [] };
      stages.push(bucket);
    }
    bucket.matches.push(match);
  });

  stages.sort((a, b) => stageSortValue(a.stage) - stageSortValue(b.stage));
  stages.forEach((stage) => stage.matches.sort(compareDateTime));

  const firstStage = stages[0];
  const firstRoundTeams = firstStage.matches.flatMap((match) => [match.teamA, match.teamB]);
  const rounds = [firstRoundTeams];
  const roundLabels = [firstStage.label];

  stages.forEach((stage) => {
    const winners = stage.matches.map(getMatchWinner);
    if (winners.length) {
      rounds.push(winners);
      roundLabels.push(getNextRoundLabel(stage.stage));
    }
  });

  const champion = rounds.at(-1)?.[0] || null;

  return {
    type: "knockout",
    matches: knockoutMatches,
    stages,
    rounds,
    roundLabels,
    champion
  };
}

function buildFallbackFinalPhase(matches) {
  const completedMatches = matches.filter((match) => match.status === "finished").sort(compareDateTime);
  const finalMatch = findFinalMatch(matches) || completedMatches.at(-1) || null;
  const champion = getMatchWinner(finalMatch) || inferChampionFromGroups(matches);

  const finalists = finalMatch ? [finalMatch.teamA, finalMatch.teamB] : champion ? [champion, null] : [];

  return {
    type: "final-phase",
    matches: finalMatch ? [finalMatch] : [],
    stages: [],
    rounds: finalists.length ? [finalists, [champion]] : [[], []],
    roundLabels: ["Fase final", "Campeón"],
    champion
  };
}

function inferChampionFromGroups(matches) {
  const groups = buildGroups(matches);
  const finalGroup = groups.find((group) => /final/i.test(group.name));
  if (finalGroup?.teams?.length) return finalGroup.teams[0].team;
  return null;
}

function findFinalMatch(matches) {
  return matches.find((match) => match.stage === "final" && !match.isThirdPlace) || null;
}

function compareDateTime(a, b) {
  const aKey = `${a.dateISO || "9999-99-99"} ${a.time || "99:99"}`;
  const bKey = `${b.dateISO || "9999-99-99"} ${b.time || "99:99"}`;
  return aKey.localeCompare(bKey);
}

function getStageLabel(stage) {
  return {
    round32: "16avos",
    round16: "Octavos",
    quarter: "Cuartos",
    semi: "Semifinales",
    final: "Final"
  }[stage] || "Eliminación";
}

function getNextRoundLabel(stage) {
  return {
    round32: "Octavos",
    round16: "Cuartos",
    quarter: "Semifinales",
    semi: "Final",
    final: "Campeón"
  }[stage] || "Siguiente ronda";
}

function normalizeTime(time) {
  const clean = String(time || "").trim();
  const match = clean.match(/(\d{1,2}:\d{2})/);
  return match ? match[1] : clean;
}

function makeKickoffISO(date, time) {
  if (!date) return "";
  const normalizedTime = normalizeTime(time) || "00:00";
  return `${date}T${normalizedTime}:00`;
}

/* =========================================================
   STATE / PREDICCIÓN
========================================================= */

function createOfficialState(tournament) {
  const rounds = tournament.bracket.rounds.map((round) => round.map((team) => team || null));
  return {
    rounds,
    champion: tournament.bracket.champion || rounds.at(-1)?.[0] || null
  };
}

function createPredictionState(tournament) {
  const saved = loadPredictionState(tournament.year);
  if (saved && Array.isArray(saved.rounds)) return saved;
  return createOfficialState(tournament);
}

function loadPredictionState(year) {
  const raw = localStorage.getItem(`${STORAGE_PREFIX}-${year}`);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.rounds)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveState() {
  if (currentMode !== MODE.PREDICTION || !activeTournament) return;
  localStorage.setItem(`${STORAGE_PREFIX}-${activeTournament.year}`, JSON.stringify(state));
}

function resetFixture() {
  if (currentMode !== MODE.PREDICTION || !activeTournament) return;
  localStorage.removeItem(`${STORAGE_PREFIX}-${activeTournament.year}`);
  state = createOfficialState(activeTournament);
  render();
  updateActionButtons();
}

function selectTeam(roundIndex, teamIndex) {
  if (currentMode !== MODE.PREDICTION || !state) return;

  const team = state.rounds[roundIndex]?.[teamIndex];
  if (!team) return;

  const nextRoundIndex = roundIndex + 1;
  if (nextRoundIndex >= state.rounds.length) {
    state.champion = team;
    saveState();
    render();
    return;
  }

  const targetIndex = Math.floor(teamIndex / 2);
  state.rounds[nextRoundIndex][targetIndex] = team;
  clearPredictionCascade(nextRoundIndex, targetIndex);

  if (nextRoundIndex === state.rounds.length - 1) {
    state.champion = team;
  }

  saveState();
  render();
}

function clearPredictionCascade(roundIndex, index) {
  let currentIndex = index;
  for (let i = roundIndex + 1; i < state.rounds.length; i += 1) {
    currentIndex = Math.floor(currentIndex / 2);
    if (state.rounds[i]) state.rounds[i][currentIndex] = null;
  }
  state.champion = state.rounds.at(-1)?.[0] || null;
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
  if (!activeTournament) return;
  hideGroupsView();
  currentMode = MODE.PREDICTION;
  state = createPredictionState(activeTournament);
  saveState();
  setModeClasses();
  render();
  renderSidePanel();
  updateActionButtons();
}

function activateFixtureMode() {
  if (!activeTournament) return;
  hideGroupsView();
  currentMode = MODE.FIXTURE;
  state = createOfficialState(activeTournament);
  setModeClasses();
  render();
  renderSidePanel();
  updateActionButtons();
}

function activateGroupsView() {
  const groupsPanel = document.getElementById("groupsPanel");
  if (!groupsPanel) return;

  document.body.classList.add("groups-view");
  groupsPanel.hidden = false;
  renderGroups();
  updateActionButtons();
}

function hideGroupsView() {
  const groupsPanel = document.getElementById("groupsPanel");
  document.body.classList.remove("groups-view");
  if (groupsPanel) groupsPanel.hidden = true;
}

function isGroupsViewActive() {
  return document.body.classList.contains("groups-view");
}

function setModeClasses() {
  document.body.classList.toggle("prediction-mode", currentMode === MODE.PREDICTION);
  document.body.classList.toggle("fixture-mode", currentMode === MODE.FIXTURE);
}

function updateActionButtons() {
  const predictionButton = document.getElementById("predictionButton");
  const fixtureButton = document.getElementById("fixtureButton");
  const groupsButton = document.getElementById("groupsButton");
  const resetButton = document.getElementById("resetButton");
  const groupsActive = isGroupsViewActive();

  if (predictionButton) {
    predictionButton.classList.toggle("is-active", !groupsActive && currentMode === MODE.PREDICTION);
    predictionButton.disabled = !activeTournament || !state?.rounds?.length;
  }

  if (fixtureButton) {
    fixtureButton.classList.toggle("is-active", !groupsActive && currentMode === MODE.FIXTURE);
  }

  if (groupsButton) {
    groupsButton.classList.toggle("is-active", groupsActive);
  }

  if (resetButton) {
    resetButton.disabled = currentMode !== MODE.PREDICTION;
  }
}

/* =========================================================
   GRUPOS
========================================================= */

function renderGroups() {
  const container = document.getElementById("groupsGrid");
  if (!container) return;

  if (!activeTournament) {
    container.innerHTML = "";
    return;
  }

  if (!activeTournament.groups.length) {
    container.innerHTML = `
      <article class="group-card group-card--empty">
        <div class="group-card__title">
          <h3>Mundial ${activeTournament.year}</h3>
          <span>Formato histórico</span>
        </div>
        <p class="group-empty-text">Este torneo no tuvo una fase de grupos tradicional para calcular tablas.</p>
      </article>
    `;
    return;
  }

  container.innerHTML = activeTournament.groups.map(groupCardMarkup).join("");
}

function groupCardMarkup(group) {
  return `
    <article class="group-card">
      <div class="group-card__title">
        <h3>${escapeHtml(group.name)}</h3>
        <span>Tabla final</span>
      </div>

      <div class="group-table-wrap">
        <table class="group-table" aria-label="${escapeHtml(group.name)}">
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
            ${group.teams.map((row, index) => groupRowMarkup(row, index + 1)).join("")}
          </tbody>
        </table>
      </div>
    </article>
  `;
}

function groupRowMarkup(row, rank) {
  const qualifiedClass = rank <= 2 ? "is-qualified" : "";

  return `
    <tr class="${qualifiedClass}">
      <td class="group-rank">${rank}</td>
      <td class="group-team-cell">
        <div class="group-team">
          ${flagMarkup(row.team, "group-flag")}
          <span class="group-team-name">${escapeHtml(row.team.name)}</span>
        </div>
      </td>
      <td class="group-points">${row.points}</td>
      <td>${row.played}</td>
      <td>${row.wins}</td>
      <td>${row.draws}</td>
      <td>${row.losses}</td>
      <td>${row.goalsFor}</td>
      <td>${row.goalsAgainst}</td>
      <td>${formatGoalDifference(row.goalDifference)}</td>
    </tr>
  `;
}

function formatGoalDifference(value) {
  if (value > 0) return `+${value}`;
  return String(value);
}

/* =========================================================
   PANEL LATERAL
========================================================= */

function renderSidePanel() {
  const panel = document.getElementById("todayPanel");
  const container = document.getElementById("todayMatches");
  if (!panel || !container || !activeTournament) return;

  const eyebrow = panel.querySelector(".today-panel__eyebrow");
  const title = panel.querySelector("h2");

  if (selectedYear === DEFAULT_YEAR) {
    if (eyebrow) eyebrow.textContent = "Partidos";
    if (title) title.textContent = "Hoy";
    renderTodayMatches(container);
    return;
  }

  if (eyebrow) eyebrow.textContent = "Mundial";
  if (title) title.textContent = String(selectedYear);

  const champion = activeTournament.champion;
  const finalMatch = activeTournament.finalMatch;

  container.innerHTML = `
    <article class="summary-card">
      <span class="summary-card__label">Campeón</span>
      <div class="summary-card__champion">
        ${champion ? flagMarkup(champion, "summary-flag") : ""}
        <strong>${champion ? escapeHtml(champion.name) : "Por definir"}</strong>
      </div>
      ${finalMatch ? `
        <div class="summary-card__final">
          <span>Final</span>
          <p>${escapeHtml(finalMatch.teamA.name)} ${escapeHtml(finalMatch.scoreA)} - ${escapeHtml(finalMatch.scoreB)} ${escapeHtml(finalMatch.teamB.name)}</p>
        </div>
      ` : ""}
    </article>
  `;
}

function renderTodayMatches(container) {
  const now = new Date();
  const todayISO = getTodayISO();

  const todayMatches = activeTournament.matches
    .map((match) => ({ match, computed: getComputedMatchStatus(match, now) }))
    .filter(({ match, computed }) => {
      if (computed.hidden) return false;
      return match.dateISO === todayISO || computed.kind === "live";
    })
    .sort((a, b) => {
      if (a.computed.kind === "live" && b.computed.kind !== "live") return -1;
      if (a.computed.kind !== "live" && b.computed.kind === "live") return 1;
      return a.computed.sortMinutes - b.computed.sortMinutes;
    });

  if (!todayMatches.length) {
    const champion = activeTournament.champion;
    container.innerHTML = `
      <p class="empty-today">No quedan partidos pendientes para hoy.</p>
      ${champion ? `<article class="summary-card summary-card--compact"><span class="summary-card__label">Campeón actual</span><strong>${escapeHtml(champion.name)}</strong></article>` : ""}
    `;
    return;
  }

  container.innerHTML = todayMatches.map(({ match, computed }) => `
    <article class="match-card ${computed.cardClass}">
      <div class="match-card__time ${computed.timeClass}">${computed.statusMarkup}</div>
      ${matchTeamMarkup(match.teamA, computed.scoreA)}
      <div class="match-vs">VS</div>
      ${matchTeamMarkup(match.teamB, computed.scoreB)}
    </article>
  `).join("");
}

function getComputedMatchStatus(match, now = new Date()) {
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

  const kickoff = new Date(match.kickoffISO);
  const kickoffMinutes = getMatchMinutes(match.time);

  if (Number.isNaN(kickoff.getTime()) || kickoff > now) {
    return {
      hidden: false,
      kind: "scheduled",
      cardClass: "is-scheduled",
      timeClass: "",
      statusMarkup: `${match.time || "--:--"} hs`,
      sortMinutes: kickoffMinutes,
      scoreA: "",
      scoreB: ""
    };
  }

  const elapsedMinutes = Math.floor((now.getTime() - kickoff.getTime()) / 60_000);

  if (elapsedMinutes <= LIVE_WINDOW_MINUTES) {
    return {
      hidden: false,
      kind: "live",
      cardClass: "is-live",
      timeClass: "is-live-status",
      statusMarkup: `<span class="live-dot"></span><span>EN VIVO</span>`,
      sortMinutes: kickoffMinutes,
      scoreA: match.scoreA || "0",
      scoreB: match.scoreB || "0"
    };
  }

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

function getTodayISO() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMatchMinutes(time) {
  if (!time || !time.includes(":")) return Number.MAX_SAFE_INTEGER;
  const [hours, minutes] = time.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return Number.MAX_SAFE_INTEGER;
  return hours * 60 + minutes;
}

function matchTeamMarkup(team, score) {
  return `
    <div class="match-row">
      <div class="match-team">
        ${flagMarkup(team, "match-flag")}
        <span class="match-name">${escapeHtml(team?.name || "Por definir")}</span>
      </div>
      <span class="match-score">${escapeHtml(score || "")}</span>
    </div>
  `;
}

/* =========================================================
   FIXTURE RADIAL DINÁMICO
========================================================= */

function render() {
  if (!fixtureEl) return;

  if (!state || !activeTournament || !state.rounds.length || !state.rounds[0].length) {
    fixtureEl.innerHTML = `
      <div class="fixture-message">
        <strong>Sin cuadro de eliminación directa</strong>
        <span>Este torneo se definió con un formato histórico diferente.</span>
      </div>
    `;
    return;
  }

  calculatePositions();
  fixtureEl.innerHTML = "";

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${VIEWBOX} ${VIEWBOX}`);
  svg.classList.add("fixture-svg");

  const gGuide = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const gBase = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const gActive = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svg.append(gGuide, gBase, gActive);

  drawGuideRings(gGuide);
  drawConnections(gBase, gActive);

  const nodesLayer = document.createElement("div");
  nodesLayer.classList.add("nodes-layer");

  state.rounds.forEach((round, roundIndex) => {
    round.forEach((team, teamIndex) => {
      nodesLayer.appendChild(createTeamNode(team, roundIndex, teamIndex));
    });
  });

  nodesLayer.appendChild(createChampionNode());
  fixtureEl.append(svg, nodesLayer);
}

function calculatePositions() {
  const rounds = state.rounds;
  const roundCount = rounds.length;
  const maxRadius = 462;
  const minRadius = 140;

  positions = rounds.map((round, roundIndex) => {
    const count = Math.max(round.length, 1);
    const ratio = roundCount <= 1 ? 0 : roundIndex / (roundCount - 1);
    const radius = maxRadius - (maxRadius - minRadius) * ratio;
    const startAngle = -90;
    const step = 360 / count;

    return round.map((_team, index) => {
      const angle = startAngle + index * step;
      return polarToCartesian(radius, angle, CENTER, CENTER);
    });
  });
}

function drawGuideRings(layer) {
  positions.forEach((roundPositions, index) => {
    const first = roundPositions[0];
    if (!first) return;
    const radius = Math.hypot(first.x - CENTER, first.y - CENTER);
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", CENTER);
    circle.setAttribute("cy", CENTER);
    circle.setAttribute("r", radius);
    circle.classList.add("guide-ring");
    if (index > 0) circle.classList.add("inner");
    layer.appendChild(circle);
  });
}

function drawConnections(baseLayer, activeLayer) {
  for (let roundIndex = 0; roundIndex < state.rounds.length - 1; roundIndex += 1) {
    const round = state.rounds[roundIndex];

    round.forEach((team, teamIndex) => {
      const nextIndex = Math.floor(teamIndex / 2);
      const from = positions[roundIndex]?.[teamIndex];
      const to = positions[roundIndex + 1]?.[nextIndex];
      if (!from || !to) return;

      const path = connectionPath(from, to);
      baseLayer.appendChild(makePath(path, "path-base"));

      const winner = state.rounds[roundIndex + 1]?.[nextIndex];
      if (team && winner && team.id === winner.id) {
        const activePath = makePath(path, "path-active");
        activePath.style.opacity = "1";
        activePath.style.color = team.color || "#ffcb63";
        activeLayer.appendChild(activePath);
      }
    });
  }

  const finalRoundIndex = state.rounds.length - 1;
  state.rounds[finalRoundIndex]?.forEach((team, index) => {
    const from = positions[finalRoundIndex]?.[index];
    if (!from) return;
    const to = { x: CENTER, y: CENTER };
    const path = connectionPath(from, to);
    baseLayer.appendChild(makePath(path, "path-base"));

    if (team && state.champion && team.id === state.champion.id) {
      const activePath = makePath(path, "path-active");
      activePath.style.opacity = "1";
      activePath.style.color = team.color || "#ffcb63";
      activeLayer.appendChild(activePath);
    }
  });
}

function makePath(path, className) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", "path");
  el.setAttribute("d", path);
  el.classList.add(className);
  return el;
}

function connectionPath(from, to) {
  const mid = {
    x: CENTER + (from.x + to.x - 2 * CENTER) * 0.5,
    y: CENTER + (from.y + to.y - 2 * CENTER) * 0.5
  };
  return `M ${from.x} ${from.y} Q ${mid.x} ${mid.y} ${to.x} ${to.y}`;
}

function createTeamNode(team, roundIndex, teamIndex) {
  const node = document.createElement("button");
  const count = state.rounds[roundIndex]?.length || 0;
  const className = nodeClassForCount(count, roundIndex);
  const position = positions[roundIndex]?.[teamIndex] || { x: CENTER, y: CENTER };

  node.type = "button";
  node.className = `node ${className}`;
  node.style.left = `${position.x / VIEWBOX * 100}%`;
  node.style.top = `${position.y / VIEWBOX * 100}%`;

  if (!team) {
    node.classList.add("empty");
    node.setAttribute("aria-label", "Por definir");
    return node;
  }

  node.title = team.name;
  node.setAttribute("aria-label", team.name);
  node.style.borderColor = hexToRgba(team.color, 0.62);
  node.style.boxShadow = `0 0 0 5px ${hexToRgba(team.color, 0.05)}, 0 0 18px ${hexToRgba(team.color, 0.22)}, var(--node-shadow)`;
  node.innerHTML = flagImageMarkup(team);

  if (currentMode === MODE.PREDICTION) {
    node.classList.add("clickable");
    node.addEventListener("click", () => selectTeam(roundIndex, teamIndex));
  }

  if (isLoserNode(team, roundIndex, teamIndex)) {
    node.classList.add("loser");
  }

  return node;
}

function createChampionNode() {
  const node = document.createElement("div");
  node.className = "node champion";
  node.style.left = "50%";
  node.style.top = "50%";

  const champion = state.champion;

  if (champion) {
    node.title = champion.name;
    node.style.borderColor = hexToRgba(champion.color, 0.62);
    node.style.boxShadow = `0 0 0 12px ${hexToRgba(champion.color, 0.05)}, 0 0 26px ${hexToRgba(champion.color, 0.24)}, 0 16px 30px rgba(0,0,0,.34)`;
    node.innerHTML = `
      <div class="champion-inner">
        ${flagImageMarkup(champion)}
      </div>
    `;
  } else {
    node.classList.add("empty");
    node.innerHTML = `
      <div class="champion-empty" aria-label="Campeón por definir">
        <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M18 3h2a1 1 0 0 1 1 1v2a5 5 0 0 1-5 5h-.1A6.98 6.98 0 0 1 13 13.93V17h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-3.07A6.98 6.98 0 0 1 8.1 11H8a5 5 0 0 1-5-5V4a1 1 0 0 1 1-1h2V2.5A.5.5 0 0 1 6.5 2h11a.5.5 0 0 1 .5.5V3Zm0 2v3.83A3 3 0 0 0 19 6V5h-1ZM5 5v1a3 3 0 0 0 1 2.83V5H5Z"/>
        </svg>
      </div>
    `;
  }

  return node;
}

function nodeClassForCount(count, roundIndex) {
  if (count >= 32) return "round32";
  if (count >= 16) return "round16";
  if (count >= 8) return "quarter";
  if (count >= 4) return "semi";
  if (count >= 2) return "final";
  return roundIndex === 0 ? "round16" : "final";
}

function isLoserNode(team, roundIndex, teamIndex) {
  if (!team || roundIndex >= state.rounds.length - 1) return false;
  const nextTeam = state.rounds[roundIndex + 1]?.[Math.floor(teamIndex / 2)];
  return !!nextTeam && nextTeam.id !== team.id;
}

function polarToCartesian(radius, angleDegrees, centerX, centerY) {
  const angleRadians = (angleDegrees - 90) * Math.PI / 180;
  return {
    x: centerX + radius * Math.cos(angleRadians),
    y: centerY + radius * Math.sin(angleRadians)
  };
}

/* =========================================================
   HELPERS VISUALES
========================================================= */

function flagUrl(iso) {
  if (!iso) return "";
  return `https://flagcdn.com/w80/${iso.toLowerCase()}.png`;
}

function flagImageMarkup(team) {
  if (!team?.iso) return `<span class="node-initials">${escapeHtml(getInitials(team?.name || "?"))}</span>`;
  return `<img src="${flagUrl(team.iso)}" alt="${escapeHtml(team.name)}" title="${escapeHtml(team.name)}" />`;
}

function flagMarkup(team, className) {
  if (!team) return `<span class="${className} match-flag--placeholder">?</span>`;
  if (!team.iso) return `<span class="${className} match-flag--placeholder">${escapeHtml(getInitials(team.name))}</span>`;
  return `<span class="${className}"><img src="${flagUrl(team.iso)}" alt="${escapeHtml(team.name)}" /></span>`;
}

function getInitials(name) {
  return String(name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function hexToRgba(hex, alpha) {
  if (!hex || !hex.startsWith("#")) return `rgba(255,203,99,${alpha})`;
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function slugify(value) {
  return normalizeText(value).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "team";
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function hashCode(value) {
  let hash = 0;
  const text = String(value || "");
  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
