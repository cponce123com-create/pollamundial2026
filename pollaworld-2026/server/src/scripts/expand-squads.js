const fs = require('fs');
const path = require('path');


const squads = JSON.parse(fs.readFileSync(path.join(__dirname, '../db/squads.json'), 'utf-8'));

const meta = {
  "México": {fifaRank:12,nickname:"El Tri",bestWC:"Cuartos (1970, 1986)",stadium:"Estadio Azteca"},
  "Sudáfrica": {fifaRank:60,nickname:"Bafana Bafana",bestWC:"Fase grupos",stadium:"Soccer City"},
  "Corea del Sur": {fifaRank:23,nickname:"Tigres Asiáticos",bestWC:"4° lugar (2002)",stadium:"Seoul World Cup"},
  "República Checa": {fifaRank:40,nickname:"Lokomotiva",bestWC:"Subcampeón (1934)",stadium:"Eden Arena"},
  "Canadá": {fifaRank:45,nickname:"Canucks",bestWC:"Fase grupos",stadium:"BMO Field"},
  "Bosnia y Herzegovina": {fifaRank:55,nickname:"Zmajevi",bestWC:"Fase grupos",stadium:"Bilino Polje"},
  "Catar": {fifaRank:56,nickname:"Al-Annabi",bestWC:"Fase grupos (2022)",stadium:"Lusail"},
  "Suiza": {fifaRank:15,nickname:"Helvecia",bestWC:"Cuartos (1954)",stadium:"Stade de Suisse"},
  "Brasil": {fifaRank:1,nickname:"Canarinha",bestWC:"Pentacampeón",stadium:"Maracanã"},
  "Marruecos": {fifaRank:13,nickname:"Leones del Atlas",bestWC:"Semifinal (2022)",stadium:"Ibn Batouta"},
  "Haití": {fifaRank:80,nickname:"Grenadiers",bestWC:"Fase grupos",stadium:"Sylvio Cator"},
  "Escocia": {fifaRank:34,nickname:"Tartan Army",bestWC:"Fase grupos",stadium:"Hampden Park"},
  "Estados Unidos": {fifaRank:11,nickname:"Stars & Stripes",bestWC:"3° (1930)",stadium:"Mercedes-Benz Stadium"},
  "Paraguay": {fifaRank:42,nickname:"Guaraníes",bestWC:"Cuartos (2010)",stadium:"Defensores del Chaco"},
  "Australia": {fifaRank:24,nickname:"Socceroos",bestWC:"Octavos (2006, 2022)",stadium:"ANZ Stadium"},
  "Turquía": {fifaRank:38,nickname:"Crescent-Stars",bestWC:"3° (2002)",stadium:"Atatürk Olympic"},
  "Alemania": {fifaRank:3,nickname:"Die Mannschaft",bestWC:"Cuatro veces campeón",stadium:"Olympiastadion"},
  "Curazao": {fifaRank:86,nickname:"Los Azules",bestWC:"No clasificado",stadium:"Ergilio Hato"},
  "Costa de Marfil": {fifaRank:44,nickname:"Los Elefantes",bestWC:"Fase grupos",stadium:"Alassane Ouattara"},
  "Ecuador": {fifaRank:31,nickname:"La Tri",bestWC:"Octavos (2006, 2022)",stadium:"Rodrigo Paz"},
  "Países Bajos": {fifaRank:7,nickname:"Oranje",bestWC:"Subcampeón (1974, 2010)",stadium:"Johan Cruyff Arena"},
  "Japón": {fifaRank:18,nickname:"Samurai Blue",bestWC:"Octavos (2002, 2018, 2022)",stadium:"Saitama"},
  "Suecia": {fifaRank:25,nickname:"Blågult",bestWC:"Subcampeón (1958)",stadium:"Friends Arena"},
  "Túnez": {fifaRank:30,nickname:"Águilas de Cartago",bestWC:"Fase grupos",stadium:"Olímpico Radès"},
  "Bélgica": {fifaRank:6,nickname:"Red Devils",bestWC:"3° (2018)",stadium:"Rey Balduino"},
  "Egipto": {fifaRank:36,nickname:"Faraones",bestWC:"Segunda ronda (1934)",stadium:"Borg El Arab"},
  "Irán": {fifaRank:21,nickname:"Estrellas de Persia",bestWC:"Fase grupos",stadium:"Azadi"},
  "Nueva Zelanda": {fifaRank:104,nickname:"All Whites",bestWC:"Fase grupos (2010)",stadium:"Eden Park"},
  "España": {fifaRank:8,nickname:"La Roja",bestWC:"Campeón (2010)",stadium:"La Cartuja"},
  "Cabo Verde": {fifaRank:71,nickname:"Tubarões Azuis",bestWC:"Octavos (2022)",stadium:"Nacional de Cabo Verde"},
  "Arabia Saudita": {fifaRank:53,nickname:"Halcones Verdes",bestWC:"Octavos (1994)",stadium:"King Abdullah"},
  "Uruguay": {fifaRank:16,nickname:"La Celeste",bestWC:"Campeón (1930, 1950)",stadium:"Centenario"},
  "Francia": {fifaRank:2,nickname:"Les Bleus",bestWC:"Bicampeón (1998, 2018)",stadium:"Stade de France"},
  "Senegal": {fifaRank:20,nickname:"Leones de Teranga",bestWC:"Cuartos (2002)",stadium:"Abdoulaye Wade"},
  "Irak": {fifaRank:68,nickname:"Leones de Mesopotamia",bestWC:"4° (2006)",stadium:"Basra"},
  "Noruega": {fifaRank:44,nickname:"Vikings",bestWC:"Octavos (1998)",stadium:"Ullevaal"},
  "Argentina": {fifaRank:5,nickname:"Albiceleste",bestWC:"Tricampeón (2022)",stadium:"Monumental"},
  "Argelia": {fifaRank:29,nickname:"Zorro del Desierto",bestWC:"Octavos (2014)",stadium:"Mustapha Tchaker"},
  "Austria": {fifaRank:25,nickname:"Das Team",bestWC:"3° (1954)",stadium:"Ernst Happel"},
  "Jordania": {fifaRank:70,nickname:"Al-Nashama",bestWC:"Final (Asian Cup 2023)",stadium:"Amman"},
  "Portugal": {fifaRank:9,nickname:"Selecção",bestWC:"3° (1966)",stadium:"Estádio da Luz"},
  "RD Congo": {fifaRank:62,nickname:"Leopardos",bestWC:"Fase grupos (1974)",stadium:"Stade des Martyrs"},
  "Uzbekistán": {fifaRank:74,nickname:"Leones Blancos",bestWC:"Fase grupos",stadium:"Bunyodkor"},
  "Colombia": {fifaRank:14,nickname:"Los Cafeteros",bestWC:"Cuartos (2014)",stadium:"Metropolitano"},
  "Inglaterra": {fifaRank:4,nickname:"Three Lions",bestWC:"Campeón (1966)",stadium:"Wembley"},
  "Croacia": {fifaRank:10,nickname:"Vatreni",bestWC:"Subcampeón (2018)",stadium:"Maksimir"},
  "Ghana": {fifaRank:61,nickname:"Estrellas Negras",bestWC:"Cuartos (2010)",stadium:"Accra Sports"},
  "Panamá": {fifaRank:55,nickname:"Canaleros",bestWC:"Octavos (2018)",stadium:"Rommel Fernández"}
};

// Generate extra player data inline per team
function addPlayerData(squad) {
  const t = squad.team;
  const m = meta[t];
  if (!m) throw new Error(`Missing meta: ${t}`);

  const extras = generateExtras(t);
  const existing = squad.players.map((p, i) => {
    const e = extras.existing[i] || {club:"Unknown",age:25,caps:10};
    return {...p, club: e.club, age: e.age, caps: e.caps};
  });

  return {
    team: t,
    coach: squad.coach,
    formation: squad.formation,
    ...m,
    players: [...existing, ...extras.extra]
  };
}

function generateExtras(teamName) {
  const pool = extraData[teamName] || extraData["default"];
  return pool;
}

const extraData = {};
const allTeams = squads.map(s => s.team);

// Helper: build extra data for each team
function buildExtra(team, existingData, extraPlayers) {
  extraData[team] = { existing: existingData, extra: extraPlayers };
}

// México
buildExtra("México", [
  {club:"América",age:40,caps:150},{club:"América",age:34,caps:45},{club:"Monterrey",age:28,caps:42},
  {club:"Genoa",age:27,caps:25},{club:"Monterrey",age:25,caps:18},{club:"América",age:26,caps:55},
  {club:"Pachuca",age:27,caps:30},{club:"Cruz Azul",age:28,caps:50},{club:"PSV",age:30,caps:70},
  {club:"Fulham",age:34,caps:105},{club:"Feyenoord",age:23,caps:28}
], [
  {name:"C.Acevedo",num:12,pos:"GK",club:"Santos",age:28,caps:12},{name:"J.Orozco",num:13,pos:"GK",club:"Chivas",age:24,caps:8},
  {name:"J.Araujo",num:14,pos:"DF",club:"LA Galaxy",age:27,caps:15},{name:"J.Gallardo",num:15,pos:"DF",club:"Monterrey",age:30,caps:85},
  {name:"J.Angulo",num:16,pos:"DF",club:"América",age:25,caps:10},{name:"M.Flores",num:17,pos:"MF",club:"Monterrey",age:22,caps:5},
  {name:"O.Beltrán",num:18,pos:"MF",club:"UNAM",age:26,caps:20},{name:"J.Antuna",num:19,pos:"FW",club:"Chivas",age:27,caps:35},
  {name:"S.Córdova",num:20,pos:"FW",club:"Querétaro",age:24,caps:15},{name:"H.Martín",num:21,pos:"FW",club:"América",age:33,caps:40},
  {name:"E.Sánchez",num:22,pos:"MF",club:"Pachuca",age:25,caps:12},{name:"R.Funes Mori",num:23,pos:"FW",club:"Monterrey",age:34,caps:20}
]);

// Sudáfrica
buildExtra("Sudáfrica", [
  {club:"Sundowns",age:37,caps:60},{club:"Kaizer Chiefs",age:28,caps:25},{club:"Sundowns",age:30,caps:50},
  {club:"Sundowns",age:35,caps:70},{club:"Orlando",age:29,caps:30},{club:"Sundowns",age:28,caps:35},
  {club:"Kaizer Chiefs",age:27,caps:20},{club:"Sundowns",age:26,caps:18},{club:"Al Ahly",age:32,caps:90},
  {club:"Kaizer Chiefs",age:31,caps:45},{club:"Strasbourg",age:28,caps:20}
], [
  {name:"B.Petersen",num:12,pos:"GK",club:"Wits",age:26,caps:10},{name:"V.Mothwa",num:13,pos:"GK",club:"AmaZulu",age:30,caps:15},
  {name:"N.Ngcobo",num:14,pos:"DF",club:"Chiefs",age:27,caps:12},{name:"S.Hlanti",num:15,pos:"DF",club:"Sundowns",age:34,caps:55},
  {name:"T.Mokoena",num:16,pos:"DF",club:"SuperSport",age:25,caps:8},{name:"S.Magwasa",num:17,pos:"MF",club:"Orlando",age:23,caps:6},
  {name:"L.Mtshali",num:18,pos:"MF",club:"AmaZulu",age:27,caps:14},{name:"T.Lorch",num:19,pos:"FW",club:"Orlando",age:30,caps:38},
  {name:"I.Rayners",num:20,pos:"FW",club:"SuperSport",age:26,caps:10},{name:"K.Mayo",num:21,pos:"FW",club:"Sundowns",age:24,caps:7},
  {name:"S.Lepasa",num:22,pos:"MF",club:"Orlando",age:26,caps:12},{name:"B.Grobler",num:23,pos:"FW",club:"SuperSport",age:31,caps:9}
]);

