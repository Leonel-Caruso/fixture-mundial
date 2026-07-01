require("dotenv").config();

const fs = require("fs/promises");
const path = require("path");
const express = require("express");
const cors = require("cors");
const { MATCH_MAP } = require("./match-map");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const ROOT_DIR = path.resolve(__dirname, "..");
const PUBLIC_DIR = ROOT_DIR;

app.use(cors());
app.use(express.json());
app.use(express.static(PUBLIC_DIR));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, provider: getProvider(), now: new Date().toISOString() });
});

app.get("/api/debug/config", (_req, res) => {
  res.set("Cache-Control", "no-store");
  res.json({
    provider: getProvider(),
    hasApiFootballKey: Boolean(process.env.API_FOOTBALL_KEY),
    apiFootballBaseUrl: getApiConfig().baseUrl,
    apiFootballLeagueId: getApiConfig().league,
    apiFootballSeason: getApiConfig().season,
    espnBaseUrl: getEspnConfig().baseUrl,
    espnDates: getEspnConfig().dates,
    worldcup26BaseUrl: getWorldCup26Config().baseUrl,
    footballDataBaseUrl: getFootballDataConfig().baseUrl,
    footballDataCompetition: getFootballDataConfig().competition,
    hasFootballDataKey: Boolean(process.env.FOOTBALL_DATA_KEY),
    tournamentStartDate: getApiConfig().from,
    tournamentEndDate: getApiConfig().to,
    lookaheadDays: Number(process.env.LOOKAHEAD_DAYS || 14),
    timezone: "America/Argentina/Buenos_Aires"
  });
});

