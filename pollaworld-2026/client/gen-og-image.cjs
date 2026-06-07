// Genera logo-og.png (1200x630), icon-192.png e icon-512.png desde logo.svg
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const publicDir = path.join(__dirname, "public");
const svgPath = path.join(publicDir, "logo.svg");

if (!fs.existsSync(svgPath)) {
  console.log("⚠  logo.svg not found, skipping image generation");
  process.exit(0);
}

const svgBuffer = fs.readFileSync(svgPath);

/** Generate a PNG from logo.svg at the given size */
async function generatePNG(size, filename) {
  const outPath = path.join(publicDir, filename);

  // For OG horizontal image, overlay the SVG centered on a dark background
  if (size === "1200x630") {
    const [w, h] = [1200, 630];
    // Render the SVG at a reasonable size, then composite it
    const logoPng = await sharp(svgBuffer)
      .resize(320, 320, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    await sharp({
      create: { width: w, height: h, channels: 3, background: { r: 13, g: 17, b: 23 } },
    })
      .composite([
        {
          input: logoPng,
          top: Math.round((h - 320) / 2 - 30),
          left: Math.round((w - 320) / 2),
        },
      ])
      .png()
      .toFile(outPath);
    console.log(`✅ ${filename} (${w}×${h}) generated`);
    return;
  }

  // For square icons (192/512), resize SVG directly
  const [w, h] = Array.isArray(size) ? size : [size, size];
  await sharp(svgBuffer)
    .resize(w, h, { fit: "contain", background: { r: 13, g: 17, b: 23, alpha: 1 } })
    .png()
    .toFile(outPath);
  console.log(`✅ ${filename} (${w}×${h}) generated`);
}

async function main() {
  await generatePNG("1200x630", "logo-og.png");
  await generatePNG(192, "icon-192.png");
  await generatePNG(512, "icon-512.png");
}

main().catch((err) => {
  console.error("❌ Image generation failed:", err.message);
  process.exit(0); // non-fatal
});
