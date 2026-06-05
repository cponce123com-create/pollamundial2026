import { getTeamFlag } from "./teams";

interface FlagImageProps {
  teamName: string;
  size?: number;
  className?: string;
}

export function FlagImage({ teamName, size = 32, className }: FlagImageProps) {
  const flag = getTeamFlag(teamName);

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
      {flag}
    </span>
  );
}