// Corea del Sur
buildExtra("Corea del Sur", [
  {club:"Al-Shabab",age:35,caps:78},{club:"Ulsan",age:28,caps:22},{club:"Jeonbuk",age:26,caps:18},
  {club:"Ulsan",age:30,caps:40},{club:"Jeonbuk",age:29,caps:35},{club:"Stuttgart",age:25,caps:15},
  {club:"Mainz",age:24,caps:20},{club:"Ulsan",age:27,caps:25},{club:"Tottenham",age:32,caps:130},
  {club:"Wolves",age:26,caps:40},{club:"Celtic",age:27,caps:30}
], [
  {name:"Kim J.H.",num:12,pos:"GK",club:"Jeonbuk",age:32,caps:25},{name:"Song B.K.",num:13,pos:"GK",club:"Ulsan",age:26,caps:10},
  {name:"Kim Y.G.",num:14,pos:"DF",club:"Ulsan",age:29,caps:55},{name:"Kwon K.W.",num:15,pos:"DF",club:"Gimcheon",age:30,caps:28},
  {name:"Park J.S.",num:16,pos:"DF",club:"Jeonbuk",age:25,caps:12},{name:"Lee S.W.",num:17,pos:"MF",club:"Gwangju",age:24,caps:8},
  {name:"Paik S.H.",num:18,pos:"MF",club:"Birmingham",age:27,caps:18},{name:"Yang H.J.",num:19,pos:"FW",club:"Gangwon",age:23,caps:6},
  {name:"Oh H.K.",num:20,pos:"FW",club:"Ulsan",age:25,caps:14},{name:"Kim J.K.",num:21,pos:"FW",club:"Jeonbuk",age:27,caps:10},
  {name:"Lee D.K.",num:22,pos:"MF",club:"Ulsan",age:23,caps:5},{name:"Na S.H.",num:23,pos:"FW",club:"Seoul",age:28,caps:16}
]);

// República Checa
buildExtra("República Checa", [
  {club:"Slavia",age:35,caps:55},{club:"Slavia",age:28,caps:18},{club:"Sparta",age:30,caps:25},
  {club:"Slavia",age:31,caps:35},{club:"Wolfsburg",age:27,caps:22},{club:"West Ham",age:30,caps:70},
  {club:"Fiorentina",age:30,caps:45},{club:"Slovacko",age:25,caps:10},{club:"Slavia",age:30,caps:30},
  {club:"Leverkusen",age:28,caps:65},{club:"Sparta",age:26,caps:20}
], [
  {name:"J.Pavlenka",num:12,pos:"GK",club:"Bremen",age:32,caps:20},{name:"A.Mandous",num:13,pos:"GK",club:"Slavia",age:31,caps:10},
  {name:"L.Krejčí",num:14,pos:"DF",club:"Sparta",age:28,caps:12},{name:"D.Jurásek",num:15,pos:"DF",club:"Benfica",age:24,caps:8},
  {name:"M.Vitík",num:16,pos:"DF",club:"Sparta",age:22,caps:5},{name:"L.Masopust",num:17,pos:"MF",club:"Slavia",age:31,caps:40},
  {name:"M.Sadílek",num:18,pos:"MF",club:"Twente",age:25,caps:15},{name:"J.Zima",num:19,pos:"FW",club:"Slavia",age:26,caps:12},
  {name:"T.Chorý",num:20,pos:"FW",club:"Plzeň",age:29,caps:18},{name:"V.Jurečka",num:21,pos:"FW",club:"Slavia",age:30,caps:14},
  {name:"O.Lingr",num:22,pos:"MF",club:"Feyenoord",age:25,caps:10},{name:"M.Jurásek",num:23,pos:"FW",club:"Sparta",age:24,caps:6}
]);

// Canadá
buildExtra("Canadá", [
  {club:"LAFC",age:32,caps:55},{club:"Celtic",age:26,caps:40},{club:"Chaves",age:33,caps:70},
  {club:"Portland",age:27,caps:35},{club:"Bayern",age:24,caps:50},{club:"Porto",age:28,caps:30},
  {club:"Watford",age:23,caps:15},{club:"Toronto",age:31,caps:65},{club:"Inter Miami",age:26,caps:30},
  {club:"Lille",age:25,caps:45},{club:"Mallorca",age:29,caps:55}
], [
  {name:"D.St.Clair",num:12,pos:"GK",club:"Minnesota",age:27,caps:12},{name:"T.McGill",num:13,pos:"GK",club:"Brighton",age:24,caps:3},
  {name:"Z.McGraw",num:14,pos:"DF",club:"Montreal",age:27,caps:8},{name:"R.Laryea",num:15,pos:"DF",club:"Toronto",age:30,caps:50},
  {name:"D.Cornelius",num:16,pos:"DF",club:"Malmo",age:26,caps:15},{name:"L.Fraser",num:17,pos:"MF",club:"Montreal",age:25,caps:10},
  {name:"J.Hoilett",num:18,pos:"MF",club:"Aberdeen",age:34,caps:60},{name:"C.Larin",num:19,pos:"FW",club:"Mallorca",age:29,caps:55},
  {name:"I.Ugbo",num:20,pos:"FW",club:"Troyes",age:25,caps:12},{name:"J.Russell-Rowe",num:21,pos:"FW",club:"Columbus",age:21,caps:6},
  {name:"M.Choinière",num:22,pos:"MF",club:"Montreal",age:25,caps:14},{name:"T.Bair",num:23,pos:"FW",club:"Motherwell",age:24,caps:5}
]);

// Bosnia y Herzegovina
buildExtra("Bosnia y Herzegovina", [
  {club:"Qarabağ",age:33,caps:55},{club:"Sheffield Utd",age:27,caps:18},{club:"Atalanta",age:31,caps:60},
  {club:"Malmo",age:26,caps:14},{club:"Lokomotiva",age:30,caps:22},{club:"Barcelona",age:35,caps:115},
  {club:"Fenerbahçe",age:31,caps:28},{club:"Sturm Graz",age:24,caps:10},{club:"Fenerbahçe",age:38,caps:130},
  {club:"Zürich",age:35,caps:45},{club:"Hajduk Split",age:25,caps:8}
], [
  {name:"K.Pirić",num:12,pos:"GK",club:"St.Gallen",age:27,caps:5},{name:"V.Hadžić",num:13,pos:"GK",club:"Željezničar",age:25,caps:4},
  {name:"A.Barišić",num:14,pos:"DF",club:"Rapid",age:29,caps:20},{name:"N.Bjelobrk",num:15,pos:"DF",club:"Sarajevo",age:26,caps:8},
  {name:"S.Preldžić",num:16,pos:"DF",club:"Zrinjski",age:24,caps:6},{name:"I.Šunjić",num:17,pos:"MF",club:"Parma",age:27,caps:12},
  {name:"A.Hodžić",num:18,pos:"MF",club:"Željezničar",age:23,caps:5},{name:"E.Mujan",num:19,pos:"FW",club:"Bregalnica",age:25,caps:4},
  {name:"S.Vasković",num:20,pos:"FW",club:"Sarajevo",age:27,caps:7},{name:"N.Haskić",num:21,pos:"FW",club:"Velež",age:29,caps:10},
  {name:"D.Pobrić",num:22,pos:"MF",club:"Sarajevo",age:27,caps:8},{name:"B.Cimirot",num:23,pos:"MF",club:"Standard",age:31,caps:35}
]);

// Catar
buildExtra("Catar", [
  {club:"Al-Sadd",age:32,caps:45},{club:"Al-Duhail",age:27,caps:28},{club:"Al-Rayyan",age:29,caps:35},
  {club:"Al-Sadd",age:31,caps:55},{club:"Al-Gharafa",age:26,caps:18},{club:"Al-Sadd",age:30,caps:40},
  {club:"Al-Sadd",age:33,caps:90},{club:"Al-Wakrah",age:28,caps:22},{club:"Al-Sadd",age:28,caps:75},
  {club:"Al-Duhail",age:31,caps:60},{club:"Al-Duhail",age:29,caps:30}
], [
  {name:"Y.Hassan",num:12,pos:"GK",club:"Al-Gharafa",age:33,caps:15},{name:"S.Zakaria",num:13,pos:"GK",club:"Al-Arabi",age:25,caps:5},
  {name:"H.Ahmed",num:14,pos:"DF",club:"Al-Rayyan",age:28,caps:20},{name:"M.Al-Breik",num:15,pos:"DF",club:"Al-Duhail",age:31,caps:42},
  {name:"S.Al-Muhaza",num:16,pos:"DF",club:"Al-Wakrah",age:24,caps:6},{name:"A.Madibo",num:17,pos:"MF",club:"Al-Duhail",age:28,caps:50},
  {name:"M.Boudiaf",num:18,pos:"MF",club:"Al-Duhail",age:34,caps:65},{name:"Y.Abdurisag",num:19,pos:"FW",club:"Al-Sadd",age:24,caps:12},
  {name:"A.Al-Hassan",num:20,pos:"FW",club:"Al-Sadd",age:27,caps:18},{name:"K.Muneer",num:21,pos:"FW",club:"Al-Wakrah",age:25,caps:8},
  {name:"M.Waad",num:22,pos:"MF",club:"Al-Duhail",age:28,caps:20},{name:"H.Ismaeil",num:23,pos:"DF",club:"Al-Ahli",age:27,caps:10}
]);

// Suiza
buildExtra("Suiza", [
  {club:"Inter",age:35,caps:90},{club:"Man City",age:30,caps:70},{club:"Gladbach",age:28,caps:55},
  {club:"Torino",age:31,caps:65},{club:"Mainz",age:31,caps:45},{club:"Monaco",age:28,caps:35},
  {club:"Leverkusen",age:31,caps:130},{club:"Bologna",age:32,caps:50},{club:"Chicago",age:33,caps:90},
  {club:"Augsburg",age:26,caps:30},{club:"AC Milan",age:25,caps:20}
], [
  {name:"J.Omlin",num:12,pos:"GK",club:"Gladbach",age:31,caps:15},{name:"Y.Mvogo",num:13,pos:"GK",club:"Lorient",age:30,caps:10},
  {name:"B.Fernandes",num:14,pos:"DF",club:"Lille",age:26,caps:8},{name:"U.Garcia",num:15,pos:"DF",club:"YB",age:28,caps:12},
  {name:"L.Cömert",num:16,pos:"DF",club:"Valencia",age:26,caps:20},{name:"M.Aebischer",num:17,pos:"MF",club:"Bologna",age:27,caps:15},
  {name:"F.Rieder",num:18,pos:"MF",club:"Rennes",age:23,caps:6},{name:"N.Amdouni",num:19,pos:"FW",club:"Burnley",age:24,caps:10},
  {name:"C.Itten",num:20,pos:"FW",club:"YB",age:28,caps:12},{name:"R.Steffen",num:21,pos:"FW",club:"Basel",age:33,caps:28},
  {name:"D.Sow",num:22,pos:"MF",club:"Eintracht",age:27,caps:25},{name:"A.Jankewitz",num:23,pos:"MF",club:"Basel",age:23,caps:4}
]);

// Brasil
buildExtra("Brasil", [
  {club:"Liverpool",age:31,caps:70},{club:"Juventus",age:33,caps:60},{club:"PSG",age:30,caps:85},
  {club:"Arsenal",age:27,caps:25},{club:"Real Madrid",age:27,caps:35},{club:"Man Utd",age:33,caps:75},
  {club:"West Ham",age:26,caps:50},{club:"Newcastle",age:28,caps:30},{club:"Real Madrid",age:24,caps:35},
  {club:"Al-Hilal",age:33,caps:130},{club:"Real Madrid",age:24,caps:28}
], [
  {name:"Ederson",num:12,pos:"GK",club:"Man City",age:30,caps:25},{name:"Bento",num:13,pos:"GK",club:"Athletico",age:25,caps:10},
  {name:"Marquinhos",num:14,pos:"DF",club:"PSG",age:30,caps:85},{name:"Danilo",num:15,pos:"DF",club:"Juventus",age:33,caps:60},
  {name:"Renan Lodi",num:16,pos:"DF",club:"Marseille",age:26,caps:20},{name:"Gerson",num:17,pos:"MF",club:"Flamengo",age:27,caps:20},
  {name:"D.Luiz",num:18,pos:"MF",club:"Aston Villa",age:26,caps:18},{name:"Raphinha",num:19,pos:"FW",club:"Barcelona",age:27,caps:30},
  {name:"G.Jesus",num:20,pos:"FW",club:"Arsenal",age:27,caps:60},{name:"Richarlison",num:21,pos:"FW",club:"Tottenham",age:27,caps:50},
  {name:"Joelinton",num:22,pos:"MF",club:"Newcastle",age:27,caps:12},{name:"Endrick",num:23,pos:"FW",club:"Real Madrid",age:19,caps:5}
]);

