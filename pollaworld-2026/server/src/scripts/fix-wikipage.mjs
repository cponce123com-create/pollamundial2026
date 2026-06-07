#!/usr/bin/env node
/**
 * Fix wikiPage values in squads.json.
 * The original parser captured the first href in each row (position link),
 * instead of the player name link inside th scope=row.
 *
 * This script re-fetches squad data from Wikipedia with correct wikiPage extraction.
 */

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WIKI_API = "https://en.wikipedia.org/w/api.php";
const SQUADS_PATH = path.resolve(__dirname, "../db/squads.json");

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
};

const NAME_MAP = {
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
};

const POS_MAP = { "1": "GK", "2": "DF", "3": "MF", "4": "FW" };

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log("Fixing wikiPage values...");
  
  const existing = JSON.parse(fs.readFileSync(SQUADS_PATH, "utf-8"));
  const entries = Object.entries(SECTIONS);
  let fixed = 0;

  for (const [englishName, sectionIdx] of entries) {
    const spanishName = NAME_MAP[englishName];
    const teamEntry = existing.find(t => t.team === spanishName);
    if (!teamEntry) continue;

    // Check if most wikiPages are position names (e.g. "Goalkeeper_(association_football)")
    const badPages = teamEntry.players.filter(p => p.wikiPage && p.wikiPage.includes("_(")).length;
    if (badPages < teamEntry.players.length * 0.5) {
      console.log(`${spanishName}: ${badPages}/${teamEntry.players.length} bad pages, skipping`);
      continue;
    }

    console.log(`${spanishName}: fetching correct wikiPages...`);
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const url = `${WIKI_API}?action=parse&page=2026_FIFA_World_Cup_squads&prop=text&section=${sectionIdx}&format=json`;
        const res = await fetch(url, { headers: { "User-Agent": "Pollamundial2026/1.0" } });
        if (res.status === 429) {
          await delay(10000 * attempt);
          continue;
        }
        const data = await res.json();
        const html = data.parse.text["*"];
        
        // Extract all th scope=row cells with their player links
        const rows = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || [];
        let playerIdx = 0;
        
        for (const row of rows) {
          if (row.match(/^<tr[^>]*>\s*<th[^>]*>/)) continue;
          const cells = row.match(/<td[^>]*>[\s\S]*?<\/td>/g);
          if (!cells || cells.length < 4) continue;
          
          // Player link from th scope=row
          const pageMatch = row.match(/<th[^>]*scope="row"[^>]*>[\s\S]*?href="\/wiki\/([^"]+)"/);
          if (!pageMatch || !teamEntry.players[playerIdx]) { playerIdx++; continue; }
          
          const correctPage = decodeURIComponent(pageMatch[1]);
          const currentPlayer = teamEntry.players[playerIdx];
          
          if (currentPlayer.wikiPage !== correctPage) {
            currentPlayer.wikiPage = correctPage;
            fixed++;
          }
          playerIdx++;
        }
        break;
      } catch (err) {
        if (attempt === 3) console.log(`  Failed: ${err.message}`);
        await delay(5000);
      }
    }
    
    await delay(1500);
  }

  fs.writeFileSync(SQUADS_PATH, JSON.stringify(existing, null, 2), "utf-8");
  console.log(`
Fixed ${fixed} wikiPages, saved to squads.json`);
}

main().catch(console.error);
