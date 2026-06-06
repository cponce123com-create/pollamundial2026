export interface PlayerOption {
  id: string;
  name: string;
  image: string;
}

export const PLAYERS: PlayerOption[] = [
  { id: "personaje1", name: "Personaje 1", image: "/players/personaje1.jpg" },
  { id: "personaje2", name: "Personaje 2", image: "/players/personaje2.jpg" },
  { id: "personaje3", name: "Personaje 3", image: "/players/personaje3.jpg" },
  { id: "personaje4", name: "Personaje 4", image: "/players/personaje4.jpg" },
  { id: "personaje5", name: "Personaje 5", image: "/players/personaje5.png" },
  { id: "personaje6", name: "Personaje 6", image: "/players/personaje6.jpg" },
  { id: "personaje7", name: "Personaje 7", image: "/players/personaje7.jpg" },
  { id: "personaje8", name: "Personaje 8", image: "/players/personaje8.jpg" },
  { id: "personaje9", name: "Personaje 9", image: "/players/personaje9.jpg" },
  { id: "personaje10", name: "Personaje 10", image: "/players/personaje10.jpg" },
  { id: "personaje11", name: "Personaje 11", image: "/players/personaje11.jpg" },
  { id: "personaje12", name: "Personaje 12", image: "/players/personaje12.jpg" },
  { id: "personaje13", name: "Personaje 13", image: "/players/personaje13.jpg" },
  { id: "personaje14", name: "Personaje 14", image: "/players/personaje14.jpg" },
  { id: "personaje15", name: "Personaje 15", image: "/players/personaje15.jpg" },
  { id: "personaje16", name: "Personaje 16", image: "/players/personaje16.jpg" },
  { id: "personaje17", name: "Personaje 17", image: "/players/personaje17.jpg" },
  { id: "personaje18", name: "Personaje 18", image: "/players/personaje18.jpg" },
  { id: "personaje19", name: "Personaje 19", image: "/players/personaje19.jpg" },
  { id: "personaje20", name: "Personaje 20", image: "/players/personaje20.jpg" },
  { id: "personaje21", name: "Personaje 21", image: "/players/personaje21.jpg" },
  { id: "personaje22", name: "Personaje 22", image: "/players/personaje22.jpg" },
  { id: "personaje23", name: "Personaje 23", image: "/players/personaje23.jpg" },
  { id: "personaje24", name: "Personaje 24", image: "/players/personaje24.jpg" },
  { id: "personaje25", name: "Personaje 25", image: "/players/personaje25.jpg" },
  { id: "personaje26", name: "Personaje 26", image: "/players/personaje26.jpg" },
  { id: "personaje27", name: "Personaje 27", image: "/players/personaje27.jpg" },
  { id: "personaje28", name: "Personaje 28", image: "/players/personaje28.jpg" },
  { id: "personaje29", name: "Personaje 29", image: "/players/personaje29.jpg" },
  { id: "personaje30", name: "Personaje 30", image: "/players/personaje30.jpg" },
  { id: "personaje31", name: "Personaje 31", image: "/players/personaje31.jpg" },
  { id: "personaje32", name: "Personaje 32", image: "/players/personaje32.jpg" },
  { id: "personaje33", name: "Personaje 33", image: "/players/personaje33.jpg" },
  { id: "personaje34", name: "Personaje 34", image: "/players/personaje34.jpg" },
  { id: "personaje35", name: "Personaje 35", image: "/players/personaje35.jpg" },
  { id: "personaje36", name: "Personaje 36", image: "/players/personaje36.jpg" },
  { id: "personaje37", name: "Personaje 37", image: "/players/personaje37.jpg" },
  { id: "personaje38", name: "Personaje 38", image: "/players/personaje38.jpg" },
  { id: "personaje39", name: "Personaje 39", image: "/players/personaje39.jpg" },
  { id: "personaje40", name: "Personaje 40", image: "/players/personaje40.jpg" },
  { id: "personaje41", name: "Personaje 41", image: "/players/personaje41.jpg" },
  { id: "personaje42", name: "Personaje 42", image: "/players/personaje42.jpg" },
  { id: "personaje43", name: "Personaje 43", image: "/players/personaje43.jpg" },
];

export function getPlayer(slug: string): PlayerOption | undefined {
  return PLAYERS.find((p) => p.id === slug);
}

export function getPlayerDisplayName(slug: string, customNames?: Record<string, string>): string {
  const player = PLAYERS.find((p) => p.id === slug);
  if (!player) return slug;
  return (customNames && customNames[slug]) || player.name;
}
