import { useState } from "react";

// Map team names to ISO 3166-1 alpha-2 country codes (or subdivision codes like gb-eng)
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

// Reliable CDN: flag-icons via jsdelivr
function getFlagUrl(teamName: string): string | null {
  const code = FLAG_MAP[teamName];
  if (!code) return null;
  return `https://cdn.jsdelivr.net/gh/lipis/flag-icons@main/flags/4x3/${code}.svg`;
}

// Emoji fallback flags — includes all 32 teams plus extra countries
const EMOJI_FALLBACK: Record<string, string> = {
  "Canadá": "🇨🇦", "México": "🇲🇽", "Argentina": "🇦🇷", "Croacia": "🇭🇷",
  "EEUU": "🇺🇸", "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Senegal": "🇸🇳", "Japón": "🇯🇵",
  "Brasil": "🇧🇷", "Alemania": "🇩🇪", "Marruecos": "🇲🇦", "Corea Sur": "🇰🇷",
  "Francia": "🇫🇷", "España": "🇪🇸", "Ecuador": "🇪🇨", "Arabia S.": "🇸🇦",
  "Portugal": "🇵🇹", "Uruguay": "🇺🇾", "Nigeria": "🇳🇬", "Australia": "🇦🇺",
  "Países Bajos": "🇳🇱", "Italia": "🇮🇹", "Colombia": "🇨🇴", "Egipto": "🇪🇬",
  "Bélgica": "🇧🇪", "Dinamarca": "🇩🇰", "Chile": "🇨🇱", "Catar": "🇶🇦",
  "Suiza": "🇨🇭", "Serbia": "🇷🇸", "Perú": "🇵🇪", "Irán": "🇮🇷",
  // Extra countries that might appear
  "Sudáfrica": "🇿🇦", "Túnez": "🇹🇳", "Costa de Marfil": "🇨🇮",
  "Ghana": "🇬🇭", "Camerún": "🇨🇲", "Argelia": "🇩🇿", "Costa Rica": "🇨🇷",
  "Panamá": "🇵🇦", "Honduras": "🇭🇳", "Paraguay": "🇵🇾", "Bolivia": "🇧🇴",
  "Venezuela": "🇻🇪", "Escocia": "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "Gales": "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
  "Noruega": "🇳🇴", "Suecia": "🇸🇪", "Polonia": "🇵🇱", "Austria": "🇦🇹",
  "Hungría": "🇭🇺", "República Checa": "🇨🇿", "Turquía": "🇹🇷", "Grecia": "🇬🇷",
  "Rusia": "🇷🇺", "Ucrania": "🇺🇦", "Corea del Norte": "🇰🇵", "Irak": "🇮🇶",
  "Siria": "🇸🇾", "Jordania": "🇯🇴", "Emiratos Árabes": "🇦🇪",
};

interface FlagImageProps {
  teamName: string;
  size?: number;
  className?: string;
}

export function FlagImage({ teamName, size = 32, className }: FlagImageProps) {
  const [hasError, setHasError] = useState(false);
  const url = getFlagUrl(teamName);

  // If no URL mapping or image failed to load, show emoji fallback
  if (!url || hasError) {
    return (
      <span className={className} style={{ fontSize: size * 0.8, lineHeight: 1 }}>
        {EMOJI_FALLBACK[teamName] || "🏳️"}
      </span>
    );
  }

  return (
    <img
      src={url}
      alt={teamName}
      className={className}
      style={{
        width: size,
        height: Math.round(size * 0.75),
        objectFit: "cover",
        borderRadius: 3,
        border: "1px solid #30363d",
      }}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}
