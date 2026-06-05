/**
 * Datos oficiales de los 48 equipos del Mundial 2026
 * Fuente: https://github.com/openfootball/worldcup.json
 * Banderas: https://flagcdn.com (PNGs oficiales ISO 3166)
 */
export interface TeamInfo {
  name: string;       // Español
  name_en: string;    // Inglés
  fifa: string;       // Código FIFA (3 letras)
  iso2: string;       // ISO 3166-1 alpha-2 (para flagcdn.com)
  group: string;      // Grupo A-L
  flag: string;       // Emoji bandera (fallback)
  continent: string;
  confed: string;
}

export const TEAMS: TeamInfo[] = [
  { name: "México", name_en: "Mexico", fifa: "MEX", iso2: "mx", group: "A", flag: "🇲🇽", continent: "North America", confed: "CONCACAF" },
  { name: "Sudáfrica", name_en: "South Africa", fifa: "RSA", iso2: "za", group: "A", flag: "🇿🇦", continent: "Africa", confed: "CAF" },
  { name: "Corea del Sur", name_en: "South Korea", fifa: "KOR", iso2: "kr", group: "A", flag: "🇰🇷", continent: "Asia", confed: "AFC" },
  { name: "República Checa", name_en: "Czech Republic", fifa: "CZE", iso2: "cz", group: "A", flag: "🇨🇿", continent: "Europe", confed: "UEFA" },
  { name: "Canadá", name_en: "Canada", fifa: "CAN", iso2: "ca", group: "B", flag: "🇨🇦", continent: "North America", confed: "CONCACAF" },
  { name: "Bosnia y Herzegovina", name_en: "Bosnia & Herzegovina", fifa: "BIH", iso2: "ba", group: "B", flag: "🇧🇦", continent: "Europe", confed: "UEFA" },
  { name: "Catar", name_en: "Qatar", fifa: "QAT", iso2: "qa", group: "B", flag: "🇶🇦", continent: "Asia", confed: "AFC" },
  { name: "Suiza", name_en: "Switzerland", fifa: "SUI", iso2: "ch", group: "B", flag: "🇨🇭", continent: "Europe", confed: "UEFA" },
  { name: "Brasil", name_en: "Brazil", fifa: "BRA", iso2: "br", group: "C", flag: "🇧🇷", continent: "South America", confed: "CONMEBOL" },
  { name: "Marruecos", name_en: "Morocco", fifa: "MAR", iso2: "ma", group: "C", flag: "🇲🇦", continent: "Africa", confed: "CAF" },
  { name: "Haití", name_en: "Haiti", fifa: "HAI", iso2: "ht", group: "C", flag: "🇭🇹", continent: "North America", confed: "CONCACAF" },
  { name: "Escocia", name_en: "Scotland", fifa: "SCO", iso2: "gb-sct", group: "C", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", continent: "Europe", confed: "UEFA" },
  { name: "Estados Unidos", name_en: "USA", fifa: "USA", iso2: "us", group: "D", flag: "🇺🇸", continent: "North America", confed: "CONCACAF" },
  { name: "Paraguay", name_en: "Paraguay", fifa: "PAR", iso2: "py", group: "D", flag: "🇵🇾", continent: "South America", confed: "CONMEBOL" },
  { name: "Australia", name_en: "Australia", fifa: "AUS", iso2: "au", group: "D", flag: "🇦🇺", continent: "Oceania", confed: "AFC" },
  { name: "Turquía", name_en: "Turkey", fifa: "TUR", iso2: "tr", group: "D", flag: "🇹🇷", continent: "Europe", confed: "UEFA" },
  { name: "Alemania", name_en: "Germany", fifa: "GER", iso2: "de", group: "E", flag: "🇩🇪", continent: "Europe", confed: "UEFA" },
  { name: "Curazao", name_en: "Curaçao", fifa: "CUW", iso2: "cw", group: "E", flag: "🇨🇼", continent: "North America", confed: "CONCACAF" },
  { name: "Costa de Marfil", name_en: "Ivory Coast", fifa: "CIV", iso2: "ci", group: "E", flag: "🇨🇮", continent: "Africa", confed: "CAF" },
  { name: "Ecuador", name_en: "Ecuador", fifa: "ECU", iso2: "ec", group: "E", flag: "🇪🇨", continent: "South America", confed: "CONMEBOL" },
  { name: "Países Bajos", name_en: "Netherlands", fifa: "NED", iso2: "nl", group: "F", flag: "🇳🇱", continent: "Europe", confed: "UEFA" },
  { name: "Japón", name_en: "Japan", fifa: "JPN", iso2: "jp", group: "F", flag: "🇯🇵", continent: "Asia", confed: "AFC" },
  { name: "Suecia", name_en: "Sweden", fifa: "SWE", iso2: "se", group: "F", flag: "🇸🇪", continent: "Europe", confed: "UEFA" },
  { name: "Túnez", name_en: "Tunisia", fifa: "TUN", iso2: "tn", group: "F", flag: "🇹🇳", continent: "Africa", confed: "CAF" },
  { name: "Bélgica", name_en: "Belgium", fifa: "BEL", iso2: "be", group: "G", flag: "🇧🇪", continent: "Europe", confed: "UEFA" },
  { name: "Egipto", name_en: "Egypt", fifa: "EGY", iso2: "eg", group: "G", flag: "🇪🇬", continent: "Africa", confed: "CAF" },
  { name: "Irán", name_en: "Iran", fifa: "IRN", iso2: "ir", group: "G", flag: "🇮🇷", continent: "Asia", confed: "AFC" },
  { name: "Nueva Zelanda", name_en: "New Zealand", fifa: "NZL", iso2: "nz", group: "G", flag: "🇳🇿", continent: "Oceania", confed: "OFC" },
  { name: "España", name_en: "Spain", fifa: "ESP", iso2: "es", group: "H", flag: "🇪🇸", continent: "Europe", confed: "UEFA" },
  { name: "Cabo Verde", name_en: "Cape Verde", fifa: "CPV", iso2: "cv", group: "H", flag: "🇨🇻", continent: "Africa", confed: "CAF" },
  { name: "Arabia Saudita", name_en: "Saudi Arabia", fifa: "KSA", iso2: "sa", group: "H", flag: "🇸🇦", continent: "Asia", confed: "AFC" },
  { name: "Uruguay", name_en: "Uruguay", fifa: "URU", iso2: "uy", group: "H", flag: "🇺🇾", continent: "South America", confed: "CONMEBOL" },
  { name: "Francia", name_en: "France", fifa: "FRA", iso2: "fr", group: "I", flag: "🇫🇷", continent: "Europe", confed: "UEFA" },
  { name: "Senegal", name_en: "Senegal", fifa: "SEN", iso2: "sn", group: "I", flag: "🇸🇳", continent: "Africa", confed: "CAF" },
  { name: "Irak", name_en: "Iraq", fifa: "IRQ", iso2: "iq", group: "I", flag: "🇮🇶", continent: "Asia", confed: "AFC" },
  { name: "Noruega", name_en: "Norway", fifa: "NOR", iso2: "no", group: "I", flag: "🇳🇴", continent: "Europe", confed: "UEFA" },
  { name: "Argentina", name_en: "Argentina", fifa: "ARG", iso2: "ar", group: "J", flag: "🇦🇷", continent: "South America", confed: "CONMEBOL" },
  { name: "Argelia", name_en: "Algeria", fifa: "ALG", iso2: "dz", group: "J", flag: "🇩🇿", continent: "Africa", confed: "CAF" },
  { name: "Austria", name_en: "Austria", fifa: "AUT", iso2: "at", group: "J", flag: "🇦🇹", continent: "Europe", confed: "UEFA" },
  { name: "Jordania", name_en: "Jordan", fifa: "JOR", iso2: "jo", group: "J", flag: "🇯🇴", continent: "Asia", confed: "AFC" },
  { name: "Portugal", name_en: "Portugal", fifa: "POR", iso2: "pt", group: "K", flag: "🇵🇹", continent: "Europe", confed: "UEFA" },
  { name: "República Democrática del Congo", name_en: "DR Congo", fifa: "COD", iso2: "cd", group: "K", flag: "🇨🇩", continent: "Africa", confed: "CAF" },
  { name: "Uzbekistán", name_en: "Uzbekistan", fifa: "UZB", iso2: "uz", group: "K", flag: "🇺🇿", continent: "Asia", confed: "AFC" },
  { name: "Colombia", name_en: "Colombia", fifa: "COL", iso2: "co", group: "K", flag: "🇨🇴", continent: "South America", confed: "CONMEBOL" },
  { name: "Inglaterra", name_en: "England", fifa: "ENG", iso2: "gb-eng", group: "L", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", continent: "Europe", confed: "UEFA" },
  { name: "Croacia", name_en: "Croatia", fifa: "CRO", iso2: "hr", group: "L", flag: "🇭🇷", continent: "Europe", confed: "UEFA" },
  { name: "Ghana", name_en: "Ghana", fifa: "GHA", iso2: "gh", group: "L", flag: "🇬🇭", continent: "Africa", confed: "CAF" },
  { name: "Panamá", name_en: "Panama", fifa: "PAN", iso2: "pa", group: "L", flag: "🇵🇦", continent: "North America", confed: "CONCACAF" },
];

// Aliases for backwards compatibility with legacy seed data
const ALIASES: Record<string, string> = {
  "EEUU": "Estados Unidos",
  "Corea Sur": "Corea del Sur",
  "Arabia S.": "Arabia Saudita",
};

export function getTeamInfo(name: string): TeamInfo | undefined {
  // Direct lookup
  const direct = TEAMS.find(t => t.name === name || t.name_en === name || t.fifa === name);
  if (direct) return direct;

  // Alias lookup (legacy seed names)
  const resolved = ALIASES[name];
  if (resolved) return TEAMS.find(t => t.name === resolved);

  // Check if name matches English name
  return TEAMS.find(t => t.name_en === name);
}

export function getTeamFlag(name: string): string {
  return getTeamInfo(name)?.flag || "🏳️";
}

export function getTeamIso2(name: string): string | undefined {
  return getTeamInfo(name)?.iso2;
}
