/**
 * Team strength ratings (1-5) based on FIFA ranking, qualifiers performance,
 * and recent World Cup history (2022).
 *
 * 5 = Elite favourite
 * 4 = Strong contender
 * 3 = Competitive
 * 2 = Lower tier
 * 1 = Underdog
 */
const TEAM_STRENGTH: Record<string, number> = {
  // Elite (5)
  Argentina: 5,
  Brasil: 5,
  Francia: 5,
  Inglaterra: 5,
  // Strong (4)
  Alemania: 4,
  España: 4,
  "Países Bajos": 4,
  Portugal: 4,
  Bélgica: 4,
  // Competitive (3)
  Croacia: 3,
  Uruguay: 3,
  Colombia: 3,
  Marruecos: 3,
  Suiza: 3,
  Japón: 3,
  "Estados Unidos": 3,
  México: 3,
  Senegal: 3,
  "Corea del Sur": 3,
  Ecuador: 3,
  Noruega: 3,
  Suecia: 3,
  // Lower (2)
  Canadá: 2,
  Australia: 2,
  "Costa de Marfil": 2,
  Egipto: 2,
  Ghana: 2,
  Turquía: 2,
  "República Checa": 2,
  Austria: 2,
  "Arabia Saudita": 2,
  Paraguay: 2,
  // Underdog (1)
  "Cabo Verde": 1,
  Catar: 1,
  Irán: 1,
  Túnez: 1,
  Irak: 1,
  Jordania: 1,
  "Bosnia y Herzegovina": 1,
  "República Democrática del Congo": 1,
  Uzbekistán: 1,
  Panamá: 1,
  Haití: 1,
  Escocia: 1,
  Sudáfrica: 1,
  "Nueva Zelanda": 1,
  Argelia: 1,
  Curazao: 1,
};

const DEFAULT_STRENGTH = 2;

function getStrength(team: string): number {
  return TEAM_STRENGTH[team] ?? DEFAULT_STRENGTH;
}

/**
 * Generate a random integer between min and max (inclusive).
 */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a score using a triangular distribution centered on a "likely" value.
 * This produces more realistic football scores (lots of 0-0, 1-0, 1-1, 2-1, etc.)
 * rather than pure uniform randomness.
 */
function triangularRandom(low: number, high: number, mode: number): number {
  const u = Math.random();
  const f = (mode - low) / (high - low);
  if (u < f) {
    return low + Math.sqrt(u * (high - low) * (mode - low));
  } else {
    return high - Math.sqrt((1 - u) * (high - low) * (high - mode));
  }
}

/**
 * BOTÓN 1 — Moderado / Suerte
 * Resultados puramente aleatorios 0-1 para ambos equipos.
 * Ideal para quienes no saben de fútbol y quieren probar suerte.
 */
export function autofillModerate(
  matches: { id: string; home_team: string; away_team: string }[]
): Record<string, { home: string; away: string }> {
  const result: Record<string, { home: string; away: string }> = {};
  for (const m of matches) {
    result[m.id] = {
      home: String(randInt(0, 1)),
      away: String(randInt(0, 1)),
    };
  }
  return result;
}

/**
 * BOTÓN 2 — Con Lógica / Estadístico
 * Usa la fuerza de cada selección para generar marcadores más realistas:
 * - Equipos fuertes anotan más goles en promedio
 * - El local tiene una leve ventaja
 * - Los resultados se distribuyen de forma triangular (realista)
 * - Se evitan resultados absurdos (ej: 5-0 entre equipos parejos)
 */
export function autofillSmart(
  matches: { id: string; home_team: string; away_team: string }[]
): Record<string, { home: string; away: string }> {
  const result: Record<string, { home: string; away: string }> = {};
  for (const m of matches) {
    const homeStrength = getStrength(m.home_team);
    const awayStrength = getStrength(m.away_team);

    // Base goal expectation from strength (roughly 0.2 to 1.8 expected goals)
    const homeBase = 0.1 + homeStrength * 0.35;
    const awayBase = 0.1 + awayStrength * 0.3;

    // Home advantage ~+0.3 goals
    const homeExpected = homeBase + 0.3;

    // Triangular distribution centered on expected goals
    // Low: 0, High: up to 5 for strong teams, Mode: expected value
    const homeHigh = Math.min(5, Math.ceil(homeExpected * 2));
    const awayHigh = Math.min(4, Math.ceil(awayBase * 2));

    // Ensure low < mode < high for triangular distribution
    const homeLow = 0;
    const awayLow = 0;
    const homeMode = Math.min(homeHigh - 0.01, Math.max(homeLow + 0.01, homeExpected));
    const awayMode = Math.min(awayHigh - 0.01, Math.max(awayLow + 0.01, awayBase));

    // Allow some randomness to shift the mode up/down by 1
    const shiftedHomeMode = Math.min(homeHigh - 0.01, Math.max(homeLow + 0.01, homeMode + (Math.random() > 0.5 ? 0.5 : 0)));
    const shiftedAwayMode = Math.min(awayHigh - 0.01, Math.max(awayLow + 0.01, awayMode + (Math.random() > 0.5 ? 0.3 : 0)));

    let homeScore = Math.round(triangularRandom(homeLow, homeHigh, shiftedHomeMode));
    let awayScore = Math.round(triangularRandom(awayLow, awayHigh, shiftedAwayMode));

    // Clamp
    homeScore = Math.max(0, Math.min(5, homeScore));
    awayScore = Math.max(0, Math.min(4, awayScore));

    // Small chance of a "surprise" result (underdog scores big)
    if (homeStrength < awayStrength && Math.random() < 0.08) {
      homeScore = Math.min(3, homeScore + 1);
    }
    if (awayStrength < homeStrength && Math.random() < 0.08) {
      awayScore = Math.min(3, awayScore + 1);
    }

    result[m.id] = {
      home: String(homeScore),
      away: String(awayScore),
    };
  }
  return result;
}