// Marruecos
buildExtra("Marruecos", [
  {club:"Al-Hilal",age:33,caps:70},{club:"PSG",age:25,caps:75},{club:"Bayern",age:27,caps:30},
  {club:"Al-Sadd",age:34,caps:80},{club:"West Ham",age:26,caps:35},{club:"Man Utd",age:27,caps:55},
  {club:"Marseille",age:24,caps:18},{club:"Genk",age:20,caps:10},{club:"Galatasaray",age:31,caps:60},
  {club:"Lens",age:25,caps:15},{club:"Sevilla",age:27,caps:70}
], [
  {name:"M.Mohamedi",num:12,pos:"GK",club:"Al-Wehda",age:33,caps:45},{name:"A.El Kajoui",num:13,pos:"GK",club:"Raja",age:34,caps:10},
  {name:"R.Mmaee",num:14,pos:"DF",club:"Fenerbahçe",age:28,caps:12},{name:"J.El Yamiq",num:15,pos:"DF",club:"Al-Wehda",age:32,caps:22},
  {name:"Y.Attiyat Allah",num:16,pos:"DF",club:"Wydad",age:29,caps:8},{name:"A.Barkok",num:17,pos:"MF",club:"Mainz",age:26,caps:15},
  {name:"I.Chair",num:18,pos:"MF",club:"QPR",age:27,caps:10},{name:"Z.Aboukhlal",num:19,pos:"FW",club:"Toulouse",age:24,caps:14},
  {name:"A.El Kaabi",num:20,pos:"FW",club:"Olympiacos",age:31,caps:20},{name:"R.Saibari",num:21,pos:"FW",club:"PSV",age:22,caps:6},
  {name:"B.Benamar",num:22,pos:"MF",club:"Feyenoord",age:23,caps:4},{name:"T.Haraldsson",num:23,pos:"FW",club:"Lille",age:25,caps:8}
]);

// Haiti
buildExtra("Haití", [
  {club:"Madeira",age:34,caps:50},{club:"Reds",age:28,caps:15},{club:"Salitas",age:30,caps:25},
  {club:"CSKA Sofia",age:28,caps:20},{club:"Don Bosco",age:26,caps:12},{club:"Violette",age:30,caps:35},
  {club:"Capoise",age:27,caps:18},{club:"Don Bosco",age:25,caps:10},{club:"Dijon",age:32,caps:55},
  {club:"Capoise",age:31,caps:40},{club:"Aigle",age:27,caps:14}
], [
  {name:"G.Hérard",num:12,pos:"GK",club:"Violette",age:30,caps:5},{name:"D.Nazon",num:13,pos:"GK",club:"Roulado",age:27,caps:3},
  {name:"S.Mustivar",num:14,pos:"DF",club:"Violette",age:26,caps:8},{name:"M.Désir",num:15,pos:"DF",club:"Tempête",age:25,caps:6},
  {name:"P.Louis",num:16,pos:"DF",club:"Capoise",age:24,caps:4},{name:"C.Lafrance",num:17,pos:"MF",club:"Don Bosco",age:27,caps:10},
  {name:"J.Siméon",num:18,pos:"MF",club:"Aigle",age:25,caps:7},{name:"R.Cherenfant",num:19,pos:"FW",club:"Violette",age:24,caps:5},
  {name:"S.Dacius",num:20,pos:"FW",club:"Rufisque",age:26,caps:8},{name:"J.Merius",num:21,pos:"FW",club:"Tempête",age:23,caps:4},
  {name:"B.Alce",num:22,pos:"MF",club:"Don Bosco",age:25,caps:6},{name:"K.Jean",num:23,pos:"FW",club:"Roulado",age:22,caps:3}
]);

// Escocia
buildExtra("Escocia", [
  {club:"Celtic",age:41,caps:75},{club:"Norwich",age:33,caps:55},{club:"Real Sociedad",age:27,caps:50},
  {club:"Birmingham",age:30,caps:35},{club:"Liverpool",age:30,caps:80},{club:"Man Utd",age:28,caps:55},
  {club:"Celtic",age:31,caps:60},{club:"Bournemouth",age:29,caps:30},{club:"Aston Villa",age:30,caps:70},
  {club:"Southampton",age:28,caps:40},{club:"QPR",age:33,caps:25}
], [
  {name:"L.Kelly",num:12,pos:"GK",club:"Motherwell",age:28,caps:10},{name:"R.McCrorie",num:13,pos:"GK",club:"Rangers",age:26,caps:5},
  {name:"J.Souttar",num:14,pos:"DF",club:"Rangers",age:27,caps:12},{name:"A.Hickey",num:15,pos:"DF",club:"Brentford",age:22,caps:15},
  {name:"L.Cooper",num:16,pos:"DF",club:"Leeds",age:32,caps:25},{name:"B.Gilmour",num:17,pos:"MF",club:"Brighton",age:23,caps:18},
  {name:"R.Armstrong",num:18,pos:"MF",club:"Southampton",age:32,caps:50},{name:"R.Porteous",num:19,pos:"FW",club:"Watford",age:25,caps:10},
  {name:"J.Brown",num:20,pos:"FW",club:"Celtic",age:29,caps:22},{name:"K.Nisbet",num:21,pos:"FW",club:"Millwall",age:27,caps:12},
  {name:"D.Turnbull",num:22,pos:"MF",club:"Celtic",age:25,caps:14},{name:"L.Ferguson",num:23,pos:"MF",club:"Bologna",age:24,caps:8}
]);

// Estados Unidos
buildExtra("Estados Unidos", [
  {club:"Nottingham",age:30,caps:45},{club:"PSV",age:25,caps:35},{club:"Cincinnati",age:27,caps:30},
  {club:"Fulham",age:36,caps:65},{club:"Fulham",age:26,caps:50},{club:"Bournemouth",age:27,caps:35},
  {club:"AC Milan",age:21,caps:30},{club:"Juventus",age:27,caps:55},{club:"Nottingham",age:22,caps:25},
  {club:"AC Milan",age:26,caps:75},{club:"Juventus",age:24,caps:40}
], [
  {name:"E.Horvath",num:12,pos:"GK",club:"Nottingham",age:29,caps:10},{name:"G.Slonina",num:13,pos:"GK",club:"Chelsea",age:20,caps:3},
  {name:"C.Richards",num:14,pos:"DF",club:"C.Palace",age:24,caps:15},{name:"J.Scally",num:15,pos:"DF",club:"Gladbach",age:22,caps:12},
  {name:"M.McKenzie",num:16,pos:"DF",club:"Genk",age:25,caps:8},{name:"K.Acosta",num:17,pos:"MF",club:"Chicago",age:28,caps:55},
  {name:"L.de la Torre",num:18,pos:"MF",club:"Celta",age:26,caps:15},{name:"B.Aaronson",num:19,pos:"FW",club:"Berlin",age:23,caps:10},
  {name:"J.Sargent",num:20,pos:"FW",club:"Norwich",age:24,caps:25},{name:"H.Wright",num:21,pos:"FW",club:"Coventry",age:26,caps:12},
  {name:"M.Tillman",num:22,pos:"MF",club:"PSV",age:22,caps:8},{name:"C.Cowell",num:23,pos:"FW",club:"LA Galaxy",age:22,caps:6}
]);

// Paraguay
buildExtra("Paraguay", [
  {club:"Cerro",age:38,caps:55},{club:"Palmeiras",age:31,caps:35},{club:"Dynamo M.",age:31,caps:30},
  {club:"At.Mineiro",age:28,caps:18},{club:"River",age:26,caps:10},{club:"Libertad",age:27,caps:12},
  {club:"Atlanta",age:25,caps:15},{club:"C.Palace",age:27,caps:8},{club:"Cincinnati",age:32,caps:22},
  {club:"Torino",age:28,caps:20},{club:"Brighton",age:23,caps:15}
], [
  {name:"J.González",num:12,pos:"GK",club:"Olimpia",age:28,caps:8},{name:"A.Aguilar",num:13,pos:"GK",club:"Libertad",age:30,caps:5},
  {name:"S.Riquelme",num:14,pos:"DF",club:"Cerro",age:29,caps:15},{name:"O.Alderete",num:15,pos:"DF",club:"Getafe",age:27,caps:20},
  {name:"J.Rojas",num:16,pos:"DF",club:"River",age:25,caps:12},{name:"D.Gómez",num:17,pos:"MF",club:"Miami",age:26,caps:8},
  {name:"R.Sánchez",num:18,pos:"MF",club:"Cerro",age:25,caps:10},{name:"Á.Cardozo",num:19,pos:"FW",club:"Libertad",age:24,caps:6},
  {name:"N.Abente",num:20,pos:"FW",club:"Olimpia",age:26,caps:8},{name:"W.González",num:21,pos:"FW",club:"León",age:28,caps:14},
  {name:"J.Medina",num:22,pos:"MF",club:"Cerro",age:24,caps:7},{name:"D.Bobadilla",num:23,pos:"FW",club:"São Paulo",age:23,caps:4}
]);

// Australia
buildExtra("Australia", [
  {club:"AZ",age:32,caps:85},{club:"Livingston",age:25,caps:10},{club:"Leicester",age:27,caps:20},
  {club:"Hearts",age:26,caps:15},{club:"Melb.City",age:33,caps:65},{club:"St.Pauli",age:31,caps:60},
  {club:"Middlesbrough",age:26,caps:18},{club:"St.Mirren",age:27,caps:12},{club:"Al-Wehda",age:33,caps:25},
  {club:"Zelvia",age:33,caps:50},{club:"Volendam",age:21,caps:8}
], [
  {name:"A.Redmayne",num:12,pos:"GK",club:"Sydney",age:35,caps:10},{name:"T.Glover",num:13,pos:"GK",club:"Middlesbrough",age:26,caps:5},
  {name:"F.Karacic",num:14,pos:"DF",club:"Bregenz",age:27,caps:8},{name:"R.McGowan",num:15,pos:"DF",club:"Melb.City",age:32,caps:25},
  {name:"G.Jones",num:16,pos:"DF",club:"Perth",age:27,caps:10},{name:"C.Metcalfe",num:17,pos:"MF",club:"St.Pauli",age:24,caps:12},
  {name:"K.Yengi",num:18,pos:"MF",club:"Portsmouth",age:25,caps:6},{name:"M.Boyle",num:19,pos:"FW",club:"Hibs",age:31,caps:28},
  {name:"A.Taggart",num:20,pos:"FW",club:"Perth",age:31,caps:15},{name:"N.D'Agostino",num:21,pos:"FW",club:"Bayern II",age:24,caps:8},
  {name:"L.Brattan",num:22,pos:"MF",club:"Sydney",age:34,caps:14},{name:"J.McGree",num:23,pos:"MF",club:"Boro",age:26,caps:15}
]);

