/**
 * Datos oficiales de los 48 equipos del Mundial 2026
 * Fuente: https://github.com/openfootball/worldcup.json
 */
export interface TeamInfo {
  name: string;       // Español
  name_en: string;    // Inglés
  fifa: string;       // Código FIFA (3 letras)
  group: string;      // Grupo A-L
  flag: string;       // Emoji bandera
  continent: string;  // Continente
  confed: string;     // Confederación
}

export const TEAMS: TeamInfo[] = [
  { name: "México", name_en: "Mexico", fifa: "MEX", group: "A", flag: "🇲🇽", continent: "North America", confed: "CONCACAF" },
  { name: "Sudáfrica", name_en: "South Africa", fifa: "RSA", group: "A", flag: "🇿🇦", continent: "Africa", confed: "CAF" },
  { name: "Corea del Sur", name_en: "South Korea", fifa: "KOR", group: "A", flag: "🇰🇷", continent: "Asia", confed: "AFC" },
  { name: "República Checa", name_en: "Czech Republic", fifa: "CZE", group: "A", flag: "🇨🇿", continent: "Europe", confed: "UEFA" },
  { name: "Canadá", name_en: "Canada", fifa: "CAN", group: "B", flag: "🇨🇦", continent: "North America", confed: "CONCACAF" },
  { name: "Bosnia y Herzegovina", name_en: "Bosnia & Herzegovina", fifa: "BIH", group: "B", flag: "🇧🇦", continent: "Europe", confed: "UEFA" },
  { name: "Catar", name_en: "Qatar", fifa: "QAT", group: "B", flag: "🇶🇦", continent: "Asia", confed: "AFC" },
  { name: "Suiza", name_en: "Switzerland", fifa: "SUI", group: "B", flag: "🇨🇭", continent: "Europe", confed: "UEFA" },
  { name: "Brasil", name_en: "Brazil", fifa: "BRA", group: "C", flag: "🇧🇷", continent: "South America", confed: "CONMEBOL" },
  { name: "Marruecos", name_en: "Morocco", fifa: "MAR", group: "C", flag: "🇲🇦", continent: "Africa", confed: "CAF" },
  { name: "Haití", name_en: "Haiti", fifa: "HAI", group: "C", flag: "🇭🇹", continent: "North America", confed: "CONCACAF" },
  { name: "Escocia", name_en: "Scotland", fifa: "SCO", group: "C", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", continent: "Europe", confed: "UEFA" },
  { name: "Estados Unidos", name_en: "USA", fifa: "USA", group: "D", flag: "🇺🇸", continent: "North America", confed: "CONCACAF" },
  { name: "Paraguay", name_en: "Paraguay", fifa: "PAR", group: "D", flag: "🇵🇾", continent: "South America", confed: "CONMEBOL" },
  { name: "Australia", name_en: "Australia", fifa: "AUS", group: "D", flag: "🇦🇺", continent: "Oceania", confed: "AFC" },
  { name: "Turquía", name_en: "Turkey", fifa: "TUR", group: "D", flag: "🇹🇷", continent: "Europe", confed: "UEFA" },
  { name: "Alemania", name_en: "Germany", fifa: "GER", group: "E", flag: "🇩🇪", continent: "Europe", confed: "UEFA" },
  { name: "Curazao", name_en: "Curaçao", fifa: "CUW", group: "E", flag: "🇨🇼", continent: "North America", confed: "CONCACAF" },
  { name: "Costa de Marfil", name_en: "Ivory Coast", fifa: "CIV", group: "E", flag: "🇨🇮", continent: "Africa", confed: "CAF" },
  { name: "Ecuador", name_en: "Ecuador", fifa: "ECU", group: "E", flag: "🇪🇨", continent: "South America", confed: "CONMEBOL" },
  { name: "Países Bajos", name_en: "Netherlands", fifa: "NED", group: "F", flag: "🇳🇱", continent: "Europe", confed: "UEFA" },
  { name: "Japón", name_en: "Japan", fifa: "JPN", group: "F", flag: "🇯🇵", continent: "Asia", confed: "AFC" },
  { name: "Suecia", name_en: "Sweden", fifa: "SWE", group: "F", flag: "🇸🇪", continent: "Europe", confed: "UEFA" },
  { name: "Túnez", name_en: "Tunisia", fifa: "TUN", group: "F", flag: "🇹🇳", continent: "Africa", confed: "CAF" },
  { name: "Bélgica", name_en: "Belgium", fifa: "BEL", group: "G", flag: "🇧🇪", continent: "Europe", confed: "UEFA" },
  { name: "Egipto", name_en: "Egypt", fifa: "EGY", group: "G", flag: "🇪🇬", continent: "Africa", confed: "CAF" },
  { name: "Irán", name_en: "Iran", fifa: "IRN", group: "G", flag: "🇮🇷", continent: "Asia", confed: "AFC" },
  { name: "Nueva Zelanda", name_en: "New Zealand", fifa: "NZL", group: "G", flag: "🇳🇿", continent: "Oceania", confed: "OFC" },
  { name: "España", name_en: "Spain", fifa: "ESP", group: "H", flag: "🇪🇸", continent: "Europe", confed: "UEFA" },
  { name: "Cabo Verde", name_en: "Cape Verde", fifa: "CPV", group: "H", flag: "🇨🇻", continent: "Africa", confed: "CAF" },
  { name: "Arabia Saudita", name_en: "Saudi Arabia", fifa: "KSA", group: "H", flag: "🇸🇦", continent: "Asia", confed: "AFC" },
  { name: "Uruguay", name_en: "Uruguay", fifa: "URU", group: "H", flag: "🇺🇾", continent: "South America", confed: "CONMEBOL" },
  { name: "Francia", name_en: "France", fifa: "FRA", group: "I", flag: "🇫🇷", continent: "Europe", confed: "UEFA" },
  { name: "Senegal", name_en: "Senegal", fifa: "SEN", group: "I", flag: "🇸🇳", continent: "Africa", confed: "CAF" },
  { name: "Irak", name_en: "Iraq", fifa: "IRQ", group: "I", flag: "🇮🇶", continent: "Asia", confed: "AFC" },
  { name: "Noruega", name_en: "Norway", fifa: "NOR", group: "I", flag: "🇳🇴", continent: "Europe", confed: "UEFA" },
  { name: "Argentina", name_en: "Argentina", fifa: "ARG", group: "J", flag: "🇦🇷", continent: "South America", confed: "CONMEBOL" },
  { name: "Argelia", name_en: "Algeria", fifa: "ALG", group: "J", flag: "🇩🇿", continent: "Africa", confed: "CAF" },
  { name: "Austria", name_en: "Austria", fifa: "AUT", group: "J", flag: "🇦🇹", continent: "Europe", confed: "UEFA" },
  { name: "Jordania", name_en: "Jordan", fifa: "JOR", group: "J", flag: "🇯🇴", continent: "Asia", confed: "AFC" },
  { name: "Portugal", name_en: "Portugal", fifa: "POR", group: "K", flag: "🇵🇹", continent: "Europe", confed: "UEFA" },
  { name: "República Democrática del Congo", name_en: "DR Congo", fifa: "COD", group: "K", flag: "🇨🇩", continent: "Africa", confed: "CAF" },
  { name: "Uzbekistán", name_en: "Uzbekistan", fifa: "UZB", group: "K", flag: "🇺🇿", continent: "Asia", confed: "AFC" },
  { name: "Colombia", name_en: "Colombia", fifa: "COL", group: "K", flag: "🇨🇴", continent: "South America", confed: "CONMEBOL" },
  { name: "Inglaterra", name_en: "England", fifa: "ENG", group: "L", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", continent: "Europe", confed: "UEFA" },
  { name: "Croacia", name_en: "Croatia", fifa: "CRO", group: "L", flag: "🇭🇷", continent: "Europe", confed: "UEFA" },
  { name: "Ghana", name_en: "Ghana", fifa: "GHA", group: "L", flag: "🇬🇭", continent: "Africa", confed: "CAF" },
  { name: "Panamá", name_en: "Panama", fifa: "PAN", group: "L", flag: "🇵🇦", continent: "North America", confed: "CONCACAF" },
];

export function getTeamInfo(name: string): TeamInfo | undefined {
  return TEAMS.find(t => t.name === name || t.name_en === name || t.fifa === name);
}

export function getTeamFlag(name: string): string {
  return getTeamInfo(name)?.flag || "🏳️";
}
