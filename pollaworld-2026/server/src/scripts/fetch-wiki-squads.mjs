#!/usr/bin/env node
/**
 * Fetch real 2026 World Cup squads from Wikipedia
 * Runs in two phases:
 *   Phase 1: Fetch squad text data (no images) - 48 teams
 *   Phase 2: Fetch player images from Wikipedia and upload to Cloudinary
 *
 * Usage:
 *   node src/scripts/fetch-wiki-squads.mjs          # Phase 1 only
 *   node src/scripts/fetch-wiki-squads.mjs images    # Phase 2 (images)
 */import { createRequire } from "module";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);const require = createRequire(import.meta.url);
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});const WIKI_API = "https://en.wikipedia.org/w/api.php";
const SQUADS_PATH = path.resolve(__dirname, "../db/squads.json");// Section index per team on the Wikipedia page
const SECTIONS = {
  "Czech Republic": 2, "Mexico": 3, "South Africa": 4, "South Korea": 5,
  "Bosnia and Herzegovina": 7, "Canada": 8, "Qatar": 9, "Switzerland": 10,
  "Brazil": 12, "Haiti": 13, "Morocco": 14, "Scotland": 15,
  "Australia": 17, "Paraguay": 18, "Turkey": 19, "United States": 20,
  "Curacao": 22, "Ecuador": 23, "Germany": 24, "Ivory Coast": 25,
  "Japan": 27, "Netherlands": 28, "Sweden": 29, "Tunisia": 30,
  "Belgium": 32, "Egypt": 33, "Iran": 34, "New Zealand": 35,
  "Cape Verde": 37, "Saudi Arabia": 38, "Spain": 39, "Uruguay": 40,
  "France": 42, "Iraq": 43, "Norway": 44, "Senegal": 45,
  "Argentina": 47, "Algeria": 48, "Austria": 49, "Jordan": 50,
  "Colombia": 52, "Portugal": 53, "Congo DR": 54, "Uzbekistan": 55,
  "Croatia": 57, "England": 58, "Ghana": 59, "Panama": 60,
};const NAME_MAP = {
  "Czech Republic": "Rep\u00fablica Checa", "Mexico": "M\u00e9xico",
  "South Africa": "Sud\u00e1frica", "South Korea": "Corea del Sur",
  "Bosnia and Herzegovina": "Bosnia y Herzegovina", "Canada": "Canad\u00e1",
  "Qatar": "Catar", "Switzerland": "Suiza", "Brazil": "Brasil",
  "Haiti": "Hait\u00ed", "Morocco": "Marruecos", "Scotland": "Escocia",
  "Australia": "Australia", "Paraguay": "Paraguay", "Turkey": "Turqu\u00eda",
  "United States": "Estados Unidos", "Curacao": "Curazao",
  "Ecuador": "Ecuador", "Germany": "Alemania", "Ivory Coast": "Costa de Marfil",
  "Japan": "Jap\u00f3n", "Netherlands": "Pa\u00edses Bajos", "Sweden": "Suecia",
  "Tunisia": "T\u00fanez", "Belgium": "B\u00e9lgica", "Egypt": "Egipto",
  "Iran": "Ir\u00e1n", "New Zealand": "Nueva Zelanda", "Cape Verde": "Cabo Verde",
  "Saudi Arabia": "Arabia Saudita", "Spain": "Espa\u00f1a", "Uruguay": "Uruguay",
  "France": "Francia", "Iraq": "Irak", "Norway": "Noruega",
  "Senegal": "Senegal", "Argentina": "Argentina", "Algeria": "Argelia",
  "Austria": "Austria", "Jordan": "Jordania", "Colombia": "Colombia",
  "Portugal": "Portugal", "Congo DR": "RD Congo", "Uzbekistan": "Uzbekist\u00e1n",
  "Croatia": "Croacia", "England": "Inglaterra", "Ghana": "Ghana",
  "Panama": "Panam\u00e1",
};const POS_MAP = { "1": "GK", "2": "DF", "3": "MF", "4": "FW" };function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}// Fetch a Wikipedia section with retries
async function fetchSection(sectionIdx, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const url = `${WIKI_API}?action=parse&page=2026_FIFA_World_Cup_squads&prop=text&section=${sectionIdx}&format=json`;
      const res = await fetch(url, { headers: { "User-Agent": "Pollamundial2026/1.0" } });
      if (res.status === 429 && attempt < retries) {
        const wait = 5000 * attempt;
        console.log(`  Rate limited, waiting ${wait}ms...`);
        await delay(wait);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status} for section ${sectionIdx}`);
      return await res.json();
    } catch (err) {
      if (attempt === retries) throw err;
      await delay(2000 * attempt);
    }
  }
}// Parse player rows from Wikipedia HTML
function parsePlayers(html) {
  const rows = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || [];
  const players = [];
  let coach = "";  // Extract coach
  const coachMatch = html.match(/Coach:.*?<a[^>]*>([^<]+)<\/a>/);
  if (coachMatch) coach = coachMatch[1].trim();  for (const row of rows) {
    // Skip ONLY the header row (all <th> cells), NOT player rows (<th scope="row">)
    if (row.match(/^<tr[^>]*>\s*<th[^>]*>/)) continue;
    if (row.match(/<th[^>]*colspan/)) continue;
    const cells = row.match(/<td[^>]*>[\s\S]*?<\/td>/g);
    if (!cells || cells.length < 4) continue;    const num = parseInt(cells[0].replace(/<[^>]+>/g, "").trim(), 10);
    const posCode = cells[1].replace(/<[^>]+>/g, "").trim();
    const pos = POS_MAP[posCode] || posCode;    // Player name from th scope=row
    const nameMatch = row.match(/<th[^>]*scope="row"[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/);
    if (!nameMatch) continue;
    const name = nameMatch[1].trim();    // Wikipedia page title
    const pageMatch = row.match(/href="\/wiki\/([^"]+)"/);
    const wikiPage = pageMatch ? decodeURIComponent(pageMatch[1]) : "";    // Club (last td)
    const clubHtml = cells[cells.length - 1];
    const clubMatch = clubHtml.match(/<a[^>]*>([^<]+)<\/a>/);
    const club = clubMatch ? clubMatch[1].trim() : "?";    // Extract caps (second-to-last td value or check the actual structure)
    const capsText = cells.length >= 5 ? cells[3].replace(/<[^>]+>/g, "").trim() : "0";
    const caps = parseInt(capsText, 10) || 0;    // Age from date cell
    const ageText = cells[2] ? cells[2].replace(/<[^>]+>/g, "").trim() : "";
    const ageMatch = ageText.match(/aged\s+(\d+)/i);
    const age = ageMatch ? parseInt(ageMatch[1], 10) : 25;    players.push({ name, num, pos, club, age, caps, wikiPage });
  }
  return { coach, players };
}// Phase 1: Fetch all squad data
async function phase1() {
  console.log("=== PHASE 1: Fetching squad data ===");  // Load existing static metadata (formation, nicknames etc)
  let existingMeta = {};
  try {
    existingMeta = JSON.parse(fs.readFileSync(SQUADS_PATH, "utf-8"));
    console.log(`Loaded ${existingMeta.length} existing teams for metadata`);
  } catch { console.log("No existing squads.json, starting fresh"); }  const result = [];
  const entries = Object.entries(SECTIONS);  for (const [englishName, sectionIdx] of entries) {
    const spanishName = NAME_MAP[englishName];
    console.log(`[${sectionIdx}] ${englishName} -> ${spanishName}`);    try {
      const data = await fetchSection(sectionIdx);
      const html = data.parse.text["*"];
      const { coach, players } = parsePlayers(html);      // Merge with existing metadata if available
      const existing = Array.isArray(existingMeta) ? existingMeta.find(t => t.team === spanishName) : null;
      if (existing) console.log(`  Coach: ${coach} | Players: ${players.length}`);      result.push({
        team: spanishName,
        coach: coach || existing?.coach || "",
        formation: existing?.formation || "4-3-3",
        fifaRank: existing?.fifaRank || null,
        nickname: existing?.nickname || "",
        bestWC: existing?.bestWC || "",
        stadium: existing?.stadium || "",
        confederation: existing?.confederation || "",
        worldCupTitles: existing?.worldCupTitles || 0,
        worldCupApps: existing?.worldCupApps || 0,
        players,
      });
    } catch (err) {
      console.log(`  FAILED: ${err.message}`);
      // Keep existing data if available
      if (Array.isArray(existingMeta)) {
        const existing = existingMeta.find(t => t.team === spanishName);
        if (existing) result.push(existing);
      }
    }    // Delay between sections to avoid rate limiting
    await delay(1500);
  }  console.log(`=== Writing ${result.length} teams to squads.json ===`);
  fs.writeFileSync(SQUADS_PATH, JSON.stringify(result, null, 2), "utf-8");  let totalPlayers = 0;
  for (const t of result) totalPlayers += t.players.length;
  console.log(`Saved: ${result.length} teams, ${totalPlayers} players`);
  return result;
}// Phase 2: Fetch player images and upload to Cloudinary
async function phase2() {
  console.log("=== PHASE 2: Fetching player images ===");  const squads = JSON.parse(fs.readFileSync(SQUADS_PATH, "utf-8"));
  let totalUploaded = 0;
  let totalSkipped = 0;  for (let ti = 0; ti < squads.length; ti++) {
    const team = squads[ti];
    let teamUploaded = 0;    for (let pi = 0; pi < team.players.length; pi++) {
      const player = team.players[pi];
      if (player.image || !player.wikiPage) {
        totalSkipped++;
        continue;
      }      try {
        // Get Wikipedia page image via API
        const imgUrl = `${WIKI_API}?action=query&titles=${encodeURIComponent(player.wikiPage)}&prop=pageimages&format=json&pithumbsize=120`;
        const res = await fetch(imgUrl, { headers: { "User-Agent": "Pollamundial2026/1.0" } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const pages = data.query?.pages || {};
        const page = Object.values(pages)[0];
        const thumbUrl = page?.thumbnail?.source;        if (!thumbUrl) {
          totalSkipped++;
          continue;
        }        // Download and upload to Cloudinary
        const imgRes = await fetch(thumbUrl);
        if (!imgRes.ok) throw new Error(`Image download failed: HTTP ${imgRes.status}`);
        const buffer = Buffer.from(await imgRes.arrayBuffer());        const slug = `${team.team.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${player.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "pollaworld/squads", public_id: slug, width: 80, height: 80, crop: "thumb", gravity: "face", format: "jpg", quality: "auto:best" },
            (err, result) => err ? reject(err) : resolve(result)
          );
          stream.end(buffer);
        });        player.image = uploadResult.secure_url.replace("/upload/", "/upload/f_auto,q_auto,w_80,h_80,c_fill,g_face,e_improve/");
        teamUploaded++;
        totalUploaded++;
        console.log(`  ${team.team} #${player.num} ${player.name} -> image OK`);
      } catch (err) {
        totalSkipped++;
        console.log(`  ${team.team} #${player.num} ${player.name} -> ${err.message?.slice(0, 60)}`);
      }      // Delay between image fetches
      await delay(500);
    }    console.log(`  [${ti + 1}/${squads.length}] ${team.team}: ${teamUploaded} images`);
    await delay(1000);    // Save progress after each team
    squads[ti] = team;
    fs.writeFileSync(SQUADS_PATH, JSON.stringify(squads, null, 2), "utf-8");
  }  console.log(`=== Done: ${totalUploaded} uploaded, ${totalSkipped} skipped ===`);
}// Main
const runImages = process.argv[2] === "images";
if (runImages) {
  phase2().catch(console.error);
} else {
  phase1().catch(console.error);
}