// Turquia
buildExtra("Turquía", [
  {club:"Beşiktaş",age:38,caps:80},{club:"Fenerbahçe",age:25,caps:15},{club:"Galatasaray",age:28,caps:30},
  {club:"Al-Ahli",age:27,caps:55},{club:"Fenerbahçe",age:25,caps:20},{club:"Benfica",age:25,caps:25},
  {club:"Dortmund",age:26,caps:22},{club:"Inter",age:31,caps:95},{club:"Galatasaray",age:26,caps:30},
  {club:"Beşiktaş",age:29,caps:30},{club:"Real Madrid",age:20,caps:18}
], [
  {name:"U.Çakır",num:12,pos:"GK",club:"Trabzonspor",age:28,caps:10},{name:"D.Alemdar",num:13,pos:"GK",club:"Rennes",age:22,caps:5},
  {name:"Ç.Söyüncü",num:14,pos:"DF",club:"Fenerbahçe",age:28,caps:60},{name:"R.Yıldırım",num:15,pos:"DF",club:"Galatasaray",age:26,caps:12},
  {name:"S.Kılıçsoy",num:16,pos:"DF",club:"Beşiktaş",age:24,caps:8},{name:"İ.Kahveci",num:17,pos:"MF",club:"Fenerbahçe",age:29,caps:30},
  {name:"O.Özbek",num:18,pos:"MF",club:"Galatasaray",age:25,caps:10},{name:"C.Ünder",num:19,pos:"FW",club:"Fenerbahçe",age:27,caps:45},
  {name:"E.Dursun",num:20,pos:"FW",club:"Fenerbahçe",age:32,caps:15},{name:"B.Yıldırım",num:21,pos:"FW",club:"Rennes",age:23,caps:8},
  {name:"S.Dursun",num:22,pos:"MF",club:"Trabzonspor",age:30,caps:12},{name:"Y.Akgün",num:23,pos:"FW",club:"Galatasaray",age:24,caps:6}
]);

// Alemania
buildExtra("Alemania", [
  {club:"Bayern",age:38,caps:120},{club:"Bayern",age:30,caps:85},{club:"Real Madrid",age:32,caps:75},
  {club:"Bayern",age:25,caps:15},{club:"Leipzig",age:26,caps:20},{club:"Bayern",age:22,caps:35},
  {club:"Man City",age:34,caps:120},{club:"Retired",age:35,caps:110},{club:"Bayern",age:29,caps:60},
  {club:"Arsenal",age:25,caps:45},{club:"Dortmund",age:32,caps:30}
], [
  {name:"M.ter Stegen",num:12,pos:"GK",club:"Barcelona",age:32,caps:40},{name:"O.Baumann",num:13,pos:"GK",club:"Hoffenheim",age:34,caps:10},
  {name:"J.Tah",num:14,pos:"DF",club:"Leverkusen",age:28,caps:25},{name:"B.Henrichs",num:15,pos:"DF",club:"Leipzig",age:27,caps:15},
  {name:"D.Geiger",num:16,pos:"DF",club:"Hoffenheim",age:25,caps:8},{name:"P.Groß",num:17,pos:"MF",club:"Brighton",age:33,caps:12},
  {name:"F.Wirtz",num:18,pos:"MF",club:"Leverkusen",age:21,caps:20},{name:"S.Gnabry",num:19,pos:"FW",club:"Bayern",age:28,caps:45},
  {name:"T.Müller",num:20,pos:"FW",club:"Bayern",age:35,caps:130},{name:"J.Brandt",num:21,pos:"FW",club:"Dortmund",age:28,caps:35},
  {name:"L.Andrich",num:22,pos:"MF",club:"Leverkusen",age:29,caps:10},{name:"K.Adeyemi",num:23,pos:"FW",club:"Dortmund",age:22,caps:8}
]);

// Curazao
buildExtra("Curazao", [
  {club:"Al-Wehda",age:35,caps:40},{club:"Feyenoord",age:26,caps:15},{club:"NAC",age:28,caps:55},
  {club:"Roda",age:30,caps:20},{club:"Cruz Azul",age:28,caps:12},{club:"AZ",age:28,caps:25},
  {club:"GA Eagles",age:24,caps:10},{club:"Graafschap",age:29,caps:18},{club:"Graafschap",age:31,caps:22},
  {club:"Riga",age:30,caps:15},{club:"Salzburg",age:27,caps:10}
], [
  {name:"T.Scheper",num:12,pos:"GK",club:"Jong PSV",age:26,caps:4},{name:"J.Martha",num:13,pos:"GK",club:"Cambuur",age:28,caps:3},
  {name:"J.Jacobs",num:14,pos:"DF",club:"Eindhoven",age:27,caps:8},{name:"S.van Eijma",num:15,pos:"DF",club:"Helmond",age:25,caps:6},
  {name:"K.Nahar",num:16,pos:"DF",club:"Dordrecht",age:24,caps:5},{name:"D.Rosa",num:17,pos:"MF",club:"Telstar",age:26,caps:8},
  {name:"A.Janga",num:18,pos:"MF",club:"Helmond",age:27,caps:10},{name:"G.Rigaud",num:19,pos:"FW",club:"Dordrecht",age:25,caps:6},
  {name:"J.Lang",num:20,pos:"FW",club:"PSV",age:25,caps:12},{name:"D.Maduro",num:21,pos:"FW",club:"TOP Oss",age:24,caps:5},
  {name:"N.Felida",num:22,pos:"MF",club:"Jong Utrecht",age:23,caps:4},{name:"R.Hooi",num:23,pos:"FW",club:"Emmen",age:32,caps:20}
]);

// Costa de Marfil
buildExtra("Costa de Marfil", [
  {club:"Angers",age:27,caps:15},{club:"Nottingham",age:32,caps:90},{club:"Nottingham",age:34,caps:55},
  {club:"Villarreal",age:30,caps:50},{club:"Al-Orobah",age:28,caps:12},{club:"Al-Ahli",age:28,caps:70},
  {club:"Al-Ahli",age:28,caps:70},{club:"Charlotte",age:33,caps:55},{club:"Villarreal",age:30,caps:35},
  {club:"Dortmund",age:30,caps:45},{club:"Nice",age:28,caps:25}
], [
  {name:"B.Sangaré",num:12,pos:"GK",club:"PSG",age:30,caps:10},{name:"T.Badra",num:13,pos:"GK",club:"ASEC",age:27,caps:5},
  {name:"O.Diomande",num:14,pos:"DF",club:"Sporting",age:21,caps:8},{name:"W.Singo",num:15,pos:"DF",club:"Monaco",age:24,caps:12},
  {name:"H.Traorè",num:16,pos:"DF",club:"Bournemouth",age:32,caps:70},{name:"J.Bamba",num:17,pos:"MF",club:"Celta",age:27,caps:15},
  {name:"S.Dieng",num:18,pos:"MF",club:"Lorient",age:29,caps:10},{name:"C.Kouamé",num:19,pos:"FW",club:"Fiorentina",age:27,caps:25},
  {name:"J.Krasso",num:20,pos:"FW",club:"Red Star",age:30,caps:12},{name:"M.Gradel",num:21,pos:"FW",club:"Le Havre",age:36,caps:55},
  {name:"I.Diallo",num:22,pos:"MF",club:"Roma",age:23,caps:6},{name:"L.Boga",num:23,pos:"MF",club:"Nice",age:28,caps:25}
]);

// Ecuador
buildExtra("Ecuador", [
  {club:"IDV",age:30,caps:25},{club:"São Paulo",age:25,caps:35},{club:"Leverkusen",age:22,caps:30},
  {club:"Santos",age:28,caps:15},{club:"Flamengo",age:27,caps:12},{club:"San Lorenzo",age:29,caps:55},
  {club:"Talleres",age:26,caps:10},{club:"IDV",age:27,caps:18},{club:"Antwerp",age:24,caps:35},
  {club:"Inter",age:31,caps:90},{club:"IDV",age:25,caps:20}
], [
  {name:"H.Galíndez",num:12,pos:"GK",club:"Aucas",age:37,caps:20},{name:"J.Napa",num:13,pos:"GK",club:"BSC",age:25,caps:5},
  {name:"J.Porozo",num:14,pos:"DF",club:"Leganés",age:25,caps:10},{name:"L.Realpe",num:15,pos:"DF",club:"Bragantino",age:26,caps:8},
  {name:"A.Preciado",num:16,pos:"DF",club:"LDU",age:27,caps:12},{name:"J.Julio",num:17,pos:"MF",club:"BSC",age:25,caps:10},
  {name:"S.Mena",num:18,pos:"MF",club:"BSC",age:29,caps:18},{name:"M.Estupiñán",num:19,pos:"FW",club:"BSC",age:26,caps:8},
  {name:"K.Rodríguez",num:20,pos:"FW",club:"IDV",age:24,caps:6},{name:"J.Angulo",num:21,pos:"FW",club:"UNAM",age:26,caps:12},
  {name:"C.Ortiz",num:22,pos:"MF",club:"IDV",age:28,caps:14},{name:"D.Reasco",num:23,pos:"DF",club:"LDU",age:25,caps:7}
]);

// Paises Bajos
buildExtra("Países Bajos", [
  {club:"Brentford",age:31,caps:20},{club:"Inter",age:28,caps:55},{club:"Liverpool",age:33,caps:70},
  {club:"Man City",age:30,caps:60},{club:"Girona",age:35,caps:105},{club:"Barcelona",age:27,caps:60},
  {club:"AC Milan",age:26,caps:18},{club:"Arsenal",age:23,caps:20},{club:"Leipzig",age:22,caps:15},
  {club:"Man Utd",age:31,caps:100},{club:"Liverpool",age:25,caps:40}
], [
  {name:"M.Bijlow",num:12,pos:"GK",club:"Feyenoord",age:27,caps:10},{name:"B.Verbruggen",num:13,pos:"GK",club:"Brighton",age:21,caps:5},
  {name:"S.de Ligt",num:14,pos:"DF",club:"Bayern",age:24,caps:45},{name:"M.de Roon",num:15,pos:"DF",club:"Atalanta",age:33,caps:55},
  {name:"Q.Hartman",num:16,pos:"DF",club:"Feyenoord",age:22,caps:8},{name:"K.Koopmeiners",num:17,pos:"MF",club:"Atalanta",age:27,caps:20},
  {name:"M.Wieffer",num:18,pos:"MF",club:"Brighton",age:24,caps:10},{name:"S.Bergwijn",num:19,pos:"FW",club:"Ajax",age:27,caps:35},
  {name:"D.Malen",num:20,pos:"FW",club:"Dortmund",age:26,caps:30},{name:"W.Weghorst",num:21,pos:"FW",club:"Wolfsburg",age:32,caps:35},
  {name:"R.Gravenberch",num:22,pos:"MF",club:"Liverpool",age:22,caps:12},{name:"N.Frimpong",num:23,pos:"DF",club:"Leverkusen",age:23,caps:10}
]);

// Japon
buildExtra("Japón", [
  {club:"Gamba",age:32,caps:20},{club:"Avispa",age:32,caps:15},{club:"Arsenal",age:26,caps:40},
  {club:"LA Galaxy",age:35,caps:130},{club:"Tokyo",age:37,caps:145},{club:"Liverpool",age:31,caps:65},
  {club:"Lazio",age:27,caps:30},{club:"Kawasaki",age:26,caps:22},{club:"Real Sociedad",age:24,caps:35},
  {club:"Brighton",age:27,caps:25},{club:"Feyenoord",age:25,caps:20}
], [
  {name:"K.Nakamura",num:12,pos:"GK",club:"Portimonense",age:29,caps:10},{name:"Z.Suzuki",num:13,pos:"GK",club:"Sint-Truiden",age:23,caps:5},
  {name:"H.Ito",num:14,pos:"DF",club:"Stuttgart",age:25,caps:15},{name:"S.Sasaki",num:15,pos:"DF",club:"Oita",age:30,caps:14},
  {name:"K.Machida",num:16,pos:"DF",club:"Union SG",age:28,caps:8},{name:"J.Ito",num:17,pos:"MF",club:"Reims",age:31,caps:55},
  {name:"H.Morita",num:18,pos:"MF",club:"Sporting",age:29,caps:30},{name:"K.Ogawa",num:19,pos:"FW",club:"NEC",age:26,caps:10},
  {name:"K.Yamane",num:20,pos:"FW",club:"Kawasaki",age:28,caps:15},{name:"T.Asano",num:21,pos:"FW",club:"Bochum",age:30,caps:50},
  {name:"R.Doan",num:22,pos:"MF",club:"Freiburg",age:26,caps:45},{name:"M.Nakayama",num:23,pos:"DF",club:"Huddersfield",age:26,caps:8}
]);

