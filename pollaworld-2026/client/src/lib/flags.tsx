import { useState } from "react";
import ReactCountryFlag from "react-country-flag";
import { getTeamIso2, getTeamFlag as getEmojiFlag } from "./teams";

interface FlagImageProps {
  teamName: string;
  size?: number;
  className?: string;
}

// Subdivision flags not covered by react-country-flag's ISO set
const SUBDIVISIONS = new Set(["gb-eng", "gb-sct", "gb-wls", "gb-nir", "sco", "eng"]);

/**
 * FlagImage renders flags using:
 * 1. react-country-flag (SVG) for standard ISO codes
 * 2. flagcdn.com PNG for subdivision flags (gb-eng, gb-sct)
 * 3. Emoji fallback if both fail
 */
export function FlagImage({ teamName, size = 32, className }: FlagImageProps) {
  const [error, setError] = useState(false);
  const iso2 = getTeamIso2(teamName);
  const emojiFlag = getEmojiFlag(teamName);

  // Subdivision flags (gb-eng, gb-sct): use lipis/flag-icons SVGs via jsdelivr
  if (iso2 && SUBDIVISIONS.has(iso2) && !error) {
    return (
      <img
        src={`https://cdn.jsdelivr.net/gh/lipis/flag-icons@main/flags/4x3/${iso2}.svg`}
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
        decoding="async"
        onError={() => setError(true)}
      />
    );
  }

  // Standard ISO codes: use react-country-flag SVG
  if (iso2 && !SUBDIVISIONS.has(iso2)) {
    return (
      <ReactCountryFlag
        countryCode={iso2.toUpperCase()}
        svg
        style={{
          width: size,
          height: Math.round(size * 0.75),
          fontSize: size * 0.8,
        }}
        className={className}
        aria-label={teamName}
      />
    );
  }

  // Fallback: emoji flag
  return (
    <span
      className={className}
      style={{
        fontSize: size * 0.8,
        lineHeight: 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: Math.round(size * 0.75),
      }}
      title={teamName}
    >
      {emojiFlag}
    </span>
  );
}
