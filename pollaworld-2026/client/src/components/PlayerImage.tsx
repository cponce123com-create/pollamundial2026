import { getPlayer, getPlayerImageUrl } from "../lib/players";

interface PlayerImageProps {
  slug: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Componente que renderiza la imagen del jugador optimizada.
 * - Usa getPlayerImageUrl() para Cloudinary transforms (f_auto,q_auto,w_X,h_Y)
 * - Incluye loading lazy, decoding async, referrerPolicy
 * - Fallback con ❓ si no existe el jugador
 */
export function PlayerImage({ slug, size = 48, className, style }: PlayerImageProps) {
  const player = getPlayer(slug);
  if (!player) return <span style={{ fontSize: size * 0.8 }}>❓</span>;

  const imgUrl = getPlayerImageUrl(slug, size);
  const defaultStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid var(--border)",
    ...style,
  };

  return (
    <img
      src={imgUrl}
      alt={player.name}
      className={className}
      style={defaultStyle}
      referrerPolicy="no-referrer"
      loading="lazy"
      decoding="async"
    />
  );
}
