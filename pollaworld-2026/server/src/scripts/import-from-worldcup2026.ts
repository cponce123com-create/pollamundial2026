/**
 * Script de importacion desde worldcup2026 (repo publica ISC)
 * https://github.com/rezarahiminia/worldcup2026
 *
 * Descarga JSONs de equipos y partidos del Mundial 2026
 * y los inserta/actualiza en nuestra BD usando Drizzle ORM.
 *
 * Uso: cd server && npm run import:worldcup
 */

import "dotenv/config";
import { db } from "../db/index";
import { matches } from "../db/schema";
import { eq } from "drizzle-orm";

interface ExternalTeam {
  id: string;
  name_en: string;
  fifa_code: string;
  iso2: string;
  groups: string;
}

interface ExternalMatch {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: string;
  away_score: string;
  group: string;
  matchday: string;
  local_date: string;
  stadium_id: string;
  finished: string;
  type: string;
}

const NAME_MAP: Record<string, string> = {
  Mexico: "México",
  "South Africa": "Sud\u00e1frica",
  "South Korea": "Corea del Sur",
  "Czech Republic": "Rep\u00fablica Checa",
  Canada: "Canadá",
  "Bosnia and Herzegovina": "Bosnia y Herzegovina",
  Qatar: "Catar",
  Switzerland: "Suiza",
  Brazil: "Brasil",
  Morocco: "Marruecos",
  Haiti: "Haití",
  Scotland: "Escocia",
  "United States": "Estados Unidos",
  Paraguay: "Paraguay",
  Australia: "Australia",
  Turkey: "Turqu\u00eda",
  Germany: "Alemania",
  "Cura\u00e7ao": "Curazao",
  "Ivory Coast": "Costa de Marfil",
  Ecuador: "Ecuador",
  Netherlands: "Pa\u00edses Bajos",
  Japan: "Jap\u00f3n",
  Sweden: "Suecia",
  Tunisia: "T\u00fanez",
  Belgium: "B\u00e9lgica",
  Egypt: "Egipto",
  Iran: "Irán",
  "New Zealand": "Nueva Zelanda",
  Spain: "Espa\u00f1a",
  "Cape Verde": "Cabo Verde",
  "Saudi Arabia": "Arabia Saudita",
  Uruguay: "Uruguay",
  France: "Francia",
  Senegal: "Senegal",
  Iraq: "Irak",
  Norway: "Noruega",
  Argentina: "Argentina",
  Algeria: "Argelia",
  Austria: "Austria",
  Jordan: "Jordania",
  Portugal: "Portugal",
  "Democratic Republic of the Congo": "RD Congo",
  Uzbekistan: "Uzbekistán",
  Colombia: "Colombia",
  England: "Inglaterra",
  Croatia: "Croacia",
  Ghana: "Ghana",
  Panama: "Panamá",
};

const FLAG_MAP: Record<string, string> = {
  "México": "\u{1F1F2}\u{1F1FD}",
  "Sudáfrica": "\u{1F1FF}\u{1F1E6}",
  "Corea del Sur": "\u{1F1F0}\u{1F1F7}",
  "República Checa": "\u{1F1E8}\u{1F1FF}",
  "Canadá": "\u{1F1E8}\u{1F1E6}",
  "Bosnia y Herzegovina": "\u{1F1E7}\u{1F1E6}",
  Catar: "\u{1F1F6}\u{1F1E6}",
  Suiza: "\u{1F1E8}\u{1F1ED}",
  Brasil: "\u{1F1E7}\u{1F1F7}",
  Marruecos: "\u{1F1F2}\u{1F1E6}",
  "Haití": "\u{1F1ED}\u{1F1F9}",
  Escocia: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}",
  "Estados Unidos": "\u{1F1FA}\u{1F1F8}",
  Paraguay: "\u{1F1F5}\u{1F1FE}",
  Australia: "\u{1F1E6}\u{1F1FA}",
  "Turquía": "\u{1F1F9}\u{1F1F7}",
  Alemania: "\u{1F1E9}\u{1F1EA}",
  Curazao: "\u{1F1E8}\u{1F1FC}",
  "Costa de Marfil": "\u{1F1E8}\u{1F1EE}",
  Ecuador: "\u{1F1EA}\u{1F1E8}",
  "Países Bajos": "\u{1F1F3}\u{1F1F1}",
  "Japón": "\u{1F1EF}\u{1F1F5}",
  Suecia: "\u{1F1F8}\u{1F1EA}",
  "Túnez": "\u{1F1F9}\u{1F1F3}",
  "Bélgica": "\u{1F1E7}\u{1F1EA}",
  Egipto: "\u{1F1EA}\u{1F1EC}",
  "Irán": "\u{1F1EE}\u{1F1F7}",
  "Nueva Zelanda": "\u{1F1F3}\u{1F1FF}",
  "España": "\u{1F1EA}\u{1F1F8}",
  "Cabo Verde": "\u{1F1E8}\u{1F1FB}",
  "Arabia Saudita": "\u{1F1F8}\u{1F1E6}",
  Uruguay: "\u{1F1FA}\u{1F1FE}",
  Francia: "\u{1F1EB}\u{1F1F7}",
  Senegal: "\u{1F1F8}\u{1F1F3}",
  Irak: "\u{1F1EE}\u{1F1F6}",
  Noruega: "\u{1F1F3}\u{1F1F4}",
  Argentina: "\u{1F1E6}\u{1F1F7}",
  Argelia: "\u{1F1E9}\u{1F1FF}",
  Austria: "\u{1F1E6}\u{1F1F9}",
  Jordania: "\u{1F1EF}\u{1F1F4}",
  Portugal: "\u{1F1F5}\u{1F1F9}",
  "RD Congo": "\u{1F1E8}\u{1F1E9}",
  "Uzbekistán": "\u{1F1FA}\u{1F1FF}",
  Colombia: "\u{1F1E8}\u{1F1F4}",
  Inglaterra: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}",
  Croacia: "\u{1F1ED}\u{1F1F7}",
  Ghana: "\u{1F1EC}\u{1F1ED}",
  "Panamá": "\u{1F1F5}\u{1F1E6}",
};

