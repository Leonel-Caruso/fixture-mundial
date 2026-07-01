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
