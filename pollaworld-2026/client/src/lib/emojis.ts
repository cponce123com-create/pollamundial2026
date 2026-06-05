export interface EmojiOption {
  id: string;
  name: string;
  emoji: string;
}

export const EMOJIS: EmojiOption[] = [
  { id: "ronaldo", name: "Ronaldo", emoji: "🐐" },
  { id: "messi", name: "Messi", emoji: "🌟" },
  { id: "mbappe", name: "Mbappé", emoji: "⚡" },
  { id: "neymar", name: "Neymar", emoji: "🎭" },
  { id: "haaland", name: "Haaland", emoji: "🔨" },
  { id: "benzema", name: "Benzema", emoji: "🥇" },
  { id: "modric", name: "Modrić", emoji: "🎩" },
  { id: "ramos", name: "Ramos", emoji: "🛡️" },
  { id: "buffon", name: "Buffon", emoji: "🧤" },
  { id: "pele", name: "Pelé", emoji: "👑" },
  { id: "maradona", name: "Maradona", emoji: "✋" },
  { id: "zidane", name: "Zidane", emoji: "🌀" },
  { id: "ronaldinho", name: "Ronaldinho", emoji: "😄" },
  { id: "cruyff", name: "Cruyff", emoji: "🧭" },
  { id: "beckham", name: "Beckham", emoji: "🎯" },
  { id: "xavi", name: "Xavi", emoji: "🧠" },
  { id: "iniesta", name: "Iniesta", emoji: "🪄" },
  { id: "casillas", name: "Casillas", emoji: "🐈" },
  { id: "muller", name: "Müller", emoji: "🎪" },
  { id: "lewandowski", name: "Lewandowski", emoji: "🏹" },
];

export function getEmoji(id: string): EmojiOption | undefined {
  return EMOJIS.find((e) => e.id === id);
}