// Suecia
buildExtra("Suecia", [
  {club:"Aston Villa",age:34,caps:75},{club:"Newcastle",age:30,caps:50},{club:"Man Utd",age:30,caps:65},
  {club:"Newcastle",age:24,caps:20},{club:"Hammarby",age:28,caps:20},{club:"Marseille",age:25,caps:15},
  {club:"Spezia",age:26,caps:18},{club:"Anderlecht",age:29,caps:30},{club:"Tottenham",age:24,caps:35},
  {club:"Sporting",age:26,caps:25},{club:"Leipzig",age:33,caps:85}
], [
  {name:"K.Nordfeldt",num:12,pos:"GK",club:"AIK",age:35,caps:15},{name:"V.Johansson",num:13,pos:"GK",club:"Rotherham",age:28,caps:5},
  {name:"L.Olsson",num:14,pos:"DF",club:"Midtjylland",age:29,caps:10},{name:"J.Lundqvist",num:15,pos:"DF",club:"Hacken",age:27,caps:8},
  {name:"H.Larsson",num:16,pos:"DF",club:"Djurgården",age:27,caps:12},{name:"S.Gustafson",num:17,pos:"MF",club:"Cagliari",age:29,caps:18},
  {name:"J.Ekström",num:18,pos:"MF",club:"Djurgården",age:24,caps:6},{name:"A.Nyman",num:19,pos:"FW",club:"Heerenveen",age:31,caps:22},
  {name:"A.Borges",num:20,pos:"FW",club:"Hammarby",age:27,caps:10},{name:"V.Edvardsen",num:21,pos:"FW",club:"GA Eagles",age:27,caps:8},
  {name:"S.Holm",num:22,pos:"MF",club:"Hammarby",age:25,caps:10},{name:"E.Kiese",num:23,pos:"FW",club:"Malmö",age:31,caps:15}
]);

// tunec
buildExtra("Túnez", [
  {club:"Monastir",age:33,caps:25},{club:"Salernitana",age:29,caps:30},{club:"Lorient",age:26,caps:35},
  {club:"Espérance",age:31,caps:65},{club:"Al-Ahly",age:35,caps:90},{club:"Eintracht",age:28,caps:50},
  {club:"Man Utd",age:21,caps:8},{club:"Liège",age:26,caps:15},{club:"Al-Arabi",age:34,caps:105},
  {club:"Zamalek",age:30,caps:40},{club:"Kuwait",age:33,caps:55}
], [
  {name:"M.Hassen",num:12,pos:"GK",club:"Club Africain",age:29,caps:15},{name:"A.Dahmen",num:13,pos:"GK",club:"Al-Hazem",age:26,caps:5},
  {name:"M.Dräger",num:14,pos:"DF",club:"Nottingham",age:27,caps:25},{name:"A.Hamzaoui",num:15,pos:"DF",club:"Espérance",age:27,caps:12},
  {name:"A.Ghandri",num:16,pos:"DF",club:"Club Africain",age:29,caps:10},{name:"H.Gharbi",num:17,pos:"MF",club:"Espérance",age:27,caps:8},
  {name:"A.Rekik",num:18,pos:"MF",club:"Copenhagen",age:27,caps:15},{name:"S.Ben Romdhane",num:19,pos:"FW",club:"Espérance",age:26,caps:12},
  {name:"H.Jouini",num:20,pos:"FW",club:"Stade",age:29,caps:14},{name:"F.Ben Saïd",num:21,pos:"FW",club:"Espérance",age:25,caps:8},
  {name:"M.Azzouni",num:22,pos:"MF",club:"Club Africain",age:24,caps:6},{name:"C.Labidi",num:23,pos:"FW",club:"Espérance",age:23,caps:4}
]);

// Belgica
buildExtra("Bélgica", [
  {club:"Wolfsburg",age:32,caps:60},{club:"Fulham",age:31,caps:45},{club:"Leicester",age:26,caps:18},
  {club:"Rennes",age:24,caps:12},{club:"Anderlecht",age:37,caps:160},{club:"Aston Villa",age:27,caps:70},
  {club:"Lyon",age:27,caps:20},{club:"Man City",age:33,caps:110},{club:"Anderlecht",age:37,caps:110},
  {club:"Roma",age:31,caps:120},{club:"Man City",age:22,caps:25}
], [
  {name:"M.Sels",num:12,pos:"GK",club:"Nottingham",age:32,caps:15},{name:"D.Kaminski",num:13,pos:"GK",club:"Luton",age:31,caps:8},
  {name:"Z.Debast",num:14,pos:"DF",club:"Anderlecht",age:20,caps:5},{name:"T.Meunier",num:15,pos:"DF",club:"Trabzonspor",age:33,caps:65},
  {name:"A.Witsel",num:16,pos:"MF",club:"Atlético",age:36,caps:135},{name:"H.Vanaken",num:17,pos:"MF",club:"Brugge",age:32,caps:30},
  {name:"C.De Ketelaere",num:18,pos:"MF",club:"Atalanta",age:23,caps:15},{name:"L.Trossard",num:19,pos:"FW",club:"Arsenal",age:30,caps:30},
  {name:"M.Batshuayi",num:20,pos:"FW",club:"Fenerbahçe",age:31,caps:55},{name:"D.Lukebakio",num:21,pos:"FW",club:"Sevilla",age:26,caps:15},
  {name:"A.Onana",num:22,pos:"MF",club:"Man Utd",age:23,caps:10},{name:"R.Vermant",num:23,pos:"FW",club:"Brugge",age:20,caps:3}
]);

// Egipto
buildExtra("Egipto", [
  {club:"Al-Ahly",age:37,caps:50},{club:"Al-Ahly",age:27,caps:15},{club:"Al-Ahly",age:27,caps:25},
  {club:"Al-Ittihad",age:33,caps:85},{club:"Al-Ahly",age:26,caps:10},{club:"Arsenal",age:32,caps:100},
  {club:"Eintracht",age:26,caps:35},{club:"Al-Ahly",age:28,caps:20},{club:"Cleopatra",age:25,caps:10},
  {club:"Liverpool",age:32,caps:95},{club:"Al-Ahly",age:29,caps:25}
], [
  {name:"G.Ekramy",num:12,pos:"GK",club:"Pyramids",age:34,caps:10},{name:"N.El Daba",num:13,pos:"GK",club:"Zamalek",age:25,caps:5},
  {name:"A.El Fotouh",num:14,pos:"DF",club:"Al-Ahly",age:25,caps:12},{name:"M.Hany",num:15,pos:"DF",club:"Al-Ahly",age:27,caps:15},
  {name:"O.Marmoush",num:16,pos:"FW",club:"Eintracht",age:26,caps:35},{name:"H.Fathy",num:17,pos:"MF",club:"Al-Ahly",age:30,caps:20},
  {name:"I.Adel",num:18,pos:"MF",club:"Pyramids",age:26,caps:10},{name:"A.Koka",num:19,pos:"FW",club:"Alanyaspor",age:31,caps:30},
  {name:"M.Hamdy",num:20,pos:"FW",club:"Enppi",age:25,caps:8},{name:"S.Jaziri",num:21,pos:"FW",club:"Tunisia",age:30,caps:12},
  {name:"M.Lasheen",num:22,pos:"MF",club:"Al-Ahly",age:28,caps:14},{name:"M.Abdelmonem",num:23,pos:"DF",club:"Al-Ahly",age:25,caps:20}
]);

// Iran
buildExtra("Irán", [
  {club:"Persepolis",age:33,caps:70},{club:"Dinamo",age:28,caps:25},{club:"Persepolis",age:31,caps:30},
  {club:"Al-Ahli",age:33,caps:40},{club:"AEK",age:26,caps:18},{club:"Vejle",age:28,caps:35},
  {club:"Lech",age:28,caps:20},{club:"AEK",age:31,caps:65},{club:"Inter",age:32,caps:85},
  {club:"Leverkusen",age:30,caps:90},{club:"Feyenoord",age:30,caps:85}
], [
  {name:"H.Niazmand",num:12,pos:"GK",club:"Sepahan",age:29,caps:10},{name:"P.Niazmand",num:13,pos:"GK",club:"Portimonense",age:26,caps:5},
  {name:"S.Hosseini",num:14,pos:"DF",club:"Esteglal",age:33,caps:25},{name:"M.Kanani",num:15,pos:"DF",club:"Persepolis",age:30,caps:45},
  {name:"S.Fallah",num:16,pos:"DF",club:"Gol Gohar",age:26,caps:8},{name:"A.Nourollahi",num:17,pos:"MF",club:"Al-Wahda",age:31,caps:30},
  {name:"O.Noorafkan",num:18,pos:"MF",club:"Sepahan",age:27,caps:15},{name:"K.Ansarifard",num:19,pos:"FW",club:"AEK",age:34,caps:95},
  {name:"S.Ghoddos",num:20,pos:"FW",club:"Brentford",age:30,caps:55},{name:"A.Sayyadmanesh",num:21,pos:"FW",club:"Hull",age:24,caps:10},
  {name:"M.Mohebi",num:22,pos:"MF",club:"Esteglal",age:25,caps:8},{name:"Y.Salmani",num:23,pos:"DF",club:"Persepolis",age:24,caps:6}
]);

// Nueva Zelanda
buildExtra("Nueva Zelanda", [
  {club:"Wellington",age:32,caps:25},{club:"Orlando City",age:25,caps:12},{club:"Pijnaker",age:26,caps:8},
  {club:"Smith",age:34,caps:60},{club:"de Jong",age:28,caps:15},{club:"Singh",age:27,caps:20},
  {club:"Stanger",age:24,caps:10},{club:"Ridenton",age:29,caps:15},{club:"Barry",age:25,caps:8},
  {club:"Forest",age:33,caps:75},{club:"Waine",age:24,caps:10}
], [
  {name:"M.Sail",num:12,pos:"GK",club:"Auckland",age:29,caps:8},{name:"J.Clarke",num:13,pos:"GK",club:"Wellington",age:27,caps:5},
  {name:"T.Payne",num:14,pos:"DF",club:"Auckland",age:25,caps:6},{name:"D.Brown",num:15,pos:"DF",club:"Wellington",age:27,caps:10},
  {name:"L.Toomey",num:16,pos:"DF",club:"Christchurch",age:24,caps:4},{name:"M.Garbett",num:17,pos:"MF",club:"Valour",age:22,caps:6},
  {name:"J.Champness",num:18,pos:"MF",club:"Auckland",age:26,caps:8},{name:"B.Just",num:19,pos:"FW",club:"Auckland",age:25,caps:7},
  {name:"H.Hamilton",num:20,pos:"FW",club:"Wellington",age:28,caps:14},{name:"O.Colloty",num:21,pos:"FW",club:"Auckland",age:23,caps:5},
  {name:"C.Howieson",num:22,pos:"MF",club:"Wellington",age:30,caps:12},{name:"E.Renwick",num:23,pos:"DF",club:"Auckland",age:26,caps:7}
]);