const PHASE_MAP: Record<string, string> = {
  group: "groups",
  r32: "round_of_32",
  r16: "round_of_16",
  quarter: "quarterfinals",
  semi: "semifinals",
  third: "final_3rd",
  final: "final",
};

async function fetchJSON(url: string): Promise<any> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("HTTP " + res.status + " al descargar " + url);
  }
  return res.json();
}

async function main() {
  console.log("Importando datos desde worldcup2026...");
  console.log();

  console.log("Descargando datos...");
  const [teamsData, matchesData] = await Promise.all([
    fetchJSON("https://raw.githubusercontent.com/rezarahiminia/worldcup2026/main/football.teams.json"),
    fetchJSON("https://raw.githubusercontent.com/rezarahiminia/worldcup2026/main/football.matches.json"),
  ]);

  const msg = "Descargados: " + teamsData.length + " equipos, " + matchesData.length + " partidos";
  console.log(msg);
  console.log();

  const teamsById = new Map(teamsData.map((t: ExternalTeam) => [t.id, t]));

  console.log("Consultando partidos existentes en BD...");
  const existingRows = await db
    .select({
      id: matches.id,
      home_team: matches.home_team,
      away_team: matches.away_team,
      match_date: matches.match_date,
      home_score_real: matches.home_score_real,
      away_score_real: matches.away_score_real,
    })
    .from(matches);

  const existingByKey = new Map<string, any>();
  for (const row of existingRows) {
    const d = new Date(row.match_date);
    const key = row.home_team + "|" + row.away_team + "|" + d.toISOString().slice(0, 10);
    existingByKey.set(key, row);
  }

  console.log("   " + existingRows.length + " partidos existentes");
  console.log();

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let skippedPlaceholders = 0;

  for (const match of matchesData) {
    if (match.home_team_id === "0" || match.away_team_id === "0") {
      skippedPlaceholders++;
      continue;
    }

    const homeTeam = teamsById.get(match.home_team_id) as ExternalTeam | undefined;
    const awayTeam = teamsById.get(match.away_team_id) as ExternalTeam | undefined;

    if (!homeTeam || !awayTeam) {
      console.warn("Partido #" + match.id + ": equipo no encontrado");
      skipped++;
      continue;
    }

    const homeName = NAME_MAP[homeTeam.name_en] || homeTeam.name_en;
    const awayName = NAME_MAP[awayTeam.name_en] || awayTeam.name_en;
    const homeFlag = FLAG_MAP[homeName] || "\u{1F3F3}";
    const awayFlag = FLAG_MAP[awayName] || "\u{1F3F3}";

    // Parse "06/11/2026 13:00" (MM/DD/YYYY HH:MM)
    const dateParts = match.local_date.split(/[/ :]/);
    if (dateParts.length < 5) {
      console.warn("Partido #" + match.id + ": fecha invalida: " + match.local_date);
      skipped++;
      continue;
    }
    const matchDate = new Date(
      parseInt(dateParts[2]),     // year
      parseInt(dateParts[0]) - 1, // month (0-based)
      parseInt(dateParts[1]),     // day
      parseInt(dateParts[3]),     // hour
      parseInt(dateParts[4])      // minute
    );

    const phase = PHASE_MAP[match.type] || "groups";
    const groupName = phase === "groups" ? (match.group || null) : null;

    const homeScore = match.home_score ? parseInt(match.home_score, 10) : null;
    const awayScore = match.away_score ? parseInt(match.away_score, 10) : null;
    const isFinished = match.finished === "TRUE" || match.finished === true;

    const dateKey = matchDate.toISOString().slice(0, 10);
    const dedupKey = homeName + "|" + awayName + "|" + dateKey;
    const existing = existingByKey.get(dedupKey);

    if (existing) {
      const scoresChanged = existing.home_score_real !== homeScore || existing.away_score_real !== awayScore;
      if (scoresChanged) {
        await db.update(matches).set({
          home_score_real: homeScore,
          away_score_real: awayScore,
          is_locked: isFinished,
        }).where(eq(matches.id, existing.id));
        updated++;
      } else {
        skipped++;
      }
    } else {
      await db.insert(matches).values({
        phase: phase as any,
        group_name: groupName,
        home_team: homeName,
        away_team: awayName,
        home_flag: homeFlag,
        away_flag: awayFlag,
        match_date: matchDate,
        home_score_real: homeScore,
        away_score_real: awayScore,
        is_locked: isFinished,
        match_order: parseInt(match.id, 10),
      });
      inserted++;
    }
  }

  console.log("----------------------------------------");
  console.log("Resumen de importacion:");
  console.log();
  console.log("   Insertados:           " + inserted + " partidos nuevos");
  console.log("   Actualizados:         " + updated + " partidos (resultados)");
  console.log("   Omitidos:             " + skipped + " partidos (ya existian)");
  console.log("   Placeholders (ronda): " + skippedPlaceholders + " partidos (sin equipos)");
  console.log("   ------------------------------------");
  console.log("   Total en JSON:        " + matchesData.length + " partidos");
  console.log();
  console.log("Importacion completada.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
