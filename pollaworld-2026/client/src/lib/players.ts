export interface PlayerOption {
  id: string;
  name: string;
  image: string;
}

export const PLAYERS: PlayerOption[] = [
  // Legends (70s-80s)
  { id: "pele", name: "Pelé", image: "/players/pele.jpg" },
  { id: "maradona", name: "Diego Maradona", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Maradona-Mundial_%28cropped%29.jpg/120px-Maradona-Mundial_%28cropped%29.jpg" },
  { id: "cruyff", name: "Johan Cruyff", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Johan_Cruijff_%281974%29.jpg/120px-Johan_Cruijff_%281974%29.jpg" },
  { id: "beckenbauer", name: "Franz Beckenbauer", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Beckenbauer_%28cropped%29.jpg/120px-Beckenbauer_%28cropped%29.jpg" },
  { id: "platini", name: "Michel Platini", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Michel_Platini_%28June_2015%29.jpg/120px-Michel_Platini_%28June_2015%29.jpg" },
  { id: "zico", name: "Zico", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Zico_2018.jpg/120px-Zico_2018.jpg" },
  { id: "gerdmuller", name: "Gerd Müller", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Gerd_Mueller_%282012%29.jpg/120px-Gerd_Mueller_%282012%29.jpg" },
  { id: "vanbasten", name: "Marco van Basten", image: "/players/vanbasten.jpg" },
  // 90s stars
  { id: "ronaldo", name: "Ronaldo Nazário", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Ronaldo_2018.jpg/120px-Ronaldo_2018.jpg" },
  { id: "romario", name: "Romário", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Romario_2017.jpg/120px-Romario_2017.jpg" },
  { id: "baggio", name: "Roberto Baggio", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Roberto_Baggio_2010.jpg/120px-Roberto_Baggio_2010.jpg" },
  { id: "maldini", name: "Paolo Maldini", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Paolo_Maldini_2008.jpg/120px-Paolo_Maldini_2008.jpg" },
  { id: "matthaus", name: "Lothar Matthäus", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Lothar_Matthaeus_2012.jpg/120px-Lothar_Matthaeus_2012.jpg" },
  { id: "batistuta", name: "Gabriel Batistuta", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Batistuta_2014.jpg/120px-Batistuta_2014.jpg" },
  { id: "bergkamp", name: "Dennis Bergkamp", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Dennis_Bergkamp_2006.jpg/120px-Dennis_Bergkamp_2006.jpg" },
  { id: "schmeichel", name: "Peter Schmeichel", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Peter_Schmeichel_2009.jpg/120px-Peter_Schmeichel_2009.jpg" },
  // 2000s icons
  { id: "zidane", name: "Zinedine Zidane", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Zinedine_Zidane_%28cropped%29.jpg/120px-Zinedine_Zidane_%28cropped%29.jpg" },
  { id: "ronaldinho", name: "Ronaldinho", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Ronaldinho_2019.jpg/120px-Ronaldinho_2019.jpg" },
  { id: "henry", name: "Thierry Henry", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Thierry_Henry_2019.jpg/120px-Thierry_Henry_2019.jpg" },
  { id: "figo", name: "Luís Figo", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Luis_Figo_2017.jpg/120px-Luis_Figo_2017.jpg" },
  { id: "rivaldo", name: "Rivaldo", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Rivaldo_2014.jpg/120px-Rivaldo_2014.jpg" },
  { id: "kaka", name: "Kaká", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Kaka_2018.jpg/120px-Kaka_2018.jpg" },
  { id: "raul", name: "Raúl", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Raul_Gonzalez_2015.jpg/120px-Raul_Gonzalez_2015.jpg" },
  { id: "nedved", name: "Pavel Nedvěd", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Pavel_Nedved_2009.jpg/120px-Pavel_Nedved_2009.jpg" },
  // 2010s greats
  { id: "messi", name: "Lionel Messi", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Lionel_Messi_2018.jpg/120px-Lionel_Messi_2018.jpg" },
  { id: "cristianoronaldo", name: "Cristiano Ronaldo", image: "/players/cristianoronaldo.jpg" },
  { id: "iniesta", name: "Andrés Iniesta", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Andres_Iniesta_2015.jpg/120px-Andres_Iniesta_2015.jpg" },
  { id: "xavi", name: "Xavi Hernández", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Xavi_2011.jpg/120px-Xavi_2011.jpg" },
  { id: "buffon", name: "Gianluigi Buffon", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Gianluigi_Buffon_2016.jpg/120px-Gianluigi_Buffon_2016.jpg" },
  { id: "ramos", name: "Sergio Ramos", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Sergio_Ramos_2017.jpg/120px-Sergio_Ramos_2017.jpg" },
  { id: "neymar", name: "Neymar Jr", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Neymar_2018.jpg/120px-Neymar_2018.jpg" },
  { id: "suarez", name: "Luis Suárez", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Luis_Suarez_2018.jpg/120px-Luis_Suarez_2018.jpg" },
  // Modern era
  { id: "mbappe", name: "Kylian Mbappé", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Kylian_Mbappe_2018.jpg/120px-Kylian_Mbappe_2018.jpg" },
  { id: "haaland", name: "Erling Haaland", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Erling_Haaland_2023.jpg/120px-Erling_Haaland_2023.jpg" },
  { id: "lewandowski", name: "Robert Lewandowski", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Robert_Lewandowski_2018.jpg/120px-Robert_Lewandowski_2018.jpg" },
  { id: "debruyne", name: "Kevin De Bruyne", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Kevin_De_Bruyne_2018.jpg/120px-Kevin_De_Bruyne_2018.jpg" },
  { id: "salah", name: "Mohamed Salah", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Mohamed_Salah_2018.jpg/120px-Mohamed_Salah_2018.jpg" },
  { id: "modric", name: "Luka Modrić", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Luka_Modric_2018.jpg/120px-Luka_Modric_2018.jpg" },
  { id: "vanijk", name: "Virgil van Dijk", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Virgil_van_Dijk_2023.jpg/120px-Virgil_van_Dijk_2023.jpg" },
  { id: "courtois", name: "Thibaut Courtois", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Thibaut_Courtois_2018.jpg/120px-Thibaut_Courtois_2018.jpg" },
  // Recent legends
  { id: "neuer", name: "Manuel Neuer", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Manuel_Neuer_2018.jpg/120px-Manuel_Neuer_2018.jpg" },
  { id: "robben", name: "Arjen Robben", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Arjen_Robben_2017.jpg/120px-Arjen_Robben_2017.jpg" },
  { id: "ribery", name: "Franck Ribéry", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Franck_Ribery_2015.jpg/120px-Franck_Ribery_2015.jpg" },
  { id: "pirlo", name: "Andrea Pirlo", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Andrea_Pirlo_2015.jpg/120px-Andrea_Pirlo_2015.jpg" },
  { id: "totti", name: "Francesco Totti", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Francesco_Totti_2015.jpg/120px-Francesco_Totti_2015.jpg" },
  { id: "delpiero", name: "Alessandro Del Piero", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Alessandro_Del_Piero_2016.jpg/120px-Alessandro_Del_Piero_2016.jpg" },
  { id: "rooney", name: "Wayne Rooney", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Wayne_Rooney_2017.jpg/120px-Wayne_Rooney_2017.jpg" },
];

export function getPlayer(slug: string): PlayerOption | undefined {
  return PLAYERS.find((p) => p.id === slug);
}