// Espana
buildExtra("España", [
  {club:"Athletic",age:27,caps:45},{club:"Real Madrid",age:32,caps:75},{club:"Real Sociedad",age:28,caps:20},
  {club:"Al-Nassr",age:30,caps:35},{club:"Chelsea",age:26,caps:15},{club:"Man City",age:28,caps:55},
  {club:"Barcelona",age:22,caps:25},{club:"PSG",age:28,caps:30},{club:"Barcelona",age:17,caps:15},
  {club:"Athletic",age:22,caps:20},{club:"Atlético",age:32,caps:75}
], [
  {name:"Kepa",num:12,pos:"GK",club:"Real Madrid",age:30,caps:15},{name:"D.Raya",num:13,pos:"GK",club:"Arsenal",age:29,caps:5},
  {name:"Pau Torres",num:14,pos:"DF",club:"Aston Villa",age:28,caps:25},{name:"J.Navas",num:15,pos:"DF",club:"Sevilla",age:39,caps:55},
  {name:"A.Balde",num:16,pos:"DF",club:"Barcelona",age:21,caps:8},{name:"F.de Jong",num:17,pos:"MF",club:"Barcelona",age:27,caps:25},
  {name:"M.Merino",num:18,pos:"MF",club:"Real Sociedad",age:28,caps:20},{name:"F.Torres",num:19,pos:"FW",club:"Barcelona",age:24,caps:35},
  {name:"M.Oyarzabal",num:20,pos:"FW",club:"Real Sociedad",age:27,caps:30},{name:"Joselu",num:21,pos:"FW",club:"Real Madrid",age:34,caps:15},
  {name:"S.Zubimendi",num:22,pos:"MF",club:"Real Sociedad",age:26,caps:10},{name:"B.Díaz",num:23,pos:"FW",club:"Real Madrid",age:25,caps:12}
]);

// Cabo Verde
buildExtra("Cabo Verde", [
  {club:"Vozinha",age:35,caps:35},{club:"Semedo",age:26,caps:12},{club:"Lopes",age:28,caps:20},
  {club:"Fortes",age:30,caps:25},{club:"Tavares",age:26,caps:10},{club:"Andrade",age:28,caps:15},
  {club:"Monteiro",age:25,caps:8},{club:"Lopes",age:29,caps:12},{club:"Cabral",age:28,caps:18},
  {club:"Rodrigues",age:31,caps:30},{club:"Mendes",age:27,caps:14}
], [
  {name:"M.Lopes",num:12,pos:"GK",club:"AEK",age:28,caps:10},{name:"K.Moreira",num:13,pos:"GK",club:"Mafra",age:26,caps:5},
  {name:"J.Correia",num:14,pos:"DF",club:"Chaves",age:27,caps:8},{name:"D.Duarte",num:15,pos:"DF",club:"Basel",age:30,caps:22},
  {name:"C.Pina",num:16,pos:"DF",club:"Feirense",age:25,caps:6},{name:"K.Santos",num:17,pos:"MF",club:"Estoril",age:26,caps:10},
  {name:"W.Semedo",num:18,pos:"MF",club:"Arouca",age:27,caps:12},{name:"Gilson",num:19,pos:"FW",club:"Beroe",age:25,caps:8},
  {name:"J.Lopes",num:20,pos:"FW",club:"Casa Pia",age:28,caps:12},{name:"R.Mendes",num:21,pos:"FW",club:"Arouca",age:26,caps:10},
  {name:"D.Tavares",num:22,pos:"MF",club:"Estrela",age:24,caps:6},{name:"K.Pina",num:23,pos:"FW",club:"Mafra",age:23,caps:4}
]);

// Arabia Saudita
buildExtra("Arabia Saudita", [
  {club:"Al-Hilal",age:33,caps:55},{club:"Al-Hilal",age:25,caps:30},{club:"Al-Hilal",age:29,caps:40},
  {club:"Al-Shabab",age:27,caps:25},{club:"Al-Hilal",age:32,caps:75},{club:"Al-Hilal",age:30,caps:50},
  {club:"Al-Hilal",age:35,caps:70},{club:"Al-Ittihad",age:28,caps:20},{club:"Al-Hilal",age:32,caps:80},
  {club:"Al-Ahli",age:30,caps:35},{club:"Al-Hilal",age:27,caps:15}
], [
  {name:"N.Al-Aqidi",num:12,pos:"GK",club:"Al-Nassr",age:28,caps:10},{name:"M.Al-Rubaie",num:13,pos:"GK",club:"Al-Ahli",age:27,caps:5},
  {name:"Z.Al-Ghamdi",num:14,pos:"DF",club:"Al-Ittihad",age:26,caps:8},{name:"A.Madou",num:15,pos:"DF",club:"Al-Nassr",age:27,caps:12},
  {name:"H.Al-Ghamdi",num:16,pos:"DF",club:"Al-Wehda",age:24,caps:6},{name:"A.Al-Khaibari",num:17,pos:"MF",club:"Al-Hilal",age:28,caps:15},
  {name:"M.Al-Muwallad",num:18,pos:"MF",club:"Al-Ittihad",age:31,caps:50},{name:"F.Al-Ghamdi",num:19,pos:"FW",club:"Al-Hilal",age:25,caps:10},
  {name:"A.Al-Nemer",num:20,pos:"FW",club:"Al-Nassr",age:26,caps:12},{name:"H.Asiri",num:21,pos:"FW",club:"Al-Ahli",age:28,caps:15},
  {name:"N.Al-Dawsari",num:22,pos:"MF",club:"Al-Hilal",age:25,caps:8},{name:"M.Maraan",num:23,pos:"FW",club:"Al-Nassr",age:24,caps:6}
]);

// Uruguay
buildExtra("Uruguay", [
  {club:"Internacional",age:32,caps:30},{club:"Barcelona",age:25,caps:40},{club:"Atlético",age:30,caps:85},
  {club:"Napoli",age:30,caps:20},{club:"Palmeiras",age:26,caps:15},{club:"Real Madrid",age:26,caps:60},
  {club:"PSG",age:23,caps:18},{club:"Flamengo",age:27,caps:25},{club:"Man Utd",age:23,caps:20},
  {club:"Liverpool",age:25,caps:45},{club:"Flamengo",age:25,caps:10}
], [
  {name:"F.Israel",num:12,pos:"GK",club:"Sporting",age:24,caps:5},{name:"G.de Amores",num:13,pos:"GK",club:"Lanus",age:30,caps:8},
  {name:"S.Cáceres",num:14,pos:"DF",club:"América",age:25,caps:12},{name:"J.L.Rodríguez",num:15,pos:"DF",club:"Peñarol",age:27,caps:10},
  {name:"L.Suárez",num:16,pos:"DF",club:"Gremio",age:24,caps:6},{name:"E.Vecino",num:17,pos:"MF",club:"Lazio",age:33,caps:70},
  {name:"G.de Arrascaeta",num:18,pos:"MF",club:"Flamengo",age:30,caps:55},{name:"B.Rodríguez",num:19,pos:"FW",club:"América",age:24,caps:10},
  {name:"M.Gómez",num:20,pos:"FW",club:"Valencia",age:27,caps:20},{name:"L.Rodríguez",num:21,pos:"FW",club:"Peñarol",age:26,caps:12},
  {name:"M.Arambarri",num:22,pos:"MF",club:"Bordeaux",age:29,caps:15},{name:"A.Canobbio",num:23,pos:"FW",club:"Athletico",age:26,caps:8}
]);

// Francia
buildExtra("Francia", [
  {club:"Tottenham",age:38,caps:145},{club:"Barcelona",age:26,caps:30},{club:"Arsenal",age:23,caps:15},
  {club:"PSG",age:28,caps:35},{club:"AC Milan",age:27,caps:20},{club:"Real Madrid",age:24,caps:35},
  {club:"Real Madrid",age:22,caps:15},{club:"Real Madrid",age:27,caps:80},{club:"Atlético",age:33,caps:130},
  {club:"PSG",age:27,caps:45},{club:"Inter",age:27,caps:25}
], [
  {name:"M.Maignan",num:12,pos:"GK",club:"AC Milan",age:29,caps:20},{name:"A.Areal",num:13,pos:"GK",club:"West Ham",age:31,caps:5},
  {name:"J.Clauss",num:14,pos:"DF",club:"Marseille",age:31,caps:15},{name:"L.Digne",num:15,pos:"DF",club:"Aston Villa",age:31,caps:50},
  {name:"W.Fofana",num:16,pos:"DF",club:"Chelsea",age:24,caps:8},{name:"Y.Fofana",num:17,pos:"MF",club:"Monaco",age:25,caps:10},
  {name:"A.Rabiot",num:18,pos:"MF",club:"Juventus",age:29,caps:45},{name:"K.Coman",num:19,pos:"FW",club:"Bayern",age:28,caps:55},
  {name:"R.Kolo Muani",num:20,pos:"FW",club:"PSG",age:26,caps:20},{name:"M.Olise",num:21,pos:"FW",club:"C.Palace",age:23,caps:8},
  {name:"B.Pavard",num:22,pos:"DF",club:"Inter",age:28,caps:55},{name:"W.Zaïre-Emery",num:23,pos:"MF",club:"PSG",age:20,caps:5}
]);

// Senegal
buildExtra("Senegal", [
  {club:"Chelsea",age:32,caps:40},{club:"Marseille",age:28,caps:20},{club:"Lens",age:28,caps:15},
  {club:"Al-Hilal",age:33,caps:80},{club:"Al-Shabab",age:27,caps:12},{club:"Everton",age:33,caps:75},
  {club:"Free",age:27,caps:25},{club:"Marseille",age:27,caps:35},{club:"Al-Nassr",age:32,caps:100},
  {club:"RB Salzburg",age:27,caps:15},{club:"Chelsea",age:23,caps:12}
], [
  {name:"B.Gomis",num:12,pos:"GK",club:"Konyaspor",age:25,caps:5},{name:"M.Sy",num:13,pos:"GK",club:"Reims",age:29,caps:5},
  {name:"F.Mendy",num:14,pos:"DF",club:"Real Madrid",age:29,caps:15},{name:"Y.Sabaly",num:15,pos:"DF",club:"Betis",age:31,caps:30},
  {name:"M.Niakhate",num:16,pos:"DF",club:"Nottingham",age:28,caps:12},{name:"P.Sarr",num:17,pos:"MF",club:"Chelsea",age:23,caps:10},
  {name:"M.Diop",num:18,pos:"MF",club:"Tottenham",age:27,caps:15},{name:"K.Diatta",num:19,pos:"FW",club:"Monaco",age:24,caps:10},
  {name:"B.Dia",num:20,pos:"FW",club:"Salernitana",age:28,caps:20},{name:"M.Niang",num:21,pos:"FW",club:"Empoli",age:30,caps:25},
  {name:"P.Ciss",num:22,pos:"MF",club:"Rayo",age:28,caps:12},{name:"I.Jakobs",num:23,pos:"DF",club:"Monaco",age:24,caps:8}
]);

// Irak
buildExtra("Irak", [
  {club:"Al-Quwa",age:30,caps:45},{club:"Al-Shorta",age:27,caps:20},{club:"Al-Shorta",age:26,caps:15},
  {club:"Al-Zawraa",age:29,caps:30},{club:"Al-Shorta",age:28,caps:12},{club:"Al-Quwa",age:27,caps:18},
  {club:"Al-Quwa",age:25,caps:10},{club:"Al-Shorta",age:26,caps:8},{club:"Air Force",age:28,caps:14},
  {club:"Al-Quwa",age:27,caps:20},{club:"Al-Shorta",age:25,caps:10}
], [
  {name:"A.Hassan",num:12,pos:"GK",club:"Al-Zawraa",age:30,caps:8},{name:"M.Ahmed",num:13,pos:"GK",club:"Al-Karkh",age:27,caps:4},
  {name:"M.Ali",num:14,pos:"DF",club:"Al-Shorta",age:26,caps:6},{name:"H.Hadi",num:15,pos:"DF",club:"Al-Quwa",age:28,caps:12},
  {name:"K.Aziz",num:16,pos:"DF",club:"Al-Zawraa",age:25,caps:5},{name:"A.Raed",num:17,pos:"MF",club:"Al-Shorta",age:24,caps:7},
  {name:"S.Abdul",num:18,pos:"MF",club:"Al-Quwa",age:25,caps:6},{name:"M.Qasim",num:19,pos:"FW",club:"Air Force",age:26,caps:8},
  {name:"H.Ahmed",num:20,pos:"FW",club:"Al-Shorta",age:27,caps:10},{name:"A.Khalid",num:21,pos:"FW",club:"Al-Zawraa",age:24,caps:5},
  {name:"Y.Karim",num:22,pos:"MF",club:"Al-Quwa",age:26,caps:8},{name:"N.Hussein",num:23,pos:"FW",club:"Air Force",age:23,caps:4}
]);

