export interface PlayerOption {
  id: string;
  name: string;
  image: string;
}

export const PLAYERS: PlayerOption[] = [
  { id: "cristianoronaldo", name: "Cristiano Ronaldo", image: "/players/cristianoronaldo.jpg" },
  { id: "imgi_112_benji_price_ct_road_t", name: "Benji Price", image: "/players/imgi_112_Benji-Price-CT-Road-to-2002-ep-004-026.jpg" },
  { id: "imgi_117_supercampeones_revela", name: "Oliver Atom", image: "/players/imgi_117_Supercampeones-Revelan-secreto-detras-del-nombre-de-Oliver-Atom.jpg" },
  { id: "imgi_119_castillo_300x300", name: "Castillo", image: "/players/imgi_119_Castillo-300x300.jpg" },
  { id: "imgi_122_axe2ki56tvfwhg25stmdy", name: "AXE2KI56TVFWHG25STMDYV7QQ", image: "/players/imgi_122_AXE2KI56TVFWHG25STMDYV7QQI.png" },
  { id: "imgi_123_images", name: "Images", image: "/players/imgi_123_images.jpg" },
  { id: "imgi_127_rau_l_ruidi_az", name: "Raúl Ruidíaz", image: "/players/imgi_127_RAÚL-RUIDÍAZ.jpg" },
  { id: "imgi_137_gaston_acurio_comida", name: "Gastón Acurio", image: "/players/imgi_137_gaston-acurio-comida-peruana-1-1.jpg" },
  { id: "imgi_142_wtzmrsf67vayjlypg7ckn", name: "WTZMRSF67VAYJLYPG7CKN7LEO", image: "/players/imgi_142_WTZMRSF67VAYJLYPG7CKN7LEOE.jpg" },
  { id: "imgi_149_images", name: "Images", image: "/players/imgi_149_images.jpg" },
  { id: "imgi_161_618c24d227cde05e3cd09", name: "Mario Vargas Llosa", image: "/players/imgi_161_618c24d227cde05e3cd091e1_Vargas_Llosa_dwhetb.jpg" },
  { id: "imgi_164_images", name: "Images", image: "/players/imgi_164_images.jpg" },
  { id: "imgi_167_pizarro_1", name: "Claudio Pizarro", image: "/players/imgi_167_pizarro-1.jpg" },
  { id: "imgi_17_default", name: "Foto 14", image: "/players/imgi_17_default.jpg" },
  { id: "imgi_194_17761066791243", name: "17761066791243", image: "/players/imgi_194_17761066791243.jpg" },
  { id: "imgi_194_mejores_futbolistas_d", name: "Mejores futbolistas del", image: "/players/imgi_194_mejores-futbolistas-del-mundo-jude-bellingham-1024x576.jpg" },
  { id: "imgi_22_default", name: "Foto 17", image: "/players/imgi_22_default.jpg" },
  { id: "imgi_24_default", name: "Foto 18", image: "/players/imgi_24_default.jpg" },
  { id: "imgi_27_default", name: "Foto 19", image: "/players/imgi_27_default.jpg" },
  { id: "imgi_303_images", name: "Images", image: "/players/imgi_303_images.jpg" },
  { id: "imgi_329_images", name: "Images", image: "/players/imgi_329_images.jpg" },
  { id: "imgi_32_default", name: "Foto 22", image: "/players/imgi_32_default.jpg" },
  { id: "imgi_336_images", name: "Images", image: "/players/imgi_336_images.jpg" },
  { id: "imgi_345_images", name: "Images", image: "/players/imgi_345_images.jpg" },
  { id: "imgi_34_default", name: "Foto 25", image: "/players/imgi_34_default.jpg" },
  { id: "imgi_352_images", name: "Images", image: "/players/imgi_352_images.jpg" },
  { id: "imgi_358_images", name: "Images", image: "/players/imgi_358_images.jpg" },
  { id: "imgi_37_default", name: "Foto 28", image: "/players/imgi_37_default.jpg" },
  { id: "imgi_39_images", name: "Images", image: "/players/imgi_39_images.jpg" },
  { id: "imgi_40_default", name: "Foto 30", image: "/players/imgi_40_default.jpg" },
  { id: "imgi_418_images", name: "Images", image: "/players/imgi_418_images.jpg" },
  { id: "imgi_433_images", name: "Images", image: "/players/imgi_433_images.jpg" },
  { id: "imgi_47_default", name: "Foto 33", image: "/players/imgi_47_default.jpg" },
  { id: "imgi_54_default", name: "Foto 34", image: "/players/imgi_54_default.jpg" },
  { id: "imgi_77_images", name: "Images", image: "/players/imgi_77_images.jpg" },
  { id: "imgi_80_images", name: "Images", image: "/players/imgi_80_images.jpg" },
  { id: "imgi_84_images", name: "Images", image: "/players/imgi_84_images.jpg" },
  { id: "imgi_8_default", name: "Foto 38", image: "/players/imgi_8_default.jpg" },
  { id: "imgi_90_uzjz25eyqrdgxkdcfg7a3k", name: "UZJZ25EYQRDGXKDCFG7A3K7JN", image: "/players/imgi_90_UZJZ25EYQRDGXKDCFG7A3K7JNE.jpg" },
  { id: "imgi_92_images", name: "Images", image: "/players/imgi_92_images.jpg" },
  { id: "imgi_93_images", name: "Images", image: "/players/imgi_93_images.jpg" },
  { id: "imgi_96_3wql5rbmhvdebbosvwqpag", name: "Foto", image: "/players/imgi_96_3WQL5RBMHVDEBBOSVWQPAGQPRY.jpg" },
  { id: "pele", name: "Pelé", image: "/players/pele.jpg" },
];

export function getPlayer(slug: string): PlayerOption | undefined {
  return PLAYERS.find((p) => p.id === slug);
}

export function getPlayerDisplayName(slug: string, customNames?: Record<string, string>): string {
  const player = PLAYERS.find((p) => p.id === slug);
  if (!player) return slug;
  return (customNames && customNames[slug]) || player.name;
}
