#!/usr/bin/env node
/**
 * Phase 2 - Fetch player images from Wikipedia and upload to Cloudinary
 *
 * Uses batch Wikipedia API calls (up to 50 players per call) to minimize rate limits.
 * Retries with exponential backoff on 429.
 * Saves progress after each team.
 *
 * Usage: node src/scripts/fetch-player-images.mjs
 */

import { createRequire } from "module";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url);
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const WIKI_API = "https://en.wikipedia.org/w/api.php";
const SQUADS_PATH = path.resolve(__dirname, "../db/squads.json");
const WIKI_THUMB = "https://upload.wikimedia.org/wikipedia/commons/thumb";

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function batchFetchImages(pageTitles) {
  // Batch up to 50 titles per call
  const results = {};
  for (let i = 0; i < pageTitles.length; i += 50) {
    const batch = pageTitles.slice(i, i + 50);
    const url = `${WIKI_API}?action=query&titles=${encodeURIComponent(batch.join("|"))}&prop=pageimages&format=json&pithumbsize=120`;
    
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const res = await fetch(url, { headers: { "User-Agent": "Pollamundial2026/1.0 SquadFetcher" } });
        if (res.status === 429) {
          const wait = Math.min(10000 * attempt, 60000);
          console.log(`  Rate limited, retry ${attempt}/5 in ${Math.round(wait/1000)}s`);
          await delay(wait);
          continue;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const pages = data.query?.pages || {};
        for (const id of Object.keys(pages)) {
          const page = pages[id];
          if (page.thumbnail?.source) {
            results[page.title] = page.thumbnail.source;
          }
        }
        break;
      } catch (err) {
        if (attempt === 5) console.log(`  Batch failed after 5 retries: ${err.message}`);
        await delay(5000 * attempt);
      }
    }
  }
  return results;
}

async function downloadWithRetry(url) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "Pollamundial2026/1.0" } });
      if (res.status === 429) {
        await delay(15000 * attempt);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      if (attempt === 3) throw err;
      await delay(5000 * attempt);
    }
  }
}

async function main() {
  console.log("=== Phase 2: Fetch player images ===");

  const squads = JSON.parse(fs.readFileSync(SQUADS_PATH, "utf-8"));
  let totalUploaded = 0;

  for (let ti = 0; ti < squads.length; ti++) {
    const team = squads[ti];
    const needImages = team.players.filter(p => !p.image && p.wikiPage);
    
    if (needImages.length === 0) {
      const have = team.players.filter(p => p.image).length;
      console.log(`[${ti + 1}/${squads.length}] ${team.team}: ${have}/${team.players.length} already have images, skipping`);
      continue;
    }

    console.log(`[${ti + 1}/${squads.length}] ${team.team}: fetching ${needImages.length} images...`);

    // Step 1: Batch-fetch Wikipedia thumbnails
    const thumbMap = await batchFetchImages(needImages.map(p => p.wikiPage));
    console.log(`  Found ${Object.keys(thumbMap).length} thumbnails`);

    // Step 2: Download and upload to Cloudinary
    let teamUploaded = 0;
    for (const player of needImages) {
      // Try exact match first, then try normalized title
      let thumbUrl = thumbMap[player.wikiPage];
      if (!thumbUrl) {
        // Try fuzzy match - some Wikipedia pages have slightly different titles
        for (const [title, url] of Object.entries(thumbMap)) {
          if (title.toLowerCase().includes(player.name.toLowerCase().split(" ")[0].toLowerCase())) {
            thumbUrl = url;
            break;
          }
        }
      }

      if (!thumbUrl) {
        continue;
      }

      try {
        const buffer = await downloadWithRetry(thumbUrl);
        const slug = `${team.team.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${player.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
        
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "pollaworld/squads", public_id: slug, width: 80, height: 80, crop: "thumb", gravity: "face", format: "jpg", quality: "auto:best" },
            (err, result) => err ? reject(err) : resolve(result)
          );
          stream.end(buffer);
        });

        player.image = uploadResult.secure_url.replace("/upload/", "/upload/f_auto,q_auto,w_80,h_80,c_fill,g_face,e_improve/");
        teamUploaded++;
        totalUploaded++;
        process.stdout.write(".");
      } catch (err) {
        process.stdout.write("x");
      }

      await delay(2000);
    }

    console.log(` ${teamUploaded} uploaded`);
    
    // Save progress
    squads[ti] = team;
    fs.writeFileSync(SQUADS_PATH, JSON.stringify(squads, null, 2), "utf-8");
    
    await delay(3000);
  }

  const totalWithImages = squads.reduce((sum, t) => sum + t.players.filter(p => p.image).length, 0);
  const totalPlayers = squads.reduce((sum, t) => sum + t.players.length, 0);
  console.log(`
=== Done: ${totalUploaded} new, ${totalWithImages}/${totalPlayers} total with images ===`);
}

main().catch(console.error);