// Noruega
buildExtra("Noruega", [
  {club:"RB Leipzig",age:34,caps:60},{club:"Dortmund",age:27,caps:15},{club:"Mainz",age:27,caps:12},
  {club:"Napoli",age:25,caps:10},{club:"Brommapojkarna",age:25,caps:8},{club:"Burnley",age:27,caps:50},
  {club:"Arsenal",age:26,caps:70},{club:"Benfica",age:29,caps:20},{club:"Villarreal",age:28,caps:25},
  {club:"Man City",age:24,caps:35},{club:"Cercle Brugge",age:26,caps:8}
], [
  {name:"V.Jarstein",num:12,pos:"GK",club:"Hertha",age:39,caps:70},{name:"E.Selvik",num:13,pos:"GK",club:"Haugesund",age:28,caps:5},
  {name:"S.Rosted",num:14,pos:"DF",club:"Cercle Brugge",age:29,caps:12},{name:"F.Bjørkan",num:15,pos:"DF",club:"Bodø",age:26,caps:10},
  {name:"M.Aarønes",num:16,pos:"DF",club:"Molde",age:25,caps:6},{name:"M.Jensen",num:17,pos:"MF",club:"Fulham",age:26,caps:15},
  {name:"H.Finne",num:18,pos:"MF",club:"Sandefjord",age:24,caps:5},{name:"J.King",num:19,pos:"FW",club:"Watford",age:32,caps:55},
  {name:"T.Dahl",num:20,pos:"FW",club:"Rosenborg",age:26,caps:10},{name:"E.Botheim",num:21,pos:"FW",club:"Salzburg",age:25,caps:8},
  {name:"M.Tønnessen",num:22,pos:"MF",club:"Viking",age:27,caps:8},{name:"O.Solbakken",num:23,pos:"FW",club:"Roma",age:26,caps:10}
]);

// Argentina
buildExtra("Argentina", [
  {club:"Aston Villa",age:32,caps:50},{club:"Atlético",age:26,caps:30},{club:"Tottenham",age:26,caps:20},
  {club:"Benfica",age:37,caps:115},{club:"Lyon",age:32,caps:55},{club:"Atlético",age:30,caps:70},
  {club:"Roma",age:30,caps:65},{club:"Chelsea",age:24,caps:25},{club:"Inter Miami",age:37,caps:185},
  {club:"Man City",age:25,caps:35},{club:"Inter",age:28,caps:50}
], [
  {name:"G.Rulli",num:12,pos:"GK",club:"Ajax",age:32,caps:15},{name:"F.Armani",num:13,pos:"GK",club:"River",age:38,caps:20},
  {name:"G.Montiel",num:14,pos:"DF",club:"Sevilla",age:27,caps:25},{name:"J.Foyth",num:15,pos:"DF",club:"Villarreal",age:27,caps:18},
  {name:"L.Martínez",num:16,pos:"DF",club:"Man Utd",age:27,caps:20},{name:"G.Lo Celso",num:17,pos:"MF",club:"Tottenham",age:28,caps:50},
  {name:"A.Mac Allister",num:18,pos:"MF",club:"Liverpool",age:26,caps:30},{name:"Á.Di María",num:19,pos:"FW",club:"Benfica",age:37,caps:140},
  {name:"P.Dybala",num:20,pos:"FW",club:"Roma",age:31,caps:40},{name:"L.Alario",num:21,pos:"FW",club:"Eintracht",age:31,caps:20},
  {name:"E.Palacios",num:22,pos:"MF",club:"Leverkusen",age:26,caps:15},{name:"N.González",num:23,pos:"FW",club:"Juventus",age:26,caps:16}
]);

// Argelia
buildExtra("Argelia", [
  {club:"Free",age:38,caps:100},{club:"Free",age:28,caps:15},{club:"Villarreal",age:33,caps:50},
  {club:"Lyon",age:28,caps:30},{club:"Free",age:28,caps:20},{club:"AC Milan",age:27,caps:50},
  {club:"Roma",age:26,caps:15},{club:"Al-Ahli",age:33,caps:95},{club:"Lille",age:27,caps:15},
  {club:"Coritiba",age:36,caps:55},{club:"Al Sadd",age:33,caps:70}
], [
  {name:"A.Zerouki",num:12,pos:"GK",club:"MC Alger",age:30,caps:10},{name:"O.Benbot",num:13,pos:"GK",club:"USMA",age:28,caps:5},
  {name:"M.Darfalou",num:14,pos:"DF",club:"MC Alger",age:27,caps:8},{name:"H.Belkhir",num:15,pos:"DF",club:"CRB",age:26,caps:6},
  {name:"R.Bouchina",num:16,pos:"DF",club:"JS Kabylie",age:25,caps:5},{name:"H.Belaïd",num:17,pos:"MF",club:"MC Alger",age:26,caps:10},
  {name:"A.Benzia",num:18,pos:"MF",club:"Nice",age:28,caps:15},{name:"I.Boulahia",num:19,pos:"FW",club:"CRB",age:25,caps:8},
  {name:"M.Drai",num:20,pos:"FW",club:"USMA",age:27,caps:10},{name:"A.Hannachi",num:21,pos:"FW",club:"MCA",age:24,caps:6},
  {name:"A.Guendouz",num:22,pos:"MF",club:"CRB",age:26,caps:8},{name:"K.Benayada",num:23,pos:"FW",club:"JSK",age:23,caps:4}
]);

// Austria
buildExtra("Austria", [
  {club:"RB Salzburg",age:28,caps:15},{club:"Bologna",age:27,caps:10},{club:"Feyenoord",age:32,caps:15},
  {club:"Freiburg",age:28,caps:20},{club:"Mainz",age:30,caps:12},{club:"Bayern",age:27,caps:40},
  {club:"Dortmund",age:30,caps:85},{club:"RB Salzburg",age:27,caps:20},{club:"RB Leipzig",age:24,caps:15},
  {club:"Inter",age:35,caps:120},{club:"Hartberg",age:27,caps:8}
], [
  {name:"P.Pentz",num:12,pos:"GK",club:"Leverkusen",age:27,caps:5},{name:"N.Hedl",num:13,pos:"GK",club:"Rapid",age:23,caps:3},
  {name:"M.Danso",num:14,pos:"DF",club:"Lens",age:26,caps:15},{name:"S.Lainer",num:15,pos:"DF",club:"Gladbach",age:31,caps:40},
  {name:"D.Adamu",num:16,pos:"DF",club:"Freiburg",age:25,caps:8},{name:"F.Kainz",num:17,pos:"MF",club:"Köln",age:31,caps:20},
  {name:"M.Grüll",num:18,pos:"MF",club:"W.Bremen",age:26,caps:10},{name:"M.Gregoritsch",num:19,pos:"FW",club:"Freiburg",age:30,caps:55},
  {name:"K.Kalim",num:20,pos:"FW",club:"LASK",age:25,caps:8},{name:"M.Demir",num:21,pos:"FW",club:"Rapid",age:22,caps:5},
  {name:"N.Seiwald",num:22,pos:"MF",club:"Leipzig",age:23,caps:10},{name:"A.Schmid",num:23,pos:"MF",club:"W.Bremen",age:25,caps:8}
]);

// Jordania
buildExtra("Jordania", [
  {club:"Al-Faisaly",age:35,caps:30},{club:"Al-Wehdat",age:27,caps:15},{club:"Al-Faisaly",age:28,caps:20},
  {club:"Al-Salt",age:26,caps:10},{club:"Al-Ramtha",age:28,caps:12},{club:"Al-Wehdat",age:27,caps:18},
  {club:"Al-Faisaly",age:25,caps:8},{club:"Montpellier",age:27,caps:25},{club:"Al-Ramtha",age:25,caps:10},
  {club:"Al-Faisaly",age:27,caps:15},{club:"Al-Salt",age:26,caps:8}
], [
  {name:"A.Al-Fakhouri",num:12,pos:"GK",club:"Al-Faisaly",age:30,caps:5},{name:"M.Al-Abd",num:13,pos:"GK",club:"Al-Jazeera",age:27,caps:3},
  {name:"H.Al-Manasrah",num:14,pos:"DF",club:"Al-Wehdat",age:26,caps:8},{name:"O.Hani",num:15,pos:"DF",club:"Al-Faisaly",age:25,caps:6},
  {name:"S.Rateb",num:16,pos:"DF",club:"Al-Ramtha",age:24,caps:5},{name:"A.Mardkhi",num:17,pos:"MF",club:"Al-Wehdat",age:26,caps:10},
  {name:"Y.Abu Jalboush",num:18,pos:"MF",club:"Al-Faisaly",age:25,caps:7},{name:"A.Helal",num:19,pos:"FW",club:"Al-Wehdat",age:27,caps:8},
  {name:"M.Abu Amarah",num:20,pos:"FW",club:"Al-Ramtha",age:24,caps:6},{name:"K.Darwish",num:21,pos:"FW",club:"Al-Salt",age:25,caps:5},
  {name:"A.Sami",num:22,pos:"MF",club:"Al-Faisaly",age:24,caps:6},{name:"Y.Qatay",num:23,pos:"FW",club:"Al-Wehdat",age:23,caps:4}
]);

// Portugal
buildExtra("Portugal", [
  {club:"Porto",age:25,caps:20},{club:"Barcelona",age:30,caps:55},{club:"Man City",age:27,caps:60},
  {club:"Porto",age:42,caps:140},{club:"PSG",age:22,caps:25},{club:"Man Utd",age:30,caps:70},
  {club:"Al-Hilal",age:27,caps:50},{club:"Man City",age:30,caps:85},{club:"Barcelona",age:24,caps:40},
  {club:"Al-Nassr",age:39,caps:215},{club:"AC Milan",age:25,caps:35}
], [
  {name:"J.Sá",num:12,pos:"GK",club:"Wolves",age:32,caps:10},{name:"Rui Silva",num:13,pos:"GK",club:"Betis",age:30,caps:5},
  {name:"G.Inácio",num:14,pos:"DF",club:"Sporting",age:23,caps:10},{name:"N.Otávio",num:15,pos:"DF",club:"Porto",age:27,caps:12},
  {name:"A.Silva",num:16,pos:"DF",club:"Benfica",age:24,caps:8},{name:"M.Nunes",num:17,pos:"MF",club:"Man City",age:26,caps:15},
  {name:"J.Palhinha",num:18,pos:"MF",club:"Fulham",age:29,caps:25},{name:"G.Ramos",num:19,pos:"FW",club:"PSG",age:23,caps:15},
  {name:"R.Silva",num:20,pos:"FW",club:"Benfica",age:26,caps:10},{name:"D.Jota",num:21,pos:"FW",club:"Liverpool",age:28,caps:40},
  {name:"O.Mário",num:22,pos:"MF",club:"Benfica",age:32,caps:60},{name:"F.Otávio",num:23,pos:"MF",club:"Porto",age:28,caps:20}
]);

// RD Congo
buildExtra("RD Congo", [
  {club:"Lens",age:30,caps:15},{club:"Angers",age:26,caps:10},{club:"Nantes",age:28,caps:18},
  {club:"Sochaux",age:27,caps:12},{club:"Marseille",age:32,caps:75},{club:"Marseille",age:26,caps:15},
  {club:"Al-Duhail",age:27,caps:10},{club:"Cercle Brugge",age:28,caps:12},{club:"Galatasaray",age:33,caps:55},
  {club:"Brentford",age:28,caps:20},{club:"St.Etienne",age:30,caps:25}
], [
  {name:"B.Mbemba",num:12,pos:"GK",club:"Lupopo",age:28,caps:5},{name:"L.Diasso",num:13,pos:"GK",club:"TP Mazembe",age:30,caps:4},
  {name:"I.Kabongo",num:14,pos:"DF",club:"TP Mazembe",age:26,caps:8},{name:"R.Nsiala",num:15,pos:"DF",club:"Bastia",age:25,caps:6},
  {name:"D.Mukoko",num:16,pos:"DF",club:"Vita",age:24,caps:5},{name:"M.Tshibangu",num:17,pos:"MF",club:"TP Mazembe",age:26,caps:10},
  {name:"E.Kazadi",num:18,pos:"MF",club:"Lupopo",age:25,caps:7},{name:"J.Bolingi",num:19,pos:"FW",club:"TP Mazembe",age:30,caps:15},
  {name:"M.Lilepo",num:20,pos:"FW",club:"Valenciennes",age:26,caps:8},{name:"C.Mununga",num:21,pos:"FW",club:"Lupopo",age:27,caps:10},
  {name:"N.Mfutila",num:22,pos:"MF",club:"Vita",age:24,caps:6},{name:"B.Malango",num:23,pos:"FW",club:"TP Mazembe",age:24,caps:5}
]);

