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
        fontSize: size,
        lineHeight: 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      title={teamName}
    >
      {flag}
    </span>
  );
}
