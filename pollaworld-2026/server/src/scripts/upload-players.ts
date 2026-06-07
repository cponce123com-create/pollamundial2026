import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error("Cloudinary no configurado. Revisa tus variables de entorno.");
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const IMAGES_DIR = path.resolve(__dirname, "../../client/public/players");
const PLAYERS_TS_PATH = path.resolve(__dirname, "../../client/src/lib/players.ts");

async function main() {
  console.log("Subiendo imagenes de jugadores a Cloudinary...");

  const files = fs.readdirSync(IMAGES_DIR).filter(f => f.endsWith(".jpg"));
  console.log(`Encontradas ${files.length} imagenes`);

  const uploaded: { slug: string; url: string }[] = [];

  for (const file of files) {
    const slug = file.replace(".jpg", "");
    const filePath = path.join(IMAGES_DIR, file);

    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: "pollaworld/players",
        public_id: slug,
        width: 80,
        height: 80,
        crop: "thumb",
        gravity: "face",
        format: "jpg",
        quality: "auto:best",
      });

      uploaded.push({ slug, url: result.secure_url });
      console.log(`OK ${slug} -> ${result.secure_url}`);
    } catch (err) {
      console.error(`FAIL ${slug}: ${err instanceof Error ? err.message : "error"}`);
    }
  }

  console.log(`Subidos ${uploaded.length}/${files.length}`);

  let playersContent = fs.readFileSync(PLAYERS_TS_PATH, "utf8");
  let replaced = 0;

  for (const { slug, url } of uploaded) {
    const regex = new RegExp(`(id:\s*"${slug}"[^}]*image:\s*)"[^"]*"`, "g");
    const before = playersContent;
    playersContent = playersContent.replace(regex, `$1"${url}"`);
    if (playersContent !== before) replaced++;
  }

  fs.writeFileSync(PLAYERS_TS_PATH, playersContent);
  console.log(`Actualizadas ${replaced} URLs en players.ts`);
  console.log("Listo!");
}

main().catch(console.error);
