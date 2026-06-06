// Genera logo-og.png a partir de logo.svg para Open Graph (WhatsApp, FB, Twitter)
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const svgPath = path.join(__dirname, "public", "logo.svg");
const pngPath = path.join(__dirname, "public", "logo-og.png");

if (!fs.existsSync(svgPath)) {
  console.log("⚠  logo.svg not found, skipping OG image generation");
  process.exit(0);
}

sharp(fs.readFileSync(svgPath))
  .resize(400, 400)
  .png()
  .toFile(pngPath)
  .then(() => console.log("✅ logo-og.png generated"))
  .catch((err) => {
    console.error("❌ OG image generation failed:", err.message);
    process.exit(0); // non-fatal
  });
