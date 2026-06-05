import { useState } from "react";
import { getTeamIso2, getTeamFlag as getEmojiFlag } from "./teams";

interface FlagImageProps {
  teamName: string;
  size?: number;
  className?: string;
}

/**
 * FlagImage renders a flag using flagcdn.com PNG images (ISO 3166).
 * Falls back to emoji flag if the image fails to load.
 * 
 * URL format: https://flagcdn.com/w{width}/{iso2}.png
 * Example: https://flagcdn.com/w40/mx.png
 */
export function FlagImage({ teamName, size = 32, className }: FlagImageProps) {
  const [error, setError] = useState(false);
  const iso2 = getTeamIso2(teamName);
  const emojiFlag = getEmojiFlag(teamName);

  // If we have an ISO2 code and no error yet, show the PNG image
  if (iso2 && !error) {
    return (
      <img
        src={`https://flagcdn.com/w${Math.round(size * 2)}/${iso2}.png`}
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
        onError={() => setError(true)}
      />
    );
  }

  // Fallback: show emoji flag
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