// Uzbekistán
buildExtra("Uzbekistán", [
  {club:"Pakhtakor",age:30,caps:25},{club:"Pakhtakor",age:27,caps:15},{club:"Pakhtakor",age:29,caps:20},
  {club:"Pakhtakor",age:28,caps:18},{club:"Pakhtakor",age:25,caps:10},{club:"CSKA",age:26,caps:12},
  {club:"Navbahor",age:29,caps:22},{club:"Pakhtakor",age:25,caps:8},{club:"CSKA",age:24,caps:10},
  {club:"Roma",age:29,caps:40},{club:"Pakhtakor",age:26,caps:12}
], [
  {name:"S.Abduraimov",num:12,pos:"GK",club:"Nasaf",age:28,caps:8},{name:"U.Yusupov",num:13,pos:"GK",club:"OKMK",age:26,caps:5},
  {name:"D.Khashimov",num:14,pos:"DF",club:"Navbahor",age:27,caps:10},{name:"A.Abdurakhmanov",num:15,pos:"DF",club:"Pakhtakor",age:25,caps:7},
  {name:"S.Mukhtarov",num:16,pos:"DF",club:"Nasaf",age:24,caps:5},{name:"H.Yakubov",num:17,pos:"MF",club:"Pakhtakor",age:26,caps:8},
  {name:"J.Khabibullaev",num:18,pos:"MF",club:"Nasaf",age:25,caps:6},{name:"B.Sabirov",num:19,pos:"FW",club:"Pakhtakor",age:27,caps:10},
  {name:"S.Sulaymonov",num:20,pos:"FW",club:"Navbahor",age:25,caps:8},{name:"K.Tukhtasinov",num:21,pos:"FW",club:"Nasaf",age:24,caps:6},
  {name:"D.Khamidov",num:22,pos:"MF",club:"OKMK",age:25,caps:7},{name:"M.Rakhimov",num:23,pos:"DF",club:"Pakhtakor",age:26,caps:5}
]);

// Colombia
buildExtra("Colombia", [
  {club:"Atlético Nacional",age:32,caps:25},{club:"Genk",age:27,caps:20},{club:"Galatasaray",age:28,caps:30},
  {club:"Cagliari",age:30,caps:45},{club:"Villarreal",age:27,caps:15},{club:"São Paulo",age:33,caps:100},
  {club:"Al-Sadd",age:30,caps:20},{club:"Cruz Azul",age:28,caps:12},{club:"Liverpool",age:27,caps:50},
  {club:"River",age:29,caps:20},{club:"Flamengo",age:27,caps:15}
], [
  {name:"Á.Moncayo",num:12,pos:"GK",club:"América",age:28,caps:8},{name:"K.Mier",num:13,pos:"GK",club:"Deportes Tolima",age:25,caps:5},
  {name:"S.Lucumí",num:14,pos:"DF",club:"Bologna",age:26,caps:10},{name:"D.Machado",num:15,pos:"DF",club:"Lens",age:26,caps:8},
  {name:"J.Cuesta",num:16,pos:"DF",club:"Genk",age:27,caps:12},{name:"G.Cuéllar",num:17,pos:"MF",club:"Al-Shabab",age:31,caps:25},
  {name:"Y.Herrera",num:18,pos:"MF",club:"Girona",age:26,caps:15},{name:"R.Sinisterra",num:19,pos:"FW",club:"Bournemouth",age:25,caps:12},
  {name:"M.Bacca",num:20,pos:"FW",club:"Junior",age:38,caps:60},{name:"J.Durán",num:21,pos:"FW",club:"Aston Villa",age:21,caps:6},
  {name:"J.Quintero",num:22,pos:"MF",club:"Racing",age:31,caps:35},{name:"D.Muñoz",num:23,pos:"FW",club:"Atl.Nacional",age:27,caps:10}
]);

// Inglaterra
buildExtra("Inglaterra", [
  {club:"Everton",age:30,caps:65},{club:"Man City",age:34,caps:90},{club:"Man City",age:30,caps:75},
  {club:"Man Utd",age:31,caps:65},{club:"Man Utd",age:29,caps:35},{club:"Arsenal",age:25,caps:55},
  {club:"Real Madrid",age:21,caps:35},{club:"Man City",age:24,caps:40},{club:"Arsenal",age:23,caps:35},
  {club:"Bayern",age:31,caps:100},{club:"Man Utd",age:27,caps:55}
], [
  {name:"A.Ramsdale",num:12,pos:"GK",club:"Arsenal",age:26,caps:10},{name:"S.Johnstone",num:13,pos:"GK",club:"C.Palace",age:32,caps:5},
  {name:"J.Gomez",num:14,pos:"DF",club:"Liverpool",age:27,caps:15},{name:"T.Alexander-Arnold",num:15,pos:"DF",club:"Liverpool",age:26,caps:25},
  {name:"M.Guehi",num:16,pos:"DF",club:"C.Palace",age:24,caps:10},{name:"C.Gallagher",num:17,pos:"MF",club:"Chelsea",age:24,caps:15},
  {name:"J.Maddison",num:18,pos:"MF",club:"Tottenham",age:28,caps:20},{name:"J.Grealish",num:19,pos:"FW",club:"Man City",age:29,caps:35},
  {name:"M.Rashford",num:20,pos:"FW",club:"Man Utd",age:27,caps:55},{name:"I.Toney",num:21,pos:"FW",club:"Brentford",age:28,caps:12},
  {name:"C.Palmer",num:22,pos:"MF",club:"Chelsea",age:22,caps:8},{name:"E.Eze",num:23,pos:"FW",club:"C.Palace",age:26,caps:10}
]);

// Croacia
buildExtra("Croacia", [
  {club:"Fenerbahçe",age:30,caps:55},{club:"Bayern",age:24,caps:15},{club:"Man City",age:22,caps:30},
  {club:"Ajax",age:24,caps:12},{club:"Trabzonspor",age:32,caps:35},{club:"Real Madrid",age:39,caps:180},
  {club:"Al-Nassr",age:32,caps:100},{club:"Man City",age:30,caps:110},{club:"Hoffenheim",age:33,caps:95},
  {club:"Dinamo",age:31,caps:40},{club:"Hajduk",age:35,caps:135}
], [
  {name:"I.Ivušić",num:12,pos:"GK",club:"Osijek",age:29,caps:10},{name:"N.Labić",num:13,pos:"GK",club:"Rijeka",age:27,caps:5},
  {name:"M.Erlić",num:14,pos:"DF",club:"Sassuolo",age:26,caps:8},{name:"J.Sutalo",num:15,pos:"DF",club:"Ajax",age:24,caps:10},
  {name:"D.Vida",num:16,pos:"DF",club:"AEK",age:35,caps:105},{name:"L.Majer",num:17,pos:"MF",club:"Wolfsburg",age:26,caps:20},
  {name:"N.Vlašić",num:18,pos:"MF",club:"Torino",age:27,caps:55},{name:"M.Oršić",num:19,pos:"FW",club:"Trabszonspor",age:32,caps:35},
  {name:"J.Brekkalo",num:20,pos:"FW",club:"Dinamo",age:26,caps:12},{name:"M.Baturina",num:21,pos:"FW",club:"Dinamo",age:21,caps:6},
  {name:"L.Ivanušec",num:22,pos:"MF",club:"Feyenoord",age:26,caps:15},{name:"D.Drmić",num:23,pos:"FW",club:"Dinamo",age:33,caps:10}
]);

// Ghana
buildExtra("Ghana", [
  {club:"St.Gallen",age:28,caps:15},{club:"Clermont",age:24,caps:10},{club:"Leicester",age:29,caps:55},
  {club:"Monaco",age:25,caps:12},{club:"Bordeaux",age:29,caps:8},{club:"Arsenal",age:31,caps:50},
  {club:"West Ham",age:24,caps:25},{club:"Hoffenheim",age:24,caps:10},{club:"Le Havre",age:33,caps:120},
  {club:"Free",age:28,caps:20},{club:"Bournemouth",age:25,caps:18}
], [
  {name:"R.Ofori",num:12,pos:"GK",club:"Orlando",age:31,caps:15},{name:"J.Wollacott",num:13,pos:"GK",club:"Hibernian",age:27,caps:5},
  {name:"J.Odoi",num:14,pos:"DF",club:"Club Brugge",age:28,caps:10},{name:"A.Nketiah",num:15,pos:"DF",club:"Arsenal",age:25,caps:8},
  {name:"M.Djiku",num:16,pos:"DF",club:"Strasbourg",age:29,caps:20},{name:"E.Smith",num:17,pos:"MF",club:"Aston Villa",age:25,caps:10},
  {name:"K.Yeboah",num:18,pos:"MF",club:"St.Gallen",age:26,caps:12},{name:"K.Ayew",num:19,pos:"FW",club:"C.Palace",age:31,caps:70},
  {name:"J.Larsson",num:20,pos:"FW",club:"FC Sion",age:27,caps:10},{name:"R.Sulley",num:21,pos:"FW",club:"Genk",age:25,caps:8},
  {name:"D.Apiah",num:22,pos:"MF",club:"OGC Nice",age:25,caps:6},{name:"A.Agyei",num:23,pos:"FW",club:"FC Zürich",age:24,caps:5}
]);

// Panamá
buildExtra("Panamá", [
  {club:"UNAM",age:27,caps:15},{club:"Newells",age:28,caps:10},{club:"Bucaramanga",age:27,caps:8},
  {club:"Cúcuta",age:29,caps:12},{club:"Universitario",age:33,caps:65},{club:"Alianza",age:26,caps:10},
  {club:"Santa Fe",age:28,caps:15},{club:"Houston",age:27,caps:55},{club:"Toluca",age:28,caps:20},
  {club:"Azuquero",age:30,caps:15},{club:"Deportes Tolima",age:27,caps:12}
], [
  {name:"C.Guerra",num:12,pos:"GK",club:"Plaza",age:28,caps:8},{name:"E.Hughes",num:13,pos:"GK",club:"Tauro",age:25,caps:5},
  {name:"J.García",num:14,pos:"DF",club:"Alianza",age:27,caps:6},{name:"O.Valencia",num:15,pos:"DF",club:"Plaza",age:26,caps:8},
  {name:"A.Gil",num:16,pos:"DF",club:"Tauro",age:25,caps:5},{name:"J.Rodríguez",num:17,pos:"MF",club:"Alianza",age:26,caps:10},
  {name:"A.Gudiño",num:18,pos:"MF",club:"Tauro",age:25,caps:7},{name:"J.González",num:19,pos:"FW",club:"Plaza",age:27,caps:8},
  {name:"R.Gil",num:20,pos:"FW",club:"CAI",age:26,caps:6},{name:"J.Navas",num:21,pos:"FW",club:"Tauro",age:25,caps:5},
  {name:"M.Gómez",num:22,pos:"MF",club:"Alianza",age:24,caps:6},{name:"C.Small",num:23,pos:"FW",club:"Plaza",age:23,caps:4}
]);

const expanded = squads.map(s => addPlayerData(s));
fs.writeFileSync(squadsPath, JSON.stringify(expanded, null, 2), 'utf-8');
console.log(`Done! ${expanded.length} teams expanded.`);
