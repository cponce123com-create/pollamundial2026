// Map team names to ISO 3166-1 alpha-2 country codes for flagcdn.com
const FLAG_MAP: Record<string, string> = {
  "Canadá": "ca",
  "México": "mx",
  "Argentina": "ar",
  "Croacia": "hr",
  "EEUU": "us",
  "Inglaterra": "gb-eng",
  "Senegal": "sn",
  "Japón": "jp",
  "Brasil": "br",
  "Alemania": "de",
  "Marruecos": "ma",
  "Corea Sur": "kr",
  "Francia": "fr",
  "España": "es",
  "Ecuador": "ec",
  "Arabia S.": "sa",
  "Portugal": "pt",
  "Uruguay": "uy",
  "Nigeria": "ng",
  "Australia": "au",
  "Países Bajos": "nl",
  "Italia": "it",
  "Colombia": "co",
  "Egipto": "eg",
  "Bélgica": "be",
  "Dinamarca": "dk",
  "Chile": "cl",
  "Catar": "qa",
  "Suiza": "ch",
  "Serbia": "rs",
  "Perú": "pe",
  "Irán": "ir",
};

export function getFlagUrl(teamName: string): string | null {
  const code = FLAG_MAP[teamName];
  if (!code) return null;
  return `https://flagcdn.com/w80/${code}.png`;
}

export function getFlagSrcSet(teamName: string): string | null {
  const code = FLAG_MAP[teamName];
  if (!code) return null;
  return `https://flagcdn.com/w160/${code}.png 2x`;
}

interface FlagImageProps {
  teamName: string;
  size?: number;
  className?: string;
}

export function FlagImage({ teamName, size = 32, className }: FlagImageProps) {
  const url = getFlagUrl(teamName);
  if (!url) {
    // Fallback to emoji flag
    const emojiMap: Record<string, string> = {
      "Canadá": "🇨🇦", "México": "🇲🇽", "Argentina": "🇦🇷", "Croacia": "🇭🇷",
      "EEUU": "🇺🇸", "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Senegal": "🇸🇳", "Japón": "🇯🇵",
      "Brasil": "🇧🇷", "Alemania": "🇩🇪", "Marruecos": "🇲🇦", "Corea Sur": "🇰🇷",
      "Francia": "🇫🇷", "España": "🇪🇸", "Ecuador": "🇪🇨", "Arabia S.": "🇸🇦",
      "Portugal": "🇵🇹", "Uruguay": "🇺🇾", "Nigeria": "🇳🇬", "Australia": "🇦🇺",
      "Países Bajos": "🇳🇱", "Italia": "🇮🇹", "Colombia": "🇨🇴", "Egipto": "🇪🇬",
      "Bélgica": "🇧🇪", "Dinamarca": "🇩🇰", "Chile": "🇨🇱", "Catar": "🇶🇦",
      "Suiza": "🇨🇭", "Serbia": "🇷🇸", "Perú": "🇵🇪", "Irán": "🇮🇷",
    };
    return <span className={className} style={{ fontSize: size }}>{emojiMap[teamName] || "🏳️"}</span>;
  }
  return (
    <img
      src={url}
      srcSet={getFlagSrcSet(teamName) || undefined}
      alt={teamName}
      className={className}
      style={{ width: size, height: size * 0.75, objectFit: "contain", borderRadius: 2 }}
      loading="lazy"
    />
  );
}