app.get("/api/debug/api-football", async (_req, res) => {
  res.set("Cache-Control", "no-store");

  if (getProvider() !== "api-football") {
    return res.status(400).json({
      ok: false,
      error: "API_PROVIDER no está en api-football.",
      provider: getProvider()
    });
  }

  if (!process.env.API_FOOTBALL_KEY) {
    return res.status(400).json({ ok: false, error: "Falta API_FOOTBALL_KEY." });
  }

  try {
    const config = getApiConfig();
    const rangePayload = await requestApiFootball("/fixtures", {
      league: config.league,
      season: config.season,
      from: config.from,
      to: config.to,
      timezone: "America/Argentina/Buenos_Aires"
    });

    const livePayload = await requestApiFootball("/fixtures", { live: "all" });

    const rangeFixtures = Array.isArray(rangePayload.response) ? rangePayload.response : [];
    const liveFixtures = Array.isArray(livePayload.response) ? livePayload.response : [];
    const combined = mergeFixtures(rangeFixtures, liveFixtures);
    const mapped = mapExternalFixturesToLocalUpdates(combined);

    res.json({
      ok: true,
      config,
      range: summarizePayload(rangePayload, rangeFixtures),
      liveAll: summarizePayload(livePayload, liveFixtures),
      combinedFixtures: combined.length,
      mappedUpdates: mapped.length,
      mapped,
      sampleFixtures: combined.slice(0, 25).map(summarizeFixture)
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});


app.get("/api/debug/espn", async (_req, res) => {
  res.set("Cache-Control", "no-store");

  if (getProvider() !== "espn") {
    return res.status(400).json({
      ok: false,
      error: "API_PROVIDER no está en espn.",
      provider: getProvider()
    });
  }

  try {
    const config = getEspnConfig();
    const payloads = await requestEspnScoreboards();
    const events = mergeEspnEvents(payloads.flatMap((payload) => Array.isArray(payload.events) ? payload.events : []));
    const mapped = mapEspnEventsToLocalUpdates(events);

    res.json({
      ok: true,
      config,
      requests: payloads.map((payload) => ({
        eventsReceived: Array.isArray(payload.events) ? payload.events.length : 0,
        leagues: Array.isArray(payload.leagues) ? payload.leagues.map((league) => ({ id: league.id, name: league.name, slug: league.slug })) : []
      })),
      combinedEvents: events.length,
      mappedUpdates: mapped.length,
      mapped,
      sampleEvents: events.slice(0, 30).map(summarizeEspnEvent)
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});


app.get("/api/debug/worldcup26", async (_req, res) => {
  res.set("Cache-Control", "no-store");

  if (getProvider() !== "worldcup26") {
    return res.status(400).json({
      ok: false,
      error: "API_PROVIDER no está en worldcup26.",
      provider: getProvider()
    });
  }

  try {
    const config = getWorldCup26Config();
    const payload = await requestWorldCup26Games();
    const games = extractWorldCup26Games(payload);
    const mapped = mapWorldCup26GamesToLocalUpdates(games);

    res.json({
      ok: true,
      config,
      gamesReceived: games.length,
      mappedUpdates: mapped.length,
      mapped,
      sampleGames: games.slice(0, 30).map(summarizeWorldCup26Game)
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});


app.get("/api/debug/football-data", async (_req, res) => {
  res.set("Cache-Control", "no-store");

  if (getProvider() !== "football-data") {
    return res.status(400).json({
      ok: false,
      error: "API_PROVIDER no está en football-data.",
      provider: getProvider()
    });
  }

  if (!process.env.FOOTBALL_DATA_KEY) {
    return res.status(400).json({ ok: false, error: "Falta FOOTBALL_DATA_KEY." });
  }

  try {
    const config = getFootballDataConfig();
    const payload = await requestFootballData(`/competitions/${config.competition}/matches`, {
      dateFrom: config.from,
      dateTo: config.to
    });
    const todayPayload = await requestFootballData("/matches", {
      dateFrom: getISODate(new Date()),
      dateTo: getISODate(new Date())
    });
    const matches = mergeFootballDataMatches(
      Array.isArray(payload.matches) ? payload.matches : [],
      Array.isArray(todayPayload.matches) ? todayPayload.matches : []
    );
    const mapped = mapFootballDataMatchesToLocalUpdates(matches);

    res.json({
      ok: true,
      config,
      competitionRequest: {
        count: payload.count,
        filters: payload.filters,
        resultSet: payload.resultSet,
        matchesReceived: Array.isArray(payload.matches) ? payload.matches.length : 0
      },
      todayRequest: {
        count: todayPayload.count,
        filters: todayPayload.filters,
        resultSet: todayPayload.resultSet,
        matchesReceived: Array.isArray(todayPayload.matches) ? todayPayload.matches.length : 0
      },
      combinedMatches: matches.length,
      mappedUpdates: mapped.length,
      mapped,
      sampleMatches: matches.slice(0, 30).map(summarizeFootballDataMatch)
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.get("/api/matches", async (_req, res) => {
  try {
    const updates = await getNormalizedUpdates();
    res.set("Cache-Control", "no-store");
    res.json(updates);
  } catch (error) {
    console.error("[api/matches]", error);
    res.status(500).json({ error: "No se pudieron obtener los partidos." });
  }
});

app.listen(PORT, () => {
  console.log(`Fixture radial listo en http://localhost:${PORT}`);
  console.log(`Proveedor activo: ${getProvider()}`);
});

function getProvider() {
  const provider = String(process.env.API_PROVIDER || "mock").trim().toLowerCase();
  if (provider === "api-football") return "api-football";
  if (provider === "espn") return "espn";
  if (["worldcup26", "worldcup26-ir", "worldcup26ir"].includes(provider)) return "worldcup26";
  if (["football-data", "footballdata", "football-data.org"].includes(provider)) return "football-data";
  return "mock";
}

function getApiConfig() {
  const from = process.env.TOURNAMENT_START_DATE || getISODate(new Date());
  const to = addDaysISO(new Date(), Number(process.env.LOOKAHEAD_DAYS || 14));

  return {
    baseUrl: process.env.API_FOOTBALL_BASE_URL || "https://v3.football.api-sports.io",
    league: process.env.API_FOOTBALL_LEAGUE_ID || "1",
    season: process.env.API_FOOTBALL_SEASON || "2026",
    from,
    to
  };
}

async function getNormalizedUpdates() {
  if (getProvider() === "football-data") {
    if (!process.env.FOOTBALL_DATA_KEY) {
      console.warn("API_PROVIDER=football-data, pero falta FOOTBALL_DATA_KEY. Uso mock.");
      return readMockUpdates();
    }

    try {
      return await fetchFootballDataUpdates();
    } catch (error) {
      console.warn("No se pudo consultar football-data.org. Uso mock.", error.message);
      return readMockUpdates();
    }
  }

  if (getProvider() === "worldcup26") {
    try {
      return await fetchWorldCup26Updates();
    } catch (error) {
      console.warn("No se pudo consultar worldcup26.ir. Uso mock.", error.message);
      return readMockUpdates();
    }
  }

  if (getProvider() === "espn") {
    try {
      return await fetchEspnUpdates();
    } catch (error) {
      console.warn("No se pudo consultar ESPN. Uso mock.", error.message);
      return readMockUpdates();
    }
  }

  if (getProvider() === "api-football") {
    const key = process.env.API_FOOTBALL_KEY;
    if (!key) {
      console.warn("API_PROVIDER=api-football, pero falta API_FOOTBALL_KEY. Uso mock.");
      return readMockUpdates();
    }

    try {
      return await fetchApiFootballUpdates();
    } catch (error) {
      console.warn("No se pudo consultar API-Football. Uso mock.", error.message);
      return readMockUpdates();
    }
  }

  return readMockUpdates();
}

async function readMockUpdates() {
  const filePath = path.join(ROOT_DIR, "data", "mock-live-results.json");
  const raw = await fs.readFile(filePath, "utf8");
  const data = JSON.parse(raw);
  return Array.isArray(data) ? data : [];
}



function getFootballDataConfig() {
  const from = process.env.TOURNAMENT_START_DATE || getISODate(new Date());
  const to = addDaysISO(new Date(), Number(process.env.LOOKAHEAD_DAYS || 30));

  return {
    baseUrl: process.env.FOOTBALL_DATA_BASE_URL || "https://api.football-data.org/v4",
    competition: process.env.FOOTBALL_DATA_COMPETITION || "WC",
    from,
    to
  };
}

async function fetchFootballDataUpdates() {
  const config = getFootballDataConfig();
  const rangePayload = await requestFootballData(`/competitions/${config.competition}/matches`, {
    dateFrom: config.from,
    dateTo: config.to
  });

  // Consulta del día también: ayuda cuando un partido cruza de fecha o el torneo filtra distinto.
  const todayPayload = await requestFootballData("/matches", {
    dateFrom: getISODate(new Date()),
    dateTo: getISODate(new Date())
  });

  const matches = mergeFootballDataMatches(
    Array.isArray(rangePayload.matches) ? rangePayload.matches : [],
    Array.isArray(todayPayload.matches) ? todayPayload.matches : []
  );

  const updates = mapFootballDataMatchesToLocalUpdates(matches);

  if (updates.length === 0) {
    console.warn("football-data.org respondió, pero no se pudo mapear ningún partido local.");
    console.warn("Partidos recibidos:", matches.slice(0, 12).map((match) => `${footballDataTeamName(match?.homeTeam)} vs ${footballDataTeamName(match?.awayTeam)}`).join(" | "));
  }

  return updates;
}

async function requestFootballData(endpoint, params) {
  const config = getFootballDataConfig();
  const url = new URL(`${config.baseUrl.replace(/\/$/, "")}${endpoint}`);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url, {
    headers: {
      "accept": "application/json",
      "X-Auth-Token": process.env.FOOTBALL_DATA_KEY,
      "user-agent": "fixture-mundial/1.0"
    }
  });

  const payload = await response.json().catch(async () => {
    const text = await response.text().catch(() => "");
    return { error: text || "No se pudo parsear JSON." };
  });

  if (!response.ok) {
    throw new Error(`football-data.org HTTP ${response.status}: ${JSON.stringify(payload).slice(0, 700)}`);
  }

  return payload;
}

function mergeFootballDataMatches(...lists) {
  const byId = new Map();
  lists.flat().filter(Boolean).forEach((match) => {
    const id = match?.id || `${footballDataTeamName(match?.homeTeam)}-${footballDataTeamName(match?.awayTeam)}-${match?.utcDate}`;
    byId.set(String(id), match);
  });
  return Array.from(byId.values());
}

function mapFootballDataMatchesToLocalUpdates(matches) {
  const updates = [];

  MATCH_MAP.forEach((localMatch) => {
    const external = matches.find((match) => matchesLocalFootballDataGame(localMatch, match));
    if (!external) return;

    updates.push(normalizeFootballDataMatch(localMatch, external));
  });

  return updates;
}

function matchesLocalFootballDataGame(localMatch, match) {
  const homeTeam = match?.homeTeam || {};
  const awayTeam = match?.awayTeam || {};
  const homeName = footballDataTeamName(homeTeam);
  const awayName = footballDataTeamName(awayTeam);

  const homeMatchesA = teamMatches(localMatch.teamA, homeName, footballDataTeamPayload(homeTeam));
  const awayMatchesB = teamMatches(localMatch.teamB, awayName, footballDataTeamPayload(awayTeam));
  const homeMatchesB = teamMatches(localMatch.teamB, homeName, footballDataTeamPayload(homeTeam));
  const awayMatchesA = teamMatches(localMatch.teamA, awayName, footballDataTeamPayload(awayTeam));

  return (homeMatchesA && awayMatchesB) || (homeMatchesB && awayMatchesA);
}

function normalizeFootballDataMatch(localMatch, match) {
  const homeTeam = match?.homeTeam || {};
  const localAIsHome = teamMatches(localMatch.teamA, footballDataTeamName(homeTeam), footballDataTeamPayload(homeTeam));
  const status = normalizeFootballDataStatus(match?.status);

  const homeScore = getFootballDataScore(match, "home");
  const awayScore = getFootballDataScore(match, "away");
  const homePenalty = getFootballDataPenalty(match, "home");
  const awayPenalty = getFootballDataPenalty(match, "away");

  const scoreA = formatFootballDataScore(localAIsHome ? homeScore : awayScore, localAIsHome ? homePenalty : awayPenalty, status);
  const scoreB = formatFootballDataScore(localAIsHome ? awayScore : homeScore, localAIsHome ? awayPenalty : homePenalty, status);

  return {
    id: localMatch.id,
    status,
    scoreA,
    scoreB,
    winnerId: resolveFootballDataWinnerId(localMatch, match, scoreA, scoreB, localAIsHome),
    minute: null,
    kickoffISO: match?.utcDate || localMatch.kickoffISO
  };
}

function footballDataTeamName(team) {
  return [team?.name, team?.shortName, team?.tla].filter(Boolean).join(" ");
}

function footballDataTeamPayload(team) {
  return {
    name: team?.name,
    code: team?.tla,
    country: team?.shortName
  };
}

function normalizeFootballDataStatus(value) {
  const status = String(value || "").toUpperCase();
  if (["FINISHED"].includes(status)) return "finished";
  if (["LIVE", "IN_PLAY", "PAUSED"].includes(status)) return "live";
  return "scheduled";
}

function getFootballDataScore(match, side) {
  const score = match?.score || {};
  const candidates = [
    score.fullTime?.[side],
    score.regularTime?.[side],
    score.halfTime?.[side]
  ];
  const found = candidates.find((value) => value !== undefined && value !== null && value !== "");
  return found === undefined ? null : found;
}

function getFootballDataPenalty(match, side) {
  const value = match?.score?.penalties?.[side];
  return value === undefined ? null : value;
}

function formatFootballDataScore(goals, penalties, status) {
  const g = NumberOrNull(goals);
  const p = NumberOrNull(penalties);

  if (g === null) return status === "scheduled" ? "0" : "";
  if (p !== null) return `${g} (${p})`;
  return String(g);
}

function resolveFootballDataWinnerId(localMatch, match, scoreA, scoreB, localAIsHome) {
  if (normalizeFootballDataStatus(match?.status) !== "finished") return null;

  const winner = String(match?.score?.winner || "").toUpperCase();
  if (winner === "HOME_TEAM") return localAIsHome ? localMatch.teamA.id : localMatch.teamB.id;
  if (winner === "AWAY_TEAM") return localAIsHome ? localMatch.teamB.id : localMatch.teamA.id;

  const a = NumberOrNull(String(scoreA).replace(/\s*\(.*\)$/, ""));
  const b = NumberOrNull(String(scoreB).replace(/\s*\(.*\)$/, ""));
  if (a !== null && b !== null && a !== b) return a > b ? localMatch.teamA.id : localMatch.teamB.id;
  return null;
}

function summarizeFootballDataMatch(match) {
  return {
    id: match?.id,
    utcDate: match?.utcDate,
    status: match?.status,
    stage: match?.stage,
    group: match?.group,
    matchday: match?.matchday,
    home: match?.homeTeam ? { id: match.homeTeam.id, name: match.homeTeam.name, shortName: match.homeTeam.shortName, tla: match.homeTeam.tla } : null,
    away: match?.awayTeam ? { id: match.awayTeam.id, name: match.awayTeam.name, shortName: match.awayTeam.shortName, tla: match.awayTeam.tla } : null,
    score: match?.score
  };
}


function getWorldCup26Config() {
  return {
    baseUrl: process.env.WORLDCUP26_BASE_URL || "https://worldcup26.ir/get/games"
  };
}

async function fetchWorldCup26Updates() {
  const payload = await requestWorldCup26Games();
  const games = extractWorldCup26Games(payload);
  const updates = mapWorldCup26GamesToLocalUpdates(games);

  if (updates.length === 0) {
    console.warn("worldcup26.ir respondió, pero no se pudo mapear ningún partido local.");
    console.warn("Juegos recibidos:", games.slice(0, 12).map((game) => `${game?.home_team_name_en || game?.home_team_label} vs ${game?.away_team_name_en || game?.away_team_label}`).join(" | "));
  }

  return updates;
}

async function requestWorldCup26Games() {
  const config = getWorldCup26Config();
  const response = await fetch(config.baseUrl, {
    headers: {
      "accept": "application/json",
      "user-agent": "fixture-mundial/1.0"
    }
  });

  const payload = await response.json().catch(async () => {
    const text = await response.text().catch(() => "");
    return { error: text || "No se pudo parsear JSON.", games: [] };
  });

  if (!response.ok) {
    throw new Error(`worldcup26.ir HTTP ${response.status}: ${JSON.stringify(payload).slice(0, 500)}`);
  }

  return payload;
}

function extractWorldCup26Games(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.games)) return payload.games;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.matches)) return payload.matches;
  return [];
}

function mapWorldCup26GamesToLocalUpdates(games) {
  const updates = [];

  MATCH_MAP.forEach((localMatch) => {
    const external = games.find((game) => matchesLocalWorldCup26Game(localMatch, game));
    if (!external) return;

    updates.push(normalizeWorldCup26Game(localMatch, external));
  });

  return updates;
}

function matchesLocalWorldCup26Game(localMatch, game) {
  const homeName = getWorldCup26HomeName(game);
  const awayName = getWorldCup26AwayName(game);

  const homeMatchesA = teamMatches(localMatch.teamA, homeName, { name: homeName });
  const awayMatchesB = teamMatches(localMatch.teamB, awayName, { name: awayName });
  const homeMatchesB = teamMatches(localMatch.teamB, homeName, { name: homeName });
  const awayMatchesA = teamMatches(localMatch.teamA, awayName, { name: awayName });

  return (homeMatchesA && awayMatchesB) || (homeMatchesB && awayMatchesA);
}

function normalizeWorldCup26Game(localMatch, game) {
  const homeName = getWorldCup26HomeName(game);
  const localAIsHome = teamMatches(localMatch.teamA, homeName, { name: homeName });

  const homeScore = normalizeWorldCup26Score(game?.home_score);
  const awayScore = normalizeWorldCup26Score(game?.away_score);

  const scoreA = localAIsHome ? homeScore : awayScore;
  const scoreB = localAIsHome ? awayScore : homeScore;

  const status = normalizeWorldCup26Status(game);
  const winnerId = status === "finished" ? resolveWorldCup26WinnerId(localMatch, scoreA, scoreB) : null;

  return {
    id: localMatch.id,
    status,
    scoreA: scoreA === "" ? (status === "scheduled" ? "0" : "") : scoreA,
    scoreB: scoreB === "" ? (status === "scheduled" ? "0" : "") : scoreB,
    winnerId,
    minute: normalizeWorldCup26Minute(game, status),
    kickoffISO: parseWorldCup26Date(game?.local_date) || localMatch.kickoffISO
  };
}

function getWorldCup26HomeName(game) {
  return [game?.home_team_name_en, game?.home_team_label, game?.home_team_name, game?.homeTeamName, game?.home]
    .filter(Boolean)
    .join(" ");
}

function getWorldCup26AwayName(game) {
  return [game?.away_team_name_en, game?.away_team_label, game?.away_team_name, game?.awayTeamName, game?.away]
    .filter(Boolean)
    .join(" ");
}

function normalizeWorldCup26Score(value) {
  if (value === undefined || value === null || String(value).toLowerCase() === "null") return "";
  return String(value).trim();
}

function normalizeWorldCup26Status(game) {
  const finished = String(game?.finished || "").trim().toLowerCase();
  const elapsed = String(game?.time_elapsed || game?.status || "").trim().toLowerCase();

  if (finished === "true" || elapsed === "finished" || elapsed === "ft" || elapsed === "fulltime" || elapsed === "full time") {
    return "finished";
  }

  if (elapsed && !["false", "notstarted", "not started", "scheduled", "upcoming", "null", "0"].includes(elapsed)) {
    return "live";
  }

  return "scheduled";
}

function normalizeWorldCup26Minute(game, status) {
  if (status !== "live") return null;

  const elapsed = String(game?.time_elapsed || "");
  const match = elapsed.match(/(\d+)/);
  if (match) return Number(match[1]);

  return null;
}

function resolveWorldCup26WinnerId(localMatch, scoreA, scoreB) {
  const a = NumberOrNull(scoreA);
  const b = NumberOrNull(scoreB);
  if (a !== null && b !== null && a !== b) return a > b ? localMatch.teamA.id : localMatch.teamB.id;
  return null;
}

function parseWorldCup26Date(value) {
  if (!value) return null;
  const raw = String(value).trim();
  const match = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const [, month, day, year, hour, minute] = match;

  // worldcup26.ir publica los horarios en formato MM/DD/YYYY HH:mm.
  // Los dejamos con offset de Argentina para que el frontend pueda ordenar y filtrar correctamente.
  return `${year}-${month}-${day}T${String(hour).padStart(2, "0")}:${minute}:00-03:00`;
}

function summarizeWorldCup26Game(game) {
  return {
    id: game?.id,
    local_date: game?.local_date,
    type: game?.type,
    group: game?.group,
    finished: game?.finished,
    time_elapsed: game?.time_elapsed,
    home: getWorldCup26HomeName(game),
    away: getWorldCup26AwayName(game),
    home_score: game?.home_score,
    away_score: game?.away_score
  };
}

function getEspnConfig() {
  const from = process.env.TOURNAMENT_START_DATE || getISODate(new Date());
  const to = addDaysISO(new Date(), Number(process.env.LOOKAHEAD_DAYS || 30));

  return {
    baseUrl: process.env.ESPN_SCOREBOARD_URL || "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard",
    from,
    to,
    dates: process.env.ESPN_DATES || `${compactDate(from)}-${compactDate(to)}`,
    limit: process.env.ESPN_LIMIT || "950"
  };
}

async function fetchEspnUpdates() {
  const payloads = await requestEspnScoreboards();
  const events = mergeEspnEvents(payloads.flatMap((payload) => Array.isArray(payload.events) ? payload.events : []));
  const updates = mapEspnEventsToLocalUpdates(events);

  if (updates.length === 0) {
    console.warn("ESPN respondió, pero no se pudo mapear ningún partido local.");
    console.warn("Eventos recibidos:", events.slice(0, 12).map((event) => event?.name || event?.shortName || event?.id).join(" | "));
  }

  return updates;
}

async function requestEspnScoreboards() {
  const config = getEspnConfig();
  const today = compactDate(getISODate(new Date()));
  const requests = [
    { limit: config.limit, dates: config.dates },
    { limit: config.limit, dates: today }
  ];

  const seen = new Set();
  const payloads = [];

  for (const params of requests) {
    const key = JSON.stringify(params);
    if (seen.has(key)) continue;
    seen.add(key);
    payloads.push(await requestEspnScoreboard(params));
  }

  return payloads;
}

async function requestEspnScoreboard(params) {
  const config = getEspnConfig();
  const url = new URL(config.baseUrl);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url, {
    headers: {
      "accept": "application/json",
      "user-agent": "fixture-mundial/1.0"
    }
  });

  const payload = await response.json().catch(async () => {
    const text = await response.text().catch(() => "");
    return { error: text || "No se pudo parsear JSON.", events: [] };
  });

  if (!response.ok) {
    throw new Error(`ESPN HTTP ${response.status}: ${JSON.stringify(payload).slice(0, 500)}`);
  }

  return payload;
}

function mergeEspnEvents(events) {
  const byId = new Map();
  events.filter(Boolean).forEach((event) => {
    byId.set(String(event.id || event.uid || event.name), event);
  });
  return Array.from(byId.values());
}

function mapEspnEventsToLocalUpdates(events) {
  const updates = [];

  MATCH_MAP.forEach((localMatch) => {
    const external = events.find((event) => matchesLocalEspnGame(localMatch, event));
    if (!external) return;

    updates.push(normalizeEspnEvent(localMatch, external));
  });

  return updates;
}

function matchesLocalEspnGame(localMatch, event) {
  const competitors = getEspnCompetitors(event);
  if (competitors.length < 2) return false;

  const [first, second] = competitors;
  const firstMatchesA = teamMatches(localMatch.teamA, espnTeamName(first), espnTeamPayload(first));
  const secondMatchesB = teamMatches(localMatch.teamB, espnTeamName(second), espnTeamPayload(second));
  const firstMatchesB = teamMatches(localMatch.teamB, espnTeamName(first), espnTeamPayload(first));
  const secondMatchesA = teamMatches(localMatch.teamA, espnTeamName(second), espnTeamPayload(second));

  return (firstMatchesA && secondMatchesB) || (firstMatchesB && secondMatchesA);
}

function normalizeEspnEvent(localMatch, event) {
  const competitors = getEspnCompetitors(event);
  const [first, second] = competitors;

  const firstMatchesA = teamMatches(localMatch.teamA, espnTeamName(first), espnTeamPayload(first));
  const compA = firstMatchesA ? first : second;
  const compB = firstMatchesA ? second : first;

  const statusInfo = event?.status || getEspnCompetition(event)?.status || {};
  const type = statusInfo?.type || {};
  const state = String(type.state || "").toLowerCase();
  const completed = Boolean(type.completed || statusInfo.completed);
  const description = String(type.description || type.detail || statusInfo.displayClock || "").toLowerCase();

  let status = "scheduled";
  if (completed || state === "post" || ["final", "ft", "full time"].some((word) => description.includes(word))) {
    status = "finished";
  } else if (state === "in" || state === "live" || ["halftime", "half time", "in progress"].some((word) => description.includes(word))) {
    status = "live";
  }

  const scoreA = espnScore(compA);
  const scoreB = espnScore(compB);
  const winnerId = status === "finished" ? resolveEspnWinnerId(localMatch, compA, compB, scoreA, scoreB) : null;

  return {
    id: localMatch.id,
    status,
    scoreA,
    scoreB,
    winnerId,
    minute: normalizeEspnMinute(statusInfo, status),
    kickoffISO: event?.date || getEspnCompetition(event)?.date || localMatch.kickoffISO
  };
}

function getEspnCompetition(event) {
  return Array.isArray(event?.competitions) ? event.competitions[0] : null;
}

function getEspnCompetitors(event) {
  const competition = getEspnCompetition(event);
  return Array.isArray(competition?.competitors) ? competition.competitors : [];
}

function espnTeamPayload(competitor) {
  return competitor?.team || {};
}

function espnTeamName(competitor) {
  const team = espnTeamPayload(competitor);
  return [team.displayName, team.shortDisplayName, team.name, team.location, team.abbreviation]
    .filter(Boolean)
    .join(" ");
}

function espnScore(competitor) {
  const score = competitor?.score;
  if (score === undefined || score === null || score === "") return "";
  return String(score);
}

function resolveEspnWinnerId(localMatch, compA, compB, scoreA, scoreB) {
  if (compA?.winner === true) return localMatch.teamA.id;
  if (compB?.winner === true) return localMatch.teamB.id;

  const a = NumberOrNull(scoreA);
  const b = NumberOrNull(scoreB);
  if (a !== null && b !== null && a !== b) return a > b ? localMatch.teamA.id : localMatch.teamB.id;

  return null;
}

function normalizeEspnMinute(statusInfo, status) {
  if (status !== "live") return null;

  const raw = String(statusInfo?.displayClock || statusInfo?.type?.detail || statusInfo?.type?.shortDetail || "");
  const match = raw.match(/(\d+)/);
  if (match) return Number(match[1]);

  return null;
}

function summarizeEspnEvent(event) {
  const competitors = getEspnCompetitors(event);
  return {
    id: event?.id,
    date: event?.date,
    name: event?.name,
    shortName: event?.shortName,
    status: event?.status,
    competitors: competitors.map((competitor) => ({
      homeAway: competitor.homeAway,
      score: competitor.score,
      winner: competitor.winner,
      team: {
        id: competitor?.team?.id,
        displayName: competitor?.team?.displayName,
        shortDisplayName: competitor?.team?.shortDisplayName,
        abbreviation: competitor?.team?.abbreviation
      }
    }))
  };
}

function compactDate(isoDate) {
  return String(isoDate).replace(/-/g, "");
}

async function fetchApiFootballUpdates() {
  const config = getApiConfig();

  const rangePayload = await requestApiFootball("/fixtures", {
    league: config.league,
    season: config.season,
    from: config.from,
    to: config.to,
    timezone: "America/Argentina/Buenos_Aires"
  });

  // Mejora importante: los partidos en vivo se consultan también por live=all.
  // Así no se pierden por cruce de fecha, huso horario o una fecha mal filtrada.
  const livePayload = await requestApiFootball("/fixtures", { live: "all" });

  const rangeFixtures = Array.isArray(rangePayload.response) ? rangePayload.response : [];
  const liveFixtures = Array.isArray(livePayload.response) ? livePayload.response : [];
  const fixtures = mergeFixtures(rangeFixtures, liveFixtures);

  const updates = mapExternalFixturesToLocalUpdates(fixtures);

  if (updates.length === 0) {
    console.warn("API-Football respondió, pero no se pudo mapear ningún partido local.");
    console.warn("Fixtures recibidos:", fixtures.slice(0, 12).map((fixture) => `${fixture?.teams?.home?.name} vs ${fixture?.teams?.away?.name}`).join(" | "));
  }

  return updates;
}

async function requestApiFootball(endpoint, params) {
  const config = getApiConfig();
  const url = new URL(`${config.baseUrl.replace(/\/$/, "")}${endpoint}`);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url, {
    headers: {
      "x-apisports-key": process.env.API_FOOTBALL_KEY
    }
  });

  const payload = await response.json().catch(async () => {
    const text = await response.text().catch(() => "");
    return { errors: { parse: text || "No se pudo parsear JSON." }, response: [] };
  });

  if (!response.ok) {
    throw new Error(`API-Football HTTP ${response.status}: ${JSON.stringify(payload.errors || payload).slice(0, 500)}`);
  }

  const errors = payload?.errors;
  const hasErrors = errors && ((Array.isArray(errors) && errors.length > 0) || (!Array.isArray(errors) && Object.keys(errors).length > 0));
  if (hasErrors) {
    throw new Error(`API-Football errors: ${JSON.stringify(errors).slice(0, 700)}`);
  }

  return payload;
}

function mergeFixtures(...lists) {
  const byId = new Map();
  lists.flat().filter(Boolean).forEach((fixture) => {
    const id = fixture?.fixture?.id || `${fixture?.teams?.home?.name}-${fixture?.teams?.away?.name}-${fixture?.fixture?.date}`;
    byId.set(String(id), fixture);
  });
  return Array.from(byId.values());
}

function summarizePayload(payload, fixtures) {
  return {
    get: payload?.get,
    parameters: payload?.parameters,
    results: payload?.results,
    errors: payload?.errors,
    fixturesReceived: fixtures.length
  };
}

function summarizeFixture(fixture) {
  return {
    fixtureId: fixture?.fixture?.id,
    date: fixture?.fixture?.date,
    statusShort: fixture?.fixture?.status?.short,
    elapsed: fixture?.fixture?.status?.elapsed,
    league: fixture?.league ? { id: fixture.league.id, name: fixture.league.name, season: fixture.league.season, round: fixture.league.round } : null,
    home: fixture?.teams?.home ? { id: fixture.teams.home.id, name: fixture.teams.home.name, code: fixture.teams.home.code, winner: fixture.teams.home.winner } : null,
    away: fixture?.teams?.away ? { id: fixture.teams.away.id, name: fixture.teams.away.name, code: fixture.teams.away.code, winner: fixture.teams.away.winner } : null,
    goals: fixture?.goals,
    penalty: fixture?.score?.penalty
  };
}

function mapExternalFixturesToLocalUpdates(fixtures) {
  const updates = [];

  MATCH_MAP.forEach((localMatch) => {
    const external = fixtures.find((fixture) => matchesLocalGame(localMatch, fixture));
    if (!external) return;

    updates.push(normalizeApiFootballFixture(localMatch, external));
  });

  return updates;
}

function matchesLocalGame(localMatch, fixture) {
  const homeName = fixture?.teams?.home?.name || "";
  const awayName = fixture?.teams?.away?.name || "";

  const homeMatchesA = teamMatches(localMatch.teamA, homeName, fixture?.teams?.home);
  const awayMatchesB = teamMatches(localMatch.teamB, awayName, fixture?.teams?.away);
  const homeMatchesB = teamMatches(localMatch.teamB, homeName, fixture?.teams?.home);
  const awayMatchesA = teamMatches(localMatch.teamA, awayName, fixture?.teams?.away);

  return (homeMatchesA && awayMatchesB) || (homeMatchesB && awayMatchesA);
}

function teamMatches(localTeam, apiName, apiTeam) {
  const haystack = [
    apiName,
    apiTeam?.code,
    apiTeam?.country,
    apiTeam?.name
  ]
    .filter(Boolean)
    .map(normalizeText);

  return localTeam.aliases.some((alias) => haystack.includes(normalizeText(alias)));
}

function normalizeApiFootballFixture(localMatch, fixture) {
  const statusShort = fixture?.fixture?.status?.short || "";
  const status = normalizeStatus(statusShort);
  const minute = normalizeMinute(fixture?.fixture?.status?.elapsed, status);

  const homeName = fixture?.teams?.home?.name || "";
  const localAIsHome = teamMatches(localMatch.teamA, homeName, fixture?.teams?.home);

  const goalsHome = fixture?.goals?.home;
  const goalsAway = fixture?.goals?.away;
  const penHome = fixture?.score?.penalty?.home;
  const penAway = fixture?.score?.penalty?.away;

  const scoreA = formatScore(localAIsHome ? goalsHome : goalsAway, localAIsHome ? penHome : penAway, statusShort);
  const scoreB = formatScore(localAIsHome ? goalsAway : goalsHome, localAIsHome ? penAway : penHome, statusShort);

  const winnerId = status === "finished"
    ? resolveWinnerId(localMatch, {
        scoreA: NumberOrNull(localAIsHome ? goalsHome : goalsAway),
        scoreB: NumberOrNull(localAIsHome ? goalsAway : goalsHome),
        penA: NumberOrNull(localAIsHome ? penHome : penAway),
        penB: NumberOrNull(localAIsHome ? penAway : penHome),
        teamAApiWinner: localAIsHome ? fixture?.teams?.home?.winner : fixture?.teams?.away?.winner,
        teamBApiWinner: localAIsHome ? fixture?.teams?.away?.winner : fixture?.teams?.home?.winner
      })
    : null;

  return {
    id: localMatch.id,
    status,
    scoreA,
    scoreB,
    winnerId,
    minute,
    kickoffISO: fixture?.fixture?.date || localMatch.kickoffISO
  };
}

function normalizeStatus(short) {
  const finished = new Set(["FT", "AET", "PEN"]);
  const live = new Set(["1H", "HT", "2H", "ET", "BT", "P", "LIVE", "INT"]);

  if (finished.has(short)) return "finished";
  if (live.has(short)) return "live";
  return "scheduled";
}

function normalizeMinute(elapsed, status) {
  const value = Number(elapsed);
  if (status !== "live") return null;
  return Number.isFinite(value) ? value : null;
}

function formatScore(goals, penalties, statusShort) {
  const g = NumberOrNull(goals);
  const p = NumberOrNull(penalties);
  if (g === null) return "";
  if (statusShort === "PEN" && p !== null) return `${g} (${p})`;
  return String(g);
}

function resolveWinnerId(localMatch, data) {
  if (data.teamAApiWinner === true) return localMatch.teamA.id;
  if (data.teamBApiWinner === true) return localMatch.teamB.id;

  if (data.penA !== null && data.penB !== null && data.penA !== data.penB) {
    return data.penA > data.penB ? localMatch.teamA.id : localMatch.teamB.id;
  }

  if (data.scoreA !== null && data.scoreB !== null && data.scoreA !== data.scoreB) {
    return data.scoreA > data.scoreB ? localMatch.teamA.id : localMatch.teamB.id;
  }

  return null;
}

function NumberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeText(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function getISODate(date) {
  return date.toISOString().slice(0, 10);
}

function addDaysISO(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return getISODate(next);
}
