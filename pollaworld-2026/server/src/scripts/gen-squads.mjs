import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const path = join(__dirname, '../db/squads.json');
const raw = JSON.parse(readFileSync(path, 'utf-8'));

const meta = {
  "México":{fifaRank:12,nickname:"El Tri",bestWC:"Cuartos (1970, 1986)",stadium:"Estadio Azteca"},
  "Sudáfrica":{fifaRank:60,nickname:"Bafana Bafana",bestWC:"Fase grupos",stadium:"Soccer City"},
  "Corea del Sur":{fifaRank:23,nickname:"Tigres Asiáticos",bestWC:"4° lugar (2002)",stadium:"Seoul World Cup"},
  "República Checa":{fifaRank:40,nickname:"Lokomotiva",bestWC:"Subcampeón (1934)",stadium:"Eden Arena"},
  "Canadá":{fifaRank:45,nickname:"Canucks",bestWC:"Fase grupos",stadium:"BMO Field"},
  "Bosnia y Herzegovina":{fifaRank:55,nickname:"Zmajevi",bestWC:"Fase grupos",stadium:"Bilino Polje"},
  "Catar":{fifaRank:56,nickname:"Al-Annabi",bestWC:"Fase grupos (2022)",stadium:"Lusail"},
  "Suiza":{fifaRank:15,nickname:"Helvecia",bestWC:"Cuartos (1954)",stadium:"Stade de Suisse"},
  "Brasil":{fifaRank:1,nickname:"Canarinha",bestWC:"Pentacampeón",stadium:"Maracanã"},
  "Marruecos":{fifaRank:13,nickname:"Leones del Atlas",bestWC:"Semifinal (2022)",stadium:"Ibn Batouta"},
  "Haití":{fifaRank:80,nickname:"Grenadiers",bestWC:"Fase grupos",stadium:"Sylvio Cator"},
  "Escocia":{fifaRank:34,nickname:"Tartan Army",bestWC:"Fase grupos",stadium:"Hampden Park"},
  "Estados Unidos":{fifaRank:11,nickname:"Stars & Stripes",bestWC:"3° (1930)",stadium:"Mercedes-Benz Stadium"},
  "Paraguay":{fifaRank:42,nickname:"Guaraníes",bestWC:"Cuartos (2010)",stadium:"Defensores del Chaco"},
  "Australia":{fifaRank:24,nickname:"Socceroos",bestWC:"Octavos (2006, 2022)",stadium:"ANZ Stadium"},
  "Turquía":{fifaRank:38,nickname:"Crescent-Stars",bestWC:"3° (2002)",stadium:"Atatürk Olympic"},
  "Alemania":{fifaRank:3,nickname:"Die Mannschaft",bestWC:"Cuatro veces campeón",stadium:"Olympiastadion"},
  "Curazao":{fifaRank:86,nickname:"Los Azules",bestWC:"No clasificado",stadium:"Ergilio Hato"},
  "Costa de Marfil":{fifaRank:44,nickname:"Los Elefantes",bestWC:"Fase grupos",stadium:"Alassane Ouattara"},
  "Ecuador":{fifaRank:31,nickname:"La Tri",bestWC:"Octavos (2006, 2022)",stadium:"Rodrigo Paz"},
  "Países Bajos":{fifaRank:7,nickname:"Oranje",bestWC:"Subcampeón (1974, 2010)",stadium:"Johan Cruyff Arena"},
  "Japón":{fifaRank:18,nickname:"Samurai Blue",bestWC:"Octavos (2002, 2018, 2022)",stadium:"Saitama"},
  "Suecia":{fifaRank:25,nickname:"Blågult",bestWC:"Subcampeón (1958)",stadium:"Friends Arena"},
  "Túnez":{fifaRank:30,nickname:"Águilas de Cartago",bestWC:"Fase grupos",stadium:"Olímpico Radès"},
  "Bélgica":{fifaRank:6,nickname:"Red Devils",bestWC:"3° (2018)",stadium:"Rey Balduino"},
  "Egipto":{fifaRank:36,nickname:"Faraones",bestWC:"Segunda ronda (1934)",stadium:"Borg El Arab"},
  "Irán":{fifaRank:21,nickname:"Estrellas de Persia",bestWC:"Fase grupos",stadium:"Azadi"},
  "Nueva Zelanda":{fifaRank:104,nickname:"All Whites",bestWC:"Fase grupos (2010)",stadium:"Eden Park"},
  "España":{fifaRank:8,nickname:"La Roja",bestWC:"Campeón (2010)",stadium:"La Cartuja"},
  "Cabo Verde":{fifaRank:71,nickname:"Tubarões Azuis",bestWC:"Octavos (2022)",stadium:"Nacional de Cabo Verde"},
  "Arabia Saudita":{fifaRank:53,nickname:"Halcones Verdes",bestWC:"Octavos (1994)",stadium:"King Abdullah"},
  "Uruguay":{fifaRank:16,nickname:"La Celeste",bestWC:"Campeón (1930, 1950)",stadium:"Centenario"},
  "Francia":{fifaRank:2,nickname:"Les Bleus",bestWC:"Bicampeón (1998, 2018)",stadium:"Stade de France"},
  "Senegal":{fifaRank:20,nickname:"Leones de Teranga",bestWC:"Cuartos (2002)",stadium:"Abdoulaye Wade"},
  "Irak":{fifaRank:68,nickname:"Leones de Mesopotamia",bestWC:"4° (2006)",stadium:"Basra"},
  "Noruega":{fifaRank:44,nickname:"Vikings",bestWC:"Octavos (1998)",stadium:"Ullevaal"},
  "Argentina":{fifaRank:5,nickname:"Albiceleste",bestWC:"Tricampeón (2022)",stadium:"Monumental"},
  "Argelia":{fifaRank:29,nickname:"Zorro del Desierto",bestWC:"Octavos (2014)",stadium:"Mustapha Tchaker"},
  "Austria":{fifaRank:25,nickname:"Das Team",bestWC:"3° (1954)",stadium:"Ernst Happel"},
  "Jordania":{fifaRank:70,nickname:"Al-Nashama",bestWC:"Final (Asian Cup 2023)",stadium:"Amman"},
  "Portugal":{fifaRank:9,nickname:"Selecção",bestWC:"3° (1966)",stadium:"Estádio da Luz"},
  "RD Congo":{fifaRank:62,nickname:"Leopardos",bestWC:"Fase grupos (1974)",stadium:"Stade des Martyrs"},
  "Uzbekistán":{fifaRank:74,nickname:"Leones Blancos",bestWC:"Fase grupos",stadium:"Bunyodkor"},
  "Colombia":{fifaRank:14,nickname:"Los Cafeteros",bestWC:"Cuartos (2014)",stadium:"Metropolitano"},
  "Inglaterra":{fifaRank:4,nickname:"Three Lions",bestWC:"Campeón (1966)",stadium:"Wembley"},
  "Croacia":{fifaRank:10,nickname:"Vatreni",bestWC:"Subcampeón (2018)",stadium:"Maksimir"},
  "Ghana":{fifaRank:61,nickname:"Estrellas Negras",bestWC:"Cuartos (2010)",stadium:"Accra Sports"},
  "Panamá":{fifaRank:55,nickname:"Canaleros",bestWC:"Octavos (2018)",stadium:"Rommel Fernández"}
};

const data = {};
function set(t, existing, extra) { data[t] = {existing, extra}; }

// Simply read the original JSON and add metadata + extra players
// The metadata and extra player data is loaded from the data object above

set("México", [
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

set("Sudáfrica", [
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

set("Corea del Sur", [
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

set("República Checa", [
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

// Build the result
const out = raw.map(s => {
  const m = meta[s.team];
  if (!m) throw new Error('No meta: ' + s.team);
  const d = data[s.team];
  if (!d) throw new Error('No data: ' + s.team);
  const existing = s.players.map((p, i) => {
    const e = (d.existing[i] || {club:'?', age:25, caps:0});
    return {...p, club: e.club, age: e.age, caps: e.caps};
  });
  return {...s, ...m, players: [...existing, ...d.extra]};
});

writeFileSync(path, JSON.stringify(out, null, 2));
console.log('Done:', out.length, 'teams');

set("Canadá", [
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

set("Bosnia y Herzegovina", [
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

set("Catar", [
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

set("Suiza", [
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

set("Brasil", [
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
