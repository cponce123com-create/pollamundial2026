#!/usr/bin/env node
/**
 * Optimiza equipos: formaciones e imágenes de estadios
 * - Normaliza formaciones (descriptivas → 4-3-3, multi-formato → primera)
 * - Agrega stadiumImage desde Wikipedia → Cloudinary
 */

import { createRequire } from "module";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

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

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Mapeo: nombre del estadio en squads.json -> título de página en Wikipedia (EN)
 */
const STADIUM_WIKI_MAP = {
  "Estadio Eden": "Fortuna Arena",
  "Estadio Azteca": "Estadio Azteca",
  "Estadio Soccer City": "FNB Stadium",
  "Estadio Mundialista": "Seoul World Cup Stadium",
  "Estadio Grbavica": "Grbavica Stadium",
  "BMO Field": "BMO Field",
  "Estadio Khalifa": "Khalifa International Stadium",
  "St. Jakob-Park": "St. Jakob-Park",
  "Estadio Maracan\u00e1": "Maracan\u00e3 Stadium",
  "Estadio Sylvio Cator": "Stade Sylvio Cator",
  "Estadio Pr\u00edncipe Moulay": "Prince Moulay Abdellah Stadium",
  "Hampden Park": "Hampden Park",
  "Stadium Australia": "Stadium Australia",
  "Estadio Defensores del Chaco": "Estadio Defensores del Chaco",
  "Estadio Ol\u00edmpico Atat\u00fcrk": "Atat\u00fcrk Olympic Stadium",
  "Mercedes-Benz Stadium": "Mercedes-Benz Stadium",
  "Estadio Ergilio Hato": "Ergilio Hato Stadium",
  "Estadio Rodrigo Paz": "Estadio Rodrigo Paz Delgado",
  "Estadio Ol\u00edmpico de Berl\u00edn": "Olympiastadion Berlin",
  "Estadio Ol\u00edmpico": "Stade Olympique de Rad\u00e8s",
  "Estadio Nissan": "Nissan Stadium (Yokohama)",
  "Johan Cruijff ArenA": "Johan Cruijff Arena",
  "Friends Arena": "Friends Arena",
  "Estadio Rey Balduino": "King Baudouin Stadium",
  "Estadio Internacional El Cairo": "Cairo International Stadium",
  "Estadio Azadi": "Azadi Stadium",
  "Eden Park": "Eden Park",
  "Est\u00e1dio Nacional": "Est\u00e1dio Nacional de Cabo Verde",
  "Estadio Rey Fahd": "King Fahd International Stadium",
  "Estadio La Cartuja": "Estadio La Cartuja",
  "Estadio Centenario": "Estadio Centenario",
  "Stade de France": "Stade de France",
  "Estadio Internacional Basra": "Basra International Stadium",
  "Ullevaal Stadion": "Ullevaal Stadion",
  "Estadio Abdoulaye Wade": "Stade Abdoulaye Wade",
  "Estadio Monumental": "Estadio Monumental Antonio Vespucio Liberti",
  "Estadio Nelson Mandela": "Stade Nelson Mandela",
  "Ernst-Happel-Stadion": "Ernst-Happel-Stadion",
  "Estadio Rey Abdullah": "King Abdullah II Stadium",
  "Estadio Metropolitano": "Estadio Metropolitano Roberto Mel\u00e9ndez",
  "Est\u00e1dio da Luz": "Est\u00e1dio da Luz",
  "Estadio de los M\u00e1rtires": "Stade des Martyrs",
  "Estadio Pakhtakor": "Pakhtakor Central Stadium",
  "Estadio Maksimir": "Stadion Maksimir",
  "Wembley Stadium": "Wembley Stadium",
  "Estadio Baba Yara": "Baba Yara Stadium",
  "Estadio Rommel Fern\u00e1ndez": "Estadio Rommel Fern\u00e1ndez",
};

/**
 * Mapeo especial para "Estadio Ol\u00edmpico" que aparece 2 veces
 * Costa de Marfil = \u00edndice 19, T\u00fanez = \u00edndice 23
 */
const SPECIAL_OLIMPICO = {
  19: "Stade F\u00e9lix Houphou\u00ebt-Boigny",
  23: "Stade Olympique de Rad\u00e8s",
};

function normalizeFormation(formation) {
  if (!formation) return "4-3-3";
  const f = formation.trim().toLowerCase();
  const descriptive = ["variable", "ataque"];
  if (descriptive.some((d) => f.includes(d))) return "4-3-3";
  if (f.includes("/")) {
    const parts = formation.split("/").map((p) => p.trim());
    const first = parts[0];
    if (/^\d+(-\d+)+$/.test(first)) return first;
    return "4-3-3";
  }
  if (/^\d+(-\d+)+$/.test(f)) return formation;
  return "4-3-3";
}

async function fetchStadiumImage(wikiTitle) {
  const url = `${WIKI_API}?action=query&titles=${encodeURIComponent(wikiTitle)}&prop=pageimages&format=json&pithumbsize=600`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Pollamundial2026/1.0 (football app; pollamundial@example.com)",
        },
      });
      if (res.status === 429) {
        await delay(Math.min(30000 * attempt, 120000));
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const pages = data.query?.pages || {};
      const page = Object.values(pages)[0];
      return page?.thumbnail?.source || null;
    } catch (err) {
      if (attempt === 3) {
        console.log(`  Wiki error: ${err.message}`);
        return null;
      }
      await delay(10000 * attempt);
    }
  }
  return null;
}

function fetchWithCurl(url) {
  try {
    return execSync(`curl -s -L -f -m 15 "${url}"`, {
      encoding: "buffer",
      maxBuffer: 10 * 1024 * 1024,
      timeout: 20000,
    });
  } catch {
    return null;
  }
}

async function uploadToCloudinary(imageUrl, stadiumSlug) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const buffer = fetchWithCurl(imageUrl);
      if (!buffer || buffer.length < 100) throw new Error("Download failed");
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "pollaworld/stadiums", public_id: stadiumSlug, width: 600, crop: "scale", format: "jpg", quality: "auto:best" },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(buffer);
      });
      return result.secure_url.replace("/upload/", "/upload/f_auto,q_auto,w_600/");
    } catch (err) {
      if (attempt === 3) {
        console.log(`  Upload error: ${err.message}`);
        return null;
      }
      await delay(5000 * attempt);
    }
  }
  return null;
}

async function main() {
  console.log("=== Optimizaci\u00f3n de equipos: estadios y formaciones ===");

  const squads = JSON.parse(fs.readFileSync(SQUADS_PATH, "utf-8"));
  let formationChanges = 0;
  let stadiumImagesAdded = 0;
  let stadiumImagesSkipped = 0;

  for (let i = 0; i < squads.length; i++) {
    const team = squads[i];

    // --- 1. Normalizar formaci\u00f3n ---
    const originalFormation = team.formation;
    const newFormation = normalizeFormation(team.formation);
    if (originalFormation !== newFormation) {
      console.log(`[${i + 1}/${squads.length}] ${team.team}: form '${originalFormation}' -> '${newFormation}'`);
      team.formation = newFormation;
      formationChanges++;
    }

    // --- 2. Imagen del estadio ---
    const stadiumName = team.stadium;
    if (!stadiumName) {
      console.log(`[${i + 1}/${squads.length}] ${team.team}: sin stadium, saltando`);
      continue;
    }

    const wikiTitle = SPECIAL_OLIMPICO[i] || STADIUM_WIKI_MAP[stadiumName] || stadiumName;
    console.log(`[${i + 1}/${squads.length}] ${team.team}: buscando '${wikiTitle}'...`);

    const thumbUrl = await fetchStadiumImage(wikiTitle);
    if (!thumbUrl) {
      console.log(`  Sin imagen en Wikipedia para '${wikiTitle}'`);
      stadiumImagesSkipped++;
      continue;
    }

    const stadiumSlug = team.team.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const cloudinaryUrl = await uploadToCloudinary(thumbUrl, stadiumSlug);

    if (cloudinaryUrl) {
      team.stadiumImage = cloudinaryUrl;
      stadiumImagesAdded++;
      console.log(`  OK imagen subida: ${cloudinaryUrl.substring(0, 60)}...`);
    } else {
      stadiumImagesSkipped++;
    }

    await delay(3000);
  }

  fs.writeFileSync(SQUADS_PATH, JSON.stringify(squads, null, 2), "utf-8");
  console.log(`
=== Resumen ===`);
  console.log(`Formaciones normalizadas: ${formationChanges}`);
  console.log(`Imagenes de estadio anadidas: ${stadiumImagesAdded}`);
  console.log(`Estadios sin imagen: ${stadiumImagesSkipped}`);
  console.log(`Archivo guardado: ${SQUADS_PATH}`);
}

main().catch(console.error);
